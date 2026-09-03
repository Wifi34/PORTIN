from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any
from backend.app.services.risk import RiskEngine

router = APIRouter()

class RiskAnalysisRequest(BaseModel):
    freight_volatility_pct: float = 4.2
    congestion_score: float = 42.0
    draft_margin_m: float = 0.30
    weather_wave_height_m: float = 1.8
    contract_type: str = "Short-Term Multi-Voyage (3 Voyages)"
    is_port_fully_compatible: bool = True

@router.post("/analyze")
def analyze_risk(req: RiskAnalysisRequest):
    return RiskEngine.calculate_risk(
        freight_volatility_pct=req.freight_volatility_pct,
        congestion_score=req.congestion_score,
        draft_margin_m=req.draft_margin_m,
        weather_wave_height_m=req.weather_wave_height_m,
        contract_type=req.contract_type,
        is_port_fully_compatible=req.is_port_fully_compatible
    )
