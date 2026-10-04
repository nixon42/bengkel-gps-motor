import { Router } from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { requireAuth } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';
import { seedDefaultCategoriesIfEmpty } from './finance.js';
import { generateInvoicePdf, formatRupiah, formatDateIndo } from '../services/pdfService.js';

const STATUS_ALIASES = {
  'PEMERIKSAAN': 'DIAGNOSA',
  'CHECKING': 'DIAGNOSA',
  'DIAGNOSIS': 'DIAGNOSA',
  'MENUNGGU_SPAREPART': 'MENUNGGU_PART',
  'WAITING_PART': 'MENUNGGU_PART',
  'SELESAI_DIKERJAKAN': 'SELESAI',
  'COMPLETED': 'SELESAI',
  'SUDAH_DIAMBIL': 'DIAMBIL',
  'PICKED_UP': 'DIAMBIL'
};

const VALID_STATUSES = ['MASUK', 'DIAGNOSA', 'PENGERJAAN', 'MENUNGGU_PART', 'SELESAI', 'DIAMBIL'];

export function normalizeStatus(rawStatus) {
  if (!rawStatus) return 'MASUK';
  const clean = String(rawStatus).trim().toUpperCase();
  return STATUS_ALIASES[clean] || clean;
}

export function parseBrandAndModel(brandInput, modelInput, comboInput) {
  let brand = (brandInput || '').trim();
  let model = (modelInput || '').trim();

  if (!brand && !model && comboInput) {
    const parts = String(comboInput).trim().split(/\s+/);
    if (parts.length === 1) {
      brand = parts[0];
      model = parts[0];
    } else {
      brand = parts[0];
      model = parts.slice(1).join(' ');
    }
  }

  if (!brand) brand = 'Mobil';
  if (!model) model = 'Standar';

  return { brand, model };
}

export function formatRepairOrder(row) {
  if (!row) return null;
  const serviceFee = Number(row.service_fee || 0);
  const sparepartFee = Number(row.sparepart_fee || 0);
  const discount = Number(row.discount || 0);
  const totalCost = Number(row.total_cost ?? (serviceFee + sparepartFee - discount));

  return {
    ...row,
    service_fee: serviceFee,
    sparepart_fee: sparepartFee,
    discount,
    total_cost: totalCost,
    // Indonesian Aliases for seamless bilingual compatibility
    platNomor: row.plate_number,
    namaPemilik: row.customer_name,
    noHp: row.customer_phone,
    merekModel: `${row.car_brand} ${row.car_model}`.trim(),
    merek: row.car_brand,
    model: row.car_model,
    tahun: row.car_year,
    warna: row.car_color,
    odometerMasuk: row.odometer_in,
    tanggalMasuk: row.entry_date,
    keluhan: row.complaint,
    mekanikPj: row.mechanic_name,
    biayaJasa: serviceFee,
    biayaSparepart: sparepartFee,
    diskon: discount,
    totalBiaya: totalCost,
    estimasiSelesai: row.estimated_completion,
    catatan: row.notes
  };
}

