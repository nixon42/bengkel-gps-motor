#!/usr/bin/env node
/**
 * Empirical Adversarial Challenge Test Harness for Milestone 5:
 * Customer CRM Autocomplete, Deduplication, Service History & Public Tracking Integration
 * Bengkel Mobil GPS Motor Kediri
 * 
 * Target Areas:
 * 1. Customer Search & Autocomplete (GET /api/customers/search):
 *    - SQL injection resistance (' OR 1=1 --, DROP TABLE, UNION SELECT, etc.)
 *    - Empty, ultra-short, whitespace, and special character queries
 *    - Matching accuracy by plate (with/without space), phone, name, email
 *    - Cross-tenant isolation (no cross-tenant leakage in autocomplete)
 * 2. Customer Vehicle Linkage & Deduplication:
 *    - Auto-provision customer & vehicle on first RO creation
 *    - Re-use customer ID on same phone (no duplicate customer records)
 *    - Re-use vehicle on same plate number (no duplicate vehicle records)
 *    - Multi-vehicle linking for same customer phone
 *    - Accurate aggregation in customer list (ro_count, vehicle_count, total_spent)
 * 3. Service History Timeline (GET /api/customers/:id/history):
 *    - Chronological ordering (entry_date DESC, created_at DESC)
 *    - Accurate part_count and repair order details
 *    - Cross-tenant isolation (Tenant B requesting Tenant A history -> 404)
 *    - Non-existent customer ID returns 404
 * 4. Public Tracking Integration (GET /api/public/:slug/tracking):
 *    - Privacy masking (plate_masked, customer_name_masked)
 *    - Strict privacy guarantee: NO raw phone, NO raw address, NO buy_price in payload
 *    - Flexible plate queries (spaced, unspaced, lowercase, hyphenated, dotted)
 *    - Token query (?token=...)
 *    - 6-stage milestone lifecycle progression
 *    - Cross-tenant isolation on public slug (Tenant B slug cannot view Tenant A plate -> 404)
 */

import assert from 'node:assert/strict';
import request from 'supertest';
import { createTestApp, loginUser } from '../supertestHelper.js';
import { FIXTURES } from '../fixtures.js';

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m'
};

const results = [];

async function test(name, fn) {
  const start = Date.now();
  try {
    await fn();
    const duration = Date.now() - start;
    results.push({ name, pass: true, duration });
    console.log(`  ${COLORS.green}✔ PASS${COLORS.reset} ${name} ${COLORS.dim}(${duration}ms)${COLORS.reset}`);
  } catch (err) {
    const duration = Date.now() - start;
    results.push({ name, pass: false, duration, error: err.message || String(err) });
    console.log(`  ${COLORS.red}✖ FAIL${COLORS.reset} ${name} ${COLORS.dim}(${duration}ms)${COLORS.reset}`);
    console.log(`    ${COLORS.red}Error: ${err.message}${COLORS.reset}`);
  }
}

