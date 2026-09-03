# PortIN — SIH 2026 Demonstration Walkthrough Guide

**Problem Statement 26006 (Ministry of Steel / SAIL)**  
*Intelligent Freight Forecasting Model for Optimized Vessel Chartering & Bulk Cargo Procurement*

---

## 🧭 Jury Presentation Flow (5 to 7 Minutes)

### Step 1: The Cinematic Landing Page
- Open `http://localhost:5173/`.
- **Showcase**: Full-screen 100vh hero video featuring an ocean bulk carrier cutting through deep blue waters with white waves and wake. Notice the dark navy overlay and responsive poster fallback.
- **Explain**: The problem statement addresses SAIL's multi-million-dollar overseas raw material imports. Current practices rely on reactive daily spot market checks, leading to severe price spike exposures, berth draft mismatches, and heavy demurrage costs.
- Click **"SIH DEMO (1-CLICK)"** or **"RUN SMART ANALYSIS"**.

---

### Step 2: Instant Authentication & Role-Based Access
- Navigate to `/login`.
- Click the **"Analyst"** quick-fill button (`analyst@sail.gov.in` / `Analyst@PortIN2026`).
- Click **"Sign In to Console"**.
- Point out that normal operators cannot self-register as Administrator.

---

### Step 3: Operational Cockpit (Dashboard)
- View the 10 top-level KPI cards:
  - Current Freight Indicator (\$14.80/MT)
  - 30-Day Forecast (\$15.45/MT, +4.4% rising)
  - Market Signal (**BOOK NOW**)
  - Recommended Vessel (**Panamax**)
  - Recommended Contract (**3-Voyage COA**)
  - Port Compatibility (**100% OK at Paradip CQ-1**)
  - Operational Risk Score (**24.5/100, LOW**)
  - Expected Voyage Duration (14.5 Days)
  - Expected Idle Time (1.8 Days, -44% vs spot)
  - Est. Total Logistics Cost (\$1.82M)
- Inspect the interactive **Data Provenance Badges** on the cards: `OFFICIAL STATIC`, `SIMULATED DEMO`, and `LIVE MET`.

---

### Step 4: Machine Learning Freight Rate Forecasting
- Click **"Freight Forecast"** in the sidebar.
- Input benchmark scenario: **70,000 MT Coking Coal** from **Gladstone (Australia)** to **Paradip (India)**.
- Inspect the **90-Day Forecast Curve**:
  - The solid cyan line represents expected median rate.
  - The shaded cyan fan represents the **90% Quantile Confidence Interval** ($p_{10}$ to $p_{90}$).
  - Inspect the feature importance weights: Bunker Fuel (32%), Port Congestion (24%), Monsoon Seasonality (18%).

---

### Step 5: Flagship Killer Feature — The PortIN Decision Twin
- Click **"Decision Twin"** in the sidebar.
- Explain: The Decision Twin runs 36 stochastic perturbations varying speeds, weather delays, and bunker shifts.
- Review the three competing strategies:
  - **PLAN A — BEST OVERALL (Recommended)**: Panamax, 3-Voyage Short-Term COA, saving \$380,000 with 24.5/100 risk.
  - **PLAN B — LOWEST RISK**: Supramax, immediate spot booking, zero draft risk across all berths.
  - **PLAN C — LOWEST COST**: Capesize / Panamax, 6-month strategic COA, \$13.05/MT unit rate.
- Click **"Save Decision"** to commit the analysis to database records.

---

### Step 6: Berth-Level Port Compatibility Engine
- Click **"Port Intelligence"** in the sidebar.
- Select **Paradip** &rarr; inspect **Central Quay 1 (CQ-1)** at 14.5m draft, LOA 240m, outreach beam 32.5m, 30,000 TPD unloading capacity.
- Select **Haldia** &rarr; point out the lock entrance draft restriction (8.5m draft), which mathematically disqualifies Capesize and laden Panamax tonnage.
- Note the live Bay of Bengal wave height and swell metrics fetched from the Open-Meteo Marine API.

---

### Step 7: Spot to Multi-Voyage Contract Shift
- Click **"Contract Intelligence"** in the sidebar.
- Contrast Single Spot Charter vs Short-Term Multi-Voyage COA:
  - Spot has High volatility exposure and 3.2 days average anchorage waiting.
  - 3-Voyage COA locks in volume discounts, saves \$380,000, and reduces anchorage delay to 1.8 days via priority laycan windows.

---

### Step 8: What-If Scenario Lab & PortIN Decision Advisor
- Click **"Scenario Lab"**: Drag the Spot Freight Rate slider to +15% and Bunker Fuel slider to +10%. Watch the total logistics cost and demurrage recalculate instantly.
- Click **"Decision Advisor"**: Query *"Why is Panamax recommended for 70,000 MT coal to Paradip?"* and review the structured domain explanation.

---

### Step 9: Executive 10-Second Cockpit & PDF Reports
- Click **"Executive Cockpit"** in the top bar: Show the high-level 10-second directive designed for C-suite directors.
- Click **"Reports"** in the sidebar: Click **"Generate Official PDF"** &rarr; click **"Download PDF"** to view the generated executive document.
- Click **"Decision History"** to verify that every analysis is auditable, duplicate-ready, and persistent.

---

### Step 10: Admin Governance & Security Audit
- Log in as Administrator (`admin@portin.sail.gov.in` / `Admin@PortIN2026`).
- Navigate to **"Admin Panel"**: Inspect model validation metrics (MAE 1.18 USD/MT, MAPE 6.84%), trigger pipeline retraining, and view the system security audit trail.
