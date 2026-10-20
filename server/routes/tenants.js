import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';

export function tenantRoutes(db) {
  const router = Router();

  // All routes in tenant router require authentication
  router.use(requireAuth);

  const UpdateTenantSettingsSchema = z.object({
    name: z.string().min(3, 'Nama bengkel minimal 3 karakter').max(100).optional(),
    slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan strip (-)').optional(),
    address: z.string().min(5, 'Alamat minimal 5 karakter').max(255).optional(),
    phoneWa: z.string().min(8, 'Nomor WhatsApp minimal 8 digit').max(25).optional(),
    phone_wa: z.string().min(8).max(25).optional(),
    businessHours: z.string().max(100).optional(),
    business_hours: z.string().max(100).optional(),
    logoUrl: z.string().nullable().optional(),
    logo_url: z.string().nullable().optional(),
    heroImageUrl: z.string().nullable().optional(),
    hero_image_url: z.string().nullable().optional(),
    facilityImage1: z.string().nullable().optional(),
    facility_image_1: z.string().nullable().optional(),
    facilityImage2: z.string().nullable().optional(),
    facility_image_2: z.string().nullable().optional(),
    tagline: z.string().max(150).nullable().optional(),
    mapsUrl: z.string().nullable().optional(),
    maps_url: z.string().nullable().optional(),
    mapsEmbedUrl: z.string().nullable().optional(),
    maps_embed_url: z.string().nullable().optional(),
    latitude: z.union([z.number(), z.string()]).nullable().optional(),
    longitude: z.union([z.number(), z.string()]).nullable().optional(),
    profileCompleted: z.union([z.boolean(), z.number()]).optional(),
    profile_completed: z.union([z.boolean(), z.number()]).optional(),
    monthlyRevenueTarget: z.number().nonnegative().optional(),
    monthly_revenue_target: z.number().nonnegative().optional(),
    invoiceFooter: z.string().max(255).optional(),
    invoice_footer: z.string().max(255).optional(),
    autoPrintInvoice: z.union([z.boolean(), z.number()]).optional(),
    auto_print_invoice: z.union([z.boolean(), z.number()]).optional(),
    notifyWa: z.union([z.boolean(), z.number()]).optional(),
    notify_wa: z.union([z.boolean(), z.number()]).optional()
  });

  // GET /api/tenant/settings
  router.get('/settings', (req, res, next) => {
    try {
      const tenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(req.tenantId);
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant tidak ditemukan' });
      }

      let settings = db.prepare('SELECT * FROM tenant_settings WHERE tenant_id = ?').get(req.tenantId);
      if (!settings) {
        db.prepare(`
          INSERT INTO tenant_settings (tenant_id, monthly_revenue_target)
          VALUES (?, ?)
        `).run(req.tenantId, 15000000);
        settings = db.prepare('SELECT * FROM tenant_settings WHERE tenant_id = ?').get(req.tenantId);
      }

      res.json({
        success: true,
        tenant: {
          id: tenant.id,
          slug: tenant.slug,
          name: tenant.name,
          address: tenant.address,
          phone_wa: tenant.phone_wa,
          phoneWa: tenant.phone_wa,
          business_hours: tenant.business_hours,
          businessHours: tenant.business_hours,
          logo_url: tenant.logo_url,
          logoUrl: tenant.logo_url,
          hero_image_url: tenant.hero_image_url || null,
          heroImageUrl: tenant.hero_image_url || null,
          facility_image_1: tenant.facility_image_1 || null,
          facilityImage1: tenant.facility_image_1 || null,
          facility_image_2: tenant.facility_image_2 || null,
          facilityImage2: tenant.facility_image_2 || null,
          tagline: tenant.tagline || '',
          maps_url: tenant.maps_url || null,
          mapsUrl: tenant.maps_url || null,
          maps_embed_url: tenant.maps_embed_url || null,
          mapsEmbedUrl: tenant.maps_embed_url || null,
          latitude: tenant.latitude || null,
          longitude: tenant.longitude || null,
          profile_completed: Boolean(tenant.profile_completed),
          profileCompleted: Boolean(tenant.profile_completed),
          created_at: tenant.created_at,
          updated_at: tenant.updated_at
        },
        settings: {
          tenant_id: settings.tenant_id,
          monthly_revenue_target: settings.monthly_revenue_target,
          monthlyRevenueTarget: settings.monthly_revenue_target,
          invoice_footer: settings.invoice_footer,
          invoiceFooter: settings.invoice_footer,
          auto_print_invoice: Boolean(settings.auto_print_invoice),
          autoPrintInvoice: Boolean(settings.auto_print_invoice),
          notify_wa: Boolean(settings.notify_wa),
          notifyWa: Boolean(settings.notify_wa),
          updated_at: settings.updated_at
        }
      });
    } catch (err) {
      next(err);
    }
  });

  // PUT /api/tenant/settings
  router.put('/settings', (req, res, next) => {
    try {
      const parsed = UpdateTenantSettingsSchema.parse(req.body);
      const tenantId = req.tenantId;

      // Check current tenant
      const currentTenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(tenantId);
      if (!currentTenant) {
        return res.status(404).json({ error: 'Tenant tidak ditemukan' });
      }

      // Check slug collision
      const newSlug = parsed.slug || currentTenant.slug;
      if (newSlug !== currentTenant.slug) {
        const slugCollision = db.prepare('SELECT id FROM tenants WHERE slug = ? AND id != ?').get(newSlug, tenantId);
        if (slugCollision) {
          return res.status(409).json({
            error: 'Slug Conflict',
            message: `Slug "${newSlug}" sudah digunakan oleh bengkel lain.`
          });
        }
      }

      const updateData = {
        name: parsed.name ?? currentTenant.name,
        slug: newSlug,
        address: parsed.address ?? currentTenant.address,
        phone_wa: parsed.phoneWa ?? parsed.phone_wa ?? currentTenant.phone_wa,
        business_hours: parsed.businessHours ?? parsed.business_hours ?? currentTenant.business_hours,
        logo_url: parsed.logoUrl !== undefined ? parsed.logoUrl : (parsed.logo_url !== undefined ? parsed.logo_url : currentTenant.logo_url),
        hero_image_url: parsed.heroImageUrl !== undefined ? parsed.heroImageUrl : (parsed.hero_image_url !== undefined ? parsed.hero_image_url : currentTenant.hero_image_url),
        facility_image_1: parsed.facilityImage1 !== undefined ? parsed.facilityImage1 : (parsed.facility_image_1 !== undefined ? parsed.facility_image_1 : currentTenant.facility_image_1),
        facility_image_2: parsed.facilityImage2 !== undefined ? parsed.facilityImage2 : (parsed.facility_image_2 !== undefined ? parsed.facility_image_2 : currentTenant.facility_image_2),
        tagline: parsed.tagline !== undefined ? parsed.tagline : currentTenant.tagline,
        maps_url: parsed.mapsUrl !== undefined ? parsed.mapsUrl : (parsed.maps_url !== undefined ? parsed.maps_url : currentTenant.maps_url),
        maps_embed_url: parsed.mapsEmbedUrl !== undefined ? parsed.mapsEmbedUrl : (parsed.maps_embed_url !== undefined ? parsed.maps_embed_url : currentTenant.maps_embed_url),
        latitude: parsed.latitude !== undefined ? (parsed.latitude ? Number(parsed.latitude) : null) : currentTenant.latitude,
        longitude: parsed.longitude !== undefined ? (parsed.longitude ? Number(parsed.longitude) : null) : currentTenant.longitude,
        profile_completed: parsed.profileCompleted !== undefined ? (parsed.profileCompleted ? 1 : 0) : (parsed.profile_completed !== undefined ? (parsed.profile_completed ? 1 : 0) : currentTenant.profile_completed ?? 1)
      };

      db.prepare(`
        UPDATE tenants
        SET name = ?, slug = ?, address = ?, phone_wa = ?, business_hours = ?, 
            logo_url = ?, hero_image_url = ?, facility_image_1 = ?, facility_image_2 = ?, 
            tagline = ?, maps_url = ?, maps_embed_url = ?, latitude = ?, longitude = ?, 
            profile_completed = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        updateData.name,
        updateData.slug,
        updateData.address,
        updateData.phone_wa,
        updateData.business_hours,
        updateData.logo_url,
        updateData.hero_image_url,
        updateData.facility_image_1,
        updateData.facility_image_2,
        updateData.tagline,
        updateData.maps_url,
        updateData.maps_embed_url,
        updateData.latitude,
        updateData.longitude,
        updateData.profile_completed,
        tenantId
      );

      // Update tenant_settings
      const currentSettings = db.prepare('SELECT * FROM tenant_settings WHERE tenant_id = ?').get(tenantId);
      const monthlyTarget = parsed.monthlyRevenueTarget ?? parsed.monthly_revenue_target ?? currentSettings?.monthly_revenue_target ?? 15000000;
      const invoiceFooter = parsed.invoiceFooter ?? parsed.invoice_footer ?? currentSettings?.invoice_footer ?? 'Terima kasih telah mempercayakan kendaraan Anda pada Bengkel GPS Motor Kediri.';
      const autoPrint = parsed.autoPrintInvoice !== undefined ? (parsed.autoPrintInvoice ? 1 : 0) : (parsed.auto_print_invoice !== undefined ? (parsed.auto_print_invoice ? 1 : 0) : currentSettings?.auto_print_invoice ?? 0);
      const notifyWa = parsed.notifyWa !== undefined ? (parsed.notifyWa ? 1 : 0) : (parsed.notify_wa !== undefined ? (parsed.notify_wa ? 1 : 0) : currentSettings?.notify_wa ?? 1);

      if (currentSettings) {
        db.prepare(`
          UPDATE tenant_settings
          SET monthly_revenue_target = ?, invoice_footer = ?, auto_print_invoice = ?, notify_wa = ?, updated_at = CURRENT_TIMESTAMP
          WHERE tenant_id = ?
        `).run(monthlyTarget, invoiceFooter, autoPrint, notifyWa, tenantId);
      } else {
        db.prepare(`
          INSERT INTO tenant_settings (tenant_id, monthly_revenue_target, invoice_footer, auto_print_invoice, notify_wa)
          VALUES (?, ?, ?, ?, ?)
        `).run(tenantId, monthlyTarget, invoiceFooter, autoPrint, notifyWa);
      }

      const updatedTenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(tenantId);
      const updatedSettings = db.prepare('SELECT * FROM tenant_settings WHERE tenant_id = ?').get(tenantId);

      res.json({
        success: true,
        message: 'Pengaturan profil bengkel berhasil diperbarui.',
        tenant: updatedTenant,
        settings: updatedSettings
      });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/tenant/photo (Upload or update hero, facility, or logo)
  router.post('/photo', uploadSingle('general', 'photo'), (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Tidak ada file foto yang diunggah.' });
      }

      const photoUrl = req.file.relativeUrl;
      const type = (req.body.type || req.query.type || 'hero').toLowerCase();
      let column = 'hero_image_url';
      if (type === 'facility1' || type === 'facility_1') column = 'facility_image_1';
      else if (type === 'facility2' || type === 'facility_2') column = 'facility_image_2';
      else if (type === 'logo') column = 'logo_url';

      db.prepare(`
        UPDATE tenants
        SET ${column} = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(photoUrl, req.tenantId);

      const updatedTenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(req.tenantId);

      res.json({
        success: true,
        message: `Foto ${type} bengkel berhasil diperbarui.`,
        photoUrl,
        type,
        tenant: updatedTenant
      });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/tenant/logo
  router.post('/logo', uploadSingle('general', 'logo'), (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Tidak ada file logo yang diunggah.' });
      }

      const logoUrl = req.file.relativeUrl;
      db.prepare(`
        UPDATE tenants
        SET logo_url = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(logoUrl, req.tenantId);

      res.json({
        success: true,
        message: 'Logo bengkel berhasil diperbarui.',
        logoUrl,
        logo_url: logoUrl
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
