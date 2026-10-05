import { Router } from 'express';
import { z } from 'zod';
import crypto from 'node:crypto';
import { requireAuth } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';
import { generateCsv } from '../services/csvService.js';
import { 
  generateInventoryPdf, 
  generateLowStockPdf, 
  generateValuationPdf 
} from '../services/pdfService.js';

/**
 * Profit margin calculation according to R3, E08 (divide by zero safety), and E09 (loss)
 */
export function calculateProfitMargin(buyPrice, sellPrice) {
  const buy = Number(buyPrice) || 0;
  const sell = Number(sellPrice) || 0;
  const nominal = sell - buy;

  let percentage = 0;
  if (sell > 0) {
    percentage = ((sell - buy) / sell) * 100;
  } else if (sell === 0 && buy > 0) {
    percentage = -100;
  } else {
    // Both 0 or gift item (E08 safe fallback)
    percentage = 0;
  }

  const safePercentage = Number.isFinite(percentage) ? Math.round(percentage * 100) / 100 : 0;

  return {
    nominal,
    percentage: safePercentage,
    isProfit: nominal > 0,
    isLoss: nominal < 0
  };
}

/**
 * Decorate raw DB row with margin metrics, status, and bilingual properties
 */
export function formatSparepart(row) {
  if (!row) return null;
  const buy = Number(row.buy_price) || 0;
  const sell = Number(row.sell_price) || 0;
  const stock = Number(row.stock) || 0;
  const minStock = Number(row.min_stock) || 0;

  const margin = calculateProfitMargin(buy, sell);

  let stockStatus = 'in_stock';
  let badgeColor = 'green';
  if (stock === 0) {
    stockStatus = 'out_of_stock';
    badgeColor = 'red';
  } else if (stock <= minStock) {
    stockStatus = 'low_stock';
    badgeColor = 'yellow';
  }

  return {
    ...row,
    stock,
    min_stock: minStock,
    buy_price: buy,
    sell_price: sell,
    // Indonesian aliases for UI ergonomics
    nama: row.name,
    kategori: row.category,
    satuan: row.unit,
    stok: stock,
    stokMinimum: minStock,
    hargaBeli: buy,
    hargaJual: sell,
    // Margin computations
    profit_margin_nominal: margin.nominal,
    profit_margin_percent: margin.percentage,
    profitMarginNominal: margin.nominal,
    profitMarginPercent: margin.percentage,
    is_profit: margin.isProfit,
    is_loss: margin.isLoss,
    isProfit: margin.isProfit,
    isLoss: margin.isLoss,
    // Status indicators
    stock_status: stockStatus,
    stockStatus,
    badge_color: badgeColor
  };
}

