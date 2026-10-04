# AGENT.md — Developer & Autonomous Agent Architecture Guide

> **Bengkel Mobil GPS Motor Kediri** (SPP Bengkel)  
> Alamat: Jl. Raya Sambiresik No. 45, Kec. Gampengrejo, Kab. Kediri, Jawa Timur  
> WhatsApp: 0856-0330-7330  
> Slug Utama: `bengkel-gps-motor`

---

## 1. System Overview & Architectural Model

SPP Bengkel is a modern, mobile-first, multi-tenant workshop management web application and public tracking portal tailored for car repair shops, with Bengkel Mobil GPS Motor Kediri as the reference implementation.

### Key Architectural Tenets:
1. **Single-Port Architecture (3000)**:
   - In production and container environments, a unified Express.js process serves REST API endpoints under `/api/*`, static media uploads under `/uploads/*`, and precompiled Vite + React static single-page application (SPA) assets from `dist/` with client-side route fallback.
2. **Mobile-First & HP Kentang Performance**:
   - Zero Glassmorphism: strictly **no** `backdrop-blur-*`, **no** semi-transparent GPU-intensive filters. Surfaces use solid flat high-contrast colors (`#ffffff`, `#f8fafc`, `#1e293b`, `#0f172a`).
   - Touch Ergonomics: interactive tap targets enforce `>= 44x44px` (`touch-target`).
   - Lightweight Pure SVG Visualizations: inline donut and line charts without heavy external chart libraries.
   - Lightweight pure JavaScript PDF generation via `pdfkit` (< 5MB RAM, zero Chromium / Puppeteer overhead).
3. **Multi-Tenant Data Partitioning**:
   - SQLite (`better-sqlite3`) in WAL mode (`PRAGMA journal_mode = WAL;`) and Foreign Key enforcement enabled.
   - Strict multi-tenant isolation enforced via discriminator `tenant_id` on all tables and queries (`WHERE tenant_id = ?`).
4. **Privacy-Preserving Public Tracking Portal**:
   - Zero-login customer vehicle tracking at `/:slug/cek-status`.
   - Automatic privacy masking: plate numbers (`AG 1822 AB` → `AG 18** AB`) and customer names (`Joko Widodo` → `Joko W*****`) are masked by the backend service. Raw phone numbers, buy prices, and addresses are stripped from public responses.
5. **Single-Operator Auth & 1-Click Mock Login**:
   - Dedicated local mock authentication (`POST /api/auth/mock-login`) enables 100% offline development and automated testing with zero external credential dependencies.

---

## 2. Relational Database Schema & ERD

The database contains 14 relational tables with cascading foreign keys and optimized indexes.

### Entity Relationship Diagram (ERD)

```
+-----------------------------------------------------------------------------------+
|                                     tenants                                       |
|  id (PK), slug (UQ), name, address, phone_wa, business_hours, logo_url, created_at |
+-----------------------------------------------------------------------------------+
   |  1         |  1           |  1           |  1           |  1           |  1
   |            |              |              |              |              |
   |            |              |              |              |              +--------------------------+
   |            |              |              |              |                                         |
   v *          v *            v *            v *            v *                                       v *
+-------+   +-----------+  +----------+  +----------+  +------------------------+             +---------------+
| users |   | sessions  |  | settings |  |customers |  | transaction_categories |             |  spareparts   |
+-------+   +-----------+  +----------+  +----------+  +------------------------+             +---------------+
                                              | 1                   | 1                               | 1
                                              |                     |                                 |
                                              v *                   v *                               v *
                                         +----------+       +---------------+                 +---------------+
                                         | vehicles |       | transactions  |                 |stock_movements|
                                         +----------+       +---------------+                 +---------------+
                                              | 1                   ^                                 ^
                                              |                     | (optional ro_id)                | (optional ro_id)
                                              v *                   |                                 |
                                    +------------------+------------+                                 |
                                    |  repair_orders   |----------------------------------------------+
                                    +------------------+
                                       | 1        | 1        | 1
                                       v *        v *        v *
                               +-------------+ +---------+ +---------------+
                               |ro_status_logs| |ro_photos| | ro_spareparts |
                               +-------------+ +---------+ +---------------+
                                                                   | *
                                                                   v 1
                                                             +---------------+
                                                             |  spareparts   |
                                                             +---------------+
```

### Table Specifications:

