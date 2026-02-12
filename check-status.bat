@echo off
cls
echo ========================================
echo SMART CAMPUS - STATUS CHECK
echo ========================================
echo.

echo [1/5] Checking MongoDB...
net start | findstr /i "MongoDB" >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✅ MongoDB is running
) else (
    echo    ❌ MongoDB is NOT running
    echo    Fix: net start MongoDB
)
echo.

echo [2/5] Checking Backend (port 3001)...
curl -s http://localhost:3001/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✅ Backend is running
) else (
    echo    ❌ Backend is NOT running
    echo    Fix: cd backend ^&^& npm start
)
echo.

echo [3/5] Checking Frontend (port 3000)...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✅ Frontend is running
) else (
    echo    ❌ Frontend is NOT running
    echo    Fix: cd frontend ^&^& npm start
)
echo.

echo [4/6] Testing Backend API...
node test-backend-api.js
echo.

echo [5/6] Checking StudentMaster data...
cd backend
node check-studentmaster.js
cd ..
echo.

echo ========================================
echo QUICK ACTIONS
echo ========================================
echo.
echo 1. Start MongoDB:     net start MongoDB
echo 2. Start Backend:     cd backend ^&^& npm start
echo 3. Start Frontend:    cd frontend ^&^& npm start
echo 4. Seed Database:     cd backend ^&^& node scripts/seedAdmin.js
echo 5. Test Login:        Open test-login.html in browser
echo.
echo Test Credentials:
echo   Student: CS2024001 / Test@123
echo   Admin: admin / admin123
echo   Staff: rajesh.staff@college.edu / staff123
echo.
pause
