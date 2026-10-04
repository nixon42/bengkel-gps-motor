import { Router } from 'express';
import { z } from 'zod';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { requireAuth } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';
import { generateCsv } from '../services/csvService.js';
import { 
  generatePnlPdf, 
  generateDailyRecapPdf,
  generateCategoryBreakdownPdf,
  formatRupiah,
  formatDateIndo
} from '../services/pdfService.js';

/**
 * Standard 9 Default Categories (R4, F27)
 */
export const DEFAULT_CATEGORIES = [
  { name: 'Jasa Servis', type: 'INCOME' },
  { name: 'Penjualan Sparepart', type: 'INCOME' },
  { name: 'Pendapatan Lain-lain', type: 'INCOME' },
  { name: 'Beli Sparepart / Stok', type: 'EXPENSE' },
  { name: 'Listrik, Air & Internet', type: 'EXPENSE' },
  { name: 'Sewa Tempat & Bangunan', type: 'EXPENSE' },
  { name: 'Gaji Mekanik & Karyawan', type: 'EXPENSE' },
  { name: 'Tools & Perlengkapan Bengkel', type: 'EXPENSE' },
  { name: 'Operasional Lain-lain', type: 'EXPENSE' }
];

/**
 * Self-healing seeder for tenant default categories
 */
