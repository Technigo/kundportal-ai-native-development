# Arkitektur, ordlista och fältregler

## Mappstruktur

```
/
├── docker-compose.yml         MySQL för utveckling (mysql) och test (mysql-test, profil "test")
├── .env.example               Mall för lokal .env – .env checkas aldrig in
├── frontend/                  React + TypeScript + Vite
│   ├── src/
│   │   ├── api/               HTTP-anrop mot backend, inget annat
│   │   ├── components/        Återanvändbara, domänneutrala UI-delar (Button, Badge, Alert …)
│   │   ├── features/tickets/  Allt som rör ärenden: vyer, formulär, filter, hooks
│   │   ├── domain/            Typer, maskinvärden, visningsnamn, felmeddelanden, klientvalidering
│   │   ├── styles/            tokens.css och globala stilar
│   │   ├── test-setup.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── backend/                   FastAPI + SQLAlchemy + Alembic + MySQL
│   ├── app/
│   │   ├── main.py            FastAPI-appen, CORS, felhanterare, health-endpoints
│   │   ├── tickets.py         Router för /api/tickets
│   │   ├── schemas.py         Pydantic: request/response, maskinvärden, trimning, längdgränser
│   │   ├── models.py          SQLAlchemy-modeller och CHECK-constraints
│   │   ├── database.py        Engine, sessioner (get_session), DATABASE_URL
│   │   ├── api_errors.py      ApiError
│   │   └── seed_demo.py       Påhittad demodata, körs uttryckligen
│   ├── migrations/            Alembic
│   ├── tests/
│   └── requirements.txt
└── docs/                      Kravspecifikation, API-kontrakt, verifieringsplan, design
```

Skapa inte fler toppmappar. Ny kod hittar sin plats i befintlig struktur. En ny resurs i backend får en egen router-modul bredvid `tickets.py`.

## Beroenderiktning

```
Frontend:  features → api → (HTTP) → Backend:  tickets.py → schemas.py / models.py → database.py
                ↘ domain
```

- I backend ligger validering i `schemas.py` (Pydantic) och databasregler i `models.py`. Routes i `tickets.py` läser in, gör databasoperationen och returnerar.
- I frontend anropar komponenter aldrig `fetch` direkt – alltid via `src/api/`.

## API-kontraktet

Endpoints, JSON-fält, maskinvärden, statuskoder, felformat och tidsformat står i [docs/api-kontrakt.md](../../../../docs/api-kontrakt.md). Läs det där – skillen upprepar det inte.

Ändra aldrig API:ts form (fält, värden, koder, felstruktur) bara i koden. Ändringen görs i kontraktet först, i en PR som både frontend och backend granskar.

## Ordlista

| Svenska (UI) | Kod och API |
|---|---|
| Ärende | `ticket` |
| Ärende-ID | `id` – visas som `#42` |
| Kund-ID | `customer_id` – anges manuellt, inte samma sak som ärende-ID |
| Kundnamn | `customer_name` |
| Rubrik | `title` |
| Beskrivning | `description` |
| Kategori | `category` |
| Prioritet | `priority` |
| Status | `status` |
| Skapad | `created_at` |
| Statusfilter | query-parametern `status`; utelämnad = Alla |

Maskinvärdena för kategori, prioritet och status och deras svenska text finns i API-kontraktet. Observera att kategorin Faktura heter `billing`.

## Fältregler

Exakta regler finns i kravspecifikationen avsnitt 4. Det viktigaste för koden:

- `customer_id` 1–100, `customer_name` 1–200, `title` 1–100 och `description` 1–5 000 tecken **efter trimning**.
- **Trimning** tar bara bort tecken i början och slutet, och bara den uttryckliga `White_Space`-mängden i kravspecifikationen. Backend har den som `WHITE_SPACE` i `schemas.py`. Frontend ska ha **exakt samma** mängd i `frontend/src/domain/text.ts`. Använd aldrig JavaScripts `.trim()` eller Pythons `.strip()` utan argument – de tar bort andra tecken.
- **Längd** räknas i Unicode-kodpunkter. TypeScript: `[...value].length`, **inte** `value.length`, som räknar UTF-16-enheter och ger fel för t.ex. emoji. Python: `len(value)`.
- `id`, `status` och `created_at` sätts alltid av backend.
- Status är det enda fält som kan ändras efter registrering. Det finns ingen radering.
