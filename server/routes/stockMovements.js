import { Router } from 'express';
import { z } from 'zod';
import crypto from 'node:crypto';
import { requireAuth } from '../middleware/auth.js';
import { generateCsv } from '../services/csvService.js';
import { generateStockMovementsPdf } from '../services/pdfService.js';

export function stockMovementsRoutes(db) {
  const router = Router();
  router.use(requireAuth);

  // -----------------------------------------------------------
  // Validation Schemas
  // -----------------------------------------------------------
  const StockInSchema = z.object({
    sparepartId: z.string().trim().min(1).optional(),
    sparepart_id: z.string().trim().min(1).optional(),
    qty: z.coerce.number().int().positive('Jumlah masuk harus lebih besar dari 0').optional(),
    quantity: z.coerce.number().int().positive().optional(),
    tanggal: z.string().trim().optional(),
    date: z.string().trim().optional(),
    buyPrice: z.coerce.number().nonnegative().optional(),
    buy_price: z.coerce.number().nonnegative().optional(),
    unit_price: z.coerce.number().nonnegative().optional(),
    hargaBeli: z.coerce.number().nonnegative().optional(),
    totalPrice: z.coerce.number().nonnegative().optional(),
    total_price: z.coerce.number().nonnegative().optional(),
    supplier: z.string().trim().max(100).nullable().optional(),
    invoiceNumber: z.string().trim().max(100).nullable().optional(),
    invoice_number: z.string().trim().max(100).nullable().optional(),
    catatan: z.string().trim().max(255).nullable().optional(),
    notes: z.string().trim().max(255).nullable().optional(),
    proofPhotoUrl: z.string().trim().nullable().optional(),
    proof_photo_url: z.string().trim().nullable().optional()
  }).refine(data => data.sparepartId || data.sparepart_id, {
    message: 'ID sparepart wajib dipilih',
    path: ['sparepartId']
  }).refine(data => data.qty !== undefined || data.quantity !== undefined, {
    message: 'Jumlah masuk wajib diisi',
    path: ['qty']
  });

  const StockOutSchema = z.object({
    sparepartId: z.string().trim().min(1).optional(),
    sparepart_id: z.string().trim().min(1).optional(),
    qty: z.coerce.number().int().positive('Jumlah keluar harus lebih besar dari 0').optional(),
    quantity: z.coerce.number().int().positive().optional(),
    tanggal: z.string().trim().optional(),
    date: z.string().trim().optional(),
    repairOrderId: z.string().trim().nullable().optional(),
    repair_order_id: z.string().trim().nullable().optional(),
    catatan: z.string().trim().max(255).nullable().optional(),
    notes: z.string().trim().max(255).nullable().optional()
  }).refine(data => data.sparepartId || data.sparepart_id, {
    message: 'ID sparepart wajib dipilih',
    path: ['sparepartId']
  }).refine(data => data.qty !== undefined || data.quantity !== undefined, {
    message: 'Jumlah keluar wajib diisi',
    path: ['qty']
  });

  // -----------------------------------------------------------
  // 1. Barang Masuk (Restock / In)
  // -----------------------------------------------------------
  // POST /api/stock-movements/in
  router.post('/in', (req, res, next) => {
    try {
      const parsed = StockInSchema.parse(req.body);
      const tenantId = req.tenantId;

      const partId = parsed.sparepartId || parsed.sparepart_id;
      const qty = parsed.qty !== undefined ? parsed.qty : parsed.quantity;
      const movementDate = parsed.tanggal || parsed.date || new Date().toISOString().slice(0, 10);
      const buyPrice = parsed.buyPrice ?? parsed.buy_price ?? parsed.unit_price ?? parsed.hargaBeli ?? 0;
      const totalPrice = parsed.totalPrice ?? parsed.total_price ?? (qty * buyPrice);
      const supplier = parsed.supplier || null;
      const invoiceNumber = parsed.invoiceNumber || parsed.invoice_number || null;
      const notes = parsed.catatan || parsed.notes || 'Restock barang masuk';
      const proofPhotoUrl = parsed.proofPhotoUrl || parsed.proof_photo_url || null;

      // Verify sparepart belongs to tenant
      const part = db.prepare('SELECT * FROM spareparts WHERE id = ? AND tenant_id = ?').get(partId, tenantId);
      if (!part) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Sparepart tidak ditemukan di bengkel Anda.'
        });
      }

      const movementId = crypto.randomUUID();

      // Atomic transaction: update stock & insert movement
      const tx = db.transaction(() => {
        db.prepare('UPDATE spareparts SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND tenant_id = ?').run(qty, partId, tenantId);

        // Optionally update buy_price if provided > 0
        if (buyPrice > 0) {
          db.prepare('UPDATE spareparts SET buy_price = ? WHERE id = ? AND tenant_id = ?').run(buyPrice, partId, tenantId);
        }

        db.prepare(`
          INSERT INTO stock_movements (
            id, tenant_id, sparepart_id, type, quantity,
            unit_price, total_price, date, supplier,
            invoice_number, notes, proof_photo_url
          ) VALUES (?, ?, ?, 'IN', ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          movementId, tenantId, partId, qty,
          buyPrice, totalPrice, movementDate, supplier,
          invoiceNumber, notes, proofPhotoUrl
        );
      });

      tx();

      const updatedPart = db.prepare('SELECT * FROM spareparts WHERE id = ? AND tenant_id = ?').get(partId, tenantId);
      const movement = db.prepare('SELECT * FROM stock_movements WHERE id = ? AND tenant_id = ?').get(movementId, tenantId);

      res.status(201).json({
        success: true,
        movement,
        newStock: updatedPart.stock,
        sparepart: updatedPart
      });
    } catch (err) {
      next(err);
    }
  });

  // -----------------------------------------------------------
  // 2. Barang Keluar (Usage / Out) - E10 Protection
  // -----------------------------------------------------------
  // POST /api/stock-movements/out
  router.post('/out', (req, res, next) => {
    try {
      const parsed = StockOutSchema.parse(req.body);
      const tenantId = req.tenantId;

      const partId = parsed.sparepartId || parsed.sparepart_id;
      const qty = parsed.qty !== undefined ? parsed.qty : parsed.quantity;
      const movementDate = parsed.tanggal || parsed.date || new Date().toISOString().slice(0, 10);
      const repairOrderId = parsed.repairOrderId || parsed.repair_order_id || null;
      const notes = parsed.catatan || parsed.notes || 'Pengeluaran/pemakaian sparepart';

      // Verify sparepart belongs to tenant
      const part = db.prepare('SELECT * FROM spareparts WHERE id = ? AND tenant_id = ?').get(partId, tenantId);
      if (!part) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Sparepart tidak ditemukan di bengkel Anda.'
        });
      }

      // E10: Stock Underflow Protection
      if (qty > part.stock) {
        return res.status(422).json({
          error: 'Stok Tidak Mencukupi',
          message: `Stok tidak mencukupi (Tersedia: ${part.stock}, Diminta: ${qty})`,
          availableStock: part.stock,
          requestedQty: qty
        });
      }

      const movementId = crypto.randomUUID();

      // Atomic transaction: decrement stock & insert movement
      const tx = db.transaction(() => {
        db.prepare('UPDATE spareparts SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND tenant_id = ?').run(qty, partId, tenantId);

        db.prepare(`
          INSERT INTO stock_movements (
            id, tenant_id, sparepart_id, type, quantity,
            unit_price, total_price, date, repair_order_id, notes
          ) VALUES (?, ?, ?, 'OUT', ?, ?, ?, ?, ?, ?)
        `).run(
          movementId, tenantId, partId, qty,
          part.sell_price, qty * part.sell_price, movementDate,
          repairOrderId, notes
        );
      });

      tx();

      const updatedPart = db.prepare('SELECT * FROM spareparts WHERE id = ? AND tenant_id = ?').get(partId, tenantId);
      const movement = db.prepare('SELECT * FROM stock_movements WHERE id = ? AND tenant_id = ?').get(movementId, tenantId);

      res.status(201).json({
        success: true,
        movement,
        newStock: updatedPart.stock,
        sparepart: updatedPart
      });
    } catch (err) {
      next(err);
    }
  });

  // -----------------------------------------------------------
  // 3. Export Stock Movements to CSV & PDF
  // -----------------------------------------------------------
  // GET /api/stock-movements/export/csv
  router.get('/export/csv', (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { type, sparepartId, startDate, endDate } = req.query;

      let conditions = ['m.tenant_id = ?'];
      let params = [tenantId];

      if (type) {
        conditions.push('m.type = ?');
        params.push(type.toUpperCase());
      }
      if (sparepartId) {
        conditions.push('m.sparepart_id = ?');
        params.push(sparepartId);
      }
      if (startDate) {
        conditions.push('m.date >= ?');
        params.push(startDate);
      }
      if (endDate) {
        conditions.push('m.date <= ?');
        params.push(endDate);
      }

      const rows = db.prepare(`
        SELECT 
          m.*,
          s.sku AS sparepart_sku,
          s.name AS sparepart_name,
          s.unit AS sparepart_unit
        FROM stock_movements m
        JOIN spareparts s ON m.sparepart_id = s.id
        WHERE ${conditions.join(' AND ')}
        ORDER BY m.date DESC, m.created_at DESC
      `).all(...params);

      const headers = ['Tanggal', 'Tipe Mutasi', 'SKU', 'Nama Sparepart', 'Jumlah', 'Satuan', 'Harga Satuan (Rp)', 'Total (Rp)', 'Supplier/No Faktur', 'Linked RO', 'Catatan'];
      const dataRows = rows.map(r => [
        r.date,
        r.type === 'IN' ? 'MASUK' : (r.type === 'OUT' ? 'KELUAR' : 'PENYESUAIAN'),
        r.sparepart_sku,
        r.sparepart_name,
        r.type === 'OUT' ? -r.quantity : r.quantity,
        r.sparepart_unit || 'pcs',
        r.unit_price,
        r.total_price,
        r.supplier || r.invoice_number || '',
        r.repair_order_id || '',
        r.notes || ''
      ]);

      const csvContent = generateCsv(headers, dataRows);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="riwayat-mutasi-stok.csv"');
      res.status(200).send(csvContent);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/stock-movements/export/pdf
  router.get('/export/pdf', async (req, res, next) => {
    try {
      const tenant = req.tenant;
      const tenantId = req.tenantId;
      const { type, sparepartId, startDate, endDate } = req.query;

      let conditions = ['m.tenant_id = ?'];
      let params = [tenantId];

      if (type) {
        conditions.push('m.type = ?');
        params.push(type.toUpperCase());
      }
      if (sparepartId) {
        conditions.push('m.sparepart_id = ?');
        params.push(sparepartId);
      }
      if (startDate) {
        conditions.push('m.date >= ?');
        params.push(startDate);
      }
      if (endDate) {
        conditions.push('m.date <= ?');
        params.push(endDate);
      }

      const rows = db.prepare(`
        SELECT 
          m.*,
          s.sku AS sparepart_sku,
          s.name AS sparepart_name,
          s.unit AS sparepart_unit
        FROM stock_movements m
        JOIN spareparts s ON m.sparepart_id = s.id
        WHERE ${conditions.join(' AND ')}
        ORDER BY m.date DESC, m.created_at DESC
      `).all(...params);

      const pdfBuffer = await generateStockMovementsPdf(tenant, rows, { type, startDate, endDate });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="riwayat-mutasi-stok.pdf"');
      res.status(200).send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  });

  // -----------------------------------------------------------
  // 4. Movement History per Item
  // -----------------------------------------------------------
  router.get('/item/:id', (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const partId = req.params.id;

      const part = db.prepare('SELECT * FROM spareparts WHERE id = ? AND tenant_id = ?').get(partId, tenantId);
      if (!part) {
        return res.status(404).json({ error: 'Sparepart tidak ditemukan' });
      }

      const rows = db.prepare(`
        SELECT 
          m.*,
          s.sku AS sparepart_sku,
          s.name AS sparepart_name,
          s.unit AS sparepart_unit
        FROM stock_movements m
        JOIN spareparts s ON m.sparepart_id = s.id
        WHERE m.tenant_id = ? AND m.sparepart_id = ?
        ORDER BY m.date DESC, m.created_at DESC
      `).all(tenantId, partId);

      res.json({
        success: true,
        sparepart: part,
        movements: rows,
        mutations: rows
      });
    } catch (err) {
      next(err);
    }
  });

  // -----------------------------------------------------------
  // 5. Global Movement List with Filter & Pagination
  // -----------------------------------------------------------
  router.get('/', (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const {
        sparepartId,
        sparepart_id,
        type,
        startDate,
        endDate,
        search,
        page = 1,
        limit = 20
      } = req.query;

      let conditions = ['m.tenant_id = ?'];
      let params = [tenantId];

      const partFilter = sparepartId || sparepart_id;
      if (partFilter) {
        conditions.push('m.sparepart_id = ?');
        params.push(partFilter);
      }

      if (type) {
        conditions.push('m.type = ?');
        params.push(type.toUpperCase());
      }

      if (startDate) {
        conditions.push('m.date >= ?');
        params.push(startDate);
      }

      if (endDate) {
        conditions.push('m.date <= ?');
        params.push(endDate);
      }

      if (search && search.trim()) {
        const term = `%${search.trim()}%`;
        conditions.push('(s.name LIKE ? OR s.sku LIKE ? OR m.notes LIKE ? OR m.invoice_number LIKE ?)');
        params.push(term, term, term, term);
      }

      const whereClause = conditions.join(' AND ');

      const countRow = db.prepare(`
        SELECT COUNT(*) AS total 
        FROM stock_movements m
        JOIN spareparts s ON m.sparepart_id = s.id
        WHERE ${whereClause}
      `).get(...params);
      const total = countRow.total;

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = parseInt(limit, 10);
      const isUnlimited = limitNum <= 0 || isNaN(limitNum);

      let query = `
        SELECT 
          m.*,
          s.sku AS sparepart_sku,
          s.name AS sparepart_name,
          s.unit AS sparepart_unit,
          s.category AS sparepart_category
        FROM stock_movements m
        JOIN spareparts s ON m.sparepart_id = s.id
        WHERE ${whereClause}
        ORDER BY m.date DESC, m.created_at DESC
      `;

      let queryParams = [...params];
      if (!isUnlimited) {
        query += ' LIMIT ? OFFSET ?';
        queryParams.push(limitNum, (pageNum - 1) * limitNum);
      }

      const rows = db.prepare(query).all(...queryParams);
      const totalPages = isUnlimited ? 1 : Math.ceil(total / (limitNum || 1));

      res.json({
        success: true,
        movements: rows,
        mutations: rows,
        data: rows,
        pagination: {
          page: pageNum,
          limit: isUnlimited ? total : limitNum,
          total,
          totalPages
        }
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

// -----------------------------------------------------------
// Stock Opname Dedicated Router (/api/stock-opname)
// -----------------------------------------------------------
export function stockOpnameRoutes(db) {
  const router = Router();
  router.use(requireAuth);

  const StockOpnameSchema = z.object({
    sparepartId: z.string().trim().min(1).optional(),
    sparepart_id: z.string().trim().min(1).optional(),
    stokFisik: z.coerce.number().int().nonnegative('Stok fisik tidak boleh bernilai negatif').optional(),
    physical_stock: z.coerce.number().int().nonnegative().optional(),
    physicalStock: z.coerce.number().int().nonnegative().optional(),
    tanggal: z.string().trim().optional(),
    date: z.string().trim().optional(),
    alasan: z.string().trim().min(1, 'Alasan penyesuaian opname wajib diisi').optional(),
    reason: z.string().trim().min(1).optional()
  }).refine(data => data.sparepartId || data.sparepart_id, {
    message: 'ID sparepart wajib dipilih',
    path: ['sparepartId']
  }).refine(data => data.stokFisik !== undefined || data.physical_stock !== undefined || data.physicalStock !== undefined, {
    message: 'Stok fisik wajib diisi',
    path: ['stokFisik']
  }).refine(data => data.alasan || data.reason, {
    message: 'Alasan penyesuaian wajib diisi',
    path: ['alasan']
  });

  // POST /api/stock-opname
  router.post('/', (req, res, next) => {
    try {
      const parsed = StockOpnameSchema.parse(req.body);
      const tenantId = req.tenantId;

      const partId = parsed.sparepartId || parsed.sparepart_id;
      const physicalStock = parsed.stokFisik !== undefined ? parsed.stokFisik : (parsed.physical_stock !== undefined ? parsed.physical_stock : parsed.physicalStock);
      const date = parsed.tanggal || parsed.date || new Date().toISOString().slice(0, 10);
      const reason = parsed.alasan || parsed.reason;

      const part = db.prepare('SELECT * FROM spareparts WHERE id = ? AND tenant_id = ?').get(partId, tenantId);
      if (!part) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Sparepart tidak ditemukan di bengkel Anda.'
        });
      }

      const systemStock = part.stock;
      // E11: Negative difference handling (discrepancy < 0)
      const difference = physicalStock - systemStock;

      const opnameId = crypto.randomUUID();
      const movementId = crypto.randomUUID();

      // Atomic adjustment
      const tx = db.transaction(() => {
        // Adjust item stock to exact physical count
        db.prepare('UPDATE spareparts SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND tenant_id = ?').run(physicalStock, partId, tenantId);

        // Record in stock_opnames table
        db.prepare(`
          INSERT INTO stock_opnames (
            id, tenant_id, sparepart_id, system_stock,
            physical_stock, difference, reason, date
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          opnameId, tenantId, partId, systemStock,
          physicalStock, difference, reason, date
        );

        // Record in stock_movements as ADJUSTMENT
        db.prepare(`
          INSERT INTO stock_movements (
            id, tenant_id, sparepart_id, type, quantity,
            unit_price, total_price, date, notes
          ) VALUES (?, ?, ?, 'ADJUSTMENT', ?, ?, ?, ?, ?)
        `).run(
          movementId, tenantId, partId, Math.abs(difference),
          part.buy_price, Math.abs(difference) * part.buy_price, date,
          `Stok Opname: Selisih ${difference >= 0 ? '+' : ''}${difference} (${reason})`
        );
      });

      tx();

      const opnameRecord = db.prepare('SELECT * FROM stock_opnames WHERE id = ? AND tenant_id = ?').get(opnameId, tenantId);
      const updatedPart = db.prepare('SELECT * FROM spareparts WHERE id = ? AND tenant_id = ?').get(partId, tenantId);

      res.status(201).json({
        success: true,
        opname: opnameRecord,
        newStock: updatedPart.stock,
        difference,
        sparepart: updatedPart
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/stock-opname
  router.get('/', (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { sparepartId, page = 1, limit = 20 } = req.query;

      let conditions = ['o.tenant_id = ?'];
      let params = [tenantId];

      if (sparepartId) {
        conditions.push('o.sparepart_id = ?');
        params.push(sparepartId);
      }

      const whereClause = conditions.join(' AND ');

      const countRow = db.prepare(`SELECT COUNT(*) AS total FROM stock_opnames o WHERE ${whereClause}`).get(...params);
      const total = countRow.total;

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = parseInt(limit, 10) || 20;

      const rows = db.prepare(`
        SELECT 
          o.*,
          s.sku AS sparepart_sku,
          s.name AS sparepart_name,
          s.unit AS sparepart_unit,
          s.category AS sparepart_category
        FROM stock_opnames o
        JOIN spareparts s ON o.sparepart_id = s.id
        WHERE ${whereClause}
        ORDER BY o.date DESC, o.created_at DESC
        LIMIT ? OFFSET ?
      `).all(...params, limitNum, (pageNum - 1) * limitNum);

      res.json({
        success: true,
        opnames: rows,
        data: rows,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

export default stockMovementsRoutes;
