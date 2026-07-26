# 🚀 Amdox AI-Powered Cloud ERP Suite
## Complete Project Overview — Internship Documentation

---

## 📌 Project Purpose & Vision

Amdox ERP is a **production-grade, AI-powered cloud Enterprise Resource Planning (ERP) system** built as a 3-month internship project. The goal was to build a real-world, scalable SaaS ERP platform that a mid-size Indian manufacturing/services company could actually run — not a toy prototype.

**Core Problem It Solves:**  
SMEs and mid-market companies spend ₹10–50 lakh/year on fragmented tools (Tally for accounting, Excel for HR, separate inventory software). Amdox replaces all of these with one integrated, multi-tenant, AI-enhanced platform.

**Key Features:**
- Multi-tenant architecture (one codebase, many companies)
- Double-entry accounting with period closing and FX
- Indian payroll with TDS/PF/ESI calculations
- AI demand forecasting using Facebook Prophet
- Hash-chained immutable audit trail
- Real-time notifications and webhook events
- PWA support (works offline on mobile)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  Next.js 15 (React 19) · PWA · Framer Motion · Tailwind CSS 4  │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS / REST
┌──────────────────────────────▼──────────────────────────────────┐
│                      API GATEWAY LAYER                          │
│  NestJS 11 · Helmet · ThrottlerGuard · Swagger OpenAPI 3.1      │
│  JWT RS256 · Cookie-based Refresh Token · RBAC Guards           │
└──────┬──────────────────┬──────────────────┬────────────────────┘
       │                  │                  │
┌──────▼──────┐  ┌────────▼──────┐  ┌───────▼────────┐
│  Feature    │  │   Job Queue   │  │  ML Service    │
│  Modules    │  │   BullMQ      │  │  Python/Prophet│
│  (12 total) │  │   Valkey      │  │  FastAPI       │
└──────┬──────┘  └───────────────┘  └───────┬────────┘
       │                                     │
┌──────▼─────────────────────────────────────▼────────────────────┐
│                        DATA LAYER                               │
│  PostgreSQL 17 + TimescaleDB · Prisma ORM 7 · Meilisearch       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Folder Structure

```
amdox-internship-main/
├── backend/                    ← NestJS 11 API Server
│   ├── src/
│   │   ├── main.ts             ← App bootstrap (Swagger, Helmet, CORS)
│   │   ├── app.module.ts       ← Root module wiring all modules
│   │   ├── prisma/
│   │   │   ├── prisma.service.ts   ← Multi-tenant Prisma with $extends
│   │   │   └── prisma.module.ts    ← Global module
│   │   ├── auth/               ← F-01: Auth Module
│   │   │   ├── auth.controller.ts  ← /auth/login, /register, /refresh, /me
│   │   │   ├── auth.service.ts     ← JWT, bcrypt, OTPlib MFA
│   │   │   ├── jwt.strategy.ts     ← Passport JWT + tenant context injection
│   │   │   ├── guards/             ← JwtAuthGuard, RolesGuard
│   │   │   └── dto/                ← LoginDto, RegisterDto, VerifyMfaDto
│   │   ├── finance/            ← F-02, F-03: Finance + AP/AR
│   │   │   ├── finance.service.ts  ← GL, double-entry, FX rates
│   │   │   ├── invoices.service.ts ← AP/AR, aging report, payments
│   │   │   └── dto/
│   │   ├── hr/                 ← F-04, F-05: HR + Payroll
│   │   │   ├── hr.service.ts       ← Employees, org chart, leave, attendance
│   │   │   ├── payroll.service.ts  ← TDS/PF/ESI calculations, payslips
│   │   │   └── payroll.processor.ts ← BullMQ background job
│   │   ├── supply/             ← F-06: Supply Chain
│   │   │   └── supply.service.ts   ← Vendors, POs, GR, inventory, forecasts
│   │   ├── projects/           ← F-07: Project Management
│   │   ├── bi/                 ← F-08: Business Intelligence
│   │   ├── audit/              ← F-09: Immutable Audit Trail
│   │   │   └── audit.service.ts    ← SHA-256 hash chaining
│   │   ├── notifications/      ← F-10: Notifications
│   │   ├── webhooks/           ← F-11: Webhook events
│   │   └── common/
│   │       ├── filters/        ← Global exception filter
│   │       └── interceptors/   ← Logging + TenantContext interceptors
│   ├── prisma/
│   │   ├── schema.prisma       ← 35+ models, all tenant-scoped
│   │   └── seed.ts             ← Demo data: 30 employees, 50 vendors, 100 SKUs
│   ├── prisma.config.ts        ← Prisma 7 datasource config
│   └── package.json
│
├── frontend/                   ← Next.js 15 App
│   └── src/
│       ├── app/
│       │   ├── page.tsx            ← Landing/marketing page
│       │   ├── login/page.tsx      ← Auth login page
│       │   └── (app)/              ← Protected route group
│       │       ├── layout.tsx      ← Sidebar + Topbar wrapper
│       │       ├── dashboard/      ← KPI cards, charts, alerts
│       │       ├── finance/        ← GL, trial balance, periods
│       │       ├── hr/             ← Employee cards, leave, org chart
│       │       ├── payroll/        ← Run payroll, payslips
│       │       ├── supply-chain/   ← Inventory, POs, vendors
│       │       ├── projects/       ← Project list, tasks
│       │       ├── bi/             ← BI dashboard
│       │       ├── audit/          ← Audit log viewer
│       │       └── settings/       ← User/tenant settings
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Sidebar.tsx     ← Collapsible nav (Framer Motion)
│       │   │   └── Topbar.tsx      ← Search, notifications, user menu
│       │   └── ui/                 ← Shared UI components
│       └── lib/
│           ├── api.ts              ← Typed API client (auto token refresh)
│           └── utils.ts            ← cn(), formatters
│
├── backend/ml-service/         ← Python ML Service
│   └── main.py                 ← FastAPI + Prophet demand forecasting
├── docker-compose.yml          ← PostgreSQL+TimescaleDB, Valkey, Meilisearch
├── .env.example                ← All environment variables documented
├── start.ps1                   ← One-command dev startup
└── k8s/                        ← Kubernetes manifests
```

