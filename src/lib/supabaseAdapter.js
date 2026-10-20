import { supabase, uploadImageToSupabase, deleteImageFromSupabase } from './supabase';
import { sanitizeTrackingPayload, normalizePlate } from '../utils/masking';

const DEFAULT_TENANT_ID = 'tenant-gps-motor-kediri-01';

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function errorResponse(message, status = 400) {
  return new Response(JSON.stringify({ error: message, message }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Handle API requests by routing them directly to Supabase
 */
export async function handleSupabaseApi(urlStr, options = {}) {
  if (!supabase) {
    return errorResponse('Supabase belum dikonfigurasi.', 500);
  }

  const url = new URL(urlStr, window.location.origin);
  const path = url.pathname;
  const method = (options.method || 'GET').toUpperCase();
  const params = url.searchParams;

  try {
    // ----------------------------------------------------
    // 1. AUTH ROUTES
    // ----------------------------------------------------
    if (path === '/api/auth/me') {
      const stored = localStorage.getItem('bengkel_session');
      let user = stored ? JSON.parse(stored) : null;

      // Fetch active tenant
      const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('slug', 'bengkel-gps-motor')
        .single();

      if (!user) {
        // Fallback demo user
        user = {
          id: 'usr-operator-01',
          name: 'Bambang GPS Motor',
          email: 'admin@gpsmotor.local',
          role: 'admin',
          tenant_id: tenant?.id || DEFAULT_TENANT_ID
        };
      }

      return jsonResponse({ user, tenant: tenant || { id: DEFAULT_TENANT_ID, slug: 'bengkel-gps-motor', name: 'Bengkel Mobil GPS Motor Kediri' } });
    }

    if (path === '/api/auth/mock-login') {
      const body = options.body ? JSON.parse(options.body) : {};
      const email = body.email || 'admin@gpsmotor.local';

      const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('slug', body.tenantSlug || 'bengkel-gps-motor')
        .single();

      const user = {
        id: 'usr-admin-01',
        name: email.includes('superadmin') ? 'Super Admin' : 'Bambang GPS Motor',
        email,
        role: email.includes('superadmin') ? 'superadmin' : (email.includes('admin') ? 'admin' : 'operator'),
        tenant_id: tenant?.id || DEFAULT_TENANT_ID
      };

      localStorage.setItem('bengkel_session', JSON.stringify(user));
      return jsonResponse({ success: true, user, tenant });
    }

    if (path === '/api/auth/logout') {
      localStorage.removeItem('bengkel_session');
      return jsonResponse({ success: true });
    }

    // ----------------------------------------------------
    // 2. TENANT SETTINGS & LOGO
    // ----------------------------------------------------
    if (path === '/api/tenant/settings') {
      if (method === 'GET') {
        const { data, error } = await supabase
          .from('tenant_settings')
          .select('*')
          .eq('tenant_id', DEFAULT_TENANT_ID)
          .single();
        return jsonResponse(data || { monthly_revenue_target: 15000000, invoice_footer: 'Terima kasih telah mempercayakan kendaraan Anda pada Bengkel GPS Motor Kediri.' });
      }

      if (method === 'PUT') {
        const body = JSON.parse(options.body || '{}');
        const { data, error } = await supabase
          .from('tenant_settings')
          .upsert({ tenant_id: DEFAULT_TENANT_ID, ...body, updated_at: new Date().toISOString() })
          .select()
          .single();
        if (error) throw error;
        return jsonResponse({ success: true, settings: data });
      }
    }

    if (path === '/api/tenant/photo' && method === 'POST') {
      const formData = options.body;
      const file = formData.get('photo') || formData.get('image');
      const target = formData.get('target') || 'logo';

      if (!file) return errorResponse('File gambar wajib diunggah.');
      const { url } = await uploadImageToSupabase(file, 'tenants');

      const updateData = {};
      if (target === 'logo') updateData.logo_url = url;
      else if (target === 'hero') updateData.hero_image_url = url;

      await supabase.from('tenants').update(updateData).eq('id', DEFAULT_TENANT_ID);
      return jsonResponse({ success: true, url });
    }

    // ----------------------------------------------------
    // 3. PUBLIC TRACKING ROUTE
    // ----------------------------------------------------
    if (path.startsWith('/api/public/track') || path.startsWith('/api/public/tracking/')) {
      const token = path.startsWith('/api/public/tracking/') 
        ? path.replace('/api/public/tracking/', '') 
        : params.get('token');
      const plate = params.get('plate');

      let query = supabase.from('repair_orders').select('*');
      if (token) {
        query = query.eq('tracking_token', token);
      } else if (plate) {
        const norm = normalizePlate(plate);
        // Supabase ILIKE search
        query = query.or(`plate_number.ilike.%${norm}%,plate_number.ilike.%${plate}%`);
      } else {
        return errorResponse('Parameter nomor plat atau token pelacakan wajib diisi.');
      }

      const { data: roList, error } = await query.order('created_at', { ascending: false }).limit(1);
      if (error || !roList || roList.length === 0) {
        return errorResponse('Data servis kendaraan tidak ditemukan.', 404);
      }

      const ro = roList[0];

      // Fetch related photos, status logs, and parts
      const [{ data: photos }, { data: logs }, { data: parts }] = await Promise.all([
        supabase.from('ro_photos').select('*').eq('repair_order_id', ro.id).order('created_at', { ascending: true }),
        supabase.from('ro_status_logs').select('*').eq('repair_order_id', ro.id).order('created_at', { ascending: true }),
        supabase.from('ro_spareparts').select('*').eq('repair_order_id', ro.id)
      ]);

      const sanitized = sanitizeTrackingPayload(ro, photos, logs, parts);
      return jsonResponse({
        success: true,
        order: sanitized,
        repairOrder: sanitized,
        tracking: sanitized
      });
    }

    // ----------------------------------------------------
    // 4. DASHBOARD SUMMARY
    // ----------------------------------------------------
    if (path === '/api/dashboard/summary') {
      const [roRes, partsRes, transRes] = await Promise.all([
        supabase.from('repair_orders').select('id, status, total_cost, created_at'),
        supabase.from('spareparts').select('id, stock, min_stock'),
        supabase.from('transactions').select('amount, type, date')
      ]);

      const ros = roRes.data || [];
      const activeRos = ros.filter(r => ['MASUK', 'DIAGNOSA', 'PENGERJAAN', 'MENUNGGU_PART'].includes(r.status)).length;
      const completedRos = ros.filter(r => ['SELESAI', 'DIAMBIL'].includes(r.status)).length;

      const lowStockCount = (partsRes.data || []).filter(p => p.stock <= p.min_stock).length;

      const transactions = transRes.data || [];
      const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + Number(t.amount || 0), 0);
      const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + Number(t.amount || 0), 0);

      return jsonResponse({
        success: true,
        summary: {
          active_ros: activeRos,
          completed_ros: completedRos,
          total_revenue: totalIncome - totalExpense,
          low_stock_count: lowStockCount,
          monthly_income: totalIncome,
          monthly_expense: totalExpense
        }
      });
    }

    // ----------------------------------------------------
    // 5. REPAIR ORDERS
    // ----------------------------------------------------
    if (path === '/api/repair-orders' || path.startsWith('/api/repair-orders/')) {
      // 5.1 Options for form
      if (path === '/api/repair-orders/form-options') {
        const [{ data: parts }, { data: customers }, { data: vehicles }] = await Promise.all([
          supabase.from('spareparts').select('*').eq('is_active', 1).gt('stock', 0),
          supabase.from('customers').select('*').limit(200),
          supabase.from('vehicles').select('*').limit(200)
        ]);
        return jsonResponse({ spareparts: parts || [], customers: customers || [], vehicles: vehicles || [] });
      }

      // 5.2 Upload Photo to RO
      if (path.match(/^\/api\/repair-orders\/[^/]+\/photos$/) && method === 'POST') {
        const roId = path.split('/')[3];
        const formData = options.body;
        const file = formData.get('photo');
        const stage = formData.get('stage') || 'PROGRESS';
        const caption = formData.get('caption') || '';

        if (!file) return errorResponse('File foto wajib diunggah.');

        // Direct upload to Supabase Storage Bucket 'bengkel-photos'
        const { url: photoUrl } = await uploadImageToSupabase(file, 'ro');

        const photoId = crypto.randomUUID();
        const { data: inserted, error: insertError } = await supabase
          .from('ro_photos')
          .insert({
            id: photoId,
            tenant_id: DEFAULT_TENANT_ID,
            repair_order_id: roId,
            photo_url: photoUrl,
            stage,
            caption
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return jsonResponse({ success: true, photo: inserted }, 201);
      }

      // 5.3 Delete Photo from RO
      if (path.match(/^\/api\/repair-orders\/[^/]+\/photos\/[^/]+$/) && method === 'DELETE') {
        const photoId = path.split('/')[5];
        const { data: photo } = await supabase.from('ro_photos').select('*').eq('id', photoId).single();
        if (photo) {
          await deleteImageFromSupabase(photo.photo_url);
          await supabase.from('ro_photos').delete().eq('id', photoId);
        }
        return jsonResponse({ success: true });
      }

      // 5.4 Update Status of RO
      if (path.match(/^\/api\/repair-orders\/[^/]+\/status$/) && method === 'PUT') {
        const roId = path.split('/')[3];
        const body = JSON.parse(options.body || '{}');
        const { status, notes, actor_name } = body;

        const { data: oldRo } = await supabase.from('repair_orders').select('*').eq('id', roId).single();
        if (!oldRo) return errorResponse('Repair Order tidak ditemukan.', 404);

        await Promise.all([
          supabase.from('repair_orders').update({ status, updated_at: new Date().toISOString() }).eq('id', roId),
          supabase.from('ro_status_logs').insert({
            id: crypto.randomUUID(),
            tenant_id: DEFAULT_TENANT_ID,
            repair_order_id: roId,
            previous_status: oldRo.status,
            new_status: status,
            notes: notes || '',
            actor_name: actor_name || 'Operator'
          })
        ]);

        return jsonResponse({ success: true, status });
      }

      // 5.5 Add Sparepart to RO
      if (path.match(/^\/api\/repair-orders\/[^/]+\/parts$/) && method === 'POST') {
        const roId = path.split('/')[3];
        const body = JSON.parse(options.body || '{}');
        const { sparepart_id, quantity, unit_price } = body;

        const { data: part } = await supabase.from('spareparts').select('*').eq('id', sparepart_id).single();
        const itemName = part ? part.name : 'Sparepart';
        const price = Number(unit_price || (part ? part.sell_price : 0));
        const subtotal = price * Number(quantity || 1);

        const { data: inserted, error: partErr } = await supabase
          .from('ro_spareparts')
          .insert({
            id: crypto.randomUUID(),
            tenant_id: DEFAULT_TENANT_ID,
            repair_order_id: roId,
            sparepart_id,
            item_name: itemName,
            quantity: Number(quantity || 1),
            unit_price: price,
            subtotal
          })
          .select()
          .single();

        if (partErr) throw partErr;

        // Decrement stock in spareparts
        if (part) {
          await supabase.from('spareparts').update({ stock: Math.max(0, part.stock - Number(quantity || 1)) }).eq('id', sparepart_id);
        }

        return jsonResponse({ success: true, sparepart: inserted }, 201);
      }

      // 5.6 Detail of RO
      if (path.match(/^\/api\/repair-orders\/[^/]+$/) && method === 'GET') {
        const roId = path.split('/')[3];
        const { data: ro, error } = await supabase.from('repair_orders').select('*').eq('id', roId).single();
        if (error || !ro) return errorResponse('Repair Order tidak ditemukan.', 404);

        const [{ data: photos }, { data: logs }, { data: parts }] = await Promise.all([
          supabase.from('ro_photos').select('*').eq('repair_order_id', ro.id).order('created_at', { ascending: true }),
          supabase.from('ro_status_logs').select('*').eq('repair_order_id', ro.id).order('created_at', { ascending: true }),
          supabase.from('ro_spareparts').select('*').eq('repair_order_id', ro.id)
        ]);

        return jsonResponse({
          success: true,
          repairOrder: { ...ro, photos: photos || [], logs: logs || [], spareparts: parts || [] }
        });
      }

      // 5.7 List ROs
      if (path === '/api/repair-orders' && method === 'GET') {
        const { data, error } = await supabase
          .from('repair_orders')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return jsonResponse({ success: true, repair_orders: data || [], repairOrders: data || [] });
      }

      // 5.8 Create RO
      if (path === '/api/repair-orders' && method === 'POST') {
        const body = JSON.parse(options.body || '{}');
        const id = crypto.randomUUID();
        const roNumber = `RO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
        const trackingToken = crypto.randomUUID().replace(/-/g, '').slice(0, 16);

        const newRo = {
          id,
          tenant_id: DEFAULT_TENANT_ID,
          ro_number: roNumber,
          tracking_token: trackingToken,
          plate_number: body.plate_number || '',
          customer_name: body.customer_name || '',
          customer_phone: body.customer_phone || '',
          car_brand: body.car_brand || '',
          car_model: body.car_model || '',
          car_year: body.car_year ? Number(body.car_year) : null,
          car_color: body.car_color || '',
          odometer_in: body.odometer_in ? Number(body.odometer_in) : 0,
          entry_date: body.entry_date || new Date().toISOString().split('T')[0],
          complaint: body.complaint || '',
          mechanic_name: body.mechanic_name || 'Mekanik GPS',
          status: 'MASUK',
          service_fee: Number(body.service_fee || 0),
          sparepart_fee: 0,
          discount: Number(body.discount || 0),
          total_cost: Number(body.service_fee || 0),
          notes: body.notes || ''
        };

        const { data: inserted, error } = await supabase.from('repair_orders').insert(newRo).select().single();
        if (error) throw error;

        // Add initial status log
        await supabase.from('ro_status_logs').insert({
          id: crypto.randomUUID(),
          tenant_id: DEFAULT_TENANT_ID,
          repair_order_id: id,
          previous_status: null,
          new_status: 'MASUK',
          notes: 'Unit kendaraan diterima',
          actor_name: body.mechanic_name || 'Kasir'
        });

        return jsonResponse({ success: true, repairOrder: inserted }, 201);
      }
    }

    // ----------------------------------------------------
    // 6. INVENTORY / SPAREPARTS
    // ----------------------------------------------------
    if (path === '/api/inventory' || path.startsWith('/api/inventory/')) {
      if (path === '/api/inventory/upload' && method === 'POST') {
        const formData = options.body;
        const file = formData.get('photo');
        if (!file) return errorResponse('File foto wajib diunggah.');
        const { url } = await uploadImageToSupabase(file, 'spareparts');
        return jsonResponse({ success: true, url, photo_url: url });
      }

      if (path === '/api/inventory/reports/valuation') {
        const { data: parts } = await supabase.from('spareparts').select('*');
        const items = parts || [];
        const totalItems = items.reduce((acc, p) => acc + (p.stock || 0), 0);
        const totalValuation = items.reduce((acc, p) => acc + ((p.stock || 0) * (p.buy_price || 0)), 0);
        const totalPotentialRevenue = items.reduce((acc, p) => acc + ((p.stock || 0) * (p.sell_price || 0)), 0);

        return jsonResponse({
          total_items: totalItems,
          total_valuation: totalValuation,
          potential_revenue: totalPotentialRevenue,
          potential_profit: totalPotentialRevenue - totalValuation,
          categories_summary: []
        });
      }

      if (path === '/api/inventory' && method === 'GET') {
        const { data, error } = await supabase.from('spareparts').select('*').order('name');
        if (error) throw error;
        return jsonResponse({ spareparts: data || [], items: data || [] });
      }

      if (path === '/api/inventory' && method === 'POST') {
        const body = JSON.parse(options.body || '{}');
        const id = crypto.randomUUID();
        const { data, error } = await supabase.from('spareparts').insert({
          id,
          tenant_id: DEFAULT_TENANT_ID,
          sku: body.sku || `SKU-${Date.now().toString().slice(-6)}`,
          name: body.name,
          category: body.category || 'Umum',
          unit: body.unit || 'pcs',
          min_stock: Number(body.min_stock || 5),
          stock: Number(body.stock || 0),
          buy_price: Number(body.buy_price || 0),
          sell_price: Number(body.sell_price || 0),
          supplier: body.supplier || '',
          photo_url: body.photo_url || null
        }).select().single();
        if (error) throw error;
        return jsonResponse({ success: true, sparepart: data }, 201);
      }

      if (path.match(/^\/api\/inventory\/[^/]+$/) && method === 'PUT') {
        const id = path.split('/')[3];
        const body = JSON.parse(options.body || '{}');
        const { data, error } = await supabase.from('spareparts').update({
          ...body,
          updated_at: new Date().toISOString()
        }).eq('id', id).select().single();
        if (error) throw error;
        return jsonResponse({ success: true, sparepart: data });
      }
    }

    // ----------------------------------------------------
    // 7. STOCK MOVEMENTS & OPNAME
    // ----------------------------------------------------
    if (path === '/api/stock-movements' || path.startsWith('/api/stock-movements/')) {
      if (path === '/api/stock-movements' && method === 'GET') {
        const { data, error } = await supabase.from('stock_movements').select('*, spareparts(name, sku)').order('created_at', { ascending: false });
        if (error) throw error;
        return jsonResponse({ movements: data || [] });
      }

      if (path === '/api/stock-movements/in' && method === 'POST') {
        const body = JSON.parse(options.body || '{}');
        const id = crypto.randomUUID();
        const { sparepart_id, quantity, unit_price } = body;

        const { data: movement, error } = await supabase.from('stock_movements').insert({
          id,
          tenant_id: DEFAULT_TENANT_ID,
          sparepart_id,
          type: 'IN',
          quantity: Number(quantity),
          unit_price: Number(unit_price || 0),
          total_price: Number(unit_price || 0) * Number(quantity),
          date: body.date || new Date().toISOString().split('T')[0],
          supplier: body.supplier || '',
          invoice_number: body.invoice_number || '',
          notes: body.notes || ''
        }).select().single();
        if (error) throw error;

        // Increase stock
        const { data: part } = await supabase.from('spareparts').select('stock').eq('id', sparepart_id).single();
        if (part) {
          await supabase.from('spareparts').update({ stock: (part.stock || 0) + Number(quantity) }).eq('id', sparepart_id);
        }

        return jsonResponse({ success: true, movement }, 201);
      }

      if (path === '/api/stock-movements/out' && method === 'POST') {
        const body = JSON.parse(options.body || '{}');
        const id = crypto.randomUUID();
        const { sparepart_id, quantity } = body;

        const { data: movement, error } = await supabase.from('stock_movements').insert({
          id,
          tenant_id: DEFAULT_TENANT_ID,
          sparepart_id,
          type: 'OUT',
          quantity: Number(quantity),
          date: body.date || new Date().toISOString().split('T')[0],
          notes: body.notes || ''
        }).select().single();
        if (error) throw error;

        // Decrease stock
        const { data: part } = await supabase.from('spareparts').select('stock').eq('id', sparepart_id).single();
        if (part) {
          await supabase.from('spareparts').update({ stock: Math.max(0, (part.stock || 0) - Number(quantity)) }).eq('id', sparepart_id);
        }

        return jsonResponse({ success: true, movement }, 201);
      }
    }

    if (path === '/api/stock-opname') {
      if (method === 'GET') {
        const { data } = await supabase.from('stock_opnames').select('*, spareparts(name, sku)').order('created_at', { ascending: false });
        return jsonResponse({ opnames: data || [] });
      }

      if (method === 'POST') {
        const body = JSON.parse(options.body || '{}');
        const id = crypto.randomUUID();
        const { sparepart_id, system_stock, physical_stock, difference, reason } = body;

        const { data: opname, error } = await supabase.from('stock_opnames').insert({
          id,
          tenant_id: DEFAULT_TENANT_ID,
          sparepart_id,
          system_stock: Number(system_stock),
          physical_stock: Number(physical_stock),
          difference: Number(difference),
          reason: reason || '',
          date: new Date().toISOString().split('T')[0]
        }).select().single();
        if (error) throw error;

        // Adjust stock in spareparts table
        await supabase.from('spareparts').update({ stock: Number(physical_stock) }).eq('id', sparepart_id);

        return jsonResponse({ success: true, opname }, 201);
      }
    }

    // ----------------------------------------------------
    // 8. FINANCE / CASHBOOK
    // ----------------------------------------------------
    if (path === '/api/finance' || path.startsWith('/api/finance/')) {
      if (path === '/api/finance/upload' && method === 'POST') {
        const formData = options.body;
        const file = formData.get('receipt') || formData.get('photo');
        if (!file) return errorResponse('File bukti nota wajib diunggah.');
        const { url } = await uploadImageToSupabase(file, 'receipts');
        return jsonResponse({ success: true, url, receipt_url: url });
      }

      if (path === '/api/finance/categories') {
        if (method === 'GET') {
          const { data } = await supabase.from('transaction_categories').select('*').order('name');
          return jsonResponse({ categories: data || [] });
        }
        if (method === 'POST') {
          const body = JSON.parse(options.body || '{}');
          const id = crypto.randomUUID();
          const { data, error } = await supabase.from('transaction_categories').insert({
            id,
            tenant_id: DEFAULT_TENANT_ID,
            name: body.name,
            type: body.type || 'EXPENSE'
          }).select().single();
          if (error) throw error;
          return jsonResponse({ success: true, category: data }, 201);
        }
      }

      if (path === '/api/finance/transactions') {
        if (method === 'GET') {
          const { data } = await supabase.from('transactions').select('*, transaction_categories(name)').order('date', { ascending: false });
          return jsonResponse({ transactions: data || [] });
        }
        if (method === 'POST') {
          const body = JSON.parse(options.body || '{}');
          const id = crypto.randomUUID();
          const { data, error } = await supabase.from('transactions').insert({
            id,
            tenant_id: DEFAULT_TENANT_ID,
            category_id: body.category_id,
            type: body.type || 'INCOME',
            amount: Number(body.amount),
            date: body.date || new Date().toISOString().split('T')[0],
            description: body.description || '',
            payment_method: body.payment_method || 'CASH',
            receipt_url: body.receipt_url || null
          }).select().single();
          if (error) throw error;
          return jsonResponse({ success: true, transaction: data }, 201);
        }
      }
    }

    // ----------------------------------------------------
    // 9. CUSTOMERS
    // ----------------------------------------------------
    if (path === '/api/customers' || path.startsWith('/api/customers/')) {
      if (path === '/api/customers' && method === 'GET') {
        const { data, error } = await supabase.from('customers').select('*').order('name');
        if (error) throw error;
        return jsonResponse({ customers: data || [] });
      }
      if (path === '/api/customers' && method === 'POST') {
        const body = JSON.parse(options.body || '{}');
        const id = crypto.randomUUID();
        const { data, error } = await supabase.from('customers').insert({
          id,
          tenant_id: DEFAULT_TENANT_ID,
          name: body.name,
          phone: body.phone,
          email: body.email || '',
          address: body.address || '',
          notes: body.notes || ''
        }).select().single();
        if (error) throw error;
        return jsonResponse({ success: true, customer: data }, 201);
      }
    }

    // Fallback for unhandled API endpoints
    return errorResponse(`Endpoint ${path} belum diimplementasikan di Supabase adapter.`, 404);
  } catch (err) {
    console.error(`[SupabaseAdapter] Error handling ${method} ${path}:`, err);
    return errorResponse(err.message || 'Internal Server Error', 500);
  }
}

/**
 * Initialize Supabase fetch interceptor in browser
 */
export function initSupabaseAdapter() {
  if (typeof window === 'undefined') return;

  const originalFetch = window.fetch;

  window.fetch = async function(resource, init) {
    const url = typeof resource === 'string' ? resource : resource?.url;

    // Intercept only internal /api/ requests
    if (url && (url.startsWith('/api/') || url.includes('/api/'))) {
      // If running on static hosting (GitHub Pages) or when no local backend is present
      const isStaticHosting = window.location.hostname.includes('github.io') || 
                              window.location.hostname !== 'localhost' ||
                              import.meta.env.VITE_USE_SUPABASE === 'true' ||
                              Boolean(import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL);

      if (isStaticHosting) {
        return handleSupabaseApi(url, init);
      }
    }

    // Pass through to original fetch for other requests (external CDNs, etc.)
    return originalFetch.apply(this, arguments);
  };

  console.log('⚡ Supabase Client Adapter aktif (Direct Database & Storage ke Supabase)');
}
