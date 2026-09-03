from typing import Dict, Any, List

class RiskEngine:
    """
    Transparent multi-factor risk scoring engine.
    Calculates overall score (0-100) and extracts top contributing drivers.
    0-30: LOW, 31-65: MEDIUM, 66-100: HIGH.
    """
    @staticmethod
    def calculate_risk(
        freight_volatility_pct: float,
        congestion_score: float,
        draft_margin_m: float,
        weather_wave_height_m: float,
        contract_type: str,
        is_port_fully_compatible: bool
    ) -> Dict[str, Any]:
        
        # 1. Freight Market Volatility Factor (weight: 25%)
        vol_score = min(100.0, abs(freight_volatility_pct) * 8.0)
        
        # 2. Port Congestion Factor (weight: 25%)
        cong_score = min(100.0, congestion_score)
        
        # 3. Berth Physical Constraint Risk (weight: 25%)
        if not is_port_fully_compatible:
            constraint_score = 90.0
        elif draft_margin_m < 0.5:
            constraint_score = 65.0
        elif draft_margin_m < 1.0:
            constraint_score = 35.0
        else:
            constraint_score = 10.0

        # 4. Weather Risk (weight: 15%)
        if weather_wave_height_m > 3.0:
            weather_score = 85.0
        elif weather_wave_height_m > 2.0:
            weather_score = 50.0
        else:
            weather_score = 20.0

        # 5. Contract Strategy Exposure (weight: 10%)
        if "Spot" in contract_type:
            contract_risk = 75.0
        elif "Short-Term" in contract_type:
            contract_risk = 25.0
        else:
            contract_risk = 15.0

        total_risk = (
            vol_score * 0.25 +
            cong_score * 0.25 +
            constraint_score * 0.25 +
            weather_score * 0.15 +
            contract_risk * 0.10
        )
        total_risk = round(max(5.0, min(95.0, total_risk)), 1)

        if total_risk <= 30:
            category = "LOW"
            color = "green"
        elif total_risk <= 65:
            category = "MEDIUM"
            color = "amber"
        else:
            category = "HIGH"
            color = "red"

        factors = [
            {"factor": "Port Congestion & Anchorage Queue", "score": round(cong_score, 1), "weight_pct": 25, "impact": "High" if cong_score > 50 else "Low"},
            {"factor": "Freight Rate Volatility", "score": round(vol_score, 1), "weight_pct": 25, "impact": "High" if vol_score > 50 else "Moderate"},
            {"factor": "Berth Draft & LOA Margin", "score": round(constraint_score, 1), "weight_pct": 25, "impact": "High" if constraint_score > 50 else "Minimal"},
            {"factor": "Marine Weather & Wave Height", "score": round(weather_score, 1), "weight_pct": 15, "impact": "Moderate" if weather_score > 40 else "Favorable"},
            {"factor": "Contract Volatility Exposure", "score": round(contract_risk, 1), "weight_pct": 10, "impact": "High" if contract_risk > 50 else "Protected"},
        ]
        factors.sort(key=lambda x: x["score"], reverse=True)

        return {
            "risk_score": total_risk,
            "risk_category": category,
            "risk_color": color,
            "top_drivers": factors[:3],
            "all_factors": factors,
            "summary": f"Overall operational chartering risk evaluated as {category} ({total_risk}/100)."
        }
