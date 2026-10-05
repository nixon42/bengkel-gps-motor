import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCHEMA_PATH = path.join(__dirname, 'schema.sql');
const DEFAULT_DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/bengkel.db');

let activeDb = null;

export function initDatabase(dbPath = DEFAULT_DB_PATH) {
  if (dbPath !== ':memory:') {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new Database(dbPath);

  // Apply pragmas
  db.pragma('foreign_keys = ON');
  if (dbPath !== ':memory:') {
    db.pragma('journal_mode = WAL');
  }
  db.pragma('busy_timeout = 5000');
  db.pragma('synchronous = NORMAL');

  // Execute schema
  const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schemaSql);

  // Safe idempotent migration for last_login_at column on existing databases
  try {
    db.exec(`ALTER TABLE users ADD COLUMN last_login_at DATETIME;`);
  } catch {
    // Column already exists, ignore
  }

  // Ensure default tenant and seed exist
  ensureDefaultSeed(db);

  // Cleanup expired sessions — run once at startup, then every hour
  const cleanupExpiredSessions = () => {
    try {
      const result = db.prepare(`DELETE FROM sessions WHERE expires_at <= datetime('now')`).run();
      if (result.changes > 0) {
        console.log(`[DB] Cleaned up ${result.changes} expired session(s)`);
      }
    } catch (err) {
      console.error('[DB] Session cleanup error:', err.message);
    }
  };
  cleanupExpiredSessions();
  if (dbPath !== ':memory:') {
    // Don't schedule interval for test in-memory DBs
    setInterval(cleanupExpiredSessions, 60 * 60 * 1000).unref();
  }

  activeDb = db;
  return db;
}

export function getDatabase(dbPath) {
  if (!activeDb || dbPath) {
    return initDatabase(dbPath || DEFAULT_DB_PATH);
  }
  return activeDb;
}

