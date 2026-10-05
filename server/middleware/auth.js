export function authMiddleware(db) {
  return (req, res, next) => {
    const sessionId = req.cookies?.bengkel_session || 
                      (req.headers.authorization?.startsWith('Bearer ') 
                        ? req.headers.authorization.slice(7) 
                        : null);

    if (!sessionId) {
      return next();
    }

    try {
      const row = db.prepare(`
        SELECT 
          s.id AS session_id,
          s.expires_at,
          u.id AS user_id,
          u.email,
          u.name,
          u.role,
          u.avatar_url,
          t.id AS tenant_id,
          t.slug AS tenant_slug,
          t.name AS tenant_name,
          t.address AS tenant_address,
          t.phone_wa AS tenant_phone_wa,
          t.business_hours AS tenant_business_hours,
          t.logo_url AS tenant_logo_url
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        JOIN tenants t ON s.tenant_id = t.id
        WHERE s.id = ?
      `).get(sessionId);

      if (!row) {
        res.clearCookie('bengkel_session');
        return next();
      }

      if (new Date(row.expires_at) <= new Date()) {
        db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
        res.clearCookie('bengkel_session');
        return next();
      }

      const superAdminEmail = (process.env.SUPERADMIN_EMAIL || '').trim().toLowerCase();
      const isSuperAdmin = Boolean(
        (superAdminEmail && row.email.toLowerCase() === superAdminEmail) || 
        row.role === 'superadmin'
      );

      req.sessionId = row.session_id;
      req.user = {
        id: row.user_id,
        tenant_id: row.tenant_id,
        email: row.email,
        name: row.name,
        role: isSuperAdmin ? 'superadmin' : row.role,
        isSuperAdmin,
        avatar_url: row.avatar_url
      };
      req.tenant = {
        id: row.tenant_id,
        slug: row.tenant_slug,
        name: row.tenant_name,
        address: row.tenant_address,
        phone_wa: row.tenant_phone_wa,
        business_hours: row.tenant_business_hours,
        logo_url: row.tenant_logo_url
      };
      req.tenantId = row.tenant_id;
    } catch (err) {
      console.error('Error in authMiddleware:', err);
    }

    next();
  };
}

export function requireAuth(req, res, next) {
  if (!req.user || !req.tenantId) {
    return res.status(401).json({
      error: 'Unauthenticated',
      message: 'Akses ditolak. Silakan login terlebih dahulu.'
    });
  }
  next();
}

export function requireSuperAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthenticated',
      message: 'Akses ditolak. Silakan login terlebih dahulu.'
    });
  }

  const superAdminEmail = (process.env.SUPERADMIN_EMAIL || '').trim().toLowerCase();
  const isSuper = Boolean(
    (superAdminEmail && req.user.email?.toLowerCase() === superAdminEmail) || 
    req.user.role === 'superadmin' ||
    req.user.isSuperAdmin
  );

  if (!isSuper) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Akses ditolak. Halaman ini khusus untuk Superadmin sistem.'
    });
  }

  next();
}

