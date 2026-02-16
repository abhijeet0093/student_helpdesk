@echo off
echo ========================================
echo RESTARTING BACKEND SERVER
echo ========================================
echo.
echo Complaint access fix has been applied.
echo Restarting server to apply changes...
echo.

cd backend

echo Stopping any running Node processes...
taskkill /F /IM node.exe 2>nul

echo.
echo Starting backend server...
echo.

start cmd /k "npm start"

echo.
echo ========================================
echo Backend server is starting...
echo ========================================
echo.
echo The server should be running on:
echo http://localhost:3001
echo.
echo Test the fix by:
echo 1. Login as student
echo 2. Create a complaint
echo 3. View "My Complaints"
echo 4. Should see complaints without errors
echo.
pause
