import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.app.core.config import settings
from backend.app.api.v1.api import api_router
from backend.app.seed.seed_data import seed_database
from backend.app.database.session import Base, engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables exist and database is seeded
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "PortIN: Enterprise Maritime Freight Forecasting & Chartering Decision Support Platform "
        "for Raw Material Logistics and Bulk Cargo Procurement."
    ),
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan
)

# Also ensure table creation at import time for SQLite
Base.metadata.create_all(bind=engine)
seed_database()

from backend.app.api.v1.endpoints import auth

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure reports directory exists
os.makedirs("reports", exist_ok=True)
app.mount("/reports", StaticFiles(directory="reports"), name="reports")

app.include_router(api_router, prefix=settings.API_V1_STR)
# Direct auth route fallback to support requests with or without /api/v1 prefix
app.include_router(auth.router, prefix="/auth", tags=["Authentication Direct"])

@app.get("/")
def root():
    return {
        "project": "PortIN",
        "title": "Enterprise Maritime Freight Forecasting & Vessel Chartering Platform",
        "organization": "Steel Authority of India Limited (SAIL)",
        "version": settings.VERSION,
        "docs": f"{settings.API_V1_STR}/docs",
        "status": "OPERATIONAL"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "portin-backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
