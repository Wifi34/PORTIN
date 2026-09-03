from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.app.database.session import get_db
from backend.app.models.models import ScenarioRecord, User
from backend.app.core.deps import get_current_user
from backend.app.schemas.schemas import ScenarioRunRequest
from backend.app.services.risk import RiskEngine

router = APIRouter()

@router.post("/run")
def run_scenario(req: ScenarioRunRequest):
    # Base baseline parameters for 70k MT Panamax
    base_rate = 14.80
    adjusted_freight = round(base_rate * (1.0 + req.freight_delta_pct / 100.0), 2)
    bunker_impact = round((req.bunker_delta_pct / 100.0) * 1.85, 2)
    net_unit_freight = round(adjusted_freight + bunker_impact, 2)

    # Idle time and demurrage calculations
    base_idle_days = 2.8
    total_idle_days = max(0.5, round(base_idle_days + req.congestion_delta_days, 1))
    daily_demurrage = 19500.0
    demurrage_cost = round(total_idle_days * daily_demurrage, 2)
    
    cargo_cost = round(net_unit_freight * req.base_cargo_mt, 2)
    total_logistics_cost = round(cargo_cost + demurrage_cost, 2)

    # Dynamic draft compatibility check under restriction
    vessel_drafts = {"Handysize": 10.2, "Supramax": 12.8, "Panamax": 14.2, "Capesize": 18.2}
    v_draft = vessel_drafts.get(req.selected_vessel, 14.2)
    berth_draft_effective = 14.5 + req.draft_restriction_m # e.g. -1.0m restriction
    draft_margin = round(berth_draft_effective - v_draft, 2)
    is_compatible = draft_margin >= 0

    # Risk analysis
    risk_res = RiskEngine.calculate_risk(
        freight_volatility_pct=req.freight_delta_pct,
        congestion_score=40.0 + (req.congestion_delta_days * 5.0),
        draft_margin_m=draft_margin,
        weather_wave_height_m=1.8 * req.weather_risk_factor,
        contract_type=req.contract_type,
        is_port_fully_compatible=is_compatible
    )

    # Dynamic recommendation
    if not is_compatible:
        verdict = f"{req.selected_vessel} Infeasible due to {abs(draft_margin):.1f}m draft shortfall. Switch to Supramax or Handysize."
    elif total_idle_days > 5.0:
        verdict = "Severe anchorage congestion detected. Switch to multi-voyage contract with guaranteed berthing slot."
    elif req.freight_delta_pct > 15.0:
        verdict = "High freight inflation scenario. Accelerate laycan booking immediately."
    else:
        verdict = f"{req.selected_vessel} operational parameters optimal under current scenario assumptions."

    return {
        "adjusted_unit_freight": net_unit_freight,
        "total_freight_cost_usd": cargo_cost,
        "estimated_idle_days": total_idle_days,
        "demurrage_cost_usd": demurrage_cost,
        "total_logistics_cost_usd": total_logistics_cost,
        "draft_margin_m": draft_margin,
        "is_port_compatible": is_compatible,
        "risk_evaluation": risk_res,
        "scenario_verdict": verdict
    }

@router.get("")
def list_scenarios(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    scenarios = db.query(ScenarioRecord).filter(ScenarioRecord.user_id == current_user.id).order_by(ScenarioRecord.created_at.desc()).all()
    return scenarios

@router.post("/save")
def save_scenario(payload: Dict[str, Any], db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rec = ScenarioRecord(
        user_id=current_user.id,
        name=payload.get("name", "Simulation Scenario"),
        description=payload.get("description", "What-If parameters"),
        parameters=payload.get("parameters", {}),
        results=payload.get("results", {})
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return {"message": "Scenario successfully saved", "id": rec.id}
