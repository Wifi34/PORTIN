from fastapi import APIRouter
from backend.app.schemas.schemas import AdvisorQueryRequest, AdvisorQueryResponse
from backend.app.services.advisor import DecisionAdvisorService

router = APIRouter()

@router.post("/ask", response_model=AdvisorQueryResponse)
def ask_advisor(req: AdvisorQueryRequest):
    return DecisionAdvisorService.answer_query(req.question, req.context)
