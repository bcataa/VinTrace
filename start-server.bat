@echo off
REM Script pentru pornirea serverului VIN Lookup pe portul 3000
REM Oprește automat serverul când se închide scriptul

setlocal enabledelayedexpansion

REM Funcție pentru cleanup
goto :start

:cleanup
echo.
echo [INFO] Oprește serverul și eliberez portul 3000...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul
REM Oprește procesele care folosesc portul 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo [SUCCESS] Serverul a fost oprit și portul 3000 a fost eliberat.
exit /b

:start
echo.
echo ========================================
echo   VIN Lookup Server - Starting...
echo ========================================
echo.

REM Oprește orice proces Node.js existent pentru a elibera portul 3000
echo [INFO] Verific și opresc procesele Node.js existente...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Verifică dacă portul 3000 este ocupat și îl eliberează
netstat -ano | findstr :3000 >nul 2>&1
if "%ERRORLEVEL%"=="0" (
    echo [WARNING] Portul 3000 este ocupat. Încerc să eliberez portul...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
    echo [SUCCESS] Portul 3000 a fost eliberat.
)

REM Verifică dacă există .env
if not exist .env (
    echo [ERROR] Fișierul .env nu există!
    echo [INFO] Creați fișierul .env și adăugați configurațiile necesare
    pause
    exit /b 1
)

REM Pornește serverul în fereastră minimizată
echo [INFO] Pornesc serverul...
start /MIN node server.js

REM Așteaptă ca serverul să pornească
echo [INFO] Aștept ca serverul să pornească...
timeout /t 6 /nobreak >nul

REM Verifică dacă serverul a pornit
tasklist /FI "IMAGENAME eq node.exe" 2>nul | find /I /N "node.exe">nul
if "%ERRORLEVEL%"=="0" (
    echo [SUCCESS] Serverul a pornit cu succes!
) else (
    echo [ERROR] Serverul nu a putut porni!
    echo [INFO] Verificați logurile sau rulați: node server.js
    pause
    exit /b 1
)

REM Verifică dacă portul 3000 este deschis
echo.
echo [INFO] Verific portul 3000...
timeout /t 2 /nobreak >nul

REM Deschide browser-ul
echo.
echo [INFO] Deschid browser-ul...
timeout /t 1 /nobreak >nul
start http://localhost:3000

echo.
echo ========================================
echo   Serverul este gata!
echo ========================================
echo.
echo [INFO] URL: http://localhost:3000
echo [INFO] Fereastra serverului este minimizată în taskbar.
echo.
echo [IMPORTANT] Când închideți această fereastră, serverul va fi oprit automat!
echo [INFO] Apăsați orice tastă pentru a opri serverul și a închide fereastra.
echo.
pause >nul

REM Când se apasă o tastă sau se închide fereastra, execută cleanup
call :cleanup
