export interface User {
  id: number;
  email: string;
  full_name: string;
  organization: string;
  role: 'admin' | 'logistics_manager' | 'chartering_analyst' | 'procurement_manager';
  is_active: boolean;
}

export interface Berth {
  id: number;
  name: string;
  berth_type: string;
  max_draft: number;
  max_loa: number;
  max_beam: number;
  handling_rate_tpd: number;
  supported_cargo: string;
  source: string;
  last_verified_at: string;
}

export interface MarineConditions {
  wave_height_m: number;
  wave_direction_deg: number;
  wave_period_s: number;
  sea_condition: string;
  status: string;
  is_live: boolean;
  source: string;
  retrieved_at: string;
  disclaimer: string;
}

export interface Port {
  id: number;
  code: string;
  name: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  max_draft: number;
  max_loa: number;
  annual_capacity_mt: number;
  congestion_score: number;
  active_vessels: number;
  anchorage_queue: number;
  avg_waiting_days: number;
  source: string;
  source_type: string;
  last_verified_at: string;
  berths?: Berth[];
  marine_conditions?: MarineConditions;
}

export interface VesselClass {
  id: number;
  class_name: string;
  min_dwt: number;
  max_dwt: number;
  typical_dwt: number;
  typical_loa: number;
  typical_beam: number;
  typical_draft: number;
  daily_hire_usd: number;
  fuel_consumption_tpd: number;
  description: string;
}

export interface Route {
  id: number;
  origin_country: string;
  origin_port: string;
  destination_port_id: number;
  destination_port_name: string;
  distance_nm: number;
  typical_days: number;
  weather_risk_level: string;
  origin_lat: number;
  origin_lng: number;
  dest_lat: number;
  dest_lng: number;
}

export interface ForecastPoint {
  date: string;
  day_offset: number;
  predicted_rate: number;
  lower_bound: number;
  upper_bound: number;
  confidence_level: number;
}

export interface ForecastResponse {
  current_reference_rate: number;
  day_7_prediction: number;
  day_30_prediction: number;
  day_90_prediction: number;
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
  trend_pct: number;
  market_signal: 'BOOK NOW' | 'WAIT' | 'MONITOR';
  optimal_booking_window: string;
  explanation: string;
  forecast_curve: ForecastPoint[];
  historical_curve: { date: string; day_offset: number; rate: number }[];
  model_metadata: {
    name: string;
    version: string;
    trained_at: string;
    row_count: number;
    mae: number;
    rmse: number;
    mape: number;
    is_active: boolean;
  };
  feature_importance: { feature: string; importance: number }[];
}

export interface CompatibilityResult {
  berth_id: number;
  berth_name: string;
  status: 'COMPATIBLE' | 'CONDITIONALLY COMPATIBLE' | 'NOT COMPATIBLE';
  draft_margin_m: number;
  loa_margin_m: number;
  beam_margin_m: number;
  is_draft_ok: boolean;
  is_loa_ok: boolean;
  is_beam_ok: boolean;
  is_cargo_ok: boolean;
  reasons: string[];
}

export interface VesselEvaluation {
  vessel_class: string;
  parcel_suitability_score: number;
  cargo_utilization_pct: number;
  estimated_voyage_cost_usd: number;
  freight_rate_per_mt: number;
  port_compatibility_status: 'COMPATIBLE' | 'CONDITIONALLY COMPATIBLE' | 'NOT COMPATIBLE';
  compatible_berths_count: number;
  total_berths_count: number;
  berth_details: CompatibilityResult[];
  turnaround_days: number;
  daily_idle_risk_usd: number;
  recommendation_score: number;
  is_recommended: boolean;
  key_drivers: string[];
}

export interface ContractOption {
  contract_type: string;
  num_voyages: number;
  total_cargo_mt: number;
  avg_freight_per_mt: number;
  total_freight_cost_usd: number;
  rate_volatility_exposure: 'HIGH' | 'MODERATE' | 'LOW' | 'MINIMAL';
  idle_time_days: number;
  total_logistics_cost_usd: number;
  planning_certainty_pct: number;
  savings_vs_spot_usd: number;
  pros: string[];
  cons: string[];
  is_recommended: boolean;
}

export interface DecisionTwinPlan {
  plan_code: string;
  plan_label: string;
  vessel_class: string;
  origin_port: string;
  destination_port: string;
  booking_window: string;
  contract_strategy: string;
  voyages_count: number;
  expected_freight_rate: number;
  freight_range: string;
  port_compatibility: string;
  compatible_berth: string;
  expected_idle_days: number;
  risk_level: string;
  risk_score: number;
  estimated_logistics_cost_usd: number;
  rationale: string;
  tradeoffs: string[];
}

export interface DecisionTwinResponse {
  run_id: string;
  cargo_type: string;
  cargo_mt: number;
  origin: string;
  destination: string;
  simulated_scenarios_count: number;
  plan_a: DecisionTwinPlan;
  plan_b: DecisionTwinPlan;
  plan_c: DecisionTwinPlan;
  market_signal: string;
  key_insight: string;
  data_provenance: Record<string, any>;
}

export interface DecisionHistoryRecord {
  id: number;
  user_id: number;
  title: string;
  cargo_type: string;
  cargo_mt: number;
  origin_country: string;
  origin_port: string;
  destination_port: string;
  shipment_date: string;
  contract_type: string;
  num_voyages: number;
  planning_horizon_days: number;
  market_signal: string;
  recommended_vessel: string;
  optimal_window: string;
  risk_score: number;
  estimated_total_cost_usd: number;
  results_json: Record<string, any>;
  created_at: string;
}

export interface AlertItem {
  id: number;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'danger' | 'success';
  alert_type: string;
  is_read: boolean;
  created_at: string;
}

export interface ReportItem {
  id: number;
  title: string;
  report_type: string;
  summary: string;
  created_at: string;
  file_url: string;
}

export interface AdvisorQueryResponse {
  answer: string;
  category: string;
  confidence: number;
  suggested_followups: string[];
  source_attribution: string;
}

