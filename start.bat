@echo off
echo =========================================================================
echo              PortIN - Maritime Freight Intelligence Platform
echo         Smart India Hackathon 2026 - Problem Statement 26006
echo                    Ministry of Steel / SAIL
echo =========================================================================
echo.

echo [1/2] Starting PortIN FastAPI Backend on http://localhost:8000 ...
start "PortIN Backend" cmd /k "python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [2/2] Starting PortIN React Frontend on http://localhost:5173 ...
cd frontend
start "PortIN Frontend" cmd /k "npm run dev"

echo.
echo =========================================================================
echo Both services launched!
echo - Web Application: http://localhost:5173
echo - API Documentation: http://localhost:8000/api/v1/docs
echo.
echo Demo Credentials:
echo - Analyst: analyst@sail.gov.in / Analyst@PortIN2026
echo - Admin:   admin@portin.sail.gov.in / Admin@PortIN2026
echo =========================================================================
pause
