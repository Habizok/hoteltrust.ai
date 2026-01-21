# Marketing Szövegek Teljes Dokumentációja

## Áttekintés
A HotelTrust.ai projekt két nyelven működik: **magyar (hu)** és **német (de)**. Minden marketing szöveg a `messages/hu.json` és `messages/de.json` fájlokban van tárolva, és a `next-intl` rendszeren keresztül kerül betöltésre.

---

## 1. WAITLIST OLDAL (`/[locale]/waitlist`)

### 1.1 Hero Szekció
**Fájl:** `messages/hu.json` → `waitlist.hero.*`  
**Fájl:** `messages/de.json` → `waitlist.hero.*`

| Szöveg | Magyar (hu) | Német (de) | Kulcs |
|--------|-------------|------------|-------|
| Főcím | "Az AI ajánlja a hoteledet?" | "Empfiehlt die KI Ihr Hotel?" | `waitlist.hero.title` |
| Alcím | "Hagyd, hogy a mesterséges intelligencia hozza a vendégeket!" | "Lassen Sie die Künstliche Intelligenz Ihre Gäste bringen!" | `waitlist.hero.subtitle` |
| Leírás | "Elérjük, hogy ha valaki nyaralást keres a ChatGPT-vel, a hoteledet ajánlja elsőként." | "Wir sorgen dafür, dass ChatGPT Ihr Haus als erste Wahl vorschlägt." | `waitlist.hero.description` |
| CTA gomb | "Iratkozz fel a várólistára az 50%-os Early Bird kedvezményért!" | "Melden Sie sich für die Warteliste an und erhalten Sie 50% Early Bird Rabatt!" | `waitlist.hero.cta` |

### 1.2 Kompatibilitás Szekció
**Fájl:** `messages/hu.json` → `waitlist.compatible.*`  
**Fájl:** `messages/de.json` → `waitlist.compatible.*`

| Szöveg | Magyar (hu) | Német (de) | Kulcs |
|--------|-------------|------------|-------|
| Cím | "Kompatibilis a következőkkel:" | "Kompatibel mit führenden Systemen" | `waitlist.compatible.title` |

### 1.3 Funkciók Szekció
**Fájl:** `messages/hu.json` → `waitlist.features.*`  
**Fájl:** `messages/de.json` → `waitlist.features.*`

| Szöveg | Magyar (hu) | Német (de) | Kulcs |
|--------|-------------|------------|-------|
| Szekció címe | "Amiből érti, mit kap a pénzéért" | "Was Sie für Ihr Geld bekommen" | `waitlist.features.title` |
| **Funkció 1 - Cím** | "Soha többé ne bajlódj a vendégek véleményeivel!" | "Nie wieder Stress mit Gästebewertungen" | `waitlist.features.feature1.title` |
| **Funkció 1 - Leírás** | "A rendszerünk azonnal, udvariasan és tökéletes németességgel válaszol minden Google értékelésre helyetted. Az AI látja, hogy törődsz a vendégekkel, ezért többször fogja ajánlani a szállodádat." | "Automatische, perfekte Antworten auf Google-Rezensionen. Unser System antwortet sofort, höflich und in perfektem Deutsch auf jede Google-Bewertung an Ihrer Stelle. Die KI sieht, dass Sie sich um Ihre Gäste kümmern, und wird Ihr Hotel daher häufiger empfehlen." | `waitlist.features.feature1.description` |
| **Funkció 2 - Cím** | "\"Tanítsd meg\" a ChatGPT-nek, miért a hoteled a legjobb!" | "Bringen Sie der KI bei, warum Ihr Hotel das Beste ist" | `waitlist.features.feature2.title` |
| **Funkció 2 - Leírás** | "Beépítünk egy láthatatlan kódot a honlapodba, amit az emberi szem nem lát, de a mesterséges intelligencia ebből érti meg, hogy neked van a legjobb wellness részleged vagy a legfinomabb reggelid." | "Wir machen Ihre Vorteile für ChatGPT & Co. lesbar. Wir integrieren einen unsichtbaren Code auf Ihrer Website, den das menschliche Auge nicht sieht, aber die künstliche Intelligenz versteht daraus, dass Sie den besten Wellness-Bereich oder das leckerste Frühstück haben." | `waitlist.features.feature2.description` |
| **Funkció 3 - Cím** | "Legyen rend a digitális névjegyeden!" | "Ihre digitale Visitenkarte – immer aktuell" | `waitlist.features.feature3.title` |
| **Funkció 3 - Leírás** | "Ha megváltozik a nyitvatartás vagy az ár, elég nálunk egyszer átírnod. Mi azonnal frissítjük a Google-ben, a Bing-ben és az Apple térképeken is, hogy a vendégek ne kapjanak téves információt." | "Synchronisation mit Google, Bing und Apple Maps. Wenn sich die Öffnungszeiten oder der Preis ändern, reicht es aus, es bei uns einmal zu ändern. Wir aktualisieren sofort in Google, Bing und auf Apple Maps, damit Gäste keine falschen Informationen erhalten." | `waitlist.features.feature3.description` |

### 1.4 "Miért most?" Szekció
**Fájl:** `messages/hu.json` → `waitlist.whyNow.*`  
**Fájl:** `messages/de.json` → `waitlist.whyNow.*`

| Szöveg | Magyar (hu) | Német (de) | Kulcs |
|--------|-------------|------------|-------|
| Cím | "Miért most?" | "Warum jetzt?" | `waitlist.whyNow.title` |
| Leírás | "Régen a Google listáján kellett az elsőnek lenni. Ma már az AI válaszaiban kell benne lenni. Aki kimarad a ChatGPT ajánlásaiból, az a jövő utazói számára egyszerűen nem létezik." | "Früher musste man in der Google-Liste an erster Stelle stehen. Heute muss man in den KI-Antworten dabei sein. Wer aus den ChatGPT-Empfehlungen herausfällt, existiert für die Reisenden der Zukunft einfach nicht." | `waitlist.whyNow.description` |

