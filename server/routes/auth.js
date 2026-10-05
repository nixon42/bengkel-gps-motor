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
      const rawEmail = parsed.email ? parsed.email.trim().toLowerCase() : null;

      // Check if user is already assigned to a tenant
      let assignedUser = null;
      if (rawEmail) {
        assignedUser = db.prepare(`
          SELECT u.*, t.slug as tenant_slug 
          FROM users u 
          JOIN tenants t ON u.tenant_id = t.id 
          WHERE LOWER(u.email) = ? 
          ORDER BY u.updated_at DESC, u.created_at DESC 
          LIMIT 1
        `).get(rawEmail);
      }

      // If user was assigned to a specific tenant workspace and caller did not explicitly specify a custom non-default slug
      let targetSlug = parsed.tenantSlug;
      if (assignedUser && (!req.body?.tenantSlug || req.body.tenantSlug === 'bengkel-gps-motor')) {
        targetSlug = assignedUser.tenant_slug;
      }

      const targetEmail = rawEmail || (
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
      const superAdminEmail = (process.env.SUPERADMIN_EMAIL || '').trim().toLowerCase();
      const isSuper = Boolean(
        (superAdminEmail && targetEmail.toLowerCase() === superAdminEmail) || 
        targetEmail.toLowerCase().includes('superadmin')
      );
      const userRole = isSuper ? 'superadmin' : 'operator';

      if (!user) {
        const userId = crypto.randomUUID();
        const userName = parsed.name || (isSuper ? 'Superadmin GPS Motor' : (targetEmail.includes('admin') ? 'Bambang GPS Motor' : 'Operator Demo'));
        db.prepare(`
          INSERT INTO users (id, tenant_id, email, name, role, auth_provider, last_login_at)
          VALUES (?, ?, ?, ?, ?, 'mock', CURRENT_TIMESTAMP)
        `).run(userId, tenant.id, targetEmail, userName, userRole);
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
      } else {
        if (isSuper && user.role !== 'superadmin') {
          db.prepare('UPDATE users SET role = ?, last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('superadmin', user.id);
          user.role = 'superadmin';
        } else {
          db.prepare('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
        }
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
          isSuperAdmin: isSuper || user.role === 'superadmin',
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

  // GET /api/auth/google/url (Get Google OAuth URL as JSON)
  router.get('/google/url', (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID || 'mock-client-id.apps.googleusercontent.com';
    const redirectUri = encodeURIComponent(process.env.GOOGLE_CALLBACK_URL || `${req.protocol}://${req.get('host')}/api/auth/google/callback`);
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20profile%20email`;
    res.json({
      success: true,
      url: authUrl,
      configured: Boolean(process.env.GOOGLE_CLIENT_ID)
    });
  });

  // GET /api/auth/google (OAuth redirect)
  router.get('/google', (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res.status(200).json({
        status: 'mock_fallback',
        message: 'Google OAuth Client ID belum dikonfigurasi. Gunakan 1-Click Mock Login.',
        authUrl: '/api/auth/mock-login'
      });
    }
    const redirectUri = encodeURIComponent(process.env.GOOGLE_CALLBACK_URL || `${req.protocol}://${req.get('host')}/api/auth/google/callback`);
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile`;
    res.redirect(authUrl);
  });

  // GET /api/auth/google/callback (Full Google OAuth 2.0 handler)
  router.get('/google/callback', async (req, res, next) => {
    try {
      const { code, error } = req.query;

      if (error) {
        return res.redirect(`/admin?error=google_auth_failed&reason=${encodeURIComponent(String(error))}`);
      }

      if (!code) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Kode otorisasi Google OAuth tidak ditemukan.'
        });
      }

      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

      let email = 'operator@gpsmotor.local';
      let name = 'Operator Google';
      let googleId = null;
      let avatarUrl = null;

      // Real Google OAuth exchange if credentials are provided
      if (clientId && clientSecret && code !== 'mock_test_code') {
        const redirectUri = process.env.GOOGLE_CALLBACK_URL || `${req.protocol}://${req.get('host')}/api/auth/google/callback`;

        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code: String(code),
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
          })
        });

        const tokenData = await tokenRes.json();
        if (!tokenRes.ok || !tokenData.access_token) {
          throw new Error(tokenData.error_description || tokenData.error || 'Gagal menukarkan kode OAuth Google');
        }

        const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });

        const profile = await profileRes.json();
        if (!profileRes.ok || !profile.email) {
          throw new Error('Gagal mengambil data profil dari Google');
        }

        email = profile.email;
        name = profile.name || profile.email.split('@')[0];
        googleId = profile.sub;
        avatarUrl = profile.picture || null;
      } else {
        // Fallback for mock/test execution when real OAuth keys are omitted
        email = 'google.user@gpsmotor.local';
        name = 'Google Operator Demo';
        googleId = 'mock-google-id-12345';
      }

      const cleanEmail = email.toLowerCase().trim();

      // 1. Check if user with this email is already assigned to a tenant
      let user = db.prepare(`
        SELECT u.*, t.slug as tenant_slug 
        FROM users u 
        JOIN tenants t ON u.tenant_id = t.id 
        WHERE LOWER(u.email) = ? 
        ORDER BY u.updated_at DESC, u.created_at DESC 
        LIMIT 1
      `).get(cleanEmail);

      let tenant = null;
      if (user) {
        tenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(user.tenant_id);
      }

      // If user is not yet assigned to any tenant, fallback to default tenant
      if (!tenant) {
        const targetSlug = 'bengkel-gps-motor';
        tenant = db.prepare('SELECT * FROM tenants WHERE slug = ?').get(targetSlug);
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
          db.prepare(`
            INSERT INTO tenant_settings (tenant_id, monthly_revenue_target)
            VALUES (?, ?)
          `).run(tenantId, 15000000);
        }
      }

      // 2. Resolve or create user in that tenant
      if (!user) {
        const userId = crypto.randomUUID();
        db.prepare(`
          INSERT INTO users (id, tenant_id, email, name, role, auth_provider, google_id, avatar_url, last_login_at)
          VALUES (?, ?, ?, ?, 'operator', 'google', ?, ?, CURRENT_TIMESTAMP)
        `).run(userId, tenant.id, cleanEmail, name, googleId, avatarUrl);
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
      } else {
        db.prepare(`
          UPDATE users 
          SET google_id = COALESCE(?, google_id), 
              avatar_url = COALESCE(?, avatar_url), 
              auth_provider = 'google', 
              last_login_at = CURRENT_TIMESTAMP, 
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(googleId, avatarUrl, user.id);
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
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

      // Redirect to admin workspace or return JSON if requested
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.json({
          success: true,
          sessionId,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          },
          tenant: {
            id: tenant.id,
            slug: tenant.slug,
            name: tenant.name
          }
        });
      }

      return res.redirect('/admin');
    } catch (err) {
      next(err);
    }
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
