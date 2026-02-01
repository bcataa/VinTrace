# Script pentru pornirea serverului și deschiderea browser-ului
Write-Host "🚀 Pornesc serverul VIN Lookup..." -ForegroundColor Cyan
Write-Host ""

# Verifică dacă serverul rulează deja
$existingProcess = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
    $_.MainWindowTitle -eq "" -or $_.MainWindowTitle -eq $null
}

if ($existingProcess) {
    Write-Host "⚠️  Serverul rulează deja (PID: $($existingProcess.Id))" -ForegroundColor Yellow
    Write-Host "   URL: http://localhost:3000" -ForegroundColor Cyan
    Start-Sleep -Seconds 1
} else {
    # Pornește serverul
    Write-Host "📡 Pornesc serverul..." -ForegroundColor Green
    
    # Verifică dacă există .env
    if (-not (Test-Path .env)) {
        Write-Host "❌ EROARE: Fișierul .env nu există!" -ForegroundColor Red
        Write-Host "   Creați fișierul .env și adăugați configurațiile necesare" -ForegroundColor Yellow
        exit 1
    }
    
    # Pornește serverul în background
    Start-Process -FilePath "node" -ArgumentList "server.js" -WindowStyle Hidden
    
    # Așteaptă ca serverul să pornească
    Write-Host "⏳ Aștept ca serverul să pornească..." -ForegroundColor Gray
    Start-Sleep -Seconds 6
    
    # Verifică dacă serverul a pornit
    $process = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
        $_.MainWindowTitle -eq "" -or $_.MainWindowTitle -eq $null
    }
    
    if ($process) {
        Write-Host "✅ Serverul a pornit cu succes!" -ForegroundColor Green
        Write-Host "   PID: $($process.Id)" -ForegroundColor Gray
    } else {
        Write-Host "❌ EROARE: Serverul nu a putut porni!" -ForegroundColor Red
        Write-Host "   Verificați logurile sau rulați: node server.js" -ForegroundColor Yellow
        exit 1
    }
}

# Verifică dacă portul 3000 este deschis
Write-Host ""
Write-Host "🔍 Verific portul 3000..." -ForegroundColor Cyan
$port = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port) {
    Write-Host "✅ Port 3000: Deschis" -ForegroundColor Green
} else {
    Write-Host "⚠️  Port 3000: Nu este deschis încă. Așteptați câteva secunde..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
}

# Deschide browser-ul
Write-Host ""
Write-Host "🌐 Deschid browser-ul..." -ForegroundColor Cyan
Start-Sleep -Seconds 1
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "✅ Gata! Site-ul ar trebui să fie deschis în browser." -ForegroundColor Green
Write-Host ""
Write-Host "📌 Informații utile:" -ForegroundColor Cyan
Write-Host "   - URL: http://localhost:3000" -ForegroundColor White
Write-Host "   - Pentru a opri serverul: .\server.ps1 stop" -ForegroundColor Gray
Write-Host "   - Pentru status: .\server.ps1 status" -ForegroundColor Gray
Write-Host ""