export function inventoryRoutes(db) {
  const router = Router();

  // All inventory endpoints require authentication
  router.use(requireAuth);

  // -----------------------------------------------------------
  // Validation Schemas
  // -----------------------------------------------------------
  const CreatePartSchema = z.object({
    sku: z.string().trim().min(1, 'SKU/Kode barang wajib diisi').max(50),
    name: z.string().trim().min(1).max(150).optional(),
    nama: z.string().trim().min(1).max(150).optional(),
    category: z.string().trim().min(1).max(50).optional(),
    kategori: z.string().trim().min(1).max(50).optional(),
    unit: z.string().trim().max(20).optional(),
    satuan: z.string().trim().max(20).optional(),
    stock: z.coerce.number().int().nonnegative().optional(),
    stok: z.coerce.number().int().nonnegative().optional(),
    min_stock: z.coerce.number().int().nonnegative().optional(),
    minStock: z.coerce.number().int().nonnegative().optional(),
    stokMinimum: z.coerce.number().int().nonnegative().optional(),
    buy_price: z.coerce.number().nonnegative().optional(),
    buyPrice: z.coerce.number().nonnegative().optional(),
    hargaBeli: z.coerce.number().nonnegative().optional(),
    sell_price: z.coerce.number().nonnegative().optional(),
    sellPrice: z.coerce.number().nonnegative().optional(),
    hargaJual: z.coerce.number().nonnegative().optional(),
    supplier: z.string().trim().max(100).nullable().optional(),
    photo_url: z.string().trim().nullable().optional(),
    photoUrl: z.string().trim().nullable().optional()
  }).refine(data => data.name || data.nama, {
    message: 'Nama sparepart wajib diisi',
    path: ['name']
  }).refine(data => data.category || data.kategori, {
    message: 'Kategori sparepart wajib diisi',
    path: ['category']
  });

  const UpdatePartSchema = z.object({
    sku: z.string().trim().min(1).max(50).optional(),
    name: z.string().trim().min(1).max(150).optional(),
    nama: z.string().trim().min(1).max(150).optional(),
    category: z.string().trim().min(1).max(50).optional(),
    kategori: z.string().trim().min(1).max(50).optional(),
    unit: z.string().trim().max(20).optional(),
    satuan: z.string().trim().max(20).optional(),
    stock: z.coerce.number().int().nonnegative().optional(),
    stok: z.coerce.number().int().nonnegative().optional(),
    min_stock: z.coerce.number().int().nonnegative().optional(),
    minStock: z.coerce.number().int().nonnegative().optional(),
    stokMinimum: z.coerce.number().int().nonnegative().optional(),
    buy_price: z.coerce.number().nonnegative().optional(),
    buyPrice: z.coerce.number().nonnegative().optional(),
    hargaBeli: z.coerce.number().nonnegative().optional(),
    sell_price: z.coerce.number().nonnegative().optional(),
    sellPrice: z.coerce.number().nonnegative().optional(),
    hargaJual: z.coerce.number().nonnegative().optional(),
    supplier: z.string().trim().max(100).nullable().optional(),
    photo_url: z.string().trim().nullable().optional(),
    photoUrl: z.string().trim().nullable().optional(),
    is_active: z.coerce.number().int().optional()
  });

  // -----------------------------------------------------------
  // 1. Photo Upload Endpoint
  // -----------------------------------------------------------
  router.post('/upload', uploadSingle('inventory', 'photo'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Tidak ada file yang diunggah' });
    }
    res.json({
      success: true,
      url: req.file.relativeUrl,
      filename: req.file.filename
    });
  });

  // -----------------------------------------------------------
  // 2. Valuation Report & Statistics Endpoints (JSON, CSV, PDF)
  // -----------------------------------------------------------
  function computeValuationMetrics(tenantId) {
    const items = db.prepare(`
      SELECT * FROM spareparts 
      WHERE tenant_id = ? AND is_active = 1
      ORDER BY name ASC
    `).all(tenantId);

    let totalBuyValue = 0;
    let totalSellValue = 0;
    let totalStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const formatted = items.map(item => {
      const f = formatSparepart(item);
      const buySub = f.stock * f.buy_price;
      const sellSub = f.stock * f.sell_price;
      totalBuyValue += buySub;
      totalSellValue += sellSub;
      totalStockCount += f.stock;
      if (f.stock === 0) outOfStockCount++;
      else if (f.stock <= f.min_stock) lowStockCount++;
      return f;
    });

    const potentialGrossProfit = totalSellValue - totalBuyValue;
    const overallMargin = calculateProfitMargin(totalBuyValue, totalSellValue);

    return {
      items: formatted,
      total_items: items.length,
      totalItems: items.length,
      total_stock_count: totalStockCount,
      totalStockCount,
      total_buy_value: totalBuyValue,
      totalBuyValue,
      total_sell_value: totalSellValue,
      totalSellValue,
      potential_gross_profit: potentialGrossProfit,
      potentialGrossProfit,
      profit_margin_percent: overallMargin.percentage,
      profitMarginPercent: overallMargin.percentage,
      low_stock_items_count: lowStockCount,
      lowStockItemsCount: lowStockCount,
      out_of_stock_items_count: outOfStockCount,
      outOfStockItemsCount: outOfStockCount
    };
  }

  // GET /api/inventory/reports/valuation
  router.get('/reports/valuation', (req, res, next) => {
    try {
      const data = computeValuationMetrics(req.tenantId);
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/inventory/reports/valuation/csv (and alias /export/valuation/csv)
  const handleValuationCsv = (req, res, next) => {
    try {
      const valuation = computeValuationMetrics(req.tenantId);
      const headers = ['SKU', 'Nama Sparepart', 'Kategori', 'Satuan', 'Stok', 'Harga Beli Satuan', 'Harga Jual Satuan', 'Total Modal Beli', 'Total Nilai Jual', 'Potensi Margin Laba (Rp)', 'Status'];
      const rows = valuation.items.map(i => [
        i.sku,
        i.name,
        i.category,
        i.unit,
        i.stock,
        i.buy_price,
        i.sell_price,
        i.stock * i.buy_price,
        i.stock * i.sell_price,
        (i.stock * i.sell_price) - (i.stock * i.buy_price),
        i.stock === 0 ? 'Habis' : (i.stock <= i.min_stock ? 'Menipis' : 'Aman')
      ]);

      const csvContent = generateCsv(headers, rows);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="valuasi-inventaris.csv"');
      res.status(200).send(csvContent);
    } catch (err) {
      next(err);
    }
  };
  router.get('/reports/valuation/csv', handleValuationCsv);
  router.get('/export/valuation/csv', handleValuationCsv);

  // GET /api/inventory/reports/valuation/pdf (and alias /export/valuation/pdf)
  const handleValuationPdf = async (req, res, next) => {
    try {
      const tenant = req.tenant;
      const valuation = computeValuationMetrics(req.tenantId);
      const pdfBuffer = await generateValuationPdf(tenant, valuation, valuation.items);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="laporan-valuasi-inventaris.pdf"');
      res.status(200).send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  };
  router.get('/reports/valuation/pdf', handleValuationPdf);
  router.get('/export/valuation/pdf', handleValuationPdf);

  // GET /api/inventory/export/low-stock/pdf (and alias /reports/low-stock/pdf)
  const handleLowStockPdf = async (req, res, next) => {
    try {
      const tenant = req.tenant;
      const raw = db.prepare(`
        SELECT * FROM spareparts 
        WHERE tenant_id = ? AND is_active = 1 AND stock <= min_stock
        ORDER BY stock ASC, name ASC
      `).all(req.tenantId);

      const items = raw.map(formatSparepart);
      const pdfBuffer = await generateLowStockPdf(tenant, items);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="laporan-stok-kritis.pdf"');
      res.status(200).send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  };
  router.get('/export/low-stock/pdf', handleLowStockPdf);
  router.get('/reports/low-stock/pdf', handleLowStockPdf);

  // -----------------------------------------------------------
  // 3. Inventory CSV & PDF Full Exports
  // -----------------------------------------------------------
  // GET /api/inventory/export/csv
  router.get('/export/csv', (req, res, next) => {
    try {
      const raw = db.prepare(`
        SELECT * FROM spareparts 
        WHERE tenant_id = ? AND is_active = 1
        ORDER BY category ASC, name ASC
      `).all(req.tenantId);

      const items = raw.map(formatSparepart);

      const headers = [
        'SKU', 
        'Nama Sparepart', 
        'Kategori', 
        'Satuan', 
        'Stok', 
        'Stok Minimum', 
        'Harga Beli (Rp)', 
        'Harga Jual (Rp)', 
        'Margin Nominal (Rp)', 
        'Margin (%)', 
        'Supplier', 
        'Status Stok'
      ];

      const rows = items.map(i => [
        i.sku,
        i.name,
        i.category,
        i.unit,
        i.stock,
        i.min_stock,
        i.buy_price,
        i.sell_price,
        i.profit_margin_nominal,
        `${i.profit_margin_percent}%`,
        i.supplier || '',
        i.stock === 0 ? 'Habis' : (i.stock <= i.min_stock ? 'Menipis' : 'Tersedia')
      ]);

      const csvContent = generateCsv(headers, rows);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="daftar-inventaris.csv"');
      res.status(200).send(csvContent);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/inventory/export/pdf
  router.get('/export/pdf', async (req, res, next) => {
    try {
      const tenant = req.tenant;
      const raw = db.prepare(`
        SELECT * FROM spareparts 
        WHERE tenant_id = ? AND is_active = 1
        ORDER BY category ASC, name ASC
      `).all(req.tenantId);

      const items = raw.map(formatSparepart);
      const pdfBuffer = await generateInventoryPdf(tenant, items);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="daftar-inventaris.pdf"');
      res.status(200).send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  });

  // -----------------------------------------------------------
  // 4. List Inventory with Advanced Search, Filter & Pagination
  // -----------------------------------------------------------
  // GET /api/inventory
  router.get('/', (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const {
        search,
        category,
        stock_status,
        stockStatus,
        min_price,
        max_price,
        sort_by,
        sortBy,
        sort_order,
        sortOrder,
        page = 1,
        limit = 20
      } = req.query;

      let conditions = ['tenant_id = ?', 'is_active = 1'];
      let params = [tenantId];

      // Full-text search by name or SKU
      if (search && search.trim()) {
        const queryTerm = `%${search.trim()}%`;
        conditions.push('(name LIKE ? OR sku LIKE ?)');
        params.push(queryTerm, queryTerm);
      }

      // Filter by category
      if (category && category.trim()) {
        conditions.push('category = ?');
        params.push(category.trim());
      }

      // Filter by stock status
      const statusFilter = stock_status || stockStatus;
      if (statusFilter === 'out_of_stock' || statusFilter === 'habis') {
        conditions.push('stock = 0');
      } else if (statusFilter === 'low_stock' || statusFilter === 'menipis') {
        conditions.push('stock > 0 AND stock <= min_stock');
      } else if (statusFilter === 'in_stock' || statusFilter === 'aman') {
        conditions.push('stock > min_stock');
      }

      // Price range filters (matches sell price)
      if (min_price !== undefined && min_price !== '') {
        const minP = Number(min_price);
        if (!isNaN(minP)) {
          conditions.push('sell_price >= ?');
          params.push(minP);
        }
      }
      if (max_price !== undefined && max_price !== '') {
        const maxP = Number(max_price);
        if (!isNaN(maxP)) {
          conditions.push('sell_price <= ?');
          params.push(maxP);
        }
      }

      const whereClause = conditions.join(' AND ');

      // Count total matching items
      const countRow = db.prepare(`SELECT COUNT(*) AS total FROM spareparts WHERE ${whereClause}`).get(...params);
      const total = countRow.total;

      // Sorting
      const validSortCols = {
        name: 'name',
        sku: 'sku',
        stock: 'stock',
        stok: 'stock',
        buy_price: 'buy_price',
        hargaBeli: 'buy_price',
        sell_price: 'sell_price',
        hargaJual: 'sell_price',
        created_at: 'created_at'
      };
      const requestedSort = sort_by || sortBy || 'created_at';
      const sortCol = validSortCols[requestedSort] || 'created_at';
      const sortDir = (sort_order || sortOrder || 'desc').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      // Pagination
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = parseInt(limit, 10);
      const isUnlimited = limitNum <= 0 || isNaN(limitNum);

      let query = `
        SELECT * FROM spareparts 
        WHERE ${whereClause}
        ORDER BY ${sortCol} ${sortDir}
      `;

      let queryParams = [...params];
      if (!isUnlimited) {
        query += ' LIMIT ? OFFSET ?';
        queryParams.push(limitNum, (pageNum - 1) * limitNum);
      }

      const rows = db.prepare(query).all(...queryParams);
      const formattedItems = rows.map(formatSparepart);

      // Category aggregation for filter tabs
      const categoryRows = db.prepare(`
        SELECT category, COUNT(*) as count 
        FROM spareparts 
        WHERE tenant_id = ? AND is_active = 1 
        GROUP BY category
      `).all(tenantId);

      const totalPages = isUnlimited ? 1 : Math.ceil(total / (limitNum || 1));

      res.json({
        success: true,
        items: formattedItems,
        data: formattedItems,
        pagination: {
          page: pageNum,
          limit: isUnlimited ? total : limitNum,
          total,
          totalPages
        },
        categories: categoryRows,
        summary: {
          totalItems: total,
          returnedItems: formattedItems.length
        }
      });
    } catch (err) {
      next(err);
    }
  });

  // -----------------------------------------------------------
  // 5. Create New Sparepart
  // -----------------------------------------------------------
  // POST /api/inventory
  router.post('/', (req, res, next) => {
    try {
      const parsed = CreatePartSchema.parse(req.body);
      const tenantId = req.tenantId;

      const sku = parsed.sku.trim();
      const name = (parsed.name || parsed.nama).trim();
      const category = (parsed.category || parsed.kategori).trim();
      const unit = (parsed.unit || parsed.satuan || 'pcs').trim();
      const stock = parsed.stock !== undefined ? parsed.stock : (parsed.stok !== undefined ? parsed.stok : 0);
      const minStock = parsed.min_stock !== undefined ? parsed.min_stock : (parsed.minStock !== undefined ? parsed.minStock : (parsed.stokMinimum !== undefined ? parsed.stokMinimum : 5));
      const buyPrice = parsed.buy_price !== undefined ? parsed.buy_price : (parsed.buyPrice !== undefined ? parsed.buyPrice : (parsed.hargaBeli !== undefined ? parsed.hargaBeli : 0));
      const sellPrice = parsed.sell_price !== undefined ? parsed.sell_price : (parsed.sellPrice !== undefined ? parsed.sellPrice : (parsed.hargaJual !== undefined ? parsed.hargaJual : 0));
      const supplier = parsed.supplier ? parsed.supplier.trim() : null;
      const photoUrl = parsed.photo_url || parsed.photoUrl || null;

      // Check unique SKU for tenant
      const existing = db.prepare('SELECT id FROM spareparts WHERE tenant_id = ? AND sku = ?').get(tenantId, sku);
      if (existing) {
        return res.status(409).json({
          error: 'SKU Collision',
          message: `SKU '${sku}' sudah digunakan untuk sparepart lain di bengkel ini.`
        });
      }

      const id = crypto.randomUUID();

      db.prepare(`
        INSERT INTO spareparts (
          id, tenant_id, sku, name, category, unit,
          min_stock, stock, buy_price, sell_price,
          supplier, photo_url, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `).run(
        id, tenantId, sku, name, category, unit,
        minStock, stock, buyPrice, sellPrice,
        supplier, photoUrl
      );

      // If initial stock > 0, log initial stock movement
      if (stock > 0) {
        db.prepare(`
          INSERT INTO stock_movements (
            id, tenant_id, sparepart_id, type, quantity,
            unit_price, total_price, date, notes
          ) VALUES (?, ?, ?, 'IN', ?, ?, ?, date('now'), 'Saldo stok awal saat pembuatan item')
        `).run(crypto.randomUUID(), tenantId, id, stock, buyPrice, stock * buyPrice);
      }

      const created = db.prepare('SELECT * FROM spareparts WHERE id = ?').get(id);
      const formatted = formatSparepart(created);

      res.status(201).json({
        success: true,
        id,
        item: formatted,
        profit_margin_nominal: formatted.profit_margin_nominal,
        profit_margin_percent: formatted.profit_margin_percent
      });
    } catch (err) {
      next(err);
    }
  });

  // -----------------------------------------------------------
  // 6. Get Single Sparepart Detail
  // -----------------------------------------------------------
  // GET /api/inventory/:id
  router.get('/:id', (req, res, next) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId;

      const row = db.prepare('SELECT * FROM spareparts WHERE id = ? AND tenant_id = ?').get(id, tenantId);
      if (!row) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Sparepart tidak ditemukan atau tidak dapat diakses.'
        });
      }

      // Fetch recent movements for this item
      const movements = db.prepare(`
        SELECT * FROM stock_movements 
        WHERE tenant_id = ? AND sparepart_id = ? 
        ORDER BY date DESC, created_at DESC 
        LIMIT 10
      `).all(tenantId, id);

      const formatted = formatSparepart(row);

      res.json({
        success: true,
        item: formatted,
        movements
      });
    } catch (err) {
      next(err);
    }
  });

  // -----------------------------------------------------------
  // 7. Update Sparepart
  // -----------------------------------------------------------
  // PUT /api/inventory/:id
  router.put('/:id', (req, res, next) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId;

      const existing = db.prepare('SELECT * FROM spareparts WHERE id = ? AND tenant_id = ?').get(id, tenantId);
      if (!existing) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Sparepart tidak ditemukan.'
        });
      }

      const parsed = UpdatePartSchema.parse(req.body);

      // Check SKU uniqueness if changing
      const newSku = parsed.sku ? parsed.sku.trim() : existing.sku;
      if (newSku !== existing.sku) {
        const skuCheck = db.prepare('SELECT id FROM spareparts WHERE tenant_id = ? AND sku = ? AND id != ?').get(tenantId, newSku, id);
        if (skuCheck) {
          return res.status(409).json({
            error: 'SKU Collision',
            message: `SKU '${newSku}' sudah digunakan oleh item lain.`
          });
        }
      }

      const name = parsed.name || parsed.nama || existing.name;
      const category = parsed.category || parsed.kategori || existing.category;
      const unit = parsed.unit || parsed.satuan || existing.unit;
      const stock = parsed.stock !== undefined ? parsed.stock : (parsed.stok !== undefined ? parsed.stok : existing.stock);
      const minStock = parsed.min_stock !== undefined ? parsed.min_stock : (parsed.minStock !== undefined ? parsed.minStock : (parsed.stokMinimum !== undefined ? parsed.stokMinimum : existing.min_stock));
      const buyPrice = parsed.buy_price !== undefined ? parsed.buy_price : (parsed.buyPrice !== undefined ? parsed.buyPrice : (parsed.hargaBeli !== undefined ? parsed.hargaBeli : existing.buy_price));
      const sellPrice = parsed.sell_price !== undefined ? parsed.sell_price : (parsed.sellPrice !== undefined ? parsed.sellPrice : (parsed.hargaJual !== undefined ? parsed.hargaJual : existing.sell_price));
      const supplier = parsed.supplier !== undefined ? parsed.supplier : existing.supplier;
      const photoUrl = (parsed.photo_url || parsed.photoUrl) !== undefined ? (parsed.photo_url || parsed.photoUrl) : existing.photo_url;
      const isActive = parsed.is_active !== undefined ? parsed.is_active : existing.is_active;

      db.prepare(`
        UPDATE spareparts SET
          sku = ?,
          name = ?,
          category = ?,
          unit = ?,
          stock = ?,
          min_stock = ?,
          buy_price = ?,
          sell_price = ?,
          supplier = ?,
          photo_url = ?,
          is_active = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND tenant_id = ?
      `).run(
        newSku, name, category, unit, stock, minStock, buyPrice, sellPrice,
        supplier, photoUrl, isActive, id, tenantId
      );

      const updated = db.prepare('SELECT * FROM spareparts WHERE id = ?').get(id);
      const formatted = formatSparepart(updated);

      res.json({
        success: true,
        item: formatted
      });
    } catch (err) {
      next(err);
    }
  });

  // -----------------------------------------------------------
  // 8. Delete Sparepart
  // -----------------------------------------------------------
  // DELETE /api/inventory/:id
  router.delete('/:id', (req, res, next) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId;

      const existing = db.prepare('SELECT * FROM spareparts WHERE id = ? AND tenant_id = ?').get(id, tenantId);
      if (!existing) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Sparepart tidak ditemukan.'
        });
      }

      // Check if linked to RO
      const roUsage = db.prepare('SELECT COUNT(*) AS count FROM ro_spareparts WHERE sparepart_id = ? AND tenant_id = ?').get(id, tenantId);
      if (roUsage && roUsage.count > 0) {
        // Soft delete
        db.prepare('UPDATE spareparts SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND tenant_id = ?').run(id, tenantId);
        return res.json({
          success: true,
          message: 'Sparepart dinonaktifkan (karena memiliki riwayat pengerjaan RO).'
        });
      }

      // If has stock movements, soft delete to preserve financial audit trail
      const movementUsage = db.prepare('SELECT COUNT(*) AS count FROM stock_movements WHERE sparepart_id = ? AND tenant_id = ?').get(id, tenantId);
      if (movementUsage && movementUsage.count > 0) {
        db.prepare('UPDATE spareparts SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND tenant_id = ?').run(id, tenantId);
        return res.json({
          success: true,
          message: 'Sparepart dinonaktifkan (karena memiliki riwayat mutasi stok).'
        });
      }

      // Hard delete if clean
      db.prepare('DELETE FROM spareparts WHERE id = ? AND tenant_id = ?').run(id, tenantId);
      res.json({
        success: true,
        message: 'Sparepart berhasil dihapus permanen.'
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

export default inventoryRoutes;
