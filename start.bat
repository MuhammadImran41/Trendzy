@echo off
echo Starting Trendzy...

echo [1/2] Starting Backend...
start "Trendzy Backend" cmd /k "cd /d f:\Trendzy\glow-mart\backend && python run.py"

timeout /t 4 /nobreak >nul

echo [2/2] Starting Frontend...
start "Trendzy Frontend" cmd /k "cd /d f:\Trendzy\glow-mart\frontend && npm start -- --proxy-config proxy.conf.json"

echo.
echo Both servers starting...
echo Backend:  http://localhost:8001
echo Frontend: http://localhost:4200
echo.
pause
