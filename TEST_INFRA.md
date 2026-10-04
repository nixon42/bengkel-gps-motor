# Test Infrastructure & Methodology — Bengkel Mobil GPS Motor Kediri

## 1. Overview & Architecture

The testing infrastructure for **Bengkel Mobil GPS Motor Kediri (SPP Bengkel)** is an in-process, opaque-box E2E verification suite designed for high speed, zero external dependencies, and complete data isolation.

### Key Architectural Characteristics
- **In-Process Supertest Execution**: Tests run against the live Express application (`createApp(db)`) via `supertest`, executing realistic HTTP requests, middleware pipelines, cookie handling, and route handlers.
- **Isolated In-Memory SQLite Databases**: Each test execution initializes a clean, isolated SQLite database in `:memory:` via `initDatabase(':memory:')`, loading the complete 14-table DDL schema from `server/db/schema.sql` and seeding default tenant workspaces without touching development or production data in `data/bengkel.db`.
- **Discriminator Column Isolation**: Rigorous multi-tenant verification between Tenant A (`bengkel-gps-motor`) and Tenant B (`bengkel-berkah-kediri`), verifying that data queries strictly bind `WHERE tenant_id = ?`.
- **Zero Flakiness & Sub-Second Execution**: Complete test suite runs in under ~200ms with zero network socket delays and zero browser driver overhead.

---

## 2. Four-Tier Testing Methodology

The test suite is structured around a 4-tier testing hierarchy that ensures comprehensive verification across all project requirements (R1–R11) and edge cases (E01–E18).

