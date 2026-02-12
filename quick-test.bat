@echo off
echo ========================================
echo Smart Campus Helpdesk - Quick Test
echo ========================================
echo.

echo Step 1: Fixing bugs and creating test data...
node auto-bug-fix.js
echo.

echo Step 2: Running comprehensive tests...
node comprehensive-test-suite.js
echo.

echo ========================================
echo Testing Complete!
echo ========================================
echo.
echo Check the output above for results.
echo.
pause
