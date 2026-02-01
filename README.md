# 🚗 VIN Decoder - Vehicle Identification Number Decoder

Site modern și profesional pentru decodarea numerelor VIN (Vehicle Identification Number).

## ✨ Caracteristici

- ✅ Decodare VIN completă și rapidă
- ✅ Interfață modernă cu dark theme premium
- ✅ Design responsive (funcționează pe toate dispozitivele)
- ✅ Layout optimizat cu 4 coloane pentru rezultate
- ✅ Animații smooth și profesionale
- ✅ Date de la freevindecoder.eu (100% gratuit)
- ✅ Fără necesitate de API keys

## 🚀 Publicare Rapidă

**Totul este pregătit pentru deployment!**

Vezi fișierul **`PUBLICARE-SIMPLU.md`** pentru pașii exacti de publicare pe Render.com (gratuit).

## 📋 Instalare Locală

1. **Instalează dependențele:**
```bash
npm install
```

2. **Pornește serverul:**
```bash
npm start
```

3. **Deschide browserul:**
```
http://localhost:3000
```

## 🛠️ Tehnologii

- **Backend:** Node.js + Express
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Database:** SQLite
- **Scraping:** Cheerio + Axios
- **Deployment:** Ready pentru Render.com, Railway.app, Vercel

## 📁 Structura Proiectului

```
├── server.js              # Server principal Express
├── package.json           # Dependențe Node.js
├── database/
│   └── db.js             # Configurare baza de date SQLite
├── routes/
│   ├── vin.js            # Rute API pentru VIN
│   └── carAPI.js         # Rute API pentru CarAPI
├── services/
│   ├── vinAPI.js         # Scraping de pe freevindecoder.eu
│   └── vinService.js     # Logică business pentru VIN
├── public/
│   ├── index.html        # Frontend principal
│   ├── app.js            # JavaScript frontend
│   └── styles.css        # Stiluri CSS
└── render.yaml           # Configurare Render.com
```

## 🌐 Deployment

### Render.com (Recomandat)
- Vezi `PUBLICARE-SIMPLU.md` pentru pașii exacti
- Gratuit, HTTPS inclus, SQLite suportat

### Railway.app
- Deploy automat din GitHub
- $5 credit/lună gratuit

### Vercel
- Suport pentru serverless functions
- Configurare în `vercel.json`

## 📝 Note

- **Nu sunt necesare API keys** - site-ul folosește doar scraping de pe freevindecoder.eu
- **SQLite** funcționează perfect pe toate platformele cloud
- **HTTPS** este inclus automat pe toate platformele
- **Cold starts** pe planul gratuit pot dura 15-30s (normal)

## 📄 Licență

ISC

## 👨‍💻 Autor

VIN Decoder - Vehicle Identification Number Decoder
