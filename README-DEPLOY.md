# 🚀 VIN Decoder - Deployment Guide

## Quick Deploy pe Render.com (Recomandat)

### Pasul 1: Pregătește Repository-ul

```bash
# Asigură-te că ai un .gitignore care exclude .env
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Pasul 2: Deploy pe Render

1. **Creează cont:** [render.com](https://render.com) → Sign Up (cu GitHub)

2. **New Web Service:**
   - Click "New" → "Web Service"
   - Conectează repository-ul GitHub
   - Selectează branch-ul (de obicei `main`)

3. **Configurează:**
   - **Name:** `vin-decoder` (sau orice nume vrei)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** `Free`

4. **Environment Variables:**
   Click "Advanced" și adaugă:
   ```
   NODE_ENV=production
   PORT=10000
   ```
   
   (Opțional - dacă ai API keys):
   ```
   API_NINJAS_KEY=your_key_here
   VINCARIO_API_KEY=your_key_here
   ```

5. **Deploy!**
   - Click "Create Web Service"
   - Așteaptă ~5 minute pentru build
   - URL-ul tău: `https://vin-decoder.onrender.com`

### Pasul 3: Testează

Deschide URL-ul în browser și testează cu un VIN:
```
W0LJC7E89GB611600
```

## 🎨 Design Inspirat din FreeVINCheck

Aplicația are deja un design modern și profesional:
- ✅ Dark theme premium
- ✅ Layout cu 4 coloane pentru rezultate
- ✅ Animații smooth
- ✅ Responsive design
- ✅ Interfață curată și intuitivă

## 📋 Alte Platforme

### Railway.app
1. Sign up cu GitHub
2. New Project → Deploy from GitHub
3. Selectează repo
4. Adaugă env vars
5. Deploy automat!

### Fly.io
```bash
fly launch
fly deploy
```

## ⚙️ Configurare

### Environment Variables (Opțional)

Dacă vrei să folosești API-uri externe, adaugă în Render/Railway:

```env
API_NINJAS_KEY=your_key
VINCARIO_API_KEY=your_key
```

**Notă:** Aplicația funcționează și fără aceste keys, folosind scraping de pe freevindecoder.eu.

## 🔧 Troubleshooting

### Serverul nu pornește
- Verifică logs în Render dashboard
- Asigură-te că `PORT` este setat corect
- Verifică că toate dependențele sunt instalate

### Erori de database
- SQLite funcționează pe Render
- Verifică permisiunile de scriere

### Cold starts
- Render free tier are cold starts (15-30s)
- Upgrade la paid plan pentru instant start

## 📞 Suport

Pentru probleme:
1. Verifică logs pe platformă
2. Testează local: `npm start`
3. Verifică Environment Variables
