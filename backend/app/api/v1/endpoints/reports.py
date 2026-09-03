from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import os
import uuid
from backend.app.database.session import get_db
from backend.app.models.models import ReportRecord, User, DecisionRecord
from backend.app.core.deps import get_current_user
from backend.app.schemas.schemas import ReportGenerateRequest, ReportResponse
from backend.app.services.reports import ReportService

router = APIRouter()

@router.post("/generate", response_model=ReportResponse)
def generate_report(req: ReportGenerateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rep_data = req.data or {}
    
    # If decision_id is provided, pull stored decision fields
    if req.decision_id:
        dec = db.query(DecisionRecord).filter(DecisionRecord.id == req.decision_id).first()
        if dec:
            rep_data.update({
                "cargo_type": dec.cargo_type,
                "cargo_mt": dec.cargo_mt,
                "origin_country": dec.origin_country,
                "destination_port": dec.destination_port,
                "recommended_vessel": dec.recommended_vessel,
                "contract_type": dec.contract_type,
                "market_signal": dec.market_signal,
                "optimal_window": dec.optimal_window,
                "estimated_total_cost_usd": dec.estimated_total_cost_usd,
                "risk_score": dec.risk_score
            })

    summary_text = req.summary or f"Executive Chartering Decision Report for {rep_data.get('cargo_type', 'Bulk')} from {rep_data.get('origin_country', 'Overseas')} to {rep_data.get('destination_port', 'East Coast India')}."
    rep_data["summary"] = summary_text

    filename = f"PortIN_Report_{uuid.uuid4().hex[:8]}.pdf"
    pdf_path = ReportService.generate_pdf_report(rep_data, filename)

    rep_rec = ReportRecord(
        user_id=current_user.id,
        decision_id=req.decision_id,
        title=req.title,
        report_type=req.report_type,
        summary=summary_text,
        file_path=pdf_path,
        metadata_json=rep_data
    )
    db.add(rep_rec)
    db.commit()
    db.refresh(rep_rec)

    return ReportResponse(
        id=rep_rec.id,
        title=rep_rec.title,
        report_type=rep_rec.report_type,
        summary=rep_rec.summary,
        created_at=rep_rec.created_at,
        file_url=f"/api/v1/reports/{rep_rec.id}/download"
    )

@router.get("", response_model=List[ReportResponse])
def list_reports(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    reports = db.query(ReportRecord).filter(ReportRecord.user_id == current_user.id).order_by(ReportRecord.created_at.desc()).all()
    results = []
    for r in reports:
        results.append(ReportResponse(
            id=r.id,
            title=r.title,
            report_type=r.report_type,
            summary=r.summary,
            created_at=r.created_at,
            file_url=f"/api/v1/reports/{r.id}/download"
        ))
    return results

@router.get("/{report_id}/download")
def download_report(report_id: int, db: Session = Depends(get_db)):
    rep = db.query(ReportRecord).filter(ReportRecord.id == report_id).first()
    if not rep or not rep.file_path or not os.path.exists(rep.file_path):
        raise HTTPException(status_code=404, detail="Report PDF file not found")
    
    return FileResponse(
        path=rep.file_path,
        filename=os.path.basename(rep.file_path),
        media_type="application/pdf"
    )
