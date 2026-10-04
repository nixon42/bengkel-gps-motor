import assert from 'node:assert/strict';
import request from 'supertest';
import fs from 'node:fs';
import path from 'node:path';
import { createApp } from '../server/app.js';
import { initDatabase } from '../server/db/index.js';
import { 
  maskPlate, 
  maskCustomerName, 
  normalizePlate, 
  sanitizeTrackingPayload 
} from '../server/services/maskingService.js';

console.log('================================================================');
console.log('  Milestone 2: Landing Page & Public Tracking Verification Suite');
console.log('================================================================\n');

// 1. Pure Privacy Masking Algorithms Verification (E01, E03, E04, E05)
console.log('▶ 1. Validating Privacy Masking Algorithms (R6, E01, E03, E04, E05)...');

// Plate normalization & masking
assert.equal(maskPlate('AG 1234 XX'), 'AG 12** XX');
assert.equal(maskPlate('AG1234XX'), 'AG 12** XX');
assert.equal(maskPlate('ag-1234-xx'), 'AG 12** XX');
assert.equal(maskPlate('AG   1234   XX'), 'AG 12** XX');
assert.equal(maskPlate('AG 1 X'), 'AG 1* X');
assert.equal(maskPlate('B 12 A'), 'B 1* A');
assert.equal(maskPlate('AG.1234.XX'), 'AG 12** XX');
assert.equal(maskPlate('AG. 1234 .XX'), 'AG 12** XX');
assert.equal(maskPlate(''), '');
assert.equal(maskPlate('   '), '');
console.log('  ✔ All plate masking vectors verified (standard, short, no spaces, hyphens, dots)');

// Name masking
assert.equal(maskCustomerName('Budi Santoso'), 'Budi S******');
assert.equal(maskCustomerName('Agus Bambang Wijaya'), 'Agus B****** W*****');
assert.equal(maskCustomerName('Slamet'), 'Sla***');
assert.equal(maskCustomerName('Ed'), 'E*');
assert.equal(maskCustomerName('Bo'), 'B*');
assert.equal(maskCustomerName('A'), 'A*');
assert.equal(maskCustomerName(''), '');
assert.equal(maskCustomerName('   '), '');
console.log('  ✔ All customer name masking vectors verified (multi-word, single-word, 1-2 char initials, whitespace/empty)');

// 2. In-Memory Database & API Verification
console.log('\n▶ 2. Validating Public API Endpoints (/api/public/*)...');
const db = initDatabase(':memory:');
const app = createApp(db);

