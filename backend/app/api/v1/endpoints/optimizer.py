from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from pydantic import BaseModel
from backend.app.database.session import get_db
from backend.app.models.models import Port
from backend.app.schemas.schemas import VesselEvaluation, ContractOption
from backend.app.services.optimizer import MaritimeOptimizationEngine
from backend.app.services.forecasting import forecasting_service

router = APIRouter()

class VesselOptRequest(BaseModel):
    cargo_mt: float = 70000.0
    origin_country: str = "Australia"
    destination_port: str = "Paradip"
    cargo_type: str = "Coking Coal"
    desired_date: str = "2026-09-20"

class ContractOptRequest(BaseModel):
    cargo_mt: float = 70000.0
    num_voyages: int = 3
    origin_country: str = "Australia"
    destination_port: str = "Paradip"
    vessel_class: str = "Panamax"
    desired_date: str = "2026-09-20"

@router.post("/vessel", response_model=List[VesselEvaluation])
def optimize_vessels(req: VesselOptRequest, db: Session = Depends(get_db)):
    port = db.query(Port).filter(Port.name.ilike(f"%{req.destination_port}%")).first()
    if not port:
        port = db.query(Port).first()

    berths_data = [
        {
            "id": b.id,
            "name": b.name,
            "max_draft": b.max_draft,
            "max_loa": b.max_loa,
            "max_beam": b.max_beam,
            "handling_rate_tpd": b.handling_rate_tpd,
            "supported_cargo": b.supported_cargo
        }
        for b in port.berths
    ]

    fc = forecasting_service.forecast(
        origin_country=req.origin_country,
        origin_port="Gladstone",
        destination_port=req.destination_port,
        vessel_class="AUTO",
        desired_date_str=req.desired_date
    )
    base_rate = fc["current_reference_rate"]

    evals = MaritimeOptimizationEngine.evaluate_vessels(
        cargo_mt=req.cargo_mt,
        origin_country=req.origin_country,
        destination_port=req.destination_port,
        berths=berths_data,
        base_freight_rate=base_rate,
        cargo_type=req.cargo_type
    )
    return evals

@router.post("/contract", response_model=List[ContractOption])
def optimize_contracts(req: ContractOptRequest):
    fc = forecasting_service.forecast(
        origin_country=req.origin_country,
        origin_port="Gladstone",
        destination_port=req.destination_port,
        vessel_class=req.vessel_class,
        desired_date_str=req.desired_date
    )
    base_rate = fc["current_reference_rate"]

    contracts = MaritimeOptimizationEngine.evaluate_contracts(
        total_cargo_mt=req.cargo_mt,
        num_voyages=req.num_voyages,
        base_spot_rate=base_rate,
        vessel_class=req.vessel_class
    )
    return contracts