---

## 🔐 Authentication & Security System (F-01)

### How It Works:
1. User submits email/password → backend validates → issues **15-minute JWT access token**
2. A **7-day HttpOnly Secure cookie** stores the refresh token
3. Frontend auto-refreshes silently when 401 is received
4. Refresh token is **rotated** on every use (prevents replay attacks)
5. TOTP-based MFA using `otplib` — QR code generated, stored as `mfaSecret`

### Multi-Tenancy:
- Every DB record has `tenantId`
- Prisma `$extends` query extension **automatically injects** `WHERE tenantId = ?` on every read/write
- `AsyncLocalStorage` carries tenant context through the request lifecycle without passing it everywhere

### RBAC:
```
SuperAdmin → can do everything
Admin      → full module access
Manager    → approve, read, limited writes
Employee   → read own records only
```

---

## 💰 Finance Module (F-02, F-03)

### Double-Entry Accounting Engine:
```
Rule: Sum(Debits) MUST equal Sum(Credits)
Example journal entry:
  DR  Cash          ₹50,000
  CR  Sales Revenue ₹50,000   ← Always balanced
```

The backend validates this before saving — throws `BadRequestException` if imbalanced.

### Chart of Accounts (COA):
5 account types: **Asset, Liability, Equity, Revenue, Expense**  
Hierarchical: parent accounts can have children (e.g., 4000 Sales → 4001 Product Sales, 4002 Service)

### AP/AR:
- **AP** = Accounts Payable (money owed to vendors)
- **AR** = Accounts Receivable (money owed by customers)
- Aging report buckets: Current / 30 / 60 / 90 / 90+ days overdue
- 3-way match: PO ↔ Goods Receipt ↔ Invoice

### FX Rates:
Fetches live exchange rates from `api.frankfurter.app` (free, no API key needed).

---

## 👥 HR & Payroll Module (F-04, F-05)

