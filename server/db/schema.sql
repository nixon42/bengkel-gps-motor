-- Bengkel Mobil GPS Motor Kediri - Relational Database Schema (SQLite)
-- Multi-Tenant Isolation with Discriminator (tenant_id)

-- 1. Tenants (Workshop Workspaces)
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone_wa TEXT NOT NULL,
  business_hours TEXT DEFAULT 'Senin - Sabtu: 08:00 - 17:00 WIB',
  logo_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);

-- 2. Users (Operators linked to Tenant)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  google_id TEXT,
  auth_provider TEXT NOT NULL DEFAULT 'mock', -- 'mock' | 'google'
  role TEXT NOT NULL DEFAULT 'operator',
  last_login_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, email)
);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_tenant_email ON users(tenant_id, email);

-- Sessions (Active user sessions)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_tenant ON sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- 3. Tenant Settings (Workshop Config & Financial Targets)
CREATE TABLE IF NOT EXISTS tenant_settings (
  tenant_id TEXT PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  monthly_revenue_target REAL NOT NULL DEFAULT 15000000,
  invoice_footer TEXT DEFAULT 'Terima kasih telah mempercayakan kendaraan Anda pada Bengkel GPS Motor Kediri.',
  auto_print_invoice INTEGER NOT NULL DEFAULT 0,
  notify_wa INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Compatibility view for tenant_financial_settings
CREATE VIEW IF NOT EXISTS tenant_financial_settings AS 
SELECT tenant_id, monthly_revenue_target, updated_at FROM tenant_settings;

-- 4. Customers (CRM)
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_customers_tenant_phone ON customers(tenant_id, phone);
CREATE INDEX IF NOT EXISTS idx_customers_tenant_name ON customers(tenant_id, name);

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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_vehicles_tenant_plate ON vehicles(tenant_id, plate_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_tenant_customer ON vehicles(tenant_id, customer_id);

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
  buy_price REAL NOT NULL DEFAULT 0,
  sell_price REAL NOT NULL DEFAULT 0,
  supplier TEXT,
  photo_url TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, sku)
);
CREATE INDEX IF NOT EXISTS idx_spareparts_tenant_search ON spareparts(tenant_id, category, name);
CREATE INDEX IF NOT EXISTS idx_spareparts_tenant_stock ON spareparts(tenant_id, stock, min_stock);
CREATE INDEX IF NOT EXISTS idx_spareparts_tenant_sku ON spareparts(tenant_id, sku);

-- 7. Stock Movements (Mutasi Stok: In, Out, Adjustment)
CREATE TABLE IF NOT EXISTS stock_movements (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sparepart_id TEXT NOT NULL REFERENCES spareparts(id) ON DELETE RESTRICT,
  type TEXT NOT NULL CHECK(type IN ('IN', 'OUT', 'ADJUSTMENT')),
  quantity INTEGER NOT NULL,
  unit_price REAL DEFAULT 0,
  total_price REAL DEFAULT 0,
  date TEXT NOT NULL, -- ISO Date YYYY-MM-DD
  supplier TEXT,
  invoice_number TEXT,
  notes TEXT,
  proof_photo_url TEXT,
  repair_order_id TEXT, -- Nullable linkage to RO
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_movements_tenant_part ON stock_movements(tenant_id, sparepart_id, date);
CREATE INDEX IF NOT EXISTS idx_movements_tenant_date ON stock_movements(tenant_id, date DESC);

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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_opname_tenant_date ON stock_opnames(tenant_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_opname_tenant_part ON stock_opnames(tenant_id, sparepart_id);

-- 9. Transaction Categories (Custom Cashbook Categories)
CREATE TABLE IF NOT EXISTS transaction_categories (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('INCOME', 'EXPENSE')),
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, name, type)
);
CREATE INDEX IF NOT EXISTS idx_categories_tenant ON transaction_categories(tenant_id, type);

-- 10. Transactions (Financial Ledger / Buku Kas)
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES transaction_categories(id) ON DELETE RESTRICT,
  type TEXT NOT NULL CHECK(type IN ('INCOME', 'EXPENSE')),
  amount REAL NOT NULL,
  date TEXT NOT NULL, -- YYYY-MM-DD
  description TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK(payment_method IN ('CASH', 'TRANSFER', 'QRIS')),
  receipt_url TEXT,
  repair_order_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_date ON transactions(tenant_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_type ON transactions(tenant_id, type, date);
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_category ON transactions(tenant_id, category_id);

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
  service_fee REAL NOT NULL DEFAULT 0,
  sparepart_fee REAL NOT NULL DEFAULT 0,
  discount REAL NOT NULL DEFAULT 0,
  total_cost REAL NOT NULL DEFAULT 0,
  estimated_completion TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ro_logs_order ON ro_status_logs(repair_order_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_ro_logs_tenant ON ro_status_logs(tenant_id, repair_order_id);

-- 13. RO Photos (Before / Progress / After)
CREATE TABLE IF NOT EXISTS ro_photos (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  repair_order_id TEXT NOT NULL REFERENCES repair_orders(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  stage TEXT NOT NULL CHECK(stage IN ('BEFORE', 'PROGRESS', 'AFTER')),
  caption TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ro_photos_order ON ro_photos(repair_order_id, stage);
CREATE INDEX IF NOT EXISTS idx_ro_photos_tenant ON ro_photos(tenant_id, repair_order_id);

-- 14. RO Spareparts (Attached to Repair Orders)
CREATE TABLE IF NOT EXISTS ro_spareparts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  repair_order_id TEXT NOT NULL REFERENCES repair_orders(id) ON DELETE CASCADE,
  sparepart_id TEXT NOT NULL REFERENCES spareparts(id) ON DELETE RESTRICT,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  subtotal REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ro_spareparts_order ON ro_spareparts(repair_order_id);
CREATE INDEX IF NOT EXISTS idx_ro_spareparts_tenant ON ro_spareparts(tenant_id, repair_order_id);

-- Compatibility view for sparepart_usages
CREATE VIEW IF NOT EXISTS sparepart_usages AS SELECT * FROM ro_spareparts;
