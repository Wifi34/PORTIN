from fastapi import APIRouter, Depends
from backend.app.schemas.schemas import ForecastRequest, ForecastResponse
from backend.app.services.forecasting import forecasting_service

router = APIRouter()

@router.post("/run", response_model=ForecastResponse)
def run_forecast(req: ForecastRequest):
    result = forecasting_service.forecast(
        origin_country=req.origin_country,
        origin_port=req.origin_port,
        destination_port=req.destination_port,
        vessel_class=req.vessel_class,
        desired_date_str=req.desired_shipment_date,
        horizon_days=req.planning_horizon_days,
        cargo_type=req.cargo_type,
        cargo_mt=req.cargo_mt
    )
    return result
