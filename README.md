# Mini-ATS (Applicant Tracking System) 🚀

Detta är ett modernt, lättviktigt rekryteringsverktyg byggt som ett arbetsprov för Jonas. Projektet fokuserar på snabb utveckling med AI-hävstång (Vibe Coding), säkerhet och skalbarhet.

## 🌟 Huvudfunktioner (Hittills)

- **Fullstack Auth:** Säker inloggning och registrering via Supabase Auth.
- **Multi-tenancy:** Arkitektur som separerar data mellan olika kunder (konton). En användare ser endast sina egna jobbannonser.
- **Real-time Dashboard:** En vy som hämtar och visar aktiva jobbannonser direkt från databasen.
- **Job Creation:** Interaktivt formulär för att skapa nya jobbannonser med omedelbar uppdatering av gränssnittet.

## 🛠 Tech Stack

- **Frontend:** React (Vite)
- **Backend/Database:** Supabase (PostgreSQL)
- **Styling:** Modern Inline CSS / CSS-in-JS
- **Utvecklingsverktyg:** Cursor AI (för ökad utvecklingshastighet och Code Review)

## 👩🏻‍💻 Utvecklingsprocess & "Vibe Coding"

Projektet har utvecklats med en AI-first-metodik:

1. **Initial Setup:** Grundstruktur i React och manuell konfiguration av Supabase-klienten.
2. **AI-Acceleration:** Implementering av Cursor AI för att snabbt generera komponenter och logik.
3. **Mänsklig kontroll:** Manuell finjustering av dataintegritet (t.ex. normalisering av jobbstatus) och säkerhetspolicys (RLS).

## 📊 Databasstruktur (Supabase)

Tabellen `jobs` innehåller följande fält:

- `id`: Unikt ID (Auto-genererat)
- `title`: Jobbtitel
- `company`: Företagsnamn
- `status`: Nuvarande status (Default: 'Open')
- `customer_id`: Koppling till den inloggade användarens unika ID.

## 🚀 Nästa milstolpe

- Implementering av `candidates`-tabellen.
- Koppling av kandidater till specifika jobb-ID:n.
- Funktion för att ändra status på jobb (Open/Closed).