function ensureDefaultSeed(db) {
  const seedTransaction = db.transaction(() => {
    // 1. Default Tenant
    let tenant = db.prepare('SELECT * FROM tenants WHERE slug = ?').get('bengkel-gps-motor');
    if (!tenant) {
      const tenantId = crypto.randomUUID();
      db.prepare(`
        INSERT INTO tenants (id, slug, name, address, phone_wa, business_hours)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        tenantId,
        'bengkel-gps-motor',
        'Bengkel Mobil GPS Motor Kediri',
        'Sambiresik, Kec. Gampengrejo, Kab. Kediri, Jawa Timur',
        '0856-0330-7330',
        'Senin - Sabtu: 08:00 - 17:00 WIB'
      );
      tenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(tenantId);
    }

    // 2. Default Tenant Settings
    const settings = db.prepare('SELECT * FROM tenant_settings WHERE tenant_id = ?').get(tenant.id);
    if (!settings) {
      db.prepare(`
        INSERT INTO tenant_settings (tenant_id, monthly_revenue_target, invoice_footer, auto_print_invoice, notify_wa)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        tenant.id,
        15000000,
        'Terima kasih telah mempercayakan kendaraan Anda pada Bengkel GPS Motor Kediri.',
        0,
        1
      );
    }

    // 3. Default Admin User
    let user = db.prepare('SELECT * FROM users WHERE tenant_id = ? AND email = ?').get(tenant.id, 'admin@gpsmotor.local');
    if (!user) {
      const userId = crypto.randomUUID();
      db.prepare(`
        INSERT INTO users (id, tenant_id, email, name, role, auth_provider)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        tenant.id,
        'admin@gpsmotor.local',
        'Bambang GPS Motor',
        'operator',
        'mock'
      );
    }

    // 4. Default Categories
    const defaultCategories = [
      { name: 'Jasa Servis', type: 'INCOME' },
      { name: 'Penjualan Sparepart', type: 'INCOME' },
      { name: 'Pendapatan Lain-lain', type: 'INCOME' },
      { name: 'Beli Sparepart / Stok', type: 'EXPENSE' },
      { name: 'Listrik, Air & Internet', type: 'EXPENSE' },
      { name: 'Sewa Tempat & Bangunan', type: 'EXPENSE' },
      { name: 'Gaji Mekanik & Karyawan', type: 'EXPENSE' },
      { name: 'Tools & Perlengkapan Bengkel', type: 'EXPENSE' },
      { name: 'Operasional Lain-lain', type: 'EXPENSE' }
    ];

    const checkCat = db.prepare('SELECT id FROM transaction_categories WHERE tenant_id = ? AND name = ? AND type = ?');
    const insertCat = db.prepare(`
      INSERT INTO transaction_categories (id, tenant_id, name, type, is_default)
      VALUES (?, ?, ?, ?, 1)
    `);

    for (const cat of defaultCategories) {
      const existing = checkCat.get(tenant.id, cat.name, cat.type);
      if (!existing) {
        insertCat.run(crypto.randomUUID(), tenant.id, cat.name, cat.type);
      }
    }

    // 5. Default Sample Sparepart & Repair Order (For public tracking & immediate interactivity)
    let partBusi = db.prepare('SELECT id FROM spareparts WHERE tenant_id = ? AND sku = ?').get(tenant.id, 'IGN-BUSI-NGK-IR');
    if (!partBusi) {
      const partId = crypto.randomUUID();
      db.prepare(`
        INSERT INTO spareparts (id, tenant_id, sku, name, category, unit, min_stock, stock, buy_price, sell_price, photo_url)
        VALUES (?, ?, 'IGN-BUSI-NGK-IR', 'Busi Iridium NGK Laser CPR6EAIX-9S', 'Busi', 'pcs', 6, 24, 45000, 75000, '/uploads/inventory/ngk-iridium.jpg')
      `).run(partId, tenant.id);
      partBusi = { id: partId };
    }

    let sampleRo = db.prepare('SELECT id FROM repair_orders WHERE tenant_id = ? AND plate_number = ?').get(tenant.id, 'AG 1822 AB');
    if (!sampleRo) {
      const roId = 'ro-seed-avanza-1822';
      const token = 'token-avanza-1822';
      db.prepare(`
        INSERT INTO repair_orders (
          id, tenant_id, ro_number, tracking_token, plate_number, customer_name, customer_phone,
          car_brand, car_model, car_year, car_color, odometer_in, entry_date, complaint,
          mechanic_name, status, service_fee, sparepart_fee, total_cost, estimated_completion, notes
        ) VALUES (
          ?, ?, 'RO-202610-001', ?, 'AG 1822 AB', 'Joko Widodo', '081234567890',
          'Toyota', 'Avanza 1.3 G', 2019, 'Hitam Metalik', 65420, '2026-10-04',
          'Mesin brebet saat akselerasi dan AC terasa kurang dingin saat siang hari',
          'Mas Agus Santoso', 'PENGERJAAN', 150000, 300000, 450000, '2026-10-04 16:30',
          'Sedang dilakukan penggantian 4 busi iridium dan pembersihan intake manifold.'
        )
      `).run(roId, tenant.id, token);

      db.prepare(`
        INSERT INTO ro_status_logs (id, tenant_id, repair_order_id, previous_status, new_status, notes, actor_name)
        VALUES (?, ?, ?, NULL, 'MASUK', 'Kendaraan diterima oleh Service Advisor, pencatatan keluhan awal', 'Bambang GPS Motor'),
               (?, ?, ?, 'MASUK', 'DIAGNOSA', 'Hasil scanner OBD2: misfire silinder 2, busi aus, filter kotor', 'Mas Agus Santoso'),
               (?, ?, ?, 'DIAGNOSA', 'PENGERJAAN', 'Mulai pengerjaan tune up, ganti busi iridium, dan kalibrasi injeksi', 'Mas Agus Santoso')
      `).run(
        crypto.randomUUID(), tenant.id, roId,
        crypto.randomUUID(), tenant.id, roId,
        crypto.randomUUID(), tenant.id, roId
      );

      db.prepare(`
        INSERT INTO ro_photos (id, tenant_id, repair_order_id, photo_url, stage, caption)
        VALUES (?, ?, ?, '/uploads/ro/engine-check.jpg', 'BEFORE', 'Kondisi awal ruang mesin dan filter udara kotor'),
               (?, ?, ?, '/uploads/ro/spark-plugs.jpg', 'PROGRESS', 'Proses penggantian 4 busi iridium baru & kalibrasi celah elektroda')
      `).run(
        crypto.randomUUID(), tenant.id, roId,
        crypto.randomUUID(), tenant.id, roId
      );

      db.prepare(`
        INSERT INTO ro_spareparts (id, tenant_id, repair_order_id, sparepart_id, item_name, quantity, unit_price, subtotal)
        VALUES (?, ?, ?, ?, 'Busi Iridium NGK Laser CPR6EAIX-9S', 4, 75000, 300000)
      `).run(
        crypto.randomUUID(), tenant.id, roId, partBusi.id
      );
    }
  });

  seedTransaction();
}

export default {
  initDatabase,
  getDatabase
};