### Indian Payroll Engine:
```
Gross Salary breakdown:
  Basic Pay        = 50% of Gross
  HRA              = 20% of Gross
  Special Allowance = 30% of Gross

Deductions (auto-calculated):
  PF (Employee)  = 12% of Basic  (₹1,800 on ₹15,000 basic)
  PF (Employer)  = 12% of Basic  (employer contribution)
  ESI (Employee) = 0.75% of Gross (only if Gross ≤ ₹21,000)
  ESI (Employer) = 3.25% of Gross
  Professional Tax = ₹200/month (state-specific)
  TDS            = Monthly income tax as per IT slabs

Net Pay = Gross - PF(emp) - ESI(emp) - PT - TDS
```

### Income Tax Slabs (New Regime FY 2025-26):
| Income Range | Rate |
|---|---|
| 0 – ₹3,00,000 | 0% |
| ₹3,00,001 – ₹7,00,000 | 5% |
| ₹7,00,001 – ₹10,00,000 | 10% |
| ₹10,00,001 – ₹12,00,000 | 15% |
| ₹12,00,001 – ₹15,00,000 | 20% |
| Above ₹15,00,000 | 30% |

### Payroll Processing:
- Initiated via API → creates `PayrollRun` record with status `Processing`
- **BullMQ** queues the job to Valkey
- `PayrollProcessor` picks it up, calculates payslips for ALL active employees
- Updates status to `Completed` with totals

### Leave & Attendance:
- Leave types: Annual, Sick, Casual, Compensatory
- Clock-in/out via `upsert` on `AttendanceLog` (unique per employee+date)
- Overtime auto-calculated: hours > 8

---

## 📦 Supply Chain Module (F-06)

### Purchase Order Lifecycle:
```
Draft → Pending Approval → Approved → Sent to Vendor
  → Partial Goods Receipt → Full Receipt → Invoiced → Paid
```

### 3-Way Match:
Prevents fraud by requiring:
1. **PO** (what was ordered)
2. **Goods Receipt** (what actually arrived)
3. **Invoice** (what vendor is charging)

Only pays when all 3 match.

### Inventory:
- Each SKU has stock levels per warehouse
- Low-stock alerts fire when stock ≤ `reorderLevel`
- Goods Receipt automatically increments stock (via `upsert` on `StockLevel`)

---

## 🔍 Audit Trail (F-09)

### Hash-Chain Integrity:
```
Log 1: hash = SHA256("action|entity|id|userId|changes|0")
Log 2: hash = SHA256("action|entity|id|userId|changes|hash_of_log_1")
Log N: hash = SHA256(...|hash_of_log_N-1)
```

This means if **any log is tampered with**, the hash chain breaks and the integrity check fails. Built-in tamper detection.

---

## 🤖 ML Service (Phase 2)

Located at `backend/ml-service/main.py`. Built with:
- **FastAPI** for HTTP API
- **Facebook Prophet** for time-series forecasting
- Takes historical sales/inventory data → predicts next 30/60/90 days demand
- Supply chain module calls it via HTTP to trigger forecasts

---

## 🏗️ Infrastructure

### Docker Compose Services:
| Service | Image | Port | Purpose |
|---|---|---|---|
| PostgreSQL + TimescaleDB | `timescale/timescaledb:latest` | 5432 | Main DB + time-series audit |
| Valkey | `valkey/valkey:8-alpine` | 6379 | Redis-compatible, BullMQ queues, rate limiting |
| Meilisearch | `getmeili/meilisearch:v1.8` | 7700 | Full-text search across all modules |

### Key Environment Variables:
```bash
DATABASE_URL          # PostgreSQL connection string
JWT_SECRET            # 64+ character random secret
JWT_ACCESS_EXPIRES_IN # 15m (access token TTL)
REDIS_HOST            # Valkey host
ML_SERVICE_URL        # Python ML service URL
CORS_ORIGIN           # Frontend origin(s)
SMTP_HOST             # Email server (Nodemailer)
```

---

## 🛠️ Technology Stack Decisions & Rationale

