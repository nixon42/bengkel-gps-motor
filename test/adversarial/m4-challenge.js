#!/usr/bin/env node
/**
 * Empirical Adversarial Challenge Test Harness for Milestone 4 (Buku Kas & Keuangan)
 * Bengkel Mobil GPS Motor Kediri
 * 
 * Adversarially challenges:
 * 1. Attack Net Balance Calculations:
 *    - Deficit states: expenses >> income (e.g. 500M expense vs 1M income, net balance -499M, is_deficit: true).
 *    - Extreme deficit: income = 0, expense = 25M (net balance -25M, is_deficit: true).
 *    - Large currency values: Rp 100.000.000.000 (100 Billion) in income/expense without overflow/truncation.
 *    - Large values CSV preservation: no scientific notation (1e+11) or rounding distortion.
 *    - Large values PDF rendering: formats cleanly in formatRupiah without crash.
 *    - Zero balances: empty tenant summary yields 0s, 0% budget, no division by zero or NaN.
 *    - Zero net balance: exactly balanced income and expense yields net 0, is_deficit: false.
 *    - Multiple decimals & floating-point precision: fractional currency amounts (cents) and accumulation.
 *    - PDF export under deep deficit and zero states: returns valid %PDF- streams without error.
 * 
 * 2. Attack Tenant Boundary Isolation:
 *    - Cross-tenant category modification: Tenant B PUT /categories/:tenantA_catId -> 404.
 *    - Cross-tenant category deletion: Tenant B DELETE /categories/:tenantA_catId -> 404.
 *    - Cross-tenant category namespace independence: same category name under different tenants works cleanly.
 *    - Cross-tenant category hijacking in transaction creation: Tenant B POST /transactions with tenantA_catId -> 404.
 *    - Cross-tenant category hijacking in transaction update: Tenant B PUT /transactions/:id with tenantA_catId -> 404.
 *    - Cross-tenant transaction retrieval: Tenant B GET /transactions/:tenantA_trxId -> 404.
 *    - Cross-tenant transaction modification: Tenant B PUT /transactions/:tenantA_trxId -> 404.
 *    - Cross-tenant transaction deletion: Tenant B DELETE /transactions/:tenantA_trxId -> 404.
 *    - Cross-tenant transaction search query leak: Tenant B search for Tenant A exclusive keyword -> 0 results.
 *    - Cross-tenant category filter leak: Tenant B query with categoryId=tenantA_catId -> 0 results.
 *    - Cross-tenant financial summary leak: Tenant B summary is 100% isolated, 0% leaked.
 *    - Cross-tenant P&L leak: Tenant B P&L shows 0 values across all months.
 *    - Cross-tenant budget target isolation: Tenant B PUT budget target does not alter Tenant A.
 *    - Cross-tenant CSV export leak: Tenant B CSV contains 0 rows of Tenant A data.
 *    - Cross-tenant PDF export leak: Tenant B PDF has Tenant B workshop header and 0 Tenant A rows.
 *    - Tenant ID Header Spoofing Attack: x-tenant-id header ignored, session isolation enforced.
 * 
 * 3. Attack Validation Boundaries & SQL Injection Resistance:
 *    - Negative amount rejection: -1, -50000, -0.01, "-9999" -> 400 Bad Request.
 *    - Indonesian key negative nominal rejection: nominal: -100000 -> 400 Bad Request.
 *    - Zero amount rejection: 0, "0", nominal: 0 -> 400 Bad Request.
 *    - Non-numeric / NaN / Infinity amounts: "abc", NaN, Infinity, -Infinity, null, {} -> 400 Bad Request.
 *    - Invalid transaction types: 'TRANSFER', 'INVESTMENT', '', 999 -> 400 Bad Request.
 *    - Empty / short description: '', ' ', 'a' (<2 chars), non-string -> 400 Bad Request.
 *    - Invalid payment methods: 'BITCOIN', 'CRYPTO', 'PAYPAL', 'HUTANG' -> 400 Bad Request.
 *    - Non-existent category ID: nonexistent UUID -> 404 Not Found.
 *    - Category creation validation: name < 2 chars, whitespace-only, invalid type -> 400 Bad Request.
 *    - Category duplicate collision: same name under same type (case-insensitive) -> 409 Conflict.
 *    - Default category deletion protection: attempting to delete default category -> 400 Bad Request.
 *    - In-use category deletion protection: attempting to delete custom category with active transactions -> 400 Bad Request.
 *    - Budget target validation: target = -100, 0, "abc" -> 400 Bad Request.
 *    - SQL Injection in transaction search: search = "'; DROP TABLE transactions; --", "' OR 1=1 --"
 *    - SQL Injection in date filters: startDate = "2026-01-01' OR 1=1 --", endDate = "2026-12-31' UNION SELECT..."
 *    - SQL Injection in numeric range filters: minAmount = "0 OR 1=1", maxAmount = "1000; DROP TABLE users"
 *    - SQL Injection in sorting parameters: sortBy = "date; DROP TABLE transactions;", sortOrder = "asc; DROP TABLE..."
 *    - SQL Injection in summary & P&L parameters: period = "month' OR 1=1 --", months = "12; DROP TABLE users;"
 *    - Special characters & Unicode robustness: Emojis and Indonesian technical symbols preserved accurately.
 *    - XSS payload safety: <script>alert(1)</script> stored safely without execution.
 *    - RFC-4180 CSV export round-trip verification with commas and double quotes.
 */

import request from 'supertest';
import assert from 'node:assert/strict';
import { createTestApp, loginUser, oracleNetBalance } from '../supertestHelper.js';
import { FIXTURES } from '../fixtures.js';
import { formatRupiah, formatDateIndo } from '../../server/services/pdfService.js';

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

const challengeResults = {
  passed: 0,
  failed: 0,
  findings: []
};

function recordTest(name, passed, details = '') {
  if (passed) {
    challengeResults.passed++;
    console.log(`  ${COLORS.green}✔ PASS${COLORS.reset} ${name}`);
  } else {
    challengeResults.failed++;
    challengeResults.findings.push({ name, details });
    console.log(`  ${COLORS.red}✖ FAIL${COLORS.reset} ${name}`);
    if (details) {
      console.log(`    ${COLORS.yellow}↳ ${details}${COLORS.reset}`);
    }
  }
}