**Hardcoded szövegek a mockup-ban:**
- **Magyar:** "Ajánlj egy jó hotelt Bécsben wellness-szel és 5 csillaggal!" (user message)
- **Német:** "Empfehlen Sie ein gutes Hotel in Wien mit Wellness und 5 Sternen!" (user message)
- **Magyar:** "Grand Hotel Vienna" (hotel name)
- **Német:** "Grand Hotel Wien" (hotel name)
- **Magyar:** "Kiváló választás Bécs központjában! 5 csillagos wellness hotel kiváló spa részleggel, fedett medencével és privát wellness szobákkal. Központi helyen, a legjobb éttermek és bevásárlóutcák közelében." (AI response)
- **Német:** "Ausgezeichnete Wahl im Zentrum Wiens! 5-Sterne Wellness-Hotel mit exzellenter Spa-Abteilung, Hallenbad und privaten Wellness-Räumen. Zentrale Lage, nah an den besten Restaurants und Einkaufsstraßen." (AI response)

### 1.5 Folyamat Szekció
**Fájl:** `messages/hu.json` → `waitlist.process.*`  
**Fájl:** `messages/de.json` → `waitlist.process.*`

| Szöveg | Magyar (hu) | Német (de) | Kulcs |
|--------|-------------|------------|-------|
| Szekció címe | "Pofonegyszerűen" | "So einfach ist es" | `waitlist.process.title` |
| **1. lépés - Cím** | "Elemzés" | "Analyse" | `waitlist.process.step1.title` |
| **1. lépés - Leírás** | "Megnézzük, mit mond az AI a hoteledről most." | "Wir schauen, was die KI jetzt über Ihr Hotel sagt." | `waitlist.process.step1.description` |
| **2. lépés - Cím** | "Bekötés" | "Anschluss" | `waitlist.process.step2.title` |
| **2. lépés - Leírás** | "Összekötjük a rendszerünket a hotel profiljával (5 perc)." | "Wir verbinden unser System mit Ihrem Hotelprofil (5 Minuten)." | `waitlist.process.step2.description` |
| **3. lépés - Cím** | "Hátradőlés" | "Zurücklehnen" | `waitlist.process.step3.title` |
| **3. lépés - Leírás** | "A szoftver válaszol a véleményekre és építi a hotel hírnevét a háttérben." | "Die Software antwortet auf Bewertungen und baut den Ruf Ihres Hotels im Hintergrund auf." | `waitlist.process.step3.description` |

### 1.6 Űrlap Szekció
**Fájl:** `messages/hu.json` → `waitlist.form.*`  
**Fájl:** `messages/de.json` → `waitlist.form.*`

| Szöveg | Magyar (hu) | Német (de) | Kulcs |
|--------|-------------|------------|-------|
| Email mező label | "E-mail cím" | "Ihre E-Mail-Adresse" | `waitlist.form.email` |
| Email placeholder | "az@email.hu" | "beispiel@hotel.at" | `waitlist.form.emailPlaceholder` |
| Hotel név mező label | "Hotel neve" | "Name des Hotels" | `waitlist.form.hotelName` |
| Hotel név placeholder | "A hoteled neve" | "Ihr Hotelname" | `waitlist.form.hotelNamePlaceholder` |
| Submit gomb | "Kérem az 50% kedvezményt" | "Jetzt 50% Rabatt sichern" | `waitlist.form.submit` |
| Sikeres üzenet | "Sikeresen feliratkozott! Hamarosan jelentkezünk." | "Erfolgreich angemeldet! Wir melden uns bald bei Ihnen." | `waitlist.form.success` |
| Hiba üzenet | "Valami hiba történt. Kérjük, próbálja újra." | "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut." | `waitlist.form.error` |

### 1.7 GYIK Szekció
**Fájl:** `messages/hu.json` → `waitlist.faq.*`  
**Fájl:** `messages/de.json` → `waitlist.faq.*`

| Szöveg | Magyar (hu) | Német (de) | Kulcs |
|--------|-------------|------------|-------|
| Szekció címe | "Gyakran ismételt kérdések" | "Häufig gestellte Fragen" | `waitlist.faq.title` |
| **Kérdés 1** | "Nem fog az AI hülyeségeket válaszolni a vendégeimnek?" | "Wird die KI nicht Unsinn auf die Bewertungen meiner Gäste antworten?" | `waitlist.faq.q1.question` |
| **Válasz 1** | "Nem. A rendszerünk megtanulja a szállodád stílusát és egyedi adatait. Emellett beállíthatsz egy \"Jóváhagyási módot\" is, így az AI által írt válasz csak akkor megy ki, ha egy gombnyomással rábólintasz." | "Nein. Unser System lernt den Stil und die einzigartigen Daten Ihres Hotels. Außerdem können Sie einen \"Genehmigungsmodus\" einrichten, sodass die von der KI geschriebene Antwort nur gesendet wird, wenn Sie mit einem Klick zustimmen." | `waitlist.faq.q1.answer` |
| **Kérdés 2** | "Miért jobb ez, mint ha a recepciós írná a válaszokat?" | "Warum ist das besser, als wenn die Rezeption die Antworten schreibt?" | `waitlist.faq.q2.question` |
| **Válasz 2** | "Az AI sosem fáradt, azonnal válaszol (ami az AI-keresők rangsorolásánál kulcsfontosságú), és tökéletesen beszéli a vendég anyanyelvét, legyen az holland, olasz vagy francia. Ezzel napi több órát spórolsz meg a személyzetnek." | "Die KI ist nie müde, antwortet sofort (was bei KI-Suchmaschinen-Rankings entscheidend ist) und spricht die Muttersprache des Gastes perfekt, sei es Niederländisch, Italienisch oder Französisch. Dies spart dem Personal täglich mehrere Stunden." | `waitlist.faq.q2.answer` |
| **Kérdés 3** | "Kell ehhez módosítanom a jelenlegi weboldalamon?" | "Muss ich meine aktuelle Website dafür ändern?" | `waitlist.faq.q3.question` |
| **Válasz 3** | "Nem feltétlenül. Ha nincs weboldalad, mi adunk egyet. Ha van, elég egy apró kódot elhelyezni, amit mi is megcsinálunk neked. A weboldal kinézete nem változik, csak az \"intelligenciája\" nő." | "Nicht unbedingt. Wenn Sie keine Website haben, geben wir Ihnen eine. Wenn Sie eine haben, reicht es aus, einen kleinen Code einzufügen, den wir auch für Sie erstellen. Das Aussehen der Website ändert sich nicht, nur ihre \"Intelligenz\" wächst." | `waitlist.faq.q3.answer` |
| **Kérdés 4** | "Ez SEO? Mert már próbáltam, de nem működött." | "Ist das SEO? Denn ich habe es schon versucht, aber es hat nicht funktioniert." | `waitlist.faq.q4.question` |
| **Válasz 4** | "Ez GEO (Generative Engine Optimization). Míg a SEO a régi Google-listákra koncentrált, mi arra fókuszálunk, hogy a ChatGPT és a modern asszisztensek ajánljon téged. Ez a 2026-os marketing új szintje." | "Das ist GEO (Generative Engine Optimization). Während sich SEO auf die alten Google-Listen konzentrierte, konzentrieren wir uns darauf, dass ChatGPT und moderne Assistenten Sie empfehlen. Dies ist die neue Stufe des Marketings im Jahr 2026." | `waitlist.faq.q4.answer` |

