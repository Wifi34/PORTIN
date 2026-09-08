import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from backend.app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    organization = Column(String(255), default="SAIL")
    role = Column(String(50), default="chartering_analyst", nullable=False)  # admin, logistics_manager, chartering_analyst, procurement_manager
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    decisions = relationship("DecisionRecord", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("ReportRecord", back_populates="user", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="user", cascade="all, delete-orphan")

class Port(Base):
    __tablename__ = "ports"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    country = Column(String(100), default="India")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    max_draft = Column(Float, nullable=False)  # General channel/port max draft
    max_loa = Column(Float, nullable=False)
    annual_capacity_mt = Column(Float, default=100.0)
    congestion_score = Column(Float, default=35.0)  # 0 to 100
    active_vessels = Column(Integer, default=12)
    anchorage_queue = Column(Integer, default=5)
    avg_waiting_days = Column(Float, default=2.5)
    source = Column(String(255), default="Port Authority Official Gazetted Data")
    source_type = Column(String(50), default="OFFICIAL STATIC")  # LIVE, OFFICIAL STATIC, SIMULATED DEMO, IMPORTED
    last_verified_at = Column(String(50), default="2026-08-15")
    is_demo = Column(Boolean, default=False)

    berths = relationship("Berth", back_populates="port", cascade="all, delete-orphan")
    routes = relationship("Route", back_populates="destination_port")

class Berth(Base):
    __tablename__ = "berths"

    id = Column(Integer, primary_key=True, index=True)
    port_id = Column(Integer, ForeignKey("ports.id"), nullable=False)
    name = Column(String(100), nullable=False)
    berth_type = Column(String(50), default="Mechanized Bulk")  # Mechanized Bulk, Semi-mechanized, General Cargo
    max_draft = Column(Float, nullable=False)  # Permissible berth draft in meters
    max_loa = Column(Float, nullable=False)    # Max LOA in meters
    max_beam = Column(Float, nullable=False)   # Max Beam in meters
    handling_rate_tpd = Column(Float, default=25000.0) # Tonnes per day
    supported_cargo = Column(String(255), default="Coking Coal, Thermal Coal, Iron Ore, Limestone")
    source = Column(String(255), default="Port Trust Master Plan / Berth Specification Chart")
    last_verified_at = Column(String(50), default="2026-08-15")

    port = relationship("Port", back_populates="berths")

class VesselClass(Base):
    __tablename__ = "vessel_classes"

    id = Column(Integer, primary_key=True, index=True)
    class_name = Column(String(50), unique=True, nullable=False) # Handysize, Supramax, Panamax, Capesize
    min_dwt = Column(Float, nullable=False)
    max_dwt = Column(Float, nullable=False)
    typical_dwt = Column(Float, nullable=False)
    typical_loa = Column(Float, nullable=False)
    typical_beam = Column(Float, nullable=False)
    typical_draft = Column(Float, nullable=False)
    daily_hire_usd = Column(Float, nullable=False)
    fuel_consumption_tpd = Column(Float, default=32.0)
    description = Column(Text, nullable=True)

class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    origin_country = Column(String(100), nullable=False)
    origin_port = Column(String(100), nullable=False)
    destination_port_id = Column(Integer, ForeignKey("ports.id"), nullable=False)
    distance_nm = Column(Float, nullable=False)
    typical_days = Column(Float, nullable=False)
    weather_risk_level = Column(String(50), default="MODERATE")  # LOW, MODERATE, HIGH
    origin_lat = Column(Float, nullable=False)
    origin_lng = Column(Float, nullable=False)

    destination_port = relationship("Port", back_populates="routes")

class FreightHistory(Base):
    __tablename__ = "freight_history"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String(20), index=True, nullable=False) # YYYY-MM-DD
    origin_country = Column(String(100), nullable=False)
    origin_port = Column(String(100), nullable=False)
    destination_port = Column(String(100), nullable=False)
    vessel_class = Column(String(50), nullable=False)
    freight_rate_usd_mt = Column(Float, nullable=False)
    bunker_price_usd_ton = Column(Float, default=620.0)
    commodity_index = Column(Float, default=115.0)
    congestion_score = Column(Float, default=35.0)
    source = Column(String(100), default="HISTORICAL MARITIME BENCHMARK")

class CommodityHistory(Base):
    __tablename__ = "commodity_history"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String(20), index=True, nullable=False)
    commodity_name = Column(String(100), nullable=False)
    price_usd_mt = Column(Float, nullable=False)
    index_value = Column(Float, nullable=False)
    source = Column(String(100), default="World Bank Pink Sheet (Historical)")

class DecisionRecord(Base):
    __tablename__ = "decision_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), default="Bulk Charter Analysis")
    cargo_type = Column(String(100), nullable=False)
    cargo_mt = Column(Float, nullable=False)
    origin_country = Column(String(100), nullable=False)
    origin_port = Column(String(100), nullable=False)
    destination_port = Column(String(100), nullable=False)
    shipment_date = Column(String(20), nullable=False)
    contract_type = Column(String(100), default="Short-Term Multi-Voyage (3 Voyages)")
    num_voyages = Column(Integer, default=3)
    planning_horizon_days = Column(Integer, default=90)
    market_signal = Column(String(50), default="BOOK NOW") # BOOK NOW, WAIT, MONITOR
    recommended_vessel = Column(String(50), default="Panamax")
    optimal_window = Column(String(100), default="Within next 7-14 days")
    risk_score = Column(Float, default=28.0)
    estimated_total_cost_usd = Column(Float, default=1850000.0)
    results_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="decisions")
    reports = relationship("ReportRecord", back_populates="decision")

class ScenarioRecord(Base):
    __tablename__ = "scenario_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    parameters = Column(JSON, nullable=False)
    results = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ReportRecord(Base):
    __tablename__ = "report_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    decision_id = Column(Integer, ForeignKey("decision_records.id"), nullable=True)
    title = Column(String(255), nullable=False)
    report_type = Column(String(100), default="Chartering Decision Report")
    summary = Column(Text, nullable=True)
    file_path = Column(String(255), nullable=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="reports")
    decision = relationship("DecisionRecord", back_populates="reports")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # None means system-wide
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(50), default="info") # info, warning, danger, success
    alert_type = Column(String(100), default="freight_rate_signal")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="alerts")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    action = Column(String(100), nullable=False)
    resource = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ModelMetadata(Base):
    __tablename__ = "model_metadata"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), default="HistGradientBoosting Freight Forecaster")
    version = Column(String(50), default="v1.0.0")
    trained_at = Column(String(50), nullable=False)
    row_count = Column(Integer, default=5000)
    mae = Column(Float, default=1.12)
    rmse = Column(Float, default=1.58)
    mape = Column(Float, default=5.42)
    is_active = Column(Boolean, default=True)
    features_json = Column(JSON, nullable=True)
