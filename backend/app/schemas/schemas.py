from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    organization: str = "SAIL"
    role: str = "chartering_analyst"

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    organization: str = "SAIL"
    role: str = Field(..., pattern="^(logistics_manager|chartering_analyst|procurement_manager)$") # Non-admin registration only!
    accept_terms: bool

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    email: EmailStr
    token: str
    new_password: str = Field(..., min_length=6)

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class TokenRefresh(BaseModel):
    refresh_token: str

class GoogleAuthRequest(BaseModel):
    credential: Optional[str] = None
    access_token: Optional[str] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Berth & Port Schemas ---
class BerthBase(BaseModel):
    name: str
    berth_type: str
    max_draft: float
    max_loa: float
    max_beam: float
    handling_rate_tpd: float
    supported_cargo: str
    source: str = "Port Trust Master Plan / Berth Specification Chart"
    last_verified_at: str = "2026-08-15"

class BerthCreate(BerthBase):
    port_id: int

class BerthResponse(BerthBase):
    id: int
    port_id: int

    class Config:
        from_attributes = True

class PortBase(BaseModel):
    code: str
    name: str
    state: str
    country: str = "India"
    latitude: float
    longitude: float
    max_draft: float
    max_loa: float
    annual_capacity_mt: float
    congestion_score: float
    active_vessels: int
    anchorage_queue: int
    avg_waiting_days: float
    source: str = "Port Authority Official Gazetted Data"
    source_type: str = "OFFICIAL STATIC"
    last_verified_at: str = "2026-08-15"
    is_demo: bool = False

class PortCreate(PortBase):
    pass

class PortResponse(PortBase):
    id: int
    berths: List[BerthResponse] = []

    class Config:
        from_attributes = True

# --- Vessel Schemas ---
class VesselClassBase(BaseModel):
    class_name: str
    min_dwt: float
    max_dwt: float
    typical_dwt: float
    typical_loa: float
    typical_beam: float
    typical_draft: float
    daily_hire_usd: float
    fuel_consumption_tpd: float
    description: Optional[str] = None

class VesselClassResponse(VesselClassBase):
    id: int

    class Config:
        from_attributes = True

# --- Route Schemas ---
class RouteBase(BaseModel):
    origin_country: str
    origin_port: str
    destination_port_id: int
    distance_nm: float
    typical_days: float
    weather_risk_level: str
    origin_lat: float
    origin_lng: float

class RouteResponse(RouteBase):
    id: int
    destination_port: Optional[PortBase] = None

    class Config:
        from_attributes = True

# --- Analysis & Forecast Request ---
class ForecastRequest(BaseModel):
    cargo_type: str = "Coking Coal"
    cargo_mt: float = 70000.0
    origin_country: str = "Australia"
    origin_port: str = "Gladstone"
    destination_port: str = "Paradip"
    desired_shipment_date: str = "2026-09-20"
    vessel_class: str = "AUTO"  # AUTO or Handysize / Supramax / Panamax / Capesize
    contract_duration_months: int = 3
    num_voyages: int = 3
    planning_horizon_days: int = 90

class ForecastPoint(BaseModel):
    date: str
    day_offset: int
    predicted_rate: float
    lower_bound: float
    upper_bound: float
    confidence_level: float = 0.90

class ForecastResponse(BaseModel):
    current_reference_rate: float
    day_7_prediction: float
    day_30_prediction: float
    day_90_prediction: float
    trend: str  # INCREASING, STABLE, DECREASING
    trend_pct: float
    market_signal: str  # BOOK NOW, WAIT, MONITOR
    optimal_booking_window: str
    explanation: str
    forecast_curve: List[ForecastPoint]
    historical_curve: List[Dict[str, Any]]
    model_metadata: Dict[str, Any]
    feature_importance: List[Dict[str, Any]]

# --- Vessel & Port Compatibility ---
class CompatibilityResult(BaseModel):
    berth_id: int
    berth_name: str
    status: str  # COMPATIBLE, CONDITIONALLY COMPATIBLE, NOT COMPATIBLE
    draft_margin_m: float
    loa_margin_m: float
    beam_margin_m: float
    is_draft_ok: bool
    is_loa_ok: bool
    is_beam_ok: bool
    is_cargo_ok: bool
    reasons: List[str]