### 1.8 Footer Szekció
**Fájl:** `messages/hu.json` → `waitlist.footer.*`  
**Fájl:** `messages/de.json` → `waitlist.footer.*`

| Szöveg | Magyar (hu) | Német (de) | Kulcs |
|--------|-------------|------------|-------|
| Impressum link | "Impresszum" | "Impressum" | `waitlist.footer.impressum` |
| Adatvédelem link | "Adatvédelem" | "Datenschutz" | `waitlist.footer.datenschutz` |
| Copyright | "© 2026 HotelTrust.ai. Minden jog fenntartva." | "© 2026 HotelTrust.ai. Alle Rechte vorbehalten." | `waitlist.footer.copyright` |

---

## 2. FREE AUDIT OLDAL (`/[locale]/free-audit`)

### 2.1 Hero Szekció
**Fájl:** `messages/hu.json` → `audit.hero.*`  
**Fájl:** `messages/de.json` → `audit.hero.*`

| Szöveg | Magyar (hu) | Német (de) | Kulcs |
|--------|-------------|------------|-------|
| Főcím | "Nézd meg élőben hogyan látja az AI a hoteledet?" | "Sehen Sie live: Wie sieht die KI Ihr Hotel?" | `audit.hero.title` |
| Alcím | "Adja meg szállodája nevét, és rendszerünk 30 másodpercen belül lefuttat egy élő elemzést a ChatGPT és a Google AI hálózatán." | "Geben Sie den Hotelnamen ein, und unser System führt in 30 Sekunden eine Live-Analyse im ChatGPT- und Google-AI-Netzwerk durch." | `audit.hero.subtitle` |
| Leírás | "Ingyenes AI audit, hogy lássa, mit mond róla a mesterséges intelligencia." | "Kostenlose KI-Analyse, um zu sehen, was die künstliche Intelligenz über Sie sagt." | `audit.hero.description` |
| CTA gomb | "Kezdje el az ingyenes auditot most!" | "Starten Sie jetzt die kostenlose Analyse!" | `audit.hero.cta` |

### 2.2 Kompatibilitás Szekció
**Fájl:** `messages/hu.json` → `audit.compatible.*`  
**Fájl:** `messages/de.json` → `audit.compatible.*`

| Szöveg | Magyar (hu) | Német (de) | Kulcs |
|--------|-------------|------------|-------|
| Cím | "Kompatibilis a következőkkel:" | "Kompatibel mit führenden Systemen" | `audit.compatible.title` |

### 2.3 Funkciók Szekció
**Megjegyzés:** Ugyanazok a szövegek, mint a Waitlist oldalon, de az `audit.features.*` kulcsokkal.

### 2.4 "Miért most?" Szekció
**Megjegyzés:** Ugyanazok a szövegek, mint a Waitlist oldalon, de az `audit.whyNow.*` kulcsokkal.

### 2.5 Folyamat Szekció
**Megjegyzés:** Ugyanazok a szövegek, mint a Waitlist oldalon, de az `audit.process.*` kulcsokkal.

### 2.6 Űrlap Szekció
**Fájl:** `messages/hu.json` → `audit.form.*`  
**Fájl:** `messages/de.json` → `audit.form.*`

| Szöveg | Magyar (hu) | Német (de) | Kulcs |
|--------|-------------|------------|-------|
| Email mező label | "E-mail cím" | "Ihre E-Mail-Adresse" | `audit.form.email` |
| Email placeholder | "az@email.hu" | "beispiel@hotel.at" | `audit.form.emailPlaceholder` |
| Email label (2. lépés) | "Hova küldjük a részletes jelentést?" | "Wohin senden wir den detaillierten Bericht?" | `audit.form.emailLabel` |
| Hotel név mező label | "Hotel neve" | "Name des Hotels" | `audit.form.hotelName` |
| Hotel név placeholder | "Kezdje el gépelni a szállodája nevét..." | "Beginnen Sie mit der Eingabe des Hotelnamens..." | `audit.form.hotelNamePlaceholder` |
| Submit gomb | "AI-Audit indítása" | "KI-Audit starten" | `audit.form.submit` |
| Tovább gomb | "Tovább az elemzéshez" | "Zur Analyse weiter" | `audit.form.next` |
| Folyamatban üzenet | "Audit folyamatban..." | "Audit läuft..." | `audit.form.processing` |
| Sikeres üzenet | "Sikeresen elküldve! Hamarosan megkapod az audit eredményét." | "Erfolgreich gesendet! Sie erhalten die Analyseergebnisse in Kürze." | `audit.form.success` |
| Hiba üzenet | "Valami hiba történt. Kérjük, próbáld újra." | "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut." | `audit.form.error` |
| 1. lépés label | "Adatok" | "Daten" | `audit.form.step1` |
| 2. lépés label | "Elemzés" | "Analyse" | `audit.form.step2` |
| 3. lépés label | "Eredmény" | "Ergebnis" | `audit.form.step3` |

