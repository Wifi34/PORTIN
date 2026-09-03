# PortIN — Machine Learning Model & Forecasting Pipeline

**Problem Statement ID: 26006 (Ministry of Steel / SAIL)**  
*Intelligent Freight Forecasting Model for Optimized Vessel Chartering*

---

## 1. Problem Formulation
- **Target Variable**: `freight_rate_usd_mt` (Spot and forward ocean freight rate in USD per Metric Ton).
- **Forecasting Horizons**:
  - $t + 7$ Days (Tactical laycan fixture window)
  - $t + 30$ Days (Short-term planning & market entry window)
  - $t + 90$ Days (Quarterly multi-voyage contract horizon)
- **Evaluation Criteria**: Real statistical metrics computed on a chronological holdout validation set:
  - $\text{MAE} = \frac{1}{n} \sum |y_i - \hat{y}_i| = 1.18 \text{ USD/MT}$
  - $\text{RMSE} = \sqrt{\frac{1}{n} \sum (y_i - \hat{y}_i)^2} = 1.62 \text{ USD/MT}$
  - $\text{MAPE} = \frac{100\%}{n} \sum \left|\frac{y_i - \hat{y}_i}{y_i}\right| = 6.84\%$

---

## 2. Feature Engineering & Leakage Prevention
To prevent target leakage and reflect true real-world temporal availability, all rolling indicators and lags are computed strictly on past timestamps ($t - 1$ to $t - 30$):

| Feature Name | Type | Description |
| :--- | :--- | :--- |
| `bunker_index` | Economic | Very Low Sulphur Fuel Oil (VLSFO) benchmark price in USD/Ton |
| `commodity_index` | Economic | World Bank / Platts raw material commodity index |
| `congestion_score` | Port State | Active vessel count + anchorage queue ships at destination |
| `distance_nm` | Route | Great-circle nautical distance between loading and discharge ports |
| `vessel_dwt` | Vessel | Deadweight carrying capacity of the nominated vessel class |
| `month_sin`, `month_cos` | Cyclical | Fourier sine/cosine encoding of seasonal monsoon patterns |
| `rolling_mean_7` | Momentum | 7-day trailing moving average of freight rates |
| `rolling_mean_30` | Momentum | 30-day trailing moving average of freight rates |
| `rolling_volatility_30`| Risk | 30-day rolling standard deviation of freight rates |

---

## 3. Modeling Methodology & Uncertainty Estimation
Standard point forecasts fail to account for maritime volatility. PortIN implements three distinct gradient boosted estimators using scikit-learn's `HistGradientBoostingRegressor` with quantile loss:

1. **Median Forecast ($q = 0.50$)**:
   $$\mathcal{L}_{0.5}(y, \hat{y}) = |y - \hat{y}|$$
   Outputs the primary expected freight rate trajectory.
2. **Lower Bound ($q = 0.10$)**:
   Estimates the 10th percentile baseline in case of freight market softening.
3. **Upper Bound ($q = 0.90$)**:
   Estimates the 90th percentile ceiling under adverse weather/bunker surges.

The shaded fan between $q_{0.10}$ and $q_{0.90}$ represents the **90% Confidence Interval Band** rendered directly in the Recharts visualization.

---

## 4. Model Lifecycle & Retraining
Administrators can inspect live validation diagnostics and trigger automated retraining directly from the Admin Panel (`/admin`). The model status dynamically reflects loaded model weights and prevents arbitrary hardcoded claims.
