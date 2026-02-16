@echo off
cls
echo ============================================================
echo RESTARTING BACKEND WITH DEBUG LOGGING
echo ============================================================
echo.
echo Debug logging has been added to:
echo   - Middleware (verifyStudent)
echo   - Create Complaint
echo   - Get My Complaints
echo.
echo This will help identify why complaints aren't showing.
echo.
echo ============================================================
pause

cd backend

echo.
echo Stopping any running Node processes...
taskkill /F /IM node.exe 2>nul

echo.
echo Starting backend with debug logging...
echo.
echo WATCH THE CONSOLE OUTPUT CAREFULLY!
echo.
echo When you:
echo   1. Create a complaint - Watch for "CREATE COMPLAINT DEBUG"
echo   2. View complaints - Watch for "GET MY COMPLAINTS DEBUG"
echo.
echo ============================================================
echo.

start cmd /k "npm start"

echo.
echo Backend is starting in a new window...
echo.
echo NEXT STEPS:
echo 1. Watch the backend console window
echo 2. Login as student (CS2021001 / password123)
echo 3. Create a test complaint
echo 4. Go to "My Complaints"
echo 5. Check what the console shows
echo.
echo If complaints still don't show, share the console output.
echo.
pause
