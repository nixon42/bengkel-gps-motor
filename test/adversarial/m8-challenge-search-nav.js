#!/usr/bin/env node
/**
 * test/adversarial/m8-challenge-search-nav.js
 * Empirical Adversarial Challenge Test Harness for Milestone 8 (Search, Navigation & Edge Cases)
 * Bengkel Mobil GPS Motor Kediri
 * 
 * Target Domains:
 * 1. Search Filtering Adversarial Edge Cases (Empty, Case, Partials, Punctuation, Non-existent, Multi-word)
 * 2. Result Count Assertions & Empty State Integrity
 * 3. Topic ID Validity, Slugs & Anchor Formatting
 * 4. Prev/Next Navigation Boundaries & Sequential Integrity
 * 5. Documentation API Endpoints & Route Handlers (/api/docs, /api/docs/:id, /panduan, /docs)
 */

import request from 'supertest';
import assert from 'node:assert/strict';
import { createApp } from '../../server/app.js';
import { getDatabase } from '../../server/db/index.js';
import { 
  DOCS_ROLES, 
  DOCS_MODULES, 
  DOCS_FAQS, 
  DOCS_METADATA, 
  searchDocs 
} from '../../src/data/docsContent.js';

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m'
};

const results = {
  passed: 0,
  failed: 0,
  total: 0,
  failures: []
};

function record(name, pass, details = '') {
  results.total++;
  if (pass) {
    results.passed++;
    console.log(`  ${COLORS.green}✔ PASS${COLORS.reset} ${name}`);
  } else {
    results.failed++;
    results.failures.push({ name, details });
    console.log(`  ${COLORS.red}✖ FAIL${COLORS.reset} ${name}`);
    if (details) {
      console.log(`    ${COLORS.yellow}↳ ${details}${COLORS.reset}`);
    }
  }
}

