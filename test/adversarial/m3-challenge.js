#!/usr/bin/env node
/**
 * Empirical Adversarial Challenge Test Harness for Milestone 3
 * Bengkel Mobil GPS Motor Kediri
 * 
 * Adversarially challenges:
 * 1. E08: Divide-by-zero margin boundary conditions (buy=0, sell=0, both=0, large numbers, undefined).
 * 2. E09: Selling at a loss (sell_price < buy_price) produces negative margin and correct visual flags.
 * 3. E10: Stock OUT exceeding available inventory strictly rejected with HTTP 422.
 * 4. E11: Stock Opname with negative physical discrepancy (deficit/breakage) correctly records adjustment.
 * 5. E18: RFC-4180 CSV export escaping for commas, quotes, CRLF, and parser roundtrip.
 * 6. Multi-Tenant Isolation: Tenant B cannot view, query, mutate, restock, stock out, opname, or export Tenant A inventory.
 * 7. Concurrency & Transactional Underflow Prevention: Concurrent stock out race condition handling.
 */

import request from 'supertest';
import assert from 'node:assert/strict';
import { createTestApp, loginUser, oracleProfitMargin } from '../supertestHelper.js';
import { calculateProfitMargin } from '../../server/routes/inventory.js';
import { escapeCsvField, generateCsv } from '../../server/services/csvService.js';
import { FIXTURES } from '../fixtures.js';

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
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
          // Escaped quote
          currentField += '"';
          i += 2;
          continue;
        } else {
          // End of quote
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
        continue;
      }
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  // Filter out any trailing empty row from final newline
  return rows.filter(r => r.length > 1 || (r.length === 1 && r[0] !== ''));
}

