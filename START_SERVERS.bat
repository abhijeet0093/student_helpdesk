@echo off
echo ========================================
echo SMART CAMPUS - AUTO START
echo ========================================
echo.
echo This will start MongoDB, Backend, and Frontend
echo.
pause

echo.
echo [1/3] Starting MongoDB...
net start MongoDB
if %errorlevel% equ 0 (
    echo    ✅ MongoDB started
) else (
    echo    ⚠️  MongoDB might already be running or not installed
)
echo.

echo [2/3] Starting Backend...
echo    Opening new terminal for backend...
start cmd /k "cd backend && npm start"
echo    ✅ Backend terminal opened
echo.

timeout /t 5 /nobreak >nul

echo [3/3] Starting Frontend...
echo    Opening new terminal for frontend...
start cmd /k "cd frontend && npm start"
echo    ✅ Frontend terminal opened
echo.

echo ========================================
echo SERVERS STARTING...
echo ========================================
echo.
echo Backend will run on: http://localhost:3001
echo Frontend will run on: http://localhost:3000
echo.
echo Wait 10-15 seconds for servers to start...
echo Then open: http://localhost:3000
echo.
echo Test Credentials:
echo   Student: CS2024001 / Test@123
echo   Admin: admin / admin123
echo.
echo Press any key to close this window...
pause >nul