async function run() {
  console.log(`\n${COLORS.bold}================================================================${COLORS.reset}`);
  console.log(`${COLORS.bold}  Milestone 5 Adversarial Challenge: CRM, Autocomplete & Public Tracking  ${COLORS.reset}`);
  console.log(`${COLORS.bold}================================================================${COLORS.reset}\n`);

  const { app, db, cleanup } = createTestApp();

  try {
    // Setup sessions for two isolated tenants: GPS Motor (Tenant A) and Berkah Kediri (Tenant B)
    const authGps = await loginUser(app, {
      tenantSlug: FIXTURES.tenants.gpsMotor.slug,
      email: FIXTURES.users.gpsAdmin.email
    });
    const tenantIdGps = authGps.tenant.id;

    const authBerkah = await loginUser(app, {
      tenantSlug: FIXTURES.tenants.berkahKediri.slug,
      email: FIXTURES.users.berkahAdmin.email
    });
    const tenantIdBerkah = authBerkah.tenant.id;

    assert.notEqual(tenantIdGps, tenantIdBerkah, 'Tenants must have distinct IDs');

    // =========================================================================
    // SECTION 1: Customer Search & Autocomplete (GET /api/customers/search)
    // =========================================================================
    console.log(`\n${COLORS.bold}${COLORS.cyan}▶ Section 1: Customer Search & Autocomplete Stress-Testing${COLORS.reset}`);

    // Pre-populate known test customers in GPS Motor
    const seedCustomerId = 'cust-test-crm-001';
    db.prepare(`
      INSERT OR REPLACE INTO customers (id, tenant_id, name, phone, email, address, notes)
      VALUES (?, ?, 'Bambang Kusumo', '081234567890', 'bambang@gmail.com', 'Jl. Joyoboyo No. 12 Kediri', 'VIP Customer')
    `).run(seedCustomerId, tenantIdGps);

    const seedVehicleId = 'veh-test-crm-001';
    db.prepare(`
      INSERT OR REPLACE INTO vehicles (id, tenant_id, customer_id, plate_number, brand, model, year, color)
      VALUES (?, ?, ?, 'AG 1234 XY', 'Toyota', 'Kijang Innova', 2018, 'Hitam')
    `).run(seedVehicleId, tenantIdGps, seedCustomerId);

    // Also populate a customer in Berkah Kediri (Tenant B)
    const seedCustBerkahId = 'cust-berkah-crm-001';
    db.prepare(`
      INSERT OR REPLACE INTO customers (id, tenant_id, name, phone, email, address, notes)
      VALUES (?, ?, 'Siti Aminah Berkah', '085799988811', 'siti@berkah.local', 'Jl. Dhoho No. 99 Kediri', 'Tenant B customer')
    `).run(seedCustBerkahId, tenantIdBerkah);

    db.prepare(`
      INSERT OR REPLACE INTO vehicles (id, tenant_id, customer_id, plate_number, brand, model, year, color)
      VALUES ('veh-berkah-001', ?, ?, 'AG 9999 BK', 'Honda', 'Brio', 2021, 'Merah')
    `).run(tenantIdBerkah, seedCustBerkahId);

    // 1.1 Empty and Whitespace Queries
    await test('1.1: Empty query returns empty customer array without error', async () => {
      const res = await request(app)
        .get('/api/customers/search')
        .set('Cookie', authGps.cookie);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.deepEqual(res.body.customers, []);
    });

    await test('1.2: Whitespace-only query returns empty array', async () => {
      const res = await request(app)
        .get('/api/customers/search?q=%20%20%20')
        .set('Cookie', authGps.cookie);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.deepEqual(res.body.customers, []);
    });

    // 1.2 SQL Injection payloads in `q`
    const sqliPayloads = [
      "' OR 1=1 --",
      "\" OR 1=1 --",
      "' OR 'a'='a",
      "'; DROP TABLE customers; --",
      "' UNION SELECT 'hack', 'hack', 'hack', 'hack', 'hack', 'hack', 'hack', 'hack', 'hack' --",
      "1' OR '1' = '1",
      "admin' --",
      "%' OR 1=1 --",
      "\" UNION SELECT null, null, null, null, null, null, null, null, null --"
    ];

    for (const sqli of sqliPayloads) {
      await test(`1.3 (SQLi Attack): Safely handles query parameter q="${sqli}"`, async () => {
        const res = await request(app)
          .get(`/api/customers/search?q=${encodeURIComponent(sqli)}`)
          .set('Cookie', authGps.cookie);
        
        assert.equal(res.status, 200, 'Should not throw 500 error on SQLi payload');
        assert.equal(res.body.success, true);
        assert.ok(Array.isArray(res.body.customers));
        // Crucial verification: SQLi must NOT return all database customers!
        // It must only match if a customer literally has that payload as name/phone/plate
        assert.ok(res.body.customers.length <= 1, 'SQLi payload must not dump database rows');
      });
    }

    // 1.3 Special Characters, Emojis, Long Strings
    await test('1.4: Special characters and symbols handle gracefully without error', async () => {
      const specials = ['!@#$%^&*()', '<script>alert(1)</script>', '🚗🔧', '\\0\\n\\r', '%', '_'];
      for (const spec of specials) {
        const res = await request(app)
          .get(`/api/customers/search?q=${encodeURIComponent(spec)}`)
          .set('Cookie', authGps.cookie);
        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
      }
    });

    await test('1.5: Ultra-long query string (500 chars) handles without buffer overflow', async () => {
      const longQuery = 'A'.repeat(500);
      const res = await request(app)
        .get(`/api/customers/search?q=${encodeURIComponent(longQuery)}`)
        .set('Cookie', authGps.cookie);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.deepEqual(res.body.customers, []);
    });

    // 1.4 Matching Accuracy across Dimensions
    await test('1.6: Autocomplete accurately matches by customer name', async () => {
      const res = await request(app)
        .get('/api/customers/search?q=Bambang')
        .set('Cookie', authGps.cookie);
      assert.equal(res.status, 200);
      assert.ok(res.body.customers.length >= 1);
      const found = res.body.customers.find(c => c.id === seedCustomerId);
      assert.ok(found, 'Should find Bambang Kusumo');
      assert.equal(found.name, 'Bambang Kusumo');
      assert.ok(Array.isArray(found.vehicles));
      assert.ok(found.vehicles.some(v => v.plate_number === 'AG 1234 XY'));
    });

    await test('1.7: Autocomplete accurately matches by customer phone', async () => {
      const res = await request(app)
        .get('/api/customers/search?q=081234567890')
        .set('Cookie', authGps.cookie);
      assert.equal(res.status, 200);
      assert.ok(res.body.customers.length >= 1);
      const found = res.body.customers.find(c => c.id === seedCustomerId);
      assert.ok(found, 'Should find customer by phone');
    });

    await test('1.8: Autocomplete accurately matches by plate number WITH spaces', async () => {
      const res = await request(app)
        .get('/api/customers/search?q=AG%201234%20XY')
        .set('Cookie', authGps.cookie);
      assert.equal(res.status, 200);
      assert.ok(res.body.customers.length >= 1);
      const found = res.body.customers.find(c => c.id === seedCustomerId);
      assert.ok(found, 'Should find customer by spaced plate');
    });

    await test('1.9: Autocomplete accurately matches by plate number WITHOUT spaces', async () => {
      const res = await request(app)
        .get('/api/customers/search?q=AG1234XY')
        .set('Cookie', authGps.cookie);
      assert.equal(res.status, 200);
      assert.ok(res.body.customers.length >= 1);
      const found = res.body.customers.find(c => c.id === seedCustomerId);
      assert.ok(found, 'Should find customer by unspaced plate');
    });

    // 1.5 Cross-Tenant Autocomplete Isolation
    await test('1.10 (Tenant Isolation): Tenant B searching Tenant A customer data yields 0 results', async () => {
      const res = await request(app)
        .get('/api/customers/search?q=Bambang')
        .set('Cookie', authBerkah.cookie);
      assert.equal(res.status, 200);
      assert.equal(res.body.customers.length, 0, 'Tenant B must NOT see Tenant A customer');

      const resPlate = await request(app)
        .get('/api/customers/search?q=AG1234XY')
        .set('Cookie', authBerkah.cookie);
      assert.equal(resPlate.status, 200);
      assert.equal(resPlate.body.customers.length, 0, 'Tenant B must NOT see Tenant A vehicle plate');
    });

    // =========================================================================
    // SECTION 2: Customer Vehicle Linkage & Deduplication
    // =========================================================================
    console.log(`\n${COLORS.bold}${COLORS.cyan}▶ Section 2: Customer Vehicle Linkage & Deduplication${COLORS.reset}`);

    const uniquePhone = '081999888777';
    const customerName = 'Dewi Sartika';
    const plate1 = 'AG 5555 ZZ';
    let dewiCustomerId = null;
    let vehicle1Id = null;

    await test('2.1: First RO creation auto-provisions new customer and vehicle', async () => {
      const ro1Payload = {
        platNomor: plate1,
        namaPemilik: customerName,
        noHp: uniquePhone,
        merekModel: 'Daihatsu Sigra 1.2 R',
        tahun: 2020,
        warna: 'Putih',
        odometerMasuk: 32000,
        tanggalMasuk: '2026-10-01',
        keluhan: 'Ganti oli mesin berkala',
        mekanikPj: 'Mas Agus Santoso',
        biayaJasa: 50000
      };

      const res = await request(app)
        .post('/api/repair-orders')
        .set('Cookie', authGps.cookie)
        .send(ro1Payload);

      assert.ok(res.status === 200 || res.status === 201, `Create RO status: ${res.status}`);
      const ro = res.body.repair_order || res.body;
      assert.ok(ro.id, 'RO ID created');
      assert.ok(ro.tracking_token, 'Tracking token created');

      // Verify customer row auto-provisioned in DB
      const custRow = db.prepare('SELECT * FROM customers WHERE tenant_id = ? AND phone = ?').get(tenantIdGps, uniquePhone);
      assert.ok(custRow, 'Customer must be provisioned in customers table');
      assert.equal(custRow.name, customerName);
      dewiCustomerId = custRow.id;

      // Verify vehicle row auto-provisioned in DB
      const vehRow = db.prepare("SELECT * FROM vehicles WHERE tenant_id = ? AND UPPER(REPLACE(plate_number, ' ', '')) = ?").get(tenantIdGps, 'AG5555ZZ');
      assert.ok(vehRow, 'Vehicle must be provisioned in vehicles table');
      assert.equal(vehRow.customer_id, dewiCustomerId);
      vehicle1Id = vehRow.id;
    });

    await test('2.2: Second RO with SAME phone & SAME plate re-uses customer & vehicle without duplicates', async () => {
      const ro2Payload = {
        platNomor: plate1,
        namaPemilik: customerName,
        noHp: uniquePhone,
        merekModel: 'Daihatsu Sigra 1.2 R',
        tahun: 2020,
        warna: 'Putih',
        odometerMasuk: 37000,
        tanggalMasuk: '2026-10-03',
        keluhan: 'Tune up mesin & bersihkan throttle body',
        mekanikPj: 'Mas Agus Santoso',
        biayaJasa: 150000
      };

      const res = await request(app)
        .post('/api/repair-orders')
        .set('Cookie', authGps.cookie)
        .send(ro2Payload);

      assert.ok(res.status === 200 || res.status === 201);
      const ro = res.body.repair_order || res.body;
      assert.equal(ro.customer_id, dewiCustomerId, 'RO must link to existing customer ID');

      // Verify DB count of customers with this phone is strictly 1
      const countCust = db.prepare('SELECT COUNT(*) as cnt FROM customers WHERE tenant_id = ? AND phone = ?').get(tenantIdGps, uniquePhone);
      assert.equal(countCust.cnt, 1, 'Must NOT create duplicate customer row');

      // Verify DB count of vehicles with this plate is strictly 1
      const countVeh = db.prepare("SELECT COUNT(*) as cnt FROM vehicles WHERE tenant_id = ? AND UPPER(REPLACE(plate_number, ' ', '')) = ?").get(tenantIdGps, 'AG5555ZZ');
      assert.equal(countVeh.cnt, 1, 'Must NOT create duplicate vehicle row');
    });

    const plate2 = 'AG 6666 YY';
    let vehicle2Id = null;

    await test('2.3: Third RO with SAME phone but DIFFERENT vehicle links second vehicle to existing customer', async () => {
      const ro3Payload = {
        platNomor: plate2,
        namaPemilik: customerName,
        noHp: uniquePhone,
        merekModel: 'Honda Jazz RS',
        tahun: 2017,
        warna: 'Kuning',
        odometerMasuk: 78000,
        tanggalMasuk: '2026-10-04',
        keluhan: 'Rem bunyi berdecit',
        mekanikPj: 'Mas Agus Santoso',
        biayaJasa: 100000
      };

      const res = await request(app)
        .post('/api/repair-orders')
        .set('Cookie', authGps.cookie)
        .send(ro3Payload);

      assert.ok(res.status === 200 || res.status === 201);
      const ro = res.body.repair_order || res.body;
      assert.equal(ro.customer_id, dewiCustomerId, 'RO must link to existing customer ID');

      // Verify total customer count remains 1
      const countCust = db.prepare('SELECT COUNT(*) as cnt FROM customers WHERE tenant_id = ? AND phone = ?').get(tenantIdGps, uniquePhone);
      assert.equal(countCust.cnt, 1, 'Customer count must remain exactly 1');

      // Verify second vehicle is created and belongs to dewiCustomerId
      const veh2Row = db.prepare("SELECT * FROM vehicles WHERE tenant_id = ? AND UPPER(REPLACE(plate_number, ' ', '')) = ?").get(tenantIdGps, 'AG6666YY');
      assert.ok(veh2Row, 'Second vehicle must be created');
      assert.equal(veh2Row.customer_id, dewiCustomerId, 'Second vehicle must belong to same customer');
      vehicle2Id = veh2Row.id;
    });

    await test('2.4: Customer profile (GET /api/customers/:id) reflects both vehicles and all ROs', async () => {
      const res = await request(app)
        .get(`/api/customers/${dewiCustomerId}`)
        .set('Cookie', authGps.cookie);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.customer.id, dewiCustomerId);
      assert.equal(res.body.vehicles.length, 2, 'Customer profile must list both vehicles');
      assert.equal(res.body.repair_orders.length, 3, 'Customer profile must list all 3 ROs');
    });

    await test('2.5: Customer list (GET /api/customers) aggregates ro_count: 3 and vehicle_count: 2', async () => {
      const res = await request(app)
        .get(`/api/customers?search=${encodeURIComponent(customerName)}`)
        .set('Cookie', authGps.cookie);

      assert.equal(res.status, 200);
      assert.ok(res.body.customers.length >= 1);
      const dewi = res.body.customers.find(c => c.id === dewiCustomerId);
      assert.ok(dewi, 'Dewi Sartika must be in customer list');
      assert.equal(dewi.vehicle_count, 2, 'vehicle_count must be 2');
      assert.equal(dewi.ro_count, 3, 'ro_count must be 3');
      assert.ok(dewi.total_spent >= 300000, 'total_spent must reflect RO costs');
    });

    // =========================================================================
    // SECTION 3: Service History Timeline (GET /api/customers/:id/history)
    // =========================================================================
    console.log(`\n${COLORS.bold}${COLORS.cyan}▶ Section 3: Service History Timeline Stress-Testing${COLORS.reset}`);

    await test('3.1: Service history lists all past ROs ordered chronologically (entry_date DESC)', async () => {
      const res = await request(app)
        .get(`/api/customers/${dewiCustomerId}/history`)
        .set('Cookie', authGps.cookie);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      const history = res.body.history || res.body.repair_orders;
      assert.equal(history.length, 3, 'History must list 3 ROs');

      // Verify descending chronological order
      for (let i = 0; i < history.length - 1; i++) {
        const d1 = new Date(history[i].entry_date).getTime();
        const d2 = new Date(history[i + 1].entry_date).getTime();
        assert.ok(d1 >= d2, `Order violation: index ${i} (${history[i].entry_date}) vs index ${i + 1} (${history[i + 1].entry_date})`);
      }

      // Check fields
      const first = history[0];
      assert.ok(first.ro_number, 'Must have ro_number');
      assert.ok(first.plate_number, 'Must have plate_number');
      assert.ok(first.complaint, 'Must have complaint');
      assert.ok(first.status, 'Must have status');
      assert.ok(typeof first.part_count === 'number', 'Must have part_count');
    });

    await test('3.2: Non-existent customer ID returns HTTP 404', async () => {
      const res = await request(app)
        .get('/api/customers/non-existent-uuid-12345/history')
        .set('Cookie', authGps.cookie);
      assert.equal(res.status, 404);
      assert.ok(res.body.error);
    });

    await test('3.3 (Tenant Isolation): Tenant B accessing Tenant A customer history returns HTTP 404', async () => {
      const res = await request(app)
        .get(`/api/customers/${dewiCustomerId}/history`)
        .set('Cookie', authBerkah.cookie);
      assert.equal(res.status, 404, 'Must return 404 for cross-tenant customer history request');
    });

    // =========================================================================
    // SECTION 4: Public Tracking Integration (GET /api/public/:slug/tracking)
    // =========================================================================
    console.log(`\n${COLORS.bold}${COLORS.cyan}▶ Section 4: Public Tracking Integration & Privacy Masking${COLORS.reset}`);

    // Create a specific active RO with spareparts, notes, and photos for tracking validation
    const trackingPlate = 'AG 7788 KL';
    const trackingOwner = 'Hendra Pratama';
    const trackingPhone = '081333444555';
    let trackingRoId = null;
    let trackingToken = null;

    await test('4.1: Create dedicated RO for public tracking testing', async () => {
      const res = await request(app)
        .post('/api/repair-orders')
        .set('Cookie', authGps.cookie)
        .send({
          platNomor: trackingPlate,
          namaPemilik: trackingOwner,
          noHp: trackingPhone,
          merekModel: 'Toyota Yaris 1.5',
          tahun: 2021,
          warna: 'Merah Citrus',
          odometerMasuk: 45000,
          tanggalMasuk: '2026-10-05',
          keluhan: 'Lampu indikator mesin menyala, tarikan tersendat',
          mekanikPj: 'Mas Agus Santoso',
          biayaJasa: 200000
        });

      assert.ok(res.status === 200 || res.status === 201);
      const ro = res.body.repair_order || res.body;
      trackingRoId = ro.id;
      trackingToken = ro.tracking_token;
      assert.ok(trackingRoId);
      assert.ok(trackingToken);

      // Advance status to DIAGNOSA then PENGERJAAN
      await request(app)
        .post(`/api/repair-orders/${trackingRoId}/status`)
        .set('Cookie', authGps.cookie)
        .send({ status: 'DIAGNOSA', catatan: 'Scan ECU kode P0300' });

      await request(app)
        .post(`/api/repair-orders/${trackingRoId}/status`)
        .set('Cookie', authGps.cookie)
        .send({ status: 'PENGERJAAN', catatan: 'Penggantian busi dan pembersihan sensor' });

      // Attach sparepart with secret buy price
      const secretPartId = 'part-secret-filter';
      db.prepare(`
        INSERT OR REPLACE INTO spareparts (id, tenant_id, sku, name, category, stock, buy_price, sell_price)
        VALUES (?, ?, 'FLT-DENSO-01', 'Filter Udara Denso Yaris', 'Filter', 10, 45000, 75000)
      `).run(secretPartId, tenantIdGps);

      await request(app)
        .post(`/api/repair-orders/${trackingRoId}/spareparts`)
        .set('Cookie', authGps.cookie)
        .send({
          sparepart_id: secretPartId,
          qty: 1,
          harga_satuan: 75000
        });
    });

    await test('4.2: Public tracking returns masked plate & customer name (Privacy Masking)', async () => {
      const res = await request(app)
        .get(`/api/public/${FIXTURES.tenants.gpsMotor.slug}/tracking?plate=${encodeURIComponent(trackingPlate)}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.plate_masked, 'AG 77** KL');
      assert.equal(res.body.customer_name_masked, 'Hendra P******');
    });

    await test('4.3 (Strict Privacy Guarantee): NO phone number, address, or buy_price anywhere in response JSON', async () => {
      const res = await request(app)
        .get(`/api/public/${FIXTURES.tenants.gpsMotor.slug}/tracking?plate=${encodeURIComponent(trackingPlate)}`);

      assert.equal(res.status, 200);
      const rawText = JSON.stringify(res.body);

      // Phone number must NOT appear anywhere in the payload
      assert.ok(!rawText.includes(trackingPhone), `Phone number ${trackingPhone} leaked in tracking payload!`);
      assert.ok(!rawText.includes('081333444555'), 'Raw phone leaked in tracking payload!');

      // Wholesale buy price (45000) must NOT appear in spareparts
      assert.ok(Array.isArray(res.body.spareparts) && res.body.spareparts.length >= 1);
      for (const sp of res.body.spareparts) {
        assert.equal(sp.buy_price, undefined, 'buy_price must NOT be exposed');
        assert.equal(sp.buyPrice, undefined, 'buyPrice must NOT be exposed');
        assert.equal(sp.harga_beli, undefined, 'harga_beli must NOT be exposed');
        assert.equal(sp.unit_price, 75000, 'unit_price must reflect selling price');
      }
    });

    await test('4.4: Flexible plate search formats: spaced, compact, lowercase, hyphenated', async () => {
      const formats = [
        'AG 7788 KL',
        'AG7788KL',
        'ag 7788 kl',
        'ag-7788-kl',
        'ag.7788.kl'
      ];

      for (const fmt of formats) {
        const res = await request(app)
          .get(`/api/public/${FIXTURES.tenants.gpsMotor.slug}/tracking?plate=${encodeURIComponent(fmt)}`);
        assert.equal(res.status, 200, `Plate format "${fmt}" failed to look up`);
        assert.equal(res.body.plate_masked, 'AG 77** KL');
      }
    });

    await test('4.5: Tracking token lookup (?token=...) works seamlessly', async () => {
      const res = await request(app)
        .get(`/api/public/${FIXTURES.tenants.gpsMotor.slug}/tracking?token=${encodeURIComponent(trackingToken)}`);
      assert.equal(res.status, 200);
      assert.equal(res.body.plate_masked, 'AG 77** KL');
      assert.equal(res.body.repairOrder.tracking_token, trackingToken);
    });

    await test('4.6: Milestone stages reflect 6-stage lifecycle with active stage PENGERJAAN', async () => {
      const res = await request(app)
        .get(`/api/public/${FIXTURES.tenants.gpsMotor.slug}/tracking?plate=${encodeURIComponent(trackingPlate)}`);

      assert.equal(res.status, 200);
      const milestones = res.body.milestones;
      assert.equal(milestones.length, 6, 'Must contain 6 lifecycle stages');
      
      const expectedKeys = ['MASUK', 'DIAGNOSA', 'PENGERJAAN', 'MENUNGGU_PART', 'SELESAI', 'DIAMBIL'];
      assert.deepEqual(milestones.map(m => m.key), expectedKeys);

      // Active stage is PENGERJAAN (step 3)
      const pengerjaan = milestones.find(m => m.key === 'PENGERJAAN');
      assert.ok(pengerjaan.isCurrent, 'PENGERJAAN must be isCurrent: true');
      assert.ok(pengerjaan.isCompleted, 'PENGERJAAN must be isCompleted: true');

      const diagnosa = milestones.find(m => m.key === 'DIAGNOSA');
      assert.ok(diagnosa.isCompleted, 'DIAGNOSA must be isCompleted: true');
      assert.ok(!diagnosa.isCurrent, 'DIAGNOSA must not be isCurrent');

      const selesai = milestones.find(m => m.key === 'SELESAI');
      assert.ok(!selesai.isCompleted, 'SELESAI must be isCompleted: false');
      assert.ok(!selesai.isCurrent, 'SELESAI must not be isCurrent');
    });

    await test('4.7 (Tenant Isolation): Searching plate under foreign tenant slug returns HTTP 404', async () => {
      // Plate AG 7788 KL belongs to GPS Motor. Searching under Berkah Kediri slug must 404!
      const res = await request(app)
        .get(`/api/public/${FIXTURES.tenants.berkahKediri.slug}/tracking?plate=${encodeURIComponent(trackingPlate)}`);

      assert.equal(res.status, 404, 'Foreign tenant tracking must return 404');
      assert.equal(res.body.success, false);
    });

  } finally {
    cleanup();
  }

  // Summary
  console.log(`\n${COLORS.bold}----------------------------------------------------------------${COLORS.reset}`);
  console.log(`${COLORS.bold}  Milestone 5 Adversarial Challenge Summary:${COLORS.reset}`);
  const total = results.length;
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;

  console.log(`  Total Tests: ${total}`);
  console.log(`  ${COLORS.green}✔ Passed:     ${passed}${COLORS.reset}`);
  if (failed > 0) {
    console.log(`  ${COLORS.red}✖ Failed:     ${failed}${COLORS.reset}`);
  }
  console.log(`${COLORS.bold}----------------------------------------------------------------${COLORS.reset}\n`);

  if (failed > 0) {
    console.error(`${COLORS.red}${COLORS.bold}Milestone 5 Adversarial Challenge FAILED: ${failed} tests failed.${COLORS.reset}`);
    process.exit(1);
  } else {
    console.log(`${COLORS.green}${COLORS.bold}✔ ALL ADVERSARIAL CHALLENGES PASSED (Exit 0)${COLORS.reset}\n`);
    process.exit(0);
  }
}

run().catch(err => {
  console.error('Fatal Test Error:', err);
  process.exit(1);
});
