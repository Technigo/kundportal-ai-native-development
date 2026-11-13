# Kundserviceportalen

Skelett för kursprojektet *Bygg Kundserviceportalen med AI-stöd*. En handläggare ska kunna registrera ett kundärende, se det i en lista, öppna detaljer, ändra status och ändra övriga fält. Kravet och acceptanskriterierna finns i [SPECIFIKATION.md](SPECIFIKATION.md). Endast påhittade kunduppgifter används.

> **Status:** skelett. Servern, databasen, routing, felhantering och sidans ramverk fungerar. Själva funktionerna är platshållare som svarar `501 Inte byggt ännu` tills de byggs. Se [docs/ARBETSFORDELNING.md](docs/ARBETSFORDELNING.md) för vem som bygger vad.

## Krav

- Node.js **22.13 eller nyare** (SQLite följer med i Node via `node:sqlite`, ingen extra databasserver behövs).
- npm.

## Kom igång

```bash
npm install        # installerar Vitest (och jsdom för frontendtesterna)
npm start          # startar servern på http://localhost:3000
```

Öppna <http://localhost:3000>. Backend serverar `frontend/index.html`, så det är en enda process.
Databasen sparas i `backend/data/portal.db`. Ta bort filen för att börja om. Node skriver en varning om att SQLite är experimentellt – det är väntat.

Valfria miljövariabler: `PORT` (standard 3000) och `DB_PATH` (standard `backend/data/portal.db`).

## Tester

```bash
npm test               # backend + frontend
npm run test:backend
npm run test:frontend
```

Tester som inte är skrivna än är markerade `todo` och räknas som väntande, inte som godkända.

## Struktur

```
SPECIFIKATION.md        Kraven och acceptanskriterierna (AK1–AK16)
AGENTS.md               Instruktioner till AI-agenter i projektet
docs/                   API-kontrakt, arbetsfördelning, verifieringsplan
backend/
  src/
    server.js           Startar servern
    app.js              Routing, JSON-läsning, felhantering
    db.js               Öppnar SQLite och skapar tabellen
    constants.js        Kategorier, statusar och gränsvärden
    errors.js           ValidationError, NotFoundError, NotImplementedError
    validation/         Fältregler (Del 1)
    handlers/           En fil per endpoint
    repository/         En fil per databasoperation
  tests/                Vitest + tests/helpers/testServer.js
frontend/
  index.html            Hela gränssnittet i en HTML-fil (HTML, CSS och JS)
  tests/                Vitest + jsdom
```

## Konventioner

- **Fältnamn är svenska och motsvarar specen**: `arendenummer`, `rubrik`, `beskrivning`, `kategori`, `prioritet`, `status`, `skapad`, `deadline`. Det gör det enkelt att följa ett krav från spec till kod och test. Funktions- och filnamn är engelska.
- Felmeddelanden som användaren ser är på svenska.
- Testnamn börjar med acceptanskriteriet, t.ex. `AK3: …`.
