import { Router } from 'express';
import crypto from 'node:crypto';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';

export function authRoutes(db) {
  const router = Router();

  const MockLoginSchema = z.object({
    tenantSlug: z.string().min(2).max(50).optional().default('bengkel-gps-motor'),
    email: z.string().email().optional(),
    name: z.string().optional()
  });

  // POST /api/auth/mock-login
  router.post('/mock-login', (req, res, next) => {
    try {
      const parsed = MockLoginSchema.parse(req.body || {});
      const targetSlug = parsed.tenantSlug;
      const targetEmail = parsed.email || (
        targetSlug === 'bengkel-gps-motor'
          ? 'admin@gpsmotor.local'
          : `admin@${targetSlug.toLowerCase().replace(/[^a-z0-9_-]/g, '')}.local`
      );

      // 1. Resolve or create tenant
      let tenant = db.prepare('SELECT * FROM tenants WHERE slug = ?').get(targetSlug);
      if (!tenant) {
        const tenantId = crypto.randomUUID();
        db.prepare(`
          INSERT INTO tenants (id, slug, name, address, phone_wa, business_hours)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          tenantId,
          targetSlug,
          'Bengkel Mobil GPS Motor Kediri',
          'Sambiresik, Kec. Gampengrejo, Kab. Kediri, Jawa Timur',
          '0856-0330-7330',
          'Senin - Sabtu: 08:00 - 17:00 WIB'
        );
        tenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(tenantId);

        // Ensure settings exist
        db.prepare(`
          INSERT INTO tenant_settings (tenant_id, monthly_revenue_target)
          VALUES (?, ?)
        `).run(tenantId, 15000000);
      }

      // 2. Resolve or create user
      let user = db.prepare('SELECT * FROM users WHERE email = ? AND tenant_id = ?').get(targetEmail, tenant.id);
      if (!user) {
        const userId = crypto.randomUUID();
        const userName = parsed.name || (targetEmail.includes('admin') ? 'Bambang GPS Motor' : 'Operator Demo');
        db.prepare(`
          INSERT INTO users (id, tenant_id, email, name, role, auth_provider)
          VALUES (?, ?, ?, ?, 'operator', 'mock')
        `).run(userId, tenant.id, targetEmail, userName);
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
      }

      // 3. Create active session (7 days validity)
      const sessionId = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      db.prepare(`
        INSERT INTO sessions (id, user_id, tenant_id, expires_at)
        VALUES (?, ?, ?, ?)
      `).run(sessionId, user.id, tenant.id, expiresAt);

      // 4. Set HTTP-Only Cookie
      res.cookie('bengkel_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.json({
        success: true,
        sessionId,
        user: {
          id: user.id,
          tenant_id: user.tenant_id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar_url: user.avatar_url
        },
        tenant: {
          id: tenant.id,
          slug: tenant.slug,
          name: tenant.name,
          address: tenant.address,
          phone_wa: tenant.phone_wa,
          business_hours: tenant.business_hours,
          logo_url: tenant.logo_url
        }
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/auth/google (OAuth stub)
  router.get('/google', (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res.status(200).json({
        status: 'mock_fallback',
        message: 'Google OAuth Client ID belum dikonfigurasi. Gunakan 1-Click Mock Login.',
        authUrl: '/api/auth/mock-login'
      });
    }
    const redirectUri = encodeURIComponent(process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile`;
    res.redirect(authUrl);
  });

  // GET /api/auth/google/callback (OAuth callback stub)
  router.get('/google/callback', (req, res) => {
    res.status(200).json({
      status: 'pending_implementation',
      message: 'Google OAuth Callback handler. Silakan login via Mock Login untuk development & testing.',
      query: req.query
    });
  });

  // GET /api/auth/me
  router.get('/me', (req, res) => {
    if (!req.user || !req.tenant) {
      return res.status(401).json({
        authenticated: false,
        error: 'Unauthenticated',
        message: 'Tidak ada sesi aktif.'
      });
    }

    res.json({
      authenticated: true,
      user: req.user,
      tenant: req.tenant
    });
  });

  // POST /api/auth/logout
  router.post('/logout', (req, res) => {
    if (req.sessionId) {
      db.prepare('DELETE FROM sessions WHERE id = ?').run(req.sessionId);
    }
    res.clearCookie('bengkel_session');
    res.json({
      success: true,
      message: 'Berhasil logout.'
    });
  });

  return router;
}
