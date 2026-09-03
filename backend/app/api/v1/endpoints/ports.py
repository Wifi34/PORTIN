from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.app.database.session import get_db
from backend.app.models.models import Port, Berth
from backend.app.schemas.schemas import PortResponse, BerthResponse
from backend.app.providers.marine import fetch_marine_conditions

router = APIRouter()

@router.get("", response_model=List[PortResponse])
def get_all_ports(db: Session = Depends(get_db)):
    ports = db.query(Port).all()
    return ports

@router.get("/{port_id}")
async def get_port_by_id(port_id: int, db: Session = Depends(get_db)):
    port = db.query(Port).filter(Port.id == port_id).first()
    if not port:
        raise HTTPException(status_code=404, detail="Port not found")
    
    # Fetch real-time marine weather conditions
    marine = await fetch_marine_conditions(port.latitude, port.longitude)
    
    return {
        "id": port.id,
        "code": port.code,
        "name": port.name,
        "state": port.state,
        "country": port.country,
        "latitude": port.latitude,
        "longitude": port.longitude,
        "max_draft": port.max_draft,
        "max_loa": port.max_loa,
        "annual_capacity_mt": port.annual_capacity_mt,
        "congestion_score": port.congestion_score,
        "active_vessels": port.active_vessels,
        "anchorage_queue": port.anchorage_queue,
        "avg_waiting_days": port.avg_waiting_days,
        "source": port.source,
        "source_type": port.source_type,
        "last_verified_at": port.last_verified_at,
        "berths": [
            {
                "id": b.id,
                "name": b.name,
                "berth_type": b.berth_type,
                "max_draft": b.max_draft,
                "max_loa": b.max_loa,
                "max_beam": b.max_beam,
                "handling_rate_tpd": b.handling_rate_tpd,
                "supported_cargo": b.supported_cargo,
                "source": b.source,
                "last_verified_at": b.last_verified_at
            }
            for b in port.berths
        ],
        "marine_conditions": marine
    }

@router.get("/{port_id}/berths", response_model=List[BerthResponse])
def get_port_berths(port_id: int, db: Session = Depends(get_db)):
    berths = db.query(Berth).filter(Berth.port_id == port_id).all()
    return berths
