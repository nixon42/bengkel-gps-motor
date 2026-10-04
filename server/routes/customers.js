import { Router } from 'express';
import crypto from 'node:crypto';
import { requireAuth } from '../middleware/auth.js';

export function customersRoutes(db) {
  const router = Router();

  function getTenantId(req) {
    return req.tenantId || req.tenant?.id || req.user?.tenant_id;
  }

  // 1. GET /api/customers/search (Fast typeahead autocomplete for RO creation & search)
  router.get('/search', requireAuth, async (req, res, next) => {
    try {
      const tenantId = getTenantId(req);
      const query = (req.query.q || req.query.query || req.query.search || '').trim();

      if (!query) {
        return res.json({ success: true, customers: [] });
      }

      const pattern = `%${query}%`;
      const normPlate = `%${query.replace(/\s+/g, '')}%`;

      const rows = db.prepare(`
        SELECT DISTINCT c.*
        FROM customers c
        LEFT JOIN vehicles v ON v.customer_id = c.id AND v.tenant_id = c.tenant_id
        WHERE c.tenant_id = ?
          AND (
            c.name LIKE ? OR
            c.phone LIKE ? OR
            c.email LIKE ? OR
            v.plate_number LIKE ? OR
            REPLACE(v.plate_number, ' ', '') LIKE ?
          )
        ORDER BY c.name ASC
        LIMIT 15
      `).all(tenantId, pattern, pattern, pattern, pattern, normPlate);

      const results = rows.map(customer => {
        const vehicles = db.prepare(`
          SELECT * FROM vehicles 
          WHERE tenant_id = ? AND customer_id = ?
          ORDER BY created_at DESC
        `).all(tenantId, customer.id);

        return {
          id: customer.id,
          name: customer.name,
          nama: customer.name,
          phone: customer.phone,
          noHp: customer.phone,
          email: customer.email,
          address: customer.address,
          alamat: customer.address,
          notes: customer.notes,
          vehicles: vehicles.map(v => ({
            id: v.id,
            plate_number: v.plate_number,
            platNomor: v.plate_number,
            brand: v.brand,
            merek: v.brand,
            model: v.model,
            year: v.year,
            tahun: v.year,
            color: v.color,
            warna: v.color
          }))
        };
      });

      res.json({
        success: true,
        customers: results
      });
    } catch (err) {
      next(err);
    }
  });

  // 2. GET /api/customers (List customers with pagination, vehicle count & RO count)
  router.get('/', requireAuth, async (req, res, next) => {
    try {
      const tenantId = getTenantId(req);
      const search = (req.query.search || req.query.q || '').trim();
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
      const offset = (page - 1) * limit;

      let whereConditions = ['c.tenant_id = ?'];
      let queryParams = [tenantId];

      if (search) {
        whereConditions.push(`(
          c.name LIKE ? OR
          c.phone LIKE ? OR
          c.email LIKE ? OR
          c.address LIKE ? OR
          EXISTS (
            SELECT 1 FROM vehicles v 
            WHERE v.customer_id = c.id AND (
              v.plate_number LIKE ? OR
              REPLACE(v.plate_number, ' ', '') LIKE ?
            )
          )
        )`);
        const p = `%${search}%`;
        const np = `%${search.replace(/\s+/g, '')}%`;
        queryParams.push(p, p, p, p, p, np);
      }

      const whereClause = whereConditions.join(' AND ');

      const countRow = db.prepare(`
        SELECT COUNT(*) as total 
        FROM customers c 
        WHERE ${whereClause}
      `).get(...queryParams);

      const total = countRow ? countRow.total : 0;
      const totalPages = Math.ceil(total / limit) || 1;

      const rows = db.prepare(`
        SELECT 
          c.*,
          (SELECT COUNT(*) FROM vehicles v WHERE v.customer_id = c.id AND v.tenant_id = c.tenant_id) as vehicle_count,
          (SELECT COUNT(*) FROM repair_orders ro WHERE ro.customer_id = c.id AND ro.tenant_id = c.tenant_id) as ro_count,
          (SELECT COALESCE(SUM(total_cost), 0) FROM repair_orders ro WHERE ro.customer_id = c.id AND ro.tenant_id = c.tenant_id) as total_spent,
          (SELECT ro.entry_date FROM repair_orders ro WHERE ro.customer_id = c.id AND ro.tenant_id = c.tenant_id ORDER BY ro.entry_date DESC LIMIT 1) as last_visit
        FROM customers c
        WHERE ${whereClause}
        ORDER BY c.created_at DESC
        LIMIT ? OFFSET ?
      `).all(...queryParams, limit, offset);

      const customers = rows.map(c => {
        const vehicles = db.prepare(`
          SELECT * FROM vehicles WHERE tenant_id = ? AND customer_id = ?
        `).all(tenantId, c.id);

        return {
          id: c.id,
          name: c.name,
          nama: c.name,
          phone: c.phone,
          noHp: c.phone,
          email: c.email,
          address: c.address,
          alamat: c.address,
          notes: c.notes,
          catatan: c.notes,
          vehicle_count: c.vehicle_count,
          ro_count: c.ro_count,
          total_spent: c.total_spent,
          last_visit: c.last_visit,
          vehicles,
          created_at: c.created_at,
          updated_at: c.updated_at
        };
      });

      res.json({
        success: true,
        customers,
        items: customers,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      });
    } catch (err) {
      next(err);
    }
  });

  // 3. POST /api/customers (Create Customer)
  router.post('/', requireAuth, async (req, res, next) => {
    try {
      const tenantId = getTenantId(req);
      const body = req.body || {};

      const name = (body.name || body.nama || '').trim();
      const phone = (body.phone || body.noHp || '').trim();
      const email = (body.email || '').trim() || null;
      const address = (body.address || body.alamat || '').trim() || null;
      const notes = (body.notes || body.catatan || '').trim() || null;

      if (!name) {
        return res.status(400).json({ error: 'Nama pelanggan wajib diisi.' });
      }
      if (!phone) {
        return res.status(400).json({ error: 'Nomor telepon / WhatsApp pelanggan wajib diisi.' });
      }

      const customerId = crypto.randomUUID();

      const createTx = db.transaction(() => {
        db.prepare(`
          INSERT INTO customers (id, tenant_id, name, phone, email, address, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(customerId, tenantId, name, phone, email, address, notes);

        // Optional initial vehicle
        const plateNumber = (body.plateNumber || body.platNomor || body.plate_number || '').trim();
        if (plateNumber) {
          const vehicleId = crypto.randomUUID();
          db.prepare(`
            INSERT INTO vehicles (id, tenant_id, customer_id, plate_number, brand, model, year, color)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            vehicleId,
            tenantId,
            customerId,
            plateNumber.toUpperCase().replace(/\s+/g, ' ').trim(),
            (body.brand || body.merek || 'Mobil').trim(),
            (body.model || 'Standar').trim(),
            body.year || body.tahun ? parseInt(body.year || body.tahun, 10) : null,
            (body.color || body.warna || '').trim() || null
          );
        }
      });

      createTx();

      const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customerId);
      const vehicles = db.prepare('SELECT * FROM vehicles WHERE customer_id = ?').all(customerId);

      res.status(201).json({
        success: true,
        customer: {
          ...customer,
          vehicles
        }
      });
    } catch (err) {
      next(err);
    }
  });

  // 4. GET /api/customers/:id (Customer profile with vehicles & repair orders)
  router.get('/:id', requireAuth, async (req, res, next) => {
    try {
      const tenantId = getTenantId(req);
      const targetId = req.params.id;

      const customer = db.prepare('SELECT * FROM customers WHERE tenant_id = ? AND id = ?').get(tenantId, targetId);
      if (!customer) {
        return res.status(404).json({ error: 'Pelanggan tidak ditemukan.' });
      }

      const vehicles = db.prepare(`
        SELECT * FROM vehicles 
        WHERE tenant_id = ? AND customer_id = ?
        ORDER BY created_at DESC
      `).all(tenantId, customer.id);

      const repairOrders = db.prepare(`
        SELECT * FROM repair_orders 
        WHERE tenant_id = ? AND customer_id = ?
        ORDER BY entry_date DESC, created_at DESC
      `).all(tenantId, customer.id);

      res.json({
        success: true,
        customer,
        vehicles,
        repair_orders: repairOrders
      });
    } catch (err) {
      next(err);
    }
  });

  // 5. GET /api/customers/:id/history (Vehicle service history)
  router.get('/:id/history', requireAuth, async (req, res, next) => {
    try {
      const tenantId = getTenantId(req);
      const targetId = req.params.id;

      const customer = db.prepare('SELECT * FROM customers WHERE tenant_id = ? AND id = ?').get(tenantId, targetId);
      if (!customer) {
        return res.status(404).json({ error: 'Pelanggan tidak ditemukan.' });
      }

      const history = db.prepare(`
        SELECT 
          ro.*,
          (SELECT COUNT(*) FROM ro_spareparts sp WHERE sp.repair_order_id = ro.id) as part_count
        FROM repair_orders ro
        WHERE ro.tenant_id = ? AND ro.customer_id = ?
        ORDER BY ro.entry_date DESC, ro.created_at DESC
      `).all(tenantId, customer.id);

      res.json({
        success: true,
        history,
        repair_orders: history
      });
    } catch (err) {
      next(err);
    }
  });

  // 6. PUT /api/customers/:id (Update Customer)
  router.put('/:id', requireAuth, async (req, res, next) => {
    try {
      const tenantId = getTenantId(req);
      const targetId = req.params.id;

      const customer = db.prepare('SELECT * FROM customers WHERE tenant_id = ? AND id = ?').get(tenantId, targetId);
      if (!customer) {
        return res.status(404).json({ error: 'Pelanggan tidak ditemukan.' });
      }

      const body = req.body || {};
      const name = (body.name || body.nama || customer.name).trim();
      const phone = (body.phone || body.noHp || customer.phone).trim();
      const email = body.email !== undefined ? (body.email || null) : customer.email;
      const address = body.address !== undefined ? (body.address || null) : (body.alamat !== undefined ? (body.alamat || null) : customer.address);
      const notes = body.notes !== undefined ? (body.notes || null) : (body.catatan !== undefined ? (body.catatan || null) : customer.notes);

      db.prepare(`
        UPDATE customers SET
          name = ?,
          phone = ?,
          email = ?,
          address = ?,
          notes = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(name, phone, email, address, notes, customer.id);

      const updated = db.prepare('SELECT * FROM customers WHERE id = ?').get(customer.id);

      res.json({
        success: true,
        customer: updated
      });
    } catch (err) {
      next(err);
    }
  });

  // 7. DELETE /api/customers/:id (Delete Customer)
  router.delete('/:id', requireAuth, async (req, res, next) => {
    try {
      const tenantId = getTenantId(req);
      const targetId = req.params.id;

      const customer = db.prepare('SELECT * FROM customers WHERE tenant_id = ? AND id = ?').get(tenantId, targetId);
      if (!customer) {
        return res.status(404).json({ error: 'Pelanggan tidak ditemukan.' });
      }

      db.prepare('DELETE FROM customers WHERE id = ?').run(customer.id);

      res.json({
        success: true,
        message: 'Pelanggan berhasil dihapus.'
      });
    } catch (err) {
      next(err);
    }
  });

  // 8. POST /api/customers/:id/vehicles (Add vehicle for customer)
  router.post('/:id/vehicles', requireAuth, async (req, res, next) => {
    try {
      const tenantId = getTenantId(req);
      const customerId = req.params.id;

      const customer = db.prepare('SELECT * FROM customers WHERE tenant_id = ? AND id = ?').get(tenantId, customerId);
      if (!customer) {
        return res.status(404).json({ error: 'Pelanggan tidak ditemukan.' });
      }

      const body = req.body || {};
      const plateNumber = (body.plateNumber || body.platNomor || body.plate_number || '').trim();

      if (!plateNumber) {
        return res.status(400).json({ error: 'Plat nomor kendaraan wajib diisi.' });
      }

      const brand = (body.brand || body.merek || 'Mobil').trim();
      const model = (body.model || 'Standar').trim();
      const year = body.year || body.tahun ? parseInt(body.year || body.tahun, 10) : null;
      const color = (body.color || body.warna || '').trim() || null;

      const vehicleId = crypto.randomUUID();

      db.prepare(`
        INSERT INTO vehicles (id, tenant_id, customer_id, plate_number, brand, model, year, color)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        vehicleId,
        tenantId,
        customer.id,
        plateNumber.toUpperCase().replace(/\s+/g, ' ').trim(),
        brand,
        model,
        year,
        color
      );

      const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(vehicleId);

      res.status(201).json({
        success: true,
        vehicle
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

export default customersRoutes;