1. **`tenants`**: Workshop workspace boundary (`id`, `slug`, `name`, `address`, `phone_wa`, `business_hours`, `logo_url`).
2. **`users`**: Operator accounts (`id`, `tenant_id`, `email`, `name`, `role`, `auth_provider`, `google_id`).
3. **`sessions`**: Active authentication cookies (`id`, `user_id`, `tenant_id`, `expires_at`).
4. **`tenant_settings`**: Revenue targets and invoicing preferences (`tenant_id`, `monthly_revenue_target`, `invoice_footer`, `auto_print_invoice`, `notify_wa`).
5. **`customers`**: CRM customer registry (`id`, `tenant_id`, `name`, `phone`, `email`, `address`, `notes`).
6. **`vehicles`**: Vehicle registry linked to customer (`id`, `tenant_id`, `customer_id`, `plate_number`, `brand`, `model`, `year`, `color`).
7. **`spareparts`**: Inventory catalog (`id`, `tenant_id`, `sku`, `name`, `category`, `unit`, `min_stock`, `stock`, `buy_price`, `sell_price`, `supplier`, `is_active`).
8. **`stock_movements`**: Immutable stock mutations (`id`, `tenant_id`, `sparepart_id`, `type [IN, OUT, ADJUSTMENT]`, `quantity`, `unit_price`, `total_price`, `date`, `supplier`, `invoice_number`, `notes`, `repair_order_id`).
9. **`stock_opnames`**: Physical inventory reconciliation audits (`id`, `tenant_id`, `sparepart_id`, `system_stock`, `physical_stock`, `difference`, `reason`, `date`).
10. **`transaction_categories`**: Cashflow categories (`id`, `tenant_id`, `name`, `type [INCOME, EXPENSE]`, `is_default`).
11. **`transactions`**: Cashbook ledger (`id`, `tenant_id`, `category_id`, `type`, `amount`, `date`, `description`, `payment_method [CASH, TRANSFER, QRIS]`, `receipt_url`, `repair_order_id`).
12. **`repair_orders`**: Car repair projects with 6-stage lifecycle (`id`, `tenant_id`, `ro_number`, `tracking_token`, `customer_id`, `plate_number`, `customer_name`, `customer_phone`, `car_brand`, `car_model`, `car_year`, `car_color`, `odometer_in`, `entry_date`, `complaint`, `mechanic_name`, `status [MASUK, DIAGNOSA, PENGERJAAN, MENUNGGU_PART, SELESAI, DIAMBIL]`, `service_fee`, `sparepart_fee`, `discount`, `total_cost`, `estimated_completion`, `notes`).
13. **`ro_status_logs`**: Audit trail of stage changes (`id`, `tenant_id`, `repair_order_id`, `previous_status`, `new_status`, `notes`, `actor_name`, `created_at`).
14. **`ro_photos`**: Repair photographic documentation (`id`, `tenant_id`, `repair_order_id`, `photo_url`, `stage [BEFORE, PROGRESS, AFTER]`, `caption`).
15. **`ro_spareparts`**: Parts attached to repair orders (`id`, `tenant_id`, `repair_order_id`, `sparepart_id`, `item_name`, `quantity`, `unit_price`, `subtotal`).

---

## 3. API Endpoints Specification

### Health & Core
- `GET /api/health`: Service healthcheck and uptime.

### Authentication (`/api/auth`)
- `POST /api/auth/mock-login`: 1-click mock login (`{ tenantSlug: "bengkel-gps-motor" }`). Sets session cookie.
- `GET /api/auth/me`: Current logged-in operator and tenant profile.
- `POST /api/auth/logout`: Revokes active session and clears cookie.

### Tenant Management (`/api/tenant`)
- `GET /api/tenant/settings`: Retrieve workshop configuration.
- `PUT /api/tenant/settings`: Update workshop name, address, WhatsApp, hours, and revenue target.

### Public Customer Tracking (`/api/public`)
- `GET /api/public/:slug/info`: Public workshop profile and business hours.
- `GET /api/public/:slug/tracking?plate=AG1822AB`: Privacy-masked vehicle tracking response.

### Dashboard & Analytics (`/api/dashboard`)
- `GET /api/dashboard/summary`: Operational widgets, 6-stage RO distribution, 30-day revenue trend, top 5 parts, and 10 recent activities.
- `GET /api/dashboard/stats`: Alias for `/summary`.

