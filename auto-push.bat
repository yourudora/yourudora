@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo ========================================
echo  Git auto push
echo ========================================
echo.

echo [1/3] git add .
git add .
if errorlevel 1 goto :fail

echo [2/3] git commit
git commit -m "auto update: %date% %time%"
if errorlevel 1 goto :fail

echo [3/3] git push origin main
git push origin main
if errorlevel 1 goto :fail

echo.
echo [SUCCESS] Add / commit / push completed.
goto :end

:fail
echo.
echo [FAILED] Git operation failed. See the error above.
goto :end

:end
echo.
pause
endlocal
