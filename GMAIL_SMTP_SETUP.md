# Gmail SMTP Beállítás

## Szükséges Environment Változók

A Vercel environment változókban (vagy `.env.local` fájlban) be kell állítani:

```
GMAIL_USER=info@hotel-trust.site
GMAIL_APP_PASSWORD=npwi pfwd zqli qqgi
```

**Konfiguráció:**
- **Email cím:** `info@hotel-trust.site` (Google Workspace / G Suite fiók, Namecheap-en keresztül beállítva)
- **Jelszó:** `Mivane0246.` (Gmail App Password vagy Google Workspace App Password)

## Google Workspace / G Suite App Password Létrehozása

Mivel ez egy Google Workspace (G Suite) fiók (`info@hotel-trust.site`), az App Password létrehozása:

### 1. lépés: Jelentkezz be a Google Workspace fiókba

1. Menj ide: **https://myaccount.google.com/**
2. Jelentkezz be a `info@hotel-trust.site` email címmel és jelszóval

### 2. lépés: Engedélyezd a 2-Step Verification-t

**Fontos:** Az App Password csak akkor hozható létre, ha be van kapcsolva a 2-Step Verification!

1. A Google Account oldalon kattints a bal oldali menüben a **"Security"** (Biztonság) opcióra
2. Görgess le a **"How you sign in to Google"** (Hogyan jelentkezel be a Google-ba) szekcióhoz
3. Kattints a **"2-Step Verification"** (2 lépéses ellenőrzés) opcióra
4. Ha még nincs bekapcsolva:
   - Kattints a **"Get started"** gombra
   - Kövesd a lépéseket (telefonszám, email, stb.)
   - Aktiváld a 2-Step Verification-t

### 3. lépés: Hozz létre App Password-t

1. Miután a 2-Step Verification be van kapcsolva, menj vissza a **Security** oldalra
2. Görgess le a **"2-Step Verification"** részhez
3. Kattints a **"App passwords"** (Alkalmazás jelszavak) linkre
   - Ha nem látod, görgess le a "2-Step Verification" rész aljára
4. Lehet, hogy újra be kell jelentkezned a Google fiókba
5. Az **"Select app"** (Alkalmazás kiválasztása) menüben válaszd ki: **"Mail"**
6. Az **"Select device"** (Eszköz kiválasztása) menüben válaszd ki: **"Other (Custom name)"**
7. Írd be: **"HotelTrust.ai"** (vagy bármi, amit akarsz)
8. Kattints a **"Generate"** (Generálás) gombra
9. **Másold ki a 16 karakteres jelszót** (pl. `abcd efgh ijkl mnop`)
   - ⚠️ **Fontos:** Ez csak egyszer jelenik meg! Másold ki azonnal!

### 4. lépés: Használd az App Password-t

1. Az App Password formátuma: `xxxx xxxx xxxx xxxx` (16 karakter, szóközökkel)
2. **VAGY** használd szóközök nélkül: `xxxxxxxxxxxxxxxx`
3. Ezt a jelszót add meg a `GMAIL_APP_PASSWORD` environment változóban

### Alternatív út (ha nem találod az App passwords opciót)

Néha a Google Workspace admin beállítások miatt az App passwords nem elérhető közvetlenül. Ebben az esetben:

1. Kérj segítséget a Google Workspace admin-tól
2. Vagy használj **OAuth 2.0** hitelesítést (bonyolultabb, de biztonságosabb)

### Hibaelhárítás

- **"App passwords not available"** hiba:  
  → A 2-Step Verification nincs bekapcsolva, vagy a Google Workspace admin letiltotta

- **"Invalid credentials"** hiba:  
  → Ellenőrizd, hogy az App Password-t másoltad-e ki helyesen (szóközök nélkül is próbáld)

- **"Less secure app access"** hiba:  
  → Google Workspace fióknál ez nem elérhető, csak App Password-t lehet használni

## Fontos Megjegyzések

- **NE használd a normál Gmail jelszót!** Csak az App Password-t!
- Az App Password formátuma: `xxxx xxxx xxxx xxxx` (16 karakter, szóközökkel)
- Ha nem működik, próbáld meg szóközök nélkül is: `xxxxxxxxxxxxxxxx`

## Tesztelés

Az email küldés automatikusan működik, ha:
- `GMAIL_USER` be van állítva
- `GMAIL_APP_PASSWORD` be van állítva
- A Gmail fiókban engedélyezve van a "Less secure app access" (ha szükséges)

Ha nincs beállítva, a rendszer figyelmeztetést ír a konzolra, de nem dob hibát.

## Vercel Environment Változók Beállítása

1. Menj a Vercel Dashboard-ra
2. Válaszd ki a projektet
3. Settings → Environment Variables
4. Add New:
   - **Name:** `GMAIL_USER`
   - **Value:** `info@hotel-trust.site`
   - **Environment:** Production, Preview, Development (mindhárom)
5. Add New:
   - **Name:** `GMAIL_APP_PASSWORD`
   - **Value:** `npwi pfwd zqli qqgi`
   - **Environment:** Production, Preview, Development (mindhárom)

## Kód Módosítások

Az email küldés most Gmail SMTP-t használ a `nodemailer` csomaggal:
- A kód automatikusan ellenőrzi, hogy vannak-e Gmail credentials
- Ha nincsenek, figyelmeztetést ír, de nem dob hibát
- Az email formátuma változatlan maradt
