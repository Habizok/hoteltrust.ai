# Audit Funkció API és Adatkövetelmények

## 📋 Összefoglalás

Az audit funkció működéséhez a következő API-k és adatok szükségesek:

---

## 🔑 Szükséges API-k

### 1. **Google Places API** (Kötelező)
**Cél:** Hotel keresés és adatok lekérése

**Szükséges szolgáltatások:**
- **Places Autocomplete API** - Hotel keresés autocomplete-hez
- **Places Details API** - Hotel részletes adatok (név, cím, telefonszám, weboldal)
- **Places API (New)** - Google Place ID lekérése

**Kulcs információk:**
- API Key szükséges a Google Cloud Console-ból
- Engedélyezni kell a "Places API" szolgáltatást
- Költség: ~$17 per 1000 kérés (autocomplete), ~$17 per 1000 kérés (details)

**Alternatíva (olcsóbb):**
- **Outscraper Google Maps API** - $0.50 per 1000 kérés
- **Apify Google Maps Scraper** - Használati alapú árazás

---

### 2. **Google Reviews Scraper API** (Kötelező)
**Cél:** Hotel vélemények lekérése a Google Maps-ről

**Lehetőségek:**
- **Outscraper Google Reviews API** - $0.50 per 1000 vélemény
- **Apify Google Maps Reviews Scraper** - Használati alapú
- **SerpApi Google Reviews** - $50/5000 kérés

**Szükséges adatok:**
- Utolsó 10-20 vélemény szövege
- Csillag értékelések
- Dátumok
- Válaszolt/nem válaszolt státusz

---

### 3. **OpenAI API** (Kötelező)
**Cél:** AI elemzés és válasz generálás

**Szükséges:**
- **GPT-4o-mini** (ajánlott - olcsóbb) vagy **GPT-4o**
- API Key az OpenAI-tól
- Költség: ~$0.15-0.60 per 1M token (GPT-4o-mini)

**Használat:**
- Hotel adatok elemzése
- Trust Score kalkulálás
- Példa válasz generálás a véleményekre
- Kritikus hibák azonosítása

---

### 4. **Web Scraping API** (Opcionális, de ajánlott)
**Cél:** Hotel weboldal adatainak kinyerése

**Lehetőségek:**
- **ScraperAPI** - $49/hó (unlimited)
- **Apify Web Scraper** - Használati alapú
- **Bright Data** - Enterprise szintű

**Szükséges információk:**
- Wellness szolgáltatások
- Szobák, árak
- Nyitvatartás
- Egyéb szolgáltatások

---

## 📊 Szükséges Adatok

### Input adatok (felhasználótól):
1. **Hotel neve** (vagy Google Place ID)
2. **Email cím** (jelentés küldéséhez)

### Lekért adatok (API-kból):

#### Google Places API-ból:
- ✅ Hotel neve
- ✅ Cím (teljes cím)
- ✅ Telefonszám
- ✅ Weboldal URL
- ✅ Google Place ID
- ✅ Koordináták (lat/lng)
- ✅ Nyitvatartás
- ✅ Átlagos értékelés
- ✅ Összes értékelés száma

#### Google Reviews API-ból:
- ✅ Utolsó 10-20 vélemény:
  - Szöveg
  - Csillag értékelés (1-5)
  - Dátum
  - Válaszolt/nem válaszolt státusz
  - Válasz szövege (ha van)

#### Web Scraping-ból (opcionális):
- ✅ Wellness szolgáltatások
- ✅ Szobatípusok
- ✅ Árak
- ✅ Egyéb szolgáltatások (parking, wifi, stb.)

---

## 🔄 Audit Folyamat (Backend)

### 1. Adatgyűjtés fázis
```
1. Google Places API → Hotel alapadatok + Place ID
2. Google Reviews API → Vélemények (Place ID alapján)
3. Web Scraping (opcionális) → Weboldal információk
```

