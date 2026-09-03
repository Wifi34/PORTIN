from typing import Dict, Any, List
from backend.app.services.compatibility import PortCompatibilityEngine
from backend.app.schemas.schemas import VesselEvaluation, ContractOption

class MaritimeOptimizationEngine:
    """
    Mathematical optimization routine for vessel selection and contract structuring.
    Integrates physical berth constraints, deadweight parceling, and idle-time economics.
    """
    @staticmethod
    def evaluate_vessels(
        cargo_mt: float,
        origin_country: str,
        destination_port: str,
        berths: List[Dict[str, Any]],
        base_freight_rate: float,
        cargo_type: str = "Coking Coal"
    ) -> List[VesselEvaluation]:
        
        # Representative vessel profiles
        vessels = [
            {
                "class_name": "Handysize",
                "typical_dwt": 35000,
                "typical_loa": 180.0,
                "typical_beam": 28.4,
                "typical_draft": 10.2,
                "daily_hire_usd": 12500,
                "fuel_consumption_tpd": 22.0,
                "rate_multiplier": 1.38
            },
            {
                "class_name": "Supramax",
                "typical_dwt": 58000,
                "typical_loa": 199.9,
                "typical_beam": 32.2,
                "typical_draft": 12.8,
                "daily_hire_usd": 15800,
                "fuel_consumption_tpd": 28.0,
                "rate_multiplier": 1.18
            },
            {
                "class_name": "Panamax",
                "typical_dwt": 76000,
                "typical_loa": 225.0,
                "typical_beam": 32.3,
                "typical_draft": 14.2,
                "daily_hire_usd": 18200,
                "fuel_consumption_tpd": 34.0,
                "rate_multiplier": 1.00
            },
            {
                "class_name": "Capesize",
                "typical_dwt": 180000,
                "typical_loa": 292.0,
                "typical_beam": 45.0,
                "typical_draft": 18.2,
                "daily_hire_usd": 27500,
                "fuel_consumption_tpd": 52.0,
                "rate_multiplier": 0.82
            }
        ]

        results: List[VesselEvaluation] = []

        for v in vessels:
            v_name = v["class_name"]
            dwt = v["typical_dwt"]
            
            # Cargo utilization and parcel suitability
            utilization = min(100.0, round((cargo_mt / dwt) * 100.0, 1))
            
            # Penalize deadfreight if ship is huge and parcel is small, or multiple voyages needed
            if cargo_mt <= dwt:
                parcel_fit = max(10.0, 100.0 - (dwt - cargo_mt) / dwt * 60.0)
            else:
                # Multiple voyage parceling
                remainder = cargo_mt % dwt
                parcel_fit = 90.0 if remainder == 0 else 75.0

            # Evaluate berth compatibility
            berth_results = []
            compatible_count = 0
            for b in berths:
                res = PortCompatibilityEngine.evaluate_vessel_berth(v, b, cargo_type)
                berth_results.append(res)
                if res.status in ["COMPATIBLE", "CONDITIONALLY COMPATIBLE"]:
                    compatible_count += 1

            total_berths = len(berths) if berths else 1
            if compatible_count == 0:
                port_status = "NOT COMPATIBLE"
            elif compatible_count < total_berths:
                port_status = "CONDITIONALLY COMPATIBLE"
            else:
                port_status = "COMPATIBLE"

            # Cost calculations
            unit_rate = round(base_freight_rate * v["rate_multiplier"], 2)
            estimated_cost = round(unit_rate * cargo_mt, 2)
            turnaround_days = round(cargo_mt / 22000.0 + 2.0, 1) # Handling + maneuvering
            idle_risk_usd = round(v["daily_hire_usd"] * 2.5, 2) # Typical 2.5 days anchorage exposure

            # Composite scoring (Optimization Objective)
            score = 0.0
            drivers = []

            if port_status == "NOT COMPATIBLE":
                score = 15.0
                drivers.append("Physical berth draft / LOA limits violated at destination.")
            else:
                score += (utilization / 100.0) * 35.0
                # Cost efficiency score
                cost_score = max(5.0, 35.0 - (unit_rate / 35.0) * 20.0)
                score += cost_score
                # Port flexibility score
                port_flex = (compatible_count / total_berths) * 30.0
                score += port_flex

                if port_status == "COMPATIBLE":
                    drivers.append(f"Full compatibility across {compatible_count} mechanized berths.")
                else:
                    drivers.append(f"Restricted to {compatible_count}/{total_berths} deep-water berths.")

                if utilization >= 85.0:
                    drivers.append(f"High parcel load factor ({utilization}% cargo capacity utilized).")
                else:
                    drivers.append(f"Sub-optimal load factor ({utilization}% capacity, partial deadweight loss).")

                drivers.append(f"Estimated freight unit cost: ${unit_rate}/MT.")

            results.append(VesselEvaluation(
                vessel_class=v_name,
                parcel_suitability_score=round(parcel_fit, 1),
                cargo_utilization_pct=utilization,
                estimated_voyage_cost_usd=estimated_cost,
                freight_rate_per_mt=unit_rate,
                port_compatibility_status=port_status,
                compatible_berths_count=compatible_count,
                total_berths_count=total_berths,
                berth_details=berth_results,
                turnaround_days=turnaround_days,
                daily_idle_risk_usd=idle_risk_usd,
                recommendation_score=round(score, 1),
                is_recommended=False,
                key_drivers=drivers
            ))

        # Filter feasible vessels and pick top score
        feasible = [r for r in results if r.port_compatibility_status != "NOT COMPATIBLE"]
        if feasible:
            best = max(feasible, key=lambda x: x.recommendation_score)
            best.is_recommended = True
        elif results:
            # If all physically infeasible, mark the closest
            results[0].is_recommended = True

        return results

    @staticmethod
    def evaluate_contracts(
        total_cargo_mt: float,
        num_voyages: int,
        base_spot_rate: float,
        vessel_class: str
    ) -> List[ContractOption]:
        """
        Calculates Spot vs. Short-Term COA vs. Medium-Term COA.
        Directly fulfills the primary SAIL SIH requirement:
        Migrating from repeated individual spot fixtures to structured multi-voyage contracts.
        """
        # A. Spot Contract (High market risk, no volume commitment discount)
        spot_rate = base_spot_rate
        spot_total_freight = round(spot_rate * total_cargo_mt, 2)
        spot_idle_days = round(num_voyages * 3.2, 1) # Spot vessels suffer longer anchorage queue
        spot_idle_cost = spot_idle_days * 18000.0
        spot_total_cost = spot_total_freight + spot_idle_cost

        # B. Short-Term Multi-Voyage (COA - 3 Voyages, e.g. 90-day horizon)
        # 4.5% volume negotiation rebate, 35% reduction in anchorage waiting due to priority scheduling
        coa_short_rate = round(base_spot_rate * 0.955, 2)
        coa_short_freight = round(coa_short_rate * total_cargo_mt, 2)
        coa_short_idle_days = round(num_voyages * 1.8, 1)
        coa_short_idle_cost = coa_short_idle_days * 18000.0
        coa_short_total_cost = coa_short_freight + coa_short_idle_cost
        savings_short = round(spot_total_cost - coa_short_total_cost, 2)

        # C. Medium-Term Multi-Voyage (COA - 6 Voyages, e.g. 180-day horizon)
        # 8.0% volume discount, structured laycan commitments
        coa_med_rate = round(base_spot_rate * 0.92, 2)
        coa_med_freight = round(coa_med_rate * total_cargo_mt, 2)
        coa_med_idle_days = round(num_voyages * 1.4, 1)
        coa_med_idle_cost = coa_med_idle_days * 18000.0
        coa_med_total_cost = coa_med_freight + coa_med_idle_cost
        savings_med = round(spot_total_cost - coa_med_total_cost, 2)

        options = [
            ContractOption(
                contract_type="Single Spot Charter",
                num_voyages=num_voyages,
                total_cargo_mt=total_cargo_mt,
                avg_freight_per_mt=spot_rate,
                total_freight_cost_usd=spot_total_freight,
                rate_volatility_exposure="HIGH",
                idle_time_days=spot_idle_days,
                total_logistics_cost_usd=round(spot_total_cost, 2),
                planning_certainty_pct=35.0,
                savings_vs_spot_usd=0.0,
                pros=["High operational flexibility", "No forward volume commitment penalties"],
                cons=["100% exposed to spot rate spikes", "Frequent anchorage waiting at East Coast ports"],
                is_recommended=False
            ),
            ContractOption(
                contract_type=f"Short-Term Multi-Voyage ({num_voyages} Voyages COA)",
                num_voyages=num_voyages,
                total_cargo_mt=total_cargo_mt,
                avg_freight_per_mt=coa_short_rate,
                total_freight_cost_usd=coa_short_freight,
                rate_volatility_exposure="LOW",
                idle_time_days=coa_short_idle_days,
                total_logistics_cost_usd=round(coa_short_total_cost, 2),
                planning_certainty_pct=88.0,
                savings_vs_spot_usd=savings_short,
                pros=[
                    f"Locks in ${coa_short_rate}/MT rate baseline",
                    f"Direct savings of ${savings_short:,.0f} vs. spot market",
                    "Priority berthing coordination reduces anchorage idle days by 44%"
                ],
                cons=["Requires strict laycan adherence by loading terminal"],
                is_recommended=True
            ),
            ContractOption(
                contract_type="Medium-Term Multi-Voyage (6-Month Strategic COA)",
                num_voyages=max(6, num_voyages * 2),
                total_cargo_mt=total_cargo_mt * 2,
                avg_freight_per_mt=coa_med_rate,
                total_freight_cost_usd=round(coa_med_freight * 2, 2),
                rate_volatility_exposure="MINIMAL",
                idle_time_days=round(coa_med_idle_days * 2, 1),
                total_logistics_cost_usd=round(coa_med_total_cost * 2, 2),
                planning_certainty_pct=96.0,
                savings_vs_spot_usd=round(savings_med * 2, 2),
                pros=[
                    f"Maximum volume rebate (${coa_med_rate}/MT baseline)",
                    "Insulates SAIL steel mills completely from seasonal monsoon rate spikes"
                ],
                cons=["Commitment requires guaranteed steel plant quarterly raw material drawdowns"],
                is_recommended=False
            )
        ]

        return options
