#!/usr/bin/env node
/**
 * Audit & Regression Verification Test Suite
 * Bengkel Mobil GPS Motor Kediri
 *
 * Verifies:
 * 1. Google OAuth auth URL generation and callback handling
 * 2. SQLite portable sparepart attachment & detachment (no DELETE LIMIT dependence)
 * 3. Public tracking WhatsApp & share links with absolute URL formatting
 * 4. Multi-tenant isolation integrity after audit improvements
 */

import assert from 'node:assert/strict';
import request from 'supertest';
import { createTestApp, loginUser } from '../supertestHelper.js';

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m'
};

const results = [];

async function test(name, fn) {
  const start = Date.now();
  try {
    await fn();
    const duration = Date.now() - start;
    results.push({ name, pass: true, duration });
    console.log(`  ${COLORS.green}✔ PASS${COLORS.reset} ${name} ${COLORS.dim}(${duration}ms)${COLORS.reset}`);
  } catch (err) {
    const duration = Date.now() - start;
    results.push({ name, pass: false, duration, error: err.message || String(err) });
    console.log(`  ${COLORS.red}✖ FAIL${COLORS.reset} ${name} ${COLORS.dim}(${duration}ms)${COLORS.reset}`);
    console.log(`    ${COLORS.yellow}↳ ${err.message}${COLORS.reset}`);
  }
}

