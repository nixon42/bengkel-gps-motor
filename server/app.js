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
  app.use('/uploads', express.static(uploadDir, {
    dotfiles: 'ignore',
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
  }));

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

  // Static public assets (favicon.svg, manifest.json, etc.)
  const publicDir = path.join(__dirname, '../public');
  if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
  }

  // Static frontend assets in production / when dist exists
  const distDir = path.join(__dirname, '../dist');
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
