# Utvecklingsjournal: Mini-ATS 👩🏻‍💻

## Dag 1: Grunden och AI-accelerationen

_18 mars 2026_

### Dagens mål

Sätta upp en fungerande Fullstack-app med autentisering och en dashboard som kan hantera realtidsdata för jobbannonser.

### Genomförande & Beslut

1. **Setup:** Valde Vite + React för snabbhet och Supabase för att slippa bygga en egen backend från grunden.
2. **Auth:** Implementerade Login/Register manuellt först för att förstå flödet, sedan använde jag Cursor för att snygga till UI:t.
3. **Övergång till Cursor:** Efter inledande setup gick jag över till "Vibe Coding" i Cursor. Det ökade hastigheten i utvecklingen av Dashboarden med ca 3-4x.
4. **Data-modellering:** Skapade tabellen `jobs`. Insåg vikten av `customer_id` tidigt för att säkerställa att kunder inte ser varandras data.

### Problemlösning (Dagens "Aha!")

- **RLS-utmaningen:** Vid första testet av Dashboarden var listan tom trots data i databasen. Identifierade att Supabase RLS (Row Level Security) blockerade anropet. Valde att tillfälligt inaktivera RLS för test, men implementerade istället strikt filtrering i koden (`.eq('customer_id', user.id)`) för att bibehålla säkerheten.
- **Casing-bugg:** Märkte att status-taggar blev röda istället för gröna. Hittade felet: en mix av "open" och "Open". Normaliserade databasen till "Open" för konsekvent UI-rendering.

### Reflektion

Att jobba med Cursor känns som att ha en senior parprogrammerare. Det är lätt att bygga snabbt, men jag märker att min viktigaste roll är att granska koden (Code Review) och se till att logiken i databasen faktiskt matchar det AI:n skriver.

### Nästa steg

Fokuserar jag på `candidates`-tabellen och att skapa relationer mellan sökande och specifika jobb.

## Dag 1: Kvällsuppdatering – Datarelationer & Refaktorering 📊

### Genomförande

1. **Relationsdatabas:** Skapade `candidates`-tabellen i Supabase och satte upp en `Foreign Key` (`int8`) mot `jobs.id`.
2. **Data-populering:** Genererade och importerade 30 fiktiva kandidater via SQL Editor för att stresstesta Dashboardens UI och pagination-tänk.
3. **Refaktorering:** Upptäckte dupliserad logik i `Dashboard.jsx`. Slog ihop `fetchJobs` och `fetchCandidates` till en optimerad `fetchData`-funktion. Detta minskar antalet nätverksanrop och gör appen snabbare.
4. **UI-förbättringar:** - Implementerade "Conditional Rendering" för kandidatlistan.
   - Flyttade ut CSS-styling till ett separat `styles`-objekt för ökad läsbarhet (Clean Code).

### Tekniska utmaningar

- **RLS (Row Level Security):** Kandidaterna dök inte upp initialt i gränssnittet trots att de fanns i databasen. Identifierade att RLS behövde konfigureras för `candidates`. Valde att inaktivera RLS tillfälligt för snabbare prototyping, men planerar att implementera strikta policies innan produktion.
- **Data Mismatch:** Säkerställde att datatyperna matchade (`int8` mot `int8`) mellan tabellerna för att undvika join-fel.

### Reflektion

Det är fascinerande hur snabbt man kan gå från en idé till en fungerande prototyp med Cursor. Den största lärdomen idag har varit att AI:n är fantastisk på att generera kod, men det krävs mänsklig kontroll för att hålla koden "DRY" (Don't Repeat Yourself). Genom att städa upp de dupliserade funktionerna nu har jag sparat mycket teknisk skuld inför morgondagen.

### Status: MILSTOLPE 1 KLAR ✅

- Auth fungerar.
- Dashboard visar jobb och tillhörande kandidater.
- Koden är rensad och pusshad till `main`.

## Dag 1: Nattpasset – Den kompletta kandidatresan 🚀

### Genomförande & Beslut

1. **Public Apply Page:** Skapade komponenten `ApplyJob.jsx`. Beslutet togs att göra den helt publik (utan auth) för att simulera en riktig jobbansökan där kandidaten inte behöver logga in.
2. **Dynamisk Routing:** Implementerade `:jobId` i React Router. Detta gör att en enda komponent kan hantera ansökningar för alla tusentals potentiella jobb genom att hämta rätt kontext (`title`, `company`) direkt från databasen baserat på URL:en.
3. **Data Integrity:** Säkerställde att ansökningar konverteras till rätt datatyp (`parseInt`) innan de skickas till Supabase för att undvika typ-fel mot databasens primärnycklar.

### Tekniska utmaningar & Lärdomar

- **React Hooks Dependency Hell:** Kämpade med linter-varningar i `useCallback` och `useEffect`. Lärde mig vikten av att hålla "dependency-arrayen" ren för att undvika oändliga renderings-loopar, men också när man kan använda `// eslint-disable-line` för att prioritera applikationens stabilitet över strikta regler.
- **UX-detaljer:** Insåg att en "Return Home"-länk kräver en `to="/"`-prop för att fungera i React Router. Det är de små detaljerna som avgör om en app känns "trasig" eller "proffsig".

### Reflektion inför morgondagen 🧠

Applikationen uppfyller nu kärnkraven för en ATS (Jobbhantering + Ansökningsflöde). Jag har byggt en solid "motor". Imorgon vill jag skifta fokus från funktion till **estetik och avancerad interaktion**.

**Idéer för Dag 2:**

- **Modern Styling:** Gå ifrån standard-UI till en mer "High-end" känsla (Dark mode-option eller glasfomism?).
- **Drag-and-Drop:** Skulle det vara möjligt att flytta kandidater mellan olika status-steg (Pipeline-vy)?
- **Analys:** En enkel graf som visar antal ansökningar över tid på Dashboarden.

### Status: MILSTOLPE 2 KLAR 🏆

- Komplett "End-to-End" flöde (Rekryterare -> Kandidat -> Databas -> Dashboard).
- Clean code-refaktorering genomförd på båda huvudkomponenterna.
- Git-historiken är ren och väldokumenterad.
