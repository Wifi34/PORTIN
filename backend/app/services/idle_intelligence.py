from typing import Dict, Any, List

class IdleIntelligenceService:
    """
    Calculates berth waiting, handling turnaround, idle days, utilization,
    and deadheading exposure with suggested mitigation actions.
    """
    @staticmethod
    def analyze_idle_time(
        cargo_mt: float,
        vessel_class: str,
        destination_port: str,
        handling_rate_tpd: float = 25000.0,
        anchorage_queue_ships: int = 5,
        avg_wait_days_base: float = 2.0
    ) -> Dict[str, Any]:
        
        # Unloading duration based on berth handling capacity
        handling_days = round(cargo_mt / max(5000.0, handling_rate_tpd), 1)
        
        # Anchorage queue delay based on current port queue
        queue_delay_days = round(avg_wait_days_base * (1.0 + (anchorage_queue_ships / 10.0)), 1)
        
        # Turnaround days = Maneuvering (0.8) + Queue Waiting + Unloading
        turnaround_days = round(0.8 + queue_delay_days + handling_days, 1)

        # Demurrage rates by vessel class ($/day)
        demurrage_rates = {
            "Handysize": 13000.0,
            "Supramax": 16500.0,
            "Panamax": 19500.0,
            "Capesize": 28500.0
        }
        demurrage_per_day = demurrage_rates.get(vessel_class, 19500.0)
        demurrage_risk_usd = round(queue_delay_days * demurrage_per_day, 2)

        # Deadheading exposure (likelihood of ship returning ballast without backhaul cargo)
        # East Coast of India has iron ore export capability from Paradip/Vizag to China/Far East
        backhaul_opportunity_pct = 65.0 if destination_port in ["Paradip", "Visakhapatnam", "Gangavaram"] else 30.0
        deadheading_exposure_pct = 100.0 - backhaul_opportunity_pct

        mitigation_actions = [
            f"Coordinate laycan arrival with Port Traffic Control to enter directly into berth queue.",
            f"Migrate to a Consecutive Voyage COA with priority berthing window to reduce queue delay by up to 45%.",
            f"Explore iron ore fines pellet backhaul fixture from {destination_port} to mitigate {deadheading_exposure_pct:.0f}% ballast deadheading loss."
        ]

        return {
            "handling_days": handling_days,
            "queue_waiting_days": queue_delay_days,
            "total_turnaround_days": turnaround_days,
            "demurrage_exposure_usd": demurrage_risk_usd,
            "daily_demurrage_rate_usd": demurrage_per_day,
            "deadheading_exposure_pct": deadheading_exposure_pct,
            "backhaul_opportunity_pct": backhaul_opportunity_pct,
            "suggested_actions": mitigation_actions
        }