### Sparepart Inventory (`/api/inventory`)
- `GET /api/inventory`: List parts with pagination, category filter, stock threshold filter, and search.
- `POST /api/inventory`: Create new sparepart item.
- `PUT /api/inventory/:id`: Update sparepart data.
- `DELETE /api/inventory/:id`: Soft delete / deactivate part.
- `GET /api/inventory/export/csv`: Export full catalog to RFC-4180 CSV.
- `GET /api/inventory/export/pdf`: Formatted printable PDF inventory catalog.
- `GET /api/inventory/valuation`: Total buy valuation, potential retail valuation, and gross margin.

### Mutasi Stok (`/api/stock-movements`)
- `GET /api/stock-movements`: Movement audit history (IN, OUT, ADJUSTMENT).
- `POST /api/stock-movements/in`: Record stock purchase / restock.
- `POST /api/stock-movements/out`: Record part consumption.
- `GET /api/stock-movements/export/csv`: Export stock mutations to CSV.
- `GET /api/stock-movements/export/pdf`: Export stock mutations to PDF.

### Stok Opname (`/api/stock-opname`)
- `GET /api/stock-opname`: Historical physical reconciliation logs.
- `POST /api/stock-opname`: Submit physical audit and auto-adjust system inventory stock.

### Buku Kas & Keuangan (`/api/finance`)
- `GET /api/finance/categories`: Cashflow categories list.
- `POST /api/finance/categories`: Add custom category.
- `GET /api/finance/summary?period=month`: Income, expense, and net balance summary.
- `GET /api/finance/transactions`: Searchable and filterable transactions ledger.
- `POST /api/finance/transactions`: Record income or expense with optional receipt upload.
- `GET /api/finance/export/csv`: Export transactions to CSV.
- `GET /api/finance/reports/pnl/pdf`: Formal Profit & Loss PDF report with workshop header and logo.
- `GET /api/finance/reports/daily/pdf`: Daily cash recap report PDF.

### Repair Orders (`/api/repair-orders`)
- `GET /api/repair-orders`: List repair orders with status filter, date range, and plate search.
- `POST /api/repair-orders`: Create new repair order project.
- `GET /api/repair-orders/:id`: Full details including logs, attached parts, and photos.
- `POST /api/repair-orders/:id/status`: Advance stage (`MASUK` → `DIAGNOSA` → `PENGERJAAN` → `MENUNGGU_PART` → `SELESAI` → `DIAMBIL`).
- `POST /api/repair-orders/:id/spareparts`: Link sparepart (atomically decrements stock and logs `OUT` mutation).
- `DELETE /api/repair-orders/:id/spareparts/:partId`: Detach sparepart (atomically restores stock).
- `GET /api/repair-orders/:id/invoice/pdf`: Professional printable invoice / nota PDF.

### Customer CRM (`/api/customers`)
- `GET /api/customers`: Customer database with vehicle history.
- `GET /api/customers/search?q=...`: Quick autocomplete endpoint for new RO creation.

---

## 4. Development, Testing & Operations

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Seed database with rich sample data
npm run seed

# 3. Run development server (Vite frontend with API proxy)
npm run dev

# Or run backend Express server directly:
npm run dev:server
```

### Automated E2E Verification
```bash
# Run full 32/32 automated test suite covering all tiers and edge cases:
npm test

# Run with strict mode:
node test/verify.js --strict
```

### Production Build & Single-Port Server
```bash
# Compile frontend into dist/
npm run build

# Start single-port production server (port 3000)
npm start
```

### Docker Deployment
```bash
# Build and start containerized stack with persistent volumes
docker compose up --build -d

# Check service logs
docker compose logs -f

# Run seed script inside container
docker compose exec app node server/db/seed.js

# Stop containers
docker compose down
```

---

## 5. Security & Isolation Guidelines for Autonomous Agents

1. **Always Enforce Multi-Tenancy**: Every SQL query must bind `WHERE tenant_id = ?`. Never query or mutate cross-tenant records.
2. **Never Return Raw Customer Data in Public Routes**: Public tracking endpoints must pass payloads through `server/services/maskingService.js` to mask plates and names and omit buy prices, telephone numbers, and addresses.
3. **Preserve Modern Flat Styling**: Never introduce `backdrop-blur` or glassmorphic filters in React components or CSS. Keep touch targets `>= 44x44px`.