```
┌─────────────────────────────────────────────────────────────┐
│ Tier 4: Real-World Scenarios                                │
│   - End-to-end customer workflow: Avanza AG 1822 AB         │
│   - Intake -> Diagnosa -> Parts Linkage -> Public Tracking  │
│   - Pickup -> Cashflow Income -> Invoice PDF                │
├─────────────────────────────────────────────────────────────┤
│ Tier 3: Cross-Feature Interactions                          │
│   - RO parts linkage atomically decrements stock & logs OUT │
│   - Part detachment restores inventory stock                │
│   - Status transition to DIAMBIL auto-records INCOME        │
│   - Stock Opname adjustment updates inventory valuation     │
├─────────────────────────────────────────────────────────────┤
│ Tier 2: Boundary & Corner Cases (E01–E18)                   │
│   - Empty payloads & schema validation rejection (400)      │
│   - Divide-by-zero margin safety (E08: harga_beli = 0)      │
│   - Negative profit margin handling (E09: selling at loss)  │
│   - Plate variations: AG1234XX vs AG 1234 XX (E01)          │
│   - Short plate adaptive masking: AG 1* X, B 1* A (E03)     │
│   - Customer name masking: Slamet -> Sla*** (E04), Ed -> E* │
│   - Public data stripping: phone, address, buy price (E06)  │
│   - Cross-tenant access blocking: 403 / 404 (E07)           │
│   - Stock underflow rejection: 422 (E10)                    │
│   - Negative stock opname variance: physical < system (E11) │
│   - Negative cashflow deficit: expenses > income (E12)      │
│   - RFC-4180 CSV escaping for quotes/commas/newlines (E18)  │
├─────────────────────────────────────────────────────────────┤
│ Tier 1: Feature Coverage (R1–R11 Core Functions)            │
│   - T1.1: Health Check (GET /api/health)                    │
│   - T1.2: Mock Login & Session Cookie Generation (R2)       │
│   - T1.3: Authenticated Session Profile (/api/auth/me)      │
│   - T1.4: Protected Route 401 Guard                         │
│   - T1.5: Logout Session Invalidation                       │
│   - T1.6: Tenant Settings CRUD & Multi-Tenant Isolation     │
│   - T1.7: Tenant Slug Collision Prevention (409 Conflict)   │
│   - T1.8: Sparepart Inventory CRUD & Auto Profit Margin (R3)│
│   - T1.9: Mutasi Stok (Masuk, Keluar, Opname) (R3a)         │
│   - T1.10: Financial Cashflow & Net Balance (R4)            │
│   - T1.11: Repair Order 6-Stage Lifecycle (R5)              │
│   - T1.12: Public Tracking Lookup with Privacy Masking (R6) │
│   - T1.13: Export Endpoints (CSV RFC-4180 & PDF %PDF-)      │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Progressive Testability Architecture

During project development, features are implemented across milestones:
- **Milestone 1**: Core Foundation, SQLite DB, Tenant Isolation, Mock Auth, Tenant Settings
- **Milestone 2**: Landing Page, Public Tracking Portal (`/api/public/:slug/tracking`)
- **Milestone 3**: Sparepart Inventory, Mutasi Stok (`/api/inventory`, `/api/stock-movements`, `/api/stock-opname`)
- **Milestone 4**: Cashflow Book, P&L Reports (`/api/finance/*`)
- **Milestone 5**: Repair Order Lifecycle, Photos, Parts Linkage, Invoice PDF, Customer CRM
- **Milestone 6**: Dashboard Analytics, Seed Data, Docker
- **Milestone 7**: Complete Suite Hardening (100% Pass)

### Intelligent Route Detection
`test/verify.js` implements progressive testability:
1. When tests run during early milestones (e.g., M1), all active milestone features and pure mathematical/masking logic execute with full assertions.
2. For endpoints scheduled for future milestones (e.g., M2–M5) that have not yet been mounted in `server/app.js`, the test runner detects the unmounted route, catalogs it as `⏳ PENDING [Milestone X]`, and does not fail the build.
3. As each milestone worker mounts its routes, the exact same test immediately executes against the live route and verifies its contracts.
4. When `--strict` is passed (required in Milestone 7), all 32 tests across all 4 tiers must be active and pass 100%.

---

## 4. Expected Output Derivation & Oracles

All tests compare system output against authoritative specifications in `ORIGINAL_REQUEST.md`, `PROJECT.md`, and mathematical/RFC standards:

| Requirement / Edge Case | Test Input Vector | Authoritative Rule / Oracle | Expected Observable Output |
|---|---|---|---|
| **E01 (Plate Normalization)** | `'AG1234XX'`, `'ag-1234-xx'`, `'AG   1234   XX'` | Canonical Indonesian plate formatting | Normalizes to `'AG 12** XX'` |
| **E03 (Short Plate)** | `'AG 1 X'` (1-digit), `'B 12 A'` (2-digit) | Preserve region and suffix, mask digit | `'AG 1* X'`, `'B 1* A'` |
| **E04 (Single Name)** | `'Slamet'` | Preserve first 3 letters, mask rest | `'Sla***'` without crashing |
| **E05 (Short Name)** | `'Ed'`, `'Bo'`, `'A'` | First letter + asterisk | `'E*'`, `'B*'`, `'A*'` |
| **E06 (Public Stripping)** | `GET /api/public/:slug/tracking?plate=...` | Zero private data leakage | No `phone`, `address`, `buy_price` |
| **E08 (Margin Zero Divisor)**| `harga_beli = 0`, `harga_jual = 5000` | Safe margin formula: `sell > 0 ? ((sell - buy) / sell) * 100 : 0` | `percentage = 100%`, finite, NO `NaN` |
| **E09 (Negative Margin)** | `harga_beli = 90000`, `harga_jual = 60000` | Loss margin formula | `nominal = -30000`, `percentage < 0` |
| **E10 (Stock Underflow)** | Out movement qty (10) > stock (2) | Inventory floor constraint | HTTP `422 Unprocessable Entity` / `400` |
| **E11 (Opname Loss)** | System stock (10), Physical count (7) | `selisih = fisik - sistem` | Difference `-3`, stock reconciled to `7` |
| **E12 (Cashflow Deficit)** | Income: `1.000.000`, Expense: `3.500.000` | `net_balance = income - expense` | `net_balance = -2.500.000`, deficit flag |
| **E18 (CSV Escaping)** | `'Oli Shell, Filter Oli'`, `'Servis "Tune Up"'` | RFC-4180 standard | Wrapped in quotes, internal quotes doubled |

---

## 5. File Inventory & Test Layout

```
test/
├── fixtures.js                 # Complete fixtures: tenants, mock users, catalog, ROs, vectors
├── supertestHelper.js          # In-process test harness, auth login, agent, logic oracles
├── verify.js                   # Master test runner with colorized output & tier filtering
└── e2e/
    ├── tier1-features.js       # Tier 1: Core feature coverage (T1.1–T1.13)
    ├── tier2-boundary.js       # Tier 2: Boundary & corner cases (T2.1–T2.13)
    ├── tier3-interactions.js   # Tier 3: Cross-module interactions (T3.1–T3.4)
    └── tier4-scenarios.js      # Tier 4: Real-world customer workflows (T4.1)
```

---

## 6. How to Run Tests

### Standard Verification Run (Current Milestone Readiness)
```bash
node test/verify.js
# or
npm test
```

### Run by Specific Tier
```bash
node test/verify.js --tier=1    # Run Tier 1 Feature Coverage only
node test/verify.js --tier=2    # Run Tier 2 Boundary & Corner Cases only
node test/verify.js --tier=3    # Run Tier 3 Cross-Feature Interactions only
node test/verify.js --tier=4    # Run Tier 4 Real-World Scenarios only
```

### Strict Mode (Milestone 7 All-Routes Enforcement)
```bash
node test/verify.js --strict    # Exits with 1 if any milestone route is unmounted
```
