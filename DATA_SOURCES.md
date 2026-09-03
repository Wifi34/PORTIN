# PortIN — Data Sources & Government Provenance Layer

**Smart India Hackathon 2026 (Problem Statement 26006)**  
*Ministry of Steel / SAIL*

---

## Truthfulness & Provenance Standard
In strict accordance with the problem statement guidelines, PortIN never fabricates live data feeds, scrapes unauthorized commercial platforms, or pretends simulated benchmarks are live. Every data point exposed in the user interface carries an interactive **Data Provenance Badge** indicating its classification.

---

## 1. Port & Berth Physical Constraints
- **Classification**: `OFFICIAL STATIC DATA`
- **Verification Date**: August 2026
- **Source Documents**:
  - **Paradip Port Trust (PPT)**: Marine Department Berthing Guidelines & Scale of Rates (SOR), gazetted parameters for CQ-1, CQ-2, South Quay, and Mechanized Coal Berth (MCB).
  - **Visakhapatnam Port Authority (VPA)**: Operational Manual for General Cargo Berth (GCB), EQ-1, and WQ-1.
  - **Adani Gangavaram Port Ltd (AGPL)**: Deep-water Capesize berth handbook (21.0m permissible draft).
  - **Dhamra Port Company Ltd (APSEZ)**: Mechanized Coal Terminal Navigation Rules (18.0m permissible draft).
  - **Gopalpur Ports Ltd**: Berth Specification Schedule.
  - **Syama Prasad Mookerjee Port (Kolkata & Haldia Dock Complex)**: Lock entrance navigation restrictions (8.5m riverine draft limit).
  - **Sagar / Sandheads Anchorage**: Official transshipment lightering anchorage coordinates.

---

## 2. Marine Weather State
- **Classification**: `LIVE DATA` (with seasonal climatological fallback if offline)
- **Provider**: Open-Meteo Marine Weather API (`https://marine-api.open-meteo.com/v1/marine`)
- **Parameters**: Significant wave height (m), wave direction (&deg;), wave period (s), sea surface state.
- **Caching**: 1-hour in-memory cache to respect API rate limits.
- **Notice**: Logistics planning visualization only — not for vessel navigation.

---

## 3. Freight Rate Market Data
- **Classification**: `SIMULATED SIH DEMO DATA`
- **Generation Method**: Fixed random seed (`42`) deterministic stochastic generation with seasonal monsoon adjustments, bunker price drift, and East Coast port queue delays.
- **Commercial Adapter**: `CommercialProviderAdapter` stub configured in `backend/app/providers/freight.py` with placeholder for licensed Baltic Exchange API credentials (`BALTIC_API_KEY`).
- **Data Import**: Supports importing actual historical charter fixtures via the Admin Panel.

---

## 4. Commodity Price Benchmarks
- **Classification**: `PUBLIC HISTORICAL`
- **Provider**: World Bank Pink Sheet (Monthly Commodity Price Indicators).
- **Target Commodities**: Metallurgical Coking Coal (Australia FOB benchmark), Thermal Coal (Newcastle 6,000 kcal), Iron Ore (62% Fe Fines CFR China/India).
