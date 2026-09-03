from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.models import Port
from backend.app.schemas.schemas import ForecastRequest, DecisionTwinResponse
from backend.app.services.decision_twin import DecisionTwinEngine

router = APIRouter()

@router.post("/run", response_model=DecisionTwinResponse)
def run_decision_twin(req: ForecastRequest, db: Session = Depends(get_db)):
    # Retrieve berths for target port
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

    twin_res = DecisionTwinEngine.run_twin(
        cargo_type=req.cargo_type,
        cargo_mt=req.cargo_mt,
        origin_country=req.origin_country,
        origin_port=req.origin_port,
        destination_port=req.destination_port,
        desired_date=req.desired_shipment_date,
        berths=berths_data,
        num_voyages=req.num_voyages
    )
    return twin_res
