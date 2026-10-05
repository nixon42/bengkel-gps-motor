import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDatabase } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function runSeed(customDb) {
  const db = customDb || getDatabase();
  console.log('🌱 Starting comprehensive database seeding for Bengkel Mobil GPS Motor Kediri...');

  const seedTransaction = db.transaction(() => {
    // ----------------------------------------------------
    // 1. Seed Tenants
    // Ensure primary tenant (bengkel-gps-motor)
    // ----------------------------------------------------
    let existingTenant = db.prepare('SELECT * FROM tenants WHERE slug IN (?, ?)').get('bengkel-gps-motor', 'gps-motor');
    
    let tenantId;
    if (existingTenant) {
      tenantId = existingTenant.id;
      db.prepare(`
        UPDATE tenants 
        SET name = ?, address = ?, phone_wa = ?, business_hours = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        'Bengkel Mobil GPS Motor Kediri',
        'Jl. Raya Sambiresik No. 45, Kec. Gampengrejo, Kab. Kediri, Jawa Timur',
        '085603307330',
        'Senin - Sabtu: 08:00 - 17:00 WIB',
        tenantId
      );
    } else {
      tenantId = 'tenant-gps-motor-kediri-01';
      db.prepare(`
        INSERT INTO tenants (id, slug, name, address, phone_wa, business_hours)
        VALUES (?, 'bengkel-gps-motor', 'Bengkel Mobil GPS Motor Kediri', 'Jl. Raya Sambiresik No. 45, Kec. Gampengrejo, Kab. Kediri, Jawa Timur', '085603307330', 'Senin - Sabtu: 08:00 - 17:00 WIB')
      `).run(tenantId);
    }

    // Ensure tenant_settings
    db.prepare(`
      INSERT INTO tenant_settings (tenant_id, monthly_revenue_target, invoice_footer, auto_print_invoice, notify_wa)
      VALUES (?, 15000000, 'Terima kasih telah mempercayakan kendaraan Anda pada Bengkel GPS Motor Kediri.', 0, 1)
      ON CONFLICT(tenant_id) DO UPDATE SET 
        monthly_revenue_target = 15000000,
        invoice_footer = 'Terima kasih telah mempercayakan kendaraan Anda pada Bengkel GPS Motor Kediri.'
    `).run(tenantId);

    // ----------------------------------------------------
    // 2. Admin Users
    // ----------------------------------------------------
    const usersToSeed = [
      { email: 'admin@gpsmotor.id', name: 'Super Admin', role: 'admin' },
      { email: 'admin@gpsmotor.local', name: 'Bambang GPS Motor', role: 'operator' }
    ];

    for (const u of usersToSeed) {
      const existingUser = db.prepare('SELECT id FROM users WHERE tenant_id = ? AND email = ?').get(tenantId, u.email);
      if (!existingUser) {
        db.prepare(`
          INSERT INTO users (id, tenant_id, email, name, role, auth_provider)
          VALUES (?, ?, ?, ?, ?, 'mock')
        `).run(crypto.randomUUID(), tenantId, u.email, u.name, u.role);
      }
    }

    // ----------------------------------------------------
    // 3. Default Transaction Categories
    // ----------------------------------------------------
    const categories = [
      { id: 'cat-income-servis', name: 'Jasa Servis', type: 'INCOME' },
      { id: 'cat-income-parts', name: 'Penjualan Sparepart', type: 'INCOME' },
      { id: 'cat-income-other', name: 'Pendapatan Lain-lain', type: 'INCOME' },
      { id: 'cat-expense-parts', name: 'Beli Sparepart / Stok', type: 'EXPENSE' },
      { id: 'cat-expense-util', name: 'Listrik, Air & Internet', type: 'EXPENSE' },
      { id: 'cat-expense-rent', name: 'Sewa Tempat & Bangunan', type: 'EXPENSE' },
      { id: 'cat-expense-wages', name: 'Gaji Mekanik & Karyawan', type: 'EXPENSE' },
      { id: 'cat-expense-tools', name: 'Tools & Perlengkapan Bengkel', type: 'EXPENSE' },
      { id: 'cat-expense-ops', name: 'Operasional Lain-lain', type: 'EXPENSE' }
    ];

    const categoryMap = {};
    for (const cat of categories) {
      let catRow = db.prepare('SELECT id FROM transaction_categories WHERE tenant_id = ? AND name = ? AND type = ?')
        .get(tenantId, cat.name, cat.type);
      if (!catRow) {
        const catId = crypto.randomUUID();
        db.prepare(`
          INSERT INTO transaction_categories (id, tenant_id, name, type, is_default)
          VALUES (?, ?, ?, ?, 1)
        `).run(catId, tenantId, cat.name, cat.type);
        categoryMap[cat.name] = catId;
      } else {
        categoryMap[cat.name] = catRow.id;
      }
    }

    // ----------------------------------------------------
    // 4. 25 Realistic Spareparts Catalog
    // ----------------------------------------------------
    const sparepartsData = [
      { sku: 'OLI-TMO-10W40', name: 'Oli Mesin TMO 10W-40 Synthetic 4L', category: 'Oli & Cairan', unit: 'galon', min_stock: 4, stock: 12, buy: 240000, sell: 320000, supplier: 'PT Toyota Astra Motor' },
      { sku: 'OLI-SHL-HX7-4L', name: 'Oli Shell Helix HX7 10W-40 4L', category: 'Oli & Cairan', unit: 'galon', min_stock: 5, stock: 16, buy: 260000, sell: 345000, supplier: 'Distributor Shell Kediri', photo: '/uploads/inventory/shell-helix-hx7.jpg' },
      { sku: 'OLI-CAS-5W30-4L', name: 'Oli Castrol Magnatec Stop-Start 5W-30 4L', category: 'Oli & Cairan', unit: 'galon', min_stock: 3, stock: 8, buy: 330000, sell: 420000, supplier: 'Distributor Castrol Jatim', photo: '/uploads/inventory/shell-helix-hx7.jpg' },
      { sku: 'FLT-AVZ-DENSO', name: 'Filter Oli Toyota Avanza / Xenia Denso', category: 'Filter', unit: 'pcs', min_stock: 10, stock: 28, buy: 22000, sell: 38000, supplier: 'Denso Authorized Partner', photo: '/uploads/inventory/filter-oli-denso.jpg' },
      { sku: 'FLT-HND-ORIG', name: 'Filter Oli Honda Brio / Mobilio Original', category: 'Filter', unit: 'pcs', min_stock: 6, stock: 18, buy: 35000, sell: 55000, supplier: 'Honda Genuine Parts', photo: '/uploads/inventory/filter-oli-denso.jpg' },
      { sku: 'FLT-SZK-ERTIGA', name: 'Filter Oli Suzuki Ertiga SGP', category: 'Filter', unit: 'pcs', min_stock: 5, stock: 14, buy: 28000, sell: 45000, supplier: 'Suzuki Genuine Parts Kediri', photo: '/uploads/inventory/filter-oli-denso.jpg' },
      { sku: 'FLT-UDR-AVANZA', name: 'Filter Udara Sakura Avanza Dual VVT-i', category: 'Filter', unit: 'pcs', min_stock: 4, stock: 10, buy: 48000, sell: 75000, supplier: 'Sakura Filter Distributor', photo: '/uploads/inventory/filter-oli-denso.jpg' },
      { sku: 'FLT-AC-CARBON', name: 'Filter Kabin AC Sakura Bio-Carbon Avanza', category: 'Filter', unit: 'pcs', min_stock: 4, stock: 8, buy: 42000, sell: 65000, supplier: 'Sakura Filter Distributor', photo: '/uploads/inventory/filter-oli-denso.jpg' },
      { sku: 'IGN-BUSI-NGK-IR', name: 'Busi Iridium NGK Laser CPR6EAIX-9S', category: 'Busi', unit: 'pcs', min_stock: 8, stock: 32, buy: 45000, sell: 75000, supplier: 'NGK Spark Plugs Indonesia', photo: '/uploads/inventory/ngk-iridium.jpg' },
      { sku: 'IGN-BUSI-IK20', name: 'Busi Denso Iridium Power IK20', category: 'Busi', unit: 'pcs', min_stock: 8, stock: 24, buy: 55000, sell: 90000, supplier: 'Denso Authorized Partner', photo: '/uploads/inventory/ngk-iridium.jpg' },
      { sku: 'BRK-BDX-AVZ-FRT', name: 'Kampas Rem Depan Bendix General CT Avanza', category: 'Rem', unit: 'set', min_stock: 3, stock: 7, buy: 185000, sell: 260000, supplier: 'Bendix Brakes Official', photo: '/uploads/inventory/kampas-rem-bendix.jpg' },
      { sku: 'BRK-MK-TRM-AVZ', name: 'Kampas Rem Belakang Tromol MK Kashiyama', category: 'Rem', unit: 'set', min_stock: 3, stock: 5, buy: 135000, sell: 195000, supplier: 'Kashiyama Brake Center', photo: '/uploads/inventory/kampas-rem-bendix.jpg' },
      { sku: 'BRK-DOT4-300ML', name: 'Minyak Rem Prestone DOT 4 (300ml)', category: 'Oli & Cairan', unit: 'botol', min_stock: 6, stock: 15, buy: 24000, sell: 38000, supplier: 'Prestone Indonesia', photo: '/uploads/inventory/shell-helix-hx7.jpg' },
      { sku: 'CLT-PRS-GRN-4L', name: 'Air Radiator Coolant Prestone Hijau 4L', category: 'Pendingin', unit: 'galon', min_stock: 4, stock: 11, buy: 75000, sell: 110000, supplier: 'Prestone Indonesia' },
      { sku: 'BELT-6PK1810', name: 'Fan Belt / V-Belt Gates 6PK1810 Avanza', category: 'Mesin', unit: 'pcs', min_stock: 3, stock: 6, buy: 85000, sell: 130000, supplier: 'Gates Power Transmission' },
      { sku: 'SUS-LNK-555-AVZ', name: 'Link Stabilizer Depan 555 Japan Avanza', category: 'Kaki-kaki', unit: 'set', min_stock: 2, stock: 4, buy: 210000, sell: 295000, supplier: 'Sankei 555 Japan', photo: '/uploads/inventory/shock-kayaba.jpg' },
      { sku: 'SUS-BLJ-555-AVZ', name: 'Ball Joint Bawah 555 Japan Avanza', category: 'Kaki-kaki', unit: 'set', min_stock: 2, stock: 2, buy: 230000, sell: 320000, supplier: 'Sankei 555 Japan', photo: '/uploads/inventory/shock-kayaba.jpg' },
      { sku: 'SHK-KYB-EXC-AVZ', name: 'Shockbreaker Depan Kayaba Excel-G Avanza', category: 'Kaki-kaki', unit: 'set', min_stock: 2, stock: 3, buy: 980000, sell: 1350000, supplier: 'Kayaba Indonesia', photo: '/uploads/inventory/shock-kayaba.jpg' },
      { sku: 'WPR-BSC-2016', name: 'Wiper Blade Bosch Advantage 20" + 16" Set', category: 'Aksesoris', unit: 'set', min_stock: 5, stock: 12, buy: 65000, sell: 95000, supplier: 'Bosch Automotive Aftermarket' },
      { sku: 'AKI-GS-NS40ZL', name: 'Aki Mobil GS Astra Hybrid NS40ZL (35Ah)', category: 'Kelistrikan', unit: 'unit', min_stock: 2, stock: 1, buy: 680000, sell: 875000, supplier: 'GS Astra Kediri', photo: '/uploads/inventory/aki-gs-astra.jpg' },
      { sku: 'LMP-H4-OSRAM', name: 'Bohlam Lampu Depan Osram All Season H4 12V', category: 'Kelistrikan', unit: 'set', min_stock: 4, stock: 9, buy: 95000, sell: 145000, supplier: 'Osram Lighting Indonesia' },
      { sku: 'TRN-RORED-1L', name: 'Oli Transmisi Manual Pertamina Rored 80W-90 1L', category: 'Oli & Cairan', unit: 'botol', min_stock: 6, stock: 18, buy: 48000, sell: 68000, supplier: 'Pertamina Lubricants', photo: '/uploads/inventory/shell-helix-hx7.jpg' },
      { sku: 'CHM-BRK-CLN-500', name: 'Brake Cleaner Wurth Aerosol 500ml', category: 'Chemical', unit: 'kaleng', min_stock: 5, stock: 14, buy: 42000, sell: 65000, supplier: 'Wurth Indonesia' },
      { sku: 'GSK-KLEP-AVZ', name: 'Gasket Paking Tutup Klep Toyota Avanza', category: 'Mesin', unit: 'pcs', min_stock: 3, stock: 5, buy: 55000, sell: 85000, supplier: 'Toyota Genuine Parts' },
      { sku: 'SEL-KRUKAS-FRT', name: 'Seal Kruk As Depan Nok Japan Avanza', category: 'Mesin', unit: 'pcs', min_stock: 3, stock: 0, buy: 35000, sell: 60000, supplier: 'NOK Seals Distributor' }
    ];

    const partMap = {};
    const insertPartStmt = db.prepare(`
      INSERT INTO spareparts (id, tenant_id, sku, name, category, unit, min_stock, stock, buy_price, sell_price, supplier, photo_url, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      ON CONFLICT(tenant_id, sku) DO UPDATE SET
        name = excluded.name,
        category = excluded.category,
        unit = excluded.unit,
        min_stock = excluded.min_stock,
        stock = excluded.stock,
        buy_price = excluded.buy_price,
        sell_price = excluded.sell_price,
        supplier = excluded.supplier,
        photo_url = COALESCE(excluded.photo_url, spareparts.photo_url)
    `);

    for (const p of sparepartsData) {
      let partRow = db.prepare('SELECT id FROM spareparts WHERE tenant_id = ? AND sku = ?').get(tenantId, p.sku);
      const partId = partRow ? partRow.id : crypto.randomUUID();
      insertPartStmt.run(partId, tenantId, p.sku, p.name, p.category, p.unit, p.min_stock, p.stock, p.buy, p.sell, p.supplier, p.photo || null);
      partMap[p.sku] = partId;
    }

    // ----------------------------------------------------
    // 5. 7 Customers & Registered Vehicles
    // ----------------------------------------------------
    const customersData = [
      {
        id: 'cust-joko-widodo',
        name: 'Joko Widodo',
        phone: '081234567890',
        email: 'joko.kediri@gmail.com',
        address: 'Jl. Panglima Sudirman No. 12, Kota Kediri',
        notes: 'Pelanggan rutin servis berkala Avanza',
        vehicle: { plate: 'AG 1822 AB', brand: 'Toyota', model: 'Avanza 1.3 G', year: 2019, color: 'Hitam Metalik' }
      },
      {
        id: 'cust-budi-santoso',
        name: 'Budi Santoso',
        phone: '081398765432',
        email: 'budi.santoso@yahoo.com',
        address: 'Jl. Dhoho No. 88, Kota Kediri',
        notes: 'Suka request sparepart original / Bendix',
        vehicle: { plate: 'AG 1234 CD', brand: 'Honda', model: 'Brio Satya E', year: 2021, color: 'Putih Mutiara' }
      },
      {
        id: 'cust-siti-aminah',
        name: 'Siti Aminah',
        phone: '085712349988',
        email: 'siti.aminah@gmail.com',
        address: 'Jl. Hayam Wuruk No. 15, Kediri',
        notes: 'Mobil operasional keluarga',
        vehicle: { plate: 'AG 8899 EF', brand: 'Daihatsu', model: 'Sigra 1.2 R DLX', year: 2020, color: 'Silver Metalik' }
      },
      {
        id: 'cust-hendra-prasetyo',
        name: 'Hendra Prasetyo',
        phone: '082155667788',
        email: 'hendra.p@perusahaan.co.id',
        address: 'Jl. Mayor Bismo No. 40, Gampengrejo, Kediri',
        notes: 'Mobil sering luar kota Kediri - Surabaya',
        vehicle: { plate: 'AG 4567 GH', brand: 'Mitsubishi', model: 'Xpander Ultimate', year: 2022, color: 'Abu-abu Metalik' }
      },
      {
        id: 'cust-rahmat-hidayat',
        name: 'Rahmat Hidayat',
        phone: '081288776655',
        email: 'rahmat.hidayat@outlook.com',
        address: 'Jl. Kapten Tendean No. 102, Ngronggo, Kediri',
        notes: 'Rutin ganti oli setiap 5.000 KM',
        vehicle: { plate: 'AG 2345 IJ', brand: 'Suzuki', model: 'Ertiga GX', year: 2018, color: 'Burgundy Red' }
      },
      {
        id: 'cust-agus-setiawan',
        name: 'Agus Setiawan',
        phone: '087811223344',
        email: 'agus.setiawan@gmail.com',
        address: 'Jl. Veteran No. 5, Mojoroto, Kediri',
        notes: 'Prioritas cek sistem pendingin & radiator',
        vehicle: { plate: 'AG 7788 KL', brand: 'Toyota', model: 'Innova Reborn 2.4 V', year: 2020, color: 'Hitam Mica' }
      },
      {
        id: 'cust-dewi-lestari',
        name: 'Dewi Lestari',
        phone: '089677889900',
        email: 'dewi.lestari@gmail.com',
        address: 'Jl. Erlangga No. 23, Katang, Kediri',
        notes: 'Penggantian filter kabin AC rutin',
        vehicle: { plate: 'AG 3456 MN', brand: 'Honda', model: 'HR-V 1.5 E', year: 2019, color: 'Modern Steel' }
      }
    ];

    const customerMap = {};
    const insertCustStmt = db.prepare(`
      INSERT INTO customers (id, tenant_id, name, phone, email, address, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        phone = excluded.phone,
        email = excluded.email,
        address = excluded.address
    `);

    const insertVehicleStmt = db.prepare(`
      INSERT INTO vehicles (id, tenant_id, customer_id, plate_number, brand, model, year, color)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        plate_number = excluded.plate_number,
        brand = excluded.brand,
        model = excluded.model
    `);

    for (const c of customersData) {
      let custRow = db.prepare('SELECT id FROM customers WHERE tenant_id = ? AND phone = ?').get(tenantId, c.phone);
      const custId = custRow ? custRow.id : c.id;
      insertCustStmt.run(custId, tenantId, c.name, c.phone, c.email, c.address, c.notes);
      customerMap[c.name] = custId;

      let vehRow = db.prepare('SELECT id FROM vehicles WHERE tenant_id = ? AND plate_number = ?').get(tenantId, c.vehicle.plate);
      const vehId = vehRow ? vehRow.id : crypto.randomUUID();
      insertVehicleStmt.run(vehId, tenantId, custId, c.vehicle.plate, c.vehicle.brand, c.vehicle.model, c.vehicle.year, c.vehicle.color);
    }

    // ----------------------------------------------------
    // 6. 11 Repair Orders Across ALL 6 Status Stages
    // Stages: MASUK, DIAGNOSA, PENGERJAAN, MENUNGGU_PART, SELESAI, DIAMBIL
    // ----------------------------------------------------
    const today = new Date();
    const formatDate = (daysAgo) => {
      const d = new Date(today);
      d.setDate(d.getDate() - daysAgo);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const repairOrdersData = [
      {
        preferredId: 'ro-seed-avanza-1822',
        ro_number: 'RO-202610-001',
        token: 'token-avanza-1822',
        plate: 'AG 1822 AB',
        customer: 'Joko Widodo',
        phone: '081234567890',
        brand: 'Toyota',
        model: 'Avanza 1.3 G',
        year: 2019,
        color: 'Hitam Metalik',
        odometer: 65420,
        entry_date: formatDate(1),
        complaint: 'Mesin brebet saat akselerasi dan AC terasa kurang dingin saat siang hari',
        mechanic: 'Mas Agus Santoso',
        status: 'PENGERJAAN',
        service_fee: 150000,
        sparepart_fee: 300000,
        total: 450000,
        est_completion: `${formatDate(0)} 17:00`,
        notes: 'Sedang dilakukan penggantian 4 busi iridium dan pembersihan intake manifold.',
        parts: [{ sku: 'IGN-BUSI-NGK-IR', qty: 4, price: 75000 }],
        logs: [
          { status: 'MASUK', prev: null, notes: 'Kendaraan masuk di bengkel, pencatatan keluhan', actor: 'Bambang GPS Motor' },
          { status: 'DIAGNOSA', prev: 'MASUK', notes: 'Diagnosa OBD2: silinder 2 misfire, elektroda busi aus', actor: 'Mas Agus Santoso' },
          { status: 'PENGERJAAN', prev: 'DIAGNOSA', notes: 'Mulai penggantian busi dan pembersihan throttle body', actor: 'Mas Agus Santoso' }
        ],
        photos: [
          { url: '/uploads/ro/engine-check.jpg', stage: 'BEFORE', caption: 'Kondisi awal ruang mesin dan busi lama aus' },
          { url: '/uploads/ro/spark-plugs.jpg', stage: 'PROGRESS', caption: 'Pemasangan busi iridium baru & kalibrasi celah' }
        ]
      },
      {
        preferredId: 'ro-seed-02',
        ro_number: 'RO-202610-002',
        token: 'token-brio-1234',
        plate: 'AG 1234 CD',
        customer: 'Budi Santoso',
        phone: '081398765432',
        brand: 'Honda',
        model: 'Brio Satya E',
        year: 2021,
        color: 'Putih Mutiara',
        odometer: 38200,
        entry_date: formatDate(0),
        complaint: 'Bunyi dengung di roda kiri depan saat kecepatan di atas 60 km/jam',
        mechanic: 'Pak Sugeng Widodo',
        status: 'MASUK',
        service_fee: 100000,
        sparepart_fee: 0,
        total: 100000,
        est_completion: `${formatDate(0)} 16:00`,
        notes: 'Antrean masuk inspeksi roda dan bearing',
        parts: [],
        logs: [
          { status: 'MASUK', prev: null, notes: 'Penerimaan unit Brio Satya keluhan bunyi dengung', actor: 'Bambang GPS Motor' }
        ],
        photos: [
          { url: '/uploads/ro/brio-intake.jpg', stage: 'BEFORE', caption: 'Pemeriksaan fisik awal ban dan kolong roda' }
        ]
      },
      {
        preferredId: 'ro-seed-03',
        ro_number: 'RO-202610-003',
        token: 'token-sigra-8899',
        plate: 'AG 8899 EF',
        customer: 'Siti Aminah',
        phone: '085712349988',
        brand: 'Daihatsu',
        model: 'Sigra 1.2 R DLX',
        year: 2020,
        color: 'Silver Metalik',
        odometer: 52100,
        entry_date: formatDate(1),
        complaint: 'Indikator Check Engine menyala kuning, tarikan gigi 2 agak tersendat',
        mechanic: 'Mas Rudi Hermawan',
        status: 'DIAGNOSA',
        service_fee: 125000,
        sparepart_fee: 0,
        total: 125000,
        est_completion: `${formatDate(0)} 15:00`,
        notes: 'Scanning sensor O2 dan cek filter udara serta soket sensor',
        parts: [],
        logs: [
          { status: 'MASUK', prev: null, notes: 'Unit diterima untuk scanning komputer mesin', actor: 'Bambang GPS Motor' },
          { status: 'DIAGNOSA', prev: 'MASUK', notes: 'Membaca DTC scanner: kode P0135 sensor pemanas O2', actor: 'Mas Rudi Hermawan' }
        ],
        photos: [
          { url: '/uploads/ro/sigra-obd.jpg', stage: 'BEFORE', caption: 'Pembacaan parameter sensor scanner OBD2' }
        ]
      },
      {
        preferredId: 'ro-seed-04',
        ro_number: 'RO-202610-004',
        token: 'token-xpander-4567',
        plate: 'AG 4567 GH',
        customer: 'Hendra Prasetyo',
        phone: '082155667788',
        brand: 'Mitsubishi',
        model: 'Xpander Ultimate',
        year: 2022,
        color: 'Abu-abu Metalik',
        odometer: 44300,
        entry_date: formatDate(2),
        complaint: 'Pedal rem bergetar saat deselerasi dari 80 km/jam, rem bunyi decit',
        mechanic: 'Pak Sugeng Widodo',
        status: 'MENUNGGU_PART',
        service_fee: 175000,
        sparepart_fee: 260000,
        total: 435000,
        est_completion: `${formatDate(1)} 14:00`,
        notes: 'Piringan disc brake sedang dibubut, menunggu kampas rem Bendix khusus Xpander',
        parts: [{ sku: 'BRK-BDX-AVZ-FRT', qty: 1, price: 260000 }],
        logs: [
          { status: 'MASUK', prev: null, notes: 'Penerimaan unit keluhan rem bergetar', actor: 'Bambang GPS Motor' },
          { status: 'DIAGNOSA', prev: 'MASUK', notes: 'Ketebalan disc brake tidak rata 0.15mm, kampas aus tipis', actor: 'Pak Sugeng Widodo' },
          { status: 'MENUNGGU_PART', prev: 'DIAGNOSA', notes: 'Menunggu pengiriman kampas rem dari distributor', actor: 'Pak Sugeng Widodo' }
        ],
        photos: [
          { url: '/uploads/ro/xpander-brake.jpg', stage: 'BEFORE', caption: 'Kondisi disc brake beralur dan kampas tipis' }
        ]
      },
      {
        preferredId: 'ro-seed-05',
        ro_number: 'RO-202610-005',
        token: 'token-ertiga-2345',
        plate: 'AG 2345 IJ',
        customer: 'Rahmat Hidayat',
        phone: '081288776655',
        brand: 'Suzuki',
        model: 'Ertiga GX',
        year: 2018,
        color: 'Burgundy Red',
        odometer: 78900,
        entry_date: formatDate(1),
        complaint: 'Ganti oli mesin 10W-40, kuras air radiator, dan cek fan belt',
        mechanic: 'Mas Agus Santoso',
        status: 'PENGERJAAN',
        service_fee: 90000,
        sparepart_fee: 500000,
        total: 590000,
        est_completion: `${formatDate(0)} 16:30`,
        notes: 'Proses penggantian Oli Shell Helix HX7 4L, filter oli SGP, dan coolant Prestone',
        parts: [
          { sku: 'OLI-SHL-HX7-4L', qty: 1, price: 345000 },
          { sku: 'FLT-SZK-ERTIGA', qty: 1, price: 45000 },
          { sku: 'CLT-PRS-GRN-4L', qty: 1, price: 110000 }
        ],
        logs: [
          { status: 'MASUK', prev: null, notes: 'Penerimaan Ertiga untuk paket perawatan berkala', actor: 'Bambang GPS Motor' },
          { status: 'DIAGNOSA', prev: 'MASUK', notes: 'Pemeriksaan oli lama menghitam, cairan radiator keruh', actor: 'Mas Agus Santoso' },
          { status: 'PENGERJAAN', prev: 'DIAGNOSA', notes: 'Pengurasan radiator dan pengisian oli baru', actor: 'Mas Agus Santoso' }
        ],
        photos: [
          { url: '/uploads/ro/ertiga-oil.jpg', stage: 'BEFORE', caption: 'Kondisi awal sebelum ganti oli dan kuras radiator' },
          { url: '/uploads/ro/ertiga-progress.jpg', stage: 'PROGRESS', caption: 'Pengisian oli Shell HX7 dan flushing radiator' }
        ]
      },
      {
        preferredId: 'ro-seed-06',
        ro_number: 'RO-202610-006',
        token: 'token-innova-7788',
        plate: 'AG 7788 KL',
        customer: 'Agus Setiawan',
        phone: '087811223344',
        brand: 'Toyota',
        model: 'Innova Reborn 2.4 V',
        year: 2020,
        color: 'Hitam Mica',
        odometer: 89400,
        entry_date: formatDate(3),
        complaint: 'Suhu mesin naik saat macet, kipas ekstra radiator berputar lemah',
        mechanic: 'Mas Rudi Hermawan',
        status: 'MENUNGGU_PART',
        service_fee: 250000,
        sparepart_fee: 110000,
        total: 360000,
        est_completion: `${formatDate(1)} 17:00`,
        notes: 'Menunggu motor fan radiator pengganti dan relay kipas',
        parts: [{ sku: 'CLT-PRS-GRN-4L', qty: 1, price: 110000 }],
        logs: [
          { status: 'MASUK', prev: null, notes: 'Keluhan temperatur mesin naik saat macet', actor: 'Bambang GPS Motor' },
          { status: 'DIAGNOSA', prev: 'MASUK', notes: 'Motor fan radiator mati di putaran high speed', actor: 'Mas Rudi Hermawan' },
          { status: 'MENUNGGU_PART', prev: 'DIAGNOSA', notes: 'Menunggu sparepart motor fan denso', actor: 'Mas Rudi Hermawan' }
        ],
        photos: [
          { url: '/uploads/ro/innova-fan.jpg', stage: 'BEFORE', caption: 'Pemeriksaan tegangan soket motor fan' }
        ]
      },
      {
        preferredId: 'ro-seed-07',
        ro_number: 'RO-202610-007',
        token: 'token-hrv-3456',
        plate: 'AG 3456 MN',
        customer: 'Dewi Lestari',
        phone: '089677889900',
        brand: 'Honda',
        model: 'HR-V 1.5 E',
        year: 2019,
        color: 'Modern Steel',
        odometer: 41200,
        entry_date: formatDate(1),
        complaint: 'Servis berkala 40.000 KM: Tune up, ganti oli mesin, filter AC kabin, dan minyak rem',
        mechanic: 'Mas Agus Santoso',
        status: 'SELESAI',
        service_fee: 220000,
        sparepart_fee: 578000,
        total: 798000,
        est_completion: `${formatDate(0)} 12:00`,
        notes: 'Pengerjaan servis berkala selesai 100%, siap serah terima kendaraan',
        parts: [
          { sku: 'OLI-CAS-5W30-4L', qty: 1, price: 420000 },
          { sku: 'FLT-HND-ORIG', qty: 1, price: 55000 },
          { sku: 'FLT-AC-CARBON', qty: 1, price: 65000 },
          { sku: 'BRK-DOT4-300ML', qty: 1, price: 38000 }
        ],
        logs: [
          { status: 'MASUK', prev: null, notes: 'Unit masuk untuk paket servis 40.000 KM', actor: 'Bambang GPS Motor' },
          { status: 'DIAGNOSA', prev: 'MASUK', notes: 'Checksheet 25 titik inspeksi', actor: 'Mas Agus Santoso' },
          { status: 'PENGERJAAN', prev: 'DIAGNOSA', notes: 'Penggantian oli, filter, bleeding minyak rem', actor: 'Mas Agus Santoso' },
          { status: 'SELESAI', prev: 'PENGERJAAN', notes: 'Test drive dan final check lulus, mobil dicuci bersih', actor: 'Mas Agus Santoso' }
        ],
        photos: [
          { url: '/uploads/ro/hrv-before.jpg', stage: 'BEFORE', caption: 'Kondisi awal filter kabin kotor' },
          { url: '/uploads/ro/hrv-after.jpg', stage: 'AFTER', caption: 'Servis selesai dan filter baru terpasang rapi' }
        ]
      },
      {
        preferredId: 'ro-seed-08',
        ro_number: 'RO-202610-008',
        token: 'token-calya-5678',
        plate: 'AG 5678 OP',
        customer: 'Rudi Hartono',
        phone: '081299887766',
        brand: 'Toyota',
        model: 'Calya 1.2 G',
        year: 2021,
        color: 'Merah Solid',
        odometer: 32500,
        entry_date: formatDate(1),
        complaint: 'Tune Up berkala, ganti busi iridium dan ganti filter udara',
        mechanic: 'Mas Rudi Hermawan',
        status: 'SELESAI',
        service_fee: 150000,
        sparepart_fee: 375000,
        total: 525000,
        est_completion: `${formatDate(0)} 14:00`,
        notes: 'Selesai dikerjakan, pelanggan diinfokan via WhatsApp',
        parts: [
          { sku: 'IGN-BUSI-NGK-IR', qty: 4, price: 75000 },
          { sku: 'FLT-UDR-AVANZA', qty: 1, price: 75000 }
        ],
        logs: [
          { status: 'MASUK', prev: null, notes: 'Masuk tune up rutin', actor: 'Bambang GPS Motor' },
          { status: 'PENGERJAAN', prev: 'MASUK', notes: 'Pemasangan busi iridium & pembersihan throttle body', actor: 'Mas Rudi Hermawan' },
          { status: 'SELESAI', prev: 'PENGERJAAN', notes: 'RPM stabil di 750 rpm, siap diambil', actor: 'Mas Rudi Hermawan' }
        ],
        photos: [
          { url: '/uploads/ro/calya-done.jpg', stage: 'AFTER', caption: 'Kondisi ruang mesin bersih setelah pengerjaan' }
        ]
      },
      {
        preferredId: 'ro-seed-09',
        ro_number: 'RO-202610-009',
        token: 'token-yaris-9012',
        plate: 'AG 9012 QR',
        customer: 'Dian Permata',
        phone: '085644556677',
        brand: 'Toyota',
        model: 'Yaris Heykers',
        year: 2017,
        color: 'Orange Metalik',
        odometer: 92300,
        entry_date: formatDate(4),
        complaint: 'Ganti kampas rem depan, ganti minyak rem, dan kuras oli transmisi',
        mechanic: 'Pak Sugeng Widodo',
        status: 'DIAMBIL',
        service_fee: 200000,
        sparepart_fee: 434000,
        total: 634000,
        est_completion: `${formatDate(3)} 16:00`,
        notes: 'Kendaraan telah diambil pemilik, pembayaran lunas via QRIS',
        parts: [
          { sku: 'BRK-BDX-AVZ-FRT', qty: 1, price: 260000 },
          { sku: 'BRK-DOT4-300ML', qty: 1, price: 38000 },
          { sku: 'TRN-RORED-1L', qty: 2, price: 68000 }
        ],
        logs: [
          { status: 'MASUK', prev: null, notes: 'Masuk servis rem & transmisi', actor: 'Bambang GPS Motor' },
          { status: 'PENGERJAAN', prev: 'MASUK', notes: 'Pengerjaan kampas rem & kuras oli transmisi', actor: 'Pak Sugeng Widodo' },
          { status: 'SELESAI', prev: 'PENGERJAAN', notes: 'Rem pakem dan perpindahan gigi halus', actor: 'Pak Sugeng Widodo' },
          { status: 'DIAMBIL', prev: 'SELESAI', notes: 'Unit diserahkan ke Ibu Dian, pembayaran QRIS lunas', actor: 'Bambang GPS Motor' }
        ],
        photos: [
          { url: '/uploads/ro/yaris-handover.jpg', stage: 'AFTER', caption: 'Penyerahan unit dan invoice ke pemilik' }
        ]
      },
      {
        preferredId: 'ro-seed-10',
        ro_number: 'RO-202610-010',
        token: 'token-terios-4321',
        plate: 'AG 4321 UV',
        customer: 'Eko Kurniawan',
        phone: '081277665544',
        brand: 'Daihatsu',
        model: 'Terios R Custom',
        year: 2019,
        color: 'Putih Solid',
        odometer: 61500,
        entry_date: formatDate(5),
        complaint: 'Ganti shockbreaker depan kanan kiri dan link stabilizer',
        mechanic: 'Mas Agus Santoso',
        status: 'DIAMBIL',
        service_fee: 250000,
        sparepart_fee: 1645000,
        total: 1895000,
        est_completion: `${formatDate(4)} 17:00`,
        notes: 'Pekerjaan kaki-kaki selesai sempurna, garansi shockbreaker 6 bulan',
        parts: [
          { sku: 'SHK-KYB-EXC-AVZ', qty: 1, price: 1350000 },
          { sku: 'SUS-LNK-555-AVZ', qty: 1, price: 295000 }
        ],
        logs: [
          { status: 'MASUK', prev: null, notes: 'Masuk perbaikan suspensi depan', actor: 'Bambang GPS Motor' },
          { status: 'PENGERJAAN', prev: 'MASUK', notes: 'Pemasangan shock KYB Excel-G & link stabilizer 555', actor: 'Mas Agus Santoso' },
          { status: 'SELESAI', prev: 'PENGERJAAN', notes: 'Spooring balancing dan test jalan halus', actor: 'Mas Agus Santoso' },
          { status: 'DIAMBIL', prev: 'SELESAI', notes: 'Pelanggan puas, pembayaran via Transfer BCA', actor: 'Bambang GPS Motor' }
        ],
        photos: [
          { url: '/uploads/ro/terios-suspension.jpg', stage: 'AFTER', caption: 'Suspensi baru terpasang sempurna' }
        ]
      },
      {
        preferredId: 'ro-seed-11',
        ro_number: 'RO-202610-011',
        token: 'token-mobilio-6789',
        plate: 'AG 6789 ST',
        customer: 'Wahyu Pratama',
        phone: '081322334455',
        brand: 'Honda',
        model: 'Mobilio E CVT',
        year: 2018,
        color: 'Abu-abu Baja',
        odometer: 73000,
        entry_date: formatDate(6),
        complaint: 'Kuras oli mesin TMO, ganti filter oli, dan wiper depan baru',
        mechanic: 'Mas Rudi Hermawan',
        status: 'DIAMBIL',
        service_fee: 80000,
        sparepart_fee: 470000,
        total: 550000,
        est_completion: `${formatDate(5)} 11:30`,
        notes: 'Pengerjaan cepat 45 menit, pembayaran cash',
        parts: [
          { sku: 'OLI-TMO-10W40', qty: 1, price: 320000 },
          { sku: 'FLT-HND-ORIG', qty: 1, price: 55000 },
          { sku: 'WPR-BSC-2016', qty: 1, price: 95000 }
        ],
        logs: [
          { status: 'MASUK', prev: null, notes: 'Fast pit stop ganti oli & wiper', actor: 'Bambang GPS Motor' },
          { status: 'PENGERJAAN', prev: 'MASUK', notes: 'Ganti oli TMO 10W-40 & filter oli', actor: 'Mas Rudi Hermawan' },
          { status: 'SELESAI', prev: 'PENGERJAAN', notes: 'Pengecekan level oli akurat', actor: 'Mas Rudi Hermawan' },
          { status: 'DIAMBIL', prev: 'SELESAI', notes: 'Unit diserahkan dengan nota cetak', actor: 'Bambang GPS Motor' }
        ],
        photos: [
          { url: '/uploads/ro/mobilio-oil.jpg', stage: 'AFTER', caption: 'Stiker jadwal servis berikutnya terpasang di kaca' }
        ]
      }
    ];

    // Clean existing RO logs & photos for the tenant before seeding ROs to avoid duplicate FK issues
    for (const ro of repairOrdersData) {
      const custId = customerMap[ro.customer] || null;

      // Find if this RO already exists by tenant and ro_number OR tracking_token OR plate
      let existingRo = db.prepare(`
        SELECT id FROM repair_orders 
        WHERE tenant_id = ? AND (ro_number = ? OR tracking_token = ? OR plate_number = ?)
      `).get(tenantId, ro.ro_number, ro.token, ro.plate);

      let roId;
      if (existingRo) {
        roId = existingRo.id;
        db.prepare(`
          UPDATE repair_orders 
          SET ro_number = ?, tracking_token = ?, customer_id = ?, plate_number = ?, customer_name = ?,
              customer_phone = ?, car_brand = ?, car_model = ?, car_year = ?, car_color = ?,
              odometer_in = ?, entry_date = ?, complaint = ?, mechanic_name = ?, status = ?,
              service_fee = ?, sparepart_fee = ?, total_cost = ?, estimated_completion = ?, notes = ?
          WHERE id = ?
        `).run(
          ro.ro_number, ro.token, custId, ro.plate, ro.customer,
          ro.phone, ro.brand, ro.model, ro.year, ro.color,
          ro.odometer, ro.entry_date, ro.complaint, ro.mechanic, ro.status,
          ro.service_fee, ro.sparepart_fee, ro.total, ro.est_completion, ro.notes,
          roId
        );
      } else {
        roId = ro.preferredId || crypto.randomUUID();
        db.prepare(`
          INSERT INTO repair_orders (
            id, tenant_id, ro_number, tracking_token, customer_id, plate_number, customer_name, customer_phone,
            car_brand, car_model, car_year, car_color, odometer_in, entry_date, complaint,
            mechanic_name, status, service_fee, sparepart_fee, total_cost, estimated_completion, notes
          ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?
          )
        `).run(
          roId, tenantId, ro.ro_number, ro.token, custId, ro.plate, ro.customer, ro.phone,
          ro.brand, ro.model, ro.year, ro.color, ro.odometer, ro.entry_date, ro.complaint,
          ro.mechanic, ro.status, ro.service_fee, ro.sparepart_fee, ro.total, ro.est_completion, ro.notes
        );
      }

      // Clean child records for this RO
      db.prepare('DELETE FROM ro_status_logs WHERE repair_order_id = ?').run(roId);
      db.prepare('DELETE FROM ro_photos WHERE repair_order_id = ?').run(roId);
      db.prepare('DELETE FROM ro_spareparts WHERE repair_order_id = ?').run(roId);

      // Insert Logs
      for (const log of ro.logs) {
        db.prepare(`
          INSERT INTO ro_status_logs (id, tenant_id, repair_order_id, previous_status, new_status, notes, actor_name, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(crypto.randomUUID(), tenantId, roId, log.prev, log.status, log.notes, log.actor, `${ro.entry_date} 10:00:00`);
      }

      // Insert Photos
      for (const ph of ro.photos) {
        db.prepare(`
          INSERT INTO ro_photos (id, tenant_id, repair_order_id, photo_url, stage, caption)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(crypto.randomUUID(), tenantId, roId, ph.url, ph.stage, ph.caption);
      }

      // Insert Parts and log stock movements
      for (const pt of ro.parts) {
        const partId = partMap[pt.sku];
        if (partId) {
          const subtotal = pt.qty * pt.price;
          db.prepare(`
            INSERT INTO ro_spareparts (id, tenant_id, repair_order_id, sparepart_id, item_name, quantity, unit_price, subtotal)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run(crypto.randomUUID(), tenantId, roId, partId, pt.sku, pt.qty, pt.price, subtotal);

          // Check if stock movement already exists for this RO and part
          const existingMove = db.prepare('SELECT id FROM stock_movements WHERE repair_order_id = ? AND sparepart_id = ?').get(roId, partId);
          if (!existingMove) {
            db.prepare(`
              INSERT INTO stock_movements (id, tenant_id, sparepart_id, type, quantity, unit_price, total_price, date, notes, repair_order_id)
              VALUES (?, ?, ?, 'OUT', ?, ?, ?, ?, ?, ?)
            `).run(crypto.randomUUID(), tenantId, partId, pt.qty, pt.price, subtotal, ro.entry_date, `Pemakaian RO ${ro.ro_number} (${ro.plate})`, roId);
          }
        }
      }
    }

    // ----------------------------------------------------
    // 7. 32 Financial Transactions (Income & Expense across 30 Days)
    // ----------------------------------------------------
    const transactionsData = [
      // Week 1 (Days 28-22 ago)
      { date: formatDate(28), type: 'EXPENSE', cat: 'Sewa Tempat & Bangunan', amount: 2500000, desc: 'Pembayaran sewa workshop bulanan', method: 'TRANSFER' },
      { date: formatDate(27), type: 'EXPENSE', cat: 'Beli Sparepart / Stok', amount: 3200000, desc: 'Restock oli drum dan filter Denso partai', method: 'TRANSFER' },
      { date: formatDate(26), type: 'INCOME', cat: 'Jasa Servis', amount: 450000, desc: 'Tune up Avanza AG 1122 AA', method: 'CASH' },
      { date: formatDate(25), type: 'INCOME', cat: 'Penjualan Sparepart', amount: 680000, desc: 'Penjualan 2 galon Shell Helix HX7 & filter', method: 'QRIS' },
      { date: formatDate(24), type: 'EXPENSE', cat: 'Listrik, Air & Internet', amount: 485000, desc: 'Tagihan PLN pascabayar & IndiHome 50Mbps', method: 'TRANSFER' },
      { date: formatDate(23), type: 'INCOME', cat: 'Jasa Servis', amount: 850000, desc: 'Servis rem & ganti shock Xpander AG 3344 BB', method: 'TRANSFER' },
      { date: formatDate(22), type: 'EXPENSE', cat: 'Operasional Lain-lain', amount: 150000, desc: 'Beli galon air minum, kopi, dan sabun mekanik', method: 'CASH' },

      // Week 2 (Days 21-15 ago)
      { date: formatDate(21), type: 'INCOME', cat: 'Jasa Servis', amount: 1200000, desc: 'Overhaul setengah mesin Calya AG 5566 CC', method: 'TRANSFER' },
      { date: formatDate(20), type: 'INCOME', cat: 'Penjualan Sparepart', amount: 950000, desc: 'Ganti kampas rem Bendix + busi iridium', method: 'QRIS' },
      { date: formatDate(19), type: 'EXPENSE', cat: 'Tools & Perlengkapan Bengkel', amount: 650000, desc: 'Beli kunci momen Tekiro & obeng impact', method: 'CASH' },
      { date: formatDate(18), type: 'INCOME', cat: 'Jasa Servis', amount: 350000, desc: 'Kuras oli matic & tune up Brio AG 7788 DD', method: 'CASH' },
      { date: formatDate(17), type: 'INCOME', cat: 'Penjualan Sparepart', amount: 520000, desc: 'Pembelian 1 aki GS Astra Hybrid NS40ZL', method: 'TRANSFER' },
      { date: formatDate(16), type: 'EXPENSE', cat: 'Beli Sparepart / Stok', amount: 1850000, desc: 'Beli kampas rem Bendix & shock Kayaba', method: 'TRANSFER' },
      { date: formatDate(15), type: 'INCOME', cat: 'Jasa Servis', amount: 600000, desc: 'Servis injeksi & gurah mesin Sigra AG 9900 EE', method: 'QRIS' },

      // Week 3 (Days 14-8 ago)
      { date: formatDate(14), type: 'EXPENSE', cat: 'Gaji Mekanik & Karyawan', amount: 4200000, desc: 'Uang makan & gaji mingguan 3 mekanik', method: 'TRANSFER' },
      { date: formatDate(13), type: 'INCOME', cat: 'Jasa Servis', amount: 750000, desc: 'Ganti kampas kopling Ertiga AG 2233 FF', method: 'TRANSFER' },
      { date: formatDate(12), type: 'INCOME', cat: 'Penjualan Sparepart', amount: 410000, desc: 'Penjualan 1 set wiper Bosch & coolant Prestone', method: 'CASH' },
      { date: formatDate(11), type: 'INCOME', cat: 'Jasa Servis', amount: 550000, desc: 'Perbaikan kaki-kaki Terios AG 4455 GG', method: 'QRIS' },
      { date: formatDate(10), type: 'EXPENSE', cat: 'Operasional Lain-lain', amount: 120000, desc: 'Penggantian oli kompresor angin & filter selang', method: 'CASH' },
      { date: formatDate(9), type: 'INCOME', cat: 'Jasa Servis', amount: 920000, desc: 'Servis AC berkala & ganti evaporator Avanza', method: 'TRANSFER' },
      { date: formatDate(8), type: 'INCOME', cat: 'Penjualan Sparepart', amount: 380000, desc: 'Penjualan oli TMO 10W-40 4L', method: 'CASH' },

      // Week 4 (Days 7-1 ago & Today)
      { date: formatDate(7), type: 'EXPENSE', cat: 'Beli Sparepart / Stok', amount: 2100000, desc: 'Restock busi NGK Iridium & cairan chemical', method: 'TRANSFER' },
      { date: formatDate(6), type: 'INCOME', cat: 'Jasa Servis', amount: 550000, desc: 'Pelunasan RO-202610-011 Mobilio AG 6789 ST', method: 'CASH' },
      { date: formatDate(5), type: 'INCOME', cat: 'Jasa Servis', amount: 1895000, desc: 'Pelunasan RO-202610-010 Terios AG 4321 UV', method: 'TRANSFER' },
      { date: formatDate(4), type: 'INCOME', cat: 'Jasa Servis', amount: 634000, desc: 'Pelunasan RO-202610-009 Yaris AG 9012 QR', method: 'QRIS' },
      { date: formatDate(3), type: 'EXPENSE', cat: 'Operasional Lain-lain', amount: 200000, desc: 'Iuran kebersihan lingkungan & sampah bulanan', method: 'CASH' },
      { date: formatDate(2), type: 'INCOME', cat: 'Jasa Servis', amount: 525000, desc: 'Pelunasan RO-202610-008 Calya AG 5678 OP', method: 'TRANSFER' },
      { date: formatDate(1), type: 'INCOME', cat: 'Jasa Servis', amount: 798000, desc: 'Pelunasan RO-202610-007 HR-V AG 3456 MN', method: 'QRIS' },
      { date: formatDate(1), type: 'EXPENSE', cat: 'Beli Sparepart / Stok', amount: 750000, desc: 'Beli motor fan radiator Denso Innova Reborn', method: 'TRANSFER' },
      { date: formatDate(0), type: 'INCOME', cat: 'Jasa Servis', amount: 450000, desc: 'Uang muka pengerjaan Avanza AG 1822 AB', method: 'CASH' },
      { date: formatDate(0), type: 'INCOME', cat: 'Penjualan Sparepart', amount: 320000, desc: 'Penjualan langsung Oli TMO Synthetic 4L', method: 'QRIS' },
      { date: formatDate(0), type: 'EXPENSE', cat: 'Operasional Lain-lain', amount: 85000, desc: 'Beli cairan pembersih lantai bengkel & majun', method: 'CASH' }
    ];

    const insertTxStmt = db.prepare(`
      INSERT INTO transactions (id, tenant_id, category_id, type, amount, date, description, payment_method)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Clean old seed transactions to prevent infinite duplicate growth
    db.prepare('DELETE FROM transactions WHERE tenant_id = ?').run(tenantId);

    for (const tx of transactionsData) {
      const catId = categoryMap[tx.cat] || categoryMap['Pendapatan Lain-lain'] || categoryMap['Operasional Lain-lain'];
      insertTxStmt.run(crypto.randomUUID(), tenantId, catId, tx.type, tx.amount, tx.date, tx.desc, tx.method);
    }

    console.log(`✅ Seed data successfully applied:`);
    console.log(`   - Default Tenant: Bengkel Mobil GPS Motor Kediri (ID: ${tenantId})`);
    console.log(`   - Spareparts: ${sparepartsData.length} items`);
    console.log(`   - Customers: ${customersData.length} records`);
    console.log(`   - Repair Orders: ${repairOrdersData.length} records across all 6 stages`);
    console.log(`   - Transactions: ${transactionsData.length} financial ledger entries`);
  });

  seedTransaction();
}

// Auto-run if executed directly via CLI: node server/db/seed.js
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  try {
    runSeed();
    console.log('🎉 Database seeding completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed with error:', err);
    process.exit(1);
  }
}

export default runSeed;