async function run() {
  console.log(`\n${COLORS.bold}${COLORS.cyan}================================================================${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.cyan}  Audit Verification Suite: OAuth, Portable SQLite & Tracking  ${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.cyan}================================================================${COLORS.reset}\n`);

  const { app, db, cleanup } = createTestApp();

  try {
    // -------------------------------------------------------------------------
    // 1. Google OAuth Flow
    // -------------------------------------------------------------------------
    await test('AUDIT-1.1: GET /api/auth/google/url returns properly constructed Google OAuth URL', async () => {
      const res = await request(app)
        .get('/api/auth/google/url')
        .expect(200);

      assert.equal(res.body.success, true);
      assert.ok(typeof res.body.url === 'string');
      assert.ok(res.body.url.startsWith('https://accounts.google.com/o/oauth2/v2/auth'));
      assert.ok(res.body.url.includes('response_type=code'));
      assert.ok(res.body.url.includes('scope=openid+profile+email') || res.body.url.includes('scope=openid%20profile%20email'));
    });

    await test('AUDIT-1.2: GET /api/auth/google/callback handles user denial gracefully', async () => {
      const res = await request(app)
        .get('/api/auth/google/callback?error=access_denied')
        .expect(302);

      assert.ok(res.headers.location.includes('/admin?error=google_auth_failed'));
    });

    await test('AUDIT-1.3: GET /api/auth/google/callback without configured client falls back to demo mode gracefully', async () => {
      const res = await request(app)
        .get('/api/auth/google/callback?code=mock_test_code_123')
        .expect(302);

      // In dev fallback mode, redirects to /admin or /admin?error=... without crashing
      assert.ok(res.headers.location.startsWith('/admin'));
    });

    // -------------------------------------------------------------------------
    // 2. Portable SQLite Sparepart Detachment
    // -------------------------------------------------------------------------
    const authTenant = await loginUser(app, { tenantSlug: 'tenant-audit-bengkel', email: 'audit-owner@gps.com' });

    let sparepartId;
    let roId;
    let roPartId;

    await test('AUDIT-2.1: Create sparepart item with initial stock = 15', async () => {
      const res = await request(app)
        .post('/api/inventory')
        .set('Cookie', authTenant.cookie)
        .send({
          sku: 'AUDIT-FILTER-01',
          name: 'Oil Filter Denso DX-10',
          category: 'Filter',
          unit: 'pcs',
          stock: 15,
          min_stock: 3,
          harga_beli: 30000,
          harga_jual: 50000
        })
        .expect(201);

      assert.equal(res.body.success, true);
      assert.equal(res.body.item.stock, 15);
      sparepartId = res.body.item.id;
    });

    await test('AUDIT-2.2: Create repair order (RO)', async () => {
      const res = await request(app)
        .post('/api/repair-orders')
        .set('Cookie', authTenant.cookie)
        .send({
          plate_number: 'AG 9988 ZZ',
          customer_name: 'Pak Audit Santoso',
          customer_phone: '08123456789',
          car_brand: 'Honda',
          car_model: 'Jazz RS',
          car_year: 2018,
          complaints: 'Ganti filter oli rutin'
        })
        .expect(201);

      assert.equal(res.body.success, true);
      roId = res.body.repairOrder.id;
    });

    await test('AUDIT-2.3: Attach 4 units of sparepart to RO -> stock decreases to 11', async () => {
      const res = await request(app)
        .post(`/api/repair-orders/${roId}/parts`)
        .set('Cookie', authTenant.cookie)
        .send({
          sparepart_id: sparepartId,
          quantity: 4,
          unit_price: 50000
        })
        .expect(201);

      assert.equal(res.body.success, true);
      roPartId = res.body.roPart.id;

      // Check inventory stock decreased to 11
      const invCheck = await request(app)
        .get(`/api/inventory/${sparepartId}`)
        .set('Cookie', authTenant.cookie)
        .expect(200);

      assert.equal(invCheck.body.item.stock, 11);

      // Verify stock_movement OUT was logged
      const movements = await request(app)
        .get(`/api/stock-mutations?sparepart_id=${sparepartId}`)
        .set('Cookie', authTenant.cookie)
        .expect(200);

      const outMov = movements.body.mutations.find(m => m.type === 'OUT' && m.quantity === 4);
      assert.ok(outMov, 'Stock movement OUT record must exist');
    });

    await test('AUDIT-2.4: Detach sparepart using portable SQLite deletion -> stock restored to 15', async () => {
      const res = await request(app)
        .delete(`/api/repair-orders/${roId}/parts/${roPartId}`)
        .set('Cookie', authTenant.cookie)
        .expect(200);

      assert.equal(res.body.success, true);

      // Verify stock restored to 15
      const invCheck = await request(app)
        .get(`/api/inventory/${sparepartId}`)
        .set('Cookie', authTenant.cookie)
        .expect(200);

      assert.equal(invCheck.body.item.stock, 15);

      // Verify the associated stock movement was deleted
      const movements = await request(app)
        .get(`/api/stock-mutations?sparepart_id=${sparepartId}`)
        .set('Cookie', authTenant.cookie)
        .expect(200);

      const remainingOut = movements.body.mutations.filter(m => m.type === 'OUT' && m.notes && m.notes.includes(String(roId)));
      assert.equal(remainingOut.length, 0, 'RO stock movement OUT must be removed upon detachment');
    });

    // -------------------------------------------------------------------------
    // 3. Public WhatsApp Tracking URL Generation
    // -------------------------------------------------------------------------
    await test('AUDIT-3.1: Public tracking API generates fully qualified absolute URLs for WhatsApp & sharing', async () => {
      const res = await request(app)
        .get(`/api/public/tenant-audit-bengkel/tracking?plate=AG 9988 ZZ`)
        .set('Host', 'bengkel-gps.kediri.go.id')
        .expect(200);

      assert.equal(res.body.success, true);
      assert.ok(res.body.vehicle);
      assert.ok(res.body.shareUrl, 'shareUrl should be present');
      assert.ok(res.body.whatsappUrl, 'whatsappUrl should be present');

      // Check shareUrl is absolute
      assert.ok(
        res.body.shareUrl.startsWith('http://') || res.body.shareUrl.startsWith('https://'),
        `shareUrl (${res.body.shareUrl}) must start with http:// or https://`
      );
      assert.ok(
        res.body.shareUrl.includes('tenant-audit-bengkel/cek-status'),
        'shareUrl must include tenant slug and cek-status path'
      );

      // Check whatsappUrl contains encoded absolute URL
      const decodedWa = decodeURIComponent(res.body.whatsappUrl);
      assert.ok(
        decodedWa.includes('http://') || decodedWa.includes('https://'),
        `Decoded WhatsApp URL (${decodedWa}) must contain absolute http(s) URL`
      );
      assert.ok(
        decodedWa.includes('https://wa.me/'),
        'whatsappUrl must use official wa.me endpoint'
      );
    });

    // -------------------------------------------------------------------------
    // 4. Cross-Tenant Protection Remains Strict
    // -------------------------------------------------------------------------
    await test('AUDIT-4.1: Cross-tenant RO access rejected with 403 or 404', async () => {
      const authOtherTenant = await loginUser(app, { tenantSlug: 'tenant-audit-other', email: 'other@gps.com' });

      await request(app)
        .get(`/api/repair-orders/${roId}`)
        .set('Cookie', authOtherTenant.cookie)
        .expect(res => {
          assert.ok(res.status === 403 || res.status === 404);
        });
    });

  } finally {
    cleanup();
  }

  // Summary Metrics
  const total = results.length;
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;

  console.log(`\n${COLORS.bold}----------------------------------------------------------------${COLORS.reset}`);
  console.log(`${COLORS.bold}  Audit Verification Summary:${COLORS.reset}`);
  console.log(`  Total:  ${total}`);
  console.log(`  ${COLORS.green}Passed: ${passed}${COLORS.reset}`);
  if (failed > 0) {
    console.log(`  ${COLORS.red}Failed: ${failed}${COLORS.reset}`);
    process.exit(1);
  }
  console.log(`${COLORS.green}${COLORS.bold}✔ ALL AUDIT VERIFICATIONS PASSED (Exit 0)${COLORS.reset}\n`);
}

run().catch(err => {
  console.error('Audit verification runner error:', err);
  process.exit(1);
});
