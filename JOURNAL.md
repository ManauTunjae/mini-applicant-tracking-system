# 📓 Utvecklingsjournal: Mini-ATS

## Dag 1: Arkitektur, Databaser & Flöde 🏗️

### Genomförande & Beslut

Val av Tech Stack: Jag valde Vite + React för frontend och Supabase som Backend-as-a-Service. Detta beslut togs för att maximera utvecklingshastigheten och fokusera på affärslogik snarare än serverkonfiguration.

Datamodellering & Relationer: Jag designade tabellerna jobs och candidates med en tydlig Foreign Key-relation mellan dem. Genom att implementera customer_id tidigt lade jag grunden för ett system där olika rekryterare kan hantera sina egna annonser utan dataläckage.

Publik Ansökningssida: Jag skapade en publik /apply/:jobId-rutt med React Router. Detta simulerar ett verkligt scenario där kandidater kan söka jobb utan att behöva logga in, vilket sänker tröskeln för ansökningar.

### Problemlösning & Lärdomar

Säkerhet & RLS: Under utvecklingen brottades jag med Supabase Row Level Security (RLS). För att bibehålla momentet i prototypfasen valde jag att styra datasäkerheten via strikt filtrering i källkoden genom att använda .eq('customer_id', user.id) vid varje databasrop.

Refaktorering för Prestanda: Jag upptäckte tidigt att koden innehöll dupliserad logik för att hämta data. Genom att slå ihop flera funktioner till en optimerad fetchData minskade jag antalet nätverksanrop och gjorde applikationen mer responsiv.

## Dag 2: AI-automation & Professionell Finish 🤖💎

### Genomförande & Beslut

Innovativ AI-analys (Simulerad): Jag implementerade en logik som analyserar kandidaternas profiltexter. Genom att använda Promise.all för bulk-uppdateringar kan rekryteraren nu analysera hundratals kandidater samtidigt, vilket sparar enormt med tid.

Dynamisk Statusshantering: Jag skapade en direktkoppling mellan gränssnittets dropdown-menyer och Supabase. Rekryterare kan nu flytta kandidater genom hela anställningsprocessen (från Interview till Hired) med omedelbar synkning i databasen.

Strategi för Soft Delete: Istället för att radera jobb permanent implementerade jag en is_deleted-flagga.

Varför? I moderna affärssystem är data guld. Genom att arkivera istället för att radera behåller vi historik för framtida statistik och skyddar kunden från att förlora information av misstag.

### UI/UX & Designval

Visuell Hierarki: Jag optimerade Dashboarden med en balanserad grid-layout (1600px max-bredd) för att hantera stora mängder data utan att det känns rörigt.

Användarvänlig Arkivering: Jag valde att flytta "Arkivera"-knappen till en diskret position uppe till höger på korten. Genom att använda röd text och lägre opacitet separeras de administrativa valen från de dagliga uppgifterna, vilket minskar risken för felklick.

Branding & Autentisering: Inloggningssidan fick en modern "Premium Look" med gradients och tydlig branding för att inge förtroende hos kunden.

### 🏁 Status: MVP Komplett ✅

Applikationen uppfyller nu alla uppsatta kärnkrav och är redo för demo. Jag har skapat ett sömlöst flöde från att en rekryterare skapar ett jobb till att en kandidat söker det, och slutligen att AI-insikter hjälper till i urvalet.

Slutgiltig reflektion: Att arbeta med AI-verktyg som parprogrammerare har radikalt ökat min hastighet. Min viktigaste roll har varit arkitekten som granskar koden för att säkerställa att den är skalbar, säker och följer principen "Don't Repeat Yourself" (DRY).