try {
  // Test GET /api/public/:slug/info
  const resInfo = await request(app)
    .get('/api/public/bengkel-gps-motor/info')
    .expect(200);

  assert.equal(resInfo.body.success, true);
  assert.equal(resInfo.body.tenant.name, 'Bengkel Mobil GPS Motor Kediri');
  assert.ok(resInfo.body.tenant.address.includes('Sambiresik'));
  assert.ok(resInfo.body.tenant.address.includes('Kediri'));
  assert.equal(resInfo.body.tenant.phone_wa, '0856-0330-7330');
  assert.equal(resInfo.body.services.length, 6, 'Must provide all 6 featured services');
  assert.ok(resInfo.body.testimonials.length >= 3, 'Must provide customer testimonials');
  assert.ok(resInfo.body.faqs.length >= 5, 'Must provide FAQs');
  console.log('  ✔ GET /api/public/bengkel-gps-motor/info verified (workshop info, 6 services, FAQs, testimonials)');

  // Test Default Slug Fallback
  const resInfoFallback = await request(app)
    .get('/api/public/info')
    .expect(200);
  assert.equal(resInfoFallback.body.tenant.name, 'Bengkel Mobil GPS Motor Kediri');
  console.log('  ✔ GET /api/public/info verified with default slug fallback');

  // Test GET /api/public/:slug/tracking with plate query
  const resTrack = await request(app)
    .get('/api/public/bengkel-gps-motor/tracking?plate=AG%201822%20AB')
    .expect(200);

  assert.equal(resTrack.body.success, true);
  assert.equal(resTrack.body.plate_masked, 'AG 18** AB');
  assert.equal(resTrack.body.customer_name_masked, 'Joko W*****');
  assert.equal(resTrack.body.stages.length, 6, 'Must contain all 6 lifecycle stages');
  assert.equal(resTrack.body.stages[0].key, 'MASUK');
  assert.equal(resTrack.body.stages[1].key, 'DIAGNOSA');
  assert.equal(resTrack.body.stages[2].key, 'PENGERJAAN');
  assert.equal(resTrack.body.stages[3].key, 'MENUNGGU_PART');
  assert.equal(resTrack.body.stages[4].key, 'SELESAI');
  assert.equal(resTrack.body.stages[5].key, 'DIAMBIL');

  // Verify photos and spareparts
  assert.ok(resTrack.body.photos.length >= 2, 'Must include before/progress photos');
  assert.ok(resTrack.body.spareparts.length >= 1, 'Must include spareparts list');

  // Security & Data Stripping (E06) Assertions
  const bodyString = JSON.stringify(resTrack.body);
  assert.ok(!bodyString.includes('081234567890'), 'E06: Customer phone must NEVER leak in public payload');
  assert.ok(!bodyString.includes('harga_beli'), 'E06: Wholesale buy price field must NOT exist');
  assert.ok(!bodyString.includes('buy_price'), 'E06: buy_price must NOT exist');
  console.log('  ✔ GET /api/public/:slug/tracking verified (6 stages, masked plate/name, photos)');
  console.log('  ✔ E06 attribute stripping verified (zero phone leak, zero wholesale buy price leak)');

  // Test plate variation search (E01 without spaces)
  const resCompact = await request(app)
    .get('/api/public/bengkel-gps-motor/tracking?plate=AG1822AB')
    .expect(200);
  assert.equal(resCompact.body.plate_masked, 'AG 18** AB');
  console.log('  ✔ E01 plate query variation AG1822AB successfully resolved');

  // Test trackingUrl resolution roundtrip
  assert.ok(resTrack.body.trackingUrl.includes('?token='), 'trackingUrl must use tracking_token');
  const trackingQueryPart = resTrack.body.trackingUrl.substring(resTrack.body.trackingUrl.indexOf('?'));
  const resRoundtrip = await request(app)
    .get(`/api/public/bengkel-gps-motor/tracking${trackingQueryPart}`)
    .expect(200);
  assert.equal(resRoundtrip.body.success, true);
  console.log('  ✔ trackingUrl with token roundtrip successfully resolves with HTTP 200');

  // Test stored dot plate in database
  const tenant = db.prepare('SELECT id FROM tenants LIMIT 1').get();
  db.prepare(`
    INSERT INTO repair_orders (
      id, tenant_id, ro_number, tracking_token, plate_number, customer_name, customer_phone,
      car_brand, car_model, entry_date, complaint, mechanic_name, status, service_fee, sparepart_fee, total_cost
    ) VALUES (
      'ro-dot-stored-test', ?, 'RO-DOT-TEST', 'tok-dot-test', 'AG.7777.YY', 'Pak Tri', '0877777',
      'Toyota', 'Innova', '2026-10-04', 'Servis berkala', 'Budi', 'MASUK', 0, 0, 0
    )
  `).run(tenant.id);

  const resStoredDot = await request(app)
    .get('/api/public/bengkel-gps-motor/tracking?plate=AG%207777%20YY')
    .expect(200);
  assert.equal(resStoredDot.body.plate_masked, 'AG 77** YY');
  console.log('  ✔ DB normalization matches stored dot plate "AG.7777.YY" via query "AG 7777 YY"');

  // Test 404 for nonexistent plate
  const resNotFound = await request(app)
    .get('/api/public/bengkel-gps-motor/tracking?plate=AG9999ZZ')
    .expect(404);
  assert.equal(resNotFound.body.success, false);
  console.log('  ✔ Nonexistent plate returns clean 404 Not Found');

} finally {
  db.close();
}

// 3. Frontend Zero Glassmorphism & Constraint Inspection
console.log('\n▶ 3. Inspecting Zero Glassmorphism Architecture (R1, R9)...');
function scanDir(dir, ext) {
  let files = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files = files.concat(scanDir(fullPath, ext));
    } else if (ext.some(e => item.name.endsWith(e))) {
      files.push(fullPath);
    }
  }
  return files;
}

const srcFiles = scanDir(path.resolve('src'), ['.jsx', '.js', '.css']);
let glassmorphismViolations = 0;

for (const file of srcFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  if (content.includes('backdrop-blur') || content.includes('backdrop-filter')) {
    console.error(`  ❌ Glassmorphism violation found in ${file}`);
    glassmorphismViolations++;
  }
}

assert.equal(glassmorphismViolations, 0, 'Zero glassmorphism strictly enforced');
console.log('  ✔ Zero glassmorphism verified across all frontend source files (0 backdrop-blur found)');

console.log('\n================================================================');
console.log('  ALL MILESTONE 2 VERIFICATION SCENARIOS PASSED WITH EXIT 0!');
console.log('================================================================\n');