class VesselEvaluation(BaseModel):
    vessel_class: str
    parcel_suitability_score: float
    cargo_utilization_pct: float
    estimated_voyage_cost_usd: float
    freight_rate_per_mt: float
    port_compatibility_status: str  # COMPATIBLE, CONDITIONALLY COMPATIBLE, NOT COMPATIBLE
    compatible_berths_count: int
    total_berths_count: int
    berth_details: List[CompatibilityResult]
    turnaround_days: float
    daily_idle_risk_usd: float
    recommendation_score: float
    is_recommended: bool
    key_drivers: List[str]

# --- Contract Optimization ---
class ContractOption(BaseModel):
    contract_type: str  # Single Spot Charter, Short-Term Multi-Voyage (3 Voyages), Medium-Term Multi-Voyage (6 Voyages)
    num_voyages: int
    total_cargo_mt: float
    avg_freight_per_mt: float
    total_freight_cost_usd: float
    rate_volatility_exposure: str # HIGH, MODERATE, LOW
    idle_time_days: float
    total_logistics_cost_usd: float
    planning_certainty_pct: float
    savings_vs_spot_usd: float
    pros: List[str]
    cons: List[str]
    is_recommended: bool

# --- Decision Twin Schemas ---
class DecisionTwinPlan(BaseModel):
    plan_code: str # PLAN A, PLAN B, PLAN C
    plan_label: str # BEST OVERALL, LOWEST RISK, LOWEST COST
    vessel_class: str
    origin_port: str
    destination_port: str
    booking_window: str
    contract_strategy: str
    voyages_count: int
    expected_freight_rate: float
    freight_range: str
    port_compatibility: str
    compatible_berth: str
    expected_idle_days: float
    risk_level: str
    risk_score: float
    estimated_logistics_cost_usd: float
    rationale: str
    tradeoffs: List[str]

class DecisionTwinResponse(BaseModel):
    run_id: str
    cargo_type: str
    cargo_mt: float
    origin: str
    destination: str
    simulated_scenarios_count: int
    plan_a: DecisionTwinPlan
    plan_b: DecisionTwinPlan
    plan_c: DecisionTwinPlan
    market_signal: str
    key_insight: str
    data_provenance: Dict[str, Any]

# --- Decision Save & History ---
class DecisionSaveRequest(BaseModel):
    title: str
    cargo_type: str
    cargo_mt: float
    origin_country: str
    origin_port: str
    destination_port: str
    shipment_date: str
    contract_type: str
    num_voyages: int
    planning_horizon_days: int
    market_signal: str
    recommended_vessel: str
    optimal_window: str
    risk_score: float
    estimated_total_cost_usd: float
    results_json: Dict[str, Any]

class DecisionHistoryResponse(BaseModel):
    id: int
    user_id: int
    title: str
    cargo_type: str
    cargo_mt: float
    origin_country: str
    origin_port: str
    destination_port: str
    shipment_date: str
    contract_type: str
    num_voyages: int
    planning_horizon_days: int
    market_signal: str
    recommended_vessel: str
    optimal_window: str
    risk_score: float
    estimated_total_cost_usd: float
    results_json: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

# --- Scenario Lab Request ---
class ScenarioRunRequest(BaseModel):
    base_cargo_mt: float = 70000.0
    freight_delta_pct: float = 0.0  # -30% to +30%
    bunker_delta_pct: float = 0.0   # -30% to +30%
    congestion_delta_days: float = 0.0 # -5 to +10 days
    weather_risk_factor: float = 1.0 # 0.5 to 2.0
    draft_restriction_m: float = 0.0 # 0 to -3m
    selected_vessel: str = "Panamax"
    contract_type: str = "Short-Term Multi-Voyage (3 Voyages)"

# --- Advisor Schemas ---
class AdvisorQueryRequest(BaseModel):
    question: str
    context: Optional[Dict[str, Any]] = None

class AdvisorQueryResponse(BaseModel):
    answer: str
    category: str
    confidence: float
    suggested_followups: List[str]
    source_attribution: str

# --- Report Schemas ---
class ReportGenerateRequest(BaseModel):
    title: str
    report_type: str = "Chartering Decision Report"
    decision_id: Optional[int] = None
    summary: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

class ReportResponse(BaseModel):
    id: int
    title: str
    report_type: str
    summary: Optional[str]
    created_at: datetime
    file_url: Optional[str]

    class Config:
        from_attributes = True

# --- Alert Schemas ---
class AlertResponse(BaseModel):
    id: int
    title: str
    message: str
    severity: str
    alert_type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
