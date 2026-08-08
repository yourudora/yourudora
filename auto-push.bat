@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"

set "STATUS_FILE=%TEMP%\yurudra-auto-push-status.txt"

echo ========================================
echo  Git auto push
echo ========================================
echo.

git status --porcelain > "%STATUS_FILE%"
if errorlevel 1 goto :fail

findstr /r "." "%STATUS_FILE%" >nul
if errorlevel 1 (
  echo No changes to commit.
  goto :ok
)

echo [1/3] git add .
git add .
if errorlevel 1 goto :fail

rem Safety check: skip commit when nothing is staged
git diff --cached --quiet
if not errorlevel 1 (
  echo No changes to commit.
  goto :ok
)

echo [2/3] git commit
git commit -m "auto update"
if errorlevel 1 (
  rem Treat empty commit as success
  git status --porcelain > "%STATUS_FILE%"
  if errorlevel 1 goto :fail
  findstr /r "." "%STATUS_FILE%" >nul
  if errorlevel 1 (
    echo No changes to commit.
    goto :ok
  )
  goto :fail
)

echo [3/3] git push origin main
git push origin main
if errorlevel 1 goto :fail

echo.
echo [SUCCESS] Add / commit / push completed.
goto :end

:ok
echo.
echo [SUCCESS] No commit / push needed.
goto :end

:fail
echo.
echo [FAILED] Git operation failed. See the error above.
goto :end

:end
echo.
pause
endlocal
