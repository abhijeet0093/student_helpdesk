@echo off
echo ========================================
echo LOGIN DIAGNOSTIC TOOL
echo ========================================
echo.

echo Step 1: Checking if MongoDB is running...
echo.
net start | findstr /i "MongoDB"
if %errorlevel% equ 0 (
    echo [OK] MongoDB service is running
) else (
    echo [ERROR] MongoDB is NOT running!
    echo.
    echo Fix: Run this command:
    echo    net start MongoDB
    echo.
    pause
    exit /b 1
)
echo.

echo Step 2: Checking if backend is running...
echo.
curl -s http://localhost:3001/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backend is running on port 3001
) else (
    echo [ERROR] Backend is NOT running!
    echo.
    echo Fix: Open a terminal and run:
    echo    cd backend
    echo    npm start
    echo.
    pause
    exit /b 1
)
echo.

echo Step 3: Checking if frontend is running...
echo.
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Frontend is running on port 3000
) else (
    echo [ERROR] Frontend is NOT running!
    echo.
    echo Fix: Open a terminal and run:
    echo    cd frontend
    echo    npm start
    echo.
    pause
    exit /b 1
)
echo.

echo Step 4: Testing database connection...
echo.
cd backend
node test-connection.js
cd ..
echo.

echo ========================================
echo DIAGNOSTIC COMPLETE
echo ========================================
echo.
echo If all checks passed, try logging in again.
echo.
echo Test Credentials:
echo   Student: CS2024001 / Test@123
echo   Admin: admin / admin123
echo   Staff: rajesh.staff@college.edu / staff123
echo.
pause
