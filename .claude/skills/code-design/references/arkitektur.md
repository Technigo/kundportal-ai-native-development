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
├── backend/                   Python (ramverk väljs av Danielle)
│   ├── app/
│   │   ├── api/               Routes och request/response-scheman – enda ramverksberoende lagret
│   │   ├── services/          Applikationslogik och regler
│   │   ├── storage/           SQLite: anslutning, schema, repository
│   │   ├── domain/            Enums, dataklasser, validering, feltyper
│   │   └── main.py            create_app(db_path)
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
| Kund-ID | `customer_id` | text, anges manuellt – inte samma sak som ärende-ID |
| Kundnamn | `customer_name` | text, anges manuellt |
| Rubrik | `title` | – |
| Beskrivning | `description` | – |
| Kategori | `category` | `invoice` (Faktura), `technical_support` (Teknisk support), `other` (Övrigt) |
| Prioritet | `priority` | `low` (Låg), `normal` (Normal), `high` (Hög) |
| Status | `status` | `new` (Nytt), `in_progress` (Pågående), `waiting_for_customer` (Väntar på kund), `closed` (Avslutat) |
| Skapad | `created_at` | ISO 8601 i UTC, t.ex. `2026-10-27T09:14:03Z` |
| Statusfilter | `status` (query-parameter) | samma värden som status; utelämnad = Alla |

Enum-värden är alltid engelska `snake_case` i kod, API och databas. Svenska namn finns bara i frontendens visningslager.

## Fältregler

Från kravspecifikationen avsnitt 4. Ändras reglerna där gäller de, och den här tabellen rättas.

| Fält | Regel | Konstant |
|---|---|---|
| `id` | Heltal, skapas av databasen, ändras aldrig. Ingen obruten nummerföljd utlovas. | – |
| `customer_id` | Obligatorisk, inte tom efter trimning. Behöver inte vara unikt – samma kund kan ha flera ärenden. Format och längdgräns: **öppet beslut**. | – |
| `customer_name` | Obligatorisk, inte tom efter trimning. Inre blanksteg bevaras. Längdgräns: **öppet beslut**. | – |
| `title` | Obligatorisk, 1–100 tecken efter trimning | `TITLE_MAX_LENGTH = 100` |
| `description` | Obligatorisk, 1–5 000 tecken efter trimning | `DESCRIPTION_MAX_LENGTH = 5000` |
| `category` | Ett av de tre värdena | – |
| `priority` | Ett av de tre värdena | – |
| `status` | Sätts till `new` av backend vid skapande | – |
| `created_at` | Sätts av backend, ändras aldrig | – |

Alla fyra textfält (`customer_id`, `customer_name`, `title`, `description`) trimmas före validering och lagring. Text med enbart blanksteg räknas som tom. Inre blanksteg och radbrytningar i `description` bevaras.

**Trimning – förslag, fastställs i API-kontraktet.** Pythons `str.strip()` och JavaScripts `String.prototype.trim()` tar inte bort exakt samma tecken. Därför används en egen funktion på båda sidor med samma uttryckliga teckenmängd: alla tecken med Unicode-egenskapen `White_Space` plus `U+FEFF`.
- Python: `trim_text(value)` i `backend/app/domain/text.py`
- TypeScript: `trimText(value)` i `frontend/src/domain/text.ts`

Gemensamma testfall på båda sidor: blanksteg, tabbar, radbrytningar, emoji och längdgränserna.

**Längd:** Unicode-kodpunkter efter trimning (kravspecifikationen avsnitt 4).
- Python: `len(trim_text(value))`
- TypeScript: `[...trimText(value)].length` – **inte** `value.length`, som räknar UTF-16-enheter och ger fel för t.ex. emoji. En sammansatt emoji kan räknas som flera tecken, och det är avsiktligt.

**Tid:** lagras i UTC och skickas som ISO 8601 med `Z`, t.ex. `2026-10-30T14:30:00Z`. Förslag på precision: hela sekunder. Gränssnittet visar svensk datumformatering i **användarens lokala tidszon** (ange ingen fast tidszon): `27 okt 2026 09:14` i detaljvyn och `27 okt 09:14` i listan, via `Intl.DateTimeFormat('sv-SE', …)`.

## API-kontrakt – förslag

Detta är ett **förslag** som teamet fastställer gemensamt (kravspecifikationen avsnitt 8). Det fungerar oberoende av vilket Python-ramverk som väljs. När kontraktet är fastställt: ta bort ordet "förslag" här och ändra bara kontraktet genom en PR som både frontend och backend granskar.

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
  "customer_id": "K-20431",
  "customer_name": "Anna Exempel",
  "title": "Åkband dubbeldebiterat vid onlineköp",
  "description": "Kunden köpte två åkband online men har dragits för fyra …",
  "category": "invoice",
  "priority": "high",
  "status": "in_progress",
  "created_at": "2026-10-27T09:14:03Z"
}
```

**Lista:** `{ "items": [ … ] }` – alltid ett objekt, aldrig en bar array, så att fält kan läggas till senare.

**Skapa:** `{ "customer_id", "customer_name", "title", "description", "category", "priority" }`. Andra fält i anropet ignoreras – klienten kan aldrig sätta `id`, `status` eller `created_at`.

**Ändra status:** `{ "status": "waiting_for_customer" }`. Att välja samma status igen är ett lyckat anrop som inte ändrar något (T12). Status är det enda fält som kan ändras efter registrering – det finns inga endpoints för att redigera eller radera ärenden.

## Felformat

Alla fel från backend har samma form:

```json
{
  "error": {
    "code": "validation_error",
    "message": "Ärendet kunde inte sparas. Rätta de markerade fälten.",
    "fields": {
      "customer_id": "Ange kund-ID",
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
