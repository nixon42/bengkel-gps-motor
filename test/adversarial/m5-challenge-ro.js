#!/usr/bin/env node
/**
 * Empirical Adversarial Challenge Test Harness for Milestone 5:
 * Repair Orders Lifecycle, Stock Mutations, Invoicing & Multi-Tenant Isolation
 * Bengkel Mobil GPS Motor Kediri
 * 
 * Challenger Agent: challenger_m5_1
 */

import assert from 'node:assert/strict';
import request from 'supertest';
import { createTestApp, loginUser } from '../supertestHelper.js';

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
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
    console.log(`    ${COLORS.yellow}↳ ${err.message}${COLORS.reset}`);
  }
}

async function run() {
  console.log(`\n${COLORS.bold}${COLORS.cyan}================================================================${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.cyan}  Milestone 5 Adversarial Challenge: RO Lifecycle & Stock       ${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.cyan}================================================================${COLORS.reset}\n`);

  const { app, db, cleanup } = createTestApp();

  try {
    const authTenantA = await loginUser(app, { tenantSlug: 'tenant-ro-a', email: 'owner-a@gps.com' });
    const authTenantB = await loginUser(app, { tenantSlug: 'tenant-ro-b', email: 'owner-b@gps.com' });

    // Seed initial spareparts for Tenant A
    const partOliRes = await request(app)
      .post('/api/inventory')
      .set('Cookie', authTenantA.cookie)
      .send({
        sku: 'OIL-FAST-10W40',
        name: 'Fastron 10W-40 4L',
        category: 'Oli',
        unit: 'galon',
        stock: 5,
        buy_price: 250000,
        sell_price: 350000
      });
    const oliPartId = partOliRes.body.item.id;

    const partBusiRes = await request(app)
      .post('/api/inventory')
      .set('Cookie', authTenantA.cookie)
      .send({
        sku: 'BUSI-IRID-01',
        name: 'Busi Iridium Denso',
        category: 'Busi',
        unit: 'pcs',
        stock: 20,
        buy_price: 50000,
        sell_price: 90000
      });
    const busiPartId = partBusiRes.body.item.id;

    const partFilterRes = await request(app)
      .post('/api/inventory')
      .set('Cookie', authTenantA.cookie)
      .send({
        sku: 'FLT-AVZ-01',
        name: 'Filter Oli Avanza Genuine',
        category: 'Filter',
        unit: 'pcs',
        stock: 8,
        buy_price: 25000,
        sell_price: 45000
      });
    const filterPartId = partFilterRes.body.item.id;

    // Helper to create a fresh RO for testing
    async function createFreshRo(plate = 'AG 1822 AB', serviceFee = 150000, discount = 10000) {
      const res = await request(app)
        .post('/api/repair-orders')
        .set('Cookie', authTenantA.cookie)
        .send({
          platNomor: plate,
          namaPemilik: 'Budi Santoso',
          noHp: '081234567890',
          merekModel: 'Toyota Avanza 1.3 G',
          tahun: 2018,
          warna: 'Hitam Metalik',
          odometerMasuk: 65400,
          tanggalMasuk: '2026-10-05',
          keluhan: 'Mesin brebet dan tarikan berat',
          mekanikPj: 'Mas Agus Santoso',
          biayaJasa: serviceFee,
          diskon: discount
        });
      return res.body.id;
    }

    // -------------------------------------------------------------
    // SECTION 1: Stock Underflow & Quantity Validation
    // -------------------------------------------------------------
    console.log(`\n${COLORS.bold}▶ Section 1: Stock Underflow & Quantity Validation${COLORS.reset}`);

    const roSection1Id = await createFreshRo('AG 1111 S1');

    await test('1.1: Stock Underflow Protection — Attaching qty > available returns HTTP 422 with informative message', async () => {
      // Stock of oil is 5. Requesting 6 must fail with 422.
      const res = await request(app)
        .post(`/api/repair-orders/${roSection1Id}/spareparts`)
        .set('Cookie', authTenantA.cookie)
        .send({
          sparepartId: oliPartId,
          qty: 6
        });
      assert.equal(res.status, 422, `Expected 422 Unprocessable Entity, got ${res.status}`);
      assert.ok(res.body.error || res.body.message, 'Response should contain error or message');
      assert.match(res.body.message || res.body.error, /tidak mencukupi/i, 'Should describe insufficient stock');

      // Verify DB stock was NOT modified
      const currentStock = db.prepare('SELECT stock FROM spareparts WHERE id = ?').get(oliPartId).stock;
      assert.equal(currentStock, 5, 'Inventory stock must remain untouched on underflow rejection');
    });

    await test('1.2a: Boundary Quantity — Attaching qty = 0 must be rejected with HTTP 400', async () => {
      const res = await request(app)
        .post(`/api/repair-orders/${roSection1Id}/spareparts`)
        .set('Cookie', authTenantA.cookie)
        .send({
          sparepartId: oliPartId,
          qty: 0
        });
      assert.equal(res.status, 400, `Expected 400 Bad Request for qty = 0, got ${res.status}`);
    });

    await test('1.2b: Boundary Quantity — Attaching negative qty must be rejected with HTTP 400', async () => {
      const res = await request(app)
        .post(`/api/repair-orders/${roSection1Id}/spareparts`)
        .set('Cookie', authTenantA.cookie)
        .send({
          sparepartId: oliPartId,
          qty: -3
        });
      assert.equal(res.status, 400, `Expected 400 Bad Request for negative qty, got ${res.status}`);
    });

    await test('1.2c: Boundary Quantity — Attaching fractional qty (e.g. 1.5) must be rejected with HTTP 400', async () => {
      const res = await request(app)
        .post(`/api/repair-orders/${roSection1Id}/spareparts`)
        .set('Cookie', authTenantA.cookie)
        .send({
          sparepartId: oliPartId,
          qty: 1.5
        });
      assert.equal(res.status, 400, `Expected 400 Bad Request for fractional qty, got ${res.status}`);
    });

    await test('1.2d: Boundary Quantity — Attaching non-numeric string qty (e.g. "abc") must be rejected with HTTP 400 (not 500)', async () => {
      const res = await request(app)
        .post(`/api/repair-orders/${roSection1Id}/spareparts`)
        .set('Cookie', authTenantA.cookie)
        .send({
          sparepartId: oliPartId,
          qty: 'abc'
        });
      assert.equal(res.status, 400, `Expected 400 Bad Request for non-numeric qty, got ${res.status}`);
    });

    await test('1.3: Attaching with negative unit price must be rejected with HTTP 400', async () => {
      const res = await request(app)
        .post(`/api/repair-orders/${roSection1Id}/spareparts`)
        .set('Cookie', authTenantA.cookie)
        .send({
          sparepartId: oliPartId,
          qty: 1,
          hargaSatuan: -50000
        });
      assert.equal(res.status, 400, `Expected 400 Bad Request for negative unit price, got ${res.status}`);
    });

    await test('1.4: Attaching non-existent sparepart ID returns HTTP 404', async () => {
      const fakePartId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .post(`/api/repair-orders/${roSection1Id}/spareparts`)
        .set('Cookie', authTenantA.cookie)
        .send({
          sparepartId: fakePartId,
          qty: 1
        });
      assert.equal(res.status, 404);
    });

    await test('1.5: Attaching sparepart to non-existent RO returns HTTP 404', async () => {
      const fakeRoId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .post(`/api/repair-orders/${fakeRoId}/spareparts`)
        .set('Cookie', authTenantA.cookie)
        .send({
          sparepartId: oliPartId,
          qty: 1
        });
      assert.equal(res.status, 404);
    });

    // Reset inventory stocks to baseline before testing Section 2
    db.prepare('UPDATE spareparts SET stock = 5 WHERE id = ?').run(oliPartId);
    db.prepare('UPDATE spareparts SET stock = 20 WHERE id = ?').run(busiPartId);
    db.prepare('UPDATE spareparts SET stock = 8 WHERE id = ?').run(filterPartId);

    // -------------------------------------------------------------
    // SECTION 2: Detachment Integrity & Floating-Point Drift
    // -------------------------------------------------------------
    console.log(`\n${COLORS.bold}▶ Section 2: Detachment Integrity & Floating-Point Drift${COLORS.reset}`);

    const roSection2Id = await createFreshRo('AG 2222 S2', 150000, 10000);
    let attachedItemId1 = null;
    let attachedItemId2 = null;
    let attachedItemId3 = null;

    await test('2.1: Multi-part attachment with exact financial calculation', async () => {
      // Attach Part 1: Fastron Oil (1 galon @ 350000)
      const res1 = await request(app)
        .post(`/api/repair-orders/${roSection2Id}/spareparts`)
        .set('Cookie', authTenantA.cookie)
        .send({ sparepartId: oliPartId, qty: 1, hargaSatuan: 350000 });
      assert.equal(res1.status, 201);
      attachedItemId1 = res1.body.id;

      // Attach Part 2: Spark Plugs (4 pcs @ 90000)
      const res2 = await request(app)
        .post(`/api/repair-orders/${roSection2Id}/spareparts`)
        .set('Cookie', authTenantA.cookie)
        .send({ sparepartId: busiPartId, qty: 4, hargaSatuan: 90000 });
      assert.equal(res2.status, 201);
      attachedItemId2 = res2.body.id;

      // Attach Part 3: Oil Filter (1 pcs @ 45000)
      const res3 = await request(app)
        .post(`/api/repair-orders/${roSection2Id}/spareparts`)
        .set('Cookie', authTenantA.cookie)
        .send({ sparepartId: filterPartId, qty: 1, hargaSatuan: 45000 });
      assert.equal(res3.status, 201);
      attachedItemId3 = res3.body.id;

      // Check stock decrements:
      // Oil: 5 -> 4
      // Busi: 20 -> 16
      // Filter: 8 -> 7
      assert.equal(db.prepare('SELECT stock FROM spareparts WHERE id = ?').get(oliPartId).stock, 4);
      assert.equal(db.prepare('SELECT stock FROM spareparts WHERE id = ?').get(busiPartId).stock, 16);
      assert.equal(db.prepare('SELECT stock FROM spareparts WHERE id = ?').get(filterPartId).stock, 7);

      // Total parts fee: 350000 + 360000 + 45000 = 755000
      // Total cost: serviceFee (150000) + sparepartFee (755000) - discount (10000) = 895000
      const ro = db.prepare('SELECT service_fee, sparepart_fee, discount, total_cost FROM repair_orders WHERE id = ?').get(roSection2Id);
      assert.equal(ro.sparepart_fee, 755000);
      assert.equal(ro.total_cost, 895000);
    });

    await test('2.2: Detaching middle item (Spark Plugs) perfectly restores stock & re-sums without drift', async () => {
      const res = await request(app)
        .delete(`/api/repair-orders/${roSection2Id}/spareparts/${attachedItemId2}`)
        .set('Cookie', authTenantA.cookie);
      assert.equal(res.status, 200);

      // Verify Busi stock restored: 16 -> 20
      const busiStock = db.prepare('SELECT stock FROM spareparts WHERE id = ?').get(busiPartId).stock;
      assert.equal(busiStock, 20, 'Busi stock must be restored to 20');

      // Verify stock movement OUT was deleted
      const mvt = db.prepare(`
        SELECT * FROM stock_movements 
        WHERE repair_order_id = ? AND sparepart_id = ? AND type = 'OUT'
      `).get(roSection2Id, busiPartId);
      assert.equal(mvt, undefined, 'Stock movement OUT record must be removed on detach');

      // Check recalculated sparepart fee: 755000 - 360000 = 395000
      // Total cost: 150000 + 395000 - 10000 = 535000
      const ro = db.prepare('SELECT sparepart_fee, total_cost FROM repair_orders WHERE id = ?').get(roSection2Id);
      assert.equal(ro.sparepart_fee, 395000);
      assert.equal(ro.total_cost, 535000);
    });

    await test('2.3: Detaching all remaining items restores 100% of initial inventory stock & fees', async () => {
      // Detach Item 1 (Oil)
      await request(app)
        .delete(`/api/repair-orders/${roSection2Id}/spareparts/${attachedItemId1}`)
        .set('Cookie', authTenantA.cookie)
        .expect(200);

      // Detach Item 3 (Filter)
      await request(app)
        .delete(`/api/repair-orders/${roSection2Id}/spareparts/${attachedItemId3}`)
        .set('Cookie', authTenantA.cookie)
        .expect(200);

      // Verify all stocks 100% restored
      assert.equal(db.prepare('SELECT stock FROM spareparts WHERE id = ?').get(oliPartId).stock, 5);
      assert.equal(db.prepare('SELECT stock FROM spareparts WHERE id = ?').get(busiPartId).stock, 20);
      assert.equal(db.prepare('SELECT stock FROM spareparts WHERE id = ?').get(filterPartId).stock, 8);

      // Verify RO totals: sparepart_fee = 0, total_cost = 150000 - 10000 = 140000
      const ro = db.prepare('SELECT sparepart_fee, total_cost FROM repair_orders WHERE id = ?').get(roSection2Id);
      assert.equal(ro.sparepart_fee, 0);
      assert.equal(ro.total_cost, 140000);
    });

    await test('2.4: Detaching already detached item ID returns HTTP 404', async () => {
      const res = await request(app)
        .delete(`/api/repair-orders/${roSection2Id}/spareparts/${attachedItemId1}`)
        .set('Cookie', authTenantA.cookie);
      assert.equal(res.status, 404);
    });

    // -------------------------------------------------------------
    // SECTION 3: RO Lifecycle Transitions & Audit Trail
    // -------------------------------------------------------------
    console.log(`\n${COLORS.bold}▶ Section 3: RO Lifecycle Transitions & Audit Trail${COLORS.reset}`);

    const roSection3Id = await createFreshRo('AG 3333 S3');

    const lifecycleStages = [
      { input: 'PEMERIKSAAN', expected: 'DIAGNOSA' },
      { input: 'PENGERJAAN', expected: 'PENGERJAAN' },
      { input: 'MENUNGGU_SPAREPART', expected: 'MENUNGGU_PART' },
      { input: 'SELESAI', expected: 'SELESAI' }
    ];

    for (const stage of lifecycleStages) {
      await test(`3.1: Lifecycle Transition to ${stage.input} (normalizes to ${stage.expected})`, async () => {
        const res = await request(app)
          .post(`/api/repair-orders/${roSection3Id}/status`)
          .set('Cookie', authTenantA.cookie)
          .send({
            status: stage.input,
            catatan: `Tahap perbaikan: ${stage.expected}`
          });
        assert.equal(res.status, 200);
        assert.equal(res.body.status, stage.expected);

        // Verify audit log entry exists
        const log = db.prepare(`
          SELECT * FROM ro_status_logs 
          WHERE repair_order_id = ? AND new_status = ? 
          ORDER BY created_at DESC LIMIT 1
        `).get(roSection3Id, stage.expected);
        assert.ok(log, `Audit log for ${stage.expected} must be created`);
      });
    }

    await test('3.2: Rejects invalid status transition with HTTP 400', async () => {
      const res = await request(app)
        .post(`/api/repair-orders/${roSection3Id}/status`)
        .set('Cookie', authTenantA.cookie)
        .send({ status: 'BATAL_SERVIS' });
      assert.equal(res.status, 400);
      assert.match(res.body.error, /tidak valid/i);
    });

    // -------------------------------------------------------------
    // SECTION 4: Auto-Record Income & Idempotency on DIAMBIL
    // -------------------------------------------------------------
    console.log(`\n${COLORS.bold}▶ Section 4: Auto-Record Income & Idempotency on DIAMBIL${COLORS.reset}`);

    const roSection4Id = await createFreshRo('AG 4444 S4', 150000, 10000);
    // Attach 1 oil to roSection4Id
    await request(app)
      .post(`/api/repair-orders/${roSection4Id}/spareparts`)
      .set('Cookie', authTenantA.cookie)
      .send({ sparepartId: oliPartId, qty: 1, hargaSatuan: 350000 })
      .expect(201);

    await test('4.1: Transition to DIAMBIL with autoRecordIncome: true inserts financial income record', async () => {
      // Current RO total_cost: 150000 (jasa) + 350000 (oli) - 10000 (diskon) = 490000
      const currentRo = db.prepare('SELECT total_cost FROM repair_orders WHERE id = ?').get(roSection4Id);
      assert.equal(currentRo.total_cost, 490000);

      const res = await request(app)
        .post(`/api/repair-orders/${roSection4Id}/status`)
        .set('Cookie', authTenantA.cookie)
        .send({
          status: 'DIAMBIL',
          catatan: 'Kendaraan diserahkan ke pemilik, lunas via QRIS',
          autoRecordIncome: true,
          metodePembayaran: 'QRIS'
        });
      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'DIAMBIL');

      // Verify transaction in DB
      const trxs = db.prepare(`
        SELECT * FROM transactions 
        WHERE tenant_id = ? AND repair_order_id = ? AND type = 'INCOME'
      `).all(authTenantA.tenant.id, roSection4Id);
      assert.equal(trxs.length, 1, 'Exactly one transaction should be created');
      assert.equal(trxs[0].amount, 490000);
      assert.equal(trxs[0].payment_method, 'QRIS');
      assert.match(trxs[0].description, /AG 4444 S4/);
    });

    await test('4.2: Repeated status transition to DIAMBIL does NOT duplicate income entries (idempotent)', async () => {
      // Transition again with TRANSFER
      const res1 = await request(app)
        .post(`/api/repair-orders/${roSection4Id}/status`)
        .set('Cookie', authTenantA.cookie)
        .send({
          status: 'DIAMBIL',
          catatan: 'Konfirmasi ulang penyerahan kendaraan',
          autoRecordIncome: true,
          metodePembayaran: 'TRANSFER'
        });
      assert.equal(res1.status, 200);

      // Transition third time with CASH
      const res2 = await request(app)
        .post(`/api/repair-orders/${roSection4Id}/status`)
        .set('Cookie', authTenantA.cookie)
        .send({
          status: 'DIAMBIL',
          catatan: 'Update metode bayar',
          autoRecordIncome: true,
          metodePembayaran: 'CASH'
        });
      assert.equal(res2.status, 200);

      // Verify still exactly ONE transaction exists
      const trxs = db.prepare(`
        SELECT * FROM transactions 
        WHERE tenant_id = ? AND repair_order_id = ? AND type = 'INCOME'
      `).all(authTenantA.tenant.id, roSection4Id);
      assert.equal(trxs.length, 1, 'Should NOT create duplicate financial transactions on repeated DIAMBIL');
      assert.equal(trxs[0].amount, 490000);
      assert.equal(trxs[0].payment_method, 'CASH', 'Should update existing transaction payment method');
    });

    await test('4.3: Financial summary endpoint reflects auto-recorded income immediately', async () => {
      const summaryRes = await request(app)
        .get('/api/finance/summary')
        .set('Cookie', authTenantA.cookie);
      assert.equal(summaryRes.status, 200);
      const totalIncome = summaryRes.body.total_income || summaryRes.body.totalIncome;
      assert.ok(totalIncome >= 490000, `Expected total_income >= 490000, got ${totalIncome}`);
    });

    // -------------------------------------------------------------
    // SECTION 5: Invoice PDF Generation
    // -------------------------------------------------------------
    console.log(`\n${COLORS.bold}▶ Section 5: Invoice PDF Generation${COLORS.reset}`);

    await test('5.1: Zero-spareparts invoice PDF returns valid %PDF- stream', async () => {
      const emptyRoId = await createFreshRo('AG 5555 EMPTY', 75000, 0);

      const pdfRes = await request(app)
        .get(`/api/repair-orders/${emptyRoId}/invoice-pdf`)
        .set('Cookie', authTenantA.cookie);
      assert.equal(pdfRes.status, 200);
      assert.equal(pdfRes.headers['content-type'], 'application/pdf');
      const header = pdfRes.body.slice(0, 5).toString('ascii');
      assert.equal(header, '%PDF-', 'Buffer must begin with %PDF- header');
      assert.ok(pdfRes.body.length > 500, 'PDF buffer must not be empty');
    });

    await test('5.2: Multi-page invoice PDF with 15+ spareparts paginates cleanly without crash', async () => {
      const heavyRoId = await createFreshRo('AG 7777 HEAVY', 1500000, 0);

      // Create 15 distinct parts & attach to RO
      for (let i = 1; i <= 15; i++) {
        const pRes = await request(app)
          .post('/api/inventory')
          .set('Cookie', authTenantA.cookie)
          .send({
            sku: `BULK-PART-${i}`,
            name: `Heavy Repair Component #${i} (Spec OEM)`,
            category: 'Umum',
            stock: 50,
            sell_price: 25000 * i
          });
        await request(app)
          .post(`/api/repair-orders/${heavyRoId}/spareparts`)
          .set('Cookie', authTenantA.cookie)
          .send({
            sparepartId: pRes.body.item.id,
            qty: 1
          });
      }

      const pdfRes = await request(app)
        .get(`/api/repair-orders/${heavyRoId}/invoice-pdf`)
        .set('Cookie', authTenantA.cookie);
      assert.equal(pdfRes.status, 200);
      assert.equal(pdfRes.headers['content-type'], 'application/pdf');
      const header = pdfRes.body.slice(0, 5).toString('ascii');
      assert.equal(header, '%PDF-', 'Multi-page buffer must begin with %PDF-');
      assert.ok(pdfRes.body.length > 3000, `Expected multi-page PDF > 3KB, got ${pdfRes.body.length} bytes`);
    });

    await test('5.3: Alias route /api/repair-orders/:id/invoice/pdf works identically', async () => {
      const pdfRes = await request(app)
        .get(`/api/repair-orders/${roSection4Id}/invoice/pdf`)
        .set('Cookie', authTenantA.cookie);
      assert.equal(pdfRes.status, 200);
      assert.equal(pdfRes.headers['content-type'], 'application/pdf');
      assert.equal(pdfRes.body.slice(0, 5).toString('ascii'), '%PDF-');
    });

    // -------------------------------------------------------------
    // SECTION 6: Multi-Tenant Boundary Isolation
    // -------------------------------------------------------------
    console.log(`\n${COLORS.bold}▶ Section 6: Multi-Tenant Boundary Isolation${COLORS.reset}`);

    await test('6.1: Tenant B cannot view Tenant A repair orders in list', async () => {
      const res = await request(app)
        .get('/api/repair-orders')
        .set('Cookie', authTenantB.cookie);
      assert.equal(res.status, 200);
      const orders = res.body.repair_orders || [];
      const leaked = orders.some(o => o.id === roSection4Id || o.tenant_id === authTenantA.tenant.id);
      assert.equal(leaked, false, 'Tenant B must not see any Tenant A repair orders');
    });

    await test('6.2: Tenant B cannot access Tenant A repair order detail (returns 404)', async () => {
      const res = await request(app)
        .get(`/api/repair-orders/${roSection4Id}`)
        .set('Cookie', authTenantB.cookie);
      assert.equal(res.status, 404);
    });

    await test('6.3: Tenant B cannot update Tenant A repair order (returns 404)', async () => {
      const res = await request(app)
        .put(`/api/repair-orders/${roSection4Id}`)
        .set('Cookie', authTenantB.cookie)
        .send({ notes: 'Hacked by Tenant B' });
      assert.equal(res.status, 404);
    });

    await test('6.4: Tenant B cannot change status of Tenant A repair order (returns 404)', async () => {
      const res = await request(app)
        .post(`/api/repair-orders/${roSection4Id}/status`)
        .set('Cookie', authTenantB.cookie)
        .send({ status: 'MASUK' });
      assert.equal(res.status, 404);
    });

    await test('6.5: Tenant B cannot attach sparepart to Tenant A repair order (returns 404)', async () => {
      const res = await request(app)
        .post(`/api/repair-orders/${roSection4Id}/spareparts`)
        .set('Cookie', authTenantB.cookie)
        .send({ sparepartId: oliPartId, qty: 1 });
      assert.equal(res.status, 404);
    });

    await test('6.6: Tenant B cannot hijack Tenant A sparepart into Tenant B repair order (returns 404)', async () => {
      // Create Tenant B RO
      const roBRes = await request(app)
        .post('/api/repair-orders')
        .set('Cookie', authTenantB.cookie)
        .send({
          platNomor: 'AG 8888 BB',
          namaPemilik: 'Tenant B Customer'
        });
      const roBId = roBRes.body.id;

      // Attempt to attach Tenant A's oliPartId into Tenant B's RO
      const res = await request(app)
        .post(`/api/repair-orders/${roBId}/spareparts`)
        .set('Cookie', authTenantB.cookie)
        .send({ sparepartId: oliPartId, qty: 1 });
      assert.equal(res.status, 404, `Expected 404 for foreign sparepartId, got ${res.status}`);
    });

    await test('6.7: Tenant B cannot download Tenant A invoice PDF (returns 404)', async () => {
      const res = await request(app)
        .get(`/api/repair-orders/${roSection4Id}/invoice-pdf`)
        .set('Cookie', authTenantB.cookie);
      assert.equal(res.status, 404);
    });

    // -------------------------------------------------------------
    // SECTION 7: Validation Boundaries & SQL Injection Resistance
    // -------------------------------------------------------------
    console.log(`\n${COLORS.bold}▶ Section 7: Validation Boundaries & SQL Injection Resistance${COLORS.reset}`);

    await test('7.1: Rejects RO creation without plate number with HTTP 400', async () => {
      const res = await request(app)
        .post('/api/repair-orders')
        .set('Cookie', authTenantA.cookie)
        .send({ namaPemilik: 'Nama Tanpa Plat' });
      assert.equal(res.status, 400);
      assert.match(res.body.error, /plat nomor/i);
    });

    await test('7.2: Rejects RO creation without customer name with HTTP 400', async () => {
      const res = await request(app)
        .post('/api/repair-orders')
        .set('Cookie', authTenantA.cookie)
        .send({ platNomor: 'AG 9999 PL' });
      assert.equal(res.status, 400);
      assert.match(res.body.error, /nama pemilik/i);
    });

    await test('7.3: SQL Injection resistance in search parameter', async () => {
      const res = await request(app)
        .get('/api/repair-orders?search=' + encodeURIComponent("' OR '1'='1' --"))
        .set('Cookie', authTenantA.cookie);
      assert.equal(res.status, 200);
      // Parameterized query must not leak all rows or crash
      assert.equal(res.body.repair_orders.length, 0);
    });

    await test('7.4: SQL Injection resistance in status parameter', async () => {
      const res = await request(app)
        .get('/api/repair-orders?status=' + encodeURIComponent("MASUK' OR 1=1 --"))
        .set('Cookie', authTenantA.cookie);
      assert.equal(res.status, 200);
      assert.equal(res.body.repair_orders.length, 0);
    });

  } finally {
    cleanup();
  }

  // Summary
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  console.log(`\n${COLORS.bold}----------------------------------------------------------------${COLORS.reset}`);
  console.log(`${COLORS.bold}Adversarial RO Lifecycle Test Summary:${COLORS.reset}`);
  console.log(`  Total:  ${results.length}`);
  console.log(`  Passed: ${COLORS.green}${passed}${COLORS.reset}`);
  console.log(`  Failed: ${failed > 0 ? COLORS.red : COLORS.green}${failed}${COLORS.reset}`);
  console.log(`${COLORS.bold}----------------------------------------------------------------${COLORS.reset}\n`);

  if (failed > 0) {
    console.log(`${COLORS.yellow}Failed Challenges:${COLORS.reset}`);
    results.filter(r => !r.pass).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
  }
}

run().catch(err => {
  console.error('Test harness crashed:', err);
  process.exit(1);
});
