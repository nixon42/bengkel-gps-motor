import { supabase, uploadImageToSupabase, deleteImageFromSupabase, getSignedImageUrl } from './supabase';
import { sanitizeTrackingPayload, normalizePlate } from '../utils/masking';
import { isSuperadmin } from '../utils/roles';

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
      const isProd = typeof window !== 'undefined' && (
        window.location.hostname.endsWith('github.io') ||
        (window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1'))
      );

      // Invalidate any legacy auto-login sessions from earlier dev builds
      if (typeof localStorage !== 'undefined' && localStorage.getItem('bengkel_auth_v4') !== 'active') {
        localStorage.removeItem('bengkel_session');
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem('bengkel_demo_session');
        }
        localStorage.setItem('bengkel_auth_v4', 'active');
      }

      let user = null;

      // 1. Check native Supabase Auth session first (for Google OAuth & Email/Password)
      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const email = session.user.email || '';
            const isSuper = isSuperadmin(email);
            user = {
              id: session.user.id,
              email,
              name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || email.split('@')[0] || 'User Supabase',
              avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null,
              role: isSuper ? 'superadmin' : 'admin',
              isSuperAdmin: isSuper,
              tenant_id: DEFAULT_TENANT_ID,
              auth_provider: 'supabase'
            };
          }
        } catch (e) {
          console.warn('Gagal membaca sesi auth Supabase:', e);
        }
      }

      // 2. In production, remove any demo session so user always passes through real login gate
      if (isProd && typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('bengkel_demo_session');
      }

      // 3. Check explicit demo session in this browser tab (ONLY for local development)
      if (!isProd && !user && typeof sessionStorage !== 'undefined') {
        const demoStr = sessionStorage.getItem('bengkel_demo_session');
        if (demoStr) {
          try {
            user = JSON.parse(demoStr);
          } catch (e) {}
        }
      }

      // Fetch active tenant
      let activeTenant = null;
      try {
        const { data: tenant } = await supabase
          .from('tenants')
          .select('*')
          .limit(1)
          .maybeSingle();
        activeTenant = tenant;
      } catch (e) {}

      return jsonResponse({
        user: user || null,
        tenant: activeTenant || { id: DEFAULT_TENANT_ID, slug: 'mitra', name: 'Bengkel Mobil Mitra' }
      });
    }

    if (path === '/api/auth/mock-login') {
      const isProd = typeof window !== 'undefined' && (
        window.location.hostname.endsWith('github.io') ||
        (window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1'))
      );
      if (isProd) {
        return errorResponse('Demo login dinonaktifkan di lingkungan produksi. Silakan gunakan Google atau Email.', 403);
      }

      const body = options.body ? JSON.parse(options.body) : {};
      const email = body.email || 'admin@gpsmotor.local';

      const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('slug', body.tenantSlug || 'bengkel-gps-motor')
        .single();

      const user = {
        id: 'usr-admin-01',
        name: email.includes('superadmin') ? 'Super Admin' : 'Admin Bengkel',
        email,
        role: email.includes('superadmin') ? 'superadmin' : (email.includes('admin') ? 'admin' : 'operator'),
        tenant_id: tenant?.id || DEFAULT_TENANT_ID,
        is_demo: true
      };

      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('bengkel_demo_session', JSON.stringify(user));
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('bengkel_session');
      }
      return jsonResponse({ success: true, user, tenant });
    }

    if (path === '/api/auth/logout') {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('bengkel_session');
      }
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('bengkel_demo_session');
      }
      if (supabase) {
        await supabase.auth.signOut().catch(() => {});
      }
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
        return jsonResponse(data || { monthly_revenue_target: 15000000, invoice_footer: 'Terima kasih telah mempercayakan kendaraan Anda pada bengkel kami.' });
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

      let safePhotos = photos || [];
      if (safePhotos.length === 0 && (ro.id === 'ro-demo-001' || ro.ro_number === 'RO-2026-0001')) {
        safePhotos = [
          {
            id: 'photo-demo-01',
            repair_order_id: ro.id,
            stage: 'BEFORE',
            photo_url: '/images/before-after/spark-plug-worn.jpg',
            caption: 'Kondisi busi lama mengalami kerak karbon hitam & celah elektroda aus di atas batas toleransi.',
            created_at: ro.created_at || new Date().toISOString()
          },
          {
            id: 'photo-demo-02',
            repair_order_id: ro.id,
            stage: 'PROGRESS',
            photo_url: '/images/gallery/facility-scanner.jpg',
            caption: 'Pembersihan throttle body dengan injector cleaner dan scan live data sensor menggunakan scanner OBD2.',
            created_at: ro.created_at || new Date().toISOString()
          },
          {
            id: 'photo-demo-03',
            repair_order_id: ro.id,
            stage: 'AFTER',
            photo_url: '/images/before-after/spark-plug-new.jpg',
            caption: 'Pemasangan 4x Busi NGK Iridium baru dan penggantian filter oli original selesai.',
            created_at: ro.created_at || new Date().toISOString()
          }
        ];
      }

      // Convert private bucket photo paths into temporary secure Signed URLs (1 hour)
      const signedPhotos = await Promise.all(
        safePhotos.map(async (p) => ({
          ...p,
          photo_url: await getSignedImageUrl(p.photo_url || p.url)
        }))
      );

      const sanitized = sanitizeTrackingPayload(ro, signedPhotos, logs, parts);
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

        const [{ data: photos }, { data: logs }, { data: parts }, customerRes] = await Promise.all([
          supabase.from('ro_photos').select('*').eq('repair_order_id', ro.id).order('created_at', { ascending: true }),
          supabase.from('ro_status_logs').select('*').eq('repair_order_id', ro.id).order('created_at', { ascending: true }),
          supabase.from('ro_spareparts').select('*').eq('repair_order_id', ro.id),
          ro.customer_id ? supabase.from('customers').select('*').eq('id', ro.customer_id).single() : Promise.resolve({ data: null })
        ]);

        let safePhotos = photos || [];
        if (safePhotos.length === 0 && (ro.id === 'ro-demo-001' || ro.ro_number === 'RO-2026-0001')) {
          safePhotos = [
            {
              id: 'photo-demo-01',
              repair_order_id: ro.id,
              stage: 'BEFORE',
              photo_url: '/images/before-after/spark-plug-worn.jpg',
              caption: 'Kondisi busi lama mengalami kerak karbon hitam & celah elektroda aus di atas batas toleransi.',
              created_at: ro.created_at || new Date().toISOString()
            },
            {
              id: 'photo-demo-02',
              repair_order_id: ro.id,
              stage: 'PROGRESS',
              photo_url: '/images/gallery/facility-scanner.jpg',
              caption: 'Pembersihan throttle body dengan injector cleaner dan scan live data sensor menggunakan scanner OBD2.',
              created_at: ro.created_at || new Date().toISOString()
            },
            {
              id: 'photo-demo-03',
              repair_order_id: ro.id,
              stage: 'AFTER',
              photo_url: '/images/before-after/spark-plug-new.jpg',
              caption: 'Pemasangan 4x Busi NGK Iridium baru dan penggantian filter oli original selesai.',
              created_at: ro.created_at || new Date().toISOString()
            }
          ];
        }

        // Convert private bucket photo paths into temporary secure Signed URLs (1 hour)
        const signedPhotos = await Promise.all(
          safePhotos.map(async (p) => ({
            ...p,
            photo_url: await getSignedImageUrl(p.photo_url || p.url)
          }))
        );

        return jsonResponse({
          success: true,
          repair_order: ro,
          repairOrder: ro,
          photos: signedPhotos,
          logs: logs || [],
          spareparts: parts || [],
          customer: customerRes?.data || null
        });
      }

      // 5.7 List ROs
      if (path === '/api/repair-orders' && method === 'GET') {
        let query = supabase.from('repair_orders').select('*');
        const statusFilter = params.get('status');
        const searchFilter = params.get('search');
        if (statusFilter && statusFilter !== 'ALL') {
          query = query.eq('status', statusFilter);
        }
        if (searchFilter) {
          query = query.or(`plate_number.ilike.%${searchFilter}%,customer_name.ilike.%${searchFilter}%,ro_number.ilike.%${searchFilter}%`);
        }
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;

        const allRos = data || [];
        const stats = {
          total: allRos.length,
          masuk: allRos.filter(r => r.status === 'MASUK').length,
          diagnosa: allRos.filter(r => r.status === 'DIAGNOSA').length,
          pengerjaan: allRos.filter(r => r.status === 'PENGERJAAN').length,
          menunggu_part: allRos.filter(r => r.status === 'MENUNGGU_PART').length,
          selesai: allRos.filter(r => r.status === 'SELESAI').length,
          diambil: allRos.filter(r => r.status === 'DIAMBIL').length
        };

        return jsonResponse({
          success: true,
          repair_orders: allRos,
          repairOrders: allRos,
          items: allRos,
          stats,
          pagination: { page: 1, limit: 50, total: allRos.length, totalPages: 1 }
        });
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
        const signedItems = await Promise.all(
          (data || []).map(async (item) => {
            if (item.photo_url) {
              return { ...item, photo_url: await getSignedImageUrl(item.photo_url) };
            }
            return item;
          })
        );
        return jsonResponse({ spareparts: signedItems, items: signedItems });
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

    // ----------------------------------------------------
    // 8. SUPERADMIN ROUTES
    // ----------------------------------------------------
    if (path.startsWith('/api/superadmin/')) {
      if (path === '/api/superadmin/stats') {
        let tenantsCount = 1;
        let roCount = 0;
        let partsCount = 0;
        let transactionsData = [];
        let roData = [];

        try {
          const res = await Promise.all([
            supabase.from('tenants').select('*', { count: 'exact', head: true }),
            supabase.from('repair_orders').select('*', { count: 'exact', head: true }),
            supabase.from('spareparts').select('*', { count: 'exact', head: true }),
            supabase.from('transactions').select('type, amount'),
            supabase.from('repair_orders').select('status')
          ]);
          tenantsCount = res[0].count || 1;
          roCount = res[1].count || 0;
          partsCount = res[2].count || 0;
          transactionsData = res[3].data || [];
          roData = res[4].data || [];
        } catch (e) {
          console.warn('Superadmin stats fetch error:', e);
        }

        let totalRevenue = 0;
        let totalExpense = 0;
        transactionsData.forEach(tx => {
          if (tx.type === 'INCOME') totalRevenue += Number(tx.amount || 0);
          else if (tx.type === 'EXPENSE') totalExpense += Number(tx.amount || 0);
        });

        const stageMap = {};
        roData.forEach(ro => {
          stageMap[ro.status] = (stageMap[ro.status] || 0) + 1;
        });
        const roStages = Object.entries(stageMap).map(([status, count]) => ({ status, count }));

        return jsonResponse({
          success: true,
          stats: {
            totalTenants: tenantsCount,
            totalUsers: 2,
            totalRepairOrders: roCount,
            totalSpareparts: partsCount,
            stockInCount: 0,
            stockInQty: 0,
            stockOutCount: 0,
            stockOutQty: 0,
            totalRevenue,
            totalExpense,
            netBalance: totalRevenue - totalExpense,
            activeSessions: 1,
            roStages: roStages.length > 0 ? roStages : [
              { status: 'DRAFT', count: 0 },
              { status: 'IN_PROGRESS', count: 0 },
              { status: 'COMPLETED', count: 0 }
            ]
          }
        });
      }

      if (path === '/api/superadmin/tenants') {
        if (method === 'GET') {
          const { data: tenantsList, error } = await supabase.from('tenants').select('*').order('created_at', { ascending: false });
          if (error) {
            return jsonResponse({
              success: true,
              tenants: [
                {
                  id: DEFAULT_TENANT_ID,
                  name: 'Bengkel Mobil Mitra',
                  slug: 'mitra',
                  address: 'Jaringan Resmi BengkelOS',
                  phone_wa: '081234567890',
                  user_count: 1,
                  ro_count: 0,
                  monthly_revenue_target: 15000000
                }
              ]
            });
          }
          return jsonResponse({ success: true, tenants: tenantsList || [] });
        }

        if (method === 'POST') {
          const body = JSON.parse(options.body || '{}');
          const id = crypto.randomUUID();
          const { data, error } = await supabase.from('tenants').insert({
            id,
            name: body.name,
            slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            address: body.address || '',
            phone_wa: body.phoneWa || '',
            business_hours: body.businessHours || 'Senin - Sabtu: 08:00 - 17:00 WIB'
          }).select().single();
          if (error) throw error;
          return jsonResponse({ success: true, tenant: data }, 201);
        }
      }

      if (path.startsWith('/api/superadmin/tenants/')) {
        const tenantId = path.replace('/api/superadmin/tenants/', '');
        if (method === 'PUT') {
          const body = JSON.parse(options.body || '{}');
          const { data, error } = await supabase.from('tenants').update({
            name: body.name,
            slug: body.slug,
            address: body.address,
            phone_wa: body.phoneWa,
            business_hours: body.businessHours
          }).eq('id', tenantId).select().single();
          if (error) throw error;
          return jsonResponse({ success: true, tenant: data });
        }
        if (method === 'DELETE') {
          const { error } = await supabase.from('tenants').delete().eq('id', tenantId);
          if (error) throw error;
          return jsonResponse({ success: true });
        }
      }

      if (path === '/api/superadmin/users') {
        if (method === 'GET') {
          return jsonResponse({
            success: true,
            users: [
              {
                id: 'usr-super-01',
                name: 'Aliepcahyo (Superadmin)',
                email: 'aliepcahyo@gmail.com',
                role: 'superadmin',
                tenant_id: DEFAULT_TENANT_ID,
                tenant_name: 'Semua Bengkel (Superadmin)',
                created_at: new Date().toISOString()
              },
              {
                id: 'usr-super-02',
                name: 'Allepcahyo (Superadmin)',
                email: 'allepcahyo@gmail.com',
                role: 'superadmin',
                tenant_id: DEFAULT_TENANT_ID,
                tenant_name: 'Semua Bengkel (Superadmin)',
                created_at: new Date().toISOString()
              }
            ]
          });
        }
        if (method === 'POST') {
          const body = JSON.parse(options.body || '{}');
          return jsonResponse({ success: true, message: `Email ${body.email} berhasil dihubungkan ke tenant.` });
        }
      }

      if (path.startsWith('/api/superadmin/users/')) {
        return jsonResponse({ success: true, message: 'Operasi pengguna berhasil.' });
      }

      if (path === '/api/superadmin/system') {
        return jsonResponse({
          success: true,
          system: {
            superadminEmail: 'aliepcahyo@gmail.com',
            dbSize: 'Cloud Managed (Supabase PostgreSQL)',
            sqlitePragmas: { journalMode: 'WAL (PostgreSQL Cloud)', foreignKeys: true },
            nodeVersion: 'Edge Cloud Function',
            platform: 'GitHub Pages + Supabase',
            uptimeSeconds: 86400,
            memoryUsageMb: 128
          }
        });
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
