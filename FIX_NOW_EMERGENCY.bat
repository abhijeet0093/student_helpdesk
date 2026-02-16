@echo off
cls
color 0C
echo ================================================================
echo EMERGENCY FIX - STUDENT COMPLAINT ACCESS
echo ================================================================
echo.
echo ERROR DETECTED: "Access denied. Admin role required"
echo.
echo This means the backend server is running OLD CODE.
echo The fix has been applied but server needs restart.
echo.
echo ================================================================
color 0E
echo.
echo STEP 1: Stopping all Node processes...
echo.
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo.
echo STEP 2: Starting backend with FIXED code...
echo.
cd backend
start cmd /k "echo BACKEND SERVER WITH FIX && echo ======================== && npm start"

timeout /t 3 >nul

color 0A
echo.
echo ================================================================
echo BACKEND RESTARTED WITH FIX
echo ================================================================
echo.
echo The middleware fix is now active!
echo.
echo NEXT STEPS:
echo 1. Wait 10 seconds for server to fully start
echo 2. Go back to browser
echo 3. Press F5 to refresh the page
echo 4. Click "Refresh" button
echo 5. Your complaints should now appear!
echo.
echo If you still see "Access denied":
echo   - Clear browser cache (Ctrl+Shift+Delete)
echo   - Logout and login again
echo   - The token might be cached
echo.
echo ================================================================
pause
