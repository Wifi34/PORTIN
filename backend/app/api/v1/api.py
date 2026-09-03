from fastapi import APIRouter
from backend.app.api.v1.endpoints import (
    auth, ports, vessels, routes, forecasts, optimizer,
    decision_twin, scenarios, risk, advisor, decisions, reports, alerts, admin
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(ports.router, prefix="/ports", tags=["Ports & Berths"])
api_router.include_router(vessels.router, prefix="/vessels", tags=["Vessels"])
api_router.include_router(routes.router, prefix="/routes", tags=["Routes"])
api_router.include_router(forecasts.router, prefix="/forecasts", tags=["Freight Forecasting"])
api_router.include_router(optimizer.router, prefix="/optimizer", tags=["Optimization Engine"])
api_router.include_router(decision_twin.router, prefix="/decision-twin", tags=["Decision Twin"])
api_router.include_router(scenarios.router, prefix="/scenarios", tags=["Scenario Lab"])
api_router.include_router(risk.router, prefix="/risk", tags=["Risk Engine"])
api_router.include_router(advisor.router, prefix="/advisor", tags=["PortIN Advisor"])
api_router.include_router(decisions.router, prefix="/decisions", tags=["Decision History"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin Panel"])