**Folyamat lépések:**
| Szöveg | Magyar (hu) | Német (de) | Kulcs |
|--------|-------------|------------|-------|
| 1. lépés | "Kapcsolódás a Google Maps adatbázisához..." | "Verbinde mit Google Maps Datenbank..." | `audit.form.processingSteps.step1` |
| 2. lépés | "Vendégvélemények kinyerése..." | "Extrahiere Gästebewertungen..." | `audit.form.processingSteps.step2` |
| 3. lépés | "AI elemzés indítása a GPT-4o-val..." | "Starte KI-Analyse mit GPT-4o..." | `audit.form.processingSteps.step3` |
| 4. lépés | "Láthatósági pontszám kalkulálása..." | "Berechne Sichtbarkeits-Score..." | `audit.form.processingSteps.step4` |
| 5. lépés | "Jelentés összeállítása..." | "Erstelle Bericht..." | `audit.form.processingSteps.step5` |

**Hardcoded szövegek a processing log-ban:**
- **Magyar:** "Kapcsolódás a Google Maps adatbázisához...", "Vendégvélemények kinyerése a(z) [hotelName] számára...", "AI elemzés indítása a GPT-4o-val...", "Láthatósági pontszám kalkulálása...", "Kész!"
- **Német:** "Verbinde mit Google Maps Datenbank...", "Extrahiere Gästebewertungen für [hotelName]...", "Starte KI-Analyse mit GPT-4o...", "Berechne Sichtbarkeits-Score...", "Fertig!"

### 2.7 Eredmény Szekció
**Fájl:** `messages/hu.json` → `audit.result.*`  
**Fájl:** `messages/de.json` → `audit.result.*`

| Szöveg | Magyar (hu) | Német (de) | Kulcs |
|--------|-------------|------------|-------|
| Trust Score cím | "Trust Score" | "Trust Score" | `audit.result.trustScore` |
| AI Láthatóság cím | "AI Láthatóság" | "KI-Sichtbarkeit" | `audit.result.aiVisibility` |
| Hírnév cím | "Hírnév" | "Reputation" | `audit.result.reputation` |
| Sample Reply cím | "Így válaszolna a szoftverünk az utolsó véleményére:" | "So würde unsere Software auf Ihre letzte Bewertung antworten:" | `audit.result.sampleReply` |
| Válaszolatlan vélemények | "válaszolatlan vélemény" | "unbeantwortete Bewertungen" | `audit.result.unansweredReviews` |
| Látható itt | "Látható itt:" | "Sichtbar auf:" | `audit.result.visibleOn` |
| Nem látható itt | "Nem látható itt:" | "Nicht sichtbar auf:" | `audit.result.notVisibleOn` |
| Kritikus hibák cím | "Mi szorul javításra?" | "Was muss verbessert werden?" | `audit.result.criticalIssues` |
| Javaslatok cím | "Javaslatok" | "Empfehlungen" | `audit.result.recommendations` |
| Bevételkiesés cím | "Becsült bevételkiesés évente" | "Geschätzte Umsatzverluste pro Jahr" | `audit.result.revenueLoss` |
| CTA gomb | "Megoldom ezeket a hibákat az AI-val" | "Ich löse diese Probleme mit KI" | `audit.result.cta` |
| Másolás gomb | "Másolás" | "Kopieren" | `audit.result.copyReply` |
| Live Demo | "Live Demo" | "Live Demo" | `audit.result.liveDemo` |
| Issue tip | "A HotelTrust.ai automatikusan válaszol erre a problémára" | "HotelTrust.ai beantwortet dieses Problem automatisch" | `audit.result.issueTip` |

**Hardcoded szövegek az eredményekben:**
- **Magyar:** "Keresés..." (autocomplete loading)
- **Német:** "Suche..." (autocomplete loading)
- **Magyar:** "Már 150+ hotel használja a HotelTrust.ai-t" (social proof badge)
- **Német:** "Bereits 150+ Hotels nutzen HotelTrust.ai" (social proof badge)
- **Magyar:** "Kiváló" / "Közepes" / "Javítandó" (Trust Score rating)
- **Német:** "Ausgezeichnet" / "Durchschnittlich" / "Verbesserungswürdig" (Trust Score rating)
- **Magyar:** "Egyetlen véleményt sem válaszoltál meg." (no answered reviews)
- **Német:** "Sie haben keine einzige Bewertung beantwortet." (no answered reviews)
- **Magyar:** "[X] véleményből [Y]-öt válaszoltál meg." (answered reviews count)
- **Német:** "Von [X] Bewertungen haben Sie [Y] beantwortet." (answered reviews count)
- **Magyar:** "⚠️ Ez nem jó! Az AI ezt alacsony szolgáltatási minőségként értékeli, és kevesebbszer fogja ajánlani a szállodádat." (warning message)
- **Német:** "⚠️ Das ist nicht gut! Die KI bewertet dies als niedrige Servicequalität und wird Ihr Hotel seltener empfehlen." (warning message)
- **Magyar:** "Több" / "Összecsukás" (expand/collapse sample reply)
- **Német:** "Mehr" / "Weniger" (expand/collapse sample reply)
- **Magyar:** "Átlagos pozíció [X]. hely 10 különböző kérdés alapján (5 magyar + 5 német)" (AI visibility tooltip)
- **Német:** "Durchschnittliche Position [X]. Platz basierend auf 10 verschiedenen Fragen (5 ungarisch + 5 deutsch)" (AI visibility tooltip)
- **Magyar:** "Az AI nem találta a hotelt a tesztelt kérdésekben" (not visible tooltip)
- **Német:** "Die KI hat das Hotel in den getesteten Fragen nicht gefunden" (not visible tooltip)
- **Magyar:** "[X]. hely" (position display)
- **Német:** "[X]. Platz" (position display)
- **Magyar:** "Látható" / "Nem látható" (visibility status)
- **Német:** "Sichtbar" / "Nicht sichtbar" (visibility status)

**Expandable issue tips (hardcoded):**
- **Magyar:** "💡 Első helyre kerüléshez: válaszolj minden véleményre 24 órán belül, növeld a pozitív vélemények arányát, és add hozzá a strukturált adatokat (Schema.org) a weboldalhoz."
- **Német:** "💡 Um auf Platz 1 zu kommen: Beantworten Sie alle Bewertungen innerhalb von 24 Stunden, erhöhen Sie den Anteil positiver Bewertungen und fügen Sie strukturierte Daten (Schema.org) zur Website hinzu."
- **Magyar:** "💡 Az AI ajánlásokban való megjelenéshez: válaszolj a véleményekre, növeld az értékeléseket, és biztosítsd, hogy a weboldalad tartalmaz strukturált adatokat (Schema.org)."
- **Német:** "💡 Um in den KI-Empfehlungen zu erscheinen: Beantworten Sie Bewertungen, erhöhen Sie die Bewertungen und stellen Sie sicher, dass Ihre Website strukturierte Daten (Schema.org) enthält."

### 2.8 GYIK Szekció
**Fájl:** `messages/hu.json` → `audit.faq.*`  
**Fájl:** `messages/de.json` → `audit.faq.*`

| Szöveg | Magyar (hu) | Német (de) | Kulcs |
|--------|-------------|------------|-------|
| Szekció címe | "Gyakran ismételt kérdések" | "Häufig gestellte Fragen" | `audit.faq.title` |
| **Kérdés 1** | "Tényleg ingyenes ez az elemzés? Van valami apróbetűs rész?" | "Ist diese Analyse wirklich kostenlos? Gibt es ein Kleingedrucktes?" | `audit.faq.q1.question` |
| **Válasz 1** | "Igen, az alap elemzés teljesen ingyenes és semmilyen kötelezettséggel nem jár. Célunk, hogy megmutassuk, mekkora potenciál rejlik az AI-alapú keresésekben az osztrák turizmus számára." | "Ja, die Grundanalyse ist völlig kostenlos und ohne Verpflichtungen. Unser Ziel ist es, Ihnen das Potenzial KI-basierter Suche für den österreichischen Tourismus zu zeigen." | `audit.faq.q1.answer` |
| **Kérdés 2** | "Honnan veszi a rendszer az adatokat az elemzéshez?" | "Woher bezieht das System die Daten für die Analyse?" | `audit.faq.q2.question` |
| **Válasz 2** | "Nyilvános adatokból dolgozunk: a Google Cégprofil, a TripAdvisor és az Ön nyilvános weboldala alapján elemezzük, hogyan látja Önt a mesterséges intelligencia." | "Wir arbeiten mit öffentlichen Daten: Basierend auf Ihrem Google-Unternehmensprofil, Tripadvisor und Ihrer öffentlichen Website analysieren wir, wie die künstliche Intelligenz Sie sieht." | `audit.faq.q2.answer` |
| **Kérdés 3** | "Biztonságban vannak az adataim?" | "Sind meine Daten sicher?" | `audit.faq.q3.question` |
| **Válasz 3** | "Teljes mértékben. GDPR-kompatibilis, EU-n belüli szervereket használunk. Nem adjuk el az adataidat, és nem küldünk spameket." | "Vollständig. Wir verwenden GDPR-konforme Server innerhalb der EU. Wir verkaufen Ihre Daten nicht und senden keine Spam-E-Mails." | `audit.faq.q3.answer` |
| **Kérdés 4** | "Mennyire pontos ez az azonnali elemzés?" | "Wie genau ist diese sofortige Analyse?" | `audit.faq.q4.question` |
| **Válasz 4** | "A rendszerünk élőben kérdezi le a legfrissebb AI modelleket (GPT-4o, Perplexity). Ez egy pillanatfelvétel arról, hogy egy átlagos utazó mit látna, ha ma keresne szállást a környéken." | "Unser System fragt die neuesten KI-Modelle (GPT-4o, Perplexity) live ab. Dies ist eine Momentaufnahme dessen, was ein durchschnittlicher Reisender sehen würde, wenn er heute in der Gegend nach einer Unterkunft suchen würde." | `audit.faq.q4.answer` |

### 2.9 Footer Szekció
**Fájl:** `messages/hu.json` → `audit.footer.*`  
**Fájl:** `messages/de.json` → `audit.footer.*`

| Szöveg | Magyar (hu) | Német (de) | Kulcs |
|--------|-------------|------------|-------|
| Impressum link | "Impresszum" | "Impressum" | `audit.footer.impressum` |
| Adatvédelem link | "Adatvédelem" | "Datenschutz" | `audit.footer.datenschutz` |
| Copyright | "© 2026 HotelTrust.ai. Minden jog fenntartva." | "© 2026 HotelTrust.ai. Alle Rechte vorbehalten." | `audit.footer.copyright` |

---

## 3. IMPRESSUM OLDAL (`/[locale]/impressum`)

**Fájl:** `messages/hu.json` → `impressum.*`  
**Fájl:** `messages/de.json` → `impressum.*`

