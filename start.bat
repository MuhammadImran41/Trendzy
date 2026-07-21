@echo off
echo Starting Trendzy...

echo [1/2] Starting Backend...
start "Trendzy Backend" cmd /k "cd /d f:\Trendzy\glow-mart\backend && python run.py"

echo Waiting for backend to start...
timeout /t 6 /nobreak >nul

echo [2/2] Starting Frontend...
start "Trendzy Frontend" cmd /k "cd /d f:\Trendzy\glow-mart\frontend && npm start"

echo.
echo Both servers starting!
echo Backend:  http://localhost:8001
echo Frontend: http://localhost:4200
echo API Docs: http://localhost:8001/docs
echo.
