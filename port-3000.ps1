# Script simplu pentru deschiderea și închiderea portului 3000
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("open", "close", "status")]
    [string]$Action
)

$ErrorActionPreference = "Continue"

function Open-Port {
    Write-Host "Deschid portul 3000 (Pornesc serverul)..." -ForegroundColor Green
    
    # Verifică dacă portul este deja deschis
    $existingConnection = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($existingConnection) {
        $process = Get-Process -Id $existingConnection.OwningProcess -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "⚠️  Portul 3000 este deja deschis!" -ForegroundColor Yellow
            Write-Host "   Proces: $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Gray
            Write-Host "   URL: http://localhost:3000" -ForegroundColor Cyan
            return
        }
    }
    
    # Verifică dacă există .env
    if (-not (Test-Path .env)) {
        Write-Host "EROARE: Fisierul .env nu exista!" -ForegroundColor Red
        Write-Host "   Creati fisierul .env si adaugati configuratiile necesare" -ForegroundColor Yellow
        return
    }
    
    # Oprește procesele Node.js vechi (dacă există)
    $oldProcesses = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
        $_.MainWindowTitle -eq "" -or $_.MainWindowTitle -eq $null
    }
    if ($oldProcesses) {
        Write-Host "Opreste procesele Node.js vechi..." -ForegroundColor Yellow
        $oldProcesses | ForEach-Object {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        }
        Start-Sleep -Seconds 2
    }
    
    # Porneste serverul
    Write-Host "Pornesc serverul..." -ForegroundColor Cyan
    Start-Process -FilePath "node" -ArgumentList "server.js" -WindowStyle Hidden
    
    # Asteapta ca serverul sa porneasca
    Write-Host "Astept ca serverul sa porneasca..." -ForegroundColor Gray
    Start-Sleep -Seconds 6
    
    # Verifică dacă portul este deschis acum
    $connection = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
        if ($connection) {
            $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
            Write-Host "SUCCESS: Portul 3000 este deschis!" -ForegroundColor Green
            Write-Host "   Proces: $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Gray
            Write-Host "   URL: http://localhost:3000" -ForegroundColor Cyan
            
            # Deschide browser-ul
            Write-Host ""
            Write-Host "Deschid browser-ul..." -ForegroundColor Cyan
            Start-Process "http://localhost:3000"
        } else {
            Write-Host "EROARE: Portul 3000 nu s-a deschis!" -ForegroundColor Red
            Write-Host "   Verificati logurile sau rulati: node server.js" -ForegroundColor Yellow
        }
}

function Close-Port {
    Write-Host "Inchid portul 3000 (Opreste serverul)..." -ForegroundColor Yellow
    
    # Găsește procesul care ocupă portul 3000
    $connection = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    
    if ($connection) {
        $processId = $connection.OwningProcess
        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        
        if ($process) {
            Write-Host "🛑 Oprește procesul (PID: $processId)..." -ForegroundColor Yellow
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
            
            # Verifică dacă a fost oprit
            $stillRunning = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
            if (-not $stillRunning) {
                Write-Host "✅ SUCCESS: Portul 3000 a fost închis!" -ForegroundColor Green
            } else {
                Write-Host "Procesul inca ruleaza. Incearca fortat..." -ForegroundColor Yellow
                taskkill /F /IM node.exe >$null 2>&1
                Start-Sleep -Seconds 2
                
                $stillRunning = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
                if (-not $stillRunning) {
                    Write-Host "SUCCESS: Portul 3000 a fost inchis!" -ForegroundColor Green
                } else {
                    Write-Host "EROARE: Nu pot inchide portul 3000!" -ForegroundColor Red
                }
            }
        } else {
            Write-Host "Procesul nu mai exista, dar portul este inca deschis." -ForegroundColor Yellow
            taskkill /F /IM node.exe >$null 2>&1
        }
    } else {
        Write-Host "Portul 3000 este deja inchis sau nu este deschis." -ForegroundColor Gray
    }
    
    # Oprește toate procesele Node.js (dacă există)
    $processes = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
        $_.MainWindowTitle -eq "" -or $_.MainWindowTitle -eq $null
    }
    if ($processes) {
        Write-Host "Opreste procesele Node.js ramase..." -ForegroundColor Yellow
        $processes | ForEach-Object {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            Write-Host "   Proces oprit (PID: $($_.Id))" -ForegroundColor Gray
        }
        Start-Sleep -Seconds 1
        Write-Host "SUCCESS: Toate procesele Node.js au fost oprite!" -ForegroundColor Green
    }
}

function Get-PortStatus {
    Write-Host "Status port 3000..." -ForegroundColor Cyan
    Write-Host ""
    
    $connection = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    
    if ($connection) {
        $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "Portul 3000: DESCHIS" -ForegroundColor Green
            Write-Host "   Proces: $($process.ProcessName)" -ForegroundColor Gray
            Write-Host "   PID: $($process.Id)" -ForegroundColor Gray
            Write-Host "   Memorie: $([math]::Round($process.WorkingSet64 / 1MB, 2)) MB" -ForegroundColor Gray
            Write-Host "   URL: http://localhost:3000" -ForegroundColor Cyan
        } else {
            Write-Host "Portul 3000: Deschis, dar procesul nu exista" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Portul 3000: INCHIS" -ForegroundColor Red
        Write-Host "   Niciun proces nu asculta pe portul 3000" -ForegroundColor Gray
    }
    
    # Verifica procesele Node.js
    Write-Host ""
    Write-Host "Procese Node.js:" -ForegroundColor Cyan
    $nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
        $_.MainWindowTitle -eq "" -or $_.MainWindowTitle -eq $null
    }
    if ($nodeProcesses) {
        $nodeProcesses | ForEach-Object {
            Write-Host "   PID: $($_.Id) | Memorie: $([math]::Round($_.WorkingSet64 / 1MB, 2)) MB" -ForegroundColor Gray
        }
    } else {
        Write-Host "   Nu exista procese Node.js care ruleaza" -ForegroundColor Gray
    }
}

# Execută acțiunea
switch ($Action.ToLower()) {
    "open" { Open-Port }
    "close" { Close-Port }
    "status" { Get-PortStatus }
    default {
        Write-Host "Eroare: Actiune invalida: $Action" -ForegroundColor Red
        Write-Host ""
        Write-Host "Utilizare: .\port-3000.ps1 [open|close|status]" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  open    - Deschide portul 3000 (Porneste serverul)" -ForegroundColor White
        Write-Host "  close   - Inchide portul 3000 (Opreste serverul)" -ForegroundColor White
        Write-Host "  status  - Verifica statusul portului 3000" -ForegroundColor White
    }
}
