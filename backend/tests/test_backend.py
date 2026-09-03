import pytest
import uuid
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["project"] == "PortIN"
    assert response.json()["sih_problem_id"] == "26006"

def test_registration_and_login():
    unique_email = f"testuser_{uuid.uuid4().hex[:6]}@sail.gov.in"
    reg_payload = {
        "email": unique_email,
        "password": "SecurePassword123!",
        "full_name": "Test Analyst",
        "organization": "SAIL Testing Lab",
        "role": "chartering_analyst",
        "accept_terms": True
    }
    # 1. Register
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 200
    assert reg_res.json()["email"] == unique_email

    # 2. Login
    login_res = client.post("/api/v1/auth/login", json={
        "email": unique_email,
        "password": "SecurePassword123!"
    })
    assert login_res.status_code == 200
    tokens = login_res.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens

    # 3. Protected /auth/me
    token = tokens["access_token"]
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == unique_email

def test_admin_authorization():
    # Attempt admin endpoint with non-admin
    unique_email = f"analyst_{uuid.uuid4().hex[:6]}@sail.gov.in"
    client.post("/api/v1/auth/register", json={
        "email": unique_email,
        "password": "Password123!",
        "full_name": "Analyst User",
        "role": "chartering_analyst",
        "accept_terms": True
    })
    login_res = client.post("/api/v1/auth/login", json={"email": unique_email, "password": "Password123!"})
    token = login_res.json()["access_token"]

    admin_res = client.get("/api/v1/admin/overview", headers={"Authorization": f"Bearer {token}"})
    assert admin_res.status_code == 403

    # Now login with pre-seeded admin
    admin_login = client.post("/api/v1/auth/login", json={
        "email": "admin@portin.sail.gov.in",
        "password": "Admin@PortIN2026"
    })
    admin_token = admin_login.json()["access_token"]
    admin_overview = client.get("/api/v1/admin/overview", headers={"Authorization": f"Bearer {admin_token}"})
    assert admin_overview.status_code == 200
    assert admin_overview.json()["system_status"] == "ONLINE"

def test_ports_endpoint():
    response = client.get("/api/v1/ports")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 7
    codes = [p["code"] for p in data]
    assert "PRT" in codes
    assert "VTZ" in codes
    assert "GGV" in codes
    assert "DHM" in codes
    assert "HLD" in codes

def test_forecast_run():
    payload = {
        "cargo_type": "Coking Coal",
        "cargo_mt": 70000.0,
        "origin_country": "Australia",
        "origin_port": "Gladstone",
        "destination_port": "Paradip",
        "desired_shipment_date": "2026-09-20",
        "vessel_class": "Panamax",
        "contract_duration_months": 3,
        "num_voyages": 3,
        "planning_horizon_days": 90
    }
    response = client.post("/api/v1/forecasts/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "current_reference_rate" in data
    assert "day_7_prediction" in data
    assert "day_30_prediction" in data
    assert "market_signal" in data
    assert len(data["forecast_curve"]) > 0

def test_decision_twin_run():
    payload = {
        "cargo_type": "Coking Coal",
        "cargo_mt": 70000.0,
        "origin_country": "Australia",
        "origin_port": "Gladstone",
        "destination_port": "Paradip",
        "desired_shipment_date": "2026-09-20",
        "vessel_class": "AUTO",
        "contract_duration_months": 3,
        "num_voyages": 3,
        "planning_horizon_days": 90
    }
    response = client.post("/api/v1/decision-twin/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "plan_a" in data
    assert "plan_b" in data
    assert "plan_c" in data
    assert data["plan_a"]["plan_code"] == "PLAN A"
    assert data["plan_b"]["plan_code"] == "PLAN B"
    assert data["plan_c"]["plan_code"] == "PLAN C"

def test_vessel_optimizer():
    payload = {
        "cargo_mt": 70000.0,
        "origin_country": "Australia",
        "destination_port": "Paradip",
        "cargo_type": "Coking Coal",
        "desired_date": "2026-09-20"
    }
    response = client.post("/api/v1/optimizer/vessel", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 4
    v_classes = [v["vessel_class"] for v in data]
    assert "Panamax" in v_classes

def test_contract_optimizer():
    payload = {
        "cargo_mt": 70000.0,
        "num_voyages": 3,
        "origin_country": "Australia",
        "destination_port": "Paradip",
        "vessel_class": "Panamax",
        "desired_date": "2026-09-20"
    }
    response = client.post("/api/v1/optimizer/contract", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    c_types = [c["contract_type"] for c in data]
    assert any("Single Spot" in t for t in c_types)
    assert any("Short-Term" in t for t in c_types)

def test_risk_analysis():
    payload = {
        "freight_volatility_pct": 5.0,
        "congestion_score": 40.0,
        "draft_margin_m": 0.3,
        "weather_wave_height_m": 1.8,
        "contract_type": "Short-Term Multi-Voyage",
        "is_port_fully_compatible": True
    }
    response = client.post("/api/v1/risk/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "risk_score" in data
    assert 0 <= data["risk_score"] <= 100

def test_scenario_run():
    payload = {
        "base_cargo_mt": 70000.0,
        "freight_delta_pct": 10.0,
        "bunker_delta_pct": 5.0,
        "congestion_delta_days": 2.0,
        "weather_risk_factor": 1.2,
        "draft_restriction_m": -0.5,
        "selected_vessel": "Panamax",
        "contract_type": "Short-Term Multi-Voyage (3 Voyages)"
    }
    response = client.post("/api/v1/scenarios/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "adjusted_unit_freight" in data
    assert "demurrage_cost_usd" in data

def test_advisor():
    payload = {"question": "Which vessel is suitable for 70,000 MT coal from Australia to Paradip?"}
    response = client.post("/api/v1/advisor/ask", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "Panamax" in data["answer"]