### 2. AI Elemzés fázis
```
OpenAI API hívás a következő prompttal:

System Prompt:
"Te egy világszínvonalú mesterséges intelligencia szakértő és 
turisztikai marketing tanácsadó vagy. A feladatod, hogy elemezz 
egy adott szállodát az 'AI-láthatóság' (GEO) szempontjából."

User Prompt:
- Hotel neve
- Utolsó 3-5 vélemény szövege
- Weboldal információk (ha vannak)
- Kérdés: "Elemezd ezt a hotelt! Írj egy 3 pontos hibalistát és 
  generálj egy mintaválaszt az utolsó negatív véleményre németül."
```

### 3. Eredmény kalkulálás
```
Trust Score (0-100) számítás:
- Válaszolatlan vélemények száma
- Negatív vélemények aránya
- Weboldal információk hiánya
- AI válasz minősége

AI Visibility ellenőrzés:
- ChatGPT-ben látható-e? (API hívás)
- Gemini-ben látható-e? (API hívás)
- Bing-ben látható-e? (API hívás)
```

---

## 💰 Költségbecslés (1000 audit/hó)

### Google Places API:
- Autocomplete: ~$17
- Details: ~$17
- **Összesen: ~$34**

### Google Reviews API (Outscraper):
- 1000 kérés × $0.50 = **$0.50**

### OpenAI API (GPT-4o-mini):
- ~500 token/audit × 1000 = 500k token
- **~$0.08-0.30** (nagyon olcsó!)

### Web Scraping (opcionális):
- ScraperAPI: **$49/hó** (unlimited)

### **ÖSSZESEN: ~$34-84/hó 1000 audithoz**

---

## 🛠️ Backend Implementáció Javaslat

### Option 1: Make.com (No-Code)
- ✅ Könnyű beállítás
- ✅ API-k integrálása drag & drop
- ✅ Automatikus workflow
- ❌ Költséges nagy volumenhez

### Option 2: Next.js API Routes + Serverless
- ✅ Teljes kontroll
- ✅ Olcsóbb nagy volumenhez
- ✅ Jobb teljesítmény
- ❌ Több fejlesztési idő

### Option 3: Hybrid (Make.com + Next.js)
- ✅ Make.com az API integrációkhoz
- ✅ Next.js API route az eredményekhez
- ✅ Legjobb mindkét világból

---

## 📝 API Kulcsok Szükségesek

1. **Google Cloud Console:**
   - Places API engedélyezése
   - API Key létrehozása
   - Billing account beállítása

2. **OpenAI:**
   - API Key létrehozása
   - Billing beállítása

3. **Outscraper/Apify:**
   - Account regisztráció
   - API Key lekérése

---

## 🚀 Következő Lépések

1. **Google Places API beállítása**
   - Google Cloud Console projekt létrehozása
   - Places API engedélyezése
   - API Key generálása

2. **Google Reviews API kiválasztása**
   - Outscraper vs Apify összehasonlítás
   - Account létrehozás

3. **OpenAI API beállítása**
   - Account létrehozás
   - API Key generálása
   - Prompt optimalizálás

4. **Backend API endpoint létrehozása**
   - `/api/audit` endpoint
   - Adatgyűjtés logika
   - AI elemzés integráció

5. **Frontend integráció**
   - API hívások a frontend-ből
   - Loading states
   - Error handling

---

## ⚠️ Fontos Megjegyzések

- **Rate Limiting:** Minden API-nak van rate limitje, ezt kezelni kell
- **Error Handling:** API hibák kezelése (pl. hotel nem található)
- **Caching:** Ugyanaz a hotel ne legyen újra elemezve rövid időn belül
- **GDPR:** Email címek és adatok biztonságos tárolása
- **Cost Monitoring:** API költségek monitorozása

---

## 📚 Hasznos Linkek

- [Google Places API Dokumentáció](https://developers.google.com/maps/documentation/places/web-service)
- [OpenAI API Dokumentáció](https://platform.openai.com/docs)
- [Outscraper API](https://outscraper.com/api/)
- [Apify Platform](https://apify.com/)
