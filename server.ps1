# Script pentru controlul serverului
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("start", "stop", "restart", "status")]
    [string]$Action
)

$ErrorActionPreference = "Continue"

function Start-Server {
    Write-Host "Pornesc serverul..." -ForegroundColor Green
    
    # Verifică dacă serverul rulează deja
    $existingProcess = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
        $_.MainWindowTitle -eq "" -or $_.MainWindowTitle -eq $null
    }
    
    if ($existingProcess) {
        Write-Host "ATENTIE: Serverul ruleaza deja (PID: $($existingProcess.Id))" -ForegroundColor Yellow
        return
    }
    
    # Verifică dacă există .env
    if (-not (Test-Path .env)) {
        Write-Host "EROARE: Fisierul .env nu exista!" -ForegroundColor Red
        Write-Host "   Creati fisierul .env si adaugati CAR_API_KEY" -ForegroundColor Yellow
        return
    }
    
    # Verifică dacă CAR_API_KEY este setată
    $envContent = Get-Content .env -ErrorAction SilentlyContinue
    $hasApiKey = $envContent | Select-String -Pattern "CAR_API_KEY\s*=\s*\S+" -Quiet
    
    if (-not $hasApiKey) {
        Write-Host "ATENTIE: CAR_API_KEY nu pare sa fie configurata in .env" -ForegroundColor Yellow
    }
    
    # Pornește serverul în background
    Start-Process -FilePath "node" -ArgumentList "server.js" -WindowStyle Hidden
    
    # Așteaptă mai mult timp pentru inițializarea bazei de date
    Start-Sleep -Seconds 4
    
    # Verifică dacă serverul a pornit
    $process = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
        $_.MainWindowTitle -eq "" -or $_.MainWindowTitle -eq $null
    }
    
    if ($process) {
        Write-Host "SUCCESS: Serverul a pornit cu succes!" -ForegroundColor Green
        Write-Host "   PID: $($process.Id)" -ForegroundColor Gray
        Write-Host "   URL: http://localhost:3000" -ForegroundColor Cyan
    } else {
        Write-Host "EROARE: Serverul nu a putut porni. Verificati logurile." -ForegroundColor Red
    }
}

function Stop-Server {
    Write-Host "Opreste serverul..." -ForegroundColor Yellow
    
    $processes = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
        $_.MainWindowTitle -eq "" -or $_.MainWindowTitle -eq $null
    }
    
    if ($processes) {
        $processes | ForEach-Object {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            Write-Host "   Proces oprit (PID: $($_.Id))" -ForegroundColor Green
        }
        Write-Host "SUCCESS: Serverul a fost oprit!" -ForegroundColor Green
    } else {
        Write-Host "INFO: Nu exista procese Node.js care ruleaza" -ForegroundColor Gray
    }
}

function Restart-Server {
    Write-Host "Repornesc serverul..." -ForegroundColor Cyan
    Stop-Server
    Start-Sleep -Seconds 1
    Start-Server
}

function Get-ServerStatus {
    Write-Host "Status server..." -ForegroundColor Cyan
    
    $processes = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
        $_.MainWindowTitle -eq "" -or $_.MainWindowTitle -eq $null
    }
    
    if ($processes) {
        Write-Host "SUCCESS: Serverul ruleaza" -ForegroundColor Green
        $processes | ForEach-Object {
            Write-Host "   PID: $($_.Id)" -ForegroundColor Gray
            Write-Host "   CPU: $([math]::Round($_.CPU, 2))s" -ForegroundColor Gray
            Write-Host "   Memory: $([math]::Round($_.WorkingSet64 / 1MB, 2)) MB" -ForegroundColor Gray
        }
        
        # Verifică dacă portul 3000 este deschis
        $port = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
        if ($port) {
            Write-Host "   Port 3000: Deschis" -ForegroundColor Green
            Write-Host "   URL: http://localhost:3000" -ForegroundColor Cyan
        } else {
            Write-Host "   Port 3000: Nu este deschis" -ForegroundColor Red
        }
    } else {
        Write-Host "EROARE: Serverul nu ruleaza" -ForegroundColor Red
    }
}

# Execută acțiunea
switch ($Action.ToLower()) {
    "start" { Start-Server }
    "stop" { Stop-Server }
    "restart" { Restart-Server }
    "status" { Get-ServerStatus }
}
