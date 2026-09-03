from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.app.database.session import get_db
from backend.app.models.models import DecisionRecord, User, AuditLog
from backend.app.core.deps import get_current_user
from backend.app.schemas.schemas import DecisionSaveRequest, DecisionHistoryResponse

router = APIRouter()

@router.get("", response_model=List[DecisionHistoryResponse])
def get_decisions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Return user's analyses, or all if admin
    query = db.query(DecisionRecord)
    if current_user.role != "admin":
        query = query.filter(DecisionRecord.user_id == current_user.id)
    return query.order_by(DecisionRecord.created_at.desc()).all()

@router.post("", response_model=DecisionHistoryResponse)
def save_decision(req: DecisionSaveRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rec = DecisionRecord(
        user_id=current_user.id,
        title=req.title,
        cargo_type=req.cargo_type,
        cargo_mt=req.cargo_mt,
        origin_country=req.origin_country,
        origin_port=req.origin_port,
        destination_port=req.destination_port,
        shipment_date=req.shipment_date,
        contract_type=req.contract_type,
        num_voyages=req.num_voyages,
        planning_horizon_days=req.planning_horizon_days,
        market_signal=req.market_signal,
        recommended_vessel=req.recommended_vessel,
        optimal_window=req.optimal_window,
        risk_score=req.risk_score,
        estimated_total_cost_usd=req.estimated_total_cost_usd,
        results_json=req.results_json
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)

    # Log action
    audit = AuditLog(user_id=current_user.id, action="DECISION_SAVED", resource="DecisionRecord", details=f"Saved decision #{rec.id}: {rec.title}")
    db.add(audit)
    db.commit()

    return rec

@router.get("/{decision_id}", response_model=DecisionHistoryResponse)
def get_decision_by_id(decision_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rec = db.query(DecisionRecord).filter(DecisionRecord.id == decision_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Decision not found")
    return rec

@router.delete("/{decision_id}")
def delete_decision(decision_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rec = db.query(DecisionRecord).filter(DecisionRecord.id == decision_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Decision record not found")
    if current_user.role != "admin" and rec.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this decision")
    
    db.delete(rec)
    db.commit()
    return {"message": "Decision record deleted successfully"}