| Technology | Why Chosen |
|---|---|
| **NestJS 11** | TypeScript-first, modular, DI container, Swagger built-in, decorator-based — perfect for enterprise APIs |
| **Next.js 15** | App Router, Server Components, PWA support, best-in-class DX for React |
| **Prisma ORM 7** | Type-safe queries, migrations, `$extends` for middleware-like query interception |
| **PostgreSQL + TimescaleDB** | PostgreSQL for ACID transactions; TimescaleDB extension adds time-series optimization for audit logs |
| **Valkey** | Redis-compatible, open-source, no licensing issues. Used for BullMQ job queues and rate limiting |
| **BullMQ** | Reliable job queues with retries and backoff — critical for payroll processing that can't be lost |
| **Framer Motion** | Production-quality animations with spring physics — makes the UI feel alive |
| **Meilisearch** | Near-instant full-text search across employees, vendors, invoices — <50ms typical |
| **Facebook Prophet** | Industry-standard time-series forecasting, handles seasonality and holidays automatically |
| **otplib** | TOTP-based MFA (compatible with Google Authenticator) |
| **bcrypt** | Password hashing with salt rounds = 12 |

---

## ⚡ Challenges Faced & Solutions

### 1. 🔴 Prisma 7 Breaking Change — `$use` Middleware Removed
**Problem:** We used `$use()` for tenant-scoping middleware, but Prisma 7 completely removed it.  
**Solution:** Rewrote PrismaService to use `$extends` query extension with `$allModels.$allOperations` hook. All tenant-scoping and soft-delete logic moved inside. Used a delegation pattern (explicit getters for each model) since extended client can't extend `PrismaClient` directly.

### 2. 🔴 `npm install` Failing — node Not Found
**Problem:** Prisma's postinstall script calls `node scripts/preinstall-entry.js`, but `node` wasn't on PATH in the terminal session.  
**Solution:** Explicitly set `$env:PATH` to include the fnm-managed Node.js installation path before running npm commands. Added to all build scripts.

### 3. 🔴 Multi-Tenant Isolation Without RLS
**Problem:** Needed per-request tenant isolation without PostgreSQL Row-Level Security (which requires superuser to set).  
**Solution:** Used `AsyncLocalStorage` to carry `tenantId` through the entire request lifecycle without prop-drilling. The Prisma `$extends` middleware reads it automatically on every query.

### 4. 🔴 Cookie-Parser TypeScript Import
**Problem:** `import * as cookieParser from 'cookie-parser'` fails at runtime — namespace import can't be called.  
**Solution:** Changed to `import cookieParser from 'cookie-parser'` (default import) with `esModuleInterop: true` in tsconfig.

### 5. 🔴 `$transaction` Array Form Incompatible with Extended Client
**Problem:** `prisma.$transaction([op1, op2])` (sequential array form) doesn't work with `$extends` extended clients.  
**Solution:** Replaced all array-form transactions with interactive callback form: `prisma.$transaction(async (tx) => { ... })`.

### 6. 🔴 Prisma Schema Validation Error
**Problem:** `Timesheet` model had a relation to `Tenant` but `Tenant` model didn't have the reverse field declared.  
**Solution:** Ran `npx prisma format` which auto-added the missing reverse relation fields to all models. Prisma format also removed the `url` field from datasource block (Prisma 7 moved it to `prisma.config.ts`).

### 7. 🟡 Docker Container Naming Conflicts
**Problem:** Old containers from previous builds blocked new ones with port conflicts.  
**Solution:** Stripped all Phase-2 services (Keycloak, Elasticsearch, Prometheus, Grafana) from `docker-compose.yml`. Switched Redis to Valkey (open-source, faster).

### 8. 🟡 `npm_package_version` Undefined in ESM Context
**Problem:** `process.env.npm_package_version` is `undefined` when running in certain contexts.  
**Solution:** Added safe fallback `|| '1.0.0'` in health check endpoint.

### 9. 🔴 Legacy Apollo/GraphQL Pages in Next.js Build
**Problem:** Original frontend pages (bi, audit, projects, settings) imported `@apollo/client` — GraphQL layer was never fully connected and the package wasn't in `node_modules`.  
**Solution:** Replaced all 5 affected pages with REST-based implementations using our new `src/lib/api.ts` client. Stubbed `apollo.ts` and `queries.ts`. Stripped `ApolloProvider` from `Providers.tsx`.

### 10. 🔴 OpenTelemetry SDK Version Conflict
**Problem:** `import '@/lib/otel'` in root `layout.tsx` crashed the entire build — `cs.addSpanProcessor is not a function` — due to incompatible OTel SDK version with Next.js 15's Turbopack bundler.  
**Solution:** Removed the otel import from layout.tsx, stubbed `otel.ts`. Marked full OTel integration as Phase 2 (requires pinning compatible SDK + using `instrumentation.ts` Next.js hook instead of direct import).