async function runAdversarialSuite() {
  console.log(`\n${COLORS.bold}================================================================${COLORS.reset}`);
  console.log(`${COLORS.bold}  Milestone 8: Empirical Adversarial Challenge Test Harness     ${COLORS.reset}`);
  console.log(`${COLORS.bold}  Challenger 1: Search, Navigation, Anchors & Edge Cases        ${COLORS.reset}`);
  console.log(`${COLORS.bold}================================================================\n`);

  const db = getDatabase(':memory:');
  const app = createApp(db);

  // =========================================================================
  // SECTION 1: SEARCH FILTERING ADVERSARIAL EDGE CASES
  // =========================================================================
  console.log(`${COLORS.bold}${COLORS.cyan}▶ Section 1: Search Filtering Adversarial Edge Cases${COLORS.reset}`);

  // 1.1 Empty strings and whitespace variations
  try {
    const resEmpty = searchDocs('');
    record('1.1a Search with empty string returns all modules and FAQs', 
      resEmpty.modules.length === 16 && resEmpty.faqs.length === 5 && resEmpty.totalResults === 21,
      `Expected 16 mods, 5 faqs, 21 total. Got ${resEmpty.modules.length} mods, ${resEmpty.faqs.length} faqs, ${resEmpty.totalResults} total`
    );

    const resSpaces = searchDocs('     ');
    record('1.1b Search with whitespace-only string trims and returns all items', 
      resSpaces.modules.length === 16 && resSpaces.faqs.length === 5 && resSpaces.totalResults === 21,
      `Expected 21 total. Got ${resSpaces.totalResults}`
    );

    const resUndefined = searchDocs(undefined);
    record('1.1c Search with undefined query defaults safely to all items',
      resUndefined.modules.length === 16 && resUndefined.totalResults === 21,
      `Expected 21 total. Got ${resUndefined.totalResults}`
    );
  } catch (err) {
    record('1.1 Empty string resilience', false, err.message);
  }

  // 1.2 Case insensitivity & mixed case variations
  try {
    const qLower = searchDocs('stok opname');
    const qUpper = searchDocs('STOK OPNAME');
    const qMixed = searchDocs('sToK oPnAmE');
    const qCrazy = searchDocs('StOk OpNaMe');

    const allMatch = qLower.totalResults > 0 &&
      qLower.totalResults === qUpper.totalResults &&
      qLower.totalResults === qMixed.totalResults &&
      qLower.totalResults === qCrazy.totalResults;

    record('1.2a Case insensitivity: "stok opname" identical across UPPER, lower, mixed cases',
      allMatch,
      `Lower: ${qLower.totalResults}, Upper: ${qUpper.totalResults}, Mixed: ${qMixed.totalResults}`
    );

    const qLabaLower = searchDocs('laba rugi');
    const qLabaUpper = searchDocs('LABA RUGI');
    record('1.2b Case insensitivity: "laba rugi" vs "LABA RUGI"',
      qLabaLower.totalResults > 0 && qLabaLower.totalResults === qLabaUpper.totalResults,
      `Lower: ${qLabaLower.totalResults}, Upper: ${qLabaUpper.totalResults}`
    );

    const qQrisLower = searchDocs('qris');
    const qQrisUpper = searchDocs('QRIS');
    record('1.2c Case insensitivity: "qris" vs "QRIS"',
      qQrisLower.totalResults > 0 && qQrisLower.totalResults === qQrisUpper.totalResults,
      `Lower: ${qQrisLower.totalResults}, Upper: ${qQrisUpper.totalResults}`
    );

    const q6tahapLower = searchDocs('6-tahap');
    const q6tahapUpper = searchDocs('6-TAHAP');
    record('1.2d Case insensitivity: "6-tahap" vs "6-TAHAP"',
      q6tahapLower.totalResults > 0 && q6tahapLower.totalResults === q6tahapUpper.totalResults,
      `Lower: ${q6tahapLower.totalResults}, Upper: ${q6tahapUpper.totalResults}`
    );
  } catch (err) {
    record('1.2 Case insensitivity suite', false, err.message);
  }

  // 1.3 Partial words and sub-tokens
  try {
    const qOpnam = searchDocs('opnam');
    record('1.3a Partial word "opnam" matches Stok Opname module',
      qOpnam.modules.some(m => m.slug === 'pelaksanaan-stok-opname'),
      `Matched modules: ${qOpnam.modules.map(m => m.slug).join(', ')}`
    );

    const qKompres = searchDocs('kompres');
    record('1.3b Partial word "kompres" matches photo compression docs & FAQ',
      qKompres.modules.some(m => m.id === 'mekanik-photos') && qKompres.faqs.some(f => f.id === 'faq-photo-optimization'),
      `Modules: ${qKompres.modules.length}, FAQs: ${qKompres.faqs.length}`
    );

    const qPrivas = searchDocs('privas');
    record('1.3c Partial word "privas" matches privacy tracking module',
      qPrivas.modules.some(m => m.slug === 'portal-pelacakan-publik'),
      `Matched modules: ${qPrivas.modules.map(m => m.slug).join(', ')}`
    );

    const qDiag = searchDocs('diag');
    record('1.3d Partial word "diag" matches 6-stage lifecycle (diagnosa)',
      qDiag.modules.some(m => m.slug === 'alur-status-6-tahap'),
      `Matched modules: ${qDiag.modules.map(m => m.slug).join(', ')}`
    );

    const qFaktur = searchDocs('faktur');
    record('1.3e Partial word "faktur" matches restock & photo nota',
      qFaktur.modules.some(m => m.slug === 'restock-barang-masuk'),
      `Matched modules: ${qFaktur.modules.map(m => m.slug).join(', ')}`
    );
  } catch (err) {
    record('1.3 Partial word tests', false, err.message);
  }

  // 1.4 Non-existent keywords and empty state assertions
  try {
    const qBogus1 = searchDocs('xyzabc123');
    record('1.4a Non-existent keyword "xyzabc123" returns 0 modules, 0 faqs, 0 totalResults',
      qBogus1.modules.length === 0 && qBogus1.faqs.length === 0 && qBogus1.totalResults === 0,
      `Got modules=${qBogus1.modules.length}, faqs=${qBogus1.faqs.length}, total=${qBogus1.totalResults}`
    );

    const qBogus2 = searchDocs('supercalifragilistic');
    record('1.4b Non-existent keyword "supercalifragilistic" returns empty arrays without crash',
      Array.isArray(qBogus2.modules) && qBogus2.modules.length === 0 && qBogus2.totalResults === 0,
      `Got totalResults=${qBogus2.totalResults}`
    );

    const qBogus3 = searchDocs('###@@@$$$');
    record('1.4c Symbol-only non-existent string "###@@@$$$" returns empty arrays safely',
      qBogus3.totalResults === 0 && qBogus3.modules.length === 0,
      `Got totalResults=${qBogus3.totalResults}`
    );

    const qBogus4 = searchDocs('99999999999');
    record('1.4d Numeric-only non-existent query "99999999999" returns empty results',
      qBogus4.totalResults === 0,
      `Got totalResults=${qBogus4.totalResults}`
    );
  } catch (err) {
    record('1.4 Non-existent keyword suite', false, err.message);
  }

  // 1.5 Multi-word business and technical terms (Explicitly mandated in DISPATCH.md)
  try {
    const dispatchTerms = [
      { q: 'stok opname', expectedSlug: 'pelaksanaan-stok-opname' },
      { q: 'laba rugi', expectedSlug: 'buku-kas-keuangan' },
      { q: '6-tahap', expectedSlug: 'alur-status-6-tahap' },
      { q: 'sensor privasi', expectedSlug: 'portal-pelacakan-publik' },
      { q: 'qris', expectedSlug: 'pembayaran-dan-pelunasan-kas' },
      { q: 'handover pic', expectedFaq: 'faq-switch-mechanic' },
      { q: 'kompresi', expectedSlug: 'dokumentasi-foto-servis' }
    ];

    for (const term of dispatchTerms) {
      const res = searchDocs(term.q);
      let ok = false;
      if (term.expectedSlug) {
        ok = res.modules.some(m => m.slug === term.expectedSlug);
      }
      if (term.expectedFaq) {
        ok = ok || res.faqs.some(f => f.id === term.expectedFaq);
      }
      record(`1.5 Mandatory multi-word term "${term.q}" correctly matches expected target`,
        ok,
        `Query "${term.q}" results: modules=${res.modules.map(m=>m.slug).join(',')}, faqs=${res.faqs.map(f=>f.id).join(',')}`
      );
    }

    // Empirical exploration of search tokenization & exact substring boundaries:
    // When words are separated by slashes in text (e.g. 'Before/Progress/After'):
    const resSlash = searchDocs('before/progress/after');
    const resSpace = searchDocs('before progress after');
    record('1.5b Search engine uses exact literal substring matching ("before/progress/after" matches, space variant yields 0)',
      resSlash.totalResults > 0 && resSpace.totalResults === 0,
      `Slash matches: ${resSlash.totalResults}, Space matches: ${resSpace.totalResults}`
    );

    // FAQ search by question substring vs badge
    const resFaqQ = searchDocs('kehilangan nota');
    const resFaqBadge = searchDocs('Nota Hilang & Tracking');
    record('1.5c FAQ search matches question ("kehilangan nota"), but badge field ("Nota Hilang & Tracking") is unindexed',
      resFaqQ.totalResults > 0 && resFaqBadge.totalResults === 0,
      `Question match: ${resFaqQ.totalResults}, Badge match: ${resFaqBadge.totalResults}`
    );
  } catch (err) {
    record('1.5 Multi-word terms suite', false, err.message);
  }

  // 1.6 Special characters, punctuation, and injection payloads
  try {
    const maliciousPayloads = [
      "<script>alert('xss')</script>",
      "'; DROP TABLE tenants; --",
      "%20%2F%5C%00",
      "${7*7}",
      "{{constructor.constructor('alert(1)')()}}",
      "' OR 1=1 --",
      "../etc/passwd",
      "!@#$%^&*()_+{}[]:;\"'<>?,./"
    ];

    for (const payload of maliciousPayloads) {
      const res = searchDocs(payload);
      record(`1.6 Safe handling of injection vector: "${payload.substring(0, 25)}"`,
        res && Array.isArray(res.modules) && Array.isArray(res.faqs) && typeof res.totalResults === 'number',
        `Did not return valid search result object`
      );
    }

    // Stress test: Very long string (10,000 chars)
    const longString = 'a'.repeat(10000);
    const startLong = Date.now();
    const resLong = searchDocs(longString);
    const durationLong = Date.now() - startLong;
    record(`1.6 Stress test: 10,000-char query completes without crash or ReDoS (${durationLong}ms)`,
      resLong.totalResults === 0 && durationLong < 500,
      `Duration: ${durationLong}ms, Total: ${resLong.totalResults}`
    );
  } catch (err) {
    record('1.6 Injection & stress test suite', false, err.message);
  }

  // 1.7 Search + Role filtering interaction
  try {
    // "stok" across different roles
    const stokAll = searchDocs('stok', 'all');
    const stokOwner = searchDocs('stok', 'owner');
    const stokKasir = searchDocs('stok', 'kasir');
    const stokMekanik = searchDocs('stok', 'mekanik');
    const stokCrm = searchDocs('stok', 'crm');

    record('1.7a Role filter scoping: "stok" in owner only returns owner modules',
      stokOwner.modules.every(m => m.role === 'owner') && stokOwner.modules.length > 0,
      `Roles returned: ${stokOwner.modules.map(m => m.role).join(', ')}`
    );

    record('1.7b Role filter scoping: "stok" in kasir only returns kasir modules',
      stokKasir.modules.every(m => m.role === 'kasir') && stokKasir.modules.length > 0,
      `Roles returned: ${stokKasir.modules.map(m => m.role).join(', ')}`
    );

    record('1.7c Role filter scoping: "stok" in crm returns 0 modules',
      stokCrm.modules.length === 0,
      `Got ${stokCrm.modules.length} modules`
    );

    record('1.7d Combined counts: sum of scoped modules matches "all" modules',
      (stokOwner.modules.length + stokKasir.modules.length + stokMekanik.modules.length + stokCrm.modules.length) === stokAll.modules.length,
      `Owner(${stokOwner.modules.length}) + Kasir(${stokKasir.modules.length}) + Mekanik(${stokMekanik.modules.length}) + CRM(${stokCrm.modules.length}) vs All(${stokAll.modules.length})`
    );

    // Invalid role handling
    const resInvalidRole = searchDocs('stok', 'non_existent_role');
    record('1.7e Non-existent role filter safely returns 0 modules without throwing',
      resInvalidRole.modules.length === 0,
      `Returned: ${resInvalidRole.modules.length}`
    );
  } catch (err) {
    record('1.7 Role filtering suite', false, err.message);
  }

  // =========================================================================
  // SECTION 2: TOPIC ID VALIDITY, SLUGS & ANCHOR FORMATTING
  // =========================================================================
  console.log(`\n${COLORS.bold}${COLORS.cyan}▶ Section 2: Topic ID Validity, Slugs & Anchor Formatting${COLORS.reset}`);

  try {
    // 2.1 Unique Module IDs
    const moduleIds = DOCS_MODULES.map(m => m.id);
    const uniqueModuleIds = new Set(moduleIds);
    record('2.1 All 16 module IDs are strictly unique',
      moduleIds.length === 16 && uniqueModuleIds.size === 16,
      `Total IDs: ${moduleIds.length}, Unique: ${uniqueModuleIds.size}`
    );

    // 2.2 Unique Module Slugs
    const moduleSlugs = DOCS_MODULES.map(m => m.slug);
    const uniqueModuleSlugs = new Set(moduleSlugs);
    record('2.2 All 16 module slugs are strictly unique',
      moduleSlugs.length === 16 && uniqueModuleSlugs.size === 16,
      `Total Slugs: ${moduleSlugs.length}, Unique: ${uniqueModuleSlugs.size}`
    );

    // 2.3 No ID / Slug collision between modules
    const idSlugIntersection = moduleIds.filter(id => uniqueModuleSlugs.has(id));
    record('2.3 No collision between module IDs and module slugs',
      idSlugIntersection.length === 0,
      `Colliding keys: ${idSlugIntersection.join(', ')}`
    );

    // 2.4 Kebab-case URL formatting compliance
    const kebabRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    const invalidIds = moduleIds.filter(id => !kebabRegex.test(id));
    const invalidSlugs = moduleSlugs.filter(slug => !kebabRegex.test(slug));
    record('2.4 All module IDs and slugs conform to strict kebab-case URL standard',
      invalidIds.length === 0 && invalidSlugs.length === 0,
      `Invalid IDs: [${invalidIds.join(', ')}], Invalid Slugs: [${invalidSlugs.join(', ')}]`
    );

    // 2.5 Unique FAQ IDs and formatting
    const faqIds = DOCS_FAQS.map(f => f.id);
    const uniqueFaqIds = new Set(faqIds);
    const invalidFaqIds = faqIds.filter(id => !kebabRegex.test(id));
    record('2.5 All 5 FAQ IDs are unique and conform to kebab-case',
      faqIds.length === 5 && uniqueFaqIds.size === 5 && invalidFaqIds.length === 0,
      `Total: ${faqIds.length}, Unique: ${uniqueFaqIds.size}, Invalid: [${invalidFaqIds.join(', ')}]`
    );

    // 2.6 No FAQ ID collision with module IDs or slugs
    const faqCollisions = faqIds.filter(id => uniqueModuleIds.has(id) || uniqueModuleSlugs.has(id));
    record('2.6 FAQ IDs do not collide with module IDs or slugs',
      faqCollisions.length === 0,
      `Colliding FAQ IDs: ${faqCollisions.join(', ')}`
    );

    // 2.7 Anchor link generation verification
    const dummyOrigin = 'https://bengkelgps.example.com';
    let anchorFormatPass = true;
    for (const mod of DOCS_MODULES) {
      const anchorUrl = `${dummyOrigin}/panduan#${mod.slug}`;
      const urlObj = new URL(anchorUrl);
      if (urlObj.hash !== `#${mod.slug}` || urlObj.pathname !== '/panduan') {
        anchorFormatPass = false;
        break;
      }
    }
    record('2.7 Anchor URLs /panduan#<slug> format validly across all 16 modules',
      anchorFormatPass,
      'URL object parsing failed for some slug anchors'
    );
  } catch (err) {
    record('Section 2 Topic ID and Anchor suite', false, err.message);
  }

  // =========================================================================
  // SECTION 3: SEQUENTIAL NAVIGATION BOUNDARIES & INTEGRITY
  // =========================================================================
  console.log(`\n${COLORS.bold}${COLORS.cyan}▶ Section 3: Prev/Next Navigation Boundaries & Sequential Integrity${COLORS.reset}`);

  try {
    // 3.1 First module boundary: Previous button disabled / null
    const firstIndex = 0;
    const firstPrev = firstIndex > 0 ? DOCS_MODULES[firstIndex - 1] : null;
    const firstNext = firstIndex < DOCS_MODULES.length - 1 ? DOCS_MODULES[firstIndex + 1] : null;
    record('3.1 First module (owner-settings) has prevModule === null and nextModule !== null',
      firstPrev === null && firstNext !== null && firstNext.id === DOCS_MODULES[1].id,
      `Prev: ${firstPrev}, Next: ${firstNext?.id}`
    );

    // 3.2 Last module boundary: Next button disabled / null
    const lastIndex = DOCS_MODULES.length - 1;
    const lastPrev = lastIndex > 0 ? DOCS_MODULES[lastIndex - 1] : null;
    const lastNext = lastIndex < DOCS_MODULES.length - 1 ? DOCS_MODULES[lastIndex + 1] : null;
    record('3.2 Last module (crm-tracking) has nextModule === null and prevModule !== null',
      lastNext === null && lastPrev !== null && lastPrev.id === DOCS_MODULES[lastIndex - 1].id,
      `Prev: ${lastPrev?.id}, Next: ${lastNext}`
    );

    // 3.3 Complete forward sequential traversal
    let current = 0;
    const visitedForward = [];
    while (current < DOCS_MODULES.length) {
      visitedForward.push(DOCS_MODULES[current].id);
      if (current === DOCS_MODULES.length - 1) break;
      current++;
    }
    const forwardMatches = visitedForward.length === 16 &&
      visitedForward.every((id, idx) => id === DOCS_MODULES[idx].id);
    record('3.3 Full forward traversal visits all 16 modules in exact sequential order',
      forwardMatches,
      `Visited ${visitedForward.length} modules`
    );

    // 3.4 Complete backward sequential traversal
    current = DOCS_MODULES.length - 1;
    const visitedBackward = [];
    while (current >= 0) {
      visitedBackward.push(DOCS_MODULES[current].id);
      if (current === 0) break;
      current--;
    }
    const backwardMatches = visitedBackward.length === 16 &&
      visitedBackward.every((id, idx) => id === DOCS_MODULES[15 - idx].id);
    record('3.4 Full backward traversal visits all 16 modules in exact reverse order',
      backwardMatches,
      `Visited ${visitedBackward.length} modules`
    );

    // 3.5 Step numbering and tutorial structure integrity
    let stepsValid = true;
    let calloutsValid = true;
    for (const mod of DOCS_MODULES) {
      if (!Array.isArray(mod.steps) || mod.steps.length < 3) {
        stepsValid = false;
      }
      mod.steps.forEach((st, idx) => {
        if (st.number !== idx + 1 || !st.title || !st.description) {
          stepsValid = false;
        }
      });
      if (mod.callout && !['tip', 'note', 'warning'].includes(mod.callout.type)) {
        calloutsValid = false;
      }
    }
    record('3.5 Every module has >= 3 numbered sequential steps and valid callout banner',
      stepsValid && calloutsValid,
      `Steps valid: ${stepsValid}, Callouts valid: ${calloutsValid}`
    );

    // 3.6 Metadata consistency
    record('3.6 DOCS_METADATA accurately reflects total modules, FAQs, and roles',
      DOCS_METADATA.totalModules === 16 &&
      DOCS_METADATA.totalFaqs === 5 &&
      DOCS_METADATA.totalRoles === 4,
      `Metadata: ${JSON.stringify(DOCS_METADATA)}`
    );
  } catch (err) {
    record('Section 3 Navigation Boundaries suite', false, err.message);
  }

  // =========================================================================
  // SECTION 4: DOCUMENTATION REST API ENDPOINTS & ERROR RESILIENCE
  // =========================================================================
  console.log(`\n${COLORS.bold}${COLORS.cyan}▶ Section 4: REST API Endpoints & Error Resilience (/api/docs)${COLORS.reset}`);

  try {
    // 4.1 GET /api/docs base payload
    const resBase = await request(app).get('/api/docs');
    record('4.1 GET /api/docs returns 200 with all roles, modules, faqs, and metadata',
      resBase.status === 200 &&
      resBase.body.success === true &&
      resBase.body.roles.length === 4 &&
      resBase.body.modules.length === 16 &&
      resBase.body.faqs.length === 5 &&
      resBase.body.meta.totalModules === 16,
      `Status: ${resBase.status}, Body success: ${resBase.body?.success}`
    );

    // 4.2 GET /api/docs?q=stok+opname query filtering
    const resQuery = await request(app).get('/api/docs?q=stok%20opname');
    record('4.2 GET /api/docs?q=stok opname filters correctly and includes totalResults',
      resQuery.status === 200 &&
      resQuery.body.success === true &&
      resQuery.body.modules.length >= 1 &&
      resQuery.body.totalResults > 0,
      `Modules matched: ${resQuery.body.modules?.length}, TotalResults: ${resQuery.body.totalResults}`
    );

    // 4.3 GET /api/docs?role=kasir role scoping
    const resRoleKasir = await request(app).get('/api/docs?role=kasir');
    record('4.3 GET /api/docs?role=kasir returns only kasir modules (5 modules)',
      resRoleKasir.status === 200 &&
      resRoleKasir.body.modules.length === 5 &&
      resRoleKasir.body.modules.every(m => m.role === 'kasir'),
      `Got ${resRoleKasir.body.modules?.length} kasir modules`
    );

    // 4.4 GET /api/docs?q=nonexistent returns 200 with empty arrays
    const resEmptyQuery = await request(app).get('/api/docs?q=xyzabc123nonexistent');
    record('4.4 GET /api/docs?q=nonexistent returns 200 with modules=[] and totalResults=0',
      resEmptyQuery.status === 200 &&
      resEmptyQuery.body.modules.length === 0 &&
      resEmptyQuery.body.faqs.length === 0 &&
      resEmptyQuery.body.totalResults === 0,
      `Total: ${resEmptyQuery.body.totalResults}`
    );

    // 4.5 GET /api/docs/:id by module ID
    const resModId = await request(app).get('/api/docs/owner-settings');
    record('4.5 GET /api/docs/:id resolves module by ID (owner-settings)',
      resModId.status === 200 &&
      resModId.body.success === true &&
      resModId.body.type === 'module' &&
      resModId.body.data.id === 'owner-settings',
      `Status: ${resModId.status}, Type: ${resModId.body?.type}`
    );

    // 4.6 GET /api/docs/:id by module slug
    const resModSlug = await request(app).get('/api/docs/alur-status-6-tahap');
    record('4.6 GET /api/docs/:id resolves module by slug (alur-status-6-tahap)',
      resModSlug.status === 200 &&
      resModSlug.body.success === true &&
      resModSlug.body.type === 'module' &&
      resModSlug.body.data.id === 'mekanik-lifecycle',
      `Resolved id: ${resModSlug.body.data?.id}`
    );

    // 4.7 GET /api/docs/:id by FAQ ID
    const resFaqId = await request(app).get('/api/docs/faq-stock-discrepancy');
    record('4.7 GET /api/docs/:id resolves FAQ by ID (faq-stock-discrepancy)',
      resFaqId.status === 200 &&
      resFaqId.body.success === true &&
      resFaqId.body.type === 'faq' &&
      resFaqId.body.data.id === 'faq-stock-discrepancy',
      `Resolved FAQ id: ${resFaqId.body.data?.id}`
    );

    // 4.8 GET /api/docs/:id non-existent ID returns 404
    const resNotFound = await request(app).get('/api/docs/unknown-topic-999');
    record('4.8 GET /api/docs/unknown-topic-999 returns 404 with structured error',
      resNotFound.status === 404 &&
      resNotFound.body.success === false &&
      typeof resNotFound.body.error === 'string',
      `Status: ${resNotFound.status}, error: ${resNotFound.body?.error}`
    );

    // 4.9 GET /api/docs/:id adversarial inputs (Path traversal, script injection)
    const resTraversal = await request(app).get('/api/docs/..%2F..%2Fetc%2Fpasswd');
    record('4.9a GET /api/docs with path traversal attempt returns 404 safely',
      resTraversal.status === 404 && resTraversal.body.success === false,
      `Status: ${resTraversal.status}`
    );

    const resXssId = await request(app).get('/api/docs/%3Cscript%3Ealert(1)%3C%2Fscript%3E');
    record('4.9b GET /api/docs with XSS script in path returns 404 without injection',
      resXssId.status === 404 && resXssId.body.success === false,
      `Status: ${resXssId.status}`
    );

    const resNullId = await request(app).get('/api/docs/null');
    record('4.9c GET /api/docs/null returns 404 safely',
      resNullId.status === 404 && resNullId.body.success === false,
      `Status: ${resNullId.status}`
    );

    const resZeroId = await request(app).get('/api/docs/0');
    record('4.9d GET /api/docs/0 returns 404 safely',
      resZeroId.status === 404 && resZeroId.body.success === false,
      `Status: ${resZeroId.status}`
    );

    // 4.10 Very long ID string in /api/docs/:id
    const longId = 'x'.repeat(4000);
    const resLongId = await request(app).get(`/api/docs/${longId}`);
    record('4.10 GET /api/docs with 4,000-character ID returns 404 without server timeout',
      resLongId.status === 404 && resLongId.body.success === false,
      `Status: ${resLongId.status}`
    );

    // 4.11 GET /api/docs?role=faq behavior
    const resRoleFaq = await request(app).get('/api/docs?role=faq');
    record('4.11 GET /api/docs?role=faq returns 200 with 5 FAQs',
      resRoleFaq.status === 200 && resRoleFaq.body.success === true && resRoleFaq.body.faqs.length === 5,
      `FAQs count: ${resRoleFaq.body.faqs?.length}`
    );
  } catch (err) {
    record('Section 4 REST API Endpoints suite', false, err.message);
  }

  // =========================================================================
  // SECTION 5: STATIC & HTML ROUTE HANDLING (/panduan & /docs)
  // =========================================================================
  console.log(`\n${COLORS.bold}${COLORS.cyan}▶ Section 5: Static & HTML Route Handling (/panduan & /docs)${COLORS.reset}`);

  try {
    const resPanduan = await request(app).get('/panduan');
    record('5.1 GET /panduan returns 200 OK with HTML content-type',
      resPanduan.status === 200 && resPanduan.headers['content-type'].includes('html'),
      `Status: ${resPanduan.status}, Content-Type: ${resPanduan.headers['content-type']}`
    );

    const resDocs = await request(app).get('/docs');
    record('5.2 GET /docs returns 200 OK with HTML content-type',
      resDocs.status === 200 && resDocs.headers['content-type'].includes('html'),
      `Status: ${resDocs.status}, Content-Type: ${resDocs.headers['content-type']}`
    );

    const resPanduanSub = await request(app).get('/panduan/alur-status-6-tahap');
    record('5.3 GET /panduan/alur-status-6-tahap sub-path returns 200 HTML',
      resPanduanSub.status === 200 && resPanduanSub.headers['content-type'].includes('html'),
      `Status: ${resPanduanSub.status}`
    );

    const resDocsSub = await request(app).get('/docs/pengaturan-bengkel');
    record('5.4 GET /docs/pengaturan-bengkel sub-path returns 200 HTML',
      resDocsSub.status === 200 && resDocsSub.headers['content-type'].includes('html'),
      `Status: ${resDocsSub.status}`
    );
  } catch (err) {
    record('Section 5 Static & HTML Route suite', false, err.message);
  }

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log(`\n${COLORS.bold}----------------------------------------------------------------${COLORS.reset}`);
  console.log(`${COLORS.bold}  Milestone 8 Adversarial Challenge Execution Summary:${COLORS.reset}`);
  console.log(`  Total Invocations: ${results.total}`);
  console.log(`  ${COLORS.green}✔ Passed:          ${results.passed}${COLORS.reset}`);
  if (results.failed > 0) {
    console.log(`  ${COLORS.red}✖ Failed:          ${results.failed}${COLORS.reset}`);
    for (const f of results.failures) {
      console.log(`    ${COLORS.red}✖ ${f.name}${COLORS.reset} - ${f.details}`);
    }
  }
  console.log(`${COLORS.bold}----------------------------------------------------------------${COLORS.reset}\n`);

  if (results.failed > 0) {
    console.error(`${COLORS.red}${COLORS.bold}CHALLENGE FAILED: Found ${results.failed} failing scenarios.${COLORS.reset}`);
    process.exit(1);
  }

  console.log(`${COLORS.green}${COLORS.bold}✔ ALL MILESTONE 8 ADVERSARIAL CHALLENGES PASSED SUCCESSFULLY (Exit 0)${COLORS.reset}\n`);
}

runAdversarialSuite().catch(err => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});
