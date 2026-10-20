-- ====================================================================
-- Bengkel Mobil GPS Motor Kediri - Supabase PostgreSQL Schema & Seeds
-- Database: PostgreSQL (Supabase)
-- ====================================================================

-- 1. Tenants (Workshop Workspaces)
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone_wa TEXT NOT NULL,
  business_hours TEXT DEFAULT 'Senin - Sabtu: 08:00 - 17:00 WIB',
  logo_url TEXT,
  hero_image_url TEXT,
  facility_image_1 TEXT,
  facility_image_2 TEXT,
  tagline TEXT,
  maps_url TEXT,
  maps_embed_url TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  profile_completed INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS maps_url TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS maps_embed_url TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS latitude NUMERIC;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS longitude NUMERIC;

-- 2. Users (Operators linked to Tenant)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  google_id TEXT,
  auth_provider TEXT NOT NULL DEFAULT 'mock',
  role TEXT NOT NULL DEFAULT 'operator',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, email)
);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);

-- 3. Tenant Settings (Workshop Config & Financial Targets)
CREATE TABLE IF NOT EXISTS tenant_settings (
  tenant_id TEXT PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  monthly_revenue_target NUMERIC NOT NULL DEFAULT 15000000,
  invoice_footer TEXT DEFAULT 'Terima kasih telah mempercayakan kendaraan Anda pada Bengkel GPS Motor Kediri.',
  auto_print_invoice INTEGER NOT NULL DEFAULT 0,
  notify_wa INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Customers (CRM)
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_customers_tenant_phone ON customers(tenant_id, phone);

-- 5. Vehicles (Customer Car Registry)
CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
  plate_number TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_vehicles_tenant_plate ON vehicles(tenant_id, plate_number);

-- 6. Spareparts (Inventory Catalog)
CREATE TABLE IF NOT EXISTS spareparts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'pcs',
  min_stock INTEGER NOT NULL DEFAULT 5,
  stock INTEGER NOT NULL DEFAULT 0,
  buy_price NUMERIC NOT NULL DEFAULT 0,
  sell_price NUMERIC NOT NULL DEFAULT 0,
  supplier TEXT,
  photo_url TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, sku)
);
CREATE INDEX IF NOT EXISTS idx_spareparts_tenant_search ON spareparts(tenant_id, category, name);
CREATE INDEX IF NOT EXISTS idx_spareparts_tenant_sku ON spareparts(tenant_id, sku);

-- 7. Stock Movements (Mutasi Stok: In, Out, Adjustment)
CREATE TABLE IF NOT EXISTS stock_movements (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sparepart_id TEXT NOT NULL REFERENCES spareparts(id) ON DELETE RESTRICT,
  type TEXT NOT NULL CHECK(type IN ('IN', 'OUT', 'ADJUSTMENT')),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC DEFAULT 0,
  total_price NUMERIC DEFAULT 0,
  date TEXT NOT NULL,
  supplier TEXT,
  invoice_number TEXT,
  notes TEXT,
  proof_photo_url TEXT,
  repair_order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_movements_tenant_part ON stock_movements(tenant_id, sparepart_id, date);

-- 8. Stock Opnames (Physical Audit Reconciliation)
CREATE TABLE IF NOT EXISTS stock_opnames (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sparepart_id TEXT NOT NULL REFERENCES spareparts(id) ON DELETE RESTRICT,
  system_stock INTEGER NOT NULL,
  physical_stock INTEGER NOT NULL,
  difference INTEGER NOT NULL,
  reason TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Transaction Categories (Custom Cashbook Categories)
CREATE TABLE IF NOT EXISTS transaction_categories (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('INCOME', 'EXPENSE')),
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, name, type)
);

-- 10. Transactions (Financial Ledger / Buku Kas)
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES transaction_categories(id) ON DELETE RESTRICT,
  type TEXT NOT NULL CHECK(type IN ('INCOME', 'EXPENSE')),
  amount NUMERIC NOT NULL,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK(payment_method IN ('CASH', 'TRANSFER', 'QRIS')),
  receipt_url TEXT,
  repair_order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_date ON transactions(tenant_id, date DESC);

