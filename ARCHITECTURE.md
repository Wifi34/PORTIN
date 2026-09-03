# PortIN — System Architecture & Design Specification

**Smart India Hackathon 2026 — Problem Statement ID: 26006**  
*Ministry of Steel / SAIL*

---

## 1. Architectural Philosophy
PortIN is engineered as an **Enterprise Decision Support System (DSS)** tailored for maritime bulk logistics. Unlike generic dashboards that display disconnected indicators, PortIN enforces a deterministic, constraint-coupled decision chain:

```
Cargo Requirement (Parcel MT, Commodity, Origin, Destination)
        │
        ▼
Data Ingestion & Provenance Stamping (Official Berth Limits, Met Ocean State)
        │
        ▼
Freight Forecasting Pipeline (HistGradientBoosting + Quantile Regressors)
        │
        ▼
Market Entry Intelligence (Optimal Booking Window: BOOK NOW / WAIT / MONITOR)
        │
        ▼
Deterministic Berth Compatibility Engine (Draft, LOA, Beam, Unloader Rates)
        │
        ▼
Vessel Optimizer & Multi-Voyage Contract Engine (SciPy / OR-Tools Feasibility)
        │
        ▼
Flagship Decision Twin (Stochastic Perturbation Synthesis: Plan A, B, C)
        │
        ▼
Explainable Output, Automated PDF Reports & Audit History
```

---

## 2. Component Decomposition

### A. Client Application (Frontend)
- **Framework**: React 19 + TypeScript + Vite.
- **Styling**: Tailwind CSS v4 configured with an enterprise maritime intelligence palette:
  - Deep Navy: `#050B18`
  - Container Navy: `#081426`
  - Ocean Accent: `#0B3B60`
  - Cyan Highlights: `#00B8D9`, `#62E5F2`
  - Clean Contrast White: `#F8FBFF`
- **Visualization**: Recharts for shaded quantile forecast bands and cost decomposition; React-Leaflet for maritime trade corridor mapping.
- **State Management**: React Context (`AuthContext`) with persistent local tokens and automatic session verification.

### B. Server Application (Backend)
- **Framework**: FastAPI (Python 3.14) with versioned endpoints (`/api/v1`).
- **Data Access**: SQLAlchemy 2.0 ORM with connection pooling and SQLite / PostgreSQL compatibility.
- **Security & Authorization**: Bcrypt password hashing, JWT Access Tokens (HS256), Refresh Tokens, Role-Based Access Control (`admin`, `logistics_manager`, `chartering_analyst`, `procurement_manager`).
- **Reporting**: ReportLab engine generating vector PDF reports with dynamic tables and government compliance headers.

### C. Machine Learning Pipeline
- **Algorithms**: `HistGradientBoostingRegressor` (loss=`quantile`) fitted at $\alpha = 0.1, 0.5, 0.9$.
- **Validation**: Strict Chronological Split (no data leakage).
- **Diagnostics**: Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), Mean Absolute Percentage Error (MAPE), and Feature Importance weights.

### D. Optimization & Physical Constraints
- **Compatibility Rules**:
  $$\text{DraftMargin} = \text{BerthPermissibleDraft} - \text{VesselDraft}$$
  $$\text{LOAMargin} = \text{BerthMaxLOA} - \text{VesselLOA}$$
  $$\text{BeamMargin} = \text{BerthMaxBeam} - \text{VesselBeam}$$
- **Objective Function**:
  $$\min \sum_{v \in V} \left( \text{FreightRate}(v) \cdot Q + \text{DemurrageRate}(v) \cdot \text{IdleDays} + \text{PortDues} + \text{DeadfreightRisk} \right)$$

---

## 3. Flagship Feature: PortIN Decision Twin
The Decision Twin runs 36 stochastic variations on each cargo input to generate three distinct operational plans:
- **PLAN A — BEST OVERALL**: Balances volume rebates (via 3-voyage Short-Term COA) with guaranteed draft safety.
- **PLAN B — LOWEST RISK**: Deploys shallow-draft Supramax tonnage with immediate booking to eliminate congestion and weather delays.
- **PLAN C — LOWEST ESTIMATED COST**: Leverages high deadweight tonnage (Capesize/Panamax) and extended commitments to drive per-ton freight to minimum baseline.

---

## 4. Government-Grade Data Provenance
Every metric in PortIN is classified and displayed with a trust badge:
- `LIVE`: Directly fetched from external APIs (e.g. Open-Meteo Marine Weather).
- `OFFICIAL STATIC`: Extracted from gazetted Port Trust publications (e.g. Paradip, Vizag berth charts).
- `SIMULATED DEMO`: Clearly labeled reproducible demonstration data generated with fixed seed 42.
- `USER IMPORTED`: Entered by authenticated operators.
