@echo off
echo ========================================
echo Starting All Servers for BRD4
echo ========================================
echo.
echo This will open TWO terminal windows:
echo 1. Python Backend (Port 5000)
echo 2. Frontend (Port 5173/5025)
echo.
echo IMPORTANT: Keep both windows open!
echo ========================================
echo.

REM Start Python Backend in new window
echo Starting Python Backend...
start "Python Backend - Port 5000" cmd /k "cd /d "%~dp0python-backend" && start-backend.bat"

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start Frontend in new window
echo Starting Frontend...
start "Frontend - Port 5173/5025" cmd /k "cd /d "%~dp0" && npm run dev"

echo.
echo ========================================
echo Both servers are starting!
echo ========================================
echo.
echo Check the two new terminal windows that opened.
echo.
echo Once both are running, open your browser:
echo http://localhost:5173
echo.
echo Press any key to close this window...
pause >nul
