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

Imorgon fokuserar jag på `candidates`-tabellen och att skapa relationer mellan sökande och specifika jobb.
+