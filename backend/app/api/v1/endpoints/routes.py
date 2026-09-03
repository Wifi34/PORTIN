from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.app.database.session import get_db
from backend.app.models.models import Route

router = APIRouter()

@router.get("")
def get_routes(db: Session = Depends(get_db)):
    routes = db.query(Route).all()
    results = []
    for r in routes:
        results.append({
            "id": r.id,
            "origin_country": r.origin_country,
            "origin_port": r.origin_port,
            "destination_port_id": r.destination_port_id,
            "destination_port_name": r.destination_port.name if r.destination_port else "Unknown",
            "distance_nm": r.distance_nm,
            "typical_days": r.typical_days,
            "weather_risk_level": r.weather_risk_level,
            "origin_lat": r.origin_lat,
            "origin_lng": r.origin_lng,
            "dest_lat": r.destination_port.latitude if r.destination_port else 20.26,
            "dest_lng": r.destination_port.longitude if r.destination_port else 86.67
        })
    return results
