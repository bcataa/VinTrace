@echo off
REM Script simplu pentru deschiderea și închiderea portului 3000 (CMD)

if "%1"=="" (
    echo.
    echo Utilizare: port-3000.bat [open^|close^|status]
    echo.
    echo   open    - Deschide portul 3000 (Porneste serverul)
    echo   close   - Inchide portul 3000 (Opreste serverul)
    echo   status  - Verifica statusul portului 3000
    echo.
    exit /b 1
)

if /i "%1"=="open" goto :open
if /i "%1"=="close" goto :close
if /i "%1"=="status" goto :status

echo Eroare: Comanda invalida: %1
echo Utilizare: port-3000.bat [open^|close^|status]
exit /b 1

:open
echo.
echo ========================================
echo   Deschid portul 3000
echo ========================================
echo.

REM Verifică dacă portul este deja deschis
netstat -ano | findstr :3000 >nul 2>&1
if %ERRORLEVEL%==0 (
    echo ATENTIE: Portul 3000 este deja deschis!
    netstat -ano | findstr :3000
    echo.
    echo URL: http://localhost:3000
    goto :end
)

REM Verifică dacă există .env
if not exist .env (
    echo EROARE: Fisierul .env nu exista!
    echo   Creati fisierul .env si adaugati configuratiile necesare
    pause
    exit /b 1
)

REM Oprește procesele Node.js vechi
echo Opreste procesele Node.js vechi...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Pornește serverul
echo Pornesc serverul...
start /B node server.js
echo Astept ca serverul sa porneasca...
timeout /t 6 /nobreak >nul

REM Verifică dacă portul este deschis
netstat -ano | findstr :3000 >nul 2>&1
if %ERRORLEVEL%==0 (
    echo SUCCESS: Portul 3000 este deschis!
    echo.
    echo URL: http://localhost:3000
    echo.
    echo Deschid browser-ul...
    start http://localhost:3000
) else (
    echo EROARE: Portul 3000 nu s-a deschis!
    echo   Verificati logurile sau rulati: node server.js
)

goto :end

:close
echo.
echo ========================================
echo   Inchid portul 3000
echo ========================================
echo.

REM Găsește procesul pe portul 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    set PID=%%a
    echo Opreste procesul (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

REM Oprește toate procesele Node.js
echo Opreste toate procesele Node.js...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Verifică dacă portul este închis
netstat -ano | findstr :3000 >nul 2>&1
if %ERRORLEVEL%==0 (
    echo ATENTIE: Portul 3000 inca este deschis!
) else (
    echo SUCCESS: Portul 3000 a fost inchis!
)

goto :end

:status
echo.
echo ========================================
echo   Status port 3000
echo ========================================
echo.

REM Verifică portul
netstat -ano | findstr :3000 >nul 2>&1
if %ERRORLEVEL%==0 (
    echo Portul 3000: DESCHIS
    echo.
    echo Procese pe portul 3000:
    netstat -ano | findstr :3000
    echo.
    echo URL: http://localhost:3000
) else (
    echo Portul 3000: INCHIS
    echo   Niciun proces nu asculta pe portul 3000
)

echo.
echo Procese Node.js:
tasklist /FI "IMAGENAME eq node.exe" 2>nul | find /I /N "node.exe">nul
if %ERRORLEVEL%==0 (
    tasklist /FI "IMAGENAME eq node.exe"
) else (
    echo   Nu exista procese Node.js care ruleaza
)

goto :end

:end
echo.
pause
