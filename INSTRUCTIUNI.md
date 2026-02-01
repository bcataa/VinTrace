# 📋 Instrucțiuni de Utilizare

## 🚀 Control Server

Am creat 2 scripturi pentru controlul serverului:

### 1. Script PowerShell (Recomandat) - `server.ps1`

**Comenzi disponibile:**

```powershell
# Pornește serverul
.\server.ps1 start

# Oprește serverul
.\server.ps1 stop

# Repornește serverul
.\server.ps1 restart

# Verifică statusul serverului
.\server.ps1 status
```

**Caracteristici:**
- ✅ Verifică dacă serverul rulează deja
- ✅ Verifică dacă există fișierul `.env`
- ✅ Verifică configurarea `CAR_API_KEY`
- ✅ Afișează informații detaliate despre proces
- ✅ Verifică dacă portul 3000 este deschis

### 2. Script Batch (Simplu) - `server.bat`

**Comenzi disponibile:**

```cmd
# Pornește serverul
server.bat start

# Oprește serverul
server.bat stop

# Repornește serverul
server.bat restart

# Verifică statusul
server.bat status
```

## 📝 Pași de Configurare

1. **Creați fișierul `.env`** (dacă nu există):
   - Copiați din `.env.example`
   - Sau creați manual

2. **Adăugați token-ul CarAPI:**
   ```
   CAR_API_KEY=token_voastra_aici
   ```

3. **Porniți serverul:**
   ```powershell
   .\server.ps1 start
   ```

4. **Verificați statusul:**
   ```powershell
   .\server.ps1 status
   ```

5. **Accesați site-ul:**
   - Deschideți browserul la: http://localhost:3000

## 🔧 API-uri Secundare (Opțional)

Dacă aveți API-uri secundare pentru fallback, adăugați în `.env`:

```
CAR_API_URL_2=https://api2.example.com/api
CAR_API_KEY_2=token_api_secundar_1

CAR_API_URL_3=https://api3.example.com/api
CAR_API_KEY_3=token_api_secundar_2
```

Sistemul va încerca automat:
1. API Principal (CarAPI)
2. API Secundar 1 (dacă principalul eșuează)
3. API Secundar 2 (dacă secundarul 1 eșuează)

## 🧪 Testare API

După ce serverul rulează, testați endpoint-ul:

```powershell
# Fără parametri
Invoke-RestMethod -Uri "http://localhost:3000/api/makes"

# Cu limit
Invoke-RestMethod -Uri "http://localhost:3000/api/makes?limit=10"

# Cu limit și page
Invoke-RestMethod -Uri "http://localhost:3000/api/makes?limit=10&page=1"
```

Sau deschideți în browser:
- http://localhost:3000/api/makes
- http://localhost:3000/api/makes?limit=10&page=1

## ⚠️ Probleme Comune

**Serverul nu pornește:**
- Verificați dacă există `.env`
- Verificați dacă `CAR_API_KEY` este setată
- Verificați dacă portul 3000 este liber

**Eroare la API:**
- Verificați dacă token-ul este valid
- Verificați conexiunea la internet
- Verificați logurile serverului

**Port ocupat:**
- Opriți toate procesele Node.js: `.\server.ps1 stop`
- Sau schimbați portul în `.env`: `PORT=3001`
