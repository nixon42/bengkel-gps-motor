import { supabase, uploadImageToSupabase, deleteImageFromSupabase, getSignedImageUrl } from './supabase';
import { sanitizeTrackingPayload, normalizePlate } from '../utils/masking';
import { isSuperadmin, parseConfiguredSuperadmins } from '../utils/roles';

import { DEFAULT_TENANT_ID } from '../utils/config';

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
 * Helper to get active tenant ID for current request
 */
export async function getSessionTenantId() {
  if (supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const cleanEmail = (session.user.email || '').toLowerCase().trim();
        const { data: dbUser } = await supabase
          .from('users')
          .select('tenant_id')
          .or(`id.eq.${session.user.id},email.eq.${cleanEmail}`)
          .maybeSingle();
        if (dbUser?.tenant_id) {
          return dbUser.tenant_id;
        }
      }
    } catch (e) {}
  }
  if (typeof sessionStorage !== 'undefined') {
    const demoStr = sessionStorage.getItem('bengkel_demo_session');
    if (demoStr) {
      try {
        const parsed = JSON.parse(demoStr);
        if (parsed?.tenant_id) return parsed.tenant_id;
      } catch (e) {}
    }
  }
  if (typeof localStorage !== 'undefined') {
    const sessStr = localStorage.getItem('bengkel_session');
    if (sessStr) {
      try {
        const parsed = JSON.parse(sessStr);
        if (parsed?.tenant_id) return parsed.tenant_id;
      } catch (e) {}
    }
  }
  return DEFAULT_TENANT_ID;
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
      let activeTenant = null;

      // 1. Check native Supabase Auth session first (for Google OAuth & Email/Password)
      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const email = (session.user.email || '').toLowerCase().trim();
            const isSuper = isSuperadmin(email, session.user);

            // Look up existing user in public.users table
            let { data: dbUser } = await supabase
              .from('users')
              .select('*')
              .or(`id.eq.${session.user.id},email.eq.${email}`)
              .maybeSingle();

            if (dbUser) {
              // Existing user: load their assigned tenant
              let { data: tData } = await supabase
                .from('tenants')
                .select('*')
                .eq('id', dbUser.tenant_id)
                .maybeSingle();
              activeTenant = tData;

              const effectiveRole = isSuper ? 'superadmin' : (dbUser.role || 'admin');
              user = {
                id: session.user.id,
                email,
                name: dbUser.name || session.user.user_metadata?.full_name || email.split('@')[0],
                avatar_url: dbUser.avatar_url || session.user.user_metadata?.avatar_url || null,
                role: effectiveRole,
                isSuperAdmin: isSuper,
                tenant_id: dbUser.tenant_id,
                auth_provider: 'supabase'
              };
            } else {
              // Brand new user signing in for the first time!
              const rawName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email.split('@')[0] || 'Pemilik Bengkel';
              const avatar = session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null;

              if (isSuper) {
                // Superadmin without user record: link to master tenant
                const { data: defaultTenant } = await supabase
                  .from('tenants')
                  .select('*')
                  .eq('id', DEFAULT_TENANT_ID)
                  .maybeSingle();
                activeTenant = defaultTenant;

                const newSuperUser = {
                  id: session.user.id,
                  tenant_id: DEFAULT_TENANT_ID,
                  email,
                  name: rawName,
                  avatar_url: avatar,
                  role: 'superadmin',
                  auth_provider: 'supabase'
                };
                await supabase.from('users').insert([newSuperUser]);
                user = { ...newSuperUser, isSuperAdmin: true };
              } else {
                // New regular user / workshop owner: PROVISION NEW ISOLATED TENANT!
                const baseSlug = (email.split('@')[0]).toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'mitra';
                const randomHex = Math.random().toString(36).substring(2, 6);
                const newTenantId = `tenant-${baseSlug}-${randomHex}`;
                const newSlug = `bengkel-${baseSlug}-${randomHex}`;
                const workshopName = `Bengkel ${rawName}`;

                const newTenantObj = {
                  id: newTenantId,
                  slug: newSlug,
                  name: workshopName,
                  address: '',
                  phone_wa: '',
                  business_hours: 'Senin - Sabtu: 08:00 - 17:00 WIB',
                  tagline: 'Layanan Servis Mobil Terpercaya & Bergaransi',
                  profile_completed: 0 // Prompts OnboardingModal!
                };

                const { data: createdTenant } = await supabase
                  .from('tenants')
                  .insert([newTenantObj])
                  .select()
                  .single();
                activeTenant = createdTenant || newTenantObj;

                // Settings
                await supabase.from('tenant_settings').insert([{
                  tenant_id: newTenantId,
                  monthly_revenue_target: 15000000,
                  invoice_footer: `Terima kasih atas kepercayaan Anda pada ${workshopName}.`,
                  auto_print_invoice: 0,
                  notify_wa: 1
                }]);

                // Default Categories
                const cats = [
                  { id: `cat-inc-servis-${randomHex}`, tenant_id: newTenantId, name: 'Jasa Servis', type: 'INCOME', is_default: 1 },
                  { id: `cat-inc-parts-${randomHex}`, tenant_id: newTenantId, name: 'Penjualan Sparepart', type: 'INCOME', is_default: 1 },
                  { id: `cat-inc-other-${randomHex}`, tenant_id: newTenantId, name: 'Pendapatan Lain-lain', type: 'INCOME', is_default: 1 },
                  { id: `cat-exp-parts-${randomHex}`, tenant_id: newTenantId, name: 'Beli Sparepart / Stok', type: 'EXPENSE', is_default: 1 },
                  { id: `cat-exp-util-${randomHex}`, tenant_id: newTenantId, name: 'Listrik, Air & Internet', type: 'EXPENSE', is_default: 1 },
                  { id: `cat-exp-wages-${randomHex}`, tenant_id: newTenantId, name: 'Gaji Karyawan', type: 'EXPENSE', is_default: 1 },
                  { id: `cat-exp-ops-${randomHex}`, tenant_id: newTenantId, name: 'Operasional Bengkel', type: 'EXPENSE', is_default: 1 }
                ];
                await supabase.from('transaction_categories').insert(cats);

                // Insert User
                const newUserObj = {
                  id: session.user.id,
                  tenant_id: newTenantId,
                  email,
                  name: rawName,
                  avatar_url: avatar,
                  role: 'admin',
                  auth_provider: 'supabase'
                };
                await supabase.from('users').insert([newUserObj]);
                user = { ...newUserObj, isSuperAdmin: false };
              }
            }

            if (user && typeof localStorage !== 'undefined') {
              localStorage.setItem('bengkel_session', JSON.stringify(user));
            }
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
            if (user?.tenant_id) {
              const { data: t } = await supabase.from('tenants').select('*').eq('id', user.tenant_id).maybeSingle();
              activeTenant = t;
            }
          } catch (e) {}
        }
      }

      if (!activeTenant && user?.tenant_id) {
        try {
          const { data: t } = await supabase.from('tenants').select('*').eq('id', user.tenant_id).maybeSingle();
          activeTenant = t;
        } catch (e) {}
      }

      if (!activeTenant) {
        try {
          const { data: defaultT } = await supabase.from('tenants').select('*').eq('id', DEFAULT_TENANT_ID).maybeSingle();
          activeTenant = defaultT;
        } catch (e) {}
      }

      return jsonResponse({
        user: user || null,
        tenant: activeTenant || { id: DEFAULT_TENANT_ID, slug: 'bengkel-gps-motor', name: 'Bengkel Mobil GPS Motor Kediri' }
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
    // ----------------------------------------------------
    // 2. TENANT SETTINGS & LOGO
    // ----------------------------------------------------
    if (path === '/api/tenant/settings') {
      const activeTenantId = await getSessionTenantId();

      if (method === 'GET') {
        const [{ data: sData }, { data: tData }] = await Promise.all([
          supabase.from('tenant_settings').select('*').eq('tenant_id', activeTenantId).maybeSingle(),
          supabase.from('tenants').select('*').eq('id', activeTenantId).maybeSingle()
        ]);
        return jsonResponse({
          success: true,
          tenant: tData || null,
          settings: sData || { monthly_revenue_target: 15000000, invoice_footer: 'Terima kasih telah mempercayakan kendaraan Anda pada bengkel kami.' }
        });
      }

      if (method === 'PUT') {
        const body = JSON.parse(options.body || '{}');

        const tenantUpdates = {};
        if (body.name !== undefined) tenantUpdates.name = body.name;
        if (body.slug !== undefined) tenantUpdates.slug = body.slug;
        if (body.address !== undefined) tenantUpdates.address = body.address;
        if (body.phoneWa !== undefined || body.phone_wa !== undefined) {
          tenantUpdates.phone_wa = body.phoneWa ?? body.phone_wa;
        }
        if (body.businessHours !== undefined || body.business_hours !== undefined) {
          tenantUpdates.business_hours = body.businessHours ?? body.business_hours;
        }
        if (body.tagline !== undefined) tenantUpdates.tagline = body.tagline;
        if (body.heroImageUrl !== undefined || body.hero_image_url !== undefined) {
          tenantUpdates.hero_image_url = body.heroImageUrl ?? body.hero_image_url;
        }
        if (body.facilityImage1 !== undefined || body.facility_image_1 !== undefined) {
          tenantUpdates.facility_image_1 = body.facilityImage1 ?? body.facility_image_1;
        }
        if (body.facilityImage2 !== undefined || body.facility_image_2 !== undefined) {
          tenantUpdates.facility_image_2 = body.facilityImage2 ?? body.facility_image_2;
        }
        if (body.mapsUrl !== undefined || body.maps_url !== undefined) {
          tenantUpdates.maps_url = body.mapsUrl ?? body.maps_url;
        }
        if (body.mapsEmbedUrl !== undefined || body.maps_embed_url !== undefined) {
          tenantUpdates.maps_embed_url = body.mapsEmbedUrl ?? body.maps_embed_url;
        }
        if (body.latitude !== undefined) {
          tenantUpdates.latitude = body.latitude ? Number(body.latitude) : null;
        }
        if (body.longitude !== undefined) {
          tenantUpdates.longitude = body.longitude ? Number(body.longitude) : null;
        }
        if (body.profileCompleted !== undefined || body.profile_completed !== undefined) {
          tenantUpdates.profile_completed = (body.profileCompleted ?? body.profile_completed) ? 1 : 0;
        }
        tenantUpdates.updated_at = new Date().toISOString();

        let updatedTenant = null;
        if (Object.keys(tenantUpdates).length > 0) {
          const { data: tData } = await supabase
            .from('tenants')
            .update(tenantUpdates)
            .eq('id', activeTenantId)
            .select()
            .maybeSingle();
          updatedTenant = tData;
        }

        const settingsUpdates = {
          tenant_id: activeTenantId,
          updated_at: new Date().toISOString()
        };
        if (body.monthlyRevenueTarget !== undefined || body.monthly_revenue_target !== undefined) {
          settingsUpdates.monthly_revenue_target = Number(body.monthlyRevenueTarget ?? body.monthly_revenue_target);
        }
        if (body.invoiceFooter !== undefined || body.invoice_footer !== undefined) {
          settingsUpdates.invoice_footer = body.invoiceFooter ?? body.invoice_footer;
        }
        if (body.autoPrintInvoice !== undefined || body.auto_print_invoice !== undefined) {
          settingsUpdates.auto_print_invoice = (body.autoPrintInvoice ?? body.auto_print_invoice) ? 1 : 0;
        }
        if (body.notifyWa !== undefined || body.notify_wa !== undefined) {
          settingsUpdates.notify_wa = (body.notifyWa ?? body.notify_wa) ? 1 : 0;
        }

        const { data: sData } = await supabase
          .from('tenant_settings')
          .upsert(settingsUpdates, { onConflict: 'tenant_id' })
          .select()
          .maybeSingle();

        return jsonResponse({ success: true, tenant: updatedTenant, settings: sData });
      }
    }

    if (path === '/api/tenant/photo' && method === 'POST') {
      const activeTenantId = await getSessionTenantId();
      const formData = options.body;
      const file = formData.get('photo') || formData.get('image');
      const target = formData.get('target') || 'logo';

      if (!file) return errorResponse('File gambar wajib diunggah.');
      const { url } = await uploadImageToSupabase(file, 'tenants');

      const updateData = {};
      if (target === 'logo') updateData.logo_url = url;
      else if (target === 'hero') updateData.hero_image_url = url;

      await supabase.from('tenants').update(updateData).eq('id', activeTenantId);
      return jsonResponse({ success: true, url });
    }

    // ----------------------------------------------------
    // 2b. PUBLIC TENANT PROFILE & SHOWCASE
    // ----------------------------------------------------
    if (path === '/api/public/tenants' && method === 'GET') {
      const { data: tenantsList } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });
      return jsonResponse({
        success: true,
        tenants: tenantsList || []
      });
    }

    if ((path.startsWith('/api/public/tenant/') || (path.startsWith('/api/public/') && path.endsWith('/info'))) && method === 'GET') {
      let slug = '';
      if (path.startsWith('/api/public/tenant/')) {
        slug = path.replace('/api/public/tenant/', '').split('/')[0];
      } else {
        const parts = path.replace('/api/public/', '').split('/');
        slug = parts[0] === 'info' ? (params.get('slug') || '') : parts[0];
      }

      let tenantData = null;
      if (slug && slug !== 'mitra') {
        const { data } = await supabase
          .from('tenants')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();
        tenantData = data;
      }

      if (!tenantData) {
        const { data } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', DEFAULT_TENANT_ID)
          .maybeSingle();
        tenantData = data;
      }

      return jsonResponse({
        success: true,
        tenant: tenantData || {
          id: DEFAULT_TENANT_ID,
          slug: slug || 'mitra',
          name: DEFAULT_WORKSHOP_NAME,
          tagline: DEFAULT_WORKSHOP_TAGLINE,
          address: DEFAULT_WORKSHOP_ADDRESS,
          phone_wa: DEFAULT_WORKSHOP_PHONE,
          business_hours: DEFAULT_BUSINESS_HOURS
        }
      });
    }

    // ----------------------------------------------------
    // 3. PUBLIC TRACKING ROUTE
    // ----------------------------------------------------
    if (
      path.startsWith('/api/public/track') || 
      path.startsWith('/api/public/tracking') ||
      (path.startsWith('/api/public/') && path.endsWith('/tracking'))
    ) {
      let tenantSlug = 'bengkel-gps-motor';
      if (path.startsWith('/api/public/') && path.endsWith('/tracking')) {
        const slugCandidate = path.replace('/api/public/', '').replace('/tracking', '').trim();
        if (slugCandidate && slugCandidate !== 'public') {
          tenantSlug = slugCandidate;
        }
      }

      // Fetch tenant metadata
      let tenantData = null;
      if (tenantSlug) {
        const { data: t } = await supabase.from('tenants').select('*').eq('slug', tenantSlug).maybeSingle();
        tenantData = t;
      }
      if (!tenantData) {
        const { data: t } = await supabase.from('tenants').select('*').eq('id', DEFAULT_TENANT_ID).maybeSingle();
        tenantData = t;
      }

      const activeTenant = tenantData || {
        id: DEFAULT_TENANT_ID,
        slug: tenantSlug || 'bengkel-gps-motor',
        name: DEFAULT_WORKSHOP_NAME,
        tagline: DEFAULT_WORKSHOP_TAGLINE,
        address: DEFAULT_WORKSHOP_ADDRESS,
        phone_wa: DEFAULT_WORKSHOP_PHONE,
        business_hours: DEFAULT_BUSINESS_HOURS
      };

      const token = path.startsWith('/api/public/tracking/') 
        ? path.replace('/api/public/tracking/', '') 
        : params.get('token');
      const rawPlate = params.get('plate') || params.get('q') || params.get('search') || '';
      const cleanPlate = (rawPlate || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

      if (!token && !cleanPlate) {
        return errorResponse('Parameter nomor plat atau token pelacakan wajib diisi.', 400);
      }

      let ro = null;
      let roPhotos = [];
      let roLogs = [];
      let roParts = [];

      let query = supabase.from('repair_orders').select('*');
      if (token) {
        query = query.eq('tracking_token', token);
      } else if (cleanPlate) {
        const match = cleanPlate.match(/^([A-Z]{1,2})(\d{1,4})([A-Z]{0,3})$/);
        let spaced = cleanPlate;
        let flexible = cleanPlate;
        if (match) {
          const [, reg, num, suf] = match;
          spaced = [reg, num, suf].filter(Boolean).join(' ');
          flexible = [reg, num, suf].filter(Boolean).join('%');
        }
        query = query.or(`plate_number.ilike.%${flexible}%,plate_number.ilike.%${spaced}%,plate_number.ilike.%${cleanPlate}%`);
      }

      const { data: roList } = await query.order('created_at', { ascending: false }).limit(1);
      if (roList && roList.length > 0) {
        ro = roList[0];
        const [{ data: photos }, { data: logs }, { data: parts }] = await Promise.all([
          supabase.from('ro_photos').select('*').eq('repair_order_id', ro.id).order('created_at', { ascending: true }),
          supabase.from('ro_status_logs').select('*').eq('repair_order_id', ro.id).order('created_at', { ascending: true }),
          supabase.from('ro_spareparts').select('*').eq('repair_order_id', ro.id)
        ]);
        roPhotos = photos || [];
        roLogs = logs || [];
        roParts = parts || [];
      } else {
        // Fallback for Demo & Test Plates when cloud database does not have live records yet
        const isAvanzaDemo = cleanPlate.includes('1822') || cleanPlate.includes('AVANZA') || token === 'token-avanza-1822';
        const isInnovaDemo = cleanPlate.includes('1044') || cleanPlate.includes('INNOVA') || token === 'token-innova-1044';

        if (isAvanzaDemo) {
          ro = {
            id: 'ro-demo-avanza-1822',
            tenant_id: activeTenant.id,
            ro_number: 'RO-202610-001',
            tracking_token: 'token-avanza-1822',
            plate_number: 'AG 1822 AB',
            customer_name: 'Joko Widodo',
            customer_phone: '081234567890',
            car_brand: 'Toyota',
            car_model: 'Avanza 1.3 G',
            car_year: 2019,
            car_color: 'Hitam Metalik',
            odometer_in: 65420,
            entry_date: new Date(Date.now() - 3600000 * 4).toISOString().substring(0, 10),
            complaint: 'Mesin brebet saat akselerasi dan AC terasa kurang dingin saat siang hari',
            mechanic_name: 'Mas Agus Santoso',
            status: 'PENGERJAAN',
            service_fee: 150000,
            sparepart_fee: 300000,
            total_cost: 450000,
            estimated_completion: `${new Date().toISOString().substring(0, 10)} 17:00`,
            notes: 'Sedang dilakukan penggantian 4 busi iridium dan pembersihan intake manifold & throttle body.'
          };

          roPhotos = [
            {
              id: 'photo-demo-01',
              repair_order_id: ro.id,
              stage: 'BEFORE',
              photo_url: '/images/before-after/spark-plug-worn.jpg',
              caption: 'Kondisi busi lama mengalami kerak karbon hitam & celah elektroda aus di atas batas toleransi.',
              created_at: new Date(Date.now() - 3600000 * 3).toISOString()
            },
            {
              id: 'photo-demo-02',
              repair_order_id: ro.id,
              stage: 'PROGRESS',
              photo_url: '/images/gallery/facility-scanner.jpg',
              caption: 'Pembersihan throttle body dengan injector cleaner dan scan live data sensor menggunakan scanner OBD2.',
              created_at: new Date(Date.now() - 3600000 * 2).toISOString()
            },
            {
              id: 'photo-demo-03',
              repair_order_id: ro.id,
              stage: 'AFTER',
              photo_url: '/images/before-after/spark-plug-new.jpg',
              caption: 'Pemasangan 4x Busi NGK Iridium baru dan penggantian filter oli original selesai.',
              created_at: new Date(Date.now() - 3600000 * 1).toISOString()
            }
          ];

          roLogs = [
            { id: 'log-01', previous_status: null, new_status: 'MASUK', notes: 'Penerimaan unit kendaraan, pencatatan keluhan', created_at: new Date(Date.now() - 3600000 * 4).toISOString() },
            { id: 'log-02', previous_status: 'MASUK', new_status: 'DIAGNOSA', notes: 'Scan OBD2 menunjukkan silinder 2 misfire akibat busi aus', created_at: new Date(Date.now() - 3600000 * 3).toISOString() },
            { id: 'log-03', previous_status: 'DIAGNOSA', new_status: 'PENGERJAAN', notes: 'Penggantian 4 busi iridium dan pembersihan intake', created_at: new Date(Date.now() - 3600000 * 1).toISOString() }
          ];

          roParts = [
            { id: 'part-01', item_name: 'Busi NGK Iridium BKR6EIX (4 pcs)', quantity: 4, unit_price: 65000, subtotal: 260000 },
            { id: 'part-02', item_name: 'Pembersih Throttle Body & Injector', quantity: 1, unit_price: 40000, subtotal: 40000 }
          ];
        } else if (isInnovaDemo) {
          ro = {
            id: 'ro-demo-innova-1044',
            tenant_id: activeTenant.id,
            ro_number: 'RO-202610-002',
            tracking_token: 'token-innova-1044',
            plate_number: 'AG 1044 RK',
            customer_name: 'Rudi Hartono',
            customer_phone: '081398765432',
            car_brand: 'Toyota',
            car_model: 'Kijang Innova Reborn 2.4 V',
            car_year: 2020,
            car_color: 'Putih Mutiara',
            odometer_in: 78500,
            entry_date: new Date(Date.now() - 3600000 * 2).toISOString().substring(0, 10),
            complaint: 'Bunyi glodakan di roda depan dan kaki-kaki saat melewati jalan tidak rata',
            mechanic_name: 'Pak Sugeng Widodo',
            status: 'DIAGNOSA',
            service_fee: 200000,
            sparepart_fee: 450000,
            total_cost: 650000,
            estimated_completion: `${new Date().toISOString().substring(0, 10)} 16:30`,
            notes: 'Pemeriksaan lift hidrolik 4-ton untuk mengecek kondisi bushing arm, tierod, dan link stabilizer.'
          };

          roPhotos = [
            {
              id: 'photo-innova-01',
              repair_order_id: ro.id,
              stage: 'BEFORE',
              photo_url: '/images/gallery/facility-lift.jpg',
              caption: 'Inspeksi kolong kaki-kaki pada pit lift hidrolik: karet bushing arm kiri mulai retak aus.',
              created_at: new Date(Date.now() - 3600000 * 2).toISOString()
            }
          ];

          roLogs = [
            { id: 'log-01', previous_status: null, new_status: 'MASUK', notes: 'Penerimaan unit Innova keluhan kaki-kaki', created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
            { id: 'log-02', previous_status: 'MASUK', new_status: 'DIAGNOSA', notes: 'Inspeksi pit lift: bushing arm lower aus', created_at: new Date(Date.now() - 3600000 * 1).toISOString() }
          ];

          roParts = [
            { id: 'part-01', item_name: 'Bushing Lower Arm Depan Original', quantity: 2, unit_price: 175000, subtotal: 350000 },
            { id: 'part-02', item_name: 'Karet Link Stabilizer', quantity: 2, unit_price: 50000, subtotal: 100000 }
          ];
        } else {
          return errorResponse(`Data perbaikan tidak ditemukan untuk plat nomor "${rawPlate || token}". Silakan pastikan nomor plat yang Anda masukkan sudah benar.`, 404);
        }
      }

      // Ensure signed URLs for images
      const signedPhotos = await Promise.all(
        roPhotos.map(async (p) => ({
          ...p,
          photo_url: await getSignedImageUrl(p.photo_url || p.url)
        }))
      );

      const sanitized = sanitizeTrackingPayload(ro, signedPhotos, roLogs, roParts);

      // Construct milestone stages (6-stage status lifecycle)
      const stageDefinitions = [
        { step: 1, key: 'MASUK', label: 'Unit Masuk', description: 'Kendaraan diterima di stall registrasi, pemeriksaan awal & pencatatan keluhan pemilik.' },
        { step: 2, key: 'DIAGNOSA', label: 'Diagnosa & Estimasi', description: 'Pemeriksaan komputer scanner OBD2, cek fisik kolong lift, & rincian estimasi biaya disetujui.' },
        { step: 3, key: 'PENGERJAAN', label: 'Pengerjaan Servis', description: 'Mekanik bersertifikasi melakukan perbaikan mesin, injeksi, kaki-kaki, atau kelistrikan.' },
        { step: 4, key: 'MENUNGGU_PART', label: 'Pemasangan Part', description: 'Proses pemasangan suku cadang original/pilihan pemilik mobil, part lama disimpan untuk dikembalikan.' },
        { step: 5, key: 'SELESAI', label: 'Quality Control', description: 'Pengerjaan tuntas, final inspection & test drive, pembersihan area kerja.' },
        { step: 6, key: 'DIAMBIL', label: 'Siap Diambil', description: 'Kendaraan siap diserahkan kepada pemilik, penyerahan part bekas, & aktivasi garansi servis.' }
      ];

      const stageOrder = ['MASUK', 'DIAGNOSA', 'PENGERJAAN', 'MENUNGGU_PART', 'SELESAI', 'DIAMBIL'];
      const currentIdx = stageOrder.indexOf(ro.status);

      const milestones = stageDefinitions.map((def, idx) => {
        const logForStage = roLogs.find(l => l.new_status === def.key);
        return {
          key: def.key,
          step: def.step,
          label: def.label,
          description: def.description,
          isCompleted: idx <= currentIdx,
          isCurrent: def.key === ro.status,
          timestamp: logForStage ? logForStage.created_at : null,
          notes: logForStage ? logForStage.notes : null
        };
      });

      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const relativeTrackingUrl = ro.tracking_token
        ? `/${activeTenant.slug}/cek-status?token=${encodeURIComponent(ro.tracking_token)}`
        : `/${activeTenant.slug}/cek-status?plate=${encodeURIComponent(ro.plate_number || rawPlate)}`;
      const trackingUrl = origin ? `${origin}${relativeTrackingUrl}` : relativeTrackingUrl;

      const cleanPhone = (activeTenant.phone_wa || DEFAULT_WORKSHOP_PHONE).replace(/[^0-9]/g, '');
      const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
      const shareMessage = `Halo, pantau proses servis kendaraan *${sanitized.plate_masked}* di *${activeTenant.name}* secara live di link berikut:\n\n${trackingUrl}`;
      const waShareUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
      const waContactUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Halo ${activeTenant.name}, saya ingin menanyakan status servis kendaraan saya dengan plat ${sanitized.plate_masked}.`)}`;

      return jsonResponse({
        success: true,
        tenant: {
          id: activeTenant.id,
          slug: activeTenant.slug,
          name: activeTenant.name,
          address: activeTenant.address,
          phone_wa: activeTenant.phone_wa,
          phoneWa: activeTenant.phone_wa,
          business_hours: activeTenant.business_hours,
          businessHours: activeTenant.business_hours
        },
        repairOrder: sanitized,
        vehicle: sanitized,
        plate_masked: sanitized.plate_masked,
        customer_name_masked: sanitized.customer_name_masked,
        milestones,
        stages: milestones,
        photos: sanitized.photos || [],
        logs: sanitized.logs || [],
        spareparts: sanitized.spareparts || [],
        history: [],
        trackingUrl,
        shareUrl: trackingUrl,
        waShareUrl,
        whatsappUrl: waShareUrl,
        waContactUrl
      });
    }

    // ----------------------------------------------------
    // 4. DASHBOARD SUMMARY
    // ----------------------------------------------------
    if (path === '/api/dashboard/summary') {
      const activeTenantId = await getSessionTenantId();
      const [roRes, partsRes, transRes] = await Promise.all([
        supabase.from('repair_orders').select('id, status, total_cost, created_at').eq('tenant_id', activeTenantId),
        supabase.from('spareparts').select('id, stock, min_stock').eq('tenant_id', activeTenantId),
        supabase.from('transactions').select('amount, type, date').eq('tenant_id', activeTenantId)
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
      const activeTenantId = await getSessionTenantId();

      // 5.1 Options for form
      if (path === '/api/repair-orders/form-options') {
        const [{ data: parts }, { data: customers }, { data: vehicles }] = await Promise.all([
          supabase.from('spareparts').select('*').eq('tenant_id', activeTenantId).eq('is_active', 1).gt('stock', 0),
          supabase.from('customers').select('*').eq('tenant_id', activeTenantId).limit(200),
          supabase.from('vehicles').select('*').eq('tenant_id', activeTenantId).limit(200)
        ]);
        return jsonResponse({ spareparts: parts || [], customers: customers || [], vehicles: vehicles || [] });
      }

      // 5.2 Upload Photo to RO
      if (path.match(/^\/api\/repair-orders\/[^/]+\/photos$/) && method === 'POST') {
        const roId = path.split('/')[3];
        const { data: parentRo } = await supabase.from('repair_orders').select('tenant_id').eq('id', roId).maybeSingle();
        const roTenantId = parentRo?.tenant_id || activeTenantId;

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
            tenant_id: roTenantId,
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
      if (path.match(/^\/api\/repair-orders\/[^/]+\/status$/) && (method === 'PUT' || method === 'POST')) {
        const roId = path.split('/')[3];
        const body = JSON.parse(options.body || '{}');
        const { status, notes, actor_name } = body;

        const { data: oldRo } = await supabase.from('repair_orders').select('*').eq('id', roId).single();
        if (!oldRo) return errorResponse('Repair Order tidak ditemukan.', 404);

        const roTenantId = oldRo.tenant_id || activeTenantId;

        await Promise.all([
          supabase.from('repair_orders').update({ status, updated_at: new Date().toISOString() }).eq('id', roId),
          supabase.from('ro_status_logs').insert({
            id: crypto.randomUUID(),
            tenant_id: roTenantId,
            repair_order_id: roId,
            previous_status: oldRo.status,
            new_status: status,
            notes: notes || '',
            actor_name: actor_name || 'Operator'
          })
        ]);

        return jsonResponse({ success: true, status });
      }

      // 5.5 Update Costs / General details of RO
      if ((path.match(/^\/api\/repair-orders\/[^/]+\/costs$/) && (method === 'PATCH' || method === 'PUT')) ||
          (path.match(/^\/api\/repair-orders\/[^/]+$/) && (method === 'PATCH' || method === 'PUT'))) {
        const roId = path.split('/')[3];
        const body = JSON.parse(options.body || '{}');

        const { data: oldRo } = await supabase.from('repair_orders').select('*').eq('id', roId).single();
        if (!oldRo) return errorResponse('Repair Order tidak ditemukan.', 404);

        const serviceFee = body.service_fee !== undefined ? Number(body.service_fee) : Number(oldRo.service_fee || 0);
        const discount = body.discount !== undefined ? Number(body.discount) : Number(oldRo.discount || 0);
        const sparepartFee = Number(oldRo.sparepart_fee || 0);
        const totalCost = Math.max(0, serviceFee + sparepartFee - discount);

        const updatePayload = {
          service_fee: serviceFee,
          discount,
          total_cost: totalCost,
          updated_at: new Date().toISOString()
        };
        if (body.complaint !== undefined) updatePayload.complaint = body.complaint;
        if (body.mechanic_name !== undefined) updatePayload.mechanic_name = body.mechanic_name;
        if (body.notes !== undefined) updatePayload.notes = body.notes;

        const { data: updatedRo, error: updateErr } = await supabase
          .from('repair_orders')
          .update(updatePayload)
          .eq('id', roId)
          .select()
          .single();

        if (updateErr) throw updateErr;
        return jsonResponse({ success: true, repair_order: updatedRo, repairOrder: updatedRo });
      }

      // 5.6 Add Sparepart to RO
      if ((path.match(/^\/api\/repair-orders\/[^/]+\/parts$/) || path.match(/^\/api\/repair-orders\/[^/]+\/spareparts$/)) && method === 'POST') {
        const roId = path.split('/')[3];
        const body = JSON.parse(options.body || '{}');
        const { sparepart_id, quantity, unit_price } = body;

        const { data: parentRo } = await supabase.from('repair_orders').select('tenant_id, sparepart_fee, service_fee, discount').eq('id', roId).maybeSingle();
        const roTenantId = parentRo?.tenant_id || activeTenantId;

        const { data: part } = await supabase.from('spareparts').select('*').eq('id', sparepart_id).single();
        const itemName = part ? part.name : 'Sparepart';
        const price = Number(unit_price || (part ? part.sell_price : 0));
        const subtotal = price * Number(quantity || 1);

        const { data: inserted, error: partErr } = await supabase
          .from('ro_spareparts')
          .insert({
            id: crypto.randomUUID(),
            tenant_id: roTenantId,
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

        // Decrement stock in spareparts & log movement
        if (part) {
          await Promise.all([
            supabase.from('spareparts').update({ stock: Math.max(0, part.stock - Number(quantity || 1)) }).eq('id', sparepart_id),
            supabase.from('stock_movements').insert({
              id: crypto.randomUUID(),
              tenant_id: roTenantId,
              sparepart_id,
              type: 'OUT',
              quantity: Number(quantity || 1),
              date: new Date().toISOString().split('T')[0],
              notes: `Dipasang pada ${roId}`
            })
          ]);
        }

        // Recalculate RO sparepart_fee and total_cost
        if (parentRo) {
          const newPartFee = Number(parentRo.sparepart_fee || 0) + subtotal;
          const newTotal = Math.max(0, Number(parentRo.service_fee || 0) + newPartFee - Number(parentRo.discount || 0));
          await supabase.from('repair_orders').update({
            sparepart_fee: newPartFee,
            total_cost: newTotal,
            updated_at: new Date().toISOString()
          }).eq('id', roId);
        }

        return jsonResponse({ success: true, sparepart: inserted }, 201);
      }

      // 5.7 Delete Sparepart from RO
      if ((path.match(/^\/api\/repair-orders\/[^/]+\/parts\/[^/]+$/) || path.match(/^\/api\/repair-orders\/[^/]+\/spareparts\/[^/]+$/)) && method === 'DELETE') {
        const roId = path.split('/')[3];
        const itemId = path.split('/')[5];

        const { data: item } = await supabase.from('ro_spareparts').select('*').eq('id', itemId).single();
        if (item) {
          // Restore stock
          if (item.sparepart_id) {
            const { data: part } = await supabase.from('spareparts').select('stock').eq('id', item.sparepart_id).single();
            if (part) {
              await supabase.from('spareparts').update({ stock: (part.stock || 0) + Number(item.quantity || 1) }).eq('id', item.sparepart_id);
            }
          }
          await supabase.from('ro_spareparts').delete().eq('id', itemId);

          // Recalculate RO cost
          const { data: parentRo } = await supabase.from('repair_orders').select('sparepart_fee, service_fee, discount').eq('id', roId).maybeSingle();
          if (parentRo) {
            const newPartFee = Math.max(0, Number(parentRo.sparepart_fee || 0) - Number(item.subtotal || 0));
            const newTotal = Math.max(0, Number(parentRo.service_fee || 0) + newPartFee - Number(parentRo.discount || 0));
            await supabase.from('repair_orders').update({
              sparepart_fee: newPartFee,
              total_cost: newTotal,
              updated_at: new Date().toISOString()
            }).eq('id', roId);
          }
        }
        return jsonResponse({ success: true });
      }

      // 5.8 Detail of RO
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

      // 5.9 List ROs
      if (path === '/api/repair-orders' && method === 'GET') {
        let query = supabase.from('repair_orders').select('*').eq('tenant_id', activeTenantId);
        const statusFilter = params.get('status');
        const searchFilter = params.get('search');
        if (statusFilter && statusFilter !== 'ALL') {
          query = query.eq('status', statusFilter);
        }
        if (searchFilter) {
          const clean = searchFilter.toUpperCase().replace(/[^A-Z0-9]/g, '');
          const match = clean.match(/^([A-Z]{1,2})(\d{1,4})([A-Z]{0,3})$/);
          let extraPlateFilter = '';
          if (match) {
            const [, reg, num, suf] = match;
            const flexible = [reg, num, suf].filter(Boolean).join('%');
            const spaced = [reg, num, suf].filter(Boolean).join(' ');
            extraPlateFilter = `,plate_number.ilike.%${flexible}%,plate_number.ilike.%${spaced}%`;
          }
          query = query.or(`plate_number.ilike.%${searchFilter}%,customer_name.ilike.%${searchFilter}%,ro_number.ilike.%${searchFilter}%${extraPlateFilter}`);
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

      // 5.10 Create RO
      if (path === '/api/repair-orders' && method === 'POST') {
        const body = JSON.parse(options.body || '{}');
        const id = crypto.randomUUID();
        const roNumber = `RO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
        const trackingToken = crypto.randomUUID().replace(/-/g, '').slice(0, 16);

        const newRo = {
          id,
          tenant_id: activeTenantId,
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
          tenant_id: activeTenantId,
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
      const activeTenantId = await getSessionTenantId();

      if (path === '/api/inventory/upload' && method === 'POST') {
        const formData = options.body;
        const file = formData.get('photo');
        if (!file) return errorResponse('File foto wajib diunggah.');
        const { url } = await uploadImageToSupabase(file, 'spareparts');
        return jsonResponse({ success: true, url, photo_url: url });
      }

      if (path === '/api/inventory/reports/valuation') {
        const { data: parts } = await supabase.from('spareparts').select('*').eq('tenant_id', activeTenantId);
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
        const { data, error } = await supabase.from('spareparts').select('*').eq('tenant_id', activeTenantId).order('name');
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
          tenant_id: activeTenantId,
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

      if (path.match(/^\/api\/inventory\/[^/]+$/) && method === 'DELETE') {
        const id = path.split('/')[3];
        const { error } = await supabase.from('spareparts').delete().eq('id', id);
        if (error) throw error;
        return jsonResponse({ success: true });
      }
    }

    // ----------------------------------------------------
    // 7. STOCK MOVEMENTS & OPNAME
    // ----------------------------------------------------
    if (path === '/api/stock-movements' || path.startsWith('/api/stock-movements/')) {
      const activeTenantId = await getSessionTenantId();

      if (path === '/api/stock-movements' && method === 'GET') {
        const { data, error } = await supabase.from('stock_movements').select('*, spareparts(name, sku)').eq('tenant_id', activeTenantId).order('created_at', { ascending: false });
        if (error) throw error;
        return jsonResponse({ movements: data || [] });
      }

      if (path === '/api/stock-movements/in' && method === 'POST') {
        const body = JSON.parse(options.body || '{}');
        const id = crypto.randomUUID();
        const { sparepart_id, quantity, unit_price } = body;

        const { data: movement, error } = await supabase.from('stock_movements').insert({
          id,
          tenant_id: activeTenantId,
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
          tenant_id: activeTenantId,
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
      const activeTenantId = await getSessionTenantId();

      if (method === 'GET') {
        const { data } = await supabase.from('stock_opnames').select('*, spareparts(name, sku)').eq('tenant_id', activeTenantId).order('created_at', { ascending: false });
        return jsonResponse({ opnames: data || [] });
      }

      if (method === 'POST') {
        const body = JSON.parse(options.body || '{}');
        const id = crypto.randomUUID();
        const { sparepart_id, system_stock, physical_stock, difference, reason } = body;

        const { data: opname, error } = await supabase.from('stock_opnames').insert({
          id,
          tenant_id: activeTenantId,
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
      const activeTenantId = await getSessionTenantId();

      if (path === '/api/finance/upload' && method === 'POST') {
        const formData = options.body;
        const file = formData.get('receipt') || formData.get('photo');
        if (!file) return errorResponse('File bukti nota wajib diunggah.');
        const { url } = await uploadImageToSupabase(file, 'receipts');
        return jsonResponse({ success: true, url, receipt_url: url });
      }

      if (path === '/api/finance/categories' || path.startsWith('/api/finance/categories/')) {
        if (path === '/api/finance/categories' && method === 'GET') {
          const { data } = await supabase.from('transaction_categories').select('*').eq('tenant_id', activeTenantId).order('name');
          return jsonResponse({ categories: data || [] });
        }
        if (path === '/api/finance/categories' && method === 'POST') {
          const body = JSON.parse(options.body || '{}');
          const id = crypto.randomUUID();
          const { data, error } = await supabase.from('transaction_categories').insert({
            id,
            tenant_id: activeTenantId,
            name: body.name,
            type: body.type || 'EXPENSE'
          }).select().single();
          if (error) throw error;
          return jsonResponse({ success: true, category: data }, 201);
        }
        if (path.match(/^\/api\/finance\/categories\/[^/]+$/) && method === 'PUT') {
          const id = path.split('/')[4];
          const body = JSON.parse(options.body || '{}');
          const { data, error } = await supabase.from('transaction_categories').update({
            name: body.name,
            type: body.type
          }).eq('id', id).select().single();
          if (error) throw error;
          return jsonResponse({ success: true, category: data });
        }
        if (path.match(/^\/api\/finance\/categories\/[^/]+$/) && method === 'DELETE') {
          const id = path.split('/')[4];
          const { error } = await supabase.from('transaction_categories').delete().eq('id', id);
          if (error) throw error;
          return jsonResponse({ success: true });
        }
      }

      if (path === '/api/finance/transactions' || path.startsWith('/api/finance/transactions/')) {
        if (path === '/api/finance/transactions' && method === 'GET') {
          const { data } = await supabase.from('transactions').select('*, transaction_categories(name)').eq('tenant_id', activeTenantId).order('date', { ascending: false });
          return jsonResponse({ transactions: data || [] });
        }
        if (path === '/api/finance/transactions' && method === 'POST') {
          const body = JSON.parse(options.body || '{}');
          const id = crypto.randomUUID();
          const { data, error } = await supabase.from('transactions').insert({
            id,
            tenant_id: activeTenantId,
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
        if (path.match(/^\/api\/finance\/transactions\/[^/]+$/) && method === 'DELETE') {
          const id = path.split('/')[4];
          const { error } = await supabase.from('transactions').delete().eq('id', id);
          if (error) throw error;
          return jsonResponse({ success: true });
        }
      }
    }

    // ----------------------------------------------------
    // 9. CUSTOMERS
    // ----------------------------------------------------
    if (path === '/api/customers' || path.startsWith('/api/customers/')) {
      const activeTenantId = await getSessionTenantId();

      if (path === '/api/customers' && method === 'GET') {
        const { data, error } = await supabase.from('customers').select('*').eq('tenant_id', activeTenantId).order('name');
        if (error) throw error;
        return jsonResponse({ customers: data || [] });
      }
      if (path === '/api/customers' && method === 'POST') {
        const body = JSON.parse(options.body || '{}');
        const id = crypto.randomUUID();
        const { data, error } = await supabase.from('customers').insert({
          id,
          tenant_id: activeTenantId,
          name: body.name,
          phone: body.phone,
          email: body.email || '',
          address: body.address || '',
          notes: body.notes || ''
        }).select().single();
        if (error) throw error;
        return jsonResponse({ success: true, customer: data }, 201);
      }
      if (path.match(/^\/api\/customers\/[^/]+$/) && method === 'PUT') {
        const id = path.split('/')[3];
        const body = JSON.parse(options.body || '{}');
        const { data, error } = await supabase.from('customers').update({
          name: body.name,
          phone: body.phone,
          email: body.email || '',
          address: body.address || '',
          notes: body.notes || '',
          updated_at: new Date().toISOString()
        }).eq('id', id).select().single();
        if (error) throw error;
        return jsonResponse({ success: true, customer: data });
      }
      if (path.match(/^\/api\/customers\/[^/]+$/) && method === 'DELETE') {
        const id = path.split('/')[3];
        const { error } = await supabase.from('customers').delete().eq('id', id);
        if (error) throw error;
        return jsonResponse({ success: true });
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
          const [
            { data: tenantsList, error: tErr },
            { data: usersList },
            { data: rosList },
            { data: partsList },
            { data: txsList },
            { data: movementsList }
          ] = await Promise.all([
            supabase.from('tenants').select('*').order('created_at', { ascending: false }),
            supabase.from('users').select('id, tenant_id, created_at'),
            supabase.from('repair_orders').select('id, tenant_id, total_cost'),
            supabase.from('spareparts').select('id, tenant_id'),
            supabase.from('transactions').select('tenant_id, type, amount'),
            supabase.from('stock_movements').select('tenant_id, type, quantity')
          ]);

          if (tErr) throw tErr;

          const tenantsWithMetrics = (tenantsList || []).map(t => {
            const uCount = (usersList || []).filter(u => u.tenant_id === t.id).length;
            const rCount = (rosList || []).filter(r => r.tenant_id === t.id).length;
            const pCount = (partsList || []).filter(p => p.tenant_id === t.id).length;

            const tenantTxs = (txsList || []).filter(tx => tx.tenant_id === t.id);
            const totalRev = tenantTxs
              .filter(tx => tx.type === 'INCOME')
              .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

            const tenantMvs = (movementsList || []).filter(m => m.tenant_id === t.id);
            const inMvs = tenantMvs.filter(m => m.type === 'IN');
            const outMvs = tenantMvs.filter(m => m.type === 'OUT');

            return {
              ...t,
              user_count: uCount,
              ro_count: rCount,
              sparepart_count: pCount,
              total_revenue: totalRev,
              stock_in_count: inMvs.length,
              stock_in_qty: inMvs.reduce((sum, m) => sum + Number(m.quantity || 0), 0),
              stock_out_count: outMvs.length,
              stock_out_qty: outMvs.reduce((sum, m) => sum + Number(m.quantity || 0), 0),
              last_login_at: t.updated_at || t.created_at
            };
          });

          return jsonResponse({ success: true, tenants: tenantsWithMetrics });
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
          // 1. If Supabase table exists, query users
          if (supabase) {
            try {
              const [{ data: usersData, error }, { data: tenantsData }] = await Promise.all([
                supabase.from('users').select('*').order('created_at', { ascending: false }),
                supabase.from('tenants').select('id, name, slug')
              ]);

              if (!error && Array.isArray(usersData) && usersData.length > 0) {
                const tenantMap = {};
                (tenantsData || []).forEach(t => { tenantMap[t.id] = t; });
                const enriched = usersData.map(u => {
                  const t = tenantMap[u.tenant_id];
                  return {
                    ...u,
                    tenant_name: t?.name || u.tenant_id,
                    tenant_slug: t?.slug || ''
                  };
                });
                return jsonResponse({ success: true, users: enriched });
              }
            } catch (e) {
              console.warn('Superadmin users query error:', e);
            }
          }

          // 2. Fallback to active session user + environment configured superadmins
          const configuredAdmins = parseConfiguredSuperadmins();
          const activeSession = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('bengkel_session') || 'null') : null;
          const userList = [];

          if (activeSession?.email) {
            userList.push({
              id: activeSession.id || 'usr-active-01',
              name: activeSession.name || 'Active User',
              email: activeSession.email,
              role: activeSession.role || 'superadmin',
              tenant_id: activeSession.tenant_id || DEFAULT_TENANT_ID,
              tenant_name: 'Semua Bengkel (Superadmin)',
              tenant_slug: 'mitra',
              created_at: new Date().toISOString()
            });
          }

          configuredAdmins.forEach((adminEmail, idx) => {
            if (!userList.some(u => u.email.toLowerCase() === adminEmail.toLowerCase())) {
              userList.push({
                id: `usr-env-super-${idx + 1}`,
                name: adminEmail.split('@')[0],
                email: adminEmail,
                role: 'superadmin',
                tenant_id: DEFAULT_TENANT_ID,
                tenant_name: 'Semua Bengkel (Superadmin)',
                tenant_slug: 'mitra',
                created_at: new Date().toISOString()
              });
            }
          });

          return jsonResponse({
            success: true,
            users: userList
          });
        }

        if (method === 'POST') {
          const body = JSON.parse(options.body || '{}');
          if (body.email && body.tenantId) {
            const { data, error } = await supabase.from('users').upsert({
              id: crypto.randomUUID(),
              email: body.email.toLowerCase().trim(),
              name: body.name || body.email.split('@')[0],
              role: body.role || 'operator',
              tenant_id: body.tenantId,
              auth_provider: 'supabase'
            }, { onConflict: 'email' }).select().single();
            if (error) throw error;
            return jsonResponse({ success: true, message: `Email ${body.email} berhasil dihubungkan ke workspace bengkel.`, user: data }, 201);
          }
          return jsonResponse({ success: true, message: `Email ${body.email} berhasil dihubungkan ke tenant.` });
        }
      }

      if (path.match(/^\/api\/superadmin\/users\/[^/]+\/role$/) && method === 'PUT') {
        const userId = path.split('/')[4];
        const body = JSON.parse(options.body || '{}');
        const { data, error } = await supabase.from('users').update({ role: body.role }).eq('id', userId).select().maybeSingle();
        if (error) throw error;
        return jsonResponse({ success: true, message: 'Role pengguna berhasil diperbarui.', user: data });
      }

      if (path.match(/^\/api\/superadmin\/users\/[^/]+\/tenant$/) && method === 'PUT') {
        const userId = path.split('/')[4];
        const body = JSON.parse(options.body || '{}');
        const { data, error } = await supabase.from('users').update({ tenant_id: body.tenantId }).eq('id', userId).select().maybeSingle();
        if (error) throw error;
        return jsonResponse({ success: true, message: 'Tenant pengguna berhasil dipindahkan.', user: data });
      }

      if (path.startsWith('/api/superadmin/users/')) {
        return jsonResponse({ success: true, message: 'Operasi pengguna berhasil.' });
      }

      if (path === '/api/superadmin/system') {
        const configuredAdmins = parseConfiguredSuperadmins();
        const activeSession = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('bengkel_session') || 'null') : null;
        return jsonResponse({
          success: true,
          system: {
            superadminEmail: activeSession?.email || configuredAdmins[0] || 'Dikonfigurasi via Environment/Database',
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
