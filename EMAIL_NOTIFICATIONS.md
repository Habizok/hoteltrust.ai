# Email Értesítések - HotelTrust.ai

## 📧 Automatikus Email Értesítések

A rendszer automatikusan email értesítést küld az adminnak (`info@hotel-trust.site`) amikor:

### 1. ✅ Várólista Regisztráció

**Mikor küldődik:**
- Amikor valaki feliratkozik a várólistára (`/api/waitlist`)

**Email tartalma:**
- Hotel neve
- Email cím
- Nyelv (HU/DE)
- Regisztráció ideje
- Összes várólista regisztrációk száma

**Email formátum:**
```
Tárgy: 🆕 Új várólista regisztráció - [Hotel Név]
Küldő: HotelTrust.ai <info@hotel-trust.site>
Címzett: info@hotel-trust.site
```

**Példa email:**
```
🆕 Új várólista regisztráció!

Hotel neve: Grand Hotel Vienna
Email cím: hotel@example.com
Nyelv: HU
Regisztráció ideje: 2026. 01. 20. 15:30:00

Összes várólista regisztráció: 164
```

### 2. 📊 Audit Eredmények

**Mikor küldődik:**
- Amikor egy audit befejeződik (`/api/audit`)

**Email tartalma:**
- Hotel neve
- Trust Score
- AI Láthatóság (ChatGPT, Gemini, Bing)
- Kritikus hibák
- Példa válasz

**Email formátum:**
```
Tárgy: HotelTrust.ai Audit Eredmény - [Hotel Név]
Küldő: HotelTrust.ai <info@hotel-trust.site>
Címzett: [Felhasználó email címe]
```

## ⚙️ Konfiguráció

### Environment Változók

A Vercel environment változókban (vagy `.env.local` fájlban):

```
GMAIL_USER=info@hotel-trust.site
GMAIL_APP_PASSWORD=Mivane0246.
```

### Hogyan Működik

1. **Várólista regisztráció:**
   - Felhasználó kitölti a waitlist formot
   - API menti az adatokat
   - **Automatikusan küld emailt az adminnak** (`info@hotel-trust.site`)
   - Válasz a felhasználónak (sikeres regisztráció)

2. **Audit befejezés:**
   - Audit folyamat lefut
   - Eredmények mentve
   - **Automatikusan küld emailt a felhasználónak** (audit eredményekkel)
   - Admin nem kap értesítést (csak a felhasználó)

## 🔔 Értesítési Beállítások

### Jelenlegi Konfiguráció

- **Admin email:** `info@hotel-trust.site` (automatikusan)
- **Várólista értesítés:** ✅ Bekapcsolva
- **Audit értesítés:** ✅ Bekapcsolva (felhasználónak)

### Jövőbeli Fejlesztések (Opcionális)

- Admin értesítés audit befejezéskor is
- Email sablonok testreszabása
- Több admin email cím támogatása
- Email értesítések kikapcsolása (ha szükséges)

## 🧪 Tesztelés

### Várólista Értesítés Tesztelése

1. **Helyi tesztelés:**
   ```bash
   npm run dev
   ```
   
2. **Regisztrálj a waitlistre:**
   - Menj a `/hu/waitlist` oldalra
   - Töltsd ki a formot
   - Ellenőrizd az `info@hotel-trust.site` email fiókot

3. **Ellenőrizd:**
   - Email megérkezett-e
   - Tartalom helyes-e
   - Összes regisztráció száma helyes-e

### Production Tesztelés

1. **Vercel environment változók beállítva:**
   - `GMAIL_USER` = `info@hotel-trust.site`
   - `GMAIL_APP_PASSWORD` = `Mivane0246.`

2. **Tesztelés:**
   - Regisztrálj a production waitlist oldalon
   - Ellenőrizd az email fiókot

## 📝 Megjegyzések

- Az email küldés **nem blokkolja** a regisztrációt
- Ha az email küldés sikertelen, a regisztráció továbbra is sikeres
- A hibák a konzolban jelennek meg (nem dobják meg a felhasználót)
- Az email formátum HTML, szép formázással

## 🔒 Biztonság

- Email címek nem kerülnek logolásra (csak konzol)
- Gmail App Password használata (nem normál jelszó)
- Environment változók biztonságos tárolása (Vercel)

---

**Utolsó frissítés:** 2026-01-20  
**Státusz:** ✅ Aktív és működik