async function runM3AdversarialChallenge() {
  console.log(`\n${COLORS.bold}================================================================${COLORS.reset}`);
  console.log(`${COLORS.bold}  Milestone 3: Empirical Adversarial Challenge Test Harness     ${COLORS.reset}`);
  console.log(`${COLORS.bold}================================================================${COLORS.reset}\n`);

  const { app, db, cleanup } = createTestApp();

  try {
    const authGps = await loginUser(app, {
      tenantSlug: FIXTURES.tenants.gpsMotor.slug,
      email: FIXTURES.users.gpsAdmin.email
    });

    const authBerkah = await loginUser(app, {
      tenantSlug: FIXTURES.tenants.berkahKediri.slug,
      email: FIXTURES.users.berkahAdmin.email
    });

    // ============================================================================
    // SECTION 1: Margin Calculations & Zero/Loss Boundaries (E08, E09)
    // ============================================================================
    console.log(`${COLORS.bold}${COLORS.cyan}▶ SECTION 1: Profit Margin & Zero/Loss Boundaries (E08, E09)${COLORS.reset}`);

    // 1.1 Both zero (promotional giveaway / gift)
    const mBothZero = calculateProfitMargin(0, 0);
    recordTest(
      'E08: Both buy=0 and sell=0 safe fallback',
      mBothZero.nominal === 0 && mBothZero.percentage === 0 && !mBothZero.isLoss && !mBothZero.isProfit && Number.isFinite(mBothZero.percentage),
      `Output: ${JSON.stringify(mBothZero)}`
    );

    // 1.2 Buy=0, Sell > 0 (100% margin pure profit)
    const mBuyZero = calculateProfitMargin(0, 50000);
    recordTest(
      'E08: buy_price=0, sell_price=50000 produces 100% margin',
      mBuyZero.nominal === 50000 && mBuyZero.percentage === 100 && mBuyZero.isProfit && !mBuyZero.isLoss,
      `Output: ${JSON.stringify(mBuyZero)}`
    );

    // 1.3 Buy > 0, Sell=0 (100% loss / total write-off, no divide-by-zero crash)
    const mSellZero = calculateProfitMargin(50000, 0);
    recordTest(
      'E08/E09: buy_price=50000, sell_price=0 produces -100% margin without div-by-zero NaN',
      mSellZero.nominal === -50000 && mSellZero.percentage === -100 && mSellZero.isLoss && !mSellZero.isProfit && Number.isFinite(mSellZero.percentage),
      `Output: ${JSON.stringify(mSellZero)}`
    );

    // 1.4 Standard loss selling (E09)
    const mLoss = calculateProfitMargin(150000, 120000);
    recordTest(
      'E09: sell_price < buy_price produces negative nominal and percentage',
      mLoss.nominal === -30000 && mLoss.percentage === -25 && mLoss.isLoss === true && mLoss.isProfit === false,
      `Output: ${JSON.stringify(mLoss)}`
    );

    // 1.5 Micro loss (1 rupiah difference)
    const mMicroLoss = calculateProfitMargin(100000, 99999);
    recordTest(
      'E09: Micro loss (1 rupiah difference) flagged as isLoss=true with nominal=-1',
      mMicroLoss.nominal === -1 && mMicroLoss.isLoss === true && mMicroLoss.isProfit === false,
      `Output: ${JSON.stringify(mMicroLoss)}`
    );

    // 1.5b Noticeable loss with negative percentage
    const mNoticeableLoss = calculateProfitMargin(100000, 95000);
    recordTest(
      'E09: Loss with sell=95000 and buy=100000 produces negative percent (-5.26%)',
      mNoticeableLoss.nominal === -5000 && mNoticeableLoss.percentage < 0 && mNoticeableLoss.isLoss === true,
      `Output: ${JSON.stringify(mNoticeableLoss)}`
    );

    // 1.6 Break-even (0 margin)
    const mBreakEven = calculateProfitMargin(75000, 75000);
    recordTest(
      'E08: Break-even pricing produces 0 nominal and 0% margin',
      mBreakEven.nominal === 0 && mBreakEven.percentage === 0 && !mBreakEven.isLoss && !mBreakEven.isProfit,
      `Output: ${JSON.stringify(mBreakEven)}`
    );

    // 1.7 Null, undefined, and string coercoin
    const mNullish = calculateProfitMargin(null, undefined);
    recordTest(
      'E08: Null and undefined parameters safe fallback',
      mNullish.nominal === 0 && mNullish.percentage === 0 && Number.isFinite(mNullish.percentage),
      `Output: ${JSON.stringify(mNullish)}`
    );

    const mStringCoerce = calculateProfitMargin("20000", "25000");
    recordTest(
      'E08: Numeric string coercion correctly calculates margin',
      mStringCoerce.nominal === 5000 && mStringCoerce.percentage === 20 && mStringCoerce.isProfit,
      `Output: ${JSON.stringify(mStringCoerce)}`
    );

    // 1.8 API POST with loss item verifies backend response payload flags
    let lossPartId = null;
    const resCreateLoss = await request(app)
      .post('/api/inventory')
      .set('Cookie', authGps.cookie)
      .send({
        sku: 'ADV-LOSS-01',
        nama: 'Aki Bekas Cuci Gudang Rugi',
        kategori: 'Kelistrikan',
        satuan: 'unit',
        stok: 5,
        stokMinimum: 1,
        hargaBeli: 600000,
        hargaJual: 450000
      });

    lossPartId = resCreateLoss.body?.item?.id || resCreateLoss.body?.id;
    const itemData = resCreateLoss.body?.item || {};
    recordTest(
      'E09: API POST inventory correctly returns is_loss=true, profit_margin_nominal=-150000, profit_margin_percent=-33.33%',
      resCreateLoss.status === 201 &&
      itemData.is_loss === true &&
      itemData.isLoss === true &&
      itemData.profit_margin_nominal === -150000 &&
      Math.abs(itemData.profit_margin_percent - (-33.33)) < 0.05,
      `Status: ${resCreateLoss.status}, Body: ${JSON.stringify(resCreateLoss.body)}`
    );

    // 1.9 Valuation Report under mixture of profitable, loss-making, and zero-price items
    // Add buy=0 item
    await request(app)
      .post('/api/inventory')
      .set('Cookie', authGps.cookie)
      .send({
        sku: 'ADV-FREE-01',
        nama: 'Stiker Merchandise Gratis',
        kategori: 'Aksesoris',
        stok: 100,
        hargaBeli: 0,
        hargaJual: 0
      });

    const resValuation = await request(app)
      .get('/api/inventory/reports/valuation')
      .set('Cookie', authGps.cookie);

    const valData = resValuation.body;
    recordTest(
      'E08: Valuation summary handles mix of zero and loss parts without NaN or Infinity',
      resValuation.status === 200 &&
      Number.isFinite(valData.total_buy_value) &&
      Number.isFinite(valData.total_sell_value) &&
      Number.isFinite(valData.potential_gross_profit) &&
      Number.isFinite(valData.profit_margin_percent),
      `Valuation: ${JSON.stringify(valData)}`
    );

    // ============================================================================
    // SECTION 2: Stock Underflow & Stock Movement Constraints (E10)
    // ============================================================================
    console.log(`\n${COLORS.bold}${COLORS.cyan}▶ SECTION 2: Stock Underflow & Stock OUT Hardening (E10)${COLORS.reset}`);

    // Create item with stock 5
    const resCreateStock5 = await request(app)
      .post('/api/inventory')
      .set('Cookie', authGps.cookie)
      .send({
        sku: 'ADV-STOCK-5',
        nama: 'Busi Iridium Racing (Stock 5)',
        kategori: 'Busi',
        stok: 5,
        min_stock: 2,
        hargaBeli: 50000,
        hargaJual: 80000
      });
    const part5Id = resCreateStock5.body.id || resCreateStock5.body.item.id;

    // 2.1 Request qty 6 (underflow by 1) -> strictly HTTP 422
    const resUnderflow1 = await request(app)
      .post('/api/stock-movements/out')
      .set('Cookie', authGps.cookie)
      .send({
        sparepartId: part5Id,
        qty: 6,
        catatan: 'Adversarial underflow test'
      });

    recordTest(
      'E10: Stock OUT requesting 6 when stock is 5 returns HTTP 422 with diagnostic payload',
      resUnderflow1.status === 422 &&
      resUnderflow1.body.availableStock === 5 &&
      resUnderflow1.body.requestedQty === 6 &&
      resUnderflow1.body.error === 'Stok Tidak Mencukupi',
      `Status: ${resUnderflow1.status}, Body: ${JSON.stringify(resUnderflow1.body)}`
    );

    // Verify stock is STILL 5 in DB
    const stockAfterUnderflow = db.prepare('SELECT stock FROM spareparts WHERE id = ?').get(part5Id).stock;
    recordTest(
      'E10: Database stock remains unmodified after rejected underflow',
      stockAfterUnderflow === 5,
      `Actual stock: ${stockAfterUnderflow}`
    );

    // 2.2 Legitimate exact stock withdrawal (qty = 5)
    const resExactOut = await request(app)
      .post('/api/stock-movements/out')
      .set('Cookie', authGps.cookie)
      .send({
        sparepartId: part5Id,
        qty: 5,
        catatan: 'Habiskan stok sampai tepat 0'
      });

    recordTest(
      'E10: Exact stock withdrawal (qty = 5) succeeds with newStock = 0',
      resExactOut.status === 201 && resExactOut.body.newStock === 0,
      `Status: ${resExactOut.status}, Body: ${JSON.stringify(resExactOut.body)}`
    );

    // 2.3 Withdrawal when stock is 0 -> strictly HTTP 422
    const resZeroOut = await request(app)
      .post('/api/stock-movements/out')
      .set('Cookie', authGps.cookie)
      .send({
        sparepartId: part5Id,
        qty: 1,
        catatan: 'Ambil saat stok 0'
      });

    recordTest(
      'E10: Stock OUT from 0 stock strictly rejected with HTTP 422',
      resZeroOut.status === 422 && resZeroOut.body.availableStock === 0,
      `Status: ${resZeroOut.status}, Body: ${JSON.stringify(resZeroOut.body)}`
    );

    // 2.4 Malformed quantity = 0 -> HTTP 400
    const resQtyZero = await request(app)
      .post('/api/stock-movements/out')
      .set('Cookie', authGps.cookie)
      .send({
        sparepartId: part5Id,
        qty: 0
      });
    recordTest(
      'E10: Stock OUT with qty=0 rejected with HTTP 400 Bad Request',
      resQtyZero.status === 400,
      `Status: ${resQtyZero.status}`
    );

    // 2.5 Negative quantity = -10 -> HTTP 400
    const resQtyNegative = await request(app)
      .post('/api/stock-movements/out')
      .set('Cookie', authGps.cookie)
      .send({
        sparepartId: part5Id,
        qty: -10
      });
    recordTest(
      'E10: Stock OUT with negative qty rejected with HTTP 400 Bad Request',
      resQtyNegative.status === 400,
      `Status: ${resQtyNegative.status}`
    );

    // 2.6 Fractional quantity = 2.5 -> HTTP 400
    const resQtyFraction = await request(app)
      .post('/api/stock-movements/out')
      .set('Cookie', authGps.cookie)
      .send({
        sparepartId: part5Id,
        qty: 2.5
      });
    recordTest(
      'E10: Stock OUT with fractional qty rejected with HTTP 400 Bad Request',
      resQtyFraction.status === 400,
      `Status: ${resQtyFraction.status}`
    );

    // 2.7 Missing sparepartId -> HTTP 400
    const resMissingPart = await request(app)
      .post('/api/stock-movements/out')
      .set('Cookie', authGps.cookie)
      .send({
        qty: 1
      });
    recordTest(
      'E10: Stock OUT missing sparepartId rejected with HTTP 400 Bad Request',
      resMissingPart.status === 400,
      `Status: ${resMissingPart.status}`
    );

    // ============================================================================
    // SECTION 3: Stock Opname Reconciliation & Deficit Auditing (E11)
    // ============================================================================
    console.log(`\n${COLORS.bold}${COLORS.cyan}▶ SECTION 3: Stock Opname & Deficit Auditing (E11)${COLORS.reset}`);

    // Create item with stock 30
    const resCreateOpname = await request(app)
      .post('/api/inventory')
      .set('Cookie', authGps.cookie)
      .send({
        sku: 'ADV-OPN-OLL-01',
        nama: 'Oli Transmisi Botol Kaca (Stock 30)',
        kategori: 'Oli',
        stok: 30,
        hargaBeli: 40000,
        hargaJual: 65000
      });
    const opnPartId = resCreateOpname.body.id || resCreateOpname.body.item.id;

    // 3.1 Deficit reconciliation (physical = 22, discrepancy = -8)
    const resOpnameDeficit = await request(app)
      .post('/api/stock-opname')
      .set('Cookie', authGps.cookie)
      .send({
        sparepartId: opnPartId,
        stokFisik: 22,
        tanggal: '2026-10-04',
        alasan: 'Audit fisik: 8 botol pecah di gudang akibat gempa kecil'
      });

    recordTest(
      'E11: Stock Opname negative discrepancy (-8) returns HTTP 201 with difference=-8 and newStock=22',
      resOpnameDeficit.status === 201 &&
      resOpnameDeficit.body.difference === -8 &&
      resOpnameDeficit.body.newStock === 22,
      `Status: ${resOpnameDeficit.status}, Body: ${JSON.stringify(resOpnameDeficit.body)}`
    );

    // 3.2 Audit record in stock_opnames table
    const opnameRow = db.prepare(`
      SELECT * FROM stock_opnames 
      WHERE sparepart_id = ? 
      ORDER BY created_at DESC LIMIT 1
    `).get(opnPartId);

    recordTest(
      'E11: stock_opnames table records system_stock=30, physical_stock=22, difference=-8, reason verbatim',
      opnameRow &&
      opnameRow.system_stock === 30 &&
      opnameRow.physical_stock === 22 &&
      opnameRow.difference === -8 &&
      opnameRow.reason.includes('8 botol pecah'),
      `DB Opname Row: ${JSON.stringify(opnameRow)}`
    );

    // 3.3 Movement record in stock_movements table as ADJUSTMENT
    const movementRow = db.prepare(`
      SELECT * FROM stock_movements 
      WHERE sparepart_id = ? AND type = 'ADJUSTMENT'
      ORDER BY created_at DESC LIMIT 1
    `).get(opnPartId);

    recordTest(
      'E11: stock_movements records type=ADJUSTMENT with quantity=8 and notes mentioning "Selisih -8"',
      movementRow &&
      movementRow.type === 'ADJUSTMENT' &&
      movementRow.quantity === 8 &&
      movementRow.notes.includes('Selisih -8'),
      `DB Movement Row: ${JSON.stringify(movementRow)}`
    );

    // 3.4 Wipeout opname (physical = 0, difference = -22)
    const resOpnameZero = await request(app)
      .post('/api/stock-opname')
      .set('Cookie', authGps.cookie)
      .send({
        sparepartId: opnPartId,
        stokFisik: 0,
        alasan: 'Audit total: sisa barang ditarik retur distributor pabrik'
      });

    recordTest(
      'E11: Total wipeout opname (physical=0) adjusts stock to 0 with difference=-22',
      resOpnameZero.status === 201 &&
      resOpnameZero.body.newStock === 0 &&
      resOpnameZero.body.difference === -22,
      `Status: ${resOpnameZero.status}, Body: ${JSON.stringify(resOpnameZero.body)}`
    );

    // 3.5 Rejection when physical stock is negative (e.g. -5)
    const resOpnameNeg = await request(app)
      .post('/api/stock-opname')
      .set('Cookie', authGps.cookie)
      .send({
        sparepartId: opnPartId,
        stokFisik: -5,
        alasan: 'Stok negatif mustahil'
      });

    recordTest(
      'E11: Stock Opname with negative physical count rejected with HTTP 400 Bad Request',
      resOpnameNeg.status === 400,
      `Status: ${resOpnameNeg.status}`
    );

    // 3.6 Rejection when reason is omitted
    const resOpnameNoReason = await request(app)
      .post('/api/stock-opname')
      .set('Cookie', authGps.cookie)
      .send({
        sparepartId: opnPartId,
        stokFisik: 10
      });

    recordTest(
      'E11: Stock Opname missing audit reason rejected with HTTP 400 Bad Request',
      resOpnameNoReason.status === 400,
      `Status: ${resOpnameNoReason.status}`
    );

    // 3.7 GET /api/stock-opname pagination and retrieval
    const resListOpname = await request(app)
      .get(`/api/stock-opname?sparepartId=${opnPartId}`)
      .set('Cookie', authGps.cookie);

    recordTest(
      'E11: GET /api/stock-opname retrieves paginated history with sparepart details',
      resListOpname.status === 200 &&
      resListOpname.body.opnames.length === 2 &&
      resListOpname.body.pagination.total === 2,
      `Opnames length: ${resListOpname.body?.opnames?.length}`
    );

    // ============================================================================
    // SECTION 4: RFC-4180 CSV Escaping & Export Integrity (E18)
    // ============================================================================
    console.log(`\n${COLORS.bold}${COLORS.cyan}▶ SECTION 4: RFC-4180 CSV Escaping & Streaming Integrity (E18)${COLORS.reset}`);

    // 4.1 Unit oracle tests for escapeCsvField
    recordTest(
      'E18: Comma properly quoted: "Oli, Rem" -> \'"Oli, Rem"\'',
      escapeCsvField('Oli, Rem') === '"Oli, Rem"'
    );

    recordTest(
      'E18: Double-quotes doubled: \'Filter "Pro"\' -> \'"Filter ""Pro""""\'',
      escapeCsvField('Filter "Pro"') === '"Filter ""Pro"""'
    );

    recordTest(
      'E18: Newline properly quoted: "Line1\\nLine2" -> \'"Line1\\nLine2"\'',
      escapeCsvField('Line1\nLine2') === '"Line1\nLine2"'
    );

    recordTest(
      'E18: CRLF properly quoted: "Line1\\r\\nLine2" -> \'"Line1\\r\\nLine2"\'',
      escapeCsvField('Line1\r\nLine2') === '"Line1\r\nLine2"'
    );

    recordTest(
      'E18: Clean values untouched: "Busi Racing" -> "Busi Racing"',
      escapeCsvField('Busi Racing') === 'Busi Racing'
    );

    recordTest(
      'E18: Null and undefined produce empty string ""',
      escapeCsvField(null) === '' && escapeCsvField(undefined) === ''
    );

    // 4.2 Adversarial Item creation with compound special characters
    const advPartPayload = {
      sku: 'ADV-RFC4180-01',
      nama: 'Kampas Rem "Super Grip", Heavy Duty\nModel Avanza & Xenia',
      kategori: 'Rem, Kampas & Disc',
      satuan: 'set "2-in-1"',
      stok: 12,
      min_stock: 4,
      hargaBeli: 125000,
      hargaJual: 195000,
      supplier: 'PT Supplier "Utama", Kediri\nJawa Timur'
    };

    const resCreateAdvPart = await request(app)
      .post('/api/inventory')
      .set('Cookie', authGps.cookie)
      .send(advPartPayload);

    recordTest(
      'E18: Create inventory item with commas, quotes, and newlines in text fields succeeds',
      resCreateAdvPart.status === 201,
      `Status: ${resCreateAdvPart.status}`
    );

    // 4.3 Full Inventory CSV Export & RFC-4180 Parsing Roundtrip
    const resInvCsv = await request(app)
      .get('/api/inventory/export/csv')
      .set('Cookie', authGps.cookie);

    recordTest(
      'E18: GET /api/inventory/export/csv returns 200 with text/csv header and attachment disposition',
      resInvCsv.status === 200 &&
      resInvCsv.headers['content-type'].includes('text/csv') &&
      resInvCsv.headers['content-disposition'].includes('attachment'),
      `Content-Type: ${resInvCsv.headers['content-type']}`
    );

    const parsedInvRows = parseRFC4180Csv(resInvCsv.text);
    const headerRow = parsedInvRows[0];
    const expectedHeaders = ['SKU', 'Nama Sparepart', 'Kategori', 'Satuan', 'Stok', 'Stok Minimum', 'Harga Beli (Rp)', 'Harga Jual (Rp)', 'Margin Nominal (Rp)', 'Margin (%)', 'Supplier', 'Status Stok'];

    recordTest(
      'E18: CSV Header matches expected columns exactly',
      headerRow.length === expectedHeaders.length &&
      expectedHeaders.every((h, idx) => headerRow[idx] === h),
      `Parsed Header: ${JSON.stringify(headerRow)}`
    );

    // Find the adversarial row in parsed CSV
    const targetAdvRow = parsedInvRows.find(r => r[0] === advPartPayload.sku);
    recordTest(
      'E18: Adversarial CSV row parsed cleanly with exact column count and uncorrupted multiline/quoted strings',
      targetAdvRow !== undefined &&
      targetAdvRow.length === expectedHeaders.length &&
      targetAdvRow[1] === advPartPayload.nama &&
      targetAdvRow[2] === advPartPayload.kategori &&
      targetAdvRow[3] === advPartPayload.satuan &&
      targetAdvRow[10] === advPartPayload.supplier,
      `Parsed Row: ${JSON.stringify(targetAdvRow)}`
    );

    // 4.4 Stock Movements CSV Export & RFC-4180 Parsing Roundtrip
    // Log movement with special chars
    await request(app)
      .post('/api/stock-movements/in')
      .set('Cookie', authGps.cookie)
      .send({
        sparepartId: resCreateAdvPart.body.id || resCreateAdvPart.body.item.id,
        qty: 5,
        supplier: 'CV "Mega" Jaya, Kediri',
        invoiceNumber: 'INV/2026/09,REV"1"',
        catatan: 'Catatan baris 1,\nCatatan baris 2 dengan "quotes"'
      });

    const resMvCsv = await request(app)
      .get('/api/stock-movements/export/csv')
      .set('Cookie', authGps.cookie);

    const parsedMvRows = parseRFC4180Csv(resMvCsv.text);
    const advMvRow = parsedMvRows.find(r => r[2] === advPartPayload.sku && r[8] && r[8].includes('CV "Mega" Jaya'));

    recordTest(
      'E18: Stock Movements CSV parses multiline notes, commas in invoice numbers, and quoted suppliers without column shifting',
      advMvRow !== undefined &&
      advMvRow[8].includes('CV "Mega" Jaya') &&
      advMvRow[10] === 'Catatan baris 1,\nCatatan baris 2 dengan "quotes"',
      `Parsed Movement Row: ${JSON.stringify(advMvRow)}`
    );

    // 4.5 Valuation CSV Export
    const resValCsv = await request(app)
      .get('/api/inventory/reports/valuation/csv')
      .set('Cookie', authGps.cookie);

    const parsedValRows = parseRFC4180Csv(resValCsv.text);
    const advValRow = parsedValRows.find(r => r[0] === advPartPayload.sku);
    recordTest(
      'E18: Valuation CSV parses adversarial row without column corruption',
      advValRow !== undefined && advValRow[1] === advPartPayload.nama,
      `Parsed Valuation Row: ${JSON.stringify(advValRow)}`
    );

    // ============================================================================
    // SECTION 5: Multi-Tenant Isolation & Cross-Tenant Immunity
    // ============================================================================
    console.log(`\n${COLORS.bold}${COLORS.cyan}▶ SECTION 5: Multi-Tenant Isolation & Cross-Tenant Immunity${COLORS.reset}`);

    // Create item owned by Tenant A (GPS Motor)
    const resPartA = await request(app)
      .post('/api/inventory')
      .set('Cookie', authGps.cookie)
      .send({
        sku: 'ISO-TENANT-A-01',
        nama: 'Filter Oli Rahasia Bengkel A',
        kategori: 'Filter',
        stok: 25,
        hargaBeli: 25000,
        hargaJual: 45000
      });
    const partAId = resPartA.body.id || resPartA.body.item.id;

    // Create item owned by Tenant B (Berkah Motor)
    const resPartB = await request(app)
      .post('/api/inventory')
      .set('Cookie', authBerkah.cookie)
      .send({
        sku: 'ISO-TENANT-B-01',
        nama: 'Filter Oli Eksklusif Bengkel B',
        kategori: 'Filter',
        stok: 15,
        hargaBeli: 30000,
        hargaJual: 50000
      });
    const partBId = resPartB.body.id || resPartB.body.item.id;

    // 5.1 Tenant B listing inventory does NOT see Tenant A's item
    const resListB = await request(app)
      .get('/api/inventory')
      .set('Cookie', authBerkah.cookie);

    const itemsB = resListB.body.items || [];
    recordTest(
      'Multi-Tenant: Tenant B inventory list strictly contains only Tenant B items',
      itemsB.some(i => i.id === partBId) && !itemsB.some(i => i.id === partAId),
      `Tenant B Items count: ${itemsB.length}`
    );

    // 5.2 Tenant B searching for Tenant A item name returns empty
    const resSearchB = await request(app)
      .get('/api/inventory?search=Rahasia Bengkel A')
      .set('Cookie', authBerkah.cookie);

    recordTest(
      'Multi-Tenant: Search query by Tenant B for Tenant A item returns 0 items',
      resSearchB.body.items.length === 0,
      `Search count: ${resSearchB.body.items.length}`
    );

    // 5.3 Tenant B direct GET by ID for Tenant A part -> HTTP 404
    const resDirectGet = await request(app)
      .get(`/api/inventory/${partAId}`)
      .set('Cookie', authBerkah.cookie);

    recordTest(
      'Multi-Tenant: Tenant B GET /api/inventory/:tenantA_id returns HTTP 404 Not Found',
      resDirectGet.status === 404,
      `Status: ${resDirectGet.status}`
    );

    // 5.4 Tenant B PUT update on Tenant A part -> HTTP 404 & no change in DB
    const resAttackPut = await request(app)
      .put(`/api/inventory/${partAId}`)
      .set('Cookie', authBerkah.cookie)
      .send({
        nama: 'HACKED BY TENANT B',
        hargaJual: 1
      });

    const partAAfterPut = db.prepare('SELECT name, sell_price FROM spareparts WHERE id = ?').get(partAId);
    recordTest(
      'Multi-Tenant: Tenant B PUT /api/inventory/:tenantA_id returns 404 and does NOT mutate data',
      resAttackPut.status === 404 &&
      partAAfterPut.name === 'Filter Oli Rahasia Bengkel A' &&
      partAAfterPut.sell_price === 45000,
      `Status: ${resAttackPut.status}, DB part: ${JSON.stringify(partAAfterPut)}`
    );

    // 5.5 Tenant B DELETE on Tenant A part -> HTTP 404 & part remains active in DB
    const resAttackDelete = await request(app)
      .delete(`/api/inventory/${partAId}`)
      .set('Cookie', authBerkah.cookie);

    const partAAfterDel = db.prepare('SELECT is_active FROM spareparts WHERE id = ?').get(partAId);
    recordTest(
      'Multi-Tenant: Tenant B DELETE /api/inventory/:tenantA_id returns 404 and does NOT delete item',
      resAttackDelete.status === 404 && partAAfterDel.is_active === 1,
      `Status: ${resAttackDelete.status}`
    );

    // 5.6 Tenant B restock (Barang Masuk) on Tenant A part -> HTTP 404 & stock untouched
    const resAttackIn = await request(app)
      .post('/api/stock-movements/in')
      .set('Cookie', authBerkah.cookie)
      .send({
        sparepartId: partAId,
        qty: 100,
        catatan: 'Infiltrate restock'
      });

    const partAStockAfterIn = db.prepare('SELECT stock FROM spareparts WHERE id = ?').get(partAId).stock;
    recordTest(
      'Multi-Tenant: Tenant B POST /api/stock-movements/in on Tenant A part returns 404 & stock unchanged',
      resAttackIn.status === 404 && partAStockAfterIn === 25,
      `Status: ${resAttackIn.status}, Stock: ${partAStockAfterIn}`
    );

    // 5.7 Tenant B stock out (Barang Keluar) on Tenant A part -> HTTP 404 & stock untouched
    const resAttackOut = await request(app)
      .post('/api/stock-movements/out')
      .set('Cookie', authBerkah.cookie)
      .send({
        sparepartId: partAId,
        qty: 10,
        catatan: 'Infiltrate stock out'
      });

    const partAStockAfterOut = db.prepare('SELECT stock FROM spareparts WHERE id = ?').get(partAId).stock;
    recordTest(
      'Multi-Tenant: Tenant B POST /api/stock-movements/out on Tenant A part returns 404 & stock unchanged',
      resAttackOut.status === 404 && partAStockAfterOut === 25,
      `Status: ${resAttackOut.status}, Stock: ${partAStockAfterOut}`
    );

    // 5.8 Tenant B stock opname on Tenant A part -> HTTP 404 & stock untouched
    const resAttackOpn = await request(app)
      .post('/api/stock-opname')
      .set('Cookie', authBerkah.cookie)
      .send({
        sparepartId: partAId,
        stokFisik: 0,
        alasan: 'Infiltrate opname wipeout'
      });

    const partAStockAfterOpn = db.prepare('SELECT stock FROM spareparts WHERE id = ?').get(partAId).stock;
    recordTest(
      'Multi-Tenant: Tenant B POST /api/stock-opname on Tenant A part returns 404 & stock unchanged',
      resAttackOpn.status === 404 && partAStockAfterOpn === 25,
      `Status: ${resAttackOpn.status}, Stock: ${partAStockAfterOpn}`
    );

    // 5.9 Tenant B stock movements list contains zero movements of Tenant A
    const resMovementsB = await request(app)
      .get('/api/stock-movements')
      .set('Cookie', authBerkah.cookie);

    const mvB = resMovementsB.body.movements || [];
    recordTest(
      'Multi-Tenant: GET /api/stock-movements for Tenant B contains 0 records from Tenant A',
      !mvB.some(m => m.sparepart_id === partAId),
      `Movements count: ${mvB.length}`
    );

    // 5.10 Tenant B export CSV contains zero items of Tenant A
    const resCsvExportB = await request(app)
      .get('/api/inventory/export/csv')
      .set('Cookie', authBerkah.cookie);

    recordTest(
      'Multi-Tenant: GET /api/inventory/export/csv for Tenant B does not leak Tenant A parts',
      !resCsvExportB.text.includes('Filter Oli Rahasia Bengkel A') &&
      resCsvExportB.text.includes('Filter Oli Eksklusif Bengkel B'),
      `CSV text preview: ${resCsvExportB.text.slice(0, 150)}`
    );

    // 5.11 Tenant B Valuation Report only aggregates Tenant B items
    const resValB = await request(app)
      .get('/api/inventory/reports/valuation')
      .set('Cookie', authBerkah.cookie);

    const expectedValBuyB = 15 * 30000;
    const expectedValSellB = 15 * 50000;
    recordTest(
      'Multi-Tenant: GET /api/inventory/reports/valuation for Tenant B aggregates ONLY Tenant B inventory',
      resValB.body.total_items === 1 &&
      resValB.body.total_stock_count === 15 &&
      resValB.body.total_buy_value === expectedValBuyB &&
      resValB.body.total_sell_value === expectedValSellB,
      `Valuation B: ${JSON.stringify(resValB.body)}`
    );

    // 5.12 SKU Reuse across tenants: Tenant B can create item with the SAME SKU as Tenant A
    const resSameSkuB = await request(app)
      .post('/api/inventory')
      .set('Cookie', authBerkah.cookie)
      .send({
        sku: 'ISO-TENANT-A-01', // Same SKU as Tenant A
        nama: 'Filter Oli Versi Tenant B dengan SKU Sama',
        kategori: 'Filter',
        stok: 8,
        hargaBeli: 20000,
        hargaJual: 35000
      });

    recordTest(
      'Multi-Tenant: Tenant B can create sparepart with identical SKU to Tenant A without collision',
      resSameSkuB.status === 201,
      `Status: ${resSameSkuB.status}, Body: ${JSON.stringify(resSameSkuB.body)}`
    );

    // Tenant A creating duplicate within Tenant A MUST fail with 409
    const resDupSkuA = await request(app)
      .post('/api/inventory')
      .set('Cookie', authGps.cookie)
      .send({
        sku: 'ISO-TENANT-A-01',
        nama: 'Duplikat SKU di Bengkel A',
        kategori: 'Filter'
      });

    recordTest(
      'Multi-Tenant: Duplicate SKU within the SAME tenant strictly rejected with HTTP 409 Conflict',
      resDupSkuA.status === 409,
      `Status: ${resDupSkuA.status}, Body: ${JSON.stringify(resDupSkuA.body)}`
    );

    // 5.13 Tenant spoofing attack: Tenant B sends x-tenant-id header aiming to impersonate Tenant A
    const resSpoofHeader = await request(app)
      .get('/api/inventory')
      .set('Cookie', authBerkah.cookie)
      .set('x-tenant-id', authGps.tenant.id)
      .set('x-tenant-slug', authGps.tenant.slug);

    const spoofItems = resSpoofHeader.body.items || [];
    recordTest(
      'Multi-Tenant: Header spoofing attack (x-tenant-id/slug) foiled by authenticated session lock',
      !spoofItems.some(i => i.id === partAId),
      `Returned items count: ${spoofItems.length}`
    );

    // ============================================================================
    // SECTION 6: Concurrency & Transactional Consistency
    // ============================================================================
    console.log(`\n${COLORS.bold}${COLORS.cyan}▶ SECTION 6: Concurrency & Transactional Underflow Prevention${COLORS.reset}`);

    // Create item with stock 5
    const resRacePart = await request(app)
      .post('/api/inventory')
      .set('Cookie', authGps.cookie)
      .send({
        sku: 'ADV-RACE-01',
        nama: 'Bearing Roda Race Condition Test',
        kategori: 'Bearing',
        stok: 5,
        hargaBeli: 100000,
        hargaJual: 150000
      });
    const racePartId = resRacePart.body.id || resRacePart.body.item.id;

    // Send two concurrent stock-out requests each asking for 3 (total requested = 6 > 5)
    const [resRace1, resRace2] = await Promise.all([
      request(app).post('/api/stock-movements/out').set('Cookie', authGps.cookie).send({ sparepartId: racePartId, qty: 3 }),
      request(app).post('/api/stock-movements/out').set('Cookie', authGps.cookie).send({ sparepartId: racePartId, qty: 3 })
    ]);

    const statusCodes = [resRace1.status, resRace2.status].sort();
    const finalRaceStock = db.prepare('SELECT stock FROM spareparts WHERE id = ?').get(racePartId).stock;

    recordTest(
      'Concurrency: Concurrent stock out (2x 3 units from 5) allows exactly one 201 and rejects one 422, never underflowing',
      statusCodes[0] === 201 && statusCodes[1] === 422 && finalRaceStock === 2,
      `Statuses: [${statusCodes.join(', ')}], Final DB Stock: ${finalRaceStock}`
    );

    // Sequential state cycle: IN (+8) -> OUT (-4) -> OPNAME (to 10)
    await request(app).post('/api/stock-movements/in').set('Cookie', authGps.cookie).send({ sparepartId: racePartId, qty: 8 });
    await request(app).post('/api/stock-movements/out').set('Cookie', authGps.cookie).send({ sparepartId: racePartId, qty: 4 });
    await request(app).post('/api/stock-opname').set('Cookie', authGps.cookie).send({ sparepartId: racePartId, stokFisik: 10, alasan: 'Opname siklus penutup' });

    const finalSeqStock = db.prepare('SELECT stock FROM spareparts WHERE id = ?').get(racePartId).stock;
    recordTest(
      'Consistency: Sequential ledger lifecycle (2 -> +8 -> -4 -> Opname to 10) correctly establishes stock=10',
      finalSeqStock === 10,
      `Final Stock: ${finalSeqStock}`
    );

  } finally {
    cleanup();
  }

  // ============================================================================
  // SUMMARY & VERDICT
  // ============================================================================
  console.log(`\n${COLORS.bold}----------------------------------------------------------------${COLORS.reset}`);
  console.log(`${COLORS.bold}  Milestone 3 Adversarial Challenge Summary:${COLORS.reset}`);
  console.log(`  Total Challenges: ${challengeResults.passed + challengeResults.failed}`);
  console.log(`  ${COLORS.green}✔ Passed:         ${challengeResults.passed}${COLORS.reset}`);
  console.log(`  ${challengeResults.failed > 0 ? COLORS.red : COLORS.dim}✖ Failed:         ${challengeResults.failed}${COLORS.reset}`);
  console.log(`${COLORS.bold}----------------------------------------------------------------${COLORS.reset}\n`);

  if (challengeResults.failed > 0) {
    console.error(`${COLORS.red}${COLORS.bold}CHALLENGE FAILED: ${challengeResults.failed} vulnerability/bug(s) detected.${COLORS.reset}`);
    process.exit(1);
  } else {
    console.log(`${COLORS.green}${COLORS.bold}CHALLENGE PASSED: All adversarial vectors survived without defect.${COLORS.reset}\n`);
    process.exit(0);
  }
}

runM3AdversarialChallenge();
