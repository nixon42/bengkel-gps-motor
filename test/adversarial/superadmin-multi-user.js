import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../../server/app.js';
import { initDatabase } from '../../server/db/index.js';

test('Superadmin Inventory Metrics, Last Login & Multi-Email Tenant Assignment', async (t) => {
  const db = initDatabase(':memory:');
  const app = createApp(db);

  let superCookie = '';
  let tenantKeduaId = '';

  await t.test('1. Setup Superadmin Session & Create Second Tenant', async () => {
    // Login as superadmin
    const resLogin = await request(app)
      .post('/api/auth/mock-login')
      .send({
        tenantSlug: 'bengkel-gps-motor',
        email: 'superadmin@gpsmotor.id',
        name: 'Super Admin GPS'
      });
    assert.equal(resLogin.status, 200);
    superCookie = resLogin.headers['set-cookie'][0];
    assert.ok(superCookie, 'Session cookie must be set');

    // Create a second tenant
    const resCreateTenant = await request(app)
      .post('/api/superadmin/tenants')
      .set('Cookie', superCookie)
      .send({
        name: 'Bengkel GPS Motor Cabang Pare',
        slug: 'gps-motor-pare',
        address: 'Jl. Panglima Sudirman No. 88, Pare, Kediri',
        phoneWa: '081299998888',
        monthlyRevenueTarget: 25000000
      });
    assert.equal(resCreateTenant.status, 201);
    tenantKeduaId = resCreateTenant.body.tenant.id;
    assert.ok(tenantKeduaId);
  });

  await t.test('2. Superadmin Stats & Tenants return Inventory & Stock Movement Metrics', async () => {
    // Check stats
    const resStats = await request(app)
      .get('/api/superadmin/stats')
      .set('Cookie', superCookie);
    assert.equal(resStats.status, 200);
    const stats = resStats.body.stats;
    assert.equal(typeof stats.totalSpareparts, 'number');
    assert.equal(typeof stats.stockInCount, 'number');
    assert.equal(typeof stats.stockInQty, 'number');
    assert.equal(typeof stats.stockOutCount, 'number');
    assert.equal(typeof stats.stockOutQty, 'number');

    // Check tenants list
    const resTenants = await request(app)
      .get('/api/superadmin/tenants')
      .set('Cookie', superCookie);
    assert.equal(resTenants.status, 200);
    const tenants = resTenants.body.tenants;
    assert.ok(tenants.length >= 2);

    const defaultTenant = tenants.find(x => x.slug === 'bengkel-gps-motor');
    assert.ok(defaultTenant);
    assert.equal(typeof defaultTenant.sparepart_count, 'number');
    assert.equal(typeof defaultTenant.stock_in_qty, 'number');
    assert.equal(typeof defaultTenant.stock_out_qty, 'number');
    assert.ok(defaultTenant.last_login_at, 'Default tenant should have last_login_at from superadmin login');
  });

  await t.test('3. Superadmin Users list returns last_login_at', async () => {
    const resUsers = await request(app)
      .get('/api/superadmin/users')
      .set('Cookie', superCookie);
    assert.equal(resUsers.status, 200);
    const users = resUsers.body.users;
    assert.ok(users.length >= 1);
    const superUser = users.find(u => u.email === 'superadmin@gpsmotor.id');
    assert.ok(superUser);
    assert.ok(superUser.last_login_at, 'Superadmin user should have last_login_at');
  });

  let agusUserId = '';
  await t.test('4. Assign New Email (agus@gmail.com) to Second Tenant (gps-motor-pare)', async () => {
    const resAssign = await request(app)
      .post('/api/superadmin/users')
      .set('Cookie', superCookie)
      .send({
        email: 'agus.pare@gmail.com',
        name: 'Agus Mekanik Pare',
        tenantId: tenantKeduaId,
        role: 'mechanic'
      });
    assert.equal(resAssign.status, 201);
    assert.equal(resAssign.body.user.email, 'agus.pare@gmail.com');
    assert.equal(resAssign.body.user.tenant_id, tenantKeduaId);
    assert.equal(resAssign.body.user.role, 'mechanic');
    agusUserId = resAssign.body.user.id;
  });

  await t.test('5. Assigned User Logs in via Mock-Login & Automatically Lands in Assigned Tenant', async () => {
    // User logs in without specifying custom tenantSlug
    const resLogin = await request(app)
      .post('/api/auth/mock-login')
      .send({
        email: 'agus.pare@gmail.com'
      });
    assert.equal(resLogin.status, 200);
    assert.equal(resLogin.body.tenant.slug, 'gps-motor-pare');
    assert.equal(resLogin.body.tenant.id, tenantKeduaId);
    assert.equal(resLogin.body.user.email, 'agus.pare@gmail.com');
    assert.equal(resLogin.body.user.role, 'mechanic');
  });

  await t.test('6. Assign Second Email (kasir.pare@gmail.com) to SAME Tenant (Multi-Email Sharing)', async () => {
    const resAssignKasir = await request(app)
      .post('/api/superadmin/users')
      .set('Cookie', superCookie)
      .send({
        email: 'kasir.pare@gmail.com',
        name: 'Siti Kasir Pare',
        tenantId: tenantKeduaId,
        role: 'cashier'
      });
    assert.equal(resAssignKasir.status, 201);

    // Kasir logs in
    const resLoginKasir = await request(app)
      .post('/api/auth/mock-login')
      .send({
        email: 'kasir.pare@gmail.com'
      });
    assert.equal(resLoginKasir.status, 200);
    // Both Agus and Siti share the exact same tenant workspace!
    assert.equal(resLoginKasir.body.tenant.id, tenantKeduaId);
    assert.equal(resLoginKasir.body.tenant.slug, 'gps-motor-pare');
  });

  await t.test('7. Reassign User (Agus) to Default Tenant via PUT /api/superadmin/users/:id/tenant', async () => {
    const defaultTenant = db.prepare('SELECT id FROM tenants WHERE slug = ?').get('bengkel-gps-motor');
    const resReassign = await request(app)
      .put(`/api/superadmin/users/${agusUserId}/tenant`)
      .set('Cookie', superCookie)
      .send({
        tenantId: defaultTenant.id
      });
    assert.equal(resReassign.status, 200);

    // Now when Agus logs in, he lands in bengkel-gps-motor
    const resLoginAgusAgain = await request(app)
      .post('/api/auth/mock-login')
      .send({
        email: 'agus.pare@gmail.com'
      });
    assert.equal(resLoginAgusAgain.status, 200);
    assert.equal(resLoginAgusAgain.body.tenant.slug, 'bengkel-gps-motor');
  });

  await t.test('8. Delete User via DELETE /api/superadmin/users/:id', async () => {
    const resDel = await request(app)
      .delete(`/api/superadmin/users/${agusUserId}`)
      .set('Cookie', superCookie);
    assert.equal(resDel.status, 200);

    const checkUser = db.prepare('SELECT id FROM users WHERE id = ?').get(agusUserId);
    assert.equal(checkUser, undefined, 'User must be deleted from DB');
  });

  await t.test('9. Google OAuth Callback Automatically Lands in Assigned Tenant', async () => {
    // Assign google.user@gpsmotor.local to second tenant (gps-motor-pare)
    const resAssignGoogle = await request(app)
      .post('/api/superadmin/users')
      .set('Cookie', superCookie)
      .send({
        email: 'google.user@gpsmotor.local',
        name: 'Google Assigned Operator',
        tenantId: tenantKeduaId,
        role: 'operator'
      });
    assert.equal(resAssignGoogle.status, 201);

    // Now call Google OAuth callback with mock_test_code
    const resGoogleCb = await request(app)
      .get('/api/auth/google/callback?code=mock_test_code')
      .set('Accept', 'application/json');
    assert.equal(resGoogleCb.status, 200);
    assert.equal(resGoogleCb.body.tenant.slug, 'gps-motor-pare', 'Google login must route to assigned tenant');
    assert.equal(resGoogleCb.body.tenant.id, tenantKeduaId);
  });
});
