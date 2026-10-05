import { Router } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { requireSuperAdmin } from '../middleware/auth.js';

export function superadminRoutes(db) {
  const router = Router();

  // All superadmin routes require superadmin privileges
  router.use(requireSuperAdmin);

  // 1. GET /api/superadmin/stats — System-wide high-level metrics
  router.get('/stats', (req, res, next) => {
    try {
      const totalTenants = db.prepare('SELECT COUNT(*) as count FROM tenants').get().count;
      const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
      const totalRepairOrders = db.prepare('SELECT COUNT(*) as count FROM repair_orders').get().count;
      const totalSpareparts = db.prepare('SELECT COUNT(*) as count FROM spareparts').get().count;
      
      const revRow = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total_rev 
        FROM transactions 
        WHERE type = 'INCOME'
      `).get();
      const totalRevenue = Number(revRow?.total_rev || 0);

      const expRow = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total_exp 
        FROM transactions 
        WHERE type = 'EXPENSE'
      `).get();
      const totalExpense = Number(expRow?.total_exp || 0);

      const activeSessions = db.prepare(`
        SELECT COUNT(*) as count 
        FROM sessions 
        WHERE expires_at > datetime('now')
      `).get().count;

      // Stage distribution across all tenants
      const roStages = db.prepare(`
        SELECT status, COUNT(*) as count 
        FROM repair_orders 
        GROUP BY status
      `).all();

      res.json({
        success: true,
        stats: {
          totalTenants,
          totalUsers,
          totalRepairOrders,
          totalSpareparts,
          totalRevenue,
          totalExpense,
          netBalance: totalRevenue - totalExpense,
          activeSessions,
          roStages
        }
      });
    } catch (err) {
      next(err);
    }
  });

  // 2. GET /api/superadmin/tenants — List all tenants with summary stats
  router.get('/tenants', (req, res, next) => {
    try {
      const tenants = db.prepare(`
        SELECT 
          t.id,
          t.slug,
          t.name,
          t.address,
          t.phone_wa,
          t.business_hours,
          t.created_at,
          t.updated_at,
          ts.monthly_revenue_target,
          (SELECT COUNT(*) FROM users u WHERE u.tenant_id = t.id) as user_count,
          (SELECT COUNT(*) FROM repair_orders ro WHERE ro.tenant_id = t.id) as ro_count,
          (SELECT COUNT(*) FROM spareparts sp WHERE sp.tenant_id = t.id) as sparepart_count,
          (SELECT COALESCE(SUM(amount), 0) FROM transactions tr WHERE tr.tenant_id = t.id AND tr.type = 'INCOME') as total_revenue
        FROM tenants t
        LEFT JOIN tenant_settings ts ON ts.tenant_id = t.id
        ORDER BY t.created_at ASC
      `).all();

      res.json({
        success: true,
        tenants
      });
    } catch (err) {
      next(err);
    }
  });

  // 3. POST /api/superadmin/tenants — Create new tenant workspace
  const CreateTenantSchema = z.object({
    slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan strip (-)'),
    name: z.string().min(3, 'Nama bengkel minimal 3 karakter').max(100),
    address: z.string().min(5, 'Alamat minimal 5 karakter').max(255),
    phoneWa: z.string().min(8, 'Nomor WA minimal 8 digit').max(25),
    businessHours: z.string().max(100).optional().default('Senin - Sabtu: 08:00 - 17:00 WIB'),
    monthlyRevenueTarget: z.number().nonnegative().optional().default(15000000)
  });

  router.post('/tenants', (req, res, next) => {
    try {
      const parsed = CreateTenantSchema.parse(req.body);

      // Check collision
      const existing = db.prepare('SELECT id FROM tenants WHERE slug = ?').get(parsed.slug);
      if (existing) {
        return res.status(409).json({
          error: 'Slug Conflict',
          message: `Slug "${parsed.slug}" sudah digunakan.`
        });
      }

      const tenantId = crypto.randomUUID();
      const insertTenant = db.transaction(() => {
        db.prepare(`
          INSERT INTO tenants (id, slug, name, address, phone_wa, business_hours)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(tenantId, parsed.slug, parsed.name, parsed.address, parsed.phoneWa, parsed.businessHours);

        db.prepare(`
          INSERT INTO tenant_settings (tenant_id, monthly_revenue_target)
          VALUES (?, ?)
        `).run(tenantId, parsed.monthlyRevenueTarget);

        // Provision default operator user
        const defaultOperatorEmail = `admin@${parsed.slug}.local`;
        db.prepare(`
          INSERT INTO users (id, tenant_id, email, name, role, auth_provider)
          VALUES (?, ?, ?, ?, 'operator', 'mock')
        `).run(crypto.randomUUID(), tenantId, defaultOperatorEmail, `Admin ${parsed.name}`);
      });

      insertTenant();

      const created = db.prepare('SELECT * FROM tenants WHERE id = ?').get(tenantId);
      res.status(201).json({
        success: true,
        message: `Tenant bengkel "${parsed.name}" berhasil dibuat.`,
        tenant: created
      });
    } catch (err) {
      next(err);
    }
  });

  // 4. PUT /api/superadmin/tenants/:id — Update tenant details
  router.put('/tenants/:id', (req, res, next) => {
    try {
      const tenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(req.params.id);
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant tidak ditemukan.' });
      }

      const { name, address, phoneWa, businessHours, monthlyRevenueTarget } = req.body;

      db.transaction(() => {
        if (name || address || phoneWa || businessHours) {
          db.prepare(`
            UPDATE tenants 
            SET name = COALESCE(?, name),
                address = COALESCE(?, address),
                phone_wa = COALESCE(?, phone_wa),
                business_hours = COALESCE(?, business_hours),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(name, address, phoneWa, businessHours, req.params.id);
        }

        if (monthlyRevenueTarget !== undefined) {
          db.prepare(`
            UPDATE tenant_settings
            SET monthly_revenue_target = ?, updated_at = CURRENT_TIMESTAMP
            WHERE tenant_id = ?
          `).run(Number(monthlyRevenueTarget), req.params.id);
        }
      })();

      const updated = db.prepare('SELECT * FROM tenants WHERE id = ?').get(req.params.id);
      res.json({
        success: true,
        message: 'Data tenant berhasil diperbarui.',
        tenant: updated
      });
    } catch (err) {
      next(err);
    }
  });

  // 5. DELETE /api/superadmin/tenants/:id — Delete tenant (prevent deleting default tenant)
  router.delete('/tenants/:id', (req, res, next) => {
    try {
      const tenant = db.prepare('SELECT * FROM tenants WHERE id = ? OR slug = ?').get(req.params.id, req.params.id);
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant tidak ditemukan.' });
      }

      if (tenant.slug === 'bengkel-gps-motor' || tenant.id === 'default-tenant-01') {
        return res.status(400).json({
          error: 'Tenant default bengkel-gps-motor tidak dapat dihapus.',
          message: 'Tenant utama Bengkel GPS Motor tidak dapat dihapus.'
        });
      }

      db.prepare('DELETE FROM tenants WHERE id = ?').run(req.params.id);

      res.json({
        success: true,
        message: `Tenant "${tenant.name}" (${tenant.slug}) berhasil dihapus.`
      });
    } catch (err) {
      next(err);
    }
  });

  // 6. GET /api/superadmin/users — List all registered users across tenants
  router.get('/users', (req, res, next) => {
    try {
      const users = db.prepare(`
        SELECT 
          u.id,
          u.email,
          u.name,
          u.role,
          u.auth_provider,
          u.created_at,
          t.id as tenant_id,
          t.name as tenant_name,
          t.slug as tenant_slug
        FROM users u
        JOIN tenants t ON u.tenant_id = t.id
        ORDER BY u.created_at DESC
      `).all();

      res.json({
        success: true,
        users
      });
    } catch (err) {
      next(err);
    }
  });

  // 7. PUT /api/superadmin/users/:id/role — Change user role
  router.put('/users/:id/role', (req, res, next) => {
    try {
      const { role } = req.body;
      const validRoles = ['superadmin', 'admin', 'operator', 'mechanic', 'cashier'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Role tidak valid.' });
      }

      db.prepare(`
        UPDATE users 
        SET role = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(role, req.params.id);

      res.json({
        success: true,
        message: `Role pengguna berhasil diubah menjadi ${role}.`
      });
    } catch (err) {
      next(err);
    }
  });

  // 8. GET /api/superadmin/system — Database & runtime diagnostics
  router.get('/system', (req, res) => {
    let dbSize = 'Unknown';
    try {
      const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'data/bengkel.db');
      if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath);
        dbSize = (stats.size / 1024 / 1024).toFixed(2) + ' MB';
      }
    } catch {}

    const pragmaJournal = db.prepare('PRAGMA journal_mode').get()?.journal_mode || 'unknown';
    const pragmaForeignKeys = db.prepare('PRAGMA foreign_keys').get()?.foreign_keys || 0;

    res.json({
      success: true,
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        uptimeSeconds: Math.round(process.uptime()),
        memoryUsageMb: (process.memoryUsage().rss / 1024 / 1024).toFixed(2),
        superadminEmail: process.env.SUPERADMIN_EMAIL || 'Not Configured',
        dbSize,
        sqlitePragmas: {
          journalMode: pragmaJournal,
          foreignKeys: Boolean(pragmaForeignKeys)
        }
      }
    });
  });

  return router;
}
