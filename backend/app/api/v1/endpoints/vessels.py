from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from backend.app.database.session import get_db
from backend.app.models.models import VesselClass
from backend.app.schemas.schemas import VesselClassResponse

router = APIRouter()

@router.get("", response_model=List[VesselClassResponse])
def get_vessel_classes(db: Session = Depends(get_db)):
    vessels = db.query(VesselClass).all()
    return vessels
