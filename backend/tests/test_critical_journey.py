import uuid
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_full_critical_journey():
    """
    SIH Critical Journey:
    REGISTER -> LOGIN -> DASHBOARD -> CREATE ANALYSIS -> RUN FORECAST 
    -> VESSEL OPTIMIZATION -> PORT COMPATIBILITY -> CONTRACT OPTIMIZATION 
    -> DECISION TWIN -> SAVE DECISION -> GENERATE REPORT -> LOGOUT -> LOGIN -> REOPEN SAVED DECISION
    """
    # 1. REGISTER
    unique_email = f"journey_analyst_{uuid.uuid4().hex[:6]}@sail.gov.in"
    password = "Chartering2026!Secure"
    reg_res = client.post("/api/v1/auth/register", json={
        "email": unique_email,
        "password": password,
        "full_name": "Journey Analyst",
        "organization": "SAIL Bokaro Steel Plant",
        "role": "chartering_analyst",
        "accept_terms": True
    })
    assert reg_res.status_code == 200, f"Registration failed: {reg_res.text}"

    # 2. LOGIN
    login_res = client.post("/api/v1/auth/login", json={
        "email": unique_email,
        "password": password
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. DASHBOARD METRICS
    dash_ports = client.get("/api/v1/ports", headers=headers)
    assert dash_ports.status_code == 200
    alerts_res = client.get("/api/v1/alerts", headers=headers)
    assert alerts_res.status_code == 200

    # 4. CREATE ANALYSIS & RUN FORECAST
    forecast_payload = {
        "cargo_type": "Coking Coal",
        "cargo_mt": 70000.0,
        "origin_country": "Australia",
        "origin_port": "Gladstone",
        "destination_port": "Paradip",
        "desired_shipment_date": "2026-09-25",
        "vessel_class": "AUTO",
        "contract_duration_months": 3,
        "num_voyages": 3,
        "planning_horizon_days": 90
    }
    fc_res = client.post("/api/v1/forecasts/run", json=forecast_payload, headers=headers)
    assert fc_res.status_code == 200
    fc_data = fc_res.json()
    assert fc_data["market_signal"] in ["BOOK NOW", "WAIT", "MONITOR"]

    # 5. VESSEL OPTIMIZATION & PORT COMPATIBILITY
    vessel_res = client.post("/api/v1/optimizer/vessel", json={
        "cargo_mt": 70000.0,
        "origin_country": "Australia",
        "destination_port": "Paradip",
        "cargo_type": "Coking Coal",
        "desired_date": "2026-09-25"
    }, headers=headers)
    assert vessel_res.status_code == 200
    vessels = vessel_res.json()
    assert len(vessels) == 4
    # Ensure port compatibility checks occurred
    for v in vessels:
        assert "port_compatibility_status" in v
        assert len(v["berth_details"]) > 0

    # 6. CONTRACT OPTIMIZATION (Spot vs Multi-voyage COA)
    contract_res = client.post("/api/v1/optimizer/contract", json={
        "cargo_mt": 70000.0,
        "num_voyages": 3,
        "origin_country": "Australia",
        "destination_port": "Paradip",
        "vessel_class": "Panamax",
        "desired_date": "2026-09-25"
    }, headers=headers)
    assert contract_res.status_code == 200
    contracts = contract_res.json()
    assert any(c["is_recommended"] for c in contracts)

    # 7. FLAGSHIP PORTIN DECISION TWIN
    twin_res = client.post("/api/v1/decision-twin/run", json=forecast_payload, headers=headers)
    assert twin_res.status_code == 200
    twin = twin_res.json()
    plan_a = twin["plan_a"]
    assert plan_a["plan_code"] == "PLAN A"

    # 8. SAVE DECISION
    save_res = client.post("/api/v1/decisions", json={
        "title": "70,000 MT Coking Coal: Gladstone to Paradip",
        "cargo_type": "Coking Coal",
        "cargo_mt": 70000.0,
        "origin_country": "Australia",
        "origin_port": "Gladstone",
        "destination_port": "Paradip",
        "shipment_date": "2026-09-25",
        "contract_type": plan_a["contract_strategy"],
        "num_voyages": 3,
        "planning_horizon_days": 90,
        "market_signal": twin["market_signal"],
        "recommended_vessel": plan_a["vessel_class"],
        "optimal_window": plan_a["booking_window"],
        "risk_score": plan_a["risk_score"],
        "estimated_total_cost_usd": plan_a["estimated_logistics_cost_usd"],
        "results_json": twin
    }, headers=headers)
    assert save_res.status_code == 200
    saved_id = save_res.json()["id"]

    # 9. GENERATE EXECUTIVE PDF REPORT
    rep_res = client.post("/api/v1/reports/generate", json={
        "title": "Gladstone to Paradip Coking Coal Executive Chartering Report",
        "report_type": "Chartering Decision Report",
        "decision_id": saved_id,
        "summary": "Executive chartering analysis for 70k MT coal parcel into Paradip."
    }, headers=headers)
    assert rep_res.status_code == 200
    rep_data = rep_res.json()
    assert "file_url" in rep_data

    # 10. RE-LOGIN & REOPEN SAVED DECISION
    login2 = client.post("/api/v1/auth/login", json={
        "email": unique_email,
        "password": password
    })
    token2 = login2.json()["access_token"]
    headers2 = {"Authorization": f"Bearer {token2}"}

    reopened = client.get(f"/api/v1/decisions/{saved_id}", headers=headers2)
    assert reopened.status_code == 200
    assert reopened.json()["id"] == saved_id
    assert reopened.json()["recommended_vessel"] == plan_a["vessel_class"]
    print("\n[PortIN Critical Journey] Complete end-to-end journey verified successfully!")
