from typing import Dict, Any, List
from backend.app.schemas.schemas import CompatibilityResult

class PortCompatibilityEngine:
    """
    Deterministic port compatibility rule engine.
    Compares vessel dimensions against berth-specific physical restrictions.
    Complies with government requirement: Berth-level constraints, not artificial universal port limits.
    """
    @staticmethod
    def evaluate_vessel_berth(vessel: Dict[str, Any], berth: Dict[str, Any], cargo_type: str = "Coking Coal") -> CompatibilityResult:
        reasons = []
        is_draft_ok = True
        is_loa_ok = True
        is_beam_ok = True
        is_cargo_ok = True

        v_draft = vessel.get("typical_draft", 14.2)
        v_loa = vessel.get("typical_loa", 225.0)
        v_beam = vessel.get("typical_beam", 32.2)

        b_draft = berth.get("max_draft", 14.5)
        b_loa = berth.get("max_loa", 230.0)
        b_beam = berth.get("max_beam", 32.5)
        supported_cargo = berth.get("supported_cargo", "Coking Coal, Iron Ore")

        draft_margin = round(b_draft - v_draft, 2)
        loa_margin = round(b_loa - v_loa, 1)
        beam_margin = round(b_beam - v_beam, 1)

        # 1. Draft evaluation
        if draft_margin < 0:
            is_draft_ok = False
            reasons.append(f"Vessel draft ({v_draft}m) exceeds berth permissible draft ({b_draft}m) by {abs(draft_margin):.2f}m (Lightering or tidal restriction required).")
        elif draft_margin < 0.5:
            reasons.append(f"Marginal under-keel clearance ({draft_margin:.2f}m margin at High Water).")

        # 2. LOA evaluation
        if loa_margin < 0:
            is_loa_ok = False
            reasons.append(f"Vessel LOA ({v_loa}m) exceeds berth maximum LOA ({b_loa}m) by {abs(loa_margin):.1f}m.")

        # 3. Beam evaluation
        if beam_margin < 0:
            is_beam_ok = False
            reasons.append(f"Vessel beam ({v_beam}m) exceeds shore unloader outreach / berth beam limit ({b_beam}m).")

        # 4. Cargo handling evaluation
        if cargo_type.lower() not in supported_cargo.lower() and "bulk" not in supported_cargo.lower():
            is_cargo_ok = False
            reasons.append(f"Berth unloader not optimized for {cargo_type} (Specialized equipment required).")

        # Determine composite status
        if not is_draft_ok or not is_loa_ok or not is_beam_ok or not is_cargo_ok:
            if not is_draft_ok and draft_margin >= -1.0 and is_loa_ok and is_beam_ok:
                status = "CONDITIONALLY COMPATIBLE"
                reasons.append("Tidal window entry or short-loading feasible under Port Harbor Master authorization.")
            else:
                status = "NOT COMPATIBLE"
        else:
            if draft_margin < 0.5:
                status = "CONDITIONALLY COMPATIBLE"
            else:
                status = "COMPATIBLE"
                reasons.append(f"Fully compliant with {berth.get('name', 'Berth')} parameters with {draft_margin}m draft margin.")

        return CompatibilityResult(
            berth_id=berth.get("id", 1),
            berth_name=berth.get("name", "Berth"),
            status=status,
            draft_margin_m=draft_margin,
            loa_margin_m=loa_margin,
            beam_margin_m=beam_margin,
            is_draft_ok=is_draft_ok,
            is_loa_ok=is_loa_ok,
            is_beam_ok=is_beam_ok,
            is_cargo_ok=is_cargo_ok,
            reasons=reasons
        )
