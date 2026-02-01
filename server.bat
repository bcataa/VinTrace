@echo off
REM Script simplu pentru controlul serverului (Windows Batch)

if "%1"=="" (
    echo.
    echo Usage: server.bat [start^|stop^|restart^|status]
    echo.
    echo   start    - Porneste serverul
    echo   stop     - Opreste serverul
    echo   restart  - Reporneste serverul
    echo   status   - Afiseaza statusul serverului
    echo.
    exit /b 1
)

if /i "%1"=="start" (
    echo Pornesc serverul...
    start /B node server.js
    timeout /t 2 /nobreak >nul
    echo Serverul a fost pornit!
    echo Accesati: http://localhost:3000
    goto :end
)

if /i "%1"=="stop" (
    echo Opreste serverul...
    taskkill /F /IM node.exe >nul 2>&1
    echo Serverul a fost oprit!
    goto :end
)

if /i "%1"=="restart" (
    echo Repornesc serverul...
    taskkill /F /IM node.exe >nul 2>&1
    timeout /t 1 /nobreak >nul
    start /B node server.js
    timeout /t 2 /nobreak >nul
    echo Serverul a fost repornit!
    goto :end
)

if /i "%1"=="status" (
    echo Verific statusul serverului...
    tasklist /FI "IMAGENAME eq node.exe" 2>nul | find /I /N "node.exe">nul
    if "%ERRORLEVEL%"=="0" (
        echo Serverul ruleaza!
        tasklist /FI "IMAGENAME eq node.exe"
    ) else (
        echo Serverul NU ruleaza.
    )
    goto :end
)

echo Comanda invalida: %1
exit /b 1

:end