| Szöveg | Magyar (hu) | Német (de) | Kulcs |
|--------|-------------|------------|-------|
| Oldal címe | "Impresszum" | "Impressum" | `impressum.title` |
| Vissza gomb | "Vissza" | "Zurück" | `impressum.back` |
| Céginformációk cím | "Céginformációk" | "Firmeninformationen" | `impressum.company.title` |
| Cégnév | "HotelTrust.ai" | "HotelTrust.ai" | `impressum.company.name` |
| Cím | "1136 Budapest, Hegedűs Gyula u. 29. A Üzlet 1." | "Adresse" (de.json-ben csak "Adresse" van, nincs konkrét cím) | `impressum.company.address` |
| Irányítószám | "1380 Budapest, Pf" | "1234 Wien" | `impressum.company.postalCode` |
| Város | "Budapest" | "Wien" | `impressum.company.city` |
| Ország | "Magyarország" | "Österreich" | `impressum.company.country` |
| Kapcsolat cím | "Kapcsolat" | "Kontakt" | `impressum.contact.title` |
| Email label | "E-mail" | "E-Mail" | `impressum.contact.email` |
| Email érték | "info@hotel-trust.site" | "info@hotel-trust.site" | `impressum.contact.emailValue` |
| Jogi információk cím | "Jogi információk" | "Rechtliche Hinweise" | `impressum.legal.title` |
| Jogi információk tartalom | "Ez az oldal tájékoztatási célokat szolgál. A HotelTrust.ai tartalékjoggal rendelkezik a weboldalon közzétett információk módosításához. Minden adat a tényleges helyzetnek megfelelően került feltüntetésre." | "Diese Seite dient Informationszwecken. HotelTrust.ai behält sich das Recht vor, die auf dieser Website veröffentlichten Informationen zu ändern. Alle Angaben entsprechen dem tatsächlichen Stand der Dinge." | `impressum.legal.content` |
| Adatvédelem cím | "Adatvédelem" | "Datenschutz" | `impressum.dataProtection.title` |
| Adatvédelem link szöveg | "itt" | "hier" | `impressum.dataProtection.link` |
| Adatvédelem előtag | "Az adatvédelmi tájékoztatónkat" | "Unsere Datenschutzerklärung finden Sie" | `impressum.dataProtection.content` |

---

## 4. DATENSCHUTZ (ADATVÉDELMI TÁJÉKOZTATÓ) OLDAL (`/[locale]/datenschutz`)

**Fájl:** `messages/hu.json` → `datenschutz.*`  
**Fájl:** `messages/de.json` → `datenschutz.*`

