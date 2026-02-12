@echo off
cls
echo ========================================
echo FIX REGISTRATION ERROR
echo ========================================
echo.
echo This will seed StudentMaster data
echo so you can register students.
echo.
pause

echo.
echo [1/3] Checking if backend is running...
curl -s http://localhost:3001/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✅ Backend is running
) else (
    echo    ❌ Backend is NOT running!
    echo.
    echo    Please start backend first:
    echo    cd backend
    echo    npm start
    echo.
    pause
    exit /b 1
)
echo.

echo [2/3] Seeding StudentMaster data...
cd backend
node scripts/seedStudentMaster.js
if %errorlevel% equ 0 (
    echo    ✅ StudentMaster seeded successfully
) else (
    echo    ❌ Failed to seed StudentMaster
    echo.
    echo    Make sure MongoDB is running:
    echo    net start MongoDB
    echo.
    pause
    exit /b 1
)
cd ..
echo.

echo [3/3] Checking StudentMaster data...
cd backend
node check-studentmaster.js
cd ..
echo.

echo ========================================
echo REGISTRATION FIXED!
echo ========================================
echo.
echo Now you can register at: http://localhost:3000/register
echo.
echo Use these EXACT details:
echo.
echo Roll Number:       CS2024001
echo Enrollment Number: EN2024CS001
echo Full Name:         RAHUL KUMAR SHARMA
echo Date of Birth:     2003-05-15
echo Password:          Test@123
echo Confirm Password:  Test@123
echo.
echo After registration, login with:
echo   Roll Number: CS2024001
echo   Password: Test@123
echo.
echo For more students, check the output above!
echo.
pause
