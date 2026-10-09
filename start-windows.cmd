@echo off
cd /d "%~dp0"
node --version
if errorlevel 1 (
  echo Hay cai Node.js 24 tro len, sau do mo lai cua so nay.
  pause
  exit /b 1
)
npm start
pause