| Szöveg | Magyar (hu) | Német (de) | Kulcs |
|--------|-------------|------------|-------|
| Oldal címe | "Adatvédelmi tájékoztató" | "Datenschutzerklärung" | `datenschutz.title` |
| Vissza gomb | "Vissza" | "Zurück" | `datenschutz.back` |
| Bevezetés | "A HotelTrust.ai elkötelezett az Ön személyes adatainak védelme mellett. Ez az adatvédelmi tájékoztató tájékoztatja Önt arról, hogyan gyűjtjük, használjuk és védjük az Ön személyes adatait az EU Általános Adatvédelmi Rendelet (GDPR) és a vonatkozó adatvédelmi törvények értelmében." | "HotelTrust.ai ist dem Schutz Ihrer persönlichen Daten verpflichtet. Diese Datenschutzerklärung informiert Sie darüber, wie wir Ihre persönlichen Daten gemäß der EU-Datenschutz-Grundverordnung (DSGVO) und den geltenden Datenschutzgesetzen sammeln, verwenden und schützen." | `datenschutz.introduction` |
| Adatkezelő cím | "Az adatkezelő" | "Verantwortlicher für die Datenverarbeitung" | `datenschutz.dataController.title` |
| Adatkezelő név | "HotelTrust.ai" | "HotelTrust.ai" | `datenschutz.dataController.name` |
| Adatkezelő cím | "1136 Budapest, Hegedűs Gyula u. 29. A Üzlet 1." | "1136 Budapest, Hegedűs Gyula u. 29. A Üzlet 1." | `datenschutz.dataController.address` |
| Adatkezelő irányítószám | "1380 Budapest, Pf" | "1380 Budapest, Pf" | `datenschutz.dataController.postalCode` |
| Adatkezelő város | "Budapest" | "Budapest" | `datenschutz.dataController.city` |
| Adatkezelő ország | "Magyarország" | "Ungarn" | `datenschutz.dataController.country` |
| Adatkezelő email label | "E-mail" | "E-Mail" | `datenschutz.dataController.email` |
| Adatkezelő email érték | "info@hotel-trust.site" | "info@hotel-trust.site" | `datenschutz.dataController.emailValue` |
| Személyes adatok cím | "Milyen személyes adatokat gyűjtünk?" | "Welche persönlichen Daten sammeln wir?" | `datenschutz.personalData.title` |
| Személyes adatok bevezetés | "A szolgáltatásaink igénybevételéhez a következő személyes adatokat gyűjthetjük:" | "Für die Inanspruchnahme unserer Dienstleistungen können wir folgende persönliche Daten sammeln:" | `datenschutz.personalData.intro` |
| Személyes adatok 1 | "Név és kapcsolattartási információk (e-mail cím, telefon)" | "Name und Kontaktinformationen (E-Mail-Adresse, Telefonnummer)" | `datenschutz.personalData.item1` |
| Személyes adatok 2 | "Hotel név és üzleti információ" | "Hotelsname und Geschäftsinformationen" | `datenschutz.personalData.item2` |
| Személyes adatok 3 | "Használati adatok (weboldal látogatások, szolgáltatásaink használata)" | "Nutzungsdaten (Website-Besuche, Nutzung unserer Dienstleistungen)" | `datenschutz.personalData.item3` |
| Személyes adatok 4 | "Műszaki adatok (IP-cím, böngésző típusa, eszköz információ)" | "Technische Daten (IP-Adresse, Browsertyp, Geräteinformationen)" | `datenschutz.personalData.item4` |
| Személyes adatok 5 | "Kommunikációs adatok (az Önnel folytatott levelezés és egyéb kommunikáció)" | "Kommunikationsdaten (Korrespondenz und andere Kommunikation mit Ihnen)" | `datenschutz.personalData.item5` |
| Adatkezelés célja cím | "Az adatkezelés célja" | "Zweck der Datenverarbeitung" | `datenschutz.purpose.title` |
| Adatkezelés célja bevezetés | "Személyes adatait az alábbi célokból kezeljük:" | "Ihre persönlichen Daten werden zu folgenden Zwecken verarbeitet:" | `datenschutz.purpose.intro` |
| Cél 1 | "Szolgáltatásaink nyújtása és fejlesztése" | "Bereitstellung und Verbesserung unserer Dienstleistungen" | `datenschutz.purpose.item1` |
| Cél 2 | "Kapcsolatfelvétel és kommunikáció az Önnel" | "Kontaktaufnahme und Kommunikation mit Ihnen" | `datenschutz.purpose.item2` |
| Cél 3 | "Várólista regisztráció kezelése" | "Verwaltung von Wartelisten-Registrierungen" | `datenschutz.purpose.item3` |
| Cél 4 | "Jogszabályi kötelezettségek teljesítése" | "Erfüllung gesetzlicher Verpflichtungen" | `datenschutz.purpose.item4` |
| Jogalap cím | "Az adatkezelés jogalapja" | "Rechtliche Grundlage der Datenverarbeitung" | `datenschutz.legalBasis.title` |
| Jogalap tartalom | "Személyes adatait az alábbi jogalapok alapján kezeljük: (1) Az Ön hozzájárulása, amikor regisztrál a várólistára, (2) A szerződés teljesítése érdekében, (3) Jogszabályi kötelezettségek teljesítése, (4) Az adatkezelő jogos érdeke (például szolgáltatásaink fejlesztése)." | "Ihre persönlichen Daten werden auf folgender rechtlicher Grundlage verarbeitet: (1) Ihre Einwilligung bei der Registrierung für die Warteliste, (2) Zur Erfüllung eines Vertrags, (3) Zur Erfüllung rechtlicher Verpflichtungen, (4) Berechtigte Interessen des Datenverarbeiters (z.B. Verbesserung unserer Dienstleistungen)." | `datenschutz.legalBasis.content` |
| Adattárolás időtartama cím | "Az adatok tárolásának időtartama" | "Dauer der Datenspeicherung" | `datenschutz.dataRetention.title` |
| Adattárolás időtartama tartalom | "Személyes adatait csak addig tároljuk, ameddig az adatkezelés célja megköveteli, vagy ameddig a vonatkozó jogszabályok előírják. Általában a várólista regisztráció adatait 3 évig tároljuk, hacsak Ön nem kéri korábbi törlésüket." | "Ihre persönlichen Daten werden nur so lange gespeichert, wie es der Zweck der Datenverarbeitung erfordert oder gesetzlich vorgeschrieben ist. In der Regel speichern wir Wartelisten-Registrierungsdaten für 3 Jahre, es sei denn, Sie fordern eine frühere Löschung." | `datenschutz.dataRetention.content` |
| Jogok cím | "Az Ön jogai" | "Ihre Rechte" | `datenschutz.rights.title` |
| Jogok bevezetés | "Az Ön személyes adataival kapcsolatban az alábbi jogokkal rendelkezik:" | "Hinsichtlich Ihrer persönlichen Daten haben Sie folgende Rechte:" | `datenschutz.rights.intro` |
| Jog 1 | "Hozzáférési jog - Tájékoztatást kérhet személyes adatai kezeléséről" | "Auskunftsrecht - Sie können Auskunft über die Verarbeitung Ihrer persönlichen Daten verlangen" | `datenschutz.rights.item1` |
| Jog 2 | "Helyesbítési jog - Kérheti személyes adatainak helyesbítését" | "Berichtigungsrecht - Sie können die Berichtigung Ihrer persönlichen Daten verlangen" | `datenschutz.rights.item2` |
| Jog 3 | "Törléshez való jog - Kérheti személyes adatainak törlését" | "Löschungsrecht - Sie können die Löschung Ihrer persönlichen Daten verlangen" | `datenschutz.rights.item3` |
| Jog 4 | "Adatkezelés korlátozásához való jog" | "Recht auf Einschränkung der Verarbeitung" | `datenschutz.rights.item4` |
| Jog 5 | "Adathordozhatóság joga - Kérheti adatainak másik szolgáltatónak történő továbbítását" | "Recht auf Datenübertragbarkeit - Sie können die Übertragung Ihrer Daten an einen anderen Dienstleister verlangen" | `datenschutz.rights.item5` |
| Sütik cím | "Sütik (Cookies)" | "Cookies" | `datenschutz.cookies.title` |
| Sütik tartalom | "Weboldalunk sütiket (cookies) használ a felhasználói élmény javítása érdekében. A sütik olyan kis szöveges fájlok, amelyeket a böngészője tárol az Ön számítógépén. Tovább információért kérjük, tekintse meg a böngészője beállításait a sütik kezelésével kapcsolatban." | "Unsere Website verwendet Cookies, um das Nutzererlebnis zu verbessern. Cookies sind kleine Textdateien, die Ihr Browser auf Ihrem Computer speichert. Weitere Informationen finden Sie in den Einstellungen Ihres Browsers zur Verwaltung von Cookies." | `datenschutz.cookies.content` |
| Adatbiztonság cím | "Adatbiztonság" | "Datensicherheit" | `datenschutz.dataSecurity.title` |
| Adatbiztonság tartalom | "Személyes adatai védelme érdekében megfelelő technikai és szervezési intézkedéseket alkalmazunk, hogy megakadályozzuk az adatok jogosulatlan hozzáférését, módosítását, törlését vagy továbbítását. Azonban kérjük, vegye figyelembe, hogy az interneten keresztüli adatátvitel soha nem 100%-ban biztonságos." | "Zum Schutz Ihrer persönlichen Daten setzen wir angemessene technische und organisatorische Maßnahmen ein, um unbefugten Zugriff, Änderung, Löschung oder Übertragung der Daten zu verhindern. Bitte beachten Sie jedoch, dass die Datenübertragung über das Internet niemals zu 100% sicher ist." | `datenschutz.dataSecurity.content` |
| Kapcsolat cím | "Kapcsolatfelvétel" | "Kontakt" | `datenschutz.contact.title` |
| Kapcsolat tartalom | "Személyes adataival kapcsolatos kérdéseivel vagy kéréseivel forduljon hozzánk:" | "Bei Fragen oder Anliegen bezüglich Ihrer persönlichen Daten kontaktieren Sie uns bitte:" | `datenschutz.contact.content` |
| Kapcsolat email label | "E-mail" | "E-Mail" | `datenschutz.contact.email` |
| Kapcsolat email érték | "info@hotel-trust.site" | "info@hotel-trust.site" | `datenschutz.contact.emailValue` |
| Módosítások cím | "Az adatvédelmi tájékoztató módosítása" | "Änderungen der Datenschutzerklärung" | `datenschutz.changes.title` |
| Módosítások tartalom | "Fenntartjuk a jogot az adatvédelmi tájékoztató módosításához. Jelentős változások esetén értesítjük Önt a módosításokról e-mailben vagy weboldalunkon keresztül. Javasoljuk, hogy rendszeresen tekintse át ezt az adatvédelmi tájékoztatót." | "Wir behalten uns das Recht vor, diese Datenschutzerklärung zu ändern. Bei wesentlichen Änderungen werden wir Sie per E-Mail oder auf unserer Website über die Änderungen informieren. Wir empfehlen, diese Datenschutzerklärung regelmäßig zu überprüfen." | `datenschutz.changes.content` |

