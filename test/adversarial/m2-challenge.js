#!/usr/bin/env node
/**
 * Empirical Adversarial Challenge Test Harness for Milestone 2
 * Bengkel Mobil GPS Motor Kediri
 * 
 * Verifies:
 * 1. Privacy Masking Algorithms & Plate Variations (E01, E03)
 * 2. Customer Name Masking & Boundary Vectors (E04, E05)
 * 3. Public API Data Stripping & Sensitive Field Leakage (E06)
 * 4. WhatsApp Share URLs & Link Roundtrip Resolution
 * 5. Input Sanitation, 404 Resilience, and Security Attack Vectors
 * 6. Database Plate Normalization & Stored Variant Matching
 */

import request from 'supertest';
import assert from 'node:assert/strict';
import { createApp } from '../../server/app.js';
import { initDatabase } from '../../server/db/index.js';
import { 
  maskPlate, 
  maskCustomerName, 
  normalizePlate, 
  sanitizeTrackingPayload 
} from '../../server/services/maskingService.js';

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
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

async function main() {
  console.log(`\n${COLORS.bold}================================================================${COLORS.reset}`);
  console.log(`${COLORS.bold}  Milestone 2: Empirical Adversarial Challenge Test Harness     ${COLORS.reset}`);
  console.log(`${COLORS.bold}================================================================${COLORS.reset}\n`);

  // ============================================================================
  // SECTION 1: Plate Privacy Masking (E01, E03)
  // ============================================================================
  console.log(`${COLORS.bold}${COLORS.cyan}▶ SECTION 1: Plate Privacy Masking & Normalization (E01, E03)${COLORS.reset}`);

  // Standard formats
  recordTest('E01: Standard spaced plate "AG 1234 XX"', maskPlate('AG 1234 XX') === 'AG 12** XX', `Output: ${maskPlate('AG 1234 XX')}`);
  recordTest('E01: Compact plate without spaces "AG1234XX"', maskPlate('AG1234XX') === 'AG 12** XX', `Output: ${maskPlate('AG1234XX')}`);
  recordTest('E01: Lowercase hyphenated plate "ag-1234-xx"', maskPlate('ag-1234-xx') === 'AG 12** XX', `Output: ${maskPlate('ag-1234-xx')}`);
  recordTest('E01: Multiple spaces & tabs "AG   1234   XX"', maskPlate('AG   1234   XX') === 'AG 12** XX', `Output: ${maskPlate('AG   1234   XX')}`);

  // Dot-separated variation (Crucial Bug Check)
  const dotPlateMasked = maskPlate('AG.1234.XX');
  const dotPlatePassed = dotPlateMasked === 'AG 12** XX';
  recordTest('E01: Dot-separated plate "AG.1234.XX"', dotPlatePassed, `Expected "AG 12** XX", got "${dotPlateMasked}" (DOT UNMASKED LEAK)`);

  const mixedDotPlate = maskPlate('AG. 1234 .XX');
  recordTest('E01: Mixed dot & space "AG. 1234 .XX"', mixedDotPlate === 'AG 12** XX', `Expected "AG 12** XX", got "${mixedDotPlate}"`);

  // Short plates (E03)
  recordTest('E03: 1-digit plate "AG 1 X"', maskPlate('AG 1 X') === 'AG 1* X', `Output: ${maskPlate('AG 1 X')}`);
  recordTest('E03: 2-digit plate "B 12 A"', maskPlate('B 12 A') === 'B 1* A', `Output: ${maskPlate('B 12 A')}`);
  recordTest('E03: 3-digit plate "L 123 AB"', maskPlate('L 123 AB') === 'L 12* AB', `Output: ${maskPlate('L 123 AB')}`);
  recordTest('E03: 4-digit plate with 3-letter suffix "B 1234 ABC"', maskPlate('B 1234 ABC') === 'B 12** ABC', `Output: ${maskPlate('B 1234 ABC')}`);
  recordTest('E03: 1-digit plate with 1-letter suffix "B 1 A"', maskPlate('B 1 A') === 'B 1* A', `Output: ${maskPlate('B 1 A')}`);
  
  // Boundary inputs
  recordTest('E01: Empty string plate ""', maskPlate('') === '', `Output: ${maskPlate('')}`);
  recordTest('E01: Whitespace plate "   "', maskPlate('   ') === '', `Output: ${maskPlate('   ')}`);
  recordTest('E01: Null plate', maskPlate(null) === '', `Output: ${maskPlate(null)}`);
  recordTest('E01: Undefined plate', maskPlate(undefined) === '', `Output: ${maskPlate(undefined)}`);

  // ============================================================================
  // SECTION 2: Customer Name Masking (E04, E05)
  // ============================================================================
  console.log(`\n${COLORS.bold}${COLORS.cyan}▶ SECTION 2: Customer Name Masking Stress-Test (E04, E05)${COLORS.reset}`);

  // Single-word names (E04)
  recordTest('E04: Single-word name "Slamet"', maskCustomerName('Slamet') === 'Sla***', `Output: ${maskCustomerName('Slamet')}`);
  recordTest('E04: Single-word name "Bambang"', maskCustomerName('Bambang') === 'Bam****', `Output: ${maskCustomerName('Bambang')}`);
  recordTest('E04: Single-word name "Joko"', maskCustomerName('Joko') === 'Jok*', `Output: ${maskCustomerName('Joko')}`);

  // Ultra-short customer names (E05)
  recordTest('E05: Ultra-short 2-letter name "Ed"', maskCustomerName('Ed') === 'E*', `Output: ${maskCustomerName('Ed')}`);
  recordTest('E05: Ultra-short 2-letter name "Bo"', maskCustomerName('Bo') === 'B*', `Output: ${maskCustomerName('Bo')}`);
  recordTest('E05: Ultra-short 1-letter initial "A"', maskCustomerName('A') === 'A*', `Output: ${maskCustomerName('A')}`);

  // Empty & whitespace customer names (Crucial Bug Check)
  recordTest('E05: Empty string customer name ""', maskCustomerName('') === '', `Output: ${maskCustomerName('')}`);
  const wsCustomerName = maskCustomerName('   ');
  const wsCustomerPassed = wsCustomerName === '';
  recordTest('E05: Whitespace customer name "   "', wsCustomerPassed, `Expected "", got "${wsCustomerName}" (UNTRIMMED ASTERISK LEAK)`);

  // Multi-word names
  recordTest('Multi-word: "Budi Santoso"', maskCustomerName('Budi Santoso') === 'Budi S******', `Output: ${maskCustomerName('Budi Santoso')}`);
  recordTest('Multi-word with title: "H. Slamet"', maskCustomerName('H. Slamet').startsWith('H.'), `Output: ${maskCustomerName('H. Slamet')}`);

  // ============================================================================
  // SECTION 3: Public API Data Stripping & Sensitive Leakage (E06)
  // ============================================================================
  console.log(`\n${COLORS.bold}${COLORS.cyan}▶ SECTION 3: Public API Sensitive Data Stripping (E06)${COLORS.reset}`);

  const db = initDatabase(':memory:');
  const app = createApp(db);

  try {
    const res = await request(app)
      .get('/api/public/bengkel-gps-motor/tracking?plate=AG1822AB')
      .expect(200);

    const bodyStr = JSON.stringify(res.body);

    // Assertions for sensitive data leak
    recordTest('E06: Customer raw phone (081234567890) NEVER in response', !bodyStr.includes('081234567890'), 'Customer phone found in body');
    recordTest('E06: Field "customer_phone" not present in response', !bodyStr.includes('"customer_phone"'), 'customer_phone key leaked');
    recordTest('E06: Wholesale buy price field "harga_beli" not present', !bodyStr.includes('"harga_beli"'), 'harga_beli key leaked');
    recordTest('E06: Wholesale buy price field "buy_price" not present', !bodyStr.includes('"buy_price"'), 'buy_price key leaked');
    recordTest('E06: Wholesale buy price amount (45000) not in spareparts list', !JSON.stringify(res.body.spareparts).includes('45000'), 'Wholesale price 45000 found in spareparts');

    // Verify allowed fields exist
    recordTest('E06: Masked plate is present', res.body.plate_masked === 'AG 18** AB', `Got: ${res.body.plate_masked}`);
    recordTest('E06: Masked name is present', res.body.customer_name_masked === 'Joko W*****', `Got: ${res.body.customer_name_masked}`);
    recordTest('E06: 6 milestone stages present', res.body.stages?.length === 6, `Count: ${res.body.stages?.length}`);

    // ============================================================================
    // SECTION 4: WhatsApp Share URLs & Roundtrip Resolution
    // ============================================================================
    console.log(`\n${COLORS.bold}${COLORS.cyan}▶ SECTION 4: WhatsApp Share URLs & Roundtrip Resolution${COLORS.reset}`);

    const trackingUrl = res.body.trackingUrl;
    const waShareUrl = res.body.waShareUrl;

    recordTest('WA URL: waShareUrl returned in payload', typeof waShareUrl === 'string' && waShareUrl.startsWith('https://wa.me/'), `waShareUrl: ${waShareUrl}`);
    recordTest('WA URL: trackingUrl returned in payload', typeof trackingUrl === 'string', `trackingUrl: ${trackingUrl}`);

    // Roundtrip verification: if someone follows trackingUrl, does the backend resolve it?
    // trackingUrl returned by public.js: /bengkel-gps-motor/cek-status?plate=AG%2018**%20AB
    const trackingQueryPart = trackingUrl.includes('?') ? trackingUrl.substring(trackingUrl.indexOf('?')) : '';
    const apiLookupUrl = `/api/public/bengkel-gps-motor/tracking${trackingQueryPart}`;

    const roundtripRes = await request(app).get(apiLookupUrl);
    const roundtripPassed = roundtripRes.status === 200;
    recordTest(
      'WA Link Roundtrip: Resolving trackingUrl query via public API',
      roundtripPassed,
      `Requesting ${apiLookupUrl} returned HTTP ${roundtripRes.status} (Expected 200, got ${roundtripRes.status}: Masked plate in URL causes 404!)`
    );

    // ============================================================================
    // SECTION 5: Input Sanitation, 404 Resilience & Security Vectors
    // ============================================================================
    console.log(`\n${COLORS.bold}${COLORS.cyan}▶ SECTION 5: Input Sanitation, 404 Resilience & Security Attack Vectors${COLORS.reset}`);

    // Nonexistent plate
    const res404 = await request(app).get('/api/public/bengkel-gps-motor/tracking?plate=AG9999ZZ');
    recordTest('Security: Non-existent plate returns clean 404', res404.status === 404 && res404.body.success === false, `Status: ${res404.status}`);

    // Empty plate
    const resEmpty = await request(app).get('/api/public/bengkel-gps-motor/tracking?plate=');
    recordTest('Security: Empty plate query returns 400', resEmpty.status === 400, `Status: ${resEmpty.status}`);

    // Whitespace plate
    const resWs = await request(app).get('/api/public/bengkel-gps-motor/tracking?plate=%20%20%20');
    recordTest('Security: Whitespace plate query returns 400', resWs.status === 400, `Status: ${resWs.status}`);

    // SQL Injection in plate query
    const resSql = await request(app).get('/api/public/bengkel-gps-motor/tracking?plate=%27%20OR%201%3D1--');
    recordTest('Security: SQL injection payload safely returns 404 (no crash)', resSql.status === 404, `Status: ${resSql.status}`);

    // XSS injection in plate query
    const resXss = await request(app).get('/api/public/bengkel-gps-motor/tracking?plate=%3Cscript%3Ealert(1)%3C%2Fscript%3E');
    recordTest('Security: XSS script payload safely returns 404 (no crash)', resXss.status === 404, `Status: ${resXss.status}`);

    // Nonexistent tenant slug
    const resTenant404 = await request(app).get('/api/public/nonexistent-workshop/tracking?plate=AG1822AB');
    recordTest('Security: Nonexistent tenant slug returns 404', resTenant404.status === 404, `Status: ${resTenant404.status}`);

    // ============================================================================
    // SECTION 6: Stored Plate Variation Matching in Database
    // ============================================================================
    console.log(`\n${COLORS.bold}${COLORS.cyan}▶ SECTION 6: Stored Plate Variation Matching & Masking${COLORS.reset}`);

    const tenant = db.prepare('SELECT id FROM tenants LIMIT 1').get();
    db.prepare(`
      INSERT INTO repair_orders (
        id, tenant_id, ro_number, tracking_token, plate_number, customer_name, customer_phone,
        car_brand, car_model, entry_date, complaint, mechanic_name, status, service_fee, sparepart_fee, total_cost
      ) VALUES (
        'ro-dot-stored', ?, 'RO-DOT-99', 'tok-dot-99', 'AG.5555.ZZ', 'Slamet Raharjo', '0855555',
        'Daihatsu', 'Xenia', '2026-10-04', 'Cek rem', 'Agus', 'MASUK', 0, 0, 0
      )
    `).run(tenant.id);

    // Query stored plate with standard query AG 5555 ZZ
    const resQueryNormalized = await request(app).get('/api/public/bengkel-gps-motor/tracking?plate=AG%205555%20ZZ');
    const dotLookupPassed = resQueryNormalized.status === 200;
    recordTest(
      'DB Normalization: Query "AG 5555 ZZ" matches stored dot-plate "AG.5555.ZZ"',
      dotLookupPassed,
      `Got HTTP ${resQueryNormalized.status} (SQL replace failed on dots in stored plate)`
    );

    // Query stored plate directly with AG.5555.ZZ
    const resQueryDot = await request(app).get('/api/public/bengkel-gps-motor/tracking?plate=AG.5555.ZZ');
    if (resQueryDot.status === 200) {
      const maskedInRes = resQueryDot.body.plate_masked;
      const maskStoredDotPassed = maskedInRes === 'AG 55** ZZ';
      recordTest(
        'DB Normalization: Response masks stored dot-plate as "AG 55** ZZ"',
        maskStoredDotPassed,
        `Expected "AG 55** ZZ", got "${maskedInRes}"`
      );
    } else {
      recordTest('DB Normalization: Direct lookup AG.5555.ZZ succeeds', false, `Status ${resQueryDot.status}`);
    }

  } finally {
    db.close();
  }

  // Summary
  console.log(`\n${COLORS.bold}----------------------------------------------------------------${COLORS.reset}`);
  console.log(`${COLORS.bold}  Milestone 2 Challenge Execution Summary:${COLORS.reset}`);
  console.log(`  Total Checks:    ${challengeResults.passed + challengeResults.failed}`);
  console.log(`  ${COLORS.green}✔ Passed:        ${challengeResults.passed}${COLORS.reset}`);
  console.log(`  ${COLORS.red}✖ Failed/Issues: ${challengeResults.failed}${COLORS.reset}`);
  console.log(`${COLORS.bold}----------------------------------------------------------------${COLORS.reset}\n`);

  if (challengeResults.failed > 0) {
    console.log(`${COLORS.yellow}${COLORS.bold}Adversarial Findings Identified:${COLORS.reset}`);
    challengeResults.findings.forEach((f, idx) => {
      console.log(`  ${idx + 1}. [${f.name}]`);
      console.log(`     ${f.details}`);
    });
    console.log();
  }

  return challengeResults;
}

main().then(results => {
  // Challenger returns exit 0 so test runner does not abort, but findings are reported
  process.exit(results.failed > 0 ? 2 : 0);
}).catch(err => {
  console.error('Fatal challenge error:', err);
  process.exit(1);
});
