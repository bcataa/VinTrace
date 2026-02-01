# Configurare CarAPI

## Pași pentru configurare

1. **Obțineți token-ul CarAPI:**
   - Accesați https://carapi.app
   - Creați un cont sau logați-vă
   - Obțineți token-ul API din dashboard

2. **Adăugați token-ul în `.env`:**
   - Creați fișierul `.env` în directorul root al proiectului (dacă nu există)
   - Adăugați linia:
     ```
     CAR_API_KEY=your_actual_token_here
     ```
   - Înlocuiți `your_actual_token_here` cu token-ul real

3. **API-uri Secundare (Opțional - Fallback):**
   - Dacă aveți API-uri secundare pentru fallback, adăugați:
     ```
     CAR_API_URL_2=https://api2.example.com/api
     CAR_API_KEY_2=your_secondary_token_1
     
     CAR_API_URL_3=https://api3.example.com/api
     CAR_API_KEY_3=your_secondary_token_2
     ```
   - Sistemul va încerca automat API-ul principal, apoi secundar 1, apoi secundar 2

3. **Restartați serverul:**
   ```bash
   npm start
   ```

## Testare endpoint

După configurare, puteți testa endpoint-ul:

```bash
# Fără parametri
curl http://localhost:3000/api/makes

# Cu limit
curl http://localhost:3000/api/makes?limit=10

# Cu limit și page
curl http://localhost:3000/api/makes?limit=10&page=1
```

Sau deschideți în browser:
- http://localhost:3000/api/makes
- http://localhost:3000/api/makes?limit=10&page=1

## Securitate

⚠️ **IMPORTANT:** Nu partajați niciodată token-ul API în cod sau în repository-uri publice. 
Folosiți întotdeauna variabile de mediu (`.env`) și asigurați-vă că `.env` este în `.gitignore`.
