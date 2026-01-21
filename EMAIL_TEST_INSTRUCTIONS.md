# Email Tesztelés - Gmail SMTP

## ✅ Beállítások Kész

1. **Gmail SMTP konfiguráció:**
   - Email: `info@hotel-trust.site`
   - Jelszó: `Mivane0246.`
   - `.env.local` fájl létrehozva (nem commitolódik)

2. **Kód módosítások:**
   - Email küldés átállítva Gmail SMTP-re (`nodemailer`)
   - Teszt endpoint létrehozva: `/api/test-email`

3. **Build sikeres:** ✅ Nincs TypeScript hiba

## 🧪 Hogyan Teszteld

### 1. Helyi Tesztelés (Development)

1. **Indítsd el a development szervert:**
   ```bash
   npm run dev
   ```

2. **Nyisd meg a böngészőt:**
   ```
   http://localhost:3000/api/test-email?to=SAJAT_EMAIL_CIMED@example.com
   ```

3. **Ellenőrizd az email fiókot:**
   - Ha sikeres, meg kell kapnod egy teszt emailt
   - Ha hiba van, a válaszban lesz egy hibaüzenet

### 2. Vercel Production Tesztelés

**Fontos:** A Vercel environment változókat be kell állítani!

1. **Menj a Vercel Dashboard-ra:**
   - https://vercel.com/dashboard
   - Válaszd ki a projektet

2. **Settings → Environment Variables:**
   - **GMAIL_USER** = `info@hotel-trust.site`
   - **GMAIL_APP_PASSWORD** = `Mivane0246.`
   - Environment: Production, Preview, Development (mindhárom)

3. **Redeploy:**
   - Settings → Deployments
   - Vagy automatikusan újra deployolódik, ha pusholsz

4. **Tesztelés:**
   ```
   https://hoteltrust.at/api/test-email?to=SAJAT_EMAIL_CIMED@example.com
   ```

## 🔍 Hibaellenőrzés

### Ha nem működik:

1. **Ellenőrizd a konzolt:**
   - Development: Terminal output
   - Production: Vercel Logs

2. **Gyakori hibák:**
   - `EAUTH` - Rossz jelszó vagy App Password szükséges
   - `ECONNECTION` - Network probléma
   - `ETIMEDOUT` - Timeout

3. **Gmail App Password ellenőrzés:**
   - Ha a `Mivane0246.` nem App Password, hozz létre egyet:
   - Google Account → Security → 2-Step Verification → App passwords

## 📧 Audit Email Automatikus Küldés

Az audit oldal automatikusan küld emailt, amikor:
- Egy audit befejeződik
- A `GMAIL_USER` és `GMAIL_APP_PASSWORD` be van állítva
- Az email cím meg van adva az audit formban

**Tesztelés:**
1. Menj a `/hu/free-audit` oldalra
2. Tölts ki egy auditot
3. Ellenőrizd az email fiókot

## ✅ Sikeres Tesztelés Jelei

- ✅ Email megérkezik a megadott címre
- ✅ Küldő: `HotelTrust.ai <info@hotel-trust.site>`
- ✅ Tárgy: "HotelTrust.ai - Email Teszt" (teszt) vagy "HotelTrust.ai Audit Eredmény" (audit)
- ✅ HTML formátumú email

## 🚀 Következő Lépések

1. **Vercel environment változók beállítása** (ha még nem történt meg)
2. **Tesztelés production környezetben**
3. **Audit email küldés tesztelése**

---

**Kész:** 2026-01-20  
**Státusz:** ✅ Készen áll a tesztelésre
