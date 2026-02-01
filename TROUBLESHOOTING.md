# 🔧 Rezolvarea Problemelor

## Port 3000 nu este deschis

### Cauze posibile:

1. **Serverul nu a pornit corect**
   - Verificați dacă există erori la pornire
   - Verificați dacă fișierul `.env` există și este configurat corect

2. **Portul este ocupat de alt proces**
   - Verificați: `netstat -ano | findstr :3000`
   - Opriți procesul care ocupă portul sau schimbați portul în `.env`

3. **Baza de date nu se inițializează**
   - Verificați dacă directorul `database/` există
   - Verificați permisiunile de scriere

### Soluții:

**Soluția 1: Reporniți serverul**
```powershell
.\server.ps1 stop
.\server.ps1 start
```

**Soluția 2: Verificați logurile**
```powershell
# Porniți serverul în foreground pentru a vedea erorile
node server.js
```

**Soluția 3: Schimbați portul**
Editați `.env`:
```
PORT=3001
```

Apoi reporniți serverul.

**Soluția 4: Verificați firewall-ul**
- Asigurați-vă că Windows Firewall permite conexiunile pe portul 3000
- Sau dezactivați temporar firewall-ul pentru testare

## Eroare 503 la API

### Cauze posibile:

1. **Token-ul CarAPI nu este valid**
   - Verificați dacă token-ul este corect în `.env`
   - Verificați dacă token-ul nu a expirat

2. **Probleme de conectivitate**
   - Verificați conexiunea la internet
   - Verificați dacă https://carapi.app este accesibil

3. **API-ul CarAPI este indisponibil**
   - Verificați statusul API-ului CarAPI
   - Încercați din nou după câteva minute

### Soluții:

**Testați token-ul direct:**
```powershell
# Creați un fișier test-token.js
require('dotenv').config();
const axios = require('axios');

axios.get('https://carapi.app/api/makes', {
    headers: { 'Authorization': `Bearer ${process.env.CAR_API_KEY}` }
}).then(r => console.log('✅ Token valid')).catch(e => console.log('❌ Token invalid:', e.message));
```

## Serverul nu pornește

### Verificați:

1. **Node.js este instalat:**
   ```powershell
   node --version
   ```

2. **Dependențele sunt instalate:**
   ```powershell
   npm install
   ```

3. **Fișierul .env există:**
   ```powershell
   Test-Path .env
   ```

4. **CAR_API_KEY este setată:**
   ```powershell
   Get-Content .env | Select-String "CAR_API_KEY"
   ```

## Procese Node.js multiple

Dacă vedeți multe procese Node.js care rulează:

```powershell
# Opriți toate procesele
.\server.ps1 stop

# Sau manual:
taskkill /F /IM node.exe
```

## Verificare rapidă

```powershell
# 1. Verificați statusul
.\server.ps1 status

# 2. Verificați portul
netstat -ano | findstr :3000

# 3. Testați frontend-ul
Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing

# 4. Testați API-ul
Invoke-RestMethod -Uri "http://localhost:3000/api/makes?limit=1"
```

## 🚀 Comenzi Rapide - Pornire și Închidere Server

### PowerShell (Recomandat)

**Porniți serverul:**
```powershell
.\server.ps1 start
```

**Opriți serverul:**
```powershell
.\server.ps1 stop
```

**Reporniți serverul:**
```powershell
.\server.ps1 restart
```

**Verificați statusul:**
```powershell
.\server.ps1 status
```

**Deschideți site-ul în browser:**
```powershell
Start-Process "http://localhost:3000"
```

### Batch (CMD)

**Porniți serverul:**
```batch
server.bat start
```

**Opriți serverul:**
```batch
server.bat stop
```

**Reporniți serverul:**
```batch
server.bat restart
```

**Verificați statusul:**
```batch
server.bat status
```

**Deschideți site-ul în browser:**
```batch
start http://localhost:3000
```

### Comenzi Manuale pentru Port 3000

**Verificați dacă portul 3000 este deschis:**
```powershell
# PowerShell
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
# Sau
netstat -ano | findstr :3000
```

**Găsiți procesul care ocupă portul 3000:**
```powershell
# PowerShell
$connection = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($connection) {
    Get-Process -Id $connection.OwningProcess | Select-Object Id, ProcessName, Path
}
```

**Opriți procesul care ocupă portul 3000:**
```powershell
# PowerShell - Oprește automat procesul pe port 3000
$connection = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($connection) {
    Stop-Process -Id $connection.OwningProcess -Force
    Write-Host "Proces oprit (PID: $($connection.OwningProcess))" -ForegroundColor Green
}
```

**Opriți manual prin PID:**
```powershell
# Găsiți PID-ul
netstat -ano | findstr :3000

# Opriți procesul (înlocuiți PID cu numărul real)
taskkill /F /PID <PID>
```

**Opriți toate procesele Node.js:**
```powershell
# PowerShell
Stop-Process -Name node -Force -ErrorAction SilentlyContinue

# Batch
taskkill /F /IM node.exe
```

### Deschidere Firewall pentru Port 3000 (dacă e necesar)

**Adăugați regula în Windows Firewall:**
```powershell
# PowerShell (Administrator)
New-NetFirewallRule -DisplayName "VIN Lookup Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

**Sau manual:**
1. Deschideți "Windows Defender Firewall cu Advanced Security"
2. Click pe "Inbound Rules" → "New Rule"
3. Selectați "Port" → Next
4. Selectați "TCP" și specificați "3000" → Next
5. Selectați "Allow the connection" → Next
6. Bifați toate profilele → Next
7. Numiți regula "VIN Lookup Server" → Finish

### Verificare Completă - Secvență de Comenzi

**Pornește serverul și verifică totul:**
```powershell
# 1. Oprește procesele vechi
.\server.ps1 stop

# 2. Așteaptă 2 secunde
Start-Sleep -Seconds 2

# 3. Pornește serverul
.\server.ps1 start

# 4. Așteaptă ca serverul să pornească
Start-Sleep -Seconds 6

# 5. Verifică statusul
.\server.ps1 status

# 6. Verifică portul
netstat -ano | findstr :3000

# 7. Deschide browser-ul
Start-Process "http://localhost:3000"

# 8. Testează API-ul
Invoke-RestMethod -Uri "http://localhost:3000/api/makes?limit=1" -ErrorAction SilentlyContinue
```

**Sau într-un singur batch file (start-server-check.ps1):**
```powershell
Write-Host "🔄 Repornesc serverul..." -ForegroundColor Cyan
.\server.ps1 stop
Start-Sleep -Seconds 2
.\server.ps1 start
Start-Sleep -Seconds 6

Write-Host "`n📊 Verificare status..." -ForegroundColor Cyan
.\server.ps1 status

Write-Host "`n🌐 Deschid browser-ul..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"

Write-Host "`n✅ Gata! Site-ul ar trebui să fie deschis în browser." -ForegroundColor Green
```
