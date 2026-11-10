@echo off
setlocal
title OffTheGrid
cd /d "%~dp0"
curl.exe -s -o NUL --max-time 2 http://localhost:5173/ >NUL 2>&1
if %errorlevel%==0 goto open
echo Starting OffTheGrid dev server (first launch takes ~30 seconds)...
start "OffTheGrid dev" /min cmd /c "pnpm dev"
set /a tries=0
:wait
timeout /t 3 /nobreak >NUL
curl.exe -s -o NUL --max-time 3 http://localhost:5173/ >NUL 2>&1
if %errorlevel%==0 goto open
set /a tries+=1
if %tries% lss 40 goto wait
echo Could not reach the app after ~2 minutes. Check the minimized dev window for errors.
pause
exit /b 1
:open
start "" http://localhost:5173/
exit /b 0