-- 11. Repair Orders (Car Service Projects)
CREATE TABLE IF NOT EXISTS repair_orders (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  ro_number TEXT NOT NULL,
  tracking_token TEXT NOT NULL UNIQUE,
  customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
  plate_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  car_brand TEXT NOT NULL,
  car_model TEXT NOT NULL,
  car_year INTEGER,
  car_color TEXT,
  odometer_in INTEGER NOT NULL DEFAULT 0,
  entry_date TEXT NOT NULL,
  complaint TEXT NOT NULL,
  mechanic_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('MASUK', 'DIAGNOSA', 'PENGERJAAN', 'MENUNGGU_PART', 'SELESAI', 'DIAMBIL')),
  service_fee NUMERIC NOT NULL DEFAULT 0,
  sparepart_fee NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  estimated_completion TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, ro_number)
);
CREATE INDEX IF NOT EXISTS idx_ro_tenant_status ON repair_orders(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_ro_tenant_plate ON repair_orders(tenant_id, plate_number);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ro_tracking_token ON repair_orders(tracking_token);

-- 12. RO Status Logs (Audit Trail)
CREATE TABLE IF NOT EXISTS ro_status_logs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  repair_order_id TEXT NOT NULL REFERENCES repair_orders(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  notes TEXT,
  actor_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ro_logs_order ON ro_status_logs(repair_order_id, created_at ASC);

-- 13. RO Photos (Before / Progress / After)
CREATE TABLE IF NOT EXISTS ro_photos (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  repair_order_id TEXT NOT NULL REFERENCES repair_orders(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  stage TEXT NOT NULL CHECK(stage IN ('BEFORE', 'PROGRESS', 'AFTER')),
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ro_photos_order ON ro_photos(repair_order_id, stage);

-- 14. RO Spareparts (Attached to Repair Orders)
CREATE TABLE IF NOT EXISTS ro_spareparts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  repair_order_id TEXT NOT NULL REFERENCES repair_orders(id) ON DELETE CASCADE,
  sparepart_id TEXT NOT NULL REFERENCES spareparts(id) ON DELETE RESTRICT,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL,
  subtotal NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ro_spareparts_order ON ro_spareparts(repair_order_id);

-- 15. Views for Compatibility
CREATE OR REPLACE VIEW tenant_financial_settings AS 
SELECT tenant_id, monthly_revenue_target, updated_at FROM tenant_settings;

CREATE OR REPLACE VIEW sparepart_usages AS 
SELECT * FROM ro_spareparts;

-- ====================================================================
-- 16. Enable Row Level Security (RLS) & Policies
-- ====================================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE spareparts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_opnames ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ro_status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ro_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ro_spareparts ENABLE ROW LEVEL SECURITY;

-- Permissive policies for anon & authenticated (allows full app operations via anon key)
DO $$ 
DECLARE
  t text;
  tables text[] := ARRAY[
    'tenants', 'users', 'tenant_settings', 'customers', 'vehicles', 
    'spareparts', 'stock_movements', 'stock_opnames', 'transaction_categories', 
    'transactions', 'repair_orders', 'ro_status_logs', 'ro_photos', 'ro_spareparts'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Public access policy for %I" ON %I;', t, t);
    EXECUTE format('CREATE POLICY "Public access policy for %I" ON %I FOR ALL USING (true) WITH CHECK (true);', t, t);
  END LOOP;
END $$;

-- ====================================================================
-- 17. Supabase Storage Bucket Initialization ('bucket3' & 'bengkel-photos')
-- ====================================================================
-- 17a. Private Bucket 'bucket3' (Direct Signed URL Access)
INSERT INTO storage.buckets (id, name, public)
VALUES ('bucket3', 'bucket3', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "Storage Read bucket3" ON storage.objects;
CREATE POLICY "Storage Read bucket3" ON storage.objects
FOR SELECT USING (bucket_id = 'bucket3');

DROP POLICY IF EXISTS "Storage Upload bucket3" ON storage.objects;
CREATE POLICY "Storage Upload bucket3" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'bucket3');

DROP POLICY IF EXISTS "Storage Delete bucket3" ON storage.objects;
CREATE POLICY "Storage Delete bucket3" ON storage.objects
FOR DELETE USING (bucket_id = 'bucket3');

DROP POLICY IF EXISTS "Storage Update bucket3" ON storage.objects;
CREATE POLICY "Storage Update bucket3" ON storage.objects
FOR UPDATE USING (bucket_id = 'bucket3');

-- 17b. Fallback Bucket 'bengkel-photos'
INSERT INTO storage.buckets (id, name, public)
VALUES ('bengkel-photos', 'bengkel-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies for bengkel-photos
DROP POLICY IF EXISTS "Public Read bengkel-photos" ON storage.objects;
CREATE POLICY "Public Read bengkel-photos" ON storage.objects
FOR SELECT USING (bucket_id = 'bengkel-photos');

DROP POLICY IF EXISTS "Public Upload bengkel-photos" ON storage.objects;
CREATE POLICY "Public Upload bengkel-photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'bengkel-photos');

DROP POLICY IF EXISTS "Public Delete bengkel-photos" ON storage.objects;
CREATE POLICY "Public Delete bengkel-photos" ON storage.objects
FOR DELETE USING (bucket_id = 'bengkel-photos');

DROP POLICY IF EXISTS "Public Update bengkel-photos" ON storage.objects;
CREATE POLICY "Public Update bengkel-photos" ON storage.objects
FOR UPDATE USING (bucket_id = 'bengkel-photos');

-- ====================================================================
-- 18. INITIAL SEED DATA
-- ====================================================================
-- 1. Tenant Bengkel GPS Motor Kediri
INSERT INTO tenants (id, slug, name, address, phone_wa, business_hours, tagline, hero_image_url, facility_image_1, facility_image_2)
VALUES (
  'tenant-gps-motor-kediri-01',
  'bengkel-gps-motor',
  'Bengkel Mobil GPS Motor Kediri',
  'Jl. Raya Sambiresik No. 45, Kec. Gampengrejo, Kab. Kediri, Jawa Timur',
  '085603307330',
  'Senin - Sabtu: 08:00 - 17:00 WIB',
  'Tune Up, Injeksi, Kaki-kaki & Perawatan Berkala Terpercaya',
  '/images/mockup/hero_bay_clean.jpg',
  '/images/mockup/facility_lift_bay_clean.jpg',
  '/images/mockup/facility_inspection_clean.jpg'
) ON CONFLICT (id) DO UPDATE SET
  hero_image_url = EXCLUDED.hero_image_url,
  facility_image_1 = EXCLUDED.facility_image_1,
  facility_image_2 = EXCLUDED.facility_image_2;

-- 2. Tenant Settings
INSERT INTO tenant_settings (tenant_id, monthly_revenue_target, invoice_footer, auto_print_invoice, notify_wa)
VALUES (
  'tenant-gps-motor-kediri-01',
  15000000,
  'Terima kasih telah mempercayakan kendaraan Anda pada Bengkel GPS Motor Kediri.',
  0,
  1
) ON CONFLICT (tenant_id) DO NOTHING;

-- 3. Default Operators & Admin Users
INSERT INTO users (id, tenant_id, email, name, role, auth_provider)
VALUES 
  ('usr-admin-01', 'tenant-gps-motor-kediri-01', 'admin@gpsmotor.id', 'Super Admin GPS Motor', 'admin', 'mock'),
  ('usr-operator-01', 'tenant-gps-motor-kediri-01', 'admin@gpsmotor.local', 'Bambang GPS Motor', 'operator', 'mock')
ON CONFLICT (tenant_id, email) DO NOTHING;

-- 4. Default Cashbook Categories
INSERT INTO transaction_categories (id, tenant_id, name, type, is_default)
VALUES
  ('cat-inc-servis', 'tenant-gps-motor-kediri-01', 'Jasa Servis', 'INCOME', 1),
  ('cat-inc-parts', 'tenant-gps-motor-kediri-01', 'Penjualan Sparepart', 'INCOME', 1),
  ('cat-inc-other', 'tenant-gps-motor-kediri-01', 'Pendapatan Lain-lain', 'INCOME', 1),
  ('cat-exp-parts', 'tenant-gps-motor-kediri-01', 'Beli Sparepart / Stok', 'EXPENSE', 1),
  ('cat-exp-util', 'tenant-gps-motor-kediri-01', 'Listrik, Air & Internet', 'EXPENSE', 1),
  ('cat-exp-rent', 'tenant-gps-motor-kediri-01', 'Sewa Tempat & Bangunan', 'EXPENSE', 1),
  ('cat-exp-wages', 'tenant-gps-motor-kediri-01', 'Gaji Mekanik & Karyawan', 'EXPENSE', 1),
  ('cat-exp-tools', 'tenant-gps-motor-kediri-01', 'Tools & Perlengkapan Bengkel', 'EXPENSE', 1),
  ('cat-exp-ops', 'tenant-gps-motor-kediri-01', 'Operasional Lain-lain', 'EXPENSE', 1)
ON CONFLICT (tenant_id, name, type) DO NOTHING;

-- 5. Sample Spareparts
INSERT INTO spareparts (id, tenant_id, sku, name, category, unit, min_stock, stock, buy_price, sell_price, supplier)
VALUES
  ('part-oli-tmo-01', 'tenant-gps-motor-kediri-01', 'OIL-TMO-10W40', 'Oli Mesin TMO 10W-40 (4L)', 'Oli & Pelumas', 'galon', 4, 12, 285000, 360000, 'Distributor Oli Jatim'),
  ('part-filter-avanza', 'tenant-gps-motor-kediri-01', 'FLT-AVZ-001', 'Filter Oli Avanza / Xenia Original', 'Filter', 'pcs', 10, 24, 28000, 45000, 'PT Sumber Berkah Part'),
  ('part-busi-iridium', 'tenant-gps-motor-kediri-01', 'BS-NGK-IR', 'Busi NGK Iridium BKR6EIX', 'Pengapian', 'pcs', 8, 16, 75000, 110000, 'CV Motor Indo'),
  ('part-brake-depan', 'tenant-gps-motor-kediri-01', 'BP-INNOVA-F', 'Kampas Rem Depan Innova Reborn', 'Pengereman', 'set', 3, 6, 210000, 310000, 'PT Sumber Berkah Part'),
  ('part-cleaner-carb', 'tenant-gps-motor-kediri-01', 'CHM-CARB-500', 'Carb & Injector Cleaner 500ml', 'Chemical', 'botol', 6, 18, 25000, 40000, 'CV Kimia Utama')
ON CONFLICT (tenant_id, sku) DO NOTHING;

-- 6. Sample Customer & Vehicle
INSERT INTO customers (id, tenant_id, name, phone, email, address, notes)
VALUES (
  'cust-sampel-01',
  'tenant-gps-motor-kediri-01',
  'Pak Eko Prasetyo',
  '081234567890',
  'eko.prasetyo@example.com',
  'Jl. Dhoho No. 12, Kota Kediri',
  'Pelanggan langganan servis berkala'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO vehicles (id, tenant_id, customer_id, plate_number, brand, model, year, color)
VALUES (
  'veh-sampel-01',
  'tenant-gps-motor-kediri-01',
  'cust-sampel-01',
  'AG 1822 AB',
  'Toyota',
  'Avanza 1.3 G',
  2019,
  'Hitam Metalik'
) ON CONFLICT (id) DO NOTHING;

-- 7. Sample Repair Order (Untuk pengujian cek status pelacakan)
INSERT INTO repair_orders (
  id, tenant_id, ro_number, tracking_token, customer_id,
  plate_number, customer_name, customer_phone,
  car_brand, car_model, car_year, car_color, odometer_in,
  entry_date, complaint, mechanic_name, status,
  service_fee, sparepart_fee, discount, total_cost,
  estimated_completion, notes
) VALUES (
  'ro-demo-001',
  'tenant-gps-motor-kediri-01',
  'RO-2026-0001',
  'token-tracking-demo-001',
  'cust-sampel-01',
  'AG 1822 AB',
  'Pak Eko Prasetyo',
  '081234567890',
  'Toyota',
  'Avanza 1.3 G',
  2019,
  'Hitam Metalik',
  48500,
  CURRENT_DATE::text,
  'Mesin brebet saat akselerasi, tarikan berat, dan minta ganti oli berkala 50.000 KM.',
  'Mas Agus Mekanik',
  'PENGERJAAN',
  150000,
  405000,
  0,
  555000,
  CURRENT_DATE::text,
  'Kendaraan sedang dikerjakan di pit 2'
) ON CONFLICT (id) DO NOTHING;

-- Status logs for sample RO
INSERT INTO ro_status_logs (id, tenant_id, repair_order_id, previous_status, new_status, notes, actor_name)
VALUES
  ('log-01', 'tenant-gps-motor-kediri-01', 'ro-demo-001', NULL, 'MASUK', 'Kendaraan diterima di meja kasir', 'Kasir'),
  ('log-02', 'tenant-gps-motor-kediri-01', 'ro-demo-001', 'MASUK', 'DIAGNOSA', 'Scan OBD2 dan cek busi serta throttle body', 'Mas Agus Mekanik'),
  ('log-03', 'tenant-gps-motor-kediri-01', 'ro-demo-001', 'DIAGNOSA', 'PENGERJAAN', 'Tune up injeksi, bersihkan throttle body, dan kuras oli mesin', 'Mas Agus Mekanik')
ON CONFLICT (id) DO NOTHING;

-- Spareparts used in sample RO
INSERT INTO ro_spareparts (id, tenant_id, repair_order_id, sparepart_id, item_name, quantity, unit_price, subtotal)
VALUES
  ('ro-part-01', 'tenant-gps-motor-kediri-01', 'ro-demo-001', 'part-oli-tmo-01', 'Oli Mesin TMO 10W-40 (4L)', 1, 360000, 360000),
  ('ro-part-02', 'tenant-gps-motor-kediri-01', 'ro-demo-001', 'part-filter-avanza', 'Filter Oli Avanza / Xenia Original', 1, 45000, 45000)
ON CONFLICT (id) DO NOTHING;

-- Photos used in sample RO (Before, Progress, After)
INSERT INTO ro_photos (id, tenant_id, repair_order_id, photo_url, stage, caption)
VALUES
  ('photo-demo-01', 'tenant-gps-motor-kediri-01', 'ro-demo-001', '/images/before-after/spark-plug-worn.jpg', 'BEFORE', 'Kondisi busi lama mengalami kerak karbon hitam & celah elektroda aus di atas batas toleransi.'),
  ('photo-demo-02', 'tenant-gps-motor-kediri-01', 'ro-demo-001', '/images/gallery/facility-scanner.jpg', 'PROGRESS', 'Pembersihan throttle body dengan injector cleaner dan scan live data sensor menggunakan scanner OBD2.'),
  ('photo-demo-03', 'tenant-gps-motor-kediri-01', 'ro-demo-001', '/images/before-after/spark-plug-new.jpg', 'AFTER', 'Pemasangan 4x Busi NGK Iridium baru dan penggantian filter oli original selesai.')
ON CONFLICT (id) DO NOTHING;

