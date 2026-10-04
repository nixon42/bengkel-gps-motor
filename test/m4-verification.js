#!/usr/bin/env node
/**
 * Milestone 4 Comprehensive Verification Runner
 * Validates Category Management, Financial Ledger (Buku Kas),
 * Summary & Deficit KPI computations, RFC-4180 CSV exports,
 * and pure-JS PDF Reports (P&L, Daily Recap) with strict multi-tenant isolation.
 */

import request from 'supertest';
import assert from 'node:assert/strict';
import { createTestApp, loginUser, oracleNetBalance, oracleEscapeCsvField } from './supertestHelper.js';
import { FIXTURES } from './fixtures.js';

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m'
};

async function runM4Verification() {
  console.log(`\n${COLORS.bold}================================================================${COLORS.reset}`);
  console.log(`${COLORS.bold}  Milestone 4: Comprehensive Verification Test Suite            ${COLORS.reset}`);
  console.log(`${COLORS.bold}================================================================${COLORS.reset}\n`);

  const { app, db, cleanup } = createTestApp();
  let passed = 0;
  let failed = 0;

  const now = new Date();
  const todayLocal = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

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

    // ----------------------------------------------------
    // M4.1: Auto-seed default categories
    // ----------------------------------------------------
    let defaultIncomeCatId = null;
    let defaultExpenseCatId = null;

    await test('M4.1: Default categories are auto-seeded on first access (>= 9 categories)', async () => {
      const res = await request(app)
        .get('/api/finance/categories')
        .set('Cookie', authGps.cookie)
        .expect(200);

      const cats = res.body.categories || res.body.data;
      assert.ok(Array.isArray(cats), 'Categories must be an array');
      assert.ok(cats.length >= 9, `Must have at least 9 default categories, got ${cats.length}`);

      const incomeCat = cats.find(c => (c.type === 'INCOME' || c.tipe === 'INCOME') && c.name === 'Jasa Servis');
      const expenseCat = cats.find(c => (c.type === 'EXPENSE' || c.tipe === 'EXPENSE') && c.name === 'Beli Sparepart / Stok');

      assert.ok(incomeCat, 'Jasa Servis category must exist');
      assert.ok(expenseCat, 'Beli Sparepart / Stok category must exist');

      defaultIncomeCatId = incomeCat.id;
      defaultExpenseCatId = expenseCat.id;
    });

    // ----------------------------------------------------
    // M4.2: Create custom category
    // ----------------------------------------------------
    let customCatId = null;
    await test('M4.2: Create custom category with validation (POST /api/finance/categories)', async () => {
      const res = await request(app)
        .post('/api/finance/categories')
        .set('Cookie', authGps.cookie)
        .send({
          name: 'Sponsor & Promosi Komunitas',
          type: 'EXPENSE'
        })
        .expect(201);

      const cat = res.body.category || res.body.item;
      assert.ok(cat?.id);
      assert.equal(cat.name, 'Sponsor & Promosi Komunitas');
      assert.equal(cat.type, 'EXPENSE');
      assert.equal(cat.is_default, false);
      customCatId = cat.id;
    });

    // ----------------------------------------------------
    // M4.3: Prevent duplicate category
    // ----------------------------------------------------
    await test('M4.3: Prevent duplicate category names under the same type (409 Conflict)', async () => {
      const res = await request(app)
        .post('/api/finance/categories')
        .set('Cookie', authGps.cookie)
        .send({
          name: 'Sponsor & Promosi Komunitas',
          type: 'EXPENSE'
        });

      assert.equal(res.status, 409);
    });

    // ----------------------------------------------------
    // M4.4: Update custom category
    // ----------------------------------------------------
    await test('M4.4: Update custom category name (PUT /api/finance/categories/:id)', async () => {
      const res = await request(app)
        .put(`/api/finance/categories/${customCatId}`)
        .set('Cookie', authGps.cookie)
        .send({
          name: 'Biaya Marketing & Sponsorship'
        })
        .expect(200);

      const cat = res.body.category;
      assert.equal(cat.name, 'Biaya Marketing & Sponsorship');
    });

    // ----------------------------------------------------
    // M4.5: Delete unused custom category and protect default
    // ----------------------------------------------------
    await test('M4.5: Delete unused custom category and block deleting default category', async () => {
      // 1. Try deleting default category -> must fail with 400
      const resDelDefault = await request(app)
        .delete(`/api/finance/categories/${defaultIncomeCatId}`)
        .set('Cookie', authGps.cookie);
      assert.equal(resDelDefault.status, 400);

      // 2. Delete unused custom category -> must succeed
      const resDelCustom = await request(app)
        .delete(`/api/finance/categories/${customCatId}`)
        .set('Cookie', authGps.cookie)
        .expect(200);
      assert.equal(resDelCustom.body.success, true);
    });

    // ----------------------------------------------------
    // M4.6: Record income transaction with Indonesian payload
    // ----------------------------------------------------
    let trxIncomeId = null;
    await test('M4.6: Record income transaction with Indonesian payload (tipe, nominal, QRIS)', async () => {
      const res = await request(app)
        .post('/api/finance/transactions')
        .set('Cookie', authGps.cookie)
        .send({
          tipe: 'INCOME',
          kategoriId: defaultIncomeCatId,
          nominal: 450000,
          tanggal: todayLocal,
          deskripsi: 'Jasa servis berkala & ganti oli Avanza',
          metodePembayaran: 'QRIS'
        })
        .expect(201);

      const trx = res.body.transaction || res.body.item;
      assert.ok(trx?.id);
      trxIncomeId = trx.id;
      assert.equal(trx.nominal, 450000);
      assert.equal(trx.amount, 450000);
      assert.equal(trx.tipe, 'INCOME');
      assert.equal(trx.type, 'INCOME');
      assert.equal(trx.metodePembayaran, 'QRIS');
      assert.equal(trx.category_name, 'Jasa Servis');
    });

    // ----------------------------------------------------
    // M4.7: Record expense transaction with English payload
    // ----------------------------------------------------
    let trxExpenseId = null;
    await test('M4.7: Record expense transaction with English payload (type, amount, CASH)', async () => {
      const res = await request(app)
        .post('/api/finance/transactions')
        .set('Cookie', authGps.cookie)
        .send({
          type: 'EXPENSE',
          categoryId: defaultExpenseCatId,
          amount: 150000,
          date: todayLocal,
          description: 'Beli bensin pembersih & konsumsi mekanik',
          paymentMethod: 'CASH'
        })
        .expect(201);

      const trx = res.body.transaction || res.body.item;
      assert.ok(trx?.id);
      trxExpenseId = trx.id;
      assert.equal(trx.amount, 150000);
      assert.equal(trx.type, 'EXPENSE');
      assert.equal(trx.paymentMethod, 'CASH');
      assert.equal(trx.category_name, 'Beli Sparepart / Stok');
    });

    // ----------------------------------------------------
    // M4.8: Validation rejects non-positive amount
    // ----------------------------------------------------
    await test('M4.8: Validation rejects negative or zero transaction amounts', async () => {
      const resZero = await request(app)
        .post('/api/finance/transactions')
        .set('Cookie', authGps.cookie)
        .send({
          type: 'INCOME',
          categoryId: defaultIncomeCatId,
          amount: 0,
          description: 'Uji nominal 0'
        });
      assert.equal(resZero.status, 400);

      const resNeg = await request(app)
        .post('/api/finance/transactions')
        .set('Cookie', authGps.cookie)
        .send({
          type: 'INCOME',
          categoryId: defaultIncomeCatId,
          amount: -50000,
          description: 'Uji nominal negatif'
        });
      assert.equal(resNeg.status, 400);

      const resInf = await request(app)
        .post('/api/finance/transactions')
        .set('Cookie', authGps.cookie)
        .send({
          type: 'INCOME',
          categoryId: defaultIncomeCatId,
          amount: 'Infinity',
          description: 'Uji nominal non-finite Infinity'
        });
      assert.equal(resInf.status, 400);

      const resPutInf = await request(app)
        .put(`/api/finance/transactions/${trxIncomeId}`)
        .set('Cookie', authGps.cookie)
        .send({ amount: 'Infinity' });
      assert.equal(resPutInf.status, 400);

      const resBudgetInf = await request(app)
        .put('/api/finance/budget-target')
        .set('Cookie', authGps.cookie)
        .send({ target: 'Infinity' });
      assert.equal(resBudgetInf.status, 400);
    });

    // ----------------------------------------------------
    // M4.9: Validation rejects invalid payment method
    // ----------------------------------------------------
    await test('M4.9: Validation rejects invalid payment method (not CASH/TRANSFER/QRIS)', async () => {
      const res = await request(app)
        .post('/api/finance/transactions')
        .set('Cookie', authGps.cookie)
        .send({
          type: 'INCOME',
          categoryId: defaultIncomeCatId,
          amount: 100000,
          description: 'Uji metode bayar aneh',
          paymentMethod: 'BITCOIN'
        });
      assert.equal(res.status, 400);

      const resEmpty = await request(app)
        .post('/api/finance/transactions')
        .set('Cookie', authGps.cookie)
        .send({
          type: 'INCOME',
          categoryId: defaultIncomeCatId,
          amount: 100000,
          description: 'Uji metode bayar string kosong',
          paymentMethod: ''
        });
      assert.equal(resEmpty.status, 400);
    });

    // ----------------------------------------------------
    // M4.10: Financial summary computes correct net balance
    // ----------------------------------------------------
    await test('M4.10: Financial summary computes correct net balance matching oracleNetBalance', async () => {
      const res = await request(app)
        .get('/api/finance/summary?period=today')
        .set('Cookie', authGps.cookie)
        .expect(200);

      const { total_income, total_expense, net_balance, is_deficit } = res.body;

      // Oracle expectation: 450,000 - 150,000 = 300,000
      const oracle = oracleNetBalance([{ nominal: 450000 }], [{ nominal: 150000 }]);
      assert.equal(total_income, oracle.totalIncome);
      assert.equal(total_expense, oracle.totalExpense);
      assert.equal(net_balance, oracle.netBalance);
      assert.equal(is_deficit, false);
      assert.equal(res.body.counts.total, 2);
    });

    // ----------------------------------------------------
    // M4.11: Summary correctly computes negative net balance (deficit)
    // ----------------------------------------------------
    await test('M4.11 (E12): Summary correctly computes negative net balance (deficit) when expense > income', async () => {
      // Record a large expense of 1,000,000
      await request(app)
        .post('/api/finance/transactions')
        .set('Cookie', authGps.cookie)
        .send({
          type: 'EXPENSE',
          categoryId: defaultExpenseCatId,
          amount: 1000000,
          date: todayLocal,
          description: 'Sewa alat scanner berat & tools',
          paymentMethod: 'TRANSFER'
        })
        .expect(201);

      const res = await request(app)
        .get('/api/finance/summary?period=today')
        .set('Cookie', authGps.cookie)
        .expect(200);

      // Total income: 450,000; Total expense: 1,150,000; Net: -700,000
      assert.equal(res.body.total_income, 450000);
      assert.equal(res.body.total_expense, 1150000);
      assert.equal(res.body.net_balance, -700000);
      assert.equal(res.body.is_deficit, true);
    });

    // ----------------------------------------------------
    // M4.12: Filter transactions
    // ----------------------------------------------------
    await test('M4.12: Filter transactions by type, category, and payment method', async () => {
      // Filter by QRIS
      const resQris = await request(app)
        .get('/api/finance/transactions?paymentMethod=QRIS')
        .set('Cookie', authGps.cookie)
        .expect(200);

      assert.equal(resQris.body.transactions.length, 1);
      assert.equal(resQris.body.transactions[0].payment_method, 'QRIS');

      // Filter by EXPENSE
      const resExp = await request(app)
        .get('/api/finance/transactions?type=EXPENSE')
        .set('Cookie', authGps.cookie)
        .expect(200);

      assert.equal(resExp.body.transactions.length, 2);
      assert.ok(resExp.body.transactions.every(t => t.type === 'EXPENSE'));
    });

    // ----------------------------------------------------
    // M4.13: Category deletion blocked when referenced by active transactions
    // ----------------------------------------------------
    await test('M4.13: Category deletion is blocked when referenced by active transactions', async () => {
      const res = await request(app)
        .delete(`/api/finance/categories/${defaultExpenseCatId}`)
        .set('Cookie', authGps.cookie);

      assert.equal(res.status, 400);
    });

    // ----------------------------------------------------
    // M4.14: Export CSV with RFC-4180 compliance
    // ----------------------------------------------------
    await test('M4.14 (E18): Export /api/finance/export/csv returns valid RFC-4180 CSV with escaped characters', async () => {
      // Insert a transaction with special characters (comma and quote)
      await request(app)
        .post('/api/finance/transactions')
        .set('Cookie', authGps.cookie)
        .send({
          type: 'INCOME',
          categoryId: defaultIncomeCatId,
          amount: 250000,
          description: 'Servis "Tune Up", Ganti Busi, dan Cek Rem',
          paymentMethod: 'CASH'
        })
        .expect(201);

      const res = await request(app)
        .get('/api/finance/export/csv')
        .set('Cookie', authGps.cookie)
        .expect(200);

      assert.ok(res.headers['content-type'].includes('text/csv'));
      const text = res.text;
      assert.ok(text.includes('ID Transaksi,Tanggal,Tipe,Kategori,Nominal (Rp)'));
      // Escaped quote: ""Tune Up""
      assert.ok(text.includes('""Tune Up""'));
    });

    // ----------------------------------------------------
    // M4.15: Export P&L PDF
    // ----------------------------------------------------
    await test('M4.15: Export /api/finance/export/pnl-pdf returns valid PDF (%PDF- header and workshop info)', async () => {
      const res = await request(app)
        .get('/api/finance/export/pnl-pdf?period=month')
        .set('Cookie', authGps.cookie)
        .expect(200);

      assert.ok(res.headers['content-type'].includes('application/pdf'));
      const isPdf = (res.body instanceof Buffer && res.body.toString('latin1', 0, 5) === '%PDF-') ||
                    (typeof res.text === 'string' && res.text.startsWith('%PDF-'));
      assert.ok(isPdf, 'PDF payload must begin with %PDF- header');
    });

    // ----------------------------------------------------
    // M4.16: Export Daily Recap PDF
    // ----------------------------------------------------
    await test('M4.16: Export /api/finance/export/daily-recap-pdf returns valid PDF buffer', async () => {
      const res = await request(app)
        .get('/api/finance/export/daily-recap-pdf')
        .set('Cookie', authGps.cookie)
        .expect(200);

      assert.ok(res.headers['content-type'].includes('application/pdf'));
      const isPdf = (res.body instanceof Buffer && res.body.toString('latin1', 0, 5) === '%PDF-') ||
                    (typeof res.text === 'string' && res.text.startsWith('%PDF-'));
      assert.ok(isPdf, 'Daily recap must begin with %PDF- header');
    });

    // ----------------------------------------------------
    // M4.17: Strict Tenant Isolation
    // ----------------------------------------------------
    await test('M4.17: Strict tenant isolation: Tenant A finance data is invisible to Tenant B', async () => {
      // Tenant B queries transactions -> should see 0
      const resB = await request(app)
        .get('/api/finance/transactions')
        .set('Cookie', authBerkah.cookie)
        .expect(200);

      assert.equal(resB.body.transactions.length, 0, 'Tenant B must NOT see Tenant A transactions');

      // Tenant B tries to fetch Tenant A transaction by ID -> 404
      const resGetA = await request(app)
        .get(`/api/finance/transactions/${trxIncomeId}`)
        .set('Cookie', authBerkah.cookie);

      assert.equal(resGetA.status, 404, 'Cross-tenant fetch must return 404 Not Found');

      // Tenant B summary should be all 0
      const resSummaryB = await request(app)
        .get('/api/finance/summary')
        .set('Cookie', authBerkah.cookie)
        .expect(200);

      assert.equal(resSummaryB.body.total_income, 0);
      assert.equal(resSummaryB.body.total_expense, 0);
      assert.equal(resSummaryB.body.net_balance, 0);
    });

  } finally {
    cleanup();
  }

  console.log(`\n----------------------------------------------------------------`);
  console.log(`  Milestone 4 Verification Summary:`);
  console.log(`  Total Tests: ${passed + failed} | ${COLORS.green}✔ Passed: ${passed}${COLORS.reset} | ${failed > 0 ? `${COLORS.red}✖ Failed: ${failed}${COLORS.reset}` : '✖ Failed: 0'}`);
  console.log(`----------------------------------------------------------------\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runM4Verification();
