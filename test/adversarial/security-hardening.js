import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import fs from 'node:fs';
import path from 'node:path';
import { createApp } from '../../server/app.js';
import { initDatabase } from '../../server/db/index.js';

test('Security Hardening & Deep Defense Suite', async (t) => {
  const db = initDatabase(':memory:');
  const app = createApp(db);

  let cookieTenantA = '';
  let cookieTenantB = '';
  let roTenantAId = '';
  let roTenantANumber = '';
  let photoTenantAId = '';
  let partTenantAId = '';
  let customerTenantAId = '';

  // Setup: Provision Tenant A & Tenant B sessions
  await t.test('1. Setup Tenant A & Tenant B Sessions', async () => {
    const resA = await request(app)
      .post('/api/auth/mock-login')
      .send({
        tenantSlug: 'bengkel-gps-motor',
        email: 'operator.a@gpsmotor.local',
        name: 'Operator Bengkel A'
      });
    assert.equal(resA.status, 200);
    cookieTenantA = resA.headers['set-cookie'][0];
    assert.ok(cookieTenantA);

    const resB = await request(app)
      .post('/api/auth/mock-login')
      .send({
        tenantSlug: 'bengkel-cabang-pare',
        email: 'operator.b@pare.local',
        name: 'Operator Bengkel B'
      });
    assert.equal(resB.status, 200);
    cookieTenantB = resB.headers['set-cookie'][0];
    assert.ok(cookieTenantB);
  });

  // Security Test: File Upload Validation & Extension Spoofing Rejection
  await t.test('2. File Upload Hardening: Reject Spoofed & Executable Extensions', async () => {
    // 2.1 Malicious .php with image/jpeg Content-Type
    const resPhp = await request(app)
      .post('/api/finance/upload')
      .set('Cookie', cookieTenantA)
      .attach('receipt', Buffer.from('<?php echo "evil"; ?>'), {
        filename: 'shell.php',
        contentType: 'image/jpeg'
      });
    assert.equal(resPhp.status, 400);
    assert.ok(resPhp.body.message.includes('tidak diizinkan') || resPhp.body.message.includes('tidak didukung'));

    // 2.2 Shell script with application/pdf Content-Type
    const resSh = await request(app)
      .post('/api/finance/upload')
      .set('Cookie', cookieTenantA)
      .attach('receipt', Buffer.from('#!/bin/bash\necho hack'), {
        filename: 'exploit.sh',
        contentType: 'application/pdf'
      });
    assert.equal(resSh.status, 400);

    // 2.3 HTML file with text/html Content-Type
    const resHtml = await request(app)
      .post('/api/finance/upload')
      .set('Cookie', cookieTenantA)
      .attach('receipt', Buffer.from('<script>alert("xss")</script>'), {
        filename: 'xss.html',
        contentType: 'text/html'
      });
    assert.equal(resHtml.status, 400);

    // 2.4 Legitimate JPEG file is accepted
    const resValid = await request(app)
      .post('/api/finance/upload')
      .set('Cookie', cookieTenantA)
      .attach('receipt', Buffer.from('fake-jpeg-binary-content'), {
        filename: 'valid-receipt.jpg',
        contentType: 'image/jpeg'
      });
    assert.equal(resValid.status, 200);
    assert.ok(resValid.body.url.endsWith('.jpg'));
  });

  // Setup data in Tenant A
  await t.test('3. Seed Initial Data in Tenant A (RO, Photo, Sparepart, Customer)', async () => {
    // 3.1 Create Customer in Tenant A
    const resCust = await request(app)
      .post('/api/customers')
      .set('Cookie', cookieTenantA)
      .send({
        name: 'Budi Santoso',
        phone: '081234567899',
        address: 'Kediri'
      });
    assert.equal(resCust.status, 201);
    customerTenantAId = resCust.body.customer.id;
    assert.ok(customerTenantAId);

    // 3.2 Create RO in Tenant A
    const resRo = await request(app)
      .post('/api/repair-orders')
      .set('Cookie', cookieTenantA)
      .send({
        plateNumber: 'AG 9999 XX',
        customerName: 'Budi Santoso',
        customerPhone: '081234567899',
        carBrand: 'Toyota',
        carModel: 'Avanza',
        complaint: 'Ganti oli'
      });
    assert.equal(resRo.status, 201);
    roTenantAId = resRo.body.repair_order.id;
    roTenantANumber = resRo.body.repair_order.ro_number;
    assert.ok(roTenantAId);

    // 3.3 Upload Photo in Tenant A RO
    const resPhoto = await request(app)
      .post(`/api/repair-orders/${roTenantAId}/photos`)
      .set('Cookie', cookieTenantA)
      .attach('photo', Buffer.from('fake-photo-binary'), {
        filename: 'engine.jpg',
        contentType: 'image/jpeg'
      })
      .field('stage', 'PROGRESS')
      .field('caption', 'Foto pengerjaan mesin');
    assert.equal(resPhoto.status, 201);
    photoTenantAId = resPhoto.body.photo.id;
    assert.ok(photoTenantAId);

    // 3.4 Create Sparepart in Tenant A
    const resPart = await request(app)
      .post('/api/inventory')
      .set('Cookie', cookieTenantA)
      .send({
        sku: 'SEC-TEST-01',
        name: 'Oli Mesin Test Security',
        category: 'Oli',
        unit: 'liter',
        stock: 20,
        buyPrice: 50000,
        sellPrice: 75000
      });
    assert.equal(resPart.status, 201);
    partTenantAId = resPart.body.id || resPart.body.item.id;
    assert.ok(partTenantAId);
  });

  // Cross-Tenant Isolation: Repair Orders
  await t.test('4. Cross-Tenant Isolation: Tenant B cannot modify Tenant A RO', async () => {
    // 4.1 Tenant B tries to update Tenant A RO
    const resUpdate = await request(app)
      .put(`/api/repair-orders/${roTenantAId}`)
      .set('Cookie', cookieTenantB)
      .send({
        complaint: 'Attacker modified complaint'
      });
    assert.equal(resUpdate.status, 404);

    // 4.2 Tenant B tries to transition status of Tenant A RO
    const resStatus = await request(app)
      .post(`/api/repair-orders/${roTenantAId}/status`)
      .set('Cookie', cookieTenantB)
      .send({
        status: 'SELESAI'
      });
    assert.equal(resStatus.status, 404);

    // 4.3 Verify Tenant A RO status was NOT altered
    const resGet = await request(app)
      .get(`/api/repair-orders/${roTenantAId}`)
      .set('Cookie', cookieTenantA);
    assert.equal(resGet.status, 200);
    assert.equal(resGet.body.repair_order.status, 'MASUK');
  });

  // Cross-Tenant Isolation: Photo Deletion
  await t.test('5. Cross-Tenant Isolation: Tenant B cannot delete Tenant A RO Photo', async () => {
    // 5.1 Tenant B tries to delete Tenant A Photo
    const resDelPhoto = await request(app)
      .delete(`/api/repair-orders/${roTenantAId}/photos/${photoTenantAId}`)
      .set('Cookie', cookieTenantB);
    assert.equal(resDelPhoto.status, 404);

    // 5.2 Tenant A can delete their photo using ro_number as targetId
    const resDelPhotoA = await request(app)
      .delete(`/api/repair-orders/${roTenantANumber}/photos/${photoTenantAId}`)
      .set('Cookie', cookieTenantA);
    assert.equal(resDelPhotoA.status, 200);
    assert.equal(resDelPhotoA.body.success, true);
  });

  // Cross-Tenant Isolation: Stock Movements & Opname
  await t.test('6. Cross-Tenant Isolation: Tenant B cannot modify Tenant A Inventory', async () => {
    // 6.1 Tenant B tries to deduct stock from Tenant A sparepart
    const resOut = await request(app)
      .post('/api/stock-movements/out')
      .set('Cookie', cookieTenantB)
      .send({
        sparepartId: partTenantAId,
        qty: 5,
        catatan: 'Illegitimate stock deduction'
      });
    assert.equal(resOut.status, 404);

    // 6.2 Tenant B tries stock opname on Tenant A sparepart
    const resOpname = await request(app)
      .post('/api/stock-movements/opname')
      .set('Cookie', cookieTenantB)
      .send({
        sparepartId: partTenantAId,
        physicalStock: 0,
        reason: 'Illegitimate zero out'
      });
    assert.equal(resOpname.status, 404);

    // 6.3 Verify Tenant A stock remained 20
    const resPart = await request(app)
      .get(`/api/inventory/${partTenantAId}`)
      .set('Cookie', cookieTenantA);
    assert.equal(resPart.status, 200);
    assert.equal(resPart.body.item.stock, 20);
  });

  // Cross-Tenant Isolation: Customer Deletion
  await t.test('7. Cross-Tenant Isolation: Tenant B cannot delete Tenant A Customer', async () => {
    // 7.1 Tenant B tries to delete Tenant A Customer
    const resDel = await request(app)
      .delete(`/api/customers/${customerTenantAId}`)
      .set('Cookie', cookieTenantB);
    assert.equal(resDel.status, 404);

    // 7.2 Tenant A can delete their customer
    const resDelA = await request(app)
      .delete(`/api/customers/${customerTenantAId}`)
      .set('Cookie', cookieTenantA);
    assert.equal(resDelA.status, 200);
    assert.equal(resDelA.body.success, true);
  });

  // Image Resizing & Compression Test: Target <= 100KB
  await t.test('8. Image Resizing & Compression: High-Res Upload Compressed to Target <= 100KB', async () => {
    const samplePath = path.join(process.cwd(), 'uploads/ro/spark-plugs.jpg');
    assert.ok(fs.existsSync(samplePath), 'Sample spark-plugs.jpg must exist');
    const originalSize = fs.statSync(samplePath).size;
    assert.ok(originalSize > 200 * 1024, `Original sample should be >200KB, got ${Math.round(originalSize / 1024)}KB`);

    // Upload real 489KB photo to /api/finance/upload
    const res = await request(app)
      .post('/api/finance/upload')
      .set('Cookie', cookieTenantA)
      .attach('receipt', samplePath);

    assert.equal(res.status, 200);
    assert.ok(res.body.url);

    // Read the saved file on disk
    const savedPath = path.join(process.cwd(), res.body.url.replace(/^\//, ''));
    assert.ok(fs.existsSync(savedPath), 'Saved file must exist on disk');

    const compressedSize = fs.statSync(savedPath).size;
    // Verify it is <= 100KB (100 * 1024 bytes)
    assert.ok(
      compressedSize <= 100 * 1024,
      `Compressed image should be <= 100KB, got ${Math.round(compressedSize / 1024)}KB`
    );

    // Clean up test upload
    try {
      fs.unlinkSync(savedPath);
    } catch {}
  });
});
