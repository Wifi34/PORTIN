from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.app.core.config import settings
import logging

logger = logging.getLogger("portin.database")

Base = declarative_base()

def get_engine():
    target_url = settings.DATABASE_URL
    if target_url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
    else:
        # Fast 3-second connect timeout so if remote Supabase DB is blocked/firewalled,
        # it quickly falls back to high-performance local SQLite without delaying server start
        connect_args = {"connect_timeout": 3}
    try:
        eng = create_engine(
            target_url,
            connect_args=connect_args,
            pool_pre_ping=True
        )
        # Test connection
        with eng.connect() as conn:
            pass
        logger.info(f"Database connected successfully to {target_url.split('@')[-1] if '@' in target_url else target_url}")
        return eng
    except Exception as e:
        logger.warning(f"Database connection to {target_url} failed: {e}. Gracefully falling back to local SQLite.")
        sqlite_url = "sqlite:///./portin.db"
        return create_engine(sqlite_url, connect_args={"check_same_thread": False}, pool_pre_ping=True)

engine = get_engine()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
