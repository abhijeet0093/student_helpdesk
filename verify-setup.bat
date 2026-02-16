@echo off
cls
echo ================================================================
echo VERIFYING SETUP - Student Complaint Access
echo ================================================================
echo.

echo Checking if backend is running...
curl -s http://localhost:3001/api/health >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Backend is running on port 3001
) else (
    echo [FAIL] Backend is NOT running!
    echo.
    echo Please start backend:
    echo   cd backend
    echo   npm start
    echo.
    pause
    exit /b 1
)

echo.
echo Checking middleware file...
findstr /C:"console.log('=== VERIFY STUDENT DEBUG ===')" backend\middleware\authMiddleware.js >nul
if %errorlevel% == 0 (
    echo [OK] Debug logging is present in middleware
) else (
    echo [FAIL] Middleware file doesn't have debug logging
    echo The file might not be saved correctly
)

echo.
echo Checking controller file...
findstr /C:"console.log('=== GET MY COMPLAINTS DEBUG ===')" backend\controllers\complaintController.js >nul
if %errorlevel% == 0 (
    echo [OK] Debug logging is present in controller
) else (
    echo [FAIL] Controller file doesn't have debug logging
)

echo.
echo Checking routes file...
findstr /C:"verifyStudent" backend\routes\complaintRoutes.js >nul
if %errorlevel% == 0 (
    echo [OK] Routes use verifyStudent middleware
) else (
    echo [FAIL] Routes file might be incorrect
)

echo.
echo ================================================================
echo NEXT STEPS:
echo ================================================================
echo.
echo 1. If backend is NOT running:
echo    - Open Command Prompt
echo    - cd backend
echo    - npm start
echo.
echo 2. If backend IS running but no debug logs appear:
echo    - Stop backend (Ctrl+C)
echo    - Start again: npm start
echo.
echo 3. Test in browser:
echo    - Login as student (CS2021001 / password123)
echo    - Go to "My Complaints"
echo    - Watch backend console for debug messages
echo.
echo 4. Check browser console (F12):
echo    - Run: localStorage.getItem('token')
echo    - Decode token to check role
echo.
echo ================================================================
pause
