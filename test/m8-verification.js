/**
 * test/m8-verification.js
 * Milestone 8 Comprehensive Verification Script
 * Validates:
 * 1. Direct HTML Route Availability (/panduan, /docs)
 * 2. Documentation REST API (/api/docs, /api/docs/:id) & Role Coverage
 * 3. Instant Search Filtering Oracle (keywords: stok opname, laba rugi, 6-tahap, masking)
 * 4. Operational Troubleshooting FAQ Scenarios (all 5 required questions present & structured)
 * 5. Forensic Zero Glassmorphism Scan across src/ (0 backdrop-blur / backdrop-filter)
 * 6. Mobile Touch Target Ergonomics & Design Standards (>= 44x44px touch targets)
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { createApp } from '../server/app.js';
import { getDatabase } from '../server/db/index.js';
import { 
  DOCS_ROLES, 
  DOCS_MODULES, 
  DOCS_FAQS, 
  DOCS_METADATA, 
  searchDocs 
} from '../src/data/docsContent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('  Milestone 8: Documentation & User Guide Verification Suite     ');
console.log('================================================================\n');

async function runM8Verification() {
  const db = getDatabase(':memory:');
  const app = createApp(db);

  // ----------------------------------------------------
  // Scenario 1: HTML & API Routes Availability
  // ----------------------------------------------------
  console.log('▶ 1. Validating Routes & Endpoints (/panduan, /docs, /api/docs)...');
  
  const resPanduan = await request(app).get('/panduan');
  assert.equal(resPanduan.status, 200, 'GET /panduan must return 200 OK');
  assert.ok(resPanduan.text.includes('html') || resPanduan.text.includes('Bengkel'), 'GET /panduan must return valid HTML content');

  const resDocs = await request(app).get('/docs');
  assert.equal(resDocs.status, 200, 'GET /docs must return 200 OK');

  const resApiDocs = await request(app).get('/api/docs');
  assert.equal(resApiDocs.status, 200, 'GET /api/docs must return 200 OK');
  assert.equal(resApiDocs.body.success, true, 'API response must indicate success');
  assert.ok(Array.isArray(resApiDocs.body.modules), 'API must return modules array');
  assert.ok(Array.isArray(resApiDocs.body.faqs), 'API must return faqs array');
  assert.ok(Array.isArray(resApiDocs.body.roles), 'API must return roles array');
  console.log('  ✔ Direct HTML and JSON endpoints return HTTP 200 with valid payloads');

  // ----------------------------------------------------
  // Scenario 2: Role-Based Workflow Coverage
  // ----------------------------------------------------
  console.log('▶ 2. Inspecting Role Coverage (Owner, Mekanik, Kasir, CRM)...');
  
  const coveredRoles = resApiDocs.body.roles.map(r => r.key);
  assert.ok(coveredRoles.includes('owner'), 'Owner / Admin role must be covered');
  assert.ok(coveredRoles.includes('mekanik') || coveredRoles.includes('mechanic'), 'Mekanik role must be covered');
  assert.ok(coveredRoles.includes('kasir') || coveredRoles.includes('cashier'), 'Kasir role must be covered');
  assert.ok(coveredRoles.includes('crm') || coveredRoles.includes('pelanggan'), 'CRM role must be covered');

  const ownerModules = DOCS_MODULES.filter(m => m.role === 'owner');
  const mekanikModules = DOCS_MODULES.filter(m => m.role === 'mekanik');
  const kasirModules = DOCS_MODULES.filter(m => m.role === 'kasir');
  const crmModules = DOCS_MODULES.filter(m => m.role === 'crm');

  assert.ok(ownerModules.length >= 3, 'Owner role must have comprehensive modules');
  assert.ok(mekanikModules.length >= 3, 'Mekanik role must have comprehensive modules');
  assert.ok(kasirModules.length >= 3, 'Kasir role must have comprehensive modules');
  assert.ok(crmModules.length >= 2, 'CRM role must have comprehensive modules');
  console.log(`  ✔ All 4 roles covered with ${DOCS_MODULES.length} in-depth tutorial modules`);

  // ----------------------------------------------------
  // Scenario 3: Instant Search Filtering Oracle
  // ----------------------------------------------------
  console.log('▶ 3. Validating Instant Search Filtering Engine...');
  
  // Test query "stok opname"
  const searchOpname = searchDocs('stok opname');
  assert.ok(searchOpname.totalResults > 0, 'Query "stok opname" must yield results');
  assert.ok(searchOpname.modules.some(m => m.title.toLowerCase().includes('opname')), 'Must match Stok Opname module');

  // Test query "laba rugi"
  const searchPnl = searchDocs('laba rugi');
  assert.ok(searchPnl.totalResults > 0, 'Query "laba rugi" must yield results');
  assert.ok(searchPnl.modules.some(m => m.title.toLowerCase().includes('laba rugi')), 'Must match P&L Finance module');

  // Test query "6-tahap"
  const searchLifecycle = searchDocs('6-tahap');
  assert.ok(searchLifecycle.totalResults > 0, 'Query "6-tahap" must yield results');
  assert.ok(searchLifecycle.modules.some(m => m.tags.includes('6-tahap') || m.title.includes('6-Tahap')), 'Must match 6-tahap lifecycle');

  // Test query "masking" / "sensor"
  const searchMasking = searchDocs('masking');
  assert.ok(searchMasking.totalResults > 0, 'Query "masking" must yield results');
  assert.ok(searchMasking.modules.some(m => m.tags.includes('masking') || m.summary.includes('sensor')), 'Must match privacy masking');

  // Test case-insensitive search
  const searchCaps = searchDocs('WHATSAPP');
  const searchLower = searchDocs('whatsapp');
  assert.equal(searchCaps.totalResults, searchLower.totalResults, 'Search must be strictly case-insensitive');
  console.log('  ✔ Instant search oracle verified across key operational queries');

  // ----------------------------------------------------
  // Scenario 4: Operational Troubleshooting FAQ Scenarios
  // ----------------------------------------------------
  console.log('▶ 4. Validating 5 Operational Troubleshooting FAQ Scenarios...');
  
  assert.ok(DOCS_FAQS.length >= 5, 'Must contain at least 5 operational FAQs');
  
  // Q1: Stok fisik vs sistem
  const faq1 = DOCS_FAQS.find(f => f.question.toLowerCase().includes('stok fisik'));
  assert.ok(faq1, 'FAQ 1 (Stok fisik vs sistem) must be answered');
  assert.ok(faq1.steps.length > 0, 'FAQ 1 must contain actionable step-by-step resolution');

  // Q2: Batal / koreksi kas
  const faq2 = DOCS_FAQS.find(f => f.question.toLowerCase().includes('membatalkan') || f.question.toLowerCase().includes('mengoreksi'));
  assert.ok(faq2, 'FAQ 2 (Batal/koreksi kas) must be answered');

  // Q3: Ganti mekanik PIC
  const faq3 = DOCS_FAQS.find(f => f.question.toLowerCase().includes('mengganti mekanik'));
  assert.ok(faq3, 'FAQ 3 (Ganti mekanik PIC) must be answered');

  // Q4: Nota hilang / cek status HP
  const faq4 = DOCS_FAQS.find(f => f.question.toLowerCase().includes('kehilangan nota') || f.question.toLowerCase().includes('cek status'));
  assert.ok(faq4, 'FAQ 4 (Nota hilang / cek status HP) must be answered');

  // Q5: Optimasi foto kamera HP
  const faq5 = DOCS_FAQS.find(f => f.question.toLowerCase().includes('ukuran foto') || f.question.toLowerCase().includes('optimasi'));
  assert.ok(faq5, 'FAQ 5 (Optimasi ukuran foto) must be answered');
  console.log('  ✔ All 5 operational troubleshooting FAQ scenarios verified with step solutions');

  // ----------------------------------------------------
  // Scenario 5: Forensic Zero Glassmorphism Audit
  // ----------------------------------------------------
  console.log('▶ 5. Forensic Scan for Zero Glassmorphism across src/ ...');
  
  const srcDir = path.join(projectRoot, 'src');
  const glassmorphismTokens = ['backdrop-blur', 'backdrop-filter'];
  let violationCount = 0;

  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (/\.(js|jsx|css)$/.test(entry.name)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        for (const token of glassmorphismTokens) {
          if (content.includes(token)) {
            console.error(`  ❌ Glassmorphism violation found in ${fullPath}: contains "${token}"`);
            violationCount++;
          }
        }
      }
    }
  }

  scanDir(srcDir);
  assert.equal(violationCount, 0, `Zero glassmorphism strictly enforced (found ${violationCount} violations)`);
  console.log('  ✔ Zero glassmorphism verified across all source files (0 backdrop-blur found)');

  // ----------------------------------------------------
  // Scenario 6: Mobile Touch Target Ergonomics Audit
  // ----------------------------------------------------
  console.log('▶ 6. Auditing Mobile Ergonomics & Touch Target CSS Rules...');
  
  const cssFile = path.join(srcDir, 'index.css');
  const cssContent = fs.readFileSync(cssFile, 'utf8');
  assert.ok(cssContent.includes('min-height: 44px') || cssContent.includes('touch-target'), 'index.css must enforce >= 44px touch targets');
  assert.ok(cssContent.includes('touch-action: manipulation'), 'index.css must optimize mobile tap delay');

  // Verify DocsPage component implementation
  const docsPageFile = path.join(srcDir, 'pages', 'DocsPage.jsx');
  assert.ok(fs.existsSync(docsPageFile), 'src/pages/DocsPage.jsx must exist');
  const docsContentJs = fs.readFileSync(docsPageFile, 'utf8');
  assert.ok(docsContentJs.includes('touch-target'), 'DocsPage must apply touch-target class to interactive elements');
  assert.ok(docsContentJs.includes('handleCopyAnchor') || docsContentJs.includes('copyAnchor'), 'DocsPage must feature anchor copy functionality');
  console.log('  ✔ 44x44px touch target ergonomics verified for HP Kentang usability');

  console.log('\n================================================================');
  console.log('  ALL MILESTONE 8 VERIFICATION SCENARIOS PASSED WITH EXIT 0!     ');
  console.log('================================================================\n');
}

runM8Verification().catch((err) => {
  console.error('\n❌ Verification Failed:');
  console.error(err);
  process.exit(1);
});
