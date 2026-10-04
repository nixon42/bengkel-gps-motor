#!/usr/bin/env node
/**
 * Milestone 3 Comprehensive Verification Runner
 * Validates Sparepart Inventory CRUD, Mutasi Stok, Opname,
 * Auto Margin Calculations, and all CSV & PDF Exports.
 */

import request from 'supertest';
import assert from 'node:assert/strict';
import { createTestApp, loginUser, oracleProfitMargin } from './supertestHelper.js';
import { FIXTURES } from './fixtures.js';

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m'
};

async function runM3Verification() {
  console.log(`\n${COLORS.bold}================================================================${COLORS.reset}`);
  console.log(`${COLORS.bold}  Milestone 3: Comprehensive Verification Test Suite            ${COLORS.reset}`);
  console.log(`${COLORS.bold}================================================================${COLORS.reset}\n`);

  const { app, db, cleanup } = createTestApp();
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      passed++;
      console.log(`  ${COLORS.green}✔ PASS${COLORS.reset} ${name}`);
    } catch (err) {
      failed++;
      console.log(`  ${COLORS.red}✖ FAIL${COLORS.reset} ${name}`);
      console.error(err);
    }
  }

  try {
    const authGps = await loginUser(app, { tenantSlug: FIXTURES.tenants.gpsMotor.slug, email: FIXTURES.users.gpsAdmin.email });
    const authBerkah = await loginUser(app, { tenantSlug: FIXTURES.tenants.berkahKediri.slug, email: FIXTURES.users.berkahAdmin.email });

    // 1. Create Parts with Profit Margins
    let oliId = null;
    await test('M3.1: Create spareparts with automatic profit margin and Indonesian field names', async () => {
      const res = await request(app)
        .post('/api/inventory')
        .set('Cookie', authGps.cookie)
        .send(FIXTURES.spareparts.oliShell)
        .expect(201);

      oliId = res.body.id || res.body.item.id;
      assert.ok(oliId);
      assert.equal(res.body.item.stock, 15);
      assert.equal(res.body.item.sku, 'OIL-SH-10W40');

      // Margin: ((330000 - 260000) / 330000) * 100 = 21.21%
      const expected = oracleProfitMargin(260000, 330000);
      assert.equal(Math.round(res.body.profit_margin_percent), Math.round(expected.percentage));
      assert.equal(res.body.profit_margin_nominal, 70000);
    });

    // 2. Edge Case E08: Divide-by-zero safety
    await test('M3.2 (E08): Divide-by-zero margin safety when buy_price = 0', async () => {
      const res = await request(app)
        .post('/api/inventory')
        .set('Cookie', authGps.cookie)
        .send(FIXTURES.spareparts.hibahBonusStiker)
        .expect(201);

      assert.ok(Number.isFinite(res.body.profit_margin_percent));
      assert.ok(!Number.isNaN(res.body.profit_margin_percent));
      assert.equal(res.body.profit_margin_nominal, 5000);
    });

    // 3. Edge Case E09: Negative profit margin (Selling at loss)
    let lossPartId = null;
    await test('M3.3 (E09): Negative profit margin when sell_price < buy_price', async () => {
      const res = await request(app)
        .post('/api/inventory')
        .set('Cookie', authGps.cookie)
        .send({
          sku: 'RUGI-DISC-01',
          nama: 'Oli Cuci Gudang Rugi',
          kategori: 'Oli',
          satuan: 'botol',
          stok: 10,
          stokMinimum: 2,
          hargaBeli: 100000,
          hargaJual: 80000
        })
        .expect(201);

      lossPartId = res.body.id;
      assert.equal(res.body.profit_margin_nominal, -20000);
      assert.ok(res.body.profit_margin_percent < 0);
      assert.equal(res.body.item.is_loss, true);
    });

    // 4. Advanced Search, Multi-Filter, Sorting & Pagination
    await test('M3.4: Advanced search, category filter, stock status filter, and pagination', async () => {
      // Create additional items with distinct SKUs
      await request(app).post('/api/inventory').set('Cookie', authGps.cookie).send(FIXTURES.spareparts.filterOliAvanza).expect(201);
      await request(app).post('/api/inventory').set('Cookie', authGps.cookie).send(FIXTURES.spareparts.kampasRemDepan).expect(201);

      // Search by name
      const resSearch = await request(app).get('/api/inventory?search=Filter').set('Cookie', authGps.cookie).expect(200);
      assert.ok(resSearch.body.items.length >= 1);
      assert.ok(resSearch.body.items.some(i => i.sku === FIXTURES.spareparts.filterOliAvanza.sku));

      // Filter by category
      const resCat = await request(app).get('/api/inventory?category=Filter').set('Cookie', authGps.cookie).expect(200);
      assert.ok(resCat.body.items.every(i => i.category === 'Filter'));

      // Pagination
      const resPage = await request(app).get('/api/inventory?page=1&limit=2').set('Cookie', authGps.cookie).expect(200);
      assert.equal(resPage.body.items.length, 2);
      assert.ok(resPage.body.pagination.total >= 4);
    });

    // 5. Tenant Isolation
    await test('M3.5: Strict tenant isolation for inventory and cross-tenant blocking', async () => {
      const resBerkah = await request(app).get('/api/inventory').set('Cookie', authBerkah.cookie).expect(200);
      assert.equal(resBerkah.body.items.length, 0, 'Tenant Berkah must not see GPS Motor parts');

      const resDirect = await request(app).get(`/api/inventory/${oliId}`).set('Cookie', authBerkah.cookie);
      assert.ok(resDirect.status === 404 || resDirect.status === 403);
    });

    // 6. Mutasi Stok - Barang Masuk (Restock)
    await test('M3.6: Barang Masuk (Restock) atomically increments stock and logs movement', async () => {
      const initialStock = db.prepare('SELECT stock FROM spareparts WHERE id = ?').get(oliId).stock;

      const res = await request(app)
        .post('/api/stock-movements/in')
        .set('Cookie', authGps.cookie)
        .send({
          sparepartId: oliId,
          qty: 10,
          tanggal: '2026-10-04',
          supplier: 'Distributor Resmi Shell',
          invoiceNumber: 'INV-2026-001',
          catatan: 'Restock batch bulanan'
        })
        .expect(201);

      assert.equal(res.body.newStock, initialStock + 10);
      const after = db.prepare('SELECT stock FROM spareparts WHERE id = ?').get(oliId).stock;
      assert.equal(after, initialStock + 10);
    });

    // 7. Mutasi Stok - Barang Keluar & E10 Underflow Protection
    await test('M3.7 (E10): Barang Keluar decrements stock and rejects underflow (requested > available)', async () => {
      const currentStock = db.prepare('SELECT stock FROM spareparts WHERE id = ?').get(oliId).stock;

      // Legitimate deduction
      const resValid = await request(app)
        .post('/api/stock-movements/out')
        .set('Cookie', authGps.cookie)
        .send({
          sparepartId: oliId,
          qty: 5,
          tanggal: '2026-10-04',
          catatan: 'Pemakaian servis reguler'
        })
        .expect(201);

      assert.equal(resValid.body.newStock, currentStock - 5);

      // Underflow attempt
      const resUnderflow = await request(app)
        .post('/api/stock-movements/out')
        .set('Cookie', authGps.cookie)
        .send({
          sparepartId: oliId,
          qty: 9999,
          tanggal: '2026-10-04',
          catatan: 'Permintaan mustahil'
        })
        .expect(422);

      assert.ok(resUnderflow.body.message.includes('Stok tidak mencukupi'));
    });

    // 8. Stok Opname & E11 Negative Discrepancy
    await test('M3.8 (E11): Stok Opname reconciles physical stock, logs discrepancy and audit reason', async () => {
      // Force discrepancy: physical stock 12
      const res = await request(app)
        .post('/api/stock-opname')
        .set('Cookie', authGps.cookie)
        .send({
          sparepartId: oliId,
          stokFisik: 12,
          tanggal: '2026-10-04',
          alasan: 'Audit fisik: 1 galon bocor di gudang'
        })
        .expect(201);

      assert.equal(res.body.newStock, 12);
      const dbPart = db.prepare('SELECT stock FROM spareparts WHERE id = ?').get(oliId);
      assert.equal(dbPart.stock, 12);

      // Verify stock_opnames record
      const opname = db.prepare('SELECT * FROM stock_opnames WHERE sparepart_id = ? ORDER BY created_at DESC').get(oliId);
      assert.ok(opname);
      assert.equal(opname.physical_stock, 12);
      assert.ok(opname.reason.includes('bocor'));
    });

    // 9. Valuation Report (JSON, CSV, PDF)
    await test('M3.9: Inventory Valuation calculations (Buy Value, Sell Value, Potential Gross Profit)', async () => {
      const resJson = await request(app)
        .get('/api/inventory/reports/valuation')
        .set('Cookie', authGps.cookie)
        .expect(200);

      assert.ok(resJson.body.total_buy_value > 0);
      assert.ok(resJson.body.total_sell_value > 0);
      assert.ok(resJson.body.potential_gross_profit !== undefined);
      assert.ok(Number.isFinite(resJson.body.profit_margin_percent));

      // CSV export
      const resCsv = await request(app)
        .get('/api/inventory/reports/valuation/csv')
        .set('Cookie', authGps.cookie)
        .expect(200);

      assert.ok(resCsv.headers['content-type'].includes('csv') || resCsv.headers['content-type'].includes('text'));
      assert.ok(resCsv.text.includes('Total Modal Beli'));

      // PDF export
      const resPdf = await request(app)
        .get('/api/inventory/reports/valuation/pdf')
        .set('Cookie', authGps.cookie)
        .expect(200);

      assert.ok(resPdf.headers['content-type'].includes('pdf'));
      assert.ok(resPdf.body instanceof Buffer);
      assert.ok(resPdf.body.toString('binary', 0, 5).startsWith('%PDF-'));
    });

    // 10. Inventory Full CSV & PDF Exports (E18 RFC-4180 Escaping)
    await test('M3.10 (E18): Inventory Full CSV and PDF exports with RFC-4180 escaping', async () => {
      // Insert item with commas, quotes, and newlines in description/name
      await request(app)
        .post('/api/inventory')
        .set('Cookie', authGps.cookie)
        .send({
          sku: 'ESC-TEST-01',
          nama: 'Brake Pad "Special Edition", Heavy Duty',
          kategori: 'Rem',
          satuan: 'set',
          stok: 5,
          stokMinimum: 1,
          hargaBeli: 200000,
          hargaJual: 300000,
          supplier: 'PT Vendor, Inc. "Official"'
        })
        .expect(201);

      const resCsv = await request(app)
        .get('/api/inventory/export/csv')
        .set('Cookie', authGps.cookie)
        .expect(200);

      assert.ok(resCsv.headers['content-type'].includes('csv'));
      // Check RFC-4180 quoting
      assert.ok(resCsv.text.includes('"Brake Pad ""Special Edition"", Heavy Duty"'));
      assert.ok(resCsv.text.includes('"PT Vendor, Inc. ""Official"""'));

      // PDF export
      const resPdf = await request(app)
        .get('/api/inventory/export/pdf')
        .set('Cookie', authGps.cookie)
        .expect(200);

      assert.ok(resPdf.headers['content-type'].includes('pdf'));
      assert.ok(resPdf.body.toString('binary', 0, 5).startsWith('%PDF-'));
    });

    // 11. Low-Stock PDF Report
    await test('M3.11: Low-stock PDF report generates correctly', async () => {
      const res = await request(app)
        .get('/api/inventory/export/low-stock/pdf')
        .set('Cookie', authGps.cookie)
        .expect(200);

      assert.ok(res.headers['content-type'].includes('pdf'));
      assert.ok(res.body.toString('binary', 0, 5).startsWith('%PDF-'));
    });

    // 12. Stock Movements CSV & PDF Exports
    await test('M3.12: Stock movements CSV and PDF exports return valid file streams', async () => {
      const resCsv = await request(app)
        .get('/api/stock-movements/export/csv')
        .set('Cookie', authGps.cookie)
        .expect(200);

      assert.ok(resCsv.headers['content-type'].includes('csv'));
      assert.ok(resCsv.text.includes('Tipe Mutasi'));

      const resPdf = await request(app)
        .get('/api/stock-movements/export/pdf')
        .set('Cookie', authGps.cookie)
        .expect(200);

      assert.ok(resPdf.headers['content-type'].includes('pdf'));
      assert.ok(resPdf.body.toString('binary', 0, 5).startsWith('%PDF-'));
    });

    // 13. Update and Delete Sparepart
    await test('M3.13: Update sparepart and delete safety check', async () => {
      const resUpdate = await request(app)
        .put(`/api/inventory/${oliId}`)
        .set('Cookie', authGps.cookie)
        .send({
          name: 'Oli Shell Helix HX7 10W-40 (Updated)',
          hargaJual: 350000
        })
        .expect(200);

      assert.equal(resUpdate.body.item.name, 'Oli Shell Helix HX7 10W-40 (Updated)');
      assert.equal(resUpdate.body.item.sell_price, 350000);

      // Soft delete check because it has movements
      const resDelete = await request(app)
        .delete(`/api/inventory/${oliId}`)
        .set('Cookie', authGps.cookie)
        .expect(200);

      assert.ok(resDelete.body.success);
      const afterPart = db.prepare('SELECT is_active FROM spareparts WHERE id = ?').get(oliId);
      assert.equal(afterPart.is_active, 0);
    });

  } finally {
    cleanup();
  }

  console.log(`\n${COLORS.bold}----------------------------------------------------------------${COLORS.reset}`);
  console.log(`  M3 Verification Summary: Passed: ${passed}, Failed: ${failed}`);
  console.log(`${COLORS.bold}----------------------------------------------------------------${COLORS.reset}\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runM3Verification();