### 11. 🟡 `'use client'` Missing on Client-Interactive Components
**Problem:** `Topbar.tsx` used `useState`, `useEffect` and Zustand's `useUIStore` but was missing the `'use client'` directive — Next.js 15 App Router treats files without it as Server Components, which can't use browser APIs.  
**Solution:** Added `'use client'` to `Topbar.tsx`. This is a common footgun in Next.js App Router — any component using React hooks or browser APIs must be explicitly marked as a Client Component.

---

## 🔄 Request Lifecycle (End-to-End Flow)

```
[Browser] → Login with email/password
              ↓
[Frontend] → POST /api/v1/auth/login
              ↓
[NestJS] ThrottlerGuard (100 req/min check)
              ↓
         ValidationPipe (DTO validation)
              ↓
         AuthController.login()
              ↓
         AuthService → bcrypt.compare(password, hash)
              ↓
         JwtService.sign({ sub, tenantId, role }, 15m)
              ↓
         RefreshToken stored in DB
              ↓
         Response: { accessToken } + Set-Cookie: refreshToken (HttpOnly)
              ↓
[Frontend] stores accessToken in localStorage
           every request adds: Authorization: Bearer <token>
              ↓
[Any Protected Route]:
  JwtAuthGuard → PassportStrategy → validate JWT
              ↓
  JwtStrategy.validate() → tenantContext.enterWith({ tenantId, userId })
              ↓
  TenantContextInterceptor wraps handler in AsyncLocalStorage.run()
              ↓
  Any Prisma query → $extends hook reads tenantContext.getStore()
                   → auto-injects WHERE tenantId = '...'
              ↓
  Response → LoggingInterceptor logs: "POST /api/v1/hr/employees 201 42ms"
```

---

## 📊 Database Schema Highlights

**35+ Prisma models** organized by module:

| Module | Models |
|---|---|
| Auth | `User`, `Tenant`, `TenantUser`, `Role`, `Permission`, `RefreshToken` |
| Finance | `Account`, `JournalEntry`, `JournalLine`, `FinancialPeriod`, `FxRate` |
| AP/AR | `Invoice`, `Payment` |
| HR | `Employee`, `LeaveRequest`, `LeaveBalance`, `AttendanceLog` |
| Payroll | `PayrollRun`, `Payslip` |
| Supply | `Vendor`, `PurchaseOrder`, `PurchaseOrderLine`, `GoodsReceipt`, `GoodsReceiptLine`, `Warehouse`, `InventoryItem`, `StockLevel`, `DemandForecast` |
| Projects | `Project`, `Milestone`, `Task`, `ResourceAssignment`, `Budget`, `Timesheet` |
| BI | `Dashboard`, `Widget`, `ScheduledReport` |
| System | `AuditLog`, `Notification`, `NotificationPreference`, `Webhook`, `WebhookDelivery` |

**All tenant-scoped models** automatically include:
- `tenantId String` — multi-tenant isolation
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`
- `deletedAt DateTime?` — soft delete support

---

## 🌱 Seed Data (Demo Environment)

Running `npx prisma db seed` creates:
- **1 Tenant**: NexaOps Manufacturing Pvt Ltd (`nexaops.com`)
- **1 SuperAdmin User**: `admin@nexaops.com` / `Demo@2026!`
- **30 Employees** across 6 departments with realistic salaries
- **50 Vendors** with GST numbers, categories, and credit terms
- **100 Inventory SKUs** across 8 categories with warehouse stock levels
- **12 months of GL entries** (journal entries for FY 2025-26)
- **6 months of payroll runs** with payslips for all employees
- **25 Purchase Orders** at various lifecycle stages
- **Financial Periods** Q1-Q4 FY2025-26 (Q1/Q2 closed, Q3/Q4 open)

---

## 🚀 How to Run the Project

### Prerequisites:
- Node.js v22.14.0 (via fnm)
- Docker Desktop
- Git

### Step 1: Start Infrastructure
```bash
docker compose up -d
# Starts: PostgreSQL+TimescaleDB, Valkey, Meilisearch
```

### Step 2: Setup Backend
```bash
cd backend

