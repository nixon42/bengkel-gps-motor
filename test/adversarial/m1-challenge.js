#!/usr/bin/env node
/**
 * Empirical Adversarial Challenge Test Harness for Milestone 1
 * Bengkel Mobil GPS Motor Kediri
 * 
 * Verifies:
 * 1. Multi-Tenant Isolation & Attack Scenarios
 * 2. SQLite Database Constraints, Cascades, & Restrict Rules
 * 3. Latency Benchmarks (<50ms target) & Memory Profiling
 */

import request from 'supertest';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { createApp } from '../../server/app.js';
import { initDatabase } from '../../server/db/index.js';
import { loginUser, withSilencedConsole } from '../supertestHelper.js';

// ANSI styling for clean reports
const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m'
};

const suiteResults = {
  isolation: [],
  constraints: [],
  performance: {
    latencies: {},
    memory: {}
  }
};

function formatMs(n) {
  return `${n.toFixed(2)}ms`;
}

function computePercentiles(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const mean = sorted.reduce((a, b) => a + b, 0) / sorted.length;
  const p50 = sorted[Math.floor(sorted.length * 0.5)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];
  return { min, mean, p50, p95, p99, max, count: sorted.length };
}

// ============================================================================
// PART 1: MULTI-TENANT ISOLATION STRESS TESTS
// ============================================================================
async function runIsolationTests() {
  console.log(`\n${COLORS.bold}${COLORS.cyan}▶ SECTION 1: Multi-Tenant Isolation & Adversarial Security Attacks${COLORS.reset}`);
  const db = initDatabase(':memory:');
  const app = createApp(db);

  async function test(name, fn) {
    const start = Date.now();
    try {
      await fn();
      const duration = Date.now() - start;
      suiteResults.isolation.push({ name, pass: true, duration });
      console.log(`  ${COLORS.green}✔ PASS${COLORS.reset} ${name} ${COLORS.dim}(${duration}ms)${COLORS.reset}`);
    } catch (err) {
      const duration = Date.now() - start;
      suiteResults.isolation.push({ name, pass: false, error: err.message, duration });
      console.log(`  ${COLORS.red}✖ FAIL${COLORS.reset} ${name} ${COLORS.dim}(${duration}ms)${COLORS.reset}`);
      console.log(`    ${COLORS.red}Error: ${err.message}${COLORS.reset}`);
    }
  }

  // Provision Tenant Alpha and Tenant Beta
  const tenantAlpha = await loginUser(app, {
    tenantSlug: 'tenant-alpha',
    email: 'admin@alpha.local',
    name: 'Admin Bengkel Alpha'
  });

  const tenantBeta = await loginUser(app, {
    tenantSlug: 'tenant-beta',
    email: 'admin@beta.local',
    name: 'Admin Bengkel Beta'
  });

  // Verify baseline tenants are separate
  assert.notEqual(tenantAlpha.tenant.id, tenantBeta.tenant.id);

  // 1.1 Tenant A session attempting to mutate Tenant B settings via x-tenant-id header
  await test('1.1: Tenant A session with forged x-tenant-id header CANNOT mutate Tenant B', async () => {
    // Session A tries to send Tenant B's ID in header to mutate settings
    await request(app)
      .put('/api/tenant/settings')
      .set('Cookie', tenantAlpha.cookie)
      .set('x-tenant-id', tenantBeta.tenant.id)
      .send({
        name: 'HACKED BENGKEL BETA',
        phoneWa: '0899-9999-9999'
      })
      .expect(200);

    // Verify Tenant Beta is UNTOUCHED
    const betaCheck = db.prepare('SELECT * FROM tenants WHERE id = ?').get(tenantBeta.tenant.id);
    assert.notEqual(betaCheck.name, 'HACKED BENGKEL BETA');
    assert.notEqual(betaCheck.phone_wa, '0899-9999-9999');

    // Verify Tenant Alpha received the update (because auth session bound to Alpha)
    const alphaCheck = db.prepare('SELECT * FROM tenants WHERE id = ?').get(tenantAlpha.tenant.id);
    assert.equal(alphaCheck.name, 'HACKED BENGKEL BETA');
    assert.equal(alphaCheck.phone_wa, '0899-9999-9999');
  });

  // 1.2 Tenant A session attempting to mutate Tenant B settings via x-tenant-slug header
  await test('1.2: Tenant A session with forged x-tenant-slug header CANNOT mutate Tenant B', async () => {
    await request(app)
      .put('/api/tenant/settings')
      .set('Cookie', tenantAlpha.cookie)
      .set('x-tenant-slug', tenantBeta.tenant.slug)
      .send({
        name: 'INTRUDER WAS HERE',
        phoneWa: '0811-1111-1111'
      })
      .expect(200);

    const betaCheck = db.prepare('SELECT * FROM tenants WHERE id = ?').get(tenantBeta.tenant.id);
    assert.notEqual(betaCheck.name, 'INTRUDER WAS HERE');
  });

  // 1.3 Tenant A session attempting to mutate Tenant B settings via query parameter ?tenantSlug=
  await test('1.3: Tenant A session with query ?tenantSlug= CANNOT mutate Tenant B', async () => {
    await request(app)
      .put(`/api/tenant/settings?tenantSlug=${tenantBeta.tenant.slug}`)
      .set('Cookie', tenantAlpha.cookie)
      .send({
        name: 'QUERY INJECTION TRY',
        address: 'Alamat Palsu 123'
      })
      .expect(200);

    const betaCheck = db.prepare('SELECT * FROM tenants WHERE id = ?').get(tenantBeta.tenant.id);
    assert.notEqual(betaCheck.address, 'Alamat Palsu 123');
  });

  // 1.4 Tenant A session attempting to read Tenant B settings via x-tenant-id header
  await test('1.4: Tenant A session attempting to read Tenant B settings returns Tenant A data only', async () => {
    const res = await request(app)
      .get('/api/tenant/settings')
      .set('Cookie', tenantAlpha.cookie)
      .set('x-tenant-id', tenantBeta.tenant.id)
      .expect(200);

    assert.equal(res.body.tenant.id, tenantAlpha.tenant.id);
    assert.notEqual(res.body.tenant.id, tenantBeta.tenant.id);
  });

  // 1.5 Tenant A attempting to hijack Tenant B's slug via PUT /api/tenant/settings
  await test('1.5: Tenant A attempting to change slug to Tenant B slug is rejected with 409 Conflict', async () => {
    const res = await request(app)
      .put('/api/tenant/settings')
      .set('Cookie', tenantAlpha.cookie)
      .send({
        slug: tenantBeta.tenant.slug
      })
      .expect(409);

    assert.equal(res.body.error, 'Slug Conflict');
  });

  // 1.6 Unauthenticated request with x-tenant-id attempting to read settings
  await test('1.6: Unauthenticated request with x-tenant-id header rejected with 401', async () => {
    const res = await request(app)
      .get('/api/tenant/settings')
      .set('x-tenant-id', tenantBeta.tenant.id)
      .expect(401);

    assert.equal(res.body.error, 'Unauthenticated');
  });

  // 1.7 Unauthenticated request with x-tenant-id attempting to mutate settings
  await test('1.7: Unauthenticated request with x-tenant-id header attempting PUT rejected with 401', async () => {
    const res = await request(app)
      .put('/api/tenant/settings')
      .set('x-tenant-id', tenantBeta.tenant.id)
      .send({ name: 'UNAUTH MUTATION' })
      .expect(401);

    assert.equal(res.body.error, 'Unauthenticated');
  });

  // 1.8 Forged non-existent session token in Cookie
  await test('1.8: Forged non-existent session token in Cookie returns 401 and clears cookie', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', 'bengkel_session=fake-session-random-hex-uuid-99999999')
      .expect(401);

    assert.equal(res.body.authenticated, false);
    const setCookie = res.headers['set-cookie'] || [];
    assert.ok(setCookie.some(c => c.includes('bengkel_session=;')), 'Must instruct client to clear cookie');
  });

  // 1.9 Forged non-existent session token in Bearer Authorization header
  await test('1.9: Forged Bearer session token in Authorization header returns 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer 0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef')
      .expect(401);

    assert.equal(res.body.authenticated, false);
  });

  // 1.10 SQL Injection attack payload in session cookie
  await test('1.10: SQL Injection payload in session cookie is safely neutralized (401)', async () => {
    const sqlInjections = [
      "' OR 1=1 --",
      "' UNION SELECT '1','2099-01-01','1','1','1','1','1','1','1','1','1','1','1','1' --",
      "'; DROP TABLE sessions; --"
    ];

    for (const sqli of sqlInjections) {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', `bengkel_session=${sqli}`)
        .expect(401);
      assert.equal(res.body.authenticated, false);
    }

    // Verify sessions table still intact
    const sessionCount = db.prepare('SELECT count(*) as count FROM sessions').get();
    assert.ok(sessionCount.count >= 2);
  });

  // 1.11 Malformed Bearer authorization headers
  await test('1.11: Malformed Authorization header variants reject safely with 401', async () => {
    const malformedHeaders = [
      'Bearer ',
      'Bearer',
      'Bearer undefined',
      'Bearer null',
      'Bearer [object Object]',
      'Basic YWRtaW46cGFzc3dvcmQ=',
      'Token abcdef12345',
      `Bearer ${'A'.repeat(4096)}`
    ];

    for (const header of malformedHeaders) {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', header)
        .expect(401);
      assert.equal(res.body.authenticated, false);
    }
  });

  // 1.12 Expired session token lifecycle
  await test('1.12: Expired session returns 401, prunes session from DB, and clears cookie', async () => {
    const expiredSessionId = 'expired-session-id-for-testing';
    const expiredDate = new Date(Date.now() - 3600 * 1000).toISOString(); // 1 hour ago

    db.prepare(`
      INSERT INTO sessions (id, user_id, tenant_id, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(expiredSessionId, tenantAlpha.user.id, tenantAlpha.tenant.id, expiredDate);

    // Verify session exists before request
    const beforeCheck = db.prepare('SELECT id FROM sessions WHERE id = ?').get(expiredSessionId);
    assert.ok(beforeCheck);

    // Request with expired session
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', `bengkel_session=${expiredSessionId}`)
      .expect(401);

    assert.equal(res.body.authenticated, false);

    // Verify session was pruned from DB
    const afterCheck = db.prepare('SELECT id FROM sessions WHERE id = ?').get(expiredSessionId);
    assert.equal(afterCheck, undefined, 'Expired session must be pruned from database');

    // Verify clear-cookie header was set
    const setCookie = res.headers['set-cookie'] || [];
    assert.ok(setCookie.some(c => c.includes('bengkel_session=;')), 'Must clear expired cookie');
  });

  // 1.13 Concurrent mock logins across 10 distinct tenant slugs (50 parallel requests)
  await test('1.13: 50 concurrent mock logins across 10 distinct tenant slugs execute cleanly', async () => {
    const slugs = Array.from({ length: 10 }, (_, i) => `concurrent-tenant-${i + 1}`);
    const requests = [];

    for (let i = 0; i < 50; i++) {
      const targetSlug = slugs[i % slugs.length];
      const email = `operator-${i}@${targetSlug}.local`;
      requests.push(
        request(app)
          .post('/api/auth/mock-login')
          .send({ tenantSlug: targetSlug, email, name: `Operator ${i}` })
      );
    }

    const responses = await Promise.all(requests);
    assert.equal(responses.length, 50);

    for (let i = 0; i < 50; i++) {
      const res = responses[i];
      assert.equal(res.status, 200, `Request ${i} must succeed with 200`);
      assert.ok(res.body.sessionId, 'Must return sessionId');
      assert.ok(res.body.user.id, 'Must return user');
      assert.ok(res.body.tenant.id, 'Must return tenant');
      const expectedSlug = slugs[i % slugs.length];
      assert.equal(res.body.tenant.slug, expectedSlug);
    }

    // Verify all 10 tenants were registered in DB
    const dbTenants = db.prepare(`SELECT count(*) as count FROM tenants WHERE slug LIKE 'concurrent-tenant-%'`).get();
    assert.equal(dbTenants.count, 10);
  });

  // 1.14 Concurrent simultaneous mock login targeting the exact same new slug
  await test('1.14: 20 simultaneous logins for the EXACT SAME new slug execute without crash', async () => {
    const raceSlug = 'race-condition-tenant';
    const requests = Array.from({ length: 20 }, (_, i) => 
      request(app)
        .post('/api/auth/mock-login')
        .send({
          tenantSlug: raceSlug,
          email: `race-${i}@race.local`,
          name: `Racer ${i}`
        })
    );

    const responses = await Promise.all(requests);
    for (const res of responses) {
      assert.equal(res.status, 200);
      assert.equal(res.body.tenant.slug, raceSlug);
    }

    // Verify exactly ONE tenant record was created
    const tenantRecords = db.prepare('SELECT count(*) as count FROM tenants WHERE slug = ?').get(raceSlug);
    assert.equal(tenantRecords.count, 1);
  });

  // 1.15 PUT /api/tenant/settings with negative monthly revenue target rejected
  await test('1.15: PUT /api/tenant/settings with negative monthlyRevenueTarget rejected with 400', async () => {
    await withSilencedConsole(async () => {
      const res = await request(app)
        .put('/api/tenant/settings')
        .set('Cookie', tenantAlpha.cookie)
        .send({ monthlyRevenueTarget: -50000 })
        .expect(400);

      assert.equal(res.body.error, 'Validation Error');
    });
  });

  // 1.16 PUT /api/tenant/settings with short phone number rejected
  await test('1.16: PUT /api/tenant/settings with invalid phone (< 8 chars) rejected with 400', async () => {
    await withSilencedConsole(async () => {
      const res = await request(app)
        .put('/api/tenant/settings')
        .set('Cookie', tenantAlpha.cookie)
        .send({ phoneWa: '123' })
        .expect(400);

      assert.equal(res.body.error, 'Validation Error');
    });
  });

  // 1.17 Cookie takes precedence over Authorization header
  await test('1.17: Cookie session takes precedence over conflicting Bearer header', async () => {
    // Cookie is Alpha, Bearer is Beta
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', tenantAlpha.cookie)
      .set('Authorization', `Bearer ${tenantBeta.sessionId}`)
      .expect(200);

    assert.equal(res.body.tenant.slug, tenantAlpha.tenant.slug);
    assert.notEqual(res.body.tenant.slug, tenantBeta.tenant.slug);
  });

  // 1.18 Malicious slug format rejected
  await test('1.18: PUT /api/tenant/settings with path-traversal or spaces in slug rejected with 400', async () => {
    await withSilencedConsole(async () => {
      const res = await request(app)
        .put('/api/tenant/settings')
        .set('Cookie', tenantAlpha.cookie)
        .send({ slug: '../evil/slug' })
        .expect(400);

      assert.equal(res.body.error, 'Validation Error');
    });
  });

  db.close();
}

// ============================================================================
// PART 2: SQLITE DATABASE CONSTRAINTS VERIFICATION
// ============================================================================
async function runConstraintTests() {
  console.log(`\n${COLORS.bold}${COLORS.cyan}▶ SECTION 2: SQLite Relational Database Constraints & Invariants${COLORS.reset}`);
  const db = initDatabase(':memory:');

  function test(name, fn) {
    const start = Date.now();
    try {
      fn();
      const duration = Date.now() - start;
      suiteResults.constraints.push({ name, pass: true, duration });
      console.log(`  ${COLORS.green}✔ PASS${COLORS.reset} ${name} ${COLORS.dim}(${duration}ms)${COLORS.reset}`);
    } catch (err) {
      const duration = Date.now() - start;
      suiteResults.constraints.push({ name, pass: false, error: err.message, duration });
      console.log(`  ${COLORS.red}✖ FAIL${COLORS.reset} ${name} ${COLORS.dim}(${duration}ms)${COLORS.reset}`);
      console.log(`    ${COLORS.red}Error: ${err.message}${COLORS.reset}`);
    }
  }

  // 2.1 Foreign Key Enforcement
  test('2.1a: FK Enforced: inserting user with non-existent tenant_id throws FOREIGN KEY error', () => {
    assert.throws(() => {
      db.prepare(`
        INSERT INTO users (id, tenant_id, email, name, role)
        VALUES ('user-orphan', 'non-existent-tenant-uuid', 'orphan@test.local', 'Orphan User', 'operator')
      `).run();
    }, /FOREIGN KEY constraint failed/);
  });

  test('2.1b: FK Enforced: inserting sparepart with non-existent tenant_id throws FOREIGN KEY error', () => {
    assert.throws(() => {
      db.prepare(`
        INSERT INTO spareparts (id, tenant_id, sku, name, category)
        VALUES ('part-orphan', 'non-existent-tenant-uuid', 'SKU-001', 'Oli Shell', 'Oli')
      `).run();
    }, /FOREIGN KEY constraint failed/);
  });

  test('2.1c: FK Enforced: inserting session with non-existent user_id throws FOREIGN KEY error', () => {
    const tenant = db.prepare('SELECT id FROM tenants LIMIT 1').get();
    assert.throws(() => {
      db.prepare(`
        INSERT INTO sessions (id, user_id, tenant_id, expires_at)
        VALUES ('sess-orphan', 'non-existent-user-uuid', ?, '2099-01-01')
      `).run(tenant.id);
    }, /FOREIGN KEY constraint failed/);
  });

  test('2.1d: FK Enforced: inserting stock_movement with non-existent sparepart_id throws FOREIGN KEY error', () => {
    const tenant = db.prepare('SELECT id FROM tenants LIMIT 1').get();
    assert.throws(() => {
      db.prepare(`
        INSERT INTO stock_movements (id, tenant_id, sparepart_id, type, quantity, date)
        VALUES ('mov-orphan', ?, 'non-existent-sparepart-uuid', 'IN', 10, '2026-10-04')
      `).run(tenant.id);
    }, /FOREIGN KEY constraint failed/);
  });

  test('2.1e: FK Enforced: inserting transaction with non-existent category_id throws FOREIGN KEY error', () => {
    const tenant = db.prepare('SELECT id FROM tenants LIMIT 1').get();
    assert.throws(() => {
      db.prepare(`
        INSERT INTO transactions (id, tenant_id, category_id, type, amount, date, description, payment_method)
        VALUES ('tx-orphan', ?, 'non-existent-cat-uuid', 'INCOME', 50000, '2026-10-04', 'Uang Servis', 'CASH')
      `).run(tenant.id);
    }, /FOREIGN KEY constraint failed/);
  });

  // 2.2 Unique Constraints
  test('2.2a: UNIQUE Enforced: duplicate tenant slug throws UNIQUE error', () => {
    assert.throws(() => {
      db.prepare(`
        INSERT INTO tenants (id, slug, name, address, phone_wa)
        VALUES ('t-dup', 'bengkel-gps-motor', 'Bengkel Kembar', 'Alamat', '08123')
      `).run();
    }, /UNIQUE constraint failed/);
  });

  test('2.2b: UNIQUE Enforced: duplicate (tenant_id, email) throws UNIQUE error', () => {
    const tenant = db.prepare('SELECT id FROM tenants LIMIT 1').get();
    assert.throws(() => {
      db.prepare(`
        INSERT INTO users (id, tenant_id, email, name, role)
        VALUES ('u-dup', ?, 'admin@gpsmotor.local', 'Bambang Clone', 'operator')
      `).run(tenant.id);
    }, /UNIQUE constraint failed/);
  });

  test('2.2c: Multi-tenant scope: same email in DIFFERENT tenants succeeds', () => {
    const newTenantId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO tenants (id, slug, name, address, phone_wa)
      VALUES (?, 'second-workshop', 'Bengkel Kedua', 'Kediri', '081234')
    `).run(newTenantId);

    // Same email 'admin@gpsmotor.local' in second-workshop
    const secondUserId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO users (id, tenant_id, email, name, role)
      VALUES (?, ?, 'admin@gpsmotor.local', 'Bambang Cross Tenant', 'operator')
    `).run(secondUserId, newTenantId);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(secondUserId);
    assert.equal(user.email, 'admin@gpsmotor.local');
    assert.equal(user.tenant_id, newTenantId);
  });

  test('2.2d: UNIQUE Enforced: duplicate (tenant_id, sku) throws UNIQUE error', () => {
    const defaultTenant = db.prepare('SELECT id FROM tenants WHERE slug = ?').get('bengkel-gps-motor');
    db.prepare(`
      INSERT INTO spareparts (id, tenant_id, sku, name, category)
      VALUES ('part-1', ?, 'SKU-UNIQUE-TEST', 'Busi Denso', 'Busi')
    `).run(defaultTenant.id);

    assert.throws(() => {
      db.prepare(`
        INSERT INTO spareparts (id, tenant_id, sku, name, category)
        VALUES ('part-2', ?, 'SKU-UNIQUE-TEST', 'Busi NGK', 'Busi')
      `).run(defaultTenant.id);
    }, /UNIQUE constraint failed/);
  });

  test('2.2e: Multi-tenant scope: same SKU in DIFFERENT tenants succeeds', () => {
    const secondTenant = db.prepare('SELECT id FROM tenants WHERE slug = ?').get('second-workshop');
    db.prepare(`
      INSERT INTO spareparts (id, tenant_id, sku, name, category)
      VALUES ('part-second', ?, 'SKU-UNIQUE-TEST', 'Busi Denso Other', 'Busi')
    `).run(secondTenant.id);

    const p = db.prepare('SELECT * FROM spareparts WHERE id = ?').get('part-second');
    assert.equal(p.sku, 'SKU-UNIQUE-TEST');
  });

  test('2.2f: UNIQUE Enforced: duplicate repair_orders tracking_token throws UNIQUE error globally', () => {
    const tenant = db.prepare('SELECT id FROM tenants LIMIT 1').get();
    const secondTenant = db.prepare('SELECT id FROM tenants WHERE slug = ?').get('second-workshop');

    db.prepare(`
      INSERT INTO repair_orders (id, tenant_id, ro_number, tracking_token, plate_number, customer_name, customer_phone, car_brand, car_model, entry_date, complaint, mechanic_name, status)
      VALUES ('ro-1', ?, 'RO-001', 'TRACK-GLOBAL-TOKEN-123', 'AG 1234 XX', 'Pak Slamet', '081234', 'Toyota', 'Avanza', '2026-10-04', 'Ganti Oli', 'Agus', 'MASUK')
    `).run(tenant.id);

    // Attempting same tracking token in second tenant
    assert.throws(() => {
      db.prepare(`
        INSERT INTO repair_orders (id, tenant_id, ro_number, tracking_token, plate_number, customer_name, customer_phone, car_brand, car_model, entry_date, complaint, mechanic_name, status)
        VALUES ('ro-2', ?, 'RO-002', 'TRACK-GLOBAL-TOKEN-123', 'AG 5678 YY', 'Bu Siti', '081235', 'Honda', 'Brio', '2026-10-04', 'Rem Bunyi', 'Budi', 'MASUK')
      `).run(secondTenant.id);
    }, /UNIQUE constraint failed/);
  });

  test('2.2g: UNIQUE Enforced: duplicate transaction_categories (tenant_id, name, type) throws, multi-tenant succeeds', () => {
    const defaultTenant = db.prepare('SELECT id FROM tenants WHERE slug = ?').get('bengkel-gps-motor');
    const secondTenant = db.prepare('SELECT id FROM tenants WHERE slug = ?').get('second-workshop');

    // Duplicate under same tenant throws
    assert.throws(() => {
      db.prepare(`
        INSERT INTO transaction_categories (id, tenant_id, name, type)
        VALUES ('cat-dup', ?, 'Jasa Servis', 'INCOME')
      `).run(defaultTenant.id);
    }, /UNIQUE constraint failed/);

    // Same category name under second tenant succeeds
    db.prepare(`
      INSERT INTO transaction_categories (id, tenant_id, name, type)
      VALUES ('cat-second-tenant', ?, 'Jasa Servis', 'INCOME')
    `).run(secondTenant.id);

    const c = db.prepare('SELECT * FROM transaction_categories WHERE id = ?').get('cat-second-tenant');
    assert.equal(c.name, 'Jasa Servis');
  });

  test('2.2h: UNIQUE Enforced: duplicate repair_orders (tenant_id, ro_number) throws, multi-tenant succeeds', () => {
    const defaultTenant = db.prepare('SELECT id FROM tenants WHERE slug = ?').get('bengkel-gps-motor');
    const secondTenant = db.prepare('SELECT id FROM tenants WHERE slug = ?').get('second-workshop');

    // Duplicate ro_number under same tenant throws (RO-202610-001 already exists in defaultTenant)
    assert.throws(() => {
      db.prepare(`
        INSERT INTO repair_orders (id, tenant_id, ro_number, tracking_token, plate_number, customer_name, customer_phone, car_brand, car_model, entry_date, complaint, mechanic_name, status)
        VALUES ('ro-dup-num', ?, 'RO-202610-001', 'TRACK-UNIQUE-DIFF-TOKEN-1', 'AG 9999 XX', 'Pak Slamet', '081234', 'Toyota', 'Avanza', '2026-10-04', 'Ganti Oli', 'Agus', 'MASUK')
      `).run(defaultTenant.id);
    }, /UNIQUE constraint failed/);

    // Same ro_number under second tenant succeeds
    db.prepare(`
      INSERT INTO repair_orders (id, tenant_id, ro_number, tracking_token, plate_number, customer_name, customer_phone, car_brand, car_model, entry_date, complaint, mechanic_name, status)
      VALUES ('ro-second-num', ?, 'RO-202610-001', 'TRACK-UNIQUE-DIFF-TOKEN-2', 'AG 8888 YY', 'Bu Ani', '081299', 'Honda', 'Mobilio', '2026-10-04', 'Ganti Kampas', 'Budi', 'MASUK')
    `).run(secondTenant.id);

    const ro = db.prepare('SELECT * FROM repair_orders WHERE id = ?').get('ro-second-num');
    assert.equal(ro.ro_number, 'RO-202610-001');
  });

  // 2.3 Cascading Deletion (ON DELETE CASCADE)
  test('2.3: ON DELETE CASCADE: deleting tenant removes all users, sessions, settings, customers, parts, ROs', () => {
    const testTenantId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO tenants (id, slug, name, address, phone_wa)
      VALUES (?, 'cascade-test-tenant', 'Bengkel Cascade', 'Kediri', '081999')
    `).run(testTenantId);

    const userId = crypto.randomUUID();
    db.prepare(`INSERT INTO users (id, tenant_id, email, name) VALUES (?, ?, 'cascade@test.local', 'Cascade User')`).run(userId, testTenantId);
    db.prepare(`INSERT INTO sessions (id, user_id, tenant_id, expires_at) VALUES ('sess-casc', ?, ?, '2099-01-01')`).run(userId, testTenantId);
    db.prepare(`INSERT INTO tenant_settings (tenant_id) VALUES (?)`).run(testTenantId);
    db.prepare(`INSERT INTO customers (id, tenant_id, name, phone) VALUES ('cust-casc', ?, 'Cust Casc', '0812')`).run(testTenantId);
    db.prepare(`INSERT INTO spareparts (id, tenant_id, sku, name, category) VALUES ('part-casc', ?, 'SKU-CASC', 'Part Casc', 'Oli')`).run(testTenantId);
    db.prepare(`
      INSERT INTO repair_orders (id, tenant_id, ro_number, tracking_token, plate_number, customer_name, customer_phone, car_brand, car_model, entry_date, complaint, mechanic_name, status)
      VALUES ('ro-casc', ?, 'RO-CASC', 'TOKEN-CASC-999', 'AG 9999 CC', 'Cust Casc', '0812', 'Daihatsu', 'Xenia', '2026-10-04', 'Tune Up', 'Agus', 'MASUK')
    `).run(testTenantId);
    db.prepare(`
      INSERT INTO ro_status_logs (id, tenant_id, repair_order_id, new_status, actor_name)
      VALUES ('log-casc', ?, 'ro-casc', 'MASUK', 'Agus')
    `).run(testTenantId);

    // Verify all records exist
    assert.ok(db.prepare('SELECT id FROM users WHERE id = ?').get(userId));
    assert.ok(db.prepare('SELECT id FROM sessions WHERE id = ?').get('sess-casc'));
    assert.ok(db.prepare('SELECT tenant_id FROM tenant_settings WHERE tenant_id = ?').get(testTenantId));
    assert.ok(db.prepare('SELECT id FROM customers WHERE id = ?').get('cust-casc'));
    assert.ok(db.prepare('SELECT id FROM spareparts WHERE id = ?').get('part-casc'));
    assert.ok(db.prepare('SELECT id FROM repair_orders WHERE id = ?').get('ro-casc'));
    assert.ok(db.prepare('SELECT id FROM ro_status_logs WHERE id = ?').get('log-casc'));

    // NOW DELETE TENANT
    db.prepare('DELETE FROM tenants WHERE id = ?').run(testTenantId);

    // Verify EVERYTHING was cascaded!
    assert.equal(db.prepare('SELECT id FROM users WHERE id = ?').get(userId), undefined);
    assert.equal(db.prepare('SELECT id FROM sessions WHERE id = ?').get('sess-casc'), undefined);
    assert.equal(db.prepare('SELECT tenant_id FROM tenant_settings WHERE tenant_id = ?').get(testTenantId), undefined);
    assert.equal(db.prepare('SELECT id FROM customers WHERE id = ?').get('cust-casc'), undefined);
    assert.equal(db.prepare('SELECT id FROM spareparts WHERE id = ?').get('part-casc'), undefined);
    assert.equal(db.prepare('SELECT id FROM repair_orders WHERE id = ?').get('ro-casc'), undefined);
    assert.equal(db.prepare('SELECT id FROM ro_status_logs WHERE id = ?').get('log-casc'), undefined);
  });

  // 2.4 Set Null Deletes (ON DELETE SET NULL)
  test('2.4: ON DELETE SET NULL: deleting customer sets vehicles.customer_id & repair_orders.customer_id to NULL', () => {
    const tenant = db.prepare('SELECT id FROM tenants LIMIT 1').get();
    const custId = 'cust-set-null-test';
    db.prepare(`INSERT INTO customers (id, tenant_id, name, phone) VALUES (?, ?, 'Bpk Kusno', '0812345678')`).run(custId, tenant.id);

    const vehId = 'veh-set-null-test';
    db.prepare(`
      INSERT INTO vehicles (id, tenant_id, customer_id, plate_number, brand, model)
      VALUES (?, ?, ?, 'AG 7777 ZZ', 'Toyota', 'Kijang Innova')
    `).run(vehId, tenant.id, custId);

    const roId = 'ro-set-null-test';
    db.prepare(`
      INSERT INTO repair_orders (id, tenant_id, customer_id, ro_number, tracking_token, plate_number, customer_name, customer_phone, car_brand, car_model, entry_date, complaint, mechanic_name, status)
      VALUES (?, ?, ?, 'RO-NULL-01', 'TOKEN-NULL-001', 'AG 7777 ZZ', 'Bpk Kusno', '0812345678', 'Toyota', 'Innova', '2026-10-04', 'Servis', 'Budi', 'MASUK')
    `).run(roId, tenant.id, custId);

    // Verify links exist
    assert.equal(db.prepare('SELECT customer_id FROM vehicles WHERE id = ?').get(vehId).customer_id, custId);
    assert.equal(db.prepare('SELECT customer_id FROM repair_orders WHERE id = ?').get(roId).customer_id, custId);

    // Delete customer
    db.prepare('DELETE FROM customers WHERE id = ?').run(custId);

    // Verify vehicle still exists with customer_id = NULL
    const vehAfter = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(vehId);
    assert.ok(vehAfter);
    assert.equal(vehAfter.customer_id, null);

    // Verify repair_order still exists with customer_id = NULL
    const roAfter = db.prepare('SELECT * FROM repair_orders WHERE id = ?').get(roId);
    assert.ok(roAfter);
    assert.equal(roAfter.customer_id, null);
  });

  // 2.5 Restrict Deletes (ON DELETE RESTRICT)
  test('2.5a: ON DELETE RESTRICT: deleting sparepart with stock_movements throws RESTRICT error', () => {
    const tenant = db.prepare('SELECT id FROM tenants LIMIT 1').get();
    const partId = 'part-restricted-mov';
    db.prepare(`INSERT INTO spareparts (id, tenant_id, sku, name, category) VALUES (?, ?, 'SKU-RESTRICT-1', 'Kampas Rem', 'Rem')`).run(partId, tenant.id);
    db.prepare(`
      INSERT INTO stock_movements (id, tenant_id, sparepart_id, type, quantity, date)
      VALUES ('mov-restrict-1', ?, ?, 'IN', 10, '2026-10-04')
    `).run(tenant.id, partId);

    // Attempt delete
    assert.throws(() => {
      db.prepare('DELETE FROM spareparts WHERE id = ?').run(partId);
    }, /FOREIGN KEY constraint failed/);
  });

  test('2.5b: ON DELETE RESTRICT: deleting sparepart with ro_spareparts throws RESTRICT error', () => {
    const tenant = db.prepare('SELECT id FROM tenants LIMIT 1').get();
    const partId = 'part-restricted-ro';
    db.prepare(`INSERT INTO spareparts (id, tenant_id, sku, name, category) VALUES (?, ?, 'SKU-RESTRICT-2', 'Filter Oli', 'Filter')`).run(partId, tenant.id);

    const ro = db.prepare('SELECT id FROM repair_orders LIMIT 1').get();
    db.prepare(`
      INSERT INTO ro_spareparts (id, tenant_id, repair_order_id, sparepart_id, item_name, quantity, unit_price, subtotal)
      VALUES ('ro-part-1', ?, ?, ?, 'Filter Oli', 1, 45000, 45000)
    `).run(tenant.id, ro.id, partId);

    assert.throws(() => {
      db.prepare('DELETE FROM spareparts WHERE id = ?').run(partId);
    }, /FOREIGN KEY constraint failed/);
  });

  test('2.5c: ON DELETE RESTRICT: deleting transaction_category with transactions throws RESTRICT error', () => {
    const tenant = db.prepare('SELECT id FROM tenants LIMIT 1').get();
    const catId = 'cat-restricted-tx';
    db.prepare(`INSERT INTO transaction_categories (id, tenant_id, name, type) VALUES (?, ?, 'Kategori Khusus', 'INCOME')`).run(catId, tenant.id);
    db.prepare(`
      INSERT INTO transactions (id, tenant_id, category_id, type, amount, date, description, payment_method)
      VALUES ('tx-restrict-1', ?, ?, 'INCOME', 100000, '2026-10-04', 'Servis Besar', 'CASH')
    `).run(tenant.id, catId);

    assert.throws(() => {
      db.prepare('DELETE FROM transaction_categories WHERE id = ?').run(catId);
    }, /FOREIGN KEY constraint failed/);
  });

  // 2.6 CHECK Constraints
  test('2.6a: CHECK Enforced: invalid stock_movements type rejected', () => {
    const tenant = db.prepare('SELECT id FROM tenants LIMIT 1').get();
    const part = db.prepare('SELECT id FROM spareparts LIMIT 1').get();
    assert.throws(() => {
      db.prepare(`
        INSERT INTO stock_movements (id, tenant_id, sparepart_id, type, quantity, date)
        VALUES ('mov-chk', ?, ?, 'DESTROYED', 5, '2026-10-04')
      `).run(tenant.id, part.id);
    }, /CHECK constraint failed/);
  });

  test('2.6b: CHECK Enforced: invalid transactions payment_method rejected', () => {
    const tenant = db.prepare('SELECT id FROM tenants LIMIT 1').get();
    const cat = db.prepare('SELECT id FROM transaction_categories LIMIT 1').get();
    assert.throws(() => {
      db.prepare(`
        INSERT INTO transactions (id, tenant_id, category_id, type, amount, date, description, payment_method)
        VALUES ('tx-chk', ?, ?, 'INCOME', 50000, '2026-10-04', 'Uang Servis', 'PAYPAL')
      `).run(tenant.id, cat.id);
    }, /CHECK constraint failed/);
  });

  test('2.6c: CHECK Enforced: invalid repair_orders status rejected', () => {
    const tenant = db.prepare('SELECT id FROM tenants LIMIT 1').get();
    assert.throws(() => {
      db.prepare(`
        INSERT INTO repair_orders (id, tenant_id, ro_number, tracking_token, plate_number, customer_name, customer_phone, car_brand, car_model, entry_date, complaint, mechanic_name, status)
        VALUES ('ro-chk', ?, 'RO-BAD-STAT', 'TOKEN-BAD-STAT', 'AG 1111 XX', 'Pak Joko', '0812', 'Honda', 'Jazz', '2026-10-04', 'Rem', 'Agus', 'CANCELLED')
      `).run(tenant.id);
    }, /CHECK constraint failed/);
  });

  test('2.6d: CHECK Enforced: invalid ro_photos stage rejected', () => {
    const tenant = db.prepare('SELECT id FROM tenants LIMIT 1').get();
    const ro = db.prepare('SELECT id FROM repair_orders LIMIT 1').get();
    assert.throws(() => {
      db.prepare(`
        INSERT INTO ro_photos (id, tenant_id, repair_order_id, photo_url, stage)
        VALUES ('photo-chk', ?, ?, '/uploads/photo.jpg', 'DURING')
      `).run(tenant.id, ro.id);
    }, /CHECK constraint failed/);
  });

  db.close();
}

