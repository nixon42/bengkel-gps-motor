export function tenantMiddleware(db) {
  return (req, res, next) => {
    // If tenant already set by auth middleware, continue
    if (req.tenant && req.tenantId) {
      return next();
    }

    const slug = req.params?.slug || 
                 req.query?.tenantSlug || 
                 req.query?.tenant || 
                 req.headers['x-tenant-slug'];

    const tenantId = req.headers['x-tenant-id'];

    try {
      let tenant = null;

      if (tenantId) {
        tenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(tenantId);
      } else if (slug) {
        tenant = db.prepare('SELECT * FROM tenants WHERE slug = ?').get(slug);
      } else if (req.user?.tenant_id) {
        tenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(req.user.tenant_id);
      }

      if (tenant) {
        req.tenant = tenant;
        req.tenantId = tenant.id;
      }
    } catch (err) {
      console.error('Error in tenantMiddleware:', err);
    }

    next();
  };
}

export function requireTenant(req, res, next) {
  if (!req.tenant || !req.tenantId) {
    return res.status(404).json({
      error: 'Tenant not found',
      message: 'Workspace bengkel tidak ditemukan.'
    });
  }
  next();
}