export function seedDefaultCategoriesIfEmpty(db, tenantId) {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM transaction_categories WHERE tenant_id = ?').get(tenantId);
  if (countRow && countRow.count > 0) {
    return;
  }

  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO transaction_categories (id, tenant_id, name, type, is_default)
    VALUES (?, ?, ?, ?, 1)
  `);

  const runSeeding = db.transaction(() => {
    for (const cat of DEFAULT_CATEGORIES) {
      insertStmt.run(crypto.randomUUID(), tenantId, cat.name, cat.type);
    }
  });

  runSeeding();
}

/**
 * Decorate transaction row with bilingual aliases
 */
export function formatTransaction(row) {
  if (!row) return null;
  const amount = Number(row.amount) || 0;
  return {
    id: row.id,
    category_id: row.category_id,
    categoryId: row.category_id,
    kategoriId: row.category_id,
    category_name: row.category_name || row.categoryName || '',
    category_type: row.category_type || row.type,
    type: row.type,
    tipe: row.type,
    amount,
    nominal: amount,
    date: row.date,
    tanggal: row.date,
    description: row.description || '',
    deskripsi: row.description || '',
    payment_method: row.payment_method,
    paymentMethod: row.payment_method,
    metodePembayaran: row.payment_method,
    receipt_url: row.receipt_url || null,
    receiptUrl: row.receipt_url || null,
    bukti_url: row.receipt_url || null,
    repair_order_id: row.repair_order_id || null,
    repairOrderId: row.repair_order_id || null,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

/**
 * Decorate category row with bilingual aliases
 */
export function formatCategory(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    nama: row.name,
    type: row.type,
    tipe: row.type,
    is_default: Boolean(row.is_default),
    isDefault: Boolean(row.is_default),
    created_at: row.created_at
  };
}

/**
 * Helper to get local date string YYYY-MM-DD
 */
function getTodayDateString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Helper to compute date range based on period
 */
function getPeriodDateRange(period = 'month', customStart, customEnd) {
  if (customStart && customEnd) {
    return { startDate: customStart, endDate: customEnd, periodLabel: `${customStart} s/d ${customEnd}` };
  }

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const todayStr = getTodayDateString();

  switch (period) {
    case 'today':
      return { startDate: todayStr, endDate: todayStr, periodLabel: `Hari Ini (${formatDateIndo(todayStr)})` };
    case 'week': {
      const day = now.getDay();
      const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now.setDate(diffToMonday));
      const mY = monday.getFullYear();
      const mM = String(monday.getMonth() + 1).padStart(2, '0');
      const mD = String(monday.getDate()).padStart(2, '0');
      const monStr = `${mY}-${mM}-${mD}`;
      return { startDate: monStr, endDate: todayStr, periodLabel: `Minggu Ini (${formatDateIndo(monStr)} - ${formatDateIndo(todayStr)})` };
    }
    case 'year': {
      const yearStart = `${yyyy}-01-01`;
      return { startDate: yearStart, endDate: todayStr, periodLabel: `Tahun Ini (${yyyy})` };
    }
    case 'all':
      return { startDate: null, endDate: null, periodLabel: 'Semua Periode' };
    case 'month':
    default: {
      const monthStart = `${yyyy}-${mm}-01`;
      const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      return { startDate: monthStart, endDate: todayStr, periodLabel: `Bulan Ini (${monthNames[now.getMonth()]} ${yyyy})` };
    }
  }
}

export function financeRoutes(db) {
  const router = Router();

  // Enforce authentication on all finance endpoints
  router.use(requireAuth);

  // ==========================================
  // 1. CATEGORY MANAGEMENT (R4, F27)
  // ==========================================

  // GET /api/finance/categories
  router.get('/categories', (req, res, next) => {
    try {
      const tenantId = req.tenantId || req.tenant?.id;
      seedDefaultCategoriesIfEmpty(db, tenantId);

      const rows = db.prepare(`
        SELECT * FROM transaction_categories
        WHERE tenant_id = ?
        ORDER BY type ASC, is_default DESC, name ASC
      `).all(tenantId);

      const categories = rows.map(formatCategory);
      res.json({
        success: true,
        categories,
        data: categories
      });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/finance/categories
  router.post('/categories', (req, res, next) => {
    try {
      const tenantId = req.tenantId || req.tenant?.id;
      const rawName = req.body.name || req.body.nama;
      const rawType = (req.body.type || req.body.tipe || '').toUpperCase();

      if (!rawName || typeof rawName !== 'string' || rawName.trim().length < 2) {
        return res.status(400).json({ error: 'Validation Error', message: 'Nama kategori minimal 2 karakter' });
      }

      if (rawType !== 'INCOME' && rawType !== 'EXPENSE') {
        return res.status(400).json({ error: 'Validation Error', message: 'Tipe kategori harus INCOME atau EXPENSE' });
      }

      const cleanName = rawName.trim();

      // Check duplicate
      const existing = db.prepare(`
        SELECT id FROM transaction_categories
        WHERE tenant_id = ? AND LOWER(name) = LOWER(?) AND type = ?
      `).get(tenantId, cleanName, rawType);

      if (existing) {
        return res.status(409).json({
          error: 'Conflict',
          message: `Kategori "${cleanName}" dengan tipe ${rawType} sudah ada.`
        });
      }

      const id = crypto.randomUUID();
      db.prepare(`
        INSERT INTO transaction_categories (id, tenant_id, name, type, is_default)
        VALUES (?, ?, ?, ?, 0)
      `).run(id, tenantId, cleanName, rawType);

      const created = db.prepare('SELECT * FROM transaction_categories WHERE id = ?').get(id);
      res.status(201).json({
        success: true,
        category: formatCategory(created),
        item: formatCategory(created)
      });
    } catch (err) {
      next(err);
    }
  });

  // PUT /api/finance/categories/:id
  router.put('/categories/:id', (req, res, next) => {
    try {
      const tenantId = req.tenantId || req.tenant?.id;
      const categoryId = req.params.id;
      const rawName = req.body.name || req.body.nama;

      if (!rawName || typeof rawName !== 'string' || rawName.trim().length < 2) {
        return res.status(400).json({ error: 'Validation Error', message: 'Nama kategori minimal 2 karakter' });
      }

      const cleanName = rawName.trim();
      const current = db.prepare('SELECT * FROM transaction_categories WHERE id = ? AND tenant_id = ?').get(categoryId, tenantId);
      if (!current) {
        return res.status(404).json({ error: 'Not Found', message: 'Kategori tidak ditemukan' });
      }

      // Check duplicate name under same type
      const dup = db.prepare(`
        SELECT id FROM transaction_categories
        WHERE tenant_id = ? AND LOWER(name) = LOWER(?) AND type = ? AND id != ?
      `).get(tenantId, cleanName, current.type, categoryId);

      if (dup) {
        return res.status(409).json({
          error: 'Conflict',
          message: `Kategori "${cleanName}" dengan tipe ${current.type} sudah ada.`
        });
      }

      db.prepare(`
        UPDATE transaction_categories
        SET name = ?
        WHERE id = ? AND tenant_id = ?
      `).run(cleanName, categoryId, tenantId);

      const updated = db.prepare('SELECT * FROM transaction_categories WHERE id = ?').get(categoryId);
      res.json({
        success: true,
        category: formatCategory(updated)
      });
    } catch (err) {
      next(err);
    }
  });

  // DELETE /api/finance/categories/:id
  router.delete('/categories/:id', (req, res, next) => {
    try {
      const tenantId = req.tenantId || req.tenant?.id;
      const categoryId = req.params.id;

      const current = db.prepare('SELECT * FROM transaction_categories WHERE id = ? AND tenant_id = ?').get(categoryId, tenantId);
      if (!current) {
        return res.status(404).json({ error: 'Not Found', message: 'Kategori tidak ditemukan' });
      }

      if (current.is_default === 1) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Kategori bawaan sistem tidak dapat dihapus.'
        });
      }

      // Check if referenced by active transactions
      const inUse = db.prepare('SELECT COUNT(*) as count FROM transactions WHERE category_id = ? AND tenant_id = ?').get(categoryId, tenantId);
      if (inUse && inUse.count > 0) {
        return res.status(400).json({
          error: 'Bad Request',
          message: `Kategori tidak dapat dihapus karena masih digunakan oleh ${inUse.count} transaksi.`
        });
      }

      db.prepare('DELETE FROM transaction_categories WHERE id = ? AND tenant_id = ?').run(categoryId, tenantId);
      res.json({
        success: true,
        message: 'Kategori berhasil dihapus'
      });
    } catch (err) {
      next(err);
    }
  });

  // ==========================================
  // 2. RECEIPT UPLOAD (R4, F22)
  // ==========================================

  router.post('/upload', uploadSingle('receipts', 'receipt'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Bad Request', message: 'File struk tidak ditemukan' });
    }
    res.json({
      success: true,
      url: req.file.relativeUrl,
      file: req.file
    });
  });

  // ==========================================
  // 3. TRANSACTIONS CRUD (R4, F22, F23)
  // ==========================================

  // Middleware to support optional multipart upload inside POST /transactions
  const handleOptionalMultipart = (req, res, next) => {
    if (req.is('multipart/form-data')) {
      uploadSingle('receipts', 'receipt')(req, res, next);
    } else {
      next();
    }
  };

  // GET /api/finance/transactions
  router.get('/transactions', (req, res, next) => {
    try {
      const tenantId = req.tenantId || req.tenant?.id;
      seedDefaultCategoriesIfEmpty(db, tenantId);

      const {
        search,
        q,
        type,
        tipe,
        categoryId,
        category_id,
        kategoriId,
        paymentMethod,
        payment_method,
        metodePembayaran,
        startDate,
        start_date,
        tanggalMulai,
        endDate,
        end_date,
        tanggalAkhir,
        minAmount,
        nominalMin,
        maxAmount,
        nominalMax,
        page = 1,
        limit = 20,
        sortBy = 'date',
        sortOrder = 'desc'
      } = req.query;

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
      const offset = (pageNum - 1) * limitNum;

      const filterType = (type || tipe || '').toUpperCase() || null;
      const filterCategory = categoryId || category_id || kategoriId || null;
      const filterPayment = (paymentMethod || payment_method || metodePembayaran || '').toUpperCase() || null;
      const filterStart = startDate || start_date || tanggalMulai || null;
      const filterEnd = endDate || end_date || tanggalAkhir || null;
      const filterMin = (minAmount !== undefined && minAmount !== '') ? Number(minAmount) : (nominalMin !== undefined && nominalMin !== '' ? Number(nominalMin) : null);
      const filterMax = (maxAmount !== undefined && maxAmount !== '') ? Number(maxAmount) : (nominalMax !== undefined && nominalMax !== '' ? Number(nominalMax) : null);
      const searchTerm = (search || q || '').trim();

      const conditions = ['t.tenant_id = ?'];
      const params = [tenantId];

      if (filterType && (filterType === 'INCOME' || filterType === 'EXPENSE')) {
        conditions.push('t.type = ?');
        params.push(filterType);
      }

      if (filterCategory) {
        conditions.push('t.category_id = ?');
        params.push(filterCategory);
      }

      if (filterPayment) {
        conditions.push('t.payment_method = ?');
        params.push(filterPayment);
      }

      if (filterStart) {
        conditions.push('t.date >= ?');
        params.push(filterStart);
      }

      if (filterEnd) {
        conditions.push('t.date <= ?');
        params.push(filterEnd);
      }

      if (filterMin !== null && !isNaN(filterMin)) {
        conditions.push('t.amount >= ?');
        params.push(filterMin);
      }

      if (filterMax !== null && !isNaN(filterMax)) {
        conditions.push('t.amount <= ?');
        params.push(filterMax);
      }

      if (searchTerm) {
        conditions.push('(t.description LIKE ? OR c.name LIKE ?)');
        params.push(`%${searchTerm}%`, `%${searchTerm}%`);
      }

      const whereClause = conditions.join(' AND ');

      // Total count and aggregate filtered summary
      const countRow = db.prepare(`
        SELECT 
          COUNT(t.id) as total,
          COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), 0) as total_income,
          COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) as total_expense
        FROM transactions t
        JOIN transaction_categories c ON t.category_id = c.id
        WHERE ${whereClause}
      `).get(...params);

      const totalRows = countRow ? countRow.total : 0;
      const filteredIncome = countRow ? countRow.total_income : 0;
      const filteredExpense = countRow ? countRow.total_expense : 0;

      // Safe sorting column
      let sortCol = 't.date';
      if (sortBy === 'amount' || sortBy === 'nominal') sortCol = 't.amount';
      else if (sortBy === 'created_at') sortCol = 't.created_at';
      const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

      const rows = db.prepare(`
        SELECT 
          t.*,
          c.name as category_name,
          c.type as category_type
        FROM transactions t
        JOIN transaction_categories c ON t.category_id = c.id
        WHERE ${whereClause}
        ORDER BY ${sortCol} ${order}, t.created_at DESC
        LIMIT ? OFFSET ?
      `).all(...params, limitNum, offset);

      const transactions = rows.map(formatTransaction);

      res.json({
        success: true,
        transactions,
        data: transactions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalRows,
          totalPages: Math.ceil(totalRows / limitNum) || 1
        },
        total: totalRows,
        filtered_summary: {
          total_income: filteredIncome,
          totalIncome: filteredIncome,
          total_expense: filteredExpense,
          totalExpense: filteredExpense,
          net_balance: filteredIncome - filteredExpense,
          netBalance: filteredIncome - filteredExpense
        }
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/finance/transactions/:id
  router.get('/transactions/:id', (req, res, next) => {
    try {
      const tenantId = req.tenantId || req.tenant?.id;
      const trxId = req.params.id;

      const row = db.prepare(`
        SELECT 
          t.*,
          c.name as category_name,
          c.type as category_type
        FROM transactions t
        JOIN transaction_categories c ON t.category_id = c.id
        WHERE t.id = ? AND t.tenant_id = ?
      `).get(trxId, tenantId);

      if (!row) {
        return res.status(404).json({ error: 'Not Found', message: 'Transaksi tidak ditemukan' });
      }

      res.json({
        success: true,
        transaction: formatTransaction(row)
      });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/finance/transactions
  router.post('/transactions', handleOptionalMultipart, (req, res, next) => {
    try {
      const tenantId = req.tenantId || req.tenant?.id;
      seedDefaultCategoriesIfEmpty(db, tenantId);

      // Extract bilingual keys
      const rawType = (req.body.type || req.body.tipe || '').toUpperCase();
      const rawCatId = req.body.categoryId || req.body.category_id || req.body.kategoriId;
      const rawAmount = req.body.amount !== undefined ? req.body.amount : req.body.nominal;
      const rawDate = req.body.date || req.body.tanggal;
      const rawDesc = req.body.description || req.body.deskripsi;
      const inputPayment = req.body.paymentMethod !== undefined 
        ? req.body.paymentMethod 
        : (req.body.payment_method !== undefined 
            ? req.body.payment_method 
            : (req.body.metodePembayaran !== undefined 
                ? req.body.metodePembayaran 
                : 'CASH'));
      const rawPayment = typeof inputPayment === 'string' ? inputPayment.trim().toUpperCase() : String(inputPayment).toUpperCase();
      const rawRoId = req.body.repairOrderId || req.body.repair_order_id || req.body.ro_id || null;
      let rawReceipt = req.body.receiptUrl || req.body.receipt_url || req.body.buktiUrl || null;

      if (req.file && req.file.relativeUrl) {
        rawReceipt = req.file.relativeUrl;
      }

      // Validations
      if (rawType !== 'INCOME' && rawType !== 'EXPENSE') {
        return res.status(400).json({ error: 'Validation Error', message: 'Tipe transaksi harus INCOME atau EXPENSE' });
      }

      const amount = Number(rawAmount);
      if (isNaN(amount) || !Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Validation Error', message: 'Nominal transaksi harus berupa angka positif valid lebih dari 0' });
      }

      if (!rawDesc || typeof rawDesc !== 'string' || rawDesc.trim().length < 2) {
        return res.status(400).json({ error: 'Validation Error', message: 'Deskripsi transaksi minimal 2 karakter' });
      }

      if (!['CASH', 'TRANSFER', 'QRIS'].includes(rawPayment)) {
        return res.status(400).json({ error: 'Validation Error', message: 'Metode pembayaran harus salah satu dari: CASH, TRANSFER, QRIS' });
      }

      // Validate date or default to today
      let date = rawDate;
      if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        date = getTodayDateString();
      }

      // Validate category existence & tenant isolation
      let categoryId = rawCatId;
      if (!categoryId) {
        // Fallback to first available category for this type
        const fallback = db.prepare('SELECT id FROM transaction_categories WHERE tenant_id = ? AND type = ? LIMIT 1').get(tenantId, rawType);
        if (fallback) categoryId = fallback.id;
      }

      const category = db.prepare('SELECT id, name, type FROM transaction_categories WHERE id = ? AND tenant_id = ?').get(categoryId, tenantId);
      if (!category) {
        return res.status(404).json({ error: 'Not Found', message: 'Kategori transaksi tidak ditemukan' });
      }

      const id = crypto.randomUUID();
      db.prepare(`
        INSERT INTO transactions (
          id, tenant_id, category_id, type, amount, date, description, payment_method, receipt_url, repair_order_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        tenantId,
        category.id,
        rawType,
        amount,
        date,
        rawDesc.trim(),
        rawPayment,
        rawReceipt,
        rawRoId
      );

      const inserted = db.prepare(`
        SELECT 
          t.*,
          c.name as category_name,
          c.type as category_type
        FROM transactions t
        JOIN transaction_categories c ON t.category_id = c.id
        WHERE t.id = ?
      `).get(id);

      const formatted = formatTransaction(inserted);
      res.status(201).json({
        success: true,
        transaction: formatted,
        id: formatted.id,
        item: formatted
      });
    } catch (err) {
      next(err);
    }
  });

  // PUT /api/finance/transactions/:id
  router.put('/transactions/:id', handleOptionalMultipart, (req, res, next) => {
    try {
      const tenantId = req.tenantId || req.tenant?.id;
      const trxId = req.params.id;

      const existing = db.prepare('SELECT * FROM transactions WHERE id = ? AND tenant_id = ?').get(trxId, tenantId);
      if (!existing) {
        return res.status(404).json({ error: 'Not Found', message: 'Transaksi tidak ditemukan' });
      }

      const rawType = (req.body.type || req.body.tipe || existing.type).toUpperCase();
      const rawCatId = req.body.categoryId || req.body.category_id || req.body.kategoriId || existing.category_id;
      const rawAmount = req.body.amount !== undefined ? req.body.amount : (req.body.nominal !== undefined ? req.body.nominal : existing.amount);
      const rawDate = req.body.date || req.body.tanggal || existing.date;
      const rawDesc = req.body.description || req.body.deskripsi || existing.description;
      const inputPayment = req.body.paymentMethod !== undefined 
        ? req.body.paymentMethod 
        : (req.body.payment_method !== undefined 
            ? req.body.payment_method 
            : (req.body.metodePembayaran !== undefined 
                ? req.body.metodePembayaran 
                : existing.payment_method));
      const rawPayment = typeof inputPayment === 'string' ? inputPayment.trim().toUpperCase() : String(inputPayment).toUpperCase();
      let rawReceipt = req.body.receiptUrl !== undefined ? req.body.receiptUrl : (req.body.receipt_url !== undefined ? req.body.receipt_url : existing.receipt_url);

      if (req.file && req.file.relativeUrl) {
        rawReceipt = req.file.relativeUrl;
      }

      const amount = Number(rawAmount);
      if (isNaN(amount) || !Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Validation Error', message: 'Nominal transaksi harus berupa angka positif valid lebih dari 0' });
      }

      if (!['CASH', 'TRANSFER', 'QRIS'].includes(rawPayment)) {
        return res.status(400).json({ error: 'Validation Error', message: 'Metode pembayaran tidak valid' });
      }

      const category = db.prepare('SELECT id FROM transaction_categories WHERE id = ? AND tenant_id = ?').get(rawCatId, tenantId);
      if (!category) {
        return res.status(404).json({ error: 'Not Found', message: 'Kategori tidak ditemukan' });
      }

      db.prepare(`
        UPDATE transactions
        SET 
          category_id = ?,
          type = ?,
          amount = ?,
          date = ?,
          description = ?,
          payment_method = ?,
          receipt_url = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND tenant_id = ?
      `).run(
        category.id,
        rawType,
        amount,
        rawDate,
        rawDesc.trim(),
        rawPayment,
        rawReceipt,
        trxId,
        tenantId
      );

      const updated = db.prepare(`
        SELECT 
          t.*,
          c.name as category_name,
          c.type as category_type
        FROM transactions t
        JOIN transaction_categories c ON t.category_id = c.id
        WHERE t.id = ?
      `).get(trxId);

      res.json({
        success: true,
        transaction: formatTransaction(updated)
      });
    } catch (err) {
      next(err);
    }
  });

  // DELETE /api/finance/transactions/:id
  router.delete('/transactions/:id', (req, res, next) => {
    try {
      const tenantId = req.tenantId || req.tenant?.id;
      const trxId = req.params.id;

      const existing = db.prepare('SELECT * FROM transactions WHERE id = ? AND tenant_id = ?').get(trxId, tenantId);
      if (!existing) {
        return res.status(404).json({ error: 'Not Found', message: 'Transaksi tidak ditemukan' });
      }

      db.prepare('DELETE FROM transactions WHERE id = ? AND tenant_id = ?').run(trxId, tenantId);
      res.json({
        success: true,
        message: 'Transaksi berhasil dihapus'
      });
    } catch (err) {
      next(err);
    }
  });

  // ==========================================
  // 4. SUMMARY & ANALYTICS (R4, F24, F25, F26)
  // ==========================================

  // GET /api/finance/summary
  router.get('/summary', (req, res, next) => {
    try {
      const tenantId = req.tenantId || req.tenant?.id;
      seedDefaultCategoriesIfEmpty(db, tenantId);

      const { period = 'month', startDate, endDate } = req.query;
      const range = getPeriodDateRange(period, startDate, endDate);

      const conditions = ['t.tenant_id = ?'];
      const params = [tenantId];

      if (range.startDate) {
        conditions.push('t.date >= ?');
        params.push(range.startDate);
      }
      if (range.endDate) {
        conditions.push('t.date <= ?');
        params.push(range.endDate);
      }

      const whereClause = conditions.join(' AND ');

      // Aggregate totals
      const agg = db.prepare(`
        SELECT 
          COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), 0) as total_income,
          COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) as total_expense,
          COUNT(CASE WHEN t.type = 'INCOME' THEN 1 END) as count_income,
          COUNT(CASE WHEN t.type = 'EXPENSE' THEN 1 END) as count_expense
        FROM transactions t
        WHERE ${whereClause}
      `).get(...params);

      const totalIncome = agg ? agg.total_income : 0;
      const totalExpense = agg ? agg.total_expense : 0;
      const netBalance = totalIncome - totalExpense;
      const isDeficit = netBalance < 0;

      // Revenue Target progress from tenant_settings
      const settings = db.prepare('SELECT monthly_revenue_target FROM tenant_settings WHERE tenant_id = ?').get(tenantId);
      const monthlyTarget = Number(settings?.monthly_revenue_target) || 15000000;

      // Compute current month actual income
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const monthStart = `${currentMonthKey}-01`;
      const curMonthRow = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as income
        FROM transactions
        WHERE tenant_id = ? AND type = 'INCOME' AND date >= ?
      `).get(tenantId, monthStart);
      const currentMonthIncome = curMonthRow ? curMonthRow.income : 0;
      const progressPercent = monthlyTarget > 0 ? Number(((currentMonthIncome / monthlyTarget) * 100).toFixed(2)) : 0;
      const remainingToTarget = Math.max(0, monthlyTarget - currentMonthIncome);

      // Category breakdown (Income & Expense)
      const incomeCatRows = db.prepare(`
        SELECT 
          c.id, c.name, 
          COUNT(t.id) as count, 
          COALESCE(SUM(t.amount), 0) as total
        FROM transactions t
        JOIN transaction_categories c ON t.category_id = c.id
        WHERE ${whereClause} AND t.type = 'INCOME'
        GROUP BY c.id, c.name
        ORDER BY total DESC
      `).all(...params);

      const expenseCatRows = db.prepare(`
        SELECT 
          c.id, c.name, 
          COUNT(t.id) as count, 
          COALESCE(SUM(t.amount), 0) as total
        FROM transactions t
        JOIN transaction_categories c ON t.category_id = c.id
        WHERE ${whereClause} AND t.type = 'EXPENSE'
        GROUP BY c.id, c.name
        ORDER BY total DESC
      `).all(...params);

      const incomeCategories = incomeCatRows.map(r => ({
        id: r.id,
        name: r.name,
        count: r.count,
        total: r.total,
        percentage: totalIncome > 0 ? Number(((r.total / totalIncome) * 100).toFixed(1)) : 0
      }));

      const expenseCategories = expenseCatRows.map(r => ({
        id: r.id,
        name: r.name,
        count: r.count,
        total: r.total,
        percentage: totalExpense > 0 ? Number(((r.total / totalExpense) * 100).toFixed(1)) : 0
      }));

      // Payment method distribution
      const pmRows = db.prepare(`
        SELECT 
          t.payment_method,
          COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), 0) as income,
          COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) as expense
        FROM transactions t
        WHERE ${whereClause}
        GROUP BY t.payment_method
      `).all(...params);

      const paymentMethods = {
        CASH: { income: 0, expense: 0, total: 0 },
        TRANSFER: { income: 0, expense: 0, total: 0 },
        QRIS: { income: 0, expense: 0, total: 0 }
      };

      for (const row of pmRows) {
        if (paymentMethods[row.payment_method]) {
          paymentMethods[row.payment_method] = {
            income: row.income,
            expense: row.expense,
            total: row.income - row.expense
          };
        }
      }

      // Monthly P&L Chart History (Last 6 months)
      const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
      const monthlyPnlChart = [];

      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const key = `${y}-${m}`;
        const label = `${monthNamesShort[d.getMonth()]} ${String(y).slice(-2)}`;

        const mRow = db.prepare(`
          SELECT 
            COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) as income,
            COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) as expense
          FROM transactions
          WHERE tenant_id = ? AND strftime('%Y-%m', date) = ?
        `).get(tenantId, key);

        const inc = mRow ? mRow.income : 0;
        const exp = mRow ? mRow.expense : 0;
        monthlyPnlChart.push({
          month: key,
          label,
          income: inc,
          expense: exp,
          net: inc - exp
        });
      }

      res.json({
        success: true,
        period,
        period_label: range.periodLabel,
        total_income: totalIncome,
        totalIncome,
        total_expense: totalExpense,
        totalExpense,
        net_balance: netBalance,
        netBalance,
        is_deficit: isDeficit,
        counts: {
          income: agg ? agg.count_income : 0,
          expense: agg ? agg.count_expense : 0,
          total: (agg ? agg.count_income : 0) + (agg ? agg.count_expense : 0)
        },
        budget: {
          monthly_target: monthlyTarget,
          monthlyTarget,
          current_month_income: currentMonthIncome,
          progress_percent: progressPercent,
          remaining_to_target: remainingToTarget
        },
        monthly_pnl_chart: monthlyPnlChart,
        category_breakdown: {
          income: incomeCategories,
          expense: expenseCategories
        },
        payment_methods: paymentMethods
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/finance/pnl
  router.get('/pnl', (req, res, next) => {
    try {
      const tenantId = req.tenantId || req.tenant?.id;
      const monthsCount = Math.min(24, Math.max(1, parseInt(req.query.months, 10) || 12));
      const now = new Date();
      const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];

      const pnlData = [];
      for (let i = monthsCount - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const key = `${y}-${m}`;
        const label = `${monthNamesShort[d.getMonth()]} ${y}`;

        const mRow = db.prepare(`
          SELECT 
            COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) as income,
            COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) as expense
          FROM transactions
          WHERE tenant_id = ? AND strftime('%Y-%m', date) = ?
        `).get(tenantId, key);

        const inc = mRow ? mRow.income : 0;
        const exp = mRow ? mRow.expense : 0;
        pnlData.push({
          month: key,
          label,
          income: inc,
          expense: exp,
          net: inc - exp
        });
      }

      res.json({
        success: true,
        pnl: pnlData,
        data: pnlData
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/finance/budget-target
  router.get('/budget-target', (req, res, next) => {
    try {
      const tenantId = req.tenantId || req.tenant?.id;
      const settings = db.prepare('SELECT monthly_revenue_target FROM tenant_settings WHERE tenant_id = ?').get(tenantId);
      const target = Number(settings?.monthly_revenue_target) || 15000000;
      res.json({
        success: true,
        monthly_revenue_target: target,
        monthlyRevenueTarget: target
      });
    } catch (err) {
      next(err);
    }
  });

  // PUT /api/finance/budget-target
  router.put('/budget-target', (req, res, next) => {
    try {
      const tenantId = req.tenantId || req.tenant?.id;
      const target = Number(req.body.target || req.body.monthly_revenue_target || req.body.monthlyRevenueTarget);

      if (isNaN(target) || !Number.isFinite(target) || target <= 0) {
        return res.status(400).json({ error: 'Validation Error', message: 'Target nominal harus berupa angka positif valid lebih dari 0' });
      }

      db.prepare(`
        INSERT INTO tenant_settings (tenant_id, monthly_revenue_target)
        VALUES (?, ?)
        ON CONFLICT(tenant_id) DO UPDATE SET 
          monthly_revenue_target = excluded.monthly_revenue_target,
          updated_at = CURRENT_TIMESTAMP
      `).run(tenantId, target);

      res.json({
        success: true,
        monthly_revenue_target: target,
        monthlyRevenueTarget: target
      });
    } catch (err) {
      next(err);
    }
  });

  // ==========================================
  // 5. EXPORT ENDPOINTS (R4, F28, F29, F30, F31)
  // ==========================================

  // GET /api/finance/export/csv
  router.get('/export/csv', (req, res, next) => {
    try {
      const tenantId = req.tenantId || req.tenant?.id;
      const tenant = req.tenant || db.prepare('SELECT * FROM tenants WHERE id = ?').get(tenantId);

      const rows = db.prepare(`
        SELECT 
          t.*,
          c.name as category_name
        FROM transactions t
        JOIN transaction_categories c ON t.category_id = c.id
        WHERE t.tenant_id = ?
        ORDER BY t.date DESC, t.created_at DESC
      `).all(tenantId);

      const headers = [
        'ID Transaksi',
        'Tanggal',
        'Tipe',
        'Kategori',
        'Nominal (Rp)',
        'Metode Pembayaran',
        'Deskripsi',
        'Referensi RO',
        'Bukti Struk',
        'Waktu Input'
      ];

      const dataRows = rows.map(r => [
        r.id,
        r.date,
        r.type === 'INCOME' ? 'PEMASUKAN' : 'PENGELUARAN',
        r.category_name,
        r.amount,
        r.payment_method,
        r.description,
        r.repair_order_id || '-',
        r.receipt_url || '-',
        r.created_at
      ]);

      const csvContent = generateCsv(headers, dataRows);
      const dateStr = getTodayDateString();
      const filename = `transaksi-keuangan-${tenant?.slug || 'bengkel'}-${dateStr}.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(200).send(csvContent);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/finance/export/pnl-pdf
  router.get(['/export/pnl-pdf', '/export/pnl/pdf'], async (req, res, next) => {
    try {
      const tenantId = req.tenantId || req.tenant?.id;
      const tenant = req.tenant || db.prepare('SELECT * FROM tenants WHERE id = ?').get(tenantId);

      const { period = 'month', startDate, endDate } = req.query;
      const range = getPeriodDateRange(period, startDate, endDate);

      const conditions = ['t.tenant_id = ?'];
      const params = [tenantId];

      if (range.startDate) {
        conditions.push('t.date >= ?');
        params.push(range.startDate);
      }
      if (range.endDate) {
        conditions.push('t.date <= ?');
        params.push(range.endDate);
      }

      const whereClause = conditions.join(' AND ');

      // Totals
      const agg = db.prepare(`
        SELECT 
          COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), 0) as total_income,
          COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) as total_expense
        FROM transactions t
        WHERE ${whereClause}
      `).get(...params);

      const totalIncome = agg ? agg.total_income : 0;
      const totalExpense = agg ? agg.total_expense : 0;

      // Income Categories
      const incomeCatRows = db.prepare(`
        SELECT 
          c.name, 
          COUNT(t.id) as count, 
          COALESCE(SUM(t.amount), 0) as total
        FROM transactions t
        JOIN transaction_categories c ON t.category_id = c.id
        WHERE ${whereClause} AND t.type = 'INCOME'
        GROUP BY c.id, c.name
        ORDER BY total DESC
      `).all(...params);

      // Expense Categories
      const expenseCatRows = db.prepare(`
        SELECT 
          c.name, 
          COUNT(t.id) as count, 
          COALESCE(SUM(t.amount), 0) as total
        FROM transactions t
        JOIN transaction_categories c ON t.category_id = c.id
        WHERE ${whereClause} AND t.type = 'EXPENSE'
        GROUP BY c.id, c.name
        ORDER BY total DESC
      `).all(...params);

      // Payment Methods
      const pmRows = db.prepare(`
        SELECT 
          payment_method,
          COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) as income,
          COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) as expense
        FROM transactions t
        WHERE ${whereClause}
        GROUP BY payment_method
      `).all(...params);

      const paymentMethods = {
        CASH: { income: 0, expense: 0, total: 0 },
        TRANSFER: { income: 0, expense: 0, total: 0 },
        QRIS: { income: 0, expense: 0, total: 0 }
      };

      for (const row of pmRows) {
        if (paymentMethods[row.payment_method]) {
          paymentMethods[row.payment_method] = {
            income: row.income,
            expense: row.expense,
            total: row.income - row.expense
          };
        }
      }

      const reportData = {
        periodLabel: range.periodLabel,
        total_income: totalIncome,
        total_expense: totalExpense,
        net_balance: totalIncome - totalExpense,
        incomeCategories: incomeCatRows,
        expenseCategories: expenseCatRows,
        payment_methods: paymentMethods
      };

      const pdfBuffer = await generatePnlPdf(tenant, reportData);
      const filename = `laporan-laba-rugi-${tenant?.slug || 'bengkel'}-${period}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(200).send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/finance/export/daily-recap-pdf
  router.get(['/export/daily-recap-pdf', '/export/daily-recap/pdf'], async (req, res, next) => {
    try {
      const tenantId = req.tenantId || req.tenant?.id;
      const tenant = req.tenant || db.prepare('SELECT * FROM tenants WHERE id = ?').get(tenantId);

      const targetDate = req.query.date || getTodayDateString();

      const rows = db.prepare(`
        SELECT 
          t.*,
          c.name as category_name
        FROM transactions t
        JOIN transaction_categories c ON t.category_id = c.id
        WHERE t.tenant_id = ? AND t.date = ?
        ORDER BY t.created_at ASC
      `).all(tenantId, targetDate);

      let totalIncome = 0;
      let totalExpense = 0;
      const pmData = {
        CASH: { income: 0, expense: 0 },
        TRANSFER: { income: 0, expense: 0 },
        QRIS: { income: 0, expense: 0 }
      };

      rows.forEach(r => {
        if (r.type === 'INCOME') {
          totalIncome += r.amount;
          if (pmData[r.payment_method]) pmData[r.payment_method].income += r.amount;
        } else {
          totalExpense += r.amount;
          if (pmData[r.payment_method]) pmData[r.payment_method].expense += r.amount;
        }
      });

      const recapData = {
        date: targetDate,
        total_income: totalIncome,
        total_expense: totalExpense,
        net_balance: totalIncome - totalExpense,
        transactions: rows,
        payment_methods: pmData
      };

      const pdfBuffer = await generateDailyRecapPdf(tenant, recapData);
      const filename = `rekap-kas-harian-${tenant?.slug || 'bengkel'}-${targetDate}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(200).send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/finance/export/category-pdf
  router.get(['/export/category-pdf', '/export/category/pdf'], async (req, res, next) => {
    try {
      const tenantId = req.tenantId || req.tenant?.id;
      const tenant = req.tenant || db.prepare('SELECT * FROM tenants WHERE id = ?').get(tenantId);

      const { period = 'month', startDate, endDate } = req.query;
      const range = getPeriodDateRange(period, startDate, endDate);

      const conditions = ['t.tenant_id = ?'];
      const params = [tenantId];
      if (range.startDate) {
        conditions.push('t.date >= ?');
        params.push(range.startDate);
      }
      if (range.endDate) {
        conditions.push('t.date <= ?');
        params.push(range.endDate);
      }
      const whereClause = conditions.join(' AND ');

      const agg = db.prepare(`
        SELECT 
          COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), 0) as total_income,
          COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) as total_expense
        FROM transactions t
        WHERE ${whereClause}
      `).get(...params);

      const incomeCatRows = db.prepare(`
        SELECT c.name, COUNT(t.id) as count, COALESCE(SUM(t.amount), 0) as total
        FROM transactions t
        JOIN transaction_categories c ON t.category_id = c.id
        WHERE ${whereClause} AND t.type = 'INCOME'
        GROUP BY c.id, c.name
        ORDER BY total DESC
      `).all(...params);

      const expenseCatRows = db.prepare(`
        SELECT c.name, COUNT(t.id) as count, COALESCE(SUM(t.amount), 0) as total
        FROM transactions t
        JOIN transaction_categories c ON t.category_id = c.id
        WHERE ${whereClause} AND t.type = 'EXPENSE'
        GROUP BY c.id, c.name
        ORDER BY total DESC
      `).all(...params);

      const reportData = {
        periodLabel: `Laporan Kategori Biaya - ${range.periodLabel}`,
        total_income: agg ? agg.total_income : 0,
        total_expense: agg ? agg.total_expense : 0,
        incomeCategories: incomeCatRows,
        expenseCategories: expenseCatRows
      };

      const pdfBuffer = await generateCategoryBreakdownPdf(tenant, reportData);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="laporan-kategori-${period}.pdf"`);
      res.status(200).send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

export default financeRoutes;