// ============================================================================
// PART 3: LATENCY BENCHMARK (<50ms target) & MEMORY PROFILING
// ============================================================================
async function runPerformanceBenchmarks() {
  console.log(`\n${COLORS.bold}${COLORS.cyan}▶ SECTION 3: Performance Latency Benchmarks (<50ms) & Memory Profiling${COLORS.reset}`);
  const db = initDatabase(':memory:');
  const app = createApp(db);

  // Initial Memory Usage
  if (global.gc) global.gc();
  const memBefore = process.memoryUsage();
  suiteResults.performance.memory.before = memBefore;

  // Login session
  const auth = await loginUser(app, {
    tenantSlug: 'bengkel-gps-motor',
    email: 'admin@gpsmotor.local',
    name: 'Bambang GPS Motor'
  });

  // Benchmark function
  async function benchmarkEndpoint(label, count, fn) {
    const timings = [];
    // Warm-up 5 iterations
    for (let i = 0; i < 5; i++) {
      await fn();
    }
    // Measured iterations
    for (let i = 0; i < count; i++) {
      const t0 = performance.now();
      await fn();
      const t1 = performance.now();
      timings.push(t1 - t0);
    }
    const stats = computePercentiles(timings);
    suiteResults.performance.latencies[label] = stats;

    const underTarget = stats.p95 < 50;
    const statusCol = underTarget ? COLORS.green : COLORS.red;
    const checkIcon = underTarget ? '✔' : '✖';

    console.log(`  ${statusCol}${checkIcon}${COLORS.reset} ${COLORS.bold}${label}${COLORS.reset} (N=${count})`);
    console.log(`    Mean: ${formatMs(stats.mean)} | Median (p50): ${formatMs(stats.p50)} | P95: ${formatMs(stats.p95)} | P99: ${formatMs(stats.p99)} | Max: ${formatMs(stats.max)}`);
    return stats;
  }

  // 3.1 GET /api/health
  await benchmarkEndpoint('GET /api/health', 100, async () => {
    await request(app).get('/api/health').expect(200);
  });

  // 3.2 POST /api/auth/mock-login
  await benchmarkEndpoint('POST /api/auth/mock-login', 100, async () => {
    await request(app)
      .post('/api/auth/mock-login')
      .send({ tenantSlug: 'bengkel-gps-motor', email: 'admin@gpsmotor.local' })
      .expect(200);
  });

  // 3.3 GET /api/auth/me
  await benchmarkEndpoint('GET /api/auth/me', 100, async () => {
    await request(app)
      .get('/api/auth/me')
      .set('Cookie', auth.cookie)
      .expect(200);
  });

  // 3.4 GET /api/tenant/settings
  await benchmarkEndpoint('GET /api/tenant/settings', 100, async () => {
    await request(app)
      .get('/api/tenant/settings')
      .set('Cookie', auth.cookie)
      .expect(200);
  });

  // 3.5 PUT /api/tenant/settings
  let putCounter = 0;
  await benchmarkEndpoint('PUT /api/tenant/settings', 100, async () => {
    putCounter++;
    await request(app)
      .put('/api/tenant/settings')
      .set('Cookie', auth.cookie)
      .send({
        monthlyRevenueTarget: 15000000 + putCounter * 1000,
        invoiceFooter: `Footer update iteration #${putCounter}`
      })
      .expect(200);
  });

  // 3.6 POST /api/auth/logout
  await benchmarkEndpoint('POST /api/auth/logout', 50, async () => {
    const freshLogin = await loginUser(app, { tenantSlug: 'bengkel-gps-motor' });
    await request(app)
      .post('/api/auth/logout')
      .set('Cookie', freshLogin.cookie)
      .expect(200);
  });

  // Memory Usage After Test Suite
  const memAfter = process.memoryUsage();
  suiteResults.performance.memory.after = memAfter;
  const heapDiffMb = (memAfter.heapUsed - memBefore.heapUsed) / (1024 * 1024);
  const rssMb = memAfter.rss / (1024 * 1024);

  console.log(`\n  ${COLORS.bold}Memory Usage Summary:${COLORS.reset}`);
  console.log(`    RSS:          ${rssMb.toFixed(2)} MB`);
  console.log(`    Heap Used:    ${(memAfter.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`    Heap Delta:   ${heapDiffMb >= 0 ? '+' : ''}${heapDiffMb.toFixed(2)} MB (over ~650 requests)`);

  db.close();
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================
async function main() {
  console.log(`\n${COLORS.bold}================================================================${COLORS.reset}`);
  console.log(`${COLORS.bold}   CHALLENGER_M1: Adversarial Verification & Stress Test Suite  ${COLORS.reset}`);
  console.log(`${COLORS.bold}================================================================${COLORS.reset}`);

  const startTotal = Date.now();
  await runIsolationTests();
  runConstraintTests();
  await runPerformanceBenchmarks();
  const totalDuration = ((Date.now() - startTotal) / 1000).toFixed(2);

  // Summarize
  const isolationPassed = suiteResults.isolation.filter(r => r.pass).length;
  const isolationFailed = suiteResults.isolation.filter(r => !r.pass).length;
  const constraintsPassed = suiteResults.constraints.filter(r => r.pass).length;
  const constraintsFailed = suiteResults.constraints.filter(r => !r.pass).length;

  console.log(`\n${COLORS.bold}----------------------------------------------------------------${COLORS.reset}`);
  console.log(`${COLORS.bold}  Adversarial Challenge Summary Report:${COLORS.reset}`);
  console.log(`  Section 1 (Isolation & Security):    ${isolationPassed} Passed, ${isolationFailed} Failed`);
  console.log(`  Section 2 (Constraints & Cascades):   ${constraintsPassed} Passed, ${constraintsFailed} Failed`);
  console.log(`  Section 3 (Latency & Performance):   All targets tested`);
  console.log(`  Total Suite Execution Time:          ${totalDuration}s`);
  console.log(`${COLORS.bold}----------------------------------------------------------------${COLORS.reset}\n`);

  if (isolationFailed > 0 || constraintsFailed > 0) {
    console.error(`${COLORS.red}${COLORS.bold}VERDICT: REQUEST_CHANGES (Failures detected)${COLORS.reset}\n`);
    process.exit(1);
  }

  // Check latency targets: all auth & settings endpoints must have p95 < 50ms
  const latencies = suiteResults.performance.latencies;
  let allUnder50ms = true;
  for (const [endpoint, stats] of Object.entries(latencies)) {
    if (stats.p95 >= 50) {
      console.warn(`${COLORS.yellow}WARNING: Endpoint ${endpoint} p95 (${stats.p95.toFixed(2)}ms) >= 50ms${COLORS.reset}`);
      allUnder50ms = false;
    }
  }

  if (!allUnder50ms) {
    console.error(`${COLORS.yellow}${COLORS.bold}VERDICT: REQUEST_CHANGES (Latency target exceeded)${COLORS.reset}\n`);
    process.exit(1);
  }

  console.log(`${COLORS.green}${COLORS.bold}VERDICT: APPROVE (All adversarial challenges, constraints, and latency targets passed)${COLORS.reset}\n`);
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal Test Runner Exception:', err);
  process.exit(1);
});
