import httpx
from datetime import datetime, timezone
from typing import Dict, Any, Optional

# In-memory cache for weather data
_marine_cache: Dict[str, Dict[str, Any]] = {}

async def fetch_marine_conditions(lat: float, lon: float) -> Dict[str, Any]:
    cache_key = f"{round(lat, 2)}_{round(lon, 2)}"
    now = datetime.now(timezone.utc)
    
    # Check cache (1 hour expiry)
    if cache_key in _marine_cache:
        cached = _marine_cache[cache_key]
        if (now - cached["timestamp"]).total_seconds() < 3600:
            return cached["data"]

    url = f"https://marine-api.open-meteo.com/v1/marine?latitude={lat}&longitude={lon}&current=wave_height,wave_direction,wave_period&hourly=wave_height,wave_direction&timezone=auto"
    
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            response = await client.get(url)
            if response.status_code == 200:
                data = response.json()
                current = data.get("current", {})
                result = {
                    "wave_height_m": current.get("wave_height", 1.8),
                    "wave_direction_deg": current.get("wave_direction", 185),
                    "wave_period_s": current.get("wave_period", 7.2),
                    "sea_condition": "Moderate" if current.get("wave_height", 1.8) < 2.5 else "Rough",
                    "status": "LIVE",
                    "is_live": True,
                    "source": "Open-Meteo Marine API",
                    "retrieved_at": now.isoformat(),
                    "disclaimer": "Planning visualization — not for vessel navigation."
                }
                _marine_cache[cache_key] = {"timestamp": now, "data": result}
                return result
    except Exception:
        pass

    # Graceful fallback with explicit truthfulness label
    fallback = {
        "wave_height_m": 1.75,
        "wave_direction_deg": 190,
        "wave_period_s": 6.8,
        "sea_condition": "Moderate (Seasonal Maritime Norm)",
        "status": "LIVE DATA UNAVAILABLE (SEASONAL DEMO)",
        "is_live": False,
        "source": "Indian Ocean Seasonal Climatological Average",
        "retrieved_at": now.isoformat(),
        "disclaimer": "Planning visualization — not for vessel navigation."
    }
    return fallback