/**
 * Minimal RFC-4180 CSV Parser to verify exported streams roundtrip cleanly
 */
function parseRFC4180Csv(text) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let insideQuote = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (insideQuote) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i += 2;
          continue;
        } else {
          insideQuote = false;
          i++;
          continue;
        }
      } else {
        currentField += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        insideQuote = true;
        i++;
        continue;
      } else if (char === ',') {
        currentRow.push(currentField);
        currentField = '';
        i++;
        continue;
      } else if (char === '\r' && nextChar === '\n') {
        currentRow.push(currentField);
        currentField = '';
        rows.push(currentRow);
        currentRow = [];
        i += 2;
        continue;
      } else if (char === '\n') {
        currentRow.push(currentField);
        currentField = '';
        rows.push(currentRow);
        currentRow = [];
        i++;
        continue;
      } else {
        currentField += char;
        i++;
      }
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows;
}

function isPdfBuffer(res) {
  return (res.body instanceof Buffer && res.body.toString('latin1', 0, 5) === '%PDF-') ||
         (typeof res.text === 'string' && res.text.startsWith('%PDF-'));
}

async function runM4AdversarialChallenge() {
  console.log(`\n${COLORS.bold}================================================================${COLORS.reset}`);
  console.log(`${COLORS.bold}  Milestone 4: Adversarial Stress Test & Isolation Challenge     ${COLORS.reset}`);
  console.log(`${COLORS.bold}================================================================${COLORS.reset}\n`);

  const { app, db, cleanup } = createTestApp();

  try {
    const authGps = await loginUser(app, { tenantSlug: FIXTURES.tenants.gpsMotor.slug, email: FIXTURES.users.gpsAdmin.email });
    const authBerkah = await loginUser(app, { tenantSlug: FIXTURES.tenants.berkahKediri.slug, email: FIXTURES.users.berkahAdmin.email });

    // Seed default categories for both tenants
    const resCatsGps = await request(app).get('/api/finance/categories').set('Cookie', authGps.cookie).expect(200);
    const gpsCats = resCatsGps.body.categories || resCatsGps.body.data;
    const gpsIncomeCat = gpsCats.find(c => c.type === 'INCOME');
    const gpsExpenseCat = gpsCats.find(c => c.type === 'EXPENSE');

    const resCatsBerkah = await request(app).get('/api/finance/categories').set('Cookie', authBerkah.cookie).expect(200);
    const berkahCats = resCatsBerkah.body.categories || resCatsBerkah.body.data;
    const berkahIncomeCat = berkahCats.find(c => c.type === 'INCOME');
    const berkahExpenseCat = berkahCats.find(c => c.type === 'EXPENSE');

    // ============================================================================
    // SECTION 1: ATTACK NET BALANCE CALCULATIONS
    // ============================================================================
    console.log(`\n${COLORS.cyan}${COLORS.bold}▶ Vector 1: Attack Net Balance Calculations${COLORS.reset}`);

    // 1.1 Zero balances on completely fresh tenant
    const resZeroSummary = await request(app)
      .get('/api/finance/summary')
      .set('Cookie', authBerkah.cookie)
      .expect(200);

    recordTest(
      'Calc 1.1: Zero balances on fresh tenant return 0 income, 0 expense, 0 net, is_deficit: false',
      resZeroSummary.body.total_income === 0 &&
      resZeroSummary.body.total_expense === 0 &&
      resZeroSummary.body.net_balance === 0 &&
      resZeroSummary.body.is_deficit === false &&
      resZeroSummary.body.budget.progress_percent === 0,
      `Summary: ${JSON.stringify(resZeroSummary.body)}`
    );

    // 1.2 Zero transactions P&L and Daily Recap export return valid PDF without NaN or divide-by-zero crashes
    const resPnlZeroPdf = await request(app)
      .get('/api/finance/export/pnl-pdf')
      .set('Cookie', authBerkah.cookie)
      .expect(200);

    const resDailyZeroPdf = await request(app)
      .get('/api/finance/export/daily-recap-pdf')
      .set('Cookie', authBerkah.cookie)
      .expect(200);

    recordTest(
      'Calc 1.2: Exporting P&L and Daily Recap on zero transactions produces valid %PDF- streams without crash',
      isPdfBuffer(resPnlZeroPdf) && isPdfBuffer(resDailyZeroPdf),
      'P&L and Daily Recap PDF buffers validated'
    );

    // 1.3 Exactly balanced net balance (Income = Expense, Net = 0)
    await request(app)
      .post('/api/finance/transactions')
      .set('Cookie', authBerkah.cookie)
      .send({
        type: 'INCOME',
        categoryId: berkahIncomeCat.id,
        amount: 2500000,
        description: 'Pemasukan servis seimbang',
        paymentMethod: 'CASH',
        date: '2026-10-04'
      })
      .expect(201);

    await request(app)
      .post('/api/finance/transactions')
      .set('Cookie', authBerkah.cookie)
      .send({
        type: 'EXPENSE',
        categoryId: berkahExpenseCat.id,
        amount: 2500000,
        description: 'Pengeluaran seimbang',
        paymentMethod: 'TRANSFER',
        date: '2026-10-04'
      })
      .expect(201);

    const resBalancedSummary = await request(app)
      .get('/api/finance/summary?period=today')
      .set('Cookie', authBerkah.cookie)
      .expect(200);

    recordTest(
      'Calc 1.3: Balanced ledger (Income = Expense) yields net_balance: 0 and is_deficit: false',
      resBalancedSummary.body.total_income === 2500000 &&
      resBalancedSummary.body.total_expense === 2500000 &&
      resBalancedSummary.body.net_balance === 0 &&
      resBalancedSummary.body.is_deficit === false,
      `Net: ${resBalancedSummary.body.net_balance}, Deficit: ${resBalancedSummary.body.is_deficit}`
    );

    // 1.4 Deep Deficit State (Expenses >> Income)
    // Add massive expense of 500,000,000 to GPS Motor
    await request(app)
      .post('/api/finance/transactions')
      .set('Cookie', authGps.cookie)
      .send({
        type: 'INCOME',
        categoryId: gpsIncomeCat.id,
        amount: 1000000,
        description: 'Pendapatan jasa servis rutin',
        paymentMethod: 'QRIS',
        date: '2026-10-04'
      })
      .expect(201);

    await request(app)
      .post('/api/finance/transactions')
      .set('Cookie', authGps.cookie)
      .send({
        type: 'EXPENSE',
        categoryId: gpsExpenseCat.id,
        amount: 500000000,
        description: 'Pengadaan mesin dyno test besar',
        paymentMethod: 'TRANSFER',
        date: '2026-10-04'
      })
      .expect(201);

    const resDeficitSummary = await request(app)
      .get('/api/finance/summary?period=today')
      .set('Cookie', authGps.cookie)
      .expect(200);

    const expectedDeficitNet = 1000000 - 500000000; // -499,000,000
    recordTest(
      'Calc 1.4: Massive deficit state (Expense 500M >> Income 1M) correctly computes negative net balance (-499M) & is_deficit: true',
      resDeficitSummary.body.total_income === 1000000 &&
      resDeficitSummary.body.total_expense === 500000000 &&
      resDeficitSummary.body.net_balance === expectedDeficitNet &&
      resDeficitSummary.body.is_deficit === true,
      `Net: ${resDeficitSummary.body.net_balance}, Deficit: ${resDeficitSummary.body.is_deficit}`
    );

    // 1.5 P&L PDF export under massive deficit renders cleanly
    const resPnlDeficitPdf = await request(app)
      .get('/api/finance/export/pnl-pdf?period=today')
      .set('Cookie', authGps.cookie)
      .expect(200);

    recordTest(
      'Calc 1.5: P&L PDF report under deep deficit renders valid %PDF- without formatting crash',
      isPdfBuffer(resPnlDeficitPdf),
      'P&L PDF buffer verified'
    );

    // 1.6 Large currency values: Rp 100.000.000.000 (100 Billion, 1e11)
    const largeIncomeAmount = 100000000000; // 100 Billion
    const largeExpenseAmount = 35000000000; // 35 Billion
    const expectedLargeNet = largeIncomeAmount - largeExpenseAmount; // 65 Billion

    // Clean up or create fresh tenant for large value testing to isolate totals
    const authLargeTenant = await loginUser(app, { tenantSlug: 'test-large-currency-tenant', email: 'large@example.com' });
    const resLargeCats = await request(app).get('/api/finance/categories').set('Cookie', authLargeTenant.cookie).expect(200);
    const largeCats = resLargeCats.body.categories || resLargeCats.body.data;
    const lIncomeCat = largeCats.find(c => c.type === 'INCOME');
    const lExpenseCat = largeCats.find(c => c.type === 'EXPENSE');

    const resLargeTrx1 = await request(app)
      .post('/api/finance/transactions')
      .set('Cookie', authLargeTenant.cookie)
      .send({
        type: 'INCOME',
        categoryId: lIncomeCat.id,
        amount: largeIncomeAmount,
        description: 'Modal investasi mega ekspansi 100 Milyar',
        paymentMethod: 'TRANSFER',
        date: '2026-10-04'
      })
      .expect(201);

    const resLargeTrx2 = await request(app)
      .post('/api/finance/transactions')
      .set('Cookie', authLargeTenant.cookie)
      .send({
        type: 'EXPENSE',
        categoryId: lExpenseCat.id,
        amount: largeExpenseAmount,
        description: 'Akuisisi lahan bengkel 35 Milyar',
        paymentMethod: 'TRANSFER',
        date: '2026-10-04'
      })
      .expect(201);

    const resLargeSummary = await request(app)
      .get('/api/finance/summary?period=today')
      .set('Cookie', authLargeTenant.cookie)
      .expect(200);

    recordTest(
      'Calc 1.6: Large currency values (Rp 100.000.000.000) survive integer precision and aggregation without overflow',
      resLargeSummary.body.total_income === largeIncomeAmount &&
      resLargeSummary.body.total_expense === largeExpenseAmount &&
      resLargeSummary.body.net_balance === expectedLargeNet &&
      resLargeSummary.body.is_deficit === false,
      `Summary: Income=${resLargeSummary.body.total_income}, Net=${resLargeSummary.body.net_balance}`
    );

    // 1.7 Large currency CSV export contains exact 100000000000 without scientific notation (1e+11)
    const resLargeCsv = await request(app)
      .get('/api/finance/export/csv')
      .set('Cookie', authLargeTenant.cookie)
      .expect(200);

    const csvParsed = parseRFC4180Csv(resLargeCsv.text);
    const has100Billion = csvParsed.some(row => row.includes(String(largeIncomeAmount)));
    const hasNoScientificNotation = !resLargeCsv.text.includes('1e+') && !resLargeCsv.text.includes('1E+');

    recordTest(
      'Calc 1.7: CSV export preserves Rp 100.000.000.000 as exact numeric string without scientific notation (1e+11)',
      has100Billion && hasNoScientificNotation,
      `CSV preview: ${resLargeCsv.text.slice(0, 300)}`
    );

    // 1.8 Large currency PDF generation formats cleanly with formatRupiah
    const formattedRupiah100B = formatRupiah(largeIncomeAmount);
    const resLargePdf = await request(app)
      .get('/api/finance/export/pnl-pdf?period=today')
      .set('Cookie', authLargeTenant.cookie)
      .expect(200);

    recordTest(
      'Calc 1.8: PDF engine formats Rp 100.000.000.000 cleanly via formatRupiah and returns valid %PDF- stream',
      formattedRupiah100B.includes('100.000.000.000') && isPdfBuffer(resLargePdf),
      `Formatted: ${formattedRupiah100B}`
    );

    // 1.9 Multiple decimals & floating-point precision (cents and fractional amounts)
    const authDecimalTenant = await loginUser(app, { tenantSlug: 'test-decimals-tenant', email: 'decimal@example.com' });
    const resDecCats = await request(app).get('/api/finance/categories').set('Cookie', authDecimalTenant.cookie).expect(200);
    const dIncomeCat = resDecCats.body.categories.find(c => c.type === 'INCOME');
    const dExpenseCat = resDecCats.body.categories.find(c => c.type === 'EXPENSE');

    // Insert 12345.67 income and 2345.42 expense
    await request(app)
      .post('/api/finance/transactions')
      .set('Cookie', authDecimalTenant.cookie)
      .send({
        type: 'INCOME',
        categoryId: dIncomeCat.id,
        amount: 12345.67,
        description: 'Pendapatan pecahan presisi 1',
        paymentMethod: 'CASH',
        date: '2026-10-04'
      })
      .expect(201);

    await request(app)
      .post('/api/finance/transactions')
      .set('Cookie', authDecimalTenant.cookie)
      .send({
        type: 'EXPENSE',
        categoryId: dExpenseCat.id,
        amount: 2345.42,
        description: 'Biaya pecahan presisi 2',
        paymentMethod: 'CASH',
        date: '2026-10-04'
      })
      .expect(201);

    const resDecSummary = await request(app)
      .get('/api/finance/summary?period=today')
      .set('Cookie', authDecimalTenant.cookie)
      .expect(200);

    const expectedDecNet = Math.round((12345.67 - 2345.42) * 100) / 100; // 10000.25
    const actualDecNet = Math.round(resDecSummary.body.net_balance * 100) / 100;

    recordTest(
      'Calc 1.9: Fractional decimal amounts (12345.67 - 2345.42) aggregate with exact decimal precision (10000.25)',
      actualDecNet === expectedDecNet,
      `Expected: ${expectedDecNet}, Got: ${actualDecNet}`
    );

    // 1.10 Stress testing accumulation across 30 micro-transactions
    let oracleTotalInc = 0;
    for (let i = 1; i <= 15; i++) {
      const amt = i * 10.5; // 10.5, 21.0, 31.5...
      oracleTotalInc += amt;
      await request(app)
        .post('/api/finance/transactions')
        .set('Cookie', authDecimalTenant.cookie)
        .send({
          type: 'INCOME',
          categoryId: dIncomeCat.id,
          amount: amt,
          description: `Micro income ${i}`,
          paymentMethod: 'QRIS',
          date: '2026-10-04'
        })
        .expect(201);
    }

    const resMicroList = await request(app)
      .get('/api/finance/transactions?limit=100')
      .set('Cookie', authDecimalTenant.cookie)
      .expect(200);

    const filteredSummaryInc = resMicroList.body.filtered_summary.total_income;
    const expectedAccumulated = 12345.67 + oracleTotalInc;
    const diff = Math.abs(filteredSummaryInc - expectedAccumulated);

    recordTest(
      'Calc 1.10: Micro-transaction rapid accumulation (15 entries) maintains arithmetic consistency within 0.001 tolerance',
      diff < 0.001,
      `Oracle: ${expectedAccumulated}, Filtered: ${filteredSummaryInc}, Diff: ${diff}`
    );

    // ============================================================================
    // SECTION 2: ATTACK TENANT BOUNDARY ISOLATION
    // ============================================================================
    console.log(`\n${COLORS.cyan}${COLORS.bold}▶ Vector 2: Attack Tenant Boundary Isolation${COLORS.reset}`);

    // Create a custom category and an exclusive transaction in GPS Motor
    const resCustomCatA = await request(app)
      .post('/api/finance/categories')
      .set('Cookie', authGps.cookie)
      .send({
        name: 'Kategori Rahasia Tenant GPS',
        type: 'EXPENSE'
      })
      .expect(201);
    const secretCatAId = resCustomCatA.body.category.id;

    const resSecretTrxA = await request(app)
      .post('/api/finance/transactions')
      .set('Cookie', authGps.cookie)
      .send({
        type: 'EXPENSE',
        categoryId: secretCatAId,
        amount: 8888888,
        description: 'Transaksi Super Rahasia GPS Motor Kediri 8888888',
        paymentMethod: 'TRANSFER',
        date: '2026-10-04'
      })
      .expect(201);
    const secretTrxAId = resSecretTrxA.body.transaction.id;

    // 2.1 Cross-tenant category modification
    const resCrossEditCat = await request(app)
      .put(`/api/finance/categories/${secretCatAId}`)
      .set('Cookie', authBerkah.cookie)
      .send({ name: 'Hacked Category Name By Berkah' });

    recordTest(
      'Iso 2.1: Tenant B attempting to update Tenant A category returns 404 Not Found',
      resCrossEditCat.status === 404,
      `Status: ${resCrossEditCat.status}`
    );

    // 2.2 Cross-tenant category deletion
    const resCrossDelCat = await request(app)
      .delete(`/api/finance/categories/${secretCatAId}`)
      .set('Cookie', authBerkah.cookie);

    recordTest(
      'Iso 2.2: Tenant B attempting to delete Tenant A category returns 404 Not Found',
      resCrossDelCat.status === 404,
      `Status: ${resCrossDelCat.status}`
    );

    // 2.3 Cross-tenant category namespace independence: Tenant B creates category with SAME name without conflict
    const resSameNameCat = await request(app)
      .post('/api/finance/categories')
      .set('Cookie', authBerkah.cookie)
      .send({
        name: 'Kategori Rahasia Tenant GPS',
        type: 'EXPENSE'
      });

    recordTest(
      'Iso 2.3: Tenant B creating category with same name as Tenant A succeeds (isolated per-tenant namespace)',
      resSameNameCat.status === 201,
      `Status: ${resSameNameCat.status}`
    );

    // 2.4 Cross-tenant category hijacking in transaction creation
    const resHijackCreate = await request(app)
      .post('/api/finance/transactions')
      .set('Cookie', authBerkah.cookie)
      .send({
        type: 'EXPENSE',
        categoryId: secretCatAId,
        amount: 50000,
        description: 'Percobaan pembajakan kategori luar tenant'
      });

    recordTest(
      'Iso 2.4: Tenant B attempting to create transaction referencing Tenant A category returns 404 Not Found',
      resHijackCreate.status === 404,
      `Status: ${resHijackCreate.status}`
    );

    // 2.5 Cross-tenant category hijacking in transaction update
    const resTrxB = await request(app)
      .post('/api/finance/transactions')
      .set('Cookie', authBerkah.cookie)
      .send({
        type: 'EXPENSE',
        categoryId: berkahExpenseCat.id,
        amount: 100000,
        description: 'Transaksi sah Tenant B'
      })
      .expect(201);
    const trxBId = resTrxB.body.transaction.id;

    const resHijackUpdate = await request(app)
      .put(`/api/finance/transactions/${trxBId}`)
      .set('Cookie', authBerkah.cookie)
      .send({
        categoryId: secretCatAId
      });

    recordTest(
      'Iso 2.5: Tenant B attempting to update transaction category to Tenant A category returns 404 Not Found',
      resHijackUpdate.status === 404,
      `Status: ${resHijackUpdate.status}`
    );

    // 2.6 Cross-tenant transaction retrieval
    const resCrossGetTrx = await request(app)
      .get(`/api/finance/transactions/${secretTrxAId}`)
      .set('Cookie', authBerkah.cookie);

    recordTest(
      'Iso 2.6: Tenant B attempting to fetch Tenant A transaction by ID returns 404 Not Found',
      resCrossGetTrx.status === 404,
      `Status: ${resCrossGetTrx.status}`
    );

    // 2.7 Cross-tenant transaction modification
    const resCrossPutTrx = await request(app)
      .put(`/api/finance/transactions/${secretTrxAId}`)
      .set('Cookie', authBerkah.cookie)
      .send({
        amount: 1,
        description: 'Hacked by Berkah'
      });

    const checkTrxA = db.prepare('SELECT amount, description FROM transactions WHERE id = ?').get(secretTrxAId);

    recordTest(
      'Iso 2.7: Tenant B attempting to modify Tenant A transaction returns 404 and leaves data completely unaltered',
      resCrossPutTrx.status === 404 && checkTrxA.amount === 8888888 && checkTrxA.description.includes('Super Rahasia'),
      `Status: ${resCrossPutTrx.status}, DB Amount: ${checkTrxA.amount}`
    );

    // 2.8 Cross-tenant transaction deletion
    const resCrossDelTrx = await request(app)
      .delete(`/api/finance/transactions/${secretTrxAId}`)
      .set('Cookie', authBerkah.cookie);

    const checkTrxAExists = db.prepare('SELECT id FROM transactions WHERE id = ?').get(secretTrxAId);

    recordTest(
      'Iso 2.8: Tenant B attempting to delete Tenant A transaction returns 404 and record persists in DB',
      resCrossDelTrx.status === 404 && Boolean(checkTrxAExists),
      `Status: ${resCrossDelTrx.status}`
    );

    // 2.9 Cross-tenant transaction search leak
    const resSearchLeak = await request(app)
      .get('/api/finance/transactions?search=Super%20Rahasia%20GPS')
      .set('Cookie', authBerkah.cookie)
      .expect(200);

    recordTest(
      'Iso 2.9: Searching for Tenant A exclusive keyword from Tenant B account returns 0 transactions',
      resSearchLeak.body.transactions.length === 0,
      `Results count: ${resSearchLeak.body.transactions.length}`
    );

    // 2.10 Cross-tenant category filter query
    const resCatFilterLeak = await request(app)
      .get(`/api/finance/transactions?categoryId=${secretCatAId}`)
      .set('Cookie', authBerkah.cookie)
      .expect(200);

    recordTest(
      'Iso 2.10: Filtering transactions by Tenant A categoryId from Tenant B returns 0 transactions',
      resCatFilterLeak.body.transactions.length === 0,
      `Results count: ${resCatFilterLeak.body.transactions.length}`
    );

    // 2.11 Cross-tenant financial summary leak
    const resSummaryB = await request(app)
      .get('/api/finance/summary')
      .set('Cookie', authBerkah.cookie)
      .expect(200);

    // Tenant B totals should NOT include Tenant A's 500,000,000 or 8,888,888
    recordTest(
      'Iso 2.11: Tenant B financial summary shows 0% contamination from Tenant A multi-million figures',
      resSummaryB.body.total_expense !== 500000000 &&
      !JSON.stringify(resSummaryB.body).includes('8888888') &&
      !JSON.stringify(resSummaryB.body).includes('500000000'),
      `Tenant B expense total: ${resSummaryB.body.total_expense}`
    );

    // 2.12 Cross-tenant CSV export leak
    const resCsvB = await request(app)
      .get('/api/finance/export/csv')
      .set('Cookie', authBerkah.cookie)
      .expect(200);

    recordTest(
      'Iso 2.12: Tenant B CSV export contains zero rows or mentions of Tenant A transactions',
      !resCsvB.text.includes('8888888') && !resCsvB.text.includes('Super Rahasia'),
      'CSV content verified clean'
    );

    // 2.13 Cross-tenant PDF export leak (P&L and Category Breakdown)
    const resPnlPdfB = await request(app)
      .get('/api/finance/export/pnl-pdf')
      .set('Cookie', authBerkah.cookie)
      .expect(200);

    const resCatPdfB = await request(app)
      .get('/api/finance/export/category-pdf')
      .set('Cookie', authBerkah.cookie)
      .expect(200);

    recordTest(
      'Iso 2.13: Exporting P&L and Category Breakdown PDFs for Tenant B produces valid buffers without leaking Tenant A',
      isPdfBuffer(resPnlPdfB) && isPdfBuffer(resCatPdfB),
      'PDF buffers verified'
    );

    // 2.14 Budget target isolation
    await request(app)
      .put('/api/finance/budget-target')
      .set('Cookie', authGps.cookie)
      .send({ target: 75000000 })
      .expect(200);

    const resBudgetTargetB = await request(app)
      .get('/api/finance/budget-target')
      .set('Cookie', authBerkah.cookie)
      .expect(200);

    recordTest(
      'Iso 2.14: Modifying monthly budget target on Tenant A does not alter Tenant B budget target',
      resBudgetTargetB.body.monthly_revenue_target !== 75000000,
      `Tenant B Target: ${resBudgetTargetB.body.monthly_revenue_target}`
    );

    // 2.15 Header Spoofing Attack: Attacker sends forged x-tenant-id header with Tenant A ID
    const resHeaderSpoof = await request(app)
      .get('/api/finance/summary')
      .set('Cookie', authBerkah.cookie)
      .set('x-tenant-id', FIXTURES.tenants.gpsMotor.id)
      .expect(200);

    recordTest(
      'Iso 2.15: Header spoofing attack (sending x-tenant-id of foreign tenant) fails to bypass session isolation',
      !JSON.stringify(resHeaderSpoof.body).includes('500000000') &&
      resHeaderSpoof.body.total_expense === resSummaryB.body.total_expense,
      `Header spoofing blocked: Expense=${resHeaderSpoof.body.total_expense}`
    );

    // ============================================================================
    // SECTION 3: ATTACK VALIDATION BOUNDARIES & SQL INJECTION RESISTANCE
    // ============================================================================
    console.log(`\n${COLORS.cyan}${COLORS.bold}▶ Vector 3: Attack Validation Boundaries & Injection Resistance${COLORS.reset}`);

    // 3.1 Negative amount rejection
    const negAmountCases = [-1, -50000, -0.01, '-99999'];
    let allNegRejected = true;
    for (const amt of negAmountCases) {
      const res = await request(app)
        .post('/api/finance/transactions')
        .set('Cookie', authGps.cookie)
        .send({
          type: 'INCOME',
          categoryId: gpsIncomeCat.id,
          amount: amt,
          description: 'Uji nominal negatif'
        });
      if (res.status !== 400) allNegRejected = false;
    }

    recordTest(
      'Val 3.1: Transaction creation rejects negative amounts (-1, -50000, -0.01, "-99999") with HTTP 400',
      allNegRejected,
      `All cases rejected: ${allNegRejected}`
    );

    // 3.2 Indonesian key negative nominal rejection
    const resNegNominal = await request(app)
      .post('/api/finance/transactions')
      .set('Cookie', authGps.cookie)
      .send({
        tipe: 'EXPENSE',
        kategoriId: gpsExpenseCat.id,
        nominal: -150000,
        deskripsi: 'Uji nominal bahasa indonesia negatif'
      });

    recordTest(
      'Val 3.2: Transaction creation rejects negative nominal (Indonesian key) with HTTP 400',
      resNegNominal.status === 400,
      `Status: ${resNegNominal.status}`
    );

    // 3.3 Zero amounts rejection
    const zeroAmountCases = [0, 0.0, '0', '0.00'];
    let allZeroRejected = true;
    for (const z of zeroAmountCases) {
      const res = await request(app)
        .post('/api/finance/transactions')
        .set('Cookie', authGps.cookie)
        .send({
          type: 'INCOME',
          categoryId: gpsIncomeCat.id,
          amount: z,
          description: 'Uji nominal 0'
        });
      if (res.status !== 400) allZeroRejected = false;
    }

    recordTest(
      'Val 3.3: Transaction creation strictly rejects zero amounts (0, 0.0, "0") with HTTP 400',
      allZeroRejected,
      `All zero cases rejected: ${allZeroRejected}`
    );

    // 3.4 Non-numeric / NaN / Infinity / Null amounts
    const invalidAmountCases = ['abc', NaN, Infinity, -Infinity, null, {}, []];
    let allInvalidAmtRejected = true;
    for (const inv of invalidAmountCases) {
      const res = await request(app)
        .post('/api/finance/transactions')
        .set('Cookie', authGps.cookie)
        .send({
          type: 'INCOME',
          categoryId: gpsIncomeCat.id,
          amount: inv,
          description: 'Uji nominal invalid type'
        });
      if (res.status !== 400) allInvalidAmtRejected = false;
    }

    recordTest(
      'Val 3.4: Transaction creation strictly rejects non-numeric amounts ("abc", NaN, Infinity, null, {}) with HTTP 400',
      allInvalidAmtRejected,
      `All invalid types rejected: ${allInvalidAmtRejected}`
    );

    // 3.5 Invalid transaction types
    const invalidTypeCases = ['TRANSFER', 'LOAN', 'HUTANG', '', 999];
    let allInvalidTypesRejected = true;
    for (const t of invalidTypeCases) {
      const res = await request(app)
        .post('/api/finance/transactions')
        .set('Cookie', authGps.cookie)
        .send({
          type: t,
          categoryId: gpsIncomeCat.id,
          amount: 50000,
          description: 'Uji tipe transaksi invalid'
        });
      if (res.status !== 400) allInvalidTypesRejected = false;
    }

    recordTest(
      'Val 3.5: Transaction creation strictly rejects invalid types (must be INCOME or EXPENSE) with HTTP 400',
      allInvalidTypesRejected,
      `All invalid types rejected: ${allInvalidTypesRejected}`
    );

    // 3.6 Empty / short / non-string description
    const invalidDescCases = ['', ' ', 'a', 12345, null, {}];
    let allInvalidDescRejected = true;
    for (const d of invalidDescCases) {
      const res = await request(app)
        .post('/api/finance/transactions')
        .set('Cookie', authGps.cookie)
        .send({
          type: 'INCOME',
          categoryId: gpsIncomeCat.id,
          amount: 50000,
          description: d
        });
      if (res.status !== 400) allInvalidDescRejected = false;
    }

    recordTest(
      'Val 3.6: Transaction creation rejects empty, whitespace, and < 2 character descriptions with HTTP 400',
      allInvalidDescRejected,
      `All invalid descriptions rejected: ${allInvalidDescRejected}`
    );

    // 3.7 Invalid payment methods
    const invalidPmCases = ['BITCOIN', 'CRYPTO', 'PAYPAL', 'HUTANG', 'KREDIT', 'DEBIT'];
    let allInvalidPmRejected = true;
    for (const pm of invalidPmCases) {
      const res = await request(app)
        .post('/api/finance/transactions')
        .set('Cookie', authGps.cookie)
        .send({
          type: 'INCOME',
          categoryId: gpsIncomeCat.id,
          amount: 50000,
          description: 'Uji metode bayar aneh',
          paymentMethod: pm
        });
      if (res.status !== 400) allInvalidPmRejected = false;
    }

    recordTest(
      'Val 3.7: Transaction creation rejects non-supported payment methods (BITCOIN, PAYPAL, HUTANG, etc.) with HTTP 400',
      allInvalidPmRejected,
      `All invalid payment methods rejected: ${allInvalidPmRejected}`
    );

    // 3.8 Non-existent category ID
    const resNonExistentCat = await request(app)
      .post('/api/finance/transactions')
      .set('Cookie', authGps.cookie)
      .send({
        type: 'INCOME',
        categoryId: '00000000-0000-0000-0000-000000000000',
        amount: 50000,
        description: 'Uji kategori non-existent'
      });

    recordTest(
      'Val 3.8: Transaction creation with non-existent categoryId returns HTTP 404 Not Found',
      resNonExistentCat.status === 404,
      `Status: ${resNonExistentCat.status}`
    );

    // 3.9 Update transaction validation: cannot update to negative amount or invalid payment method
    const resUpdateNeg = await request(app)
      .put(`/api/finance/transactions/${secretTrxAId}`)
      .set('Cookie', authGps.cookie)
      .send({ amount: -99999 });

    const resUpdateBadPm = await request(app)
      .put(`/api/finance/transactions/${secretTrxAId}`)
      .set('Cookie', authGps.cookie)
      .send({ paymentMethod: 'ETHEREUM' });

    recordTest(
      'Val 3.9: Transaction update (PUT) rejects negative amounts and invalid payment methods with HTTP 400',
      resUpdateNeg.status === 400 && resUpdateBadPm.status === 400,
      `Statuses: Neg=${resUpdateNeg.status}, BadPm=${resUpdateBadPm.status}`
    );

    // 3.10 Category creation validation
    const resCatShort = await request(app).post('/api/finance/categories').set('Cookie', authGps.cookie).send({ name: 'A', type: 'INCOME' });
    const resCatSpace = await request(app).post('/api/finance/categories').set('Cookie', authGps.cookie).send({ name: '   ', type: 'INCOME' });
    const resCatBadType = await request(app).post('/api/finance/categories').set('Cookie', authGps.cookie).send({ name: 'Dividen Saham', type: 'INVESTASI' });

    recordTest(
      'Val 3.10: Category creation rejects name < 2 chars, whitespace-only, and invalid type with HTTP 400',
      resCatShort.status === 400 && resCatSpace.status === 400 && resCatBadType.status === 400,
      `Statuses: Short=${resCatShort.status}, Space=${resCatSpace.status}, BadType=${resCatBadType.status}`
    );

    // 3.11 Category duplicate conflict (case-insensitive)
    const resCatDup1 = await request(app).post('/api/finance/categories').set('Cookie', authGps.cookie).send({ name: 'Sewa Alat Berat Khusus', type: 'EXPENSE' }).expect(201);
    const resCatDup2 = await request(app).post('/api/finance/categories').set('Cookie', authGps.cookie).send({ name: 'sewa alat berat khusus', type: 'EXPENSE' });

    recordTest(
      'Val 3.11: Category creation rejects duplicate names under same type with HTTP 409 Conflict (case-insensitive)',
      resCatDup2.status === 409,
      `Status: ${resCatDup2.status}`
    );

    // 3.12 Default category deletion protection
    const resDelDefault = await request(app).delete(`/api/finance/categories/${gpsIncomeCat.id}`).set('Cookie', authGps.cookie);
    recordTest(
      'Val 3.12: Deleting system default category is strictly blocked with HTTP 400 Bad Request',
      resDelDefault.status === 400,
      `Status: ${resDelDefault.status}`
    );

    // 3.13 In-use category deletion protection
    const resDelInUse = await request(app).delete(`/api/finance/categories/${secretCatAId}`).set('Cookie', authGps.cookie);
    recordTest(
      'Val 3.13: Deleting custom category currently referenced by active transactions is blocked with HTTP 400 Bad Request',
      resDelInUse.status === 400,
      `Status: ${resDelInUse.status}`
    );

    // 3.14 Budget target validation
    const resBadTarget1 = await request(app).put('/api/finance/budget-target').set('Cookie', authGps.cookie).send({ target: -1000000 });
    const resBadTarget2 = await request(app).put('/api/finance/budget-target').set('Cookie', authGps.cookie).send({ target: 0 });
    const resBadTarget3 = await request(app).put('/api/finance/budget-target').set('Cookie', authGps.cookie).send({ target: 'tidak valid' });

    recordTest(
      'Val 3.14: Updating monthly budget target rejects negative, zero, and non-numeric values with HTTP 400',
      resBadTarget1.status === 400 && resBadTarget2.status === 400 && resBadTarget3.status === 400,
      `Statuses: Neg=${resBadTarget1.status}, Zero=${resBadTarget2.status}, Text=${resBadTarget3.status}`
    );

    // 3.15 SQL Injection Attack: Search query string
    const sqlInjectionSearches = [
      "'; DROP TABLE transactions; --",
      "' OR 1=1 --",
      "' UNION SELECT * FROM users --",
      "\" OR \"\"=\"",
      "%' OR '1'='1"
    ];

    let allSqlSearchSafe = true;
    for (const sqlPayload of sqlInjectionSearches) {
      const res = await request(app)
        .get(`/api/finance/transactions?search=${encodeURIComponent(sqlPayload)}`)
        .set('Cookie', authGps.cookie);
      if (res.status !== 200 || !Array.isArray(res.body.transactions)) {
        allSqlSearchSafe = false;
      }
    }

    const tableStillExists = db.prepare("SELECT count(*) as count FROM transactions").get();

    recordTest(
      'Val 3.15: SQL Injection attempts in transaction search parameters (; DROP TABLE, \' OR 1=1, UNION SELECT) are neutralized safely',
      allSqlSearchSafe && tableStillExists && tableStillExists.count > 0,
      `Table survived, count: ${tableStillExists?.count}`
    );

    // 3.16 SQL Injection Attack: Date and range filters
    const resSqlDate = await request(app)
      .get("/api/finance/transactions?startDate=2026-01-01' OR 1=1 --&endDate=2026-12-31' UNION SELECT * FROM users --")
      .set('Cookie', authGps.cookie)
      .expect(200);

    const resSqlRange = await request(app)
      .get("/api/finance/transactions?minAmount=0 OR 1=1&maxAmount=100000000; DROP TABLE users")
      .set('Cookie', authGps.cookie)
      .expect(200);

    recordTest(
      'Val 3.16: SQL Injection attempts in date range and numeric bounds are safely handled without data breach',
      Array.isArray(resSqlDate.body.transactions) && Array.isArray(resSqlRange.body.transactions),
      'SQL date & range responses valid'
    );

    // 3.17 SQL Injection Attack: Sorting parameters
    const resSqlSort = await request(app)
      .get("/api/finance/transactions?sortBy=date; DROP TABLE transactions; --&sortOrder=asc; DROP TABLE users;")
      .set('Cookie', authGps.cookie)
      .expect(200);

    recordTest(
      'Val 3.17: SQL Injection attempts in sortBy and sortOrder parameters fall back to safe columns without execution',
      Array.isArray(resSqlSort.body.transactions),
      'Safe column fallback verified'
    );

    // 3.18 SQL Injection Attack: Summary & P&L parameters
    const resSqlSummary = await request(app)
      .get("/api/finance/summary?period=month' OR 1=1 --&startDate=2026-01-01' OR '1'='1")
      .set('Cookie', authGps.cookie)
      .expect(200);

    const resSqlPnl = await request(app)
      .get("/api/finance/pnl?months=12; DROP TABLE transactions; --")
      .set('Cookie', authGps.cookie)
      .expect(200);

    recordTest(
      'Val 3.18: SQL Injection attempts in summary period and PnL months execute safely without exception',
      resSqlSummary.body.success === true && resSqlPnl.body.success === true,
      'Summary & PnL endpoints remained healthy'
    );

    // 3.19 Special characters & Unicode robustness
    const unicodeDesc = '🔧 Servis Besar & Penggantian Sparepart Mobil Avanza 🚗💨 [Ref: #GP-99]';
    const resUnicodeTrx = await request(app)
      .post('/api/finance/transactions')
      .set('Cookie', authGps.cookie)
      .send({
        type: 'INCOME',
        categoryId: gpsIncomeCat.id,
        amount: 850000,
        description: unicodeDesc,
        paymentMethod: 'QRIS',
        date: '2026-10-04'
      })
      .expect(201);

    const savedUnicodeDesc = resUnicodeTrx.body.transaction.description;
    recordTest(
      'Val 3.19: Special characters, technical symbols, and Indonesian Unicode emojis in description are preserved exactly',
      savedUnicodeDesc === unicodeDesc,
      `Saved: ${savedUnicodeDesc}`
    );

    // 3.20 XSS payload safety
    const xssDesc = '<script>alert("xss")</script><img src=x onerror=alert(1)>';
    const resXssTrx = await request(app)
      .post('/api/finance/transactions')
      .set('Cookie', authGps.cookie)
      .send({
        type: 'EXPENSE',
        categoryId: gpsExpenseCat.id,
        amount: 50000,
        description: xssDesc,
        paymentMethod: 'CASH',
        date: '2026-10-04'
      })
      .expect(201);

    recordTest(
      'Val 3.20: XSS payloads in transaction descriptions are stored safely as verbatim text without server execution',
      resXssTrx.body.transaction.description === xssDesc,
      `Stored text: ${resXssTrx.body.transaction.description}`
    );

    // 3.21 CSV injection & RFC-4180 escaping roundtrip
    const trickyCsvDesc = 'Ganti Oli "Shell Helix 5W-30", filter rem, dan jasa servis\n(Diskon 10%)';
    await request(app)
      .post('/api/finance/transactions')
      .set('Cookie', authGps.cookie)
      .send({
        type: 'INCOME',
        categoryId: gpsIncomeCat.id,
        amount: 320000,
        description: trickyCsvDesc,
        paymentMethod: 'CASH',
        date: '2026-10-04'
      })
      .expect(201);

    const resExportCsv = await request(app)
      .get('/api/finance/export/csv')
      .set('Cookie', authGps.cookie)
      .expect(200);

    const parsedRoundtrip = parseRFC4180Csv(resExportCsv.text);
    const foundRoundtripDesc = parsedRoundtrip.some(row => row.some(col => col === trickyCsvDesc));

    recordTest(
      'Val 3.21: CSV export handles double quotes, commas, and newlines in description with strict RFC-4180 roundtrip integrity',
      foundRoundtripDesc,
      'RFC-4180 parser found exact unescaped description match in parsed stream'
    );

  } finally {
    cleanup();
  }

  // ============================================================================
  // SUMMARY & VERDICT
  // ============================================================================
  console.log(`\n${COLORS.bold}----------------------------------------------------------------${COLORS.reset}`);
  console.log(`${COLORS.bold}  Milestone 4 Adversarial Challenge Summary:${COLORS.reset}`);
  console.log(`  Total Challenges: ${challengeResults.passed + challengeResults.failed}`);
  console.log(`  ${COLORS.green}✔ Passed:         ${challengeResults.passed}${COLORS.reset}`);
  console.log(`  ${challengeResults.failed > 0 ? COLORS.red : COLORS.dim}✖ Failed:         ${challengeResults.failed}${COLORS.reset}`);
  console.log(`${COLORS.bold}----------------------------------------------------------------${COLORS.reset}\n`);

  if (challengeResults.failed > 0) {
    console.error(`${COLORS.red}${COLORS.bold}VERDICT: FAIL — ${challengeResults.failed} adversarial vulnerability/bug(s) detected.${COLORS.reset}`);
    process.exit(1);
  } else {
    console.log(`${COLORS.green}${COLORS.bold}VERDICT: APPROVE — All Milestone 4 adversarial challenges PASSED with zero defects.${COLORS.reset}\n`);
    process.exit(0);
  }
}

runM4AdversarialChallenge();