export function repairOrdersRoutes(db) {
  const router = Router();

  function getTenantId(req) {
    return req.tenantId || req.tenant?.id || req.user?.tenant_id;
  }

  // 1. GET /api/repair-orders (Filterable list with status stage counts & pagination)
  router.get('/', requireAuth, async (req, res, next) => {
    try {
      const tenantId = getTenantId(req);
      const search = (req.query.search || req.query.q || '').trim();
      const rawStatus = (req.query.status || '').trim();
      const mechanic = (req.query.mechanic || req.query.mekanik || '').trim();
      const startDate = (req.query.startDate || req.query.from || req.query.tanggalMulai || '').trim();
      const endDate = (req.query.endDate || req.query.to || req.query.tanggalAkhir || '').trim();

      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
      const offset = (page - 1) * limit;

      let whereConditions = ['tenant_id = ?'];
      let queryParams = [tenantId];

      if (search) {
        whereConditions.push(`(
          plate_number LIKE ? OR
          customer_name LIKE ? OR
          customer_phone LIKE ? OR
          ro_number LIKE ? OR
          car_brand LIKE ? OR
          car_model LIKE ?
        )`);
        const searchPattern = `%${search}%`;
        queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
      }

      if (rawStatus && rawStatus !== 'ALL' && rawStatus !== 'SEMUA') {
        const normStatus = normalizeStatus(rawStatus);
        whereConditions.push('status = ?');
        queryParams.push(normStatus);
      }

      if (mechanic) {
        whereConditions.push('mechanic_name LIKE ?');
        queryParams.push(`%${mechanic}%`);
      }

      if (startDate) {
        whereConditions.push('entry_date >= ?');
        queryParams.push(startDate);
      }

      if (endDate) {
        whereConditions.push('entry_date <= ?');
        queryParams.push(endDate);
      }

      const whereClause = whereConditions.join(' AND ');

      // Total count with filters
      const countRow = db.prepare(`SELECT COUNT(*) as total FROM repair_orders WHERE ${whereClause}`).get(...queryParams);
      const total = countRow ? countRow.total : 0;
      const totalPages = Math.ceil(total / limit) || 1;

      // Fetch items
      const rows = db.prepare(`
        SELECT * FROM repair_orders
        WHERE ${whereClause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `).all(...queryParams, limit, offset);

      const formatted = rows.map(formatRepairOrder);

      // Status stage breakdown counts for dashboard summary
      const statsRows = db.prepare(`
        SELECT status, COUNT(*) as count
        FROM repair_orders
        WHERE tenant_id = ?
        GROUP BY status
      `).all(tenantId);

      const stats = {
        total: 0,
        masuk: 0,
        diagnosa: 0,
        pengerjaan: 0,
        menunggu_part: 0,
        selesai: 0,
        diambil: 0
      };

      for (const s of statsRows) {
        const key = s.status.toLowerCase();
        if (stats[key] !== undefined) {
          stats[key] = s.count;
        }
        stats.total += s.count;
      }

      res.json({
        success: true,
        repair_orders: formatted,
        items: formatted,
        pagination: {
          page,
          limit,
          total,
          totalPages
        },
        stats
      });
    } catch (err) {
      next(err);
    }
  });

  // 2. POST /api/repair-orders (Create Repair Order with customer/vehicle auto-provisioning)
  router.post('/', requireAuth, async (req, res, next) => {
    try {
      const tenantId = getTenantId(req);
      const body = req.body || {};

      const plateNumber = (body.platNomor || body.plate_number || body.plateNumber || body.plate || '').trim();
      const customerName = (body.namaPemilik || body.customer_name || body.customerName || body.name || '').trim();
      const customerPhone = (body.noHp || body.customer_phone || body.customerPhone || body.phone || '').trim();

      if (!plateNumber) {
        return res.status(400).json({ error: 'Plat nomor kendaraan wajib diisi.' });
      }
      if (!customerName) {
        return res.status(400).json({ error: 'Nama pemilik kendaraan wajib diisi.' });
      }

      const { brand, model } = parseBrandAndModel(
        body.carBrand || body.car_brand || body.merek,
        body.carModel || body.car_model || body.model,
        body.merekModel || body.brandModel
      );

      const carYear = body.tahun || body.car_year || body.carYear || body.year ? parseInt(body.tahun || body.car_year || body.carYear || body.year, 10) : null;
      const carColor = (body.warna || body.car_color || body.carColor || body.color || '').trim() || null;
      const odometerIn = parseInt(body.odometerMasuk || body.odometer_in || body.odometerIn || body.odometer || 0, 10) || 0;
      const entryDate = (body.tanggalMasuk || body.entry_date || body.entryDate || new Date().toISOString().slice(0, 10)).trim();
      const complaint = (body.keluhan || body.complaint || 'Perawatan berkala').trim();
      const mechanicName = (body.mekanikPj || body.mechanic_name || body.mechanicName || 'Mas Agus Santoso').trim();
      const serviceFee = Math.max(0, Number(body.biayaJasa ?? body.service_fee ?? body.serviceFee ?? 0));
      const discount = Math.max(0, Number(body.diskon ?? body.discount ?? 0));
      const estimatedCompletion = (body.estimasiSelesai || body.estimated_completion || body.estimatedCompletion || null);
      const notes = (body.catatan || body.notes || null);

      let createdRo = null;

      const createTransaction = db.transaction(() => {
        // 1. Auto-Provision or Find Customer
        let customer = null;
        if (customerPhone) {
          customer = db.prepare('SELECT id FROM customers WHERE tenant_id = ? AND phone = ? LIMIT 1').get(tenantId, customerPhone);
        }
        if (!customer && customerName) {
          customer = db.prepare('SELECT id FROM customers WHERE tenant_id = ? AND name = ? LIMIT 1').get(tenantId, customerName);
        }

        let customerId = customer ? customer.id : null;
        if (!customerId) {
          customerId = crypto.randomUUID();
          db.prepare(`
            INSERT INTO customers (id, tenant_id, name, phone, email, address, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).run(
            customerId,
            tenantId,
            customerName,
            customerPhone || '-',
            body.email || null,
            body.alamat || body.address || null,
            'Auto-provisioned saat pembuatan Repair Order'
          );
        }

        // 2. Auto-Provision or Find Vehicle
        const normPlate = plateNumber.toUpperCase().replace(/\s+/g, '');
        let vehicle = db.prepare(`
          SELECT id FROM vehicles 
          WHERE tenant_id = ? AND UPPER(REPLACE(plate_number, ' ', '')) = ?
          LIMIT 1
        `).get(tenantId, normPlate);

        if (!vehicle) {
          const vehicleId = crypto.randomUUID();
          db.prepare(`
            INSERT INTO vehicles (id, tenant_id, customer_id, plate_number, brand, model, year, color)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            vehicleId,
            tenantId,
            customerId,
            plateNumber.toUpperCase().replace(/\s+/g, ' ').trim(),
            brand,
            model,
            carYear,
            carColor
          );
        } else if (customerId) {
          db.prepare("UPDATE vehicles SET customer_id = ? WHERE id = ? AND (customer_id IS NULL OR customer_id = '')").run(customerId, vehicle.id);
        }

        // 3. Generate Sequential RO Number: RO-YYYYMMDD-XXXX
        const datePart = entryDate.replace(/[^0-9]/g, '').slice(0, 8);
        const countRow = db.prepare(`
          SELECT COUNT(*) as cnt FROM repair_orders WHERE tenant_id = ? AND entry_date LIKE ?
        `).get(tenantId, `${entryDate.slice(0, 10)}%`);
        const seq = (countRow ? countRow.cnt : 0) + 1;
        const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
        const roNumber = `RO-${datePart}-${String(seq).padStart(3, '0')}${randomHex.slice(0, 2)}`;

        // 4. Generate Unique Tracking Token: TRK-XXXX
        const trackingToken = `TRK-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

        // 5. Insert Repair Order
        const roId = crypto.randomUUID();
        const initialStatus = 'MASUK';
        const sparepartFee = 0;
        const totalCost = Math.max(0, serviceFee - discount);

        db.prepare(`
          INSERT INTO repair_orders (
            id, tenant_id, ro_number, tracking_token, customer_id,
            plate_number, customer_name, customer_phone,
            car_brand, car_model, car_year, car_color, odometer_in,
            entry_date, complaint, mechanic_name, status,
            service_fee, sparepart_fee, discount, total_cost,
            estimated_completion, notes
          ) VALUES (
            ?, ?, ?, ?, ?,
            ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?
          )
        `).run(
          roId, tenantId, roNumber, trackingToken, customerId,
          plateNumber.toUpperCase().replace(/\s+/g, ' ').trim(), customerName, customerPhone,
          brand, model, carYear, carColor, odometerIn,
          entryDate, complaint, mechanicName, initialStatus,
          serviceFee, sparepartFee, discount, totalCost,
          estimatedCompletion, notes
        );

        // 6. Log Initial Status MASUK
        const logId = crypto.randomUUID();
        db.prepare(`
          INSERT INTO ro_status_logs (id, tenant_id, repair_order_id, previous_status, new_status, notes, actor_name)
          VALUES (?, ?, ?, NULL, 'MASUK', 'Penerimaan unit kendaraan & pencatatan keluhan awal', ?)
        `).run(logId, tenantId, roId, req.user?.name || 'Operator Bengkel');

        const inserted = db.prepare('SELECT * FROM repair_orders WHERE id = ?').get(roId);
        createdRo = formatRepairOrder(inserted);
      });

      createTransaction();

      res.status(201).json({
        success: true,
        id: createdRo.id,
        tracking_token: createdRo.tracking_token,
        trackingToken: createdRo.tracking_token,
        repair_order: createdRo
      });
    } catch (err) {
      next(err);
    }
  });

  // 3. GET /api/repair-orders/:id (Full RO details with logs, spareparts, photos)
  router.get('/:id', requireAuth, async (req, res, next) => {
    try {
      const tenantId = getTenantId(req);
      const targetId = req.params.id;

      const ro = db.prepare(`
        SELECT * FROM repair_orders
        WHERE tenant_id = ? AND (id = ? OR ro_number = ? OR tracking_token = ?)
        LIMIT 1
      `).get(tenantId, targetId, targetId, targetId);

      if (!ro) {
        return res.status(404).json({ error: 'Repair Order tidak ditemukan.' });
      }

      const spareparts = db.prepare(`
        SELECT * FROM ro_spareparts
        WHERE tenant_id = ? AND repair_order_id = ?
        ORDER BY created_at ASC
      `).all(tenantId, ro.id);

      const logs = db.prepare(`
        SELECT * FROM ro_status_logs
        WHERE tenant_id = ? AND repair_order_id = ?
        ORDER BY created_at ASC
      `).all(tenantId, ro.id);

      const photos = db.prepare(`
        SELECT * FROM ro_photos
        WHERE tenant_id = ? AND repair_order_id = ?
        ORDER BY created_at ASC
      `).all(tenantId, ro.id);

      const customer = ro.customer_id ? db.prepare('SELECT * FROM customers WHERE id = ?').get(ro.customer_id) : null;

      res.json({
        success: true,
        repair_order: formatRepairOrder(ro),
        spareparts,
        logs,
        photos,
        customer
      });
    } catch (err) {
      next(err);
    }
  });

  // 4. PUT /api/repair-orders/:id or PATCH /api/repair-orders/:id (Update fees, notes, info)
  async function handleUpdateRo(req, res, next) {
    try {
      const tenantId = getTenantId(req);
      const targetId = req.params.id;

      const ro = db.prepare(`
        SELECT * FROM repair_orders
        WHERE tenant_id = ? AND (id = ? OR ro_number = ?)
        LIMIT 1
      `).get(tenantId, targetId, targetId);

      if (!ro) {
        return res.status(404).json({ error: 'Repair Order tidak ditemukan.' });
      }

      const body = req.body || {};
      const serviceFee = body.service_fee !== undefined || body.biayaJasa !== undefined
        ? Number(body.service_fee ?? body.biayaJasa ?? 0)
        : Number(ro.service_fee || 0);

      const discount = body.discount !== undefined || body.diskon !== undefined
        ? Number(body.discount ?? body.diskon ?? 0)
        : Number(ro.discount || 0);

      const complaint = body.complaint || body.keluhan || ro.complaint;
      const mechanicName = body.mechanic_name || body.mekanikPj || ro.mechanic_name;
      const estimatedCompletion = body.estimated_completion !== undefined ? body.estimated_completion : (body.estimasiSelesai !== undefined ? body.estimasiSelesai : ro.estimated_completion);
      const notes = body.notes !== undefined ? body.notes : (body.catatan !== undefined ? body.catatan : ro.notes);

      const sparepartFee = Number(ro.sparepart_fee || 0);
      const totalCost = Math.max(0, serviceFee + sparepartFee - discount);

      db.prepare(`
        UPDATE repair_orders SET
          service_fee = ?,
          discount = ?,
          total_cost = ?,
          complaint = ?,
          mechanic_name = ?,
          estimated_completion = ?,
          notes = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(serviceFee, discount, totalCost, complaint, mechanicName, estimatedCompletion, notes, ro.id);

      const updated = db.prepare('SELECT * FROM repair_orders WHERE id = ?').get(ro.id);

      res.json({
        success: true,
        repair_order: formatRepairOrder(updated)
      });
    } catch (err) {
      next(err);
    }
  }

  router.put('/:id', requireAuth, handleUpdateRo);
  router.patch('/:id', requireAuth, handleUpdateRo);
  router.patch('/:id/costs', requireAuth, handleUpdateRo);

  // 5. POST /api/repair-orders/:id/status (and PUT/PATCH) - 6-stage lifecycle transitions
  async function handleStatusTransition(req, res, next) {
    try {
      const tenantId = getTenantId(req);
      const targetId = req.params.id;
      const body = req.body || {};

      const ro = db.prepare(`
        SELECT * FROM repair_orders
        WHERE tenant_id = ? AND (id = ? OR ro_number = ?)
        LIMIT 1
      `).get(tenantId, targetId, targetId);

      if (!ro) {
        return res.status(404).json({ error: 'Repair Order tidak ditemukan.' });
      }

      const targetStatus = normalizeStatus(body.status);
      if (!VALID_STATUSES.includes(targetStatus)) {
        return res.status(400).json({
          error: `Status "${body.status}" tidak valid. Status yang diizinkan: ${VALID_STATUSES.join(', ')}`
        });
      }

      const notes = (body.catatan || body.notes || `Transisi status ke ${targetStatus}`).trim();
      const actorName = (req.user?.name || body.actorName || body.actor_name || 'Operator Bengkel').trim();
      const autoRecordIncome = body.autoRecordIncome === true || body.autoRecordIncome === 'true';
      const paymentMethod = (body.metodePembayaran || body.paymentMethod || body.payment_method || 'CASH').toUpperCase();

      const validPaymentMethods = ['CASH', 'TRANSFER', 'QRIS'];
      const safePaymentMethod = validPaymentMethods.includes(paymentMethod) ? paymentMethod : 'CASH';

      let updatedRo = null;

      const transitionTx = db.transaction(() => {
        // 1. Update RO status
        db.prepare(`
          UPDATE repair_orders
          SET status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(targetStatus, ro.id);

        // 2. Insert audit log
        const logId = crypto.randomUUID();
        db.prepare(`
          INSERT INTO ro_status_logs (id, tenant_id, repair_order_id, previous_status, new_status, notes, actor_name)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(logId, tenantId, ro.id, ro.status, targetStatus, notes, actorName);

        // 3. Auto-record financial income on DIAMBIL
        if (targetStatus === 'DIAMBIL' && autoRecordIncome) {
          seedDefaultCategoriesIfEmpty(db, tenantId);

          let cat = db.prepare(`
            SELECT id FROM transaction_categories 
            WHERE tenant_id = ? AND name = 'Jasa Servis' AND type = 'INCOME' 
            LIMIT 1
          `).get(tenantId);

          if (!cat) {
            cat = db.prepare(`
              SELECT id FROM transaction_categories 
              WHERE tenant_id = ? AND type = 'INCOME' 
              LIMIT 1
            `).get(tenantId);
          }

          if (!cat) {
            const catId = crypto.randomUUID();
            db.prepare(`
              INSERT INTO transaction_categories (id, tenant_id, name, type, is_default)
              VALUES (?, ?, 'Jasa Servis', 'INCOME', 1)
            `).run(catId, tenantId);
            cat = { id: catId };
          }

          const today = new Date().toISOString().slice(0, 10);
          const totalAmount = Number(ro.total_cost || 0);

          // Check if transaction already exists for this RO
          const existingTrx = db.prepare(`
            SELECT id FROM transactions 
            WHERE tenant_id = ? AND repair_order_id = ? AND type = 'INCOME' 
            LIMIT 1
          `).get(tenantId, ro.id);

          if (existingTrx) {
            db.prepare(`
              UPDATE transactions SET
                amount = ?,
                payment_method = ?,
                description = ?,
                date = ?,
                updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `).run(
              totalAmount,
              safePaymentMethod,
              `Pembayaran Servis ${ro.ro_number} - ${ro.plate_number} (${ro.customer_name})`,
              today,
              existingTrx.id
            );
          } else {
            const trxId = crypto.randomUUID();
            db.prepare(`
              INSERT INTO transactions (
                id, tenant_id, category_id, type, amount, date,
                description, payment_method, repair_order_id
              ) VALUES (
                ?, ?, ?, 'INCOME', ?, ?,
                ?, ?, ?
              )
            `).run(
              trxId,
              tenantId,
              cat.id,
              totalAmount,
              today,
              `Pembayaran Servis ${ro.ro_number} - ${ro.plate_number} (${ro.customer_name})`,
              safePaymentMethod,
              ro.id
            );
          }
        }

        const freshRow = db.prepare('SELECT * FROM repair_orders WHERE id = ?').get(ro.id);
        updatedRo = formatRepairOrder(freshRow);
      });

      transitionTx();

      res.json({
        success: true,
        status: targetStatus,
        repair_order: updatedRo
      });
    } catch (err) {
      next(err);
    }
  }

  router.post('/:id/status', requireAuth, handleStatusTransition);
  router.put('/:id/status', requireAuth, handleStatusTransition);
  router.patch('/:id/status', requireAuth, handleStatusTransition);

  // 6. POST /api/repair-orders/:id/spareparts (Attach part, deduct inventory stock & log OUT)
  router.post('/:id/spareparts', requireAuth, async (req, res, next) => {
    try {
      const tenantId = getTenantId(req);
      const targetId = req.params.id;
      const body = req.body || {};

      const ro = db.prepare(`
        SELECT * FROM repair_orders
        WHERE tenant_id = ? AND (id = ? OR ro_number = ?)
        LIMIT 1
      `).get(tenantId, targetId, targetId);

      if (!ro) {
        return res.status(404).json({ error: 'Repair Order tidak ditemukan.' });
      }

      const sparepartId = (body.sparepartId || body.sparepart_id || body.id || '').trim();
      if (!sparepartId) {
        return res.status(400).json({ error: 'ID Sparepart wajib diisi.' });
      }

      const rawQty = body.quantity !== undefined ? body.quantity : (body.qty !== undefined ? body.qty : body.jumlah);
      const qty = typeof rawQty === 'string' && rawQty.trim() === '' ? NaN : Number(rawQty);
      if (rawQty === undefined || rawQty === null || typeof rawQty === 'boolean' || !Number.isInteger(qty) || qty <= 0) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Jumlah sparepart (qty) harus berupa bilangan bulat positif lebih dari 0'
        });
      }

      const part = db.prepare('SELECT * FROM spareparts WHERE tenant_id = ? AND id = ?').get(tenantId, sparepartId);
      if (!part) {
        return res.status(404).json({ error: 'Sparepart tidak ditemukan di inventaris.' });
      }

      // Underflow protection: check stock
      if (part.stock < qty) {
        return res.status(422).json({
          error: 'Stok tidak mencukupi',
          message: `Stok sparepart "${part.name}" tidak mencukupi. Tersedia: ${part.stock}, Diminta: ${qty}.`
        });
      }

      let unitPrice = Number(part.sell_price ?? part.price ?? 0);
      const rawPrice = body.hargaSatuan !== undefined ? body.hargaSatuan : (body.unitPrice !== undefined ? body.unitPrice : body.unit_price);
      if (rawPrice !== undefined && rawPrice !== null) {
        const parsedPrice = typeof rawPrice === 'string' && rawPrice.trim() === '' ? NaN : Number(rawPrice);
        if (typeof rawPrice === 'boolean' || isNaN(parsedPrice) || !Number.isFinite(parsedPrice) || parsedPrice < 0) {
          return res.status(400).json({
            error: 'Validation Error',
            message: 'Harga satuan sparepart tidak boleh bernilai negatif atau non-finite'
          });
        }
        unitPrice = parsedPrice;
      }
      if (isNaN(unitPrice) || !Number.isFinite(unitPrice) || unitPrice < 0) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Harga satuan sparepart tidak boleh bernilai negatif atau non-finite'
        });
      }

      const subtotal = qty * unitPrice;
      const attachedItemId = crypto.randomUUID();
      const movementId = crypto.randomUUID();
      const today = new Date().toISOString().slice(0, 10);

      let newSparepartFee = 0;
      let newTotalCost = 0;

      const attachTx = db.transaction(() => {
        // 1. Decrement inventory stock
        db.prepare(`
          UPDATE spareparts
          SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(qty, part.id);

        // 2. Insert stock_movements OUT
        db.prepare(`
          INSERT INTO stock_movements (
            id, tenant_id, sparepart_id, type, quantity,
            unit_price, total_price, date, notes, repair_order_id
          ) VALUES (
            ?, ?, ?, 'OUT', ?,
            ?, ?, ?, ?, ?
          )
        `).run(
          movementId,
          tenantId,
          part.id,
          qty,
          unitPrice,
          subtotal,
          today,
          `Dipakai pada servis ${ro.ro_number} (${ro.plate_number})`,
          ro.id
        );

        // 3. Insert into ro_spareparts
        db.prepare(`
          INSERT INTO ro_spareparts (
            id, tenant_id, repair_order_id, sparepart_id, item_name, quantity, unit_price, subtotal
          ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?
          )
        `).run(
          attachedItemId,
          tenantId,
          ro.id,
          part.id,
          part.name,
          qty,
          unitPrice,
          subtotal
        );

        // 4. Recalculate repair_orders sparepart_fee & total_cost
        const sumRow = db.prepare(`
          SELECT COALESCE(SUM(subtotal), 0) as total_parts
          FROM ro_spareparts
          WHERE tenant_id = ? AND repair_order_id = ?
        `).get(tenantId, ro.id);

        newSparepartFee = Number(sumRow.total_parts || 0);
        const serviceFee = Number(ro.service_fee || 0);
        const discount = Number(ro.discount || 0);
        newTotalCost = Math.max(0, serviceFee + newSparepartFee - discount);

        db.prepare(`
          UPDATE repair_orders
          SET sparepart_fee = ?, total_cost = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(newSparepartFee, newTotalCost, ro.id);
      });

      attachTx();

      const responseItem = {
        id: attachedItemId,
        sparepart_id: part.id,
        sparepartId: part.id,
        item_name: part.name,
        name: part.name,
        quantity: qty,
        qty,
        unit_price: unitPrice,
        hargaSatuan: unitPrice,
        subtotal
      };

      res.status(201).json({
        success: true,
        id: attachedItemId,
        item: responseItem,
        sparepart_fee: newSparepartFee,
        total_cost: newTotalCost
      });
    } catch (err) {
      next(err);
    }
  });

  // 7. DELETE /api/repair-orders/:id/spareparts/:itemId (Detach part & restore inventory stock)
  router.delete('/:id/spareparts/:itemId', requireAuth, async (req, res, next) => {
    try {
      const tenantId = getTenantId(req);
      const targetId = req.params.id;
      const itemId = req.params.itemId;

      const ro = db.prepare(`
        SELECT * FROM repair_orders
        WHERE tenant_id = ? AND (id = ? OR ro_number = ?)
        LIMIT 1
      `).get(tenantId, targetId, targetId);

      if (!ro) {
        return res.status(404).json({ error: 'Repair Order tidak ditemukan.' });
      }

      const attachedItem = db.prepare(`
        SELECT * FROM ro_spareparts
        WHERE tenant_id = ? AND repair_order_id = ? AND id = ?
      `).get(tenantId, ro.id, itemId);

      if (!attachedItem) {
        return res.status(404).json({ error: 'Suku cadang tidak ditemukan pada Repair Order ini.' });
      }

      const detachTx = db.transaction(() => {
        // 1. Restore inventory stock
        db.prepare(`
          UPDATE spareparts
          SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(attachedItem.quantity, attachedItem.sparepart_id);

        // 2. Remove matching stock_movements OUT record
        db.prepare(`
          DELETE FROM stock_movements
          WHERE tenant_id = ? AND repair_order_id = ? AND sparepart_id = ? AND type = 'OUT' AND quantity = ?
          LIMIT 1
        `).run(tenantId, ro.id, attachedItem.sparepart_id, attachedItem.quantity);

        // 3. Remove ro_spareparts entry
        db.prepare('DELETE FROM ro_spareparts WHERE id = ?').run(attachedItem.id);

        // 4. Recalculate repair_orders totals
        const sumRow = db.prepare(`
          SELECT COALESCE(SUM(subtotal), 0) as total_parts
          FROM ro_spareparts
          WHERE tenant_id = ? AND repair_order_id = ?
        `).get(tenantId, ro.id);

        const newSparepartFee = Number(sumRow.total_parts || 0);
        const serviceFee = Number(ro.service_fee || 0);
        const discount = Number(ro.discount || 0);
        const newTotalCost = Math.max(0, serviceFee + newSparepartFee - discount);

        db.prepare(`
          UPDATE repair_orders
          SET sparepart_fee = ?, total_cost = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(newSparepartFee, newTotalCost, ro.id);
      });

      detachTx();

      res.json({
        success: true,
        message: 'Sparepart berhasil dilepas dan stok inventaris dikembalikan.'
      });
    } catch (err) {
      next(err);
    }
  });

  // 8. POST /api/repair-orders/:id/photos (Upload photo for BEFORE, PROGRESS, AFTER stage)
  router.post('/:id/photos', requireAuth, uploadSingle('ro', 'photo'), async (req, res, next) => {
    try {
      const tenantId = getTenantId(req);
      const targetId = req.params.id;

      const ro = db.prepare(`
        SELECT * FROM repair_orders
        WHERE tenant_id = ? AND (id = ? OR ro_number = ?)
        LIMIT 1
      `).get(tenantId, targetId, targetId);

      if (!ro) {
        return res.status(404).json({ error: 'Repair Order tidak ditemukan.' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'File foto wajib diunggah.' });
      }

      const rawStage = (req.body.stage || 'PROGRESS').trim().toUpperCase();
      const validStages = ['BEFORE', 'PROGRESS', 'AFTER'];
      const stage = validStages.includes(rawStage) ? rawStage : 'PROGRESS';
      const caption = (req.body.caption || '').trim() || null;

      const photoId = crypto.randomUUID();
      const photoUrl = req.file.relativeUrl || `/uploads/ro/${req.file.filename}`;

      db.prepare(`
        INSERT INTO ro_photos (id, tenant_id, repair_order_id, photo_url, stage, caption)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(photoId, tenantId, ro.id, photoUrl, stage, caption);

      const inserted = db.prepare('SELECT * FROM ro_photos WHERE id = ?').get(photoId);

      res.status(201).json({
        success: true,
        photo: inserted
      });
    } catch (err) {
      next(err);
    }
  });

  // 9. DELETE /api/repair-orders/:id/photos/:photoId (Delete photo)
  router.delete('/:id/photos/:photoId', requireAuth, async (req, res, next) => {
    try {
      const tenantId = getTenantId(req);
      const targetId = req.params.id;
      const photoId = req.params.photoId;

      const photo = db.prepare(`
        SELECT * FROM ro_photos
        WHERE tenant_id = ? AND repair_order_id = ? AND id = ?
      `).get(tenantId, targetId, photoId);

      if (!photo) {
        return res.status(404).json({ error: 'Foto tidak ditemukan.' });
      }

      db.prepare('DELETE FROM ro_photos WHERE id = ?').run(photo.id);

      if (photo.photo_url) {
        const fullPath = path.join(process.cwd(), photo.photo_url.replace(/^\//, ''));
        if (fs.existsSync(fullPath)) {
          try {
            fs.unlinkSync(fullPath);
          } catch {
            // Ignore error on unlinking
          }
        }
      }

      res.json({ success: true, message: 'Foto berhasil dihapus.' });
    } catch (err) {
      next(err);
    }
  });

  // 10. GET /api/repair-orders/:id/invoice-pdf (and /invoice/pdf) - Stream invoice PDF
  async function handleInvoicePdf(req, res, next) {
    try {
      const tenantId = getTenantId(req);
      const targetId = req.params.id;

      const ro = db.prepare(`
        SELECT * FROM repair_orders
        WHERE tenant_id = ? AND (id = ? OR ro_number = ?)
        LIMIT 1
      `).get(tenantId, targetId, targetId);

      if (!ro) {
        return res.status(404).json({ error: 'Repair Order tidak ditemukan.' });
      }

      const spareparts = db.prepare(`
        SELECT * FROM ro_spareparts
        WHERE tenant_id = ? AND repair_order_id = ?
        ORDER BY created_at ASC
      `).all(tenantId, ro.id);

      const logs = db.prepare(`
        SELECT * FROM ro_status_logs
        WHERE tenant_id = ? AND repair_order_id = ?
        ORDER BY created_at ASC
      `).all(tenantId, ro.id);

      const settings = db.prepare('SELECT * FROM tenant_settings WHERE tenant_id = ?').get(tenantId) || {};
      const tenant = req.tenant || db.prepare('SELECT * FROM tenants WHERE id = ?').get(tenantId);

      const pdfBuffer = await generateInvoicePdf(tenant, ro, spareparts, { settings, logs });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="invoice-${ro.ro_number}.pdf"`);
      res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }

  router.get('/:id/invoice-pdf', requireAuth, handleInvoicePdf);
  router.get('/:id/invoice/pdf', requireAuth, handleInvoicePdf);

  return router;
}

export default repairOrdersRoutes;
