# Arkitektur, domänmodell och API-kontrakt

## Mappstruktur

```
/
├── frontend/                  React + TypeScript (Vite)
│   ├── src/
│   │   ├── api/               HTTP-anrop mot backend, inget annat
│   │   ├── components/        Återanvändbara, domänneutrala UI-delar (Button, Badge, Alert …)
│   │   ├── features/tickets/  Allt som rör ärenden: vyer, formulär, filter, hooks
│   │   ├── domain/            Typer, tillåtna värden, visningsnamn, klientvalidering
│   │   ├── styles/            tokens.css och globala stilar
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── backend/                   Python + FastAPI
│   ├── app/
│   │   ├── api/               FastAPI-routes och request/response-scheman
│   │   ├── services/          Applikationslogik och regler
│   │   ├── storage/           SQLite: anslutning, schema, repository
│   │   ├── domain/            Enums, dataklasser, validering, feltyper
│   │   └── main.py            create_app()
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   └── pyproject.toml
└── docs/
```

Skapa inte fler toppmappar. Ny kod hittar sin plats i befintlig struktur.

## Lager och beroenderiktning

```
Frontend:  features → api → (HTTP) → Backend:  api → services → storage
                ↘ domain                             ↘ domain ↙
```

- `api/` (backend) tar emot HTTP, anropar en service och översätter resultat/fel till HTTP. Ingen SQL, inga affärsregler.
- `services/` innehåller reglerna: trimning, validering, startstatus, skapandetid. Pratar med lagring bara via repository.
- `storage/` är det enda stället där SQL skrivs. Ingen validering här utöver databasens egna constraints.
- `domain/` får importeras av alla lager men importerar inget från dem.
- I frontend anropar komponenter aldrig `fetch` direkt – alltid via `src/api/`.

## Ordlista

| Svenska (UI) | Kod | Värden i API och databas |
|---|---|---|
| Ärende | `ticket` | – |
| Ärende-ID | `id` | heltal, visas som `#1042` |
| Rubrik | `title` | – |
| Beskrivning | `description` | – |
| Kategori | `category` | `invoice` (Faktura), `technical_support` (Teknisk support), `other` (Övrigt) |
| Prioritet | `priority` | `low` (Låg), `normal` (Normal), `high` (Hög) |
| Status | `status` | `new` (Nytt), `in_progress` (Pågående), `waiting_for_customer` (Väntar på kund), `closed` (Avslutat) |
| Skapad | `created_at` | ISO 8601 i UTC, t.ex. `2026-10-27T09:14:03Z` |
| Statusfilter | `status` (query-parameter) | samma värden som status; utelämnad = Alla |

Enum-värden är alltid engelska `snake_case` i kod, API och databas. Svenska namn finns bara i frontendens visningslager.

## Fältregler (från kravspecifikationen avsnitt 4)

| Fält | Regel | Konstant |
|---|---|---|
| `title` | Obligatorisk, 1–100 tecken efter trimning | `TITLE_MAX_LENGTH = 100` |
| `description` | Obligatorisk, 1–5 000 tecken efter trimning | `DESCRIPTION_MAX_LENGTH = 5000` |
| `category` | Ett av de tre värdena | – |
| `priority` | Ett av de tre värdena | – |
| `status` | Sätts till `new` av backend vid skapande | – |
| `created_at` | Sätts av backend, ändras aldrig | – |

**Teknisk definition av tecken:** längd räknas i Unicode-kodpunkter efter trimning av blanksteg i början och slutet.
- Python: `len(value.strip())`
- TypeScript: `[...value.trim()].length` – **inte** `value.length`, som räknar UTF-16-enheter och ger fel för t.ex. emoji.

Inre blanksteg och radbrytningar i `description` bevaras.

**Tid:** lagras som ISO 8601-text i UTC med `Z`. Visas i gränssnittet i tidszonen `Europe/Stockholm` med formatet `27 okt 2026, 09:14` (detalj) eller `27 okt 09:14` (lista).

## API-kontrakt

Bas-URL: `/api`. JSON in och ut. Fältnamn i `snake_case`.

| Metod | Sökväg | Krav | Lyckat svar |
|---|---|---|---|
| `GET` | `/api/tickets` | K4 | `200` + lista, nyast först |
| `GET` | `/api/tickets?status=in_progress` | K8 | `200` + filtrerad lista, nyast först |
| `GET` | `/api/tickets/{id}` | K5 | `200` + ärende |
| `POST` | `/api/tickets` | K1, K2 | `201` + skapat ärende |
| `PATCH` | `/api/tickets/{id}/status` | K6 | `200` + uppdaterat ärende |

**Ärende i svar:**

```json
{
  "id": 1042,
  "title": "Åkband dubbeldebiterat vid onlineköp",
  "description": "Kunden (påhittad: Anna Exempel) …",
  "category": "invoice",
  "priority": "high",
  "status": "in_progress",
  "created_at": "2026-10-27T09:14:03Z"
}
```

**Lista:** `{ "items": [ … ] }` – alltid ett objekt, aldrig en bar array, så att fält kan läggas till senare.

**Skapa:** `{ "title", "description", "category", "priority" }`. Andra fält i anropet ignoreras – klienten kan aldrig sätta `id`, `status` eller `created_at`.

**Ändra status:** `{ "status": "waiting_for_customer" }`. Att välja samma status igen är ett lyckat anrop som inte ändrar något (T12).

## Felformat

Alla fel från backend har samma form:

```json
{
  "error": {
    "code": "validation_error",
    "message": "Ärendet kunde inte sparas. Rätta de markerade fälten.",
    "fields": {
      "title": "Ange en rubrik",
      "priority": "Välj en prioritet"
    }
  }
}
```

| Situation | HTTP | `code` | Exempel på `message` |
|---|---|---|---|
| Ogiltig inmatning (K2, K6) | 422 | `validation_error` | Ärendet kunde inte sparas. Rätta de markerade fälten. |
| Okänt ärende-ID (K5, K6) | 404 | `ticket_not_found` | Ärendet kunde inte hittas. |
| Lagringsfel (K7) | 503 | `storage_error` | Ändringen kunde inte sparas. Försök igen. |
| Oväntat fel | 500 | `internal_error` | Något gick fel. Försök igen. |

- `fields` finns bara vid `validation_error` och har fältnamn som nycklar.
- `message` och `fields` är svenska och kan visas direkt för användaren.
- Tekniska detaljer (stacktrace, SQL, filsökvägar) skickas aldrig till klienten – de loggas i backend.
