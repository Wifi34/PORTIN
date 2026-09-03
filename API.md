# PortIN — REST API Specification

**Base URL**: `http://localhost:8000/api/v1`  
**Interactive Swagger Documentation**: `http://localhost:8000/api/v1/docs`  
**Authentication**: Bearer JWT (`Authorization: Bearer <access_token>`)

---

## Endpoints Summary

### Authentication (`/auth`)
- `POST /auth/register`: Register new user (roles: `chartering_analyst`, `logistics_manager`, `procurement_manager`).
- `POST /auth/login`: Authenticate with email/password; returns access token, refresh token, user profile.
- `POST /auth/refresh`: Refresh expired access token.
- `POST /auth/forgot-password`: Issues development one-time reset token for SIH offline testing.
- `POST /auth/reset-password`: Resets user password using one-time token.
- `GET /auth/me`: Retrieve authenticated user profile.
- `PUT /auth/me`: Update full name and department.

### Ports & Berths (`/ports`)
- `GET /ports`: List all East Coast Indian ports with gazetted drafts and queue status.
- `GET /ports/{id}`: Detailed port specification with berth list and live/cached Open-Meteo marine conditions.
- `GET /ports/{id}/berths`: List individual berths with permissible draft, LOA, beam, and unloader rates.

### Vessels & Routes (`/vessels`, `/routes`)
- `GET /vessels`: Master vessel classes (Handysize, Supramax, Panamax, Capesize).
- `GET /routes`: Master maritime trade lanes with coordinates and nautical mile distances.

### Freight Forecasting (`/forecasts`)
- `POST /forecasts/run`: Runs multi-horizon ML inference with quantile uncertainty bands and feature importance weights.

### Vessel & Contract Optimization (`/optimizer`)
- `POST /optimizer/vessel`: Evaluates parcel suitability, cargo load factor, and physical berth clearances.
- `POST /optimizer/contract`: Compares Single Spot vs Short-Term Multi-Voyage (3x) vs Medium-Term COA (6x).

### PortIN Decision Twin (`/decision-twin`)
- `POST /decision-twin/run`: Executes 36 stochastic perturbations and synthesizes Plan A (Best Overall), Plan B (Lowest Risk), and Plan C (Lowest Cost).

### Scenario Lab (`/scenarios`)
- `POST /scenarios/run`: Interactive sensitivity calculation under freight, bunker, weather, delay, or draft shifts.
- `GET /scenarios`: List saved user simulation scenarios.
- `POST /scenarios/save`: Save custom scenario parameters and results.

### Risk Engine & Advisor (`/risk`, `/advisor`)
- `POST /risk/analyze`: Multi-factor 0-100 risk scoring with driver breakdown.
- `POST /advisor/ask`: PortIN Decision Advisor domain questions and explanations.

### Decisions & Reports (`/decisions`, `/reports`)
- `GET /decisions`: List previous saved analyses.
- `POST /decisions`: Save new completed chartering analysis.
- `GET /decisions/{id}`: Retrieve full saved analysis snapshot.
- `DELETE /decisions/{id}`: Delete saved decision record.
- `POST /reports/generate`: Generates executive vector PDF report using ReportLab.
- `GET /reports`: List generated reports.
- `GET /reports/{id}/download`: Download generated PDF report.

### Admin Operations (`/admin`)
- `GET /admin/overview`: System status, active model diagnostics, database counts.
- `GET /admin/audit`: Security and operational audit log.
- `POST /admin/models/retrain`: Retrain ML forecasting pipeline and update validation metrics.
- `POST /admin/ports`: Add custom port master record.
- `DELETE /admin/ports/{id}`: Remove custom port record.
