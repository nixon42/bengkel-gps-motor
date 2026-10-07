import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { getDatabase } from './db/index.js';
import { authMiddleware } from './middleware/auth.js';
import { tenantMiddleware } from './middleware/tenant.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRoutes } from './routes/auth.js';
import { tenantRoutes } from './routes/tenants.js';
import { publicRoutes } from './routes/public.js';
import { inventoryRoutes } from './routes/inventory.js';
import { stockMovementsRoutes, stockOpnameRoutes } from './routes/stockMovements.js';
import { financeRoutes } from './routes/finance.js';
import { repairOrdersRoutes } from './routes/repairOrders.js';
import { customersRoutes } from './routes/customers.js';
import { dashboardRoutes } from './routes/dashboard.js';
import { superadminRoutes } from './routes/superadmin.js';
import docsRoutes from './routes/docs.js';
import { desaltBuffer } from './services/imageSalter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp(databaseInstance) {
  const db = databaseInstance || getDatabase();
  const app = express();
  app.db = db;

  // Global Middlewares
  // CORS: whitelist from env, fallback to localhost in dev
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // In production, reject unknown origins; in dev/test allow all
      if (process.env.NODE_ENV === 'production') {
        return callback(new Error(`CORS: origin ${origin} not allowed`));
      }
      return callback(null, true);
    },
    credentials: true
  }));
  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static uploads serving
  const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const receiptsDir = path.join(uploadDir, 'receipts');
  if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
  }
  const roUploadDir = path.join(uploadDir, 'ro');
  if (!fs.existsSync(roUploadDir)) {
    fs.mkdirSync(roUploadDir, { recursive: true });
  }
  const MIME_MAP = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf'
  };

  app.use('/uploads', (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next();
    }

    // Path Traversal Security Protection
    const safePath = path.normalize(path.join(uploadDir, req.path));
    if (!safePath.startsWith(path.resolve(uploadDir))) {
      return res.status(403).json({ error: 'Access Denied', message: 'Invalid path' });
    }

    let stat;
    try {
      stat = fs.statSync(safePath);
    } catch {
      return res.status(404).json({ error: 'File Not Found' });
    }

    if (!stat.isFile()) {
      return res.status(404).json({ error: 'File Not Found' });
    }

    // Fast ETag generation
    const etag = `W/"${stat.size.toString(16)}-${Math.floor(stat.mtimeMs).toString(16)}"`;
    res.setHeader('ETag', etag);
    res.setHeader('Last-Modified', stat.mtime.toUTCString());
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Conditional 304 Not Modified Check (Saves CPU & RAM on 2GB VPS)
    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end();
    }
    if (req.headers['if-modified-since']) {
      const clientTime = new Date(req.headers['if-modified-since']).getTime();
      if (!isNaN(clientTime) && clientTime >= Math.floor(stat.mtimeMs / 1000) * 1000) {
        return res.status(304).end();
      }
    }

    if (req.method === 'HEAD') {
      const ext = path.extname(safePath).toLowerCase();
      res.setHeader('Content-Type', MIME_MAP[ext] || 'application/octet-stream');
      return res.status(200).end();
    }

    try {
      const raw = fs.readFileSync(safePath);
      const output = desaltBuffer(raw, process.env.IMAGE_STORAGE_SALT);
      const ext = path.extname(safePath).toLowerCase();
      res.setHeader('Content-Type', MIME_MAP[ext] || 'application/octet-stream');
      res.setHeader('Content-Length', output.length);
      return res.send(output);
    } catch (err) {
      console.error('[Uploads] Error serving file:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Context Resolvers (Auth & Tenant)
  app.use(authMiddleware(db));
  app.use(tenantMiddleware(db));

  // Healthcheck endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Bengkel Mobil GPS Motor Kediri API',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes(db));
  app.use('/api/tenant', tenantRoutes(db));
  app.use('/api/tenants', tenantRoutes(db)); // Alias
  app.use('/api/public', publicRoutes(db));
  app.use('/api/inventory', inventoryRoutes(db));
  app.use('/api/stock-movements', stockMovementsRoutes(db));
  app.use('/api/stock-mutations', stockMovementsRoutes(db)); // Indonesian alias
  app.use('/api/stock-opname', stockOpnameRoutes(db));
  app.use('/api/finance', financeRoutes(db));
  app.use('/api/repair-orders', repairOrdersRoutes(db));
  app.use('/api/customers', customersRoutes(db));
  app.use('/api/dashboard', dashboardRoutes(db));
  app.use('/api/superadmin', superadminRoutes(db));
  app.use('/api/docs', docsRoutes);

  // Direct route handler for /panduan and /docs (always returns HTML)
  const distDir = path.join(__dirname, '../dist');
  app.get(['/panduan', '/docs', '/panduan/*', '/docs/*'], (req, res) => {
    if (fs.existsSync(distDir)) {
      return res.sendFile(path.join(distDir, 'index.html'));
    }
    const rootIndex = path.join(__dirname, '../index.html');
    if (fs.existsSync(rootIndex)) {
      return res.sendFile(rootIndex);
    }
    res.status(200).send('<!DOCTYPE html><html><head><title>Panduan Bengkel Mobil GPS Motor Kediri</title></head><body><div id="root"></div></body></html>');
  });

  // Static public assets (favicon.svg, manifest.json, etc.)
  const publicDir = path.join(__dirname, '../public');
  if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
  }

  // Static frontend assets in production / when dist exists
  if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
        return next();
      }
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export default createApp;