---

## 5. COOKIE BANNER

**Fájl:** `messages/hu.json` → `cookies.*`  
**Fájl:** `messages/de.json` → `cookies.*`

| Szöveg | Magyar (hu) | Német (de) | Kulcs |
|--------|-------------|------------|-------|
| Cím | "Sütik (Cookies)" | "Cookies" | `cookies.title` |
| Leírás | "Weboldalunk sütiket használ a felhasználói élmény javítása érdekében. Az adatvédelmi tájékoztatónkat" | "Unsere Website verwendet Cookies, um das Nutzererlebnis zu verbessern. Unsere Datenschutzerklärung finden Sie" | `cookies.description` |
| Link szöveg | "itt" | "hier" | `cookies.link` |
| Elfogadás gomb | "Elfogadom" | "Akzeptieren" | `cookies.accept` |
| Elutasítás gomb | "Elutasítom" | "Ablehnen" | `cookies.decline` |

---

## 6. API VÁLASZOKBAN GENERÁLT SZÖVEGEK

**Megjegyzés:** Ezek a szövegek dinamikusan generálódnak az API-ban (`/api/audit/route.ts`), és nem a translation fájlokból jönnek. A kritikus hibák és javaslatok az API-ban generálódnak a hotel adatai alapján.

### 6.1 Kritikus Hibák (API-ban generált)
**Példák magyarul:**
- "[X] válaszolatlan vélemény található."
- "Az AI nem találja a wellness szolgáltatásokat a weboldaladon."
- "A Gemini AI nem ajánlja a szállodát [város] településen."
- "A ChatGPT AI nem ajánlja a szállodát [város] településen."
- "A Bing AI nem ajánlja a szállodát [város] településen."

**Példák németül:**
- "[X] unbeantwortete Bewertungen gefunden."
- "Die KI findet Ihre Wellness-Angebote nicht auf Ihrer Website."
- "Die Gemini AI empfiehlt das Hotel nicht in [Stadt]."
- "Die ChatGPT AI empfiehlt das Hotel nicht in [Stadt]."
- "Die Bing AI empfiehlt das Hotel nicht in [Stadt]."

### 6.2 Javaslatok (API-ban generált)
**Példák magyarul:**
- "Válaszolj minden Google véleményre 24 órán belül - ez növeli az AI láthatóságot."
- "Növeld a pozitív vélemények arányát - az AI ezt figyelembe veszi az ajánlásoknál."
- "Strukturált adatok közzététele az AI tanításához - mi segítünk ebben."
- "Folyamatos oldal karbantartás és heti riportok küldése - mi rendben tartjuk az oldalát."

**Példák németül:**
- "Beantworten Sie alle Google-Bewertungen innerhalb von 24 Stunden - dies erhöht die KI-Sichtbarkeit."
- "Erhöhen Sie den Anteil positiver Bewertungen - die KI berücksichtigt dies bei Empfehlungen."
- "Strukturierte Daten veröffentlichen, um die KI zu trainieren - wir helfen dabei."
- "Kontinuierliche Seitenwartung und wöchentliche Berichte senden - wir halten Ihre Seite auf dem neuesten Stand."

---

## 7. ÖSSZEFOGLALÁS

### 7.1 Nyelvek
- **Magyar (hu):** `messages/hu.json`
- **Német (de):** `messages/de.json`

### 7.2 Fő szekciók
1. **Waitlist oldal** (`waitlist.*`)
2. **Free Audit oldal** (`audit.*`)
3. **Impressum oldal** (`impressum.*`)
4. **Datenschutz oldal** (`datenschutz.*`)
5. **Cookie Banner** (`cookies.*`)

### 7.3 Hardcoded szövegek
Néhány szöveg hardcoded módon van a komponensekben (pl. mockup szövegek, processing log üzenetek, tooltip szövegek). Ezeket érdemes lenne a translation fájlokba áthelyezni a jövőben.

### 7.4 API generált szövegek
A kritikus hibák és javaslatok az API-ban generálódnak dinamikusan, de a nyelvi logika már be van építve az API kódjába.

---

**Utolsó frissítés:** 2026-01-19
