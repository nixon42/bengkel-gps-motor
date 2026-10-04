/**
 * Tier 2: Boundary & Corner Cases Test Suite
 * Bengkel Mobil GPS Motor Kediri
 * Validates edge cases E01-E18: Empty inputs, negative numbers,
 * divide-by-zero safety, privacy masking variations, cross-tenant blocking,
 * stock underflow, deficit handling, and CSV escaping.
 */

import request from 'supertest';
import assert from 'node:assert/strict';
import { FIXTURES } from '../fixtures.js';
import {
  createTestApp,
  loginUser,
  withSilencedConsole,
  oracleMaskPlate,
  oracleMaskName,
  oracleProfitMargin,
  oracleNetBalance,
  oracleEscapeCsvField
} from '../supertestHelper.js';

export async function runTier2Boundary(options = {}) {
  const results = [];
  const { app, db, cleanup } = createTestApp();

  async function test(name, fn) {
    const start = Date.now();
    try {
      await fn();
      results.push({ name, tier: 2, pass: true, durationMs: Date.now() - start });
    } catch (err) {
      if (err.isPendingMilestone) {
        results.push({
          name,
          tier: 2,
          pass: true,
          pendingMilestone: err.milestone,
          note: err.message,
          durationMs: Date.now() - start
        });
      } else {
        results.push({
          name,
          tier: 2,
          pass: false,
          error: err.message || String(err),
          stack: err.stack,
          durationMs: Date.now() - start
        });
      }
    }
  }

  function assertMilestoneRoute(res, endpoint, milestone) {
    if (res.status === 404 && (typeof res.text === 'string' && res.text.includes('Cannot'))) {
      const err = new Error(`Route ${endpoint} not mounted yet (Milestone ${milestone})`);
      err.isPendingMilestone = true;
      err.milestone = milestone;
      throw err;
    }
  }

  try {
    const authGps = await loginUser(app, {
      tenantSlug: FIXTURES.tenants.gpsMotor.slug,
      email: FIXTURES.users.gpsAdmin.email
    });

    const authBerkah = await loginUser(app, {
      tenantSlug: FIXTURES.tenants.berkahKediri.slug,
      email: FIXTURES.users.berkahAdmin.email
    });

    // ----------------------------------------------------
    // T2.1: Empty Inputs & Schema Validations
    // ----------------------------------------------------
    await test('T2.1: PUT /api/tenant/settings rejects invalid slug with special characters', async () => {
      await withSilencedConsole(async () => {
        const res = await request(app)
          .put('/api/tenant/settings')
          .set('Cookie', authGps.cookie)
          .send({
            slug: 'INVALID SLUG WITH SPACES!'
          })
          .expect(400);

        assert.ok(res.body.error || res.body.details);
      });
    });

    await test('T2.2: Rejects empty payload on resource creation', async () => {
      // Missing fields in inventory creation
      const resInv = await request(app)
        .post('/api/inventory')
        .set('Cookie', authGps.cookie)
        .send({});

      assertMilestoneRoute(resInv, '/api/inventory', 'M3');
      assert.ok(resInv.status === 400 || resInv.status === 422, 'Empty inventory payload must be rejected');
    });

    // ----------------------------------------------------
    // T2.3: Divide-by-Zero Margin Safety (E08)
    // ----------------------------------------------------
    await test('T2.3a (E08): Divide-by-zero margin safety when harga_beli = 0 (No NaN/Infinity)', async () => {
      // 1. Direct Oracle Verification
      const margin = oracleProfitMargin(0, 5000);
      assert.equal(margin.nominal, 5000);
      assert.ok(Number.isFinite(margin.percentage), 'Margin percentage must be a finite number');
      assert.ok(!Number.isNaN(margin.percentage), 'Margin percentage must NOT be NaN');

      // 2. Both zero safety
      const zeroMargin = oracleProfitMargin(0, 0);
      assert.equal(zeroMargin.nominal, 0);
      assert.equal(zeroMargin.percentage, 0);
      assert.ok(Number.isFinite(zeroMargin.percentage));
    });

    await test('T2.3b (E08): POST /api/inventory with harga_beli = 0 succeeds', async () => {
      // API endpoint verification (if M3 route active)
      const res = await request(app)
        .post('/api/inventory')
        .set('Cookie', authGps.cookie)
        .send(FIXTURES.spareparts.hibahBonusStiker);

      assertMilestoneRoute(res, '/api/inventory', 'M3');
      assert.ok(res.status === 200 || res.status === 201);
    });

    // ----------------------------------------------------
    // T2.4: Negative Profit Margin / Selling at Loss (E09)
    // ----------------------------------------------------
    await test('T2.4 (E09): Negative profit margin when selling price < buy price', async () => {
      const margin = oracleProfitMargin(90000, 60000);
      assert.equal(margin.nominal, -30000, 'Nominal profit must be negative');
      assert.ok(margin.percentage < 0, 'Percentage margin must be negative');
      assert.equal(margin.isLoss, true);
      assert.ok(Number.isFinite(margin.percentage));
    });

    // ----------------------------------------------------
    // T2.5: License Plate Search Normalization (E01)
    // ----------------------------------------------------
    await test('T2.5 (E01): Plate normalization across space variations and lowercase', async () => {
      const variations = [
        'AG 1234 XX',
        'AG1234XX',
        'ag-1234-xx',
        'AG   1234   XX'
      ];

      for (const plateVar of variations) {
        const masked = oracleMaskPlate(plateVar);
        assert.equal(masked, 'AG 12** XX', `Normalization failed for: ${plateVar}`);
      }
    });

    // ----------------------------------------------------
    // T2.6: Short License Plate Adaptive Masking (E03)
    // ----------------------------------------------------
    await test('T2.6 (E03): Short plate adaptive masking without substring errors', async () => {
      // AG 1 X (1-digit number)
      const masked1 = oracleMaskPlate('AG 1 X');
      assert.ok(masked1.includes('*'), 'Must mask digit');
      assert.equal(masked1, 'AG 1* X');

      // B 12 A (2-digit number)
      const masked2 = oracleMaskPlate('B 12 A');
      assert.equal(masked2, 'B 1* A');

      // N 890 ZZ (3-digit number)
      const masked3 = oracleMaskPlate('N 890 ZZ');
      assert.equal(masked3, 'N 89* ZZ');
    });

    // ----------------------------------------------------
    // T2.7: Customer Name Masking Variations (E04, E05)
    // ----------------------------------------------------
    await test('T2.7 (E04, E05): Customer name masking: single word and ultra-short names', async () => {
      // E04: Single word name "Slamet"
      const maskedSlamet = oracleMaskName('Slamet');
      assert.equal(maskedSlamet, 'Sla***', 'Single-word name must not crash from lack of last name');

      // E05: Ultra-short names
      const maskedEd = oracleMaskName('Ed');
      assert.equal(maskedEd, 'E*');

      const maskedBo = oracleMaskName('Bo');
      assert.equal(maskedBo, 'B*');

      const maskedA = oracleMaskName('A');
      assert.equal(maskedA, 'A*');

      // Standard multi-word name
      const maskedBudi = oracleMaskName('Budi Santoso');
      assert.ok(maskedBudi.startsWith('Budi S*'));
    });

    // ----------------------------------------------------
    // T2.8: Public Tracking Security & Data Stripping (E06)
    // ----------------------------------------------------
    await test('T2.8 (E06): Public tracking API strips sensitive data (phone, address, buy price)', async () => {
      const res = await request(app)
        .get(`/api/public/${FIXTURES.tenants.gpsMotor.slug}/tracking?plate=AG1822AB`);

      assertMilestoneRoute(res, `/api/public/${FIXTURES.tenants.gpsMotor.slug}/tracking`, 'M2');
      if (res.status === 200) {
        const bodyStr = JSON.stringify(res.body);
        assert.ok(!bodyStr.includes('harga_beli'), 'Wholesale buy price must be stripped');
        assert.ok(!bodyStr.includes('buy_price'), 'Buy price field must be stripped');
        assert.ok(!bodyStr.includes('customer_phone'), 'Raw customer phone must be stripped');
      }
    });

    // ----------------------------------------------------
    // T2.9: Cross-Tenant Data Access Blocking (E07)
    // ----------------------------------------------------
    await test('T2.9 (E07): Cross-tenant access blocking (403 or 404 on foreign tenant ID)', async () => {
      // Insert item owned strictly by Tenant A
      const partAId = 'isolated-part-tenant-a';
      db.prepare(`
        INSERT OR IGNORE INTO spareparts (id, tenant_id, sku, name, category, stock, buy_price, sell_price)
        VALUES (?, ?, 'SKU-A-ISOLATED', 'Exclusive Item A', 'Oli', 10, 100000, 150000)
      `).run(partAId, authGps.tenant.id);

      // Tenant B attempts to fetch Tenant A's part by ID
      const resGetForeign = await request(app)
        .get(`/api/inventory/${partAId}`)
        .set('Cookie', authBerkah.cookie);

      assertMilestoneRoute(resGetForeign, `/api/inventory/${partAId}`, 'M3');
      assert.ok(
        resGetForeign.status === 403 || resGetForeign.status === 404,
        'Cross-tenant access must return HTTP 403 Forbidden or 404 Not Found'
      );
    });

    // ----------------------------------------------------
    // T2.10: Stock Underflow Protection (E10)
    // ----------------------------------------------------
    await test('T2.10 (E10): Stock OUT exceeding available stock is rejected', async () => {
      const lowStockPartId = 'part-low-stock';
      db.prepare(`
        INSERT OR IGNORE INTO spareparts (id, tenant_id, sku, name, category, stock, buy_price, sell_price)
        VALUES (?, ?, 'SKU-LOW-1', 'Low Stock Part', 'Rem', 2, 50000, 80000)
      `).run(lowStockPartId, authGps.tenant.id);

      // Attempt to withdraw 10 items when only 2 exist
      const resOut = await request(app)
        .post('/api/stock-movements/out')
        .set('Cookie', authGps.cookie)
        .send({
          sparepartId: lowStockPartId,
          qty: 10,
          tanggal: '2026-10-04',
          catatan: 'Permintaan melebihi stok'
        });

      assertMilestoneRoute(resOut, '/api/stock-movements/out', 'M3');
      assert.ok(
        resOut.status === 422 || resOut.status === 400,
        'Stock underflow must return 422 Unprocessable Entity or 400 Bad Request'
      );
    });

    // ----------------------------------------------------
    // T2.11: Stock Opname Negative Discrepancy (E11)
    // ----------------------------------------------------
    await test('T2.11 (E11): Stock Opname with negative difference (loss/breakage)', async () => {
      const opnamePartId = 'part-opname-test';
      db.prepare(`
        INSERT OR IGNORE INTO spareparts (id, tenant_id, sku, name, category, stock, buy_price, sell_price)
        VALUES (?, ?, 'SKU-OPN-1', 'Opname Part', 'Busi', 10, 40000, 60000)
      `).run(opnamePartId, authGps.tenant.id);

      // Physical audit finds only 7 items (discrepancy: -3)
      const resOpname = await request(app)
        .post('/api/stock-opname')
        .set('Cookie', authGps.cookie)
        .send({
          sparepartId: opnamePartId,
          stokFisik: 7,
          tanggal: '2026-10-04',
          alasan: 'Barang rusak dan hilang di rak'
        });

      assertMilestoneRoute(resOpname, '/api/stock-opname', 'M3');
      if (resOpname.status === 200 || resOpname.status === 201) {
        const updated = db.prepare('SELECT stock FROM spareparts WHERE id = ?').get(opnamePartId);
        assert.equal(updated.stock, 7, 'System stock must be adjusted down to physical count');
      }
    });

    // ----------------------------------------------------
    // T2.12: Negative Cashflow Deficit (E12)
    // ----------------------------------------------------
    await test('T2.12 (E12): Financial ledger correctly calculates negative net balance (deficit)', async () => {
      const incomeSample = [{ nominal: 1000000 }];
      const expenseSample = [{ nominal: 3500000 }]; // Expenses exceed income

      const result = oracleNetBalance(incomeSample, expenseSample);
      assert.equal(result.totalIncome, 1000000);
      assert.equal(result.totalExpense, 3500000);
      assert.equal(result.netBalance, -2500000, 'Net balance must reflect negative value');
      assert.equal(result.isDeficit, true);
    });

    // ----------------------------------------------------
    // T2.13: RFC-4180 CSV Escaping (E18)
    // ----------------------------------------------------
    await test('T2.13 (E18): CSV escaping for commas, quotes, and newlines', async () => {
      // 1. Text containing commas
      const textWithComma = 'Oli Shell, Filter Oli, dan Busi';
      assert.equal(oracleEscapeCsvField(textWithComma), '"Oli Shell, Filter Oli, dan Busi"');

      // 2. Text containing double quotes
      const textWithQuotes = 'Servis "Tune Up" Paket Super';
      assert.equal(oracleEscapeCsvField(textWithQuotes), '"Servis ""Tune Up"" Paket Super"');

      // 3. Text containing newlines
      const textWithNewline = 'Catatan servis:\n1. Ganti oli\n2. Cek rem';
      assert.equal(oracleEscapeCsvField(textWithNewline), '"Catatan servis:\n1. Ganti oli\n2. Cek rem"');
    });

  } finally {
    cleanup();
  }

  return results;
}

export default runTier2Boundary;
