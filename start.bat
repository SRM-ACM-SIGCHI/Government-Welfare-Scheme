@echo off
echo Starting Information Is Wealth platform...

:: Create python venv if it doesn't exist and run backend
echo [1/2] Starting FastAPI Backend...
start "Backend API" cmd /k "cd backend && if not exist venv (python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt) else (venv\Scripts\activate) && echo Starting uvicorn... && uvicorn app_main:app --reload --port 8000"

:: Install frontend dependencies and run Next.js
echo [2/2] Starting Next.js Frontend...
start "Frontend UI" cmd /k "cd frontend && if not exist node_modules (npm install) && echo Starting Next.js... && npm run dev"

echo.
echo Both servers are starting up directly in new windows!
echo - Backend available at: http://localhost:8000
echo - Frontend available at: http://localhost:3000
echo - API Docs available at: http://localhost:8000/docs
echo.
pause
