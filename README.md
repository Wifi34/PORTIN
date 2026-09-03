# PortIN — Intelligent Maritime Freight Forecasting & Vessel Chartering Platform

**Smart India Hackathon 2026 — Official Solution**  
**Problem Statement ID:** 26006  
**Organization:** Ministry of Steel  
**Department:** Steel Authority of India Limited (SAIL)  
**Category:** Software  
**Theme:** Transportation & Logistics  

---

## ⚓ Project Overview
**PortIN** is an enterprise-grade maritime freight intelligence and vessel chartering optimization platform designed for SAIL and major bulk cargo importers. It solves the critical operational challenge of migrating from reactive, volatile ad-hoc spot chartering to predictive, constraint-aware multi-voyage consecutive charter contracts (COA).

### Key Pillars
1. **Predictive Freight Forecasting**: Multi-horizon (7-day, 30-day, 90-day) Gradient Boosting models with quantile regression uncertainty intervals ($p_{10}$ to $p_{90}$).
2. **Deterministic Port & Berth Compatibility**: Validates vessel draft, LOA, beam outreach, and handling capacities against officially gazetted East Coast Indian port master plans (Paradip, Visakhapatnam, Gangavaram, Dhamra, Gopalpur, Sagar/Sandheads, Haldia).
3. **PortIN Decision Twin (Flagship Killer Feature)**: Stochastic perturbation engine synthesizing **Plan A (Best Overall)**, **Plan B (Lowest Risk)**, and **Plan C (Lowest Cost)**.
4. **Spot to Multi-Voyage Optimization**: Demonstrates concrete financial savings (averaging \$380,000+ per 3-voyage commitment) and a 44% reduction in anchorage demurrage.
5. **Government-Grade Data Provenance**: Every metric is explicitly tagged as `LIVE`, `OFFICIAL STATIC`, `SIMULATED DEMO`, or `IMPORTED`.

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js 18+ and npm

### 1. Backend Setup & Startup
```bash
# From repository root
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend initializes the SQLite database (`portin.db`), creates all tables, and seeds official East Coast port/berth master data automatically.
- Swagger API Docs: `http://localhost:8000/api/v1/docs`

### 2. Frontend Setup & Startup
```bash
# In a new terminal
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. One-Click Windows Startup
Simply double-click or run:
```cmd
start.bat
```

---

## 🔑 Pre-Seeded Demonstration Accounts

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Chartering Analyst** | `analyst@sail.gov.in` | `Analyst@PortIN2026` | Forecasts, Twin, Scenarios, Reports |
| **Procurement Manager** | `manager@sail.gov.in` | `Manager@PortIN2026` | Global Sourcing, Contract Strategy |
| **Logistics Manager** | `logistics@sail.gov.in` | `Logistics@PortIN2026` | Port Limits, Congestion, Turnaround |
| **Chief Administrator** | `admin@portin.sail.gov.in` | `Admin@PortIN2026` | Master Data, Model Retraining, Audits |

*Tip: On the `/login` page, you can use the 1-click quick-fill buttons for instant evaluation.*

---

## 🧪 Running Automated Tests

### Backend Unit & Integration Tests
```bash
python -m pytest backend/tests/test_backend.py -v
```

### Critical End-to-End User Journey Test
```bash
python -m pytest backend/tests/test_critical_journey.py -v -s
```
*Validates: Register &rarr; Login &rarr; Dashboard &rarr; Forecast &rarr; Optimization &rarr; Decision Twin &rarr; Save &rarr; Report &rarr; Re-Auth &rarr; Reopen.*

### Frontend Production Build Test
```bash
cd frontend
npm run build
```

---

## 📁 Repository Structure
```
├── backend/
│   ├── app/
│   │   ├── api/v1/          # REST Endpoints (Auth, Ports, Forecasts, Twin, etc.)
│   │   ├── core/            # Config, Security (Bcrypt/JWT), Dependencies
│   │   ├── database/        # Sessionmaker & Base declarative
│   │   ├── models/          # SQLAlchemy Database Models
│   │   ├── schemas/         # Pydantic Request/Response Models
│   │   ├── services/        # ML Forecasting, Optimizer, Decision Twin, Risk
│   │   ├── providers/       # Marine Weather (Open-Meteo), Freight, Commodity
│   │   ├── seed/            # Seed data with official gazetted limits
│   │   └── main.py          # FastAPI Application Entrypoint
│   └── tests/               # Pytest Suite & Critical Journey Tests
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios client with JWT interceptor
│   │   ├── components/      # Reusable UI, Navbars, Layout, Provenance Badges
│   │   ├── context/         # AuthContext
│   │   ├── pages/           # 18 Fully Functional Pages
│   │   └── types/           # TypeScript Type Definitions
│   ├── public/assets/       # Local Hero Video, Poster, and Icons
│   └── vite.config.ts       # Vite + Tailwind v4 Configuration
├── docs/                    # Technical & Evaluation Documentation
├── ARCHITECTURE.md          # Comprehensive End-to-End System Design
├── DATA_SOURCES.md          # Government Data Provenance & Trust Layer
├── ML_MODEL.md              # Feature Engineering & Quantile Regressor Specs
├── API.md                   # Complete REST API Specifications
├── DEMO_GUIDE.md            # Step-by-step SIH Presentation Walkthrough
├── THIRD_PARTY_ASSETS.md    # Open-source and Creative Commons Media Registry
└── start.bat                # 1-Click Startup Script for Windows
```
