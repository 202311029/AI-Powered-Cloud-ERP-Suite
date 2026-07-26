# AI-Powered-Cloud-ERP-Suite
Amdox is a full-stack, AI-powered multi-tenant Cloud ERP platform targeting mid-market businesses. Built as a Turborepo monorepo using Next.js 15, NestJS 11, Python FastAPI, PostgreSQL/Prisma, Valkey, Meilisearch, and BullMQ — spanning 12 integrated ERP modules.

<div align="center">

# 🚀 Amdox — AI-Powered Cloud ERP Suite

**A production-grade, multi-tenant Cloud ERP platform for mid-market companies**

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-e0234e)](https://nestjs.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-TimescaleDB-336791)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM%207-2d3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-Proprietary-lightgrey)]()

[Quick Start](#-quick-start) • [Modules](#-core-modules) • [API Docs](#-api-endpoints) • [Full Project Overview](./amdox-internship-main/PROJECT_OVERVIEW.md)

</div>

---

## 📌 Overview

Amdox is a **production-grade, AI-powered Cloud ERP system**, built to replace the fragmented mix of tools (accounting software, spreadsheets, standalone inventory systems) that SMEs and mid-market companies typically rely on — with one integrated, multi-tenant platform.

**Highlights:**
- 🏢 Multi-tenant architecture — one codebase serving many companies, isolated at the ORM layer
- 💰 Double-entry accounting engine with period closing and live FX rates
- 🇮🇳 Indian payroll engine — automated TDS, PF, and ESI calculations
- 🤖 AI-driven demand forecasting powered by Facebook Prophet
- 🔒 Hash-chained, tamper-evident audit trail (SHA-256)
- 🔔 Real-time notifications and webhook event delivery
- 📱 PWA support — works offline on mobile

> For deep implementation details (request lifecycle, DB schema, payroll math, security architecture, and engineering write-ups), see [`PROJECT_OVERVIEW.md`](./amdox-internship-main/PROJECT_OVERVIEW.md).

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  Next.js 15 (React 19) · PWA · Framer Motion · Tailwind CSS 4    │
└──────────────────────────────┬───────────────────────────────────┘
                                │ HTTPS / REST
┌──────────────────────────────▼───────────────────────────────────┐
│                      API GATEWAY LAYER                           │
│  NestJS 11 · Helmet · ThrottlerGuard · Swagger OpenAPI 3.1       │
│  JWT RS256 · Cookie-based Refresh Token · RBAC Guards            │
└──────┬──────────────────┬──────────────────┬─────────────────────┘
       │                  │                  │
┌──────▼──────┐  ┌────────▼──────┐  ┌───────▼────────┐
│  Feature    │  │   Job Queue   │  │  ML Service    │
│  Modules    │  │   BullMQ      │  │  Python/Prophet│
│  (12 total) │  │   Valkey      │  │  FastAPI       │
└──────┬──────┘  └───────────────┘  └───────┬────────┘
       │                                     │
┌──────▼─────────────────────────────────────▼────────────────────┐
│                        DATA LAYER                                │
│  PostgreSQL 17 + TimescaleDB · Prisma ORM 7 · Meilisearch        │
└────────────────────────────────────────────────────────────────┘
```

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, Tailwind CSS 4, Framer Motion |
| **Backend API** | NestJS 11, TypeScript, Prisma ORM 7 |
| **ML Service** | Python, FastAPI, Facebook Prophet |
| **Database** | PostgreSQL 17 + TimescaleDB |
| **Cache / Queue Store** | Valkey (Redis-compatible) |
| **Search** | Meilisearch |
| **Job Queues** | BullMQ |
| **Auth** | JWT (RS256), HttpOnly refresh cookies, TOTP MFA (otplib) |
| **API Docs** | Swagger / OpenAPI 3.1 |
| **Monorepo Tooling** | Turborepo |
| **Containerization** | Docker, Docker Compose |
| **Orchestration** | Kubernetes (Helm, ArgoCD, Istio) |
| **Infra as Code** | Terraform, Terragrunt |
| **Observability** | OpenTelemetry, Prometheus |
| **Testing** | Playwright (E2E), Vitest |
| **CI/CD** | GitHub Actions |

---

## 📦 Core Modules

| # | Module | What it does |
|---|---|---|
| F-01 | **Auth** | JWT auth, RBAC, MFA, multi-tenant context via `AsyncLocalStorage` |
| F-02/03 | **Finance** | General ledger, double-entry journal, AP/AR, aging reports, live FX rates |
| F-04/05 | **HR & Payroll** | Employee directory, leave/attendance, Indian payroll (TDS/PF/ESI) |
| F-06 | **Supply Chain** | Vendors, purchase orders, goods receipt, 3-way match, inventory |
| F-07 | **Projects** | Milestones, tasks, resource assignment, budgets, timesheets |
| F-08 | **Business Intelligence** | Dashboards, widgets, scheduled reports |
| F-09 | **Audit Trail** | SHA-256 hash-chained, tamper-evident logging |
| F-10 | **Notifications** | Real-time, preference-based notification delivery |
| F-11 | **Webhooks** | Outbound event delivery via BullMQ, with delivery tracking |
| — | **AI Forecasting** | Demand forecasting via the Python/Prophet ML service |

**RBAC roles:** `SuperAdmin → Admin → Manager → Employee` (decreasing scope)

---

## 📂 Project Structure

```
amdox-internship-main/
├── backend/                  # NestJS 11 API
│   ├── src/
│   │   ├── auth/             # JWT, MFA, guards
│   │   ├── finance/          # GL, AP/AR, FX
│   │   ├── hr/               # Employees, payroll
│   │   ├── supply/           # Vendors, POs, inventory
│   │   ├── projects/         # Project management
│   │   ├── bi/                # Dashboards & reports
│   │   ├── audit/            # Hash-chained audit log
│   │   ├── notifications/
│   │   ├── webhooks/
│   │   └── common/           # Filters, interceptors
│   ├── ml-service/           # Python FastAPI + Prophet forecasting
│   └── prisma/                # schema.prisma (35+ models), seed.ts
├── frontend/                 # Next.js 15 App Router
│   └── src/app/(app)/        # dashboard, finance, hr, payroll, supply-chain,
│                              # projects, bi, audit, settings
├── k8s/                      # Helm, ArgoCD, Istio
├── terraform/                 # Infra as code
├── infra/                    # OpenTelemetry, Prometheus configs
├── tests/                    # Playwright E2E + load tests
├── docker-compose.yml
├── .env.example
└── PROJECT_OVERVIEW.md       # Full internship deep-dive documentation
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v22+
- Docker Desktop
- Python 3.10+ (for the ML service)
- Git

### 1. Clone & enter the project

```bash
git clone https://github.com/202311029/AI-Powered-Cloud-ERP-Suite.git
cd AI-Powered-Cloud-ERP-Suite/amdox-internship-main
```

### 2. Start infrastructure (PostgreSQL, Valkey, Meilisearch)

```bash
docker compose up -d
```

### 3. Set up the backend

```bash
cd backend
cp ../.env.example .env      # then fill in DATABASE_URL, JWT_SECRET, etc.

npm install --legacy-peer-deps
npx prisma generate
npx prisma migrate deploy
npx prisma db seed           # loads demo tenant + data

npm run start:dev
# API:      http://localhost:5000
# Swagger:  http://localhost:5000/api-docs
```

### 4. Set up the frontend

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
# App: http://localhost:3000
```

### 5. (Optional) Start the ML service

```bash
cd backend/ml-service
pip install fastapi uvicorn prophet pandas
uvicorn main:app --reload --port 8000
```

### 6. Log in with demo data

Seeding creates a demo tenant (**NexaOps Manufacturing Pvt Ltd**) with 30 employees, 50 vendors, 100 SKUs, and a year of financial data.

| Field | Value |
|---|---|
| URL | `http://localhost:3000` |
| Email | `admin@nexaops.com` |
| Password | `Demo@2026!` |

> ⚠️ This is a local seed-only demo account — change or remove it before any real deployment.

---

## 🧪 Testing

```bash
# E2E tests
npx playwright test

# Frontend unit tests
cd frontend && npm run test
```

---

## 📡 API Endpoints (selected)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/login` | Login → access + refresh token |
| POST | `/api/v1/auth/refresh` | Rotate refresh token |
| GET | `/api/v1/finance/trial-balance` | Trial balance |
| GET | `/api/v1/finance/invoices/aging-report` | AR aging buckets |
| POST | `/api/v1/payroll/run` | Initiate a payroll run |
| GET | `/api/v1/supply/inventory/low-stock` | Low-stock alerts |
| GET | `/api/v1/bi/summary` | Dashboard KPIs |
| GET | `/api/v1/audit/verify` | Verify audit hash-chain integrity |
| GET | `/api/v1/health` | Health check |

Full interactive API docs: **`http://localhost:5000/api-docs`**

---

## 📈 Performance Targets

| Metric | Target |
|---|---|
| API p95 latency | < 50ms |
| Auth token refresh | < 10ms |
| Payroll run (1,000 employees) | < 30s |
| Search latency | < 20ms |

---

## 🔮 Roadmap

- [ ] Extract `ml-service` into its own deployable service
- [ ] Keycloak SSO for enterprise identity federation
- [ ] Prometheus + Grafana monitoring dashboards
- [ ] CRM module (Leads, Contacts, Opportunities)
- [ ] Drag-and-drop BI dashboard builder
- [ ] Document management with OCR
- [ ] React Native mobile app

---

## 📄 License

This project is proprietary and intended for internal/academic use. All rights reserved.

---

<div align="center">

Built as part of a 3-month AI-powered ERP development internship.
For full engineering documentation, see **[PROJECT_OVERVIEW.md](./amdox-internship-main/PROJECT_OVERVIEW.md)**.

</div>
