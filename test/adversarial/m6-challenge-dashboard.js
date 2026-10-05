/**
 * Milestone 6 & 7 Adversarial Challenge: Dashboard Analytics & Multi-Tenant Stress Test
 *
 * Stress-tests:
 * 1. Multi-Tenant Isolation (Tenant B cannot see Tenant A metrics, KPIs, or activities)
 * 2. Empty Tenant Resilience (Zero-division, NaN, null reference safety on fresh tenant)
 * 3. Zero Monthly Target Boundary (monthly_revenue_target = 0 resilience)
 * 4. Authentication Enforcement (401 on unauthenticated dashboard calls)
 * 5. Negative Net & Large Number Formatting
 * 6. Activity Feed Sorting & Capping (Max 10 events, descending order)
 * 7. Top Spareparts Aggregation & Ranking
 */

import assert from 'node:assert/strict';
import { createTestApp, loginUser, createAuthAgent } from '../supertestHelper.js';
import { runSeed } from '../../server/db/seed.js';

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✔ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✖ FAIL: ${name}`);
    console.error(`    ↳ ${err.message}`);
    failed++;
  }
}

async function run() {
  console.log('\n================================================================');
  console.log('  Milestone 6/7: Dashboard Analytics Adversarial Challenge Suite');
  console.log('================================================================\n');

  const { app, db, cleanup } = createTestApp();

  try {
    // ----------------------------------------------------
    // Section 1: Authentication Enforcement
    // ----------------------------------------------------
    console.log('▶ Section 1: Authentication Enforcement');
    await test('1.1: GET /api/dashboard/summary requires authentication (401)', async () => {
      const agent = createAuthAgent(app, {});
      const res = await agent.get('/api/dashboard/summary');
      assert.equal(res.status, 401);
    });

    await test('1.2: GET /api/dashboard/stats requires authentication (401)', async () => {
      const agent = createAuthAgent(app, {});
      const res = await agent.get('/api/dashboard/stats');
      assert.equal(res.status, 401);
    });

    await test('1.3: GET /api/dashboard requires authentication (401)', async () => {
      const agent = createAuthAgent(app, {});
      const res = await agent.get('/api/dashboard');
      assert.equal(res.status, 401);
    });

    // ----------------------------------------------------
    // Section 2: Empty Tenant Resilience & NaN / Divide-by-Zero Safety
    // ----------------------------------------------------
    console.log('\n▶ Section 2: Empty Tenant Edge Cases & Zero Safety');
    
    // Login as a brand new tenant with ZERO records
    const emptyTenantAuth = await loginUser(app, {
      tenantSlug: 'empty-test-bengkel',
      name: 'Bengkel Baru Kosong',
      email: 'owner@empty-bengkel.local'
    });
    const emptyAgent = createAuthAgent(app, emptyTenantAuth);

    let emptySummary;
    await test('2.1: Fresh empty tenant returns HTTP 200 with complete schema', async () => {
      const res = await emptyAgent.get('/api/dashboard/summary');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.summary, 'Summary object present');
      assert.ok(Array.isArray(res.body.revenue_trend_30d), '30-day revenue trend is array');
      assert.ok(Array.isArray(res.body.status_distribution_array), 'Status distribution is array');
      assert.ok(Array.isArray(res.body.top_spareparts), 'Top spareparts is array');
      assert.ok(Array.isArray(res.body.recent_activities), 'Recent activities is array');
      emptySummary = res.body;
    });

    await test('2.2: Operational widgets reflect exact zeroes without NaN or null', async () => {
      const s = emptySummary.summary;
      assert.equal(s.active_ros, 0);
      assert.equal(s.cars_entered_today, 0);
      assert.equal(s.completed_ros_today, 0);
      assert.equal(s.monthly_revenue, 0);
      assert.equal(s.monthly_expense, 0);
      assert.equal(s.monthly_net, 0);
      assert.equal(s.target_progress_percent, 0);
      assert.equal(s.low_stock_count, 0);
      assert.equal(s.out_of_stock_count, 0);
      assert.equal(s.total_spareparts, 0);

      // Verify no NaN values
      for (const [key, val] of Object.entries(s)) {
        assert.ok(!Number.isNaN(val), `Key ${key} must not be NaN`);
        assert.notEqual(val, Infinity, `Key ${key} must not be Infinity`);
        assert.notEqual(val, -Infinity, `Key ${key} must not be -Infinity`);
      }
    });

    await test('2.3: Status distribution contains all 6 stages with count 0', async () => {
      const dist = emptySummary.status_distribution;
      const expectedStages = ['MASUK', 'DIAGNOSA', 'PENGERJAAN', 'MENUNGGU_PART', 'SELESAI', 'DIAMBIL'];
      for (const stage of expectedStages) {
        assert.equal(dist[stage], 0, `Stage ${stage} count must be 0`);
      }

      const distArr = emptySummary.status_distribution_array;
      assert.equal(distArr.length, 6);
      for (const item of distArr) {
        assert.equal(item.count, 0);
        assert.ok(typeof item.color === 'string' && item.color.startsWith('#'), 'Color valid hex');
        assert.ok(typeof item.label === 'string' && item.label.length > 0, 'Label present');
      }
    });

    await test('2.4: 30-day revenue trend has exactly 30 consecutive days ending today with 0 values', async () => {
      const trend = emptySummary.revenue_trend_30d;
      assert.equal(trend.length, 30, 'Must have exactly 30 entries');

      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      assert.equal(trend[trend.length - 1].date, todayStr, 'Last entry must be today');

      for (const entry of trend) {
        assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(entry.date), `Date format valid: ${entry.date}`);
        assert.equal(entry.revenue, 0);
        assert.equal(entry.expense, 0);
      }
    });

    await test('2.5: Empty top spareparts & recent activities return clean empty arrays', async () => {
      assert.deepEqual(emptySummary.top_spareparts, []);
      assert.deepEqual(emptySummary.recent_activities, []);
    });

    await test('2.6: Zero Monthly Revenue Target boundary (target = 0) does not divide by zero', async () => {
      // Set monthly target to 0 in tenant_settings
      db.prepare(`
        UPDATE tenant_settings 
        SET monthly_revenue_target = 0 
        WHERE tenant_id = ?
      `).run(emptyTenantAuth.tenant.id);

      const res = await emptyAgent.get('/api/dashboard/summary');
      assert.equal(res.status, 200);
      // Even if set to 0, system falls back to default 15000000 and target_progress_percent is 0 (never NaN or Infinity)
      assert.ok(res.body.summary.monthly_target >= 0, 'Target is non-negative');
      assert.equal(res.body.summary.target_progress_percent, 0);
      assert.ok(!Number.isNaN(res.body.summary.target_progress_percent), 'target_progress_percent must not be NaN');
      assert.notEqual(res.body.summary.target_progress_percent, Infinity, 'Must not be Infinity');
    });

    // ----------------------------------------------------
    // Section 3: Multi-Tenant Boundary Isolation
    // ----------------------------------------------------
    console.log('\n▶ Section 3: Multi-Tenant Boundary Isolation');

    // Run seed to populate Bengkel Mobil GPS Motor Kediri (Tenant A)
    runSeed(db);

    const tenantAAuth = await loginUser(app, {
      tenantSlug: 'bengkel-gps-motor',
      email: 'admin@gpsmotor.id'
    });
    const agentA = createAuthAgent(app, tenantAAuth);

    const resA = await agentA.get('/api/dashboard/summary');
    assert.equal(resA.status, 200);
    const summaryA = resA.body.summary;

    await test('3.1: Seeded Tenant A exhibits rich operational metrics', async () => {
      assert.ok(summaryA.active_ros > 0, 'Active ROs > 0');
      assert.ok(summaryA.monthly_revenue > 0, 'Monthly revenue > 0');
      assert.ok(summaryA.total_spareparts >= 20, 'Total spareparts >= 20');
      assert.ok(resA.body.top_spareparts.length > 0, 'Top spareparts present');
      assert.ok(resA.body.recent_activities.length > 0, 'Recent activities present');
    });

    // Login as distinct Tenant B
    const tenantBAuth = await loginUser(app, {
      tenantSlug: 'bengkel-bintang-motor',
      name: 'Bengkel Bintang Motor',
      email: 'admin@bintang-motor.local'
    });
    const agentB = createAuthAgent(app, tenantBAuth);

    let summaryB;
    await test('3.2: Tenant B dashboard is COMPLETELY ISOLATED from Tenant A', async () => {
      const resB = await agentB.get('/api/dashboard/summary');
      assert.equal(resB.status, 200);
      summaryB = resB.body;

      // Tenant B must see strictly 0 active ROs and 0 revenue
      assert.equal(summaryB.summary.active_ros, 0, 'Tenant B must have 0 active ROs');
      assert.equal(summaryB.summary.monthly_revenue, 0, 'Tenant B must have 0 revenue');
      assert.equal(summaryB.summary.total_spareparts, 0, 'Tenant B must have 0 parts');
      assert.deepEqual(summaryB.top_spareparts, [], 'Tenant B must have 0 top spareparts');
      assert.deepEqual(summaryB.recent_activities, [], 'Tenant B must have 0 recent activities');

      // Tenant B status distribution must be all 0s
      for (const [k, v] of Object.entries(summaryB.status_distribution)) {
        assert.equal(v, 0, `Tenant B stage ${k} must be 0`);
      }
    });

    await test('3.3: Creating activity in Tenant B does NOT leak into Tenant A metrics', async () => {
      // Insert 1 repair order in Tenant B
      db.prepare(`
        INSERT INTO repair_orders (
          id, tenant_id, ro_number, tracking_token, plate_number, customer_name, customer_phone,
          car_brand, car_model, entry_date, complaint, mechanic_name, status, service_fee, total_cost
        ) VALUES (
          'ro-tenant-b-01', ?, 'RO-B-001', 'token-tenant-b-01', 'B 9999 XYZ', 'Budi Tenant B', '08999999',
          'Toyota', 'Yaris', date('now', 'localtime'), 'Cek Rem', 'Mekanik B', 'PENGERJAAN', 200000, 200000
        )
      `).run(tenantBAuth.tenant.id);

      // Insert 1 transaction in Tenant B
      const catRow = db.prepare('SELECT id FROM transaction_categories WHERE tenant_id = ? AND type = ?').get(tenantBAuth.tenant.id, 'INCOME');
      const catId = catRow ? catRow.id : 'cat-default-b';
      if (!catRow) {
        db.prepare('INSERT INTO transaction_categories (id, tenant_id, name, type) VALUES (?, ?, ?, ?)').run(catId, tenantBAuth.tenant.id, 'Jasa Servis', 'INCOME');
      }

      db.prepare(`
        INSERT INTO transactions (id, tenant_id, category_id, type, amount, date, description, payment_method)
        VALUES ('tx-tenant-b-01', ?, ?, 'INCOME', 750000, date('now', 'localtime'), 'Servis Rem Yaris', 'CASH')
      `).run(tenantBAuth.tenant.id, catId);

      // Verify Tenant B summary reflects the new items
      const resB_after = await agentB.get('/api/dashboard/summary');
      assert.equal(resB_after.body.summary.active_ros, 1);
      assert.equal(resB_after.body.summary.monthly_revenue, 750000);

      // Re-fetch Tenant A summary: must be UNCHANGED
      const resA_after = await agentA.get('/api/dashboard/summary');
      assert.equal(resA_after.body.summary.active_ros, summaryA.active_ros);
      assert.equal(resA_after.body.summary.monthly_revenue, summaryA.monthly_revenue);

      // Verify Tenant A's recent activities do not contain 'B 9999 XYZ' or 'Servis Rem Yaris'
      const activitiesA = JSON.stringify(resA_after.body.recent_activities);
      assert.ok(!activitiesA.includes('B 9999 XYZ'), 'Tenant A activities must not contain Tenant B plate');
      assert.ok(!activitiesA.includes('Servis Rem Yaris'), 'Tenant A activities must not contain Tenant B transaction');
    });

    // ----------------------------------------------------
    // Section 4: Stress-Testing Activity Feed Limits & Sorting
    // ----------------------------------------------------
    console.log('\n▶ Section 4: Recent Activity Feed Invariants');

    await test('4.1: Activity feed capped at exactly 10 items even with 30+ database events', async () => {
      const res = await agentA.get('/api/dashboard/summary');
      assert.equal(res.status, 200);
      const acts = res.body.recent_activities;
      assert.ok(acts.length <= 10, `Activities count ${acts.length} must be <= 10`);
      assert.equal(acts.length, 10, 'Tenant A should have full 10 activities');
    });

    await test('4.2: Activity feed is strictly ordered descending by timestamp', async () => {
      const res = await agentA.get('/api/dashboard/summary');
      const acts = res.body.recent_activities;
      for (let i = 0; i < acts.length - 1; i++) {
        const t1 = new Date(acts[i].timestamp).getTime();
        const t2 = new Date(acts[i + 1].timestamp).getTime();
        assert.ok(t1 >= t2, `Item ${i} (${acts[i].timestamp}) must be >= item ${i+1} (${acts[i+1].timestamp})`);
      }
    });

    // ----------------------------------------------------
    // Section 5: Top Spareparts Ranking Invariants
    // ----------------------------------------------------
    console.log('\n▶ Section 5: Top Spareparts Ranking');

    await test('5.1: Top spareparts list capped at maximum 5 items', async () => {
      const res = await agentA.get('/api/dashboard/summary');
      const topParts = res.body.top_spareparts;
      assert.ok(topParts.length <= 5, `Top parts count ${topParts.length} must be <= 5`);
    });

    await test('5.2: Top spareparts ordered descending by total_used', async () => {
      const res = await agentA.get('/api/dashboard/summary');
      const topParts = res.body.top_spareparts;
      for (let i = 0; i < topParts.length - 1; i++) {
        assert.ok(topParts[i].total_used >= topParts[i + 1].total_used, 'Parts must be ordered by total_used DESC');
      }
    });

    // ----------------------------------------------------
    // Section 6: Negative Net & Deficit Accounting
    // ----------------------------------------------------
    console.log('\n▶ Section 6: Financial Net Calculation Invariants');

    await test('6.1: Monthly net correctly computes negative value when expense > revenue', async () => {
      // In Tenant B, add a massive expense of Rp 2,000,000
      const expCatRow = db.prepare('SELECT id FROM transaction_categories WHERE tenant_id = ? AND type = ?').get(tenantBAuth.tenant.id, 'EXPENSE');
      const expCatId = expCatRow ? expCatRow.id : 'cat-exp-b';
      if (!expCatRow) {
        db.prepare('INSERT INTO transaction_categories (id, tenant_id, name, type) VALUES (?, ?, ?, ?)').run(expCatId, tenantBAuth.tenant.id, 'Beli Stok', 'EXPENSE');
      }

      db.prepare(`
        INSERT INTO transactions (id, tenant_id, category_id, type, amount, date, description, payment_method)
        VALUES ('tx-exp-b-01', ?, ?, 'EXPENSE', 2000000, date('now', 'localtime'), 'Beli Drum Oli', 'TRANSFER')
      `).run(tenantBAuth.tenant.id, expCatId);

      // Tenant B now has 750,000 income and 2,000,000 expense -> net = -1,250,000
      const resB = await agentB.get('/api/dashboard/summary');
      assert.equal(resB.body.summary.monthly_revenue, 750000);
      assert.equal(resB.body.summary.monthly_expense, 2000000);
      assert.equal(resB.body.summary.monthly_net, -1250000);
    });

  } finally {
    cleanup();
  }

  console.log('\n----------------------------------------------------------------');
  console.log('Adversarial Dashboard Challenge Summary:');
  console.log(`  Total:  ${passed + failed}`);
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  console.log('----------------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