# Set environment variables
cp ../.env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET etc.

# Install dependencies
npm install --legacy-peer-deps

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed demo data
npx prisma db seed

# Start backend (dev mode)
npm run start:dev
# API available at http://localhost:5000
# Swagger at http://localhost:5000/api-docs
```

### Step 3: Setup Frontend
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
# App available at http://localhost:3000
```

### Step 4: (Optional) ML Service
```bash
cd backend/ml-service
pip install fastapi uvicorn prophet pandas
uvicorn main:app --reload --port 8000
```

### Login:
- URL: `http://localhost:3000`
- Email: `admin@nexaops.com`
- Password: `Demo@2026!`

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register new tenant + admin |
| POST | `/api/v1/auth/login` | Login → access + refresh token |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| GET | `/api/v1/auth/me` | Get current user |
| GET | `/api/v1/finance/accounts` | Chart of accounts |
| POST | `/api/v1/finance/journal` | Create journal entry |
| GET | `/api/v1/finance/trial-balance` | Trial balance |
| GET | `/api/v1/finance/fx-rates` | FX rates |
| GET | `/api/v1/finance/invoices` | List AP/AR invoices |
| GET | `/api/v1/finance/invoices/aging-report` | AR aging buckets |
| GET | `/api/v1/hr/employees` | List employees |
| GET | `/api/v1/hr/employees/org-chart` | Org chart tree |
| POST | `/api/v1/hr/attendance/clock-in` | Clock in |
| POST | `/api/v1/hr/attendance/clock-out` | Clock out |
| POST | `/api/v1/payroll/run` | Initiate payroll run |
| GET | `/api/v1/payroll/payslips` | Get payslips |
| GET | `/api/v1/supply/inventory/low-stock` | Low stock alerts |
| POST | `/api/v1/supply/purchase-orders` | Create PO |
| GET | `/api/v1/bi/summary` | Dashboard KPIs |
| GET | `/api/v1/audit/logs` | Audit trail |
| GET | `/api/v1/audit/verify` | Hash-chain integrity check |
| GET | `/api/v1/health` | Health check |

Full interactive docs at: **`http://localhost:5000/api-docs`**

---

## 📈 Performance Characteristics

| Metric | Target | How Achieved |
|---|---|---|
| API p95 latency | < 50ms | Prisma query optimization, no N+1 (eager loading) |
| Auth token refresh | < 10ms | In-memory JWT verification, no DB lookup |
| Payroll 1000 employees | < 30s | BullMQ background queue, async processing |
| Search latency | < 20ms | Meilisearch in-memory index |
| DB connections | Pooled | Prisma connection pool (max 10) |

---

## 🔮 Phase 2 Roadmap (Post-Internship)

- [ ] Move `ml-service/` to its own repo/service
- [ ] Add Keycloak SSO for enterprise identity federation
- [ ] Elasticsearch for log analytics
- [ ] Prometheus + Grafana monitoring
- [ ] Mobile app (React Native, shared API)
- [ ] CRM module (Leads, Contacts, Opportunities)
- [ ] Advanced BI (drag-and-drop dashboard builder)
- [ ] Document Management with OCR
- [ ] Multi-currency close with FX revaluation

---

## 👨‍💻 Internship Learnings

Working on this project provided hands-on experience with:

1. **Modular monolith architecture** — how to structure a large codebase without microservices complexity
2. **Multi-tenant SaaS patterns** — tenant isolation at the ORM layer vs database vs application layer
3. **Real Indian financial compliance** — TDS slabs, PF/ESI rules, GST, financial period closing
4. **Job queue patterns** — BullMQ for reliable background processing with retries
5. **Security-first design** — JWT rotation, HttpOnly cookies, helmet, rate limiting
6. **Production Prisma** — schema design for 35+ models, migrations, seeding, Prisma 7 extensions
7. **Full-stack TypeScript** — sharing types between backend and frontend
8. **Premium UI/UX** — dark mode design system, Framer Motion animations, responsive layouts

---

*Document generated: July 2026 | Amdox ERP Suite v1.0 MVP*
