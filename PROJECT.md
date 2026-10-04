# Project: Bengkel Mobil GPS Motor Kediri (SPP Bengkel)

## Architecture
- **Framework & Runtime**: Node.js (v20+) with Express.js REST API co-located with Vite + React 18/19 SPA. Single-port architecture (3000) where Express serves `/api/*` and compiled static frontend assets from `dist/`.
- **Database**: SQLite via `better-sqlite3` in WAL mode (`PRAGMA journal_mode = WAL;`) and Foreign Keys enabled. Discriminator column `tenant_id` multi-tenancy enforced at middleware and query level across all tables.
- **Frontend & Styling**: Mobile-first, responsive, modern flat UI using Tailwind CSS. Strictly zero glassmorphism (no `backdrop-blur-*`), solid high-contrast surfaces, 44x44px touch targets, bottom navigation bar on mobile, and persistent dark mode.
- **PDF Generation**: Pure JavaScript `pdfkit` layout engine (< 5MB RAM, no Chromium binaries, instant generation inside Docker).
- **Authentication**: Single-user Google OAuth 2.0 + 1-click local mock/demo login provider (`POST /api/auth/mock-login`) working 100% offline with zero external credentials.
- **Testing**: Self-contained `node test/verify.js` (hooked to `npm test`), validating all R11 requirements against in-process server & SQLite database with exit code 0.
- **Containerization**: Multi-stage `Dockerfile` (Alpine-based, ~130MB image) + `docker-compose.yml` with persistent volumes for SQLite DB (`/app/data`) and file uploads (`/app/uploads`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F01 | Hero & Company Profile | Public landing page with Sambiresik Gampengrejo Kediri info, WhatsApp, Google Maps | M2 | R1 |
| F02 | Layanan Kami Grid | 6 featured services: Tune Up, Injeksi, Overhaul, Kaki-kaki, Kelistrikan, Perawatan Berkala | M2 | R1 |
| F03 | Quick Cek Status Widget | Hero search widget redirecting plate number to public tracking | M2 | R1 |
| F04 | Testimoni & Review | Flat solid customer review cards | M2 | R1 |
| F05 | FAQ Accordion | Expandable/collapsible FAQ accordion on landing page | M2 | R1 |
| F06 | Tenant Isolation | Multi-tenant database partition via tenant_id and slug routing, cross-tenant blocking | M1 | R2, R11 |
| F07 | Single Google OAuth Login | Single-user Google authentication per tenant | M1 | R2 |
| F08 | Mock Login Provider | 1-click local dev login for immediate testing without credentials | M1 | R2, R11 |
| F09 | Tenant Settings Page | Workshop profile, WhatsApp, address, logo upload, slug config | M1 | R2 |
| F10 | Sparepart Full CRUD | SKU, name, category, unit, photo upload/preview, stock, min threshold, prices, supplier | M3 | R3 |
| F11 | Low-Stock Visual Alerts | Red badge for 0 stock, yellow badge for <= min threshold | M3 | R3 |
| F12 | Auto Profit Margin | Nominal & percentage profit margin calculation | M3 | R3 |
| F13 | Advanced Search & Filter | Full-text search, category/stock/price filters, sorting, pagination | M3 | R3 |
| F14 | Barang Masuk (Restock) | Stock in mutation with optional invoice, supplier, photo | M3 | R3a |
| F15 | Barang Keluar (Pemakaian) | Stock out mutation with optional RO link and notes | M3 | R3a |
| F16 | Riwayat Mutasi Stok | Stock movement timeline per item and global view with filters | M3 | R3a |
| F17 | Stok Opname Fisik | Physical vs system stock reconciliation, auto-adjust, audit log | M3 | R3a |
| F18 | Export Inventaris CSV & PDF | Full inventory export to CSV and formatted PDF with photo thumbnails | M3 | R3b |
| F19 | Export Mutasi Stok CSV & PDF | Stock movement history export to CSV and PDF | M3 | R3b |
| F20 | Laporan Stok Kritis PDF | PDF report of items below minimum threshold | M3 | R3b |
| F21 | Valuasi Nilai Inventaris | Total buy value, total sell value, and gross profit potential | M3 | R3b |
| F22 | Catat Transaksi Kas | Income/Expense cashflow entries, optional receipt photo, payment methods | M4 | R4 |
| F23 | Advanced Filter Transaksi | Search description/category, type, date range, amount range, pagination | M4 | R4 |
| F24 | Dashboard Saldo & Agregasi | Income, Expense, Net Balance with Daily/Weekly/Monthly/Yearly toggle | M4 | R4 |
| F25 | Grafik P&L Bulanan & Trend | Monthly P&L bar chart + cashflow trend line chart | M4 | R4 |
| F26 | Target Pendapatan Bulanan | Monthly revenue target with visual progress bar indicator | M4 | R4 |
| F27 | Custom Kategori Keuangan | Tenant-specific income/expense category management | M4 | R4 |
| F28 | Export Transaksi CSV | RFC-4180 CSV export of all financial transactions | M4 | R4 |
| F29 | Export Laporan P&L PDF | Formal Profit & Loss PDF report with workshop header and logo | M4 | R4 |
| F30 | Rekap Kas Harian PDF | Daily cash recap report PDF | M4 | R4 |
| F31 | Laporan Kategori Biaya | Expense category breakdown report in PDF & CSV | M4 | R4 |
| F32 | Manajemen Repair Order | Car RO creation: plate, owner, phone/WA, car make/model/year/color, odo, complaint, mechanic | M5 | R5 |
| F33 | 6-Stage Status Lifecycle | Masuk -> Pemeriksaan -> Pengerjaan -> Menunggu Sparepart -> Selesai -> Sudah Diambil | M5 | R5 |
| F34 | Status Logging & Foto | Actor/timestamp logging, notes, before/progress/after photo documentation | M5 | R5 |
| F35 | Sparepart Usage Linkage | Link inventory parts to RO with automatic stock deduction | M5 | R5 |
| F36 | Estimasi & Override Biaya | Auto-calculated service + parts cost with manual override option | M5 | R5 |
| F37 | Cetak Nota / Invoice PDF | Professional invoice PDF with workshop header, logo, car details, breakdown, total | M5 | R5 |
| F38 | Filter & Search RO | Search plate/customer, filter by status, mechanic, date range | M5 | R5 |
| F39 | Portal Publik Cek Status | Public tracking portal `/:tenant-slug/cek-status` without login | M2 | R6 |
| F40 | Sensor Privasi Plat Nomor | Plate masking on public tracking (e.g. `AG 1234 XX` -> `AG 12** XX`) | M2 | R6 |
| F41 | Sensor Privasi Nama Pemilik | Name masking on public tracking (e.g. `Budi Santoso` -> `Budi S******`) | M2 | R6 |
| F42 | Shortlink & Salin Link | Copy vehicle tracking shortlink button with clipboard toast | M2 | R6 |
| F43 | Share via WhatsApp | Share repair status to customer via WhatsApp with tracking URL | M2 | R6 |
| F44 | Hubungi Bengkel WhatsApp | Direct WhatsApp contact button to `0856-0330-7330` | M2 | R6 |
| F45 | Riwayat Servis Kendaraan | Previous vehicle service history at the workshop | M2 | R6 |
| F46 | Widget Ringkasan Operasional | Active ROs today, monthly revenue, low-stock count widgets | M6 | R7 |
| F47 | Distribusi Status RO | Breakdown chart of cars currently in each of the 6 stages | M6 | R7 |
| F48 | Tren Pendapatan 30 Hari | 30-day daily revenue trend line chart | M6 | R7 |
| F49 | Sparepart Terlaris | Top 5 most used/sold spareparts | M6 | R7 |
| F50 | Recent Activity Feed | Reverse chronological feed of recent ROs and cash transactions | M6 | R7 |
| F51 | Database Pelanggan | Customer CRM: name, phone/WA, email, address, vehicle list | M5 | R8 |
| F52 | Riwayat Servis per Customer | Comprehensive service history per customer | M5 | R8 |
| F53 | Autocomplete Pembuatan RO | Quick search customer to auto-fill vehicle & contact in new RO | M5 | R8 |
| F54 | Flat UI Solid High-Contrast | Modern flat UI styling, strictly zero glassmorphism, no blur | M1 | R9 |
| F55 | Mobile-First & HP Kentang | Low bundle size, compressed lazy images, fast 3G/4G loading | M2 | R9 |
| F56 | Touch Target Ramah Jempol | Minimum 44x44px touch targets for all interactive elements | M2 | R9 |
| F57 | Ergonomic Mobile Navigation | Bottom navigation bar on mobile viewports for thumb operation | M6 | R9 |
| F58 | Dark Mode Support | System preference sync + manual dark mode toggle with persistence | M1 | R9 |
| F59 | Pagination Seluruh Tabel | Pagination on all tables to keep browser RAM usage low | M3 | R9 |
| F60 | Desktop Keyboard Shortcuts | Quick desktop shortcuts (`/`, `Ctrl+K`) for fast cashier operations | M6 | R9 |
| F61 | Git Repository Setup | Git repository initialized with clean `.gitignore` and initial commit | M6 | R10 |
| F62 | AGENT.md di Root Repo | Comprehensive architectural documentation & developer guide | M6 | R10 |
| F63 | Docker & Compose Stack | Multi-stage Dockerfile and docker-compose.yml with persistent volumes | M6 | R10 |
| F64 | Sample Seed Data Kaya | Bengkel GPS Motor Kediri, 20+ spareparts, 30+ transactions, 10+ ROs, 5+ customers | M6 | R10 |
| F65 | Automated Test Suite | `npm test` / `node test/verify.js` testing all R11 scenarios exiting code 0 | M7 | R11 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Core Foundation & Multi-Tenant Auth | Project structure, DB schema (14 tables), SQLite connection, multi-tenant middleware, Google + Mock login, tenant settings API, Vite+React frontend shell with Tailwind flat styling & dark mode | none | DONE |
| M2 | Landing Page & Public Tracking Portal | R1 landing page (hero, GPS Motor Kediri info, WhatsApp, maps, services grid, FAQ, testimonials, search widget) + R6 public tracking portal `/:tenant-slug/cek-status` with backend privacy masking, shortlinks, WhatsApp share | M1 | DONE |
| M3 | Sparepart Inventory, Mutasi Stok & Exports | R3 inventory CRUD, low stock alerts, auto profit margin, advanced search/filter, R3a Mutasi Stok masuk/keluar, stok opname, R3b CSV & PDF exports | M1 | PLANNED |
| M4 | Cashflow Book, Financial Analytics & Reports | R4 financial transactions, categories, advanced filter, dashboard KPI, P&L chart, budget progress bar, CSV & PDF report exports (P&L, daily cash recap, category breakdown) | M1 | PLANNED |
| M5 | Repair Order Lifecycle, Invoicing & CRM | R5 car RO CRUD, 6-stage lifecycle, photo notes, parts linkage with auto stock deduction, cost estimation + override, invoice PDF, R8 customer CRM & autocomplete | M1, M3 | PLANNED |
| M6 | Dashboard Analytics, Mobile Polish, Docker & DevOps | R7 admin dashboard widgets & charts, R9 bottom navigation bar & keyboard shortcuts, R10 Dockerfile, docker-compose.yml, .env.example, rich seed data runner, AGENT.md, Git init | M2, M3, M4, M5 | PLANNED |
| M7 | E2E Verification & Adversarial Coverage Hardening | Phase 1: Pass 100% of E2E test suite (Tiers 1-4) produced by E2E Testing Track. Phase 2: Adversarial coverage hardening (Tier 5). Exit code 0. | M1, M2, M3, M4, M5, M6, E2E Testing Track | PLANNED |

## Interface Contracts
### Auth & Tenant Middleware ↔ Modules
- Request context populated by `middleware/tenant.js` and `middleware/auth.js`:
  `req.tenant`: `{ id: string, slug: string, name: string, ... }`
  `req.user`: `{ id: string, tenant_id: string, email: string, name: string }`
- All database queries MUST include `WHERE tenant_id = ?`.

### Repair Order (M5) ↔ Sparepart Inventory (M3)
- When parts are linked to RO:
  `POST /api/repair-orders/:id/spareparts`: `{ sparepart_id: string, qty: number, harga_satuan: number }`
  Atomically:
  1. Decrements `spareparts.stok`.
  2. Inserts record into `stock_movements (tipe='OUT', ro_id=id, ...)`
  3. Inserts into `ro_spareparts`.
- Detaching part reverses this atomically.

### Repair Order (M5) ↔ Public Tracking (M2)
- Public tracking endpoint:
  `GET /api/public/:slug/tracking?plate=...`
  Returns masked vehicle and repair order data:
  `plate_masked`: e.g. `AG 12** XX`
  `customer_name_masked`: e.g. `Budi S******`
  NO raw phone numbers, owner addresses, or buy prices in the response payload.

### Cashflow (M4) ↔ RO Invoicing (M5)
- When RO is marked paid or completed:
  RO invoice can trigger income transaction in `transactions`:
  `tipe='INCOME'`, `kategori='Jasa Servis'`, `ro_id=id`.

## Code Layout
```
bengkel-gps-motor/
├── data/                         # SQLite database storage (bengkel.db)
├── uploads/                      # Uploaded images (inventory, RO photos, receipts)
│   ├── inventory/
│   ├── ro/
│   └── receipts/
├── server/                       # Backend Application (Express.js)
│   ├── config/                   # Constants and config
│   ├── db/                       # better-sqlite3 connection, schema.sql, seed.js
│   ├── middleware/               # Auth, tenant isolation, validation, upload
│   ├── routes/                   # auth, tenants, inventory, stock-movements, finance, repair-orders, public, dashboard, customers
│   ├── services/                 # pdfService, maskingService, stockService, financeService
│   └── app.js                    # Express app configuration
├── src/                          # Frontend Application (Vite + React)
│   ├── assets/                   # Static icons and logos
│   ├── components/               # UI components (Flat cards, badges, modals, charts, bottom-nav)
│   ├── context/                  # AuthContext, TenantContext, ThemeContext
│   ├── pages/                    # Landing, PublicTracking, Dashboard, Inventory, Mutations, Finance, RepairOrders, Customers, Settings
│   ├── services/                 # API client utilities
│   ├── App.jsx                   # Root routes
│   └── main.jsx                  # Entry point
├── test/                         # E2E Test Suite and Verification
│   ├── verify.js                 # Self-contained verification runner
│   ├── e2e/                      # Tier 1-4 test suites
│   └── fixtures/                 # Test payloads and dummy files
├── Dockerfile                    # Multi-stage production container build
├── docker-compose.yml            # Docker compose configuration
├── .env.example                  # Environment configuration template
├── AGENT.md                      # Comprehensive developer and agent documentation
└── package.json                  # Root dependencies and scripts
```
