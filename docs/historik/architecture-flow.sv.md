# Arkitekturflöde

> **Historiskt underlag.** Filen beskriver arkitekturen för den ursprungliga frontenden från [PR #3](https://github.com/Ottowski/nors-kundportal-development/pull/3), med redigering, borttagning och lagring i minnet. Frontenden i `main` är rättad mot specen, se [PR #7](https://github.com/Ottowski/nors-kundportal-development/pull/7), och ärendena sparas i SQLite. Id som R11.5, F1 och A14 syftar på den tidiga specen, inte på `kravspec.md`. Hur koden är uppbyggd nu står i [CLAUDE.md](../../CLAUDE.md), och det som gäller står i [kravspec.md](../specs/kravspec.md) och [verifieringsplan.md](../verifieringsplan.md).

> English version: [architecture-flow.md](architecture-flow.md)

Hur frontend, backend, mockar och tester hänger ihop. Krav-id (R#, A#, F#/Q#) syftar på [specs/](../specs/).

## Översikt

```mermaid
flowchart LR
  subgraph Webbläsare
    UI[React-komponenter<br/>frontend/src/components]
    App[App.tsx<br/>listtillstånd + filter]
    API[api/arendenApi.ts<br/>request + ApiError]
  end
  subgraph Backend[FastAPI backend/app]
    Router[routers/arende_router.py]
    Schema[schemas/arende.py<br/>validering]
    Repo[repositories/arende_repository.py<br/>i minnet]
  end
  MSW[mocks/handlers.ts<br/>MSW]

  UI --> App --> API
  API -- "npm run dev" --> Router
  API -- "npm run dev:mock / tester" --> MSW
  Router --> Schema
  Router --> Repo
```

- `api/arendenApi.ts` är den enda modul som anropar `fetch`.
- Samma API-modul pratar med riktig backend eller med MSW. Komponenterna vet inte vilken.
- Bas-URL: `VITE_API_URL`, standard `http://127.0.0.1:8000`. Backendens CORS tillåter `localhost:5173` och `127.0.0.1:5173`.

## Endpoints

| Metod | Sökväg | Används av | Status |
| --- | --- | --- | --- |
| GET | `/arenden` | `App.tsx` (lista) | Backend + mock |
| GET | `/arenden/{id}` | `ArendeDetail.tsx` | Backend + mock |
| POST | `/arenden` | `ArendeForm.tsx` | Backend + mock |
| POST | `/arenden/{id}/status` | `StatusSelect.tsx` | **Bara mock** (förslag) |
| PUT | `/arenden/{id}` | `ArendeForm.tsx` (redigera) | **Bara mock**, utanför v1.0 |
| DELETE | `/arenden/{id}` | `ArendeDetail.tsx` | **Bara mock**, utanför v1.0 |

Postman-samling för alla: `docs/api/`.

## Frontendmoduler

```
frontend/src/
├── main.tsx              startar MSW-worker i --mode mock, monterar App
├── App.tsx               listtillstånd, filtertillstånd, sidopanel (visa / redigera / nytt)
├── api/
│   ├── arendenApi.ts     listArenden, getArende, createArende, updateStatus, updateArende, deleteArende
│   └── apiError.ts       ApiError, toApiError (FastAPI detail → meddelande + fieldErrors)
├── components/
│   ├── ArendeForm        R1–R4 (nytt) + redigera
│   ├── ArendeList        R6, R11.5
│   ├── ArendeDetail      R7, R10, Redigera / Ta bort
│   ├── StatusSelect      R8, R9
│   ├── SearchFilterBar   R11.1–R11.4
│   └── StatusBadge
├── utils/
│   ├── filterArenden.ts  sökning + filter + sortering (R11, R6)
│   └── formatDate.ts     UTC → lokal tid sv-SE
├── constants/arende.ts   STATUSAR, preliminära KATEGORIER/PRIORITETER (F1/F2)
├── types/arende.ts       Arende, ArendeCreate, ArendeStatus, ArendeFilter
├── mocks/                data.ts (C1–C3), handlers.ts, node.ts, browser.ts
└── test/setup.ts         MSW-server + db.reset per test
```

## Sidlayout

```
┌───────────────────────────────────────────────┬──────────────────────┐
│ Alla ärenden                                  │      [+ Nytt ärende] │
├───────────────────────────────────────────────┼──────────────────────┤
│ Sök / filter                                  │ Sidopanel (aside)    │
│ ┌───────────────────────────────────────────┐ │ visa:   detaljer,    │
│ │ tabell, klick på rad → panelen visar      │ │   Ändra status,      │
│ │ vald rad markeras                         │ │   Redigera, Ta bort  │
│ └───────────────────────────────────────────┘ │ redigera: ArendeForm │
│                                               │ nytt:   ArendeForm   │
└───────────────────────────────────────────────┴──────────────────────┘
```

- Standard: bara listan, panelen stängd. Paneltillstånd i `App.tsx`: `closed | view(id) | edit(arende) | create`.
- Från 900px bredd är panelen en fast kolumn till höger. På mindre skärmar visas den ovanför listan.
- Efter nytt eller redigering: panelen visar det sparade ärendet. Efter borttagning: panelen stängs, meddelande "Ärendet togs bort.".
- Borttagning kräver bekräftelse i panelen ("Ja, ta bort" / "Avbryt").
- Redigera/ta bort styrs av `isEditDeleteEnabled()` (`src/constants/features.ts`): på i `npm run dev:mock`, av i `npm run dev` (knappar avstängda, meddelande "API saknas"). Tvinga med `VITE_ENABLE_EDIT_DELETE=true|false`.
- Varje rad har ikoner för redigera (penna) och ta bort (papperskorg). Redigera öppnar formuläret; ta bort öppnar panelen med bekräftelsen.
- Redigera-formuläret: "Spara ändringar" uppdaterar ärendet (`PUT`); "Spara som nytt ärende" skapar en kopia med status Nytt (`POST`) och lämnar originalet orört.

## Flöde: registrera ärende (R1–R4)

```mermaid
sequenceDiagram
  actor H as Handläggare
  participant F as ArendeForm
  participant A as arendenApi
  participant B as Backend
  participant L as App (listtillstånd)

  H->>F: klickar "Nytt ärende", fyller i fält, klickar "Skapa ärende"
  F->>F: kontroll i klienten (tomt / bara mellanslag)
  alt fält saknas
    F-->>H: meddelande per fält, inget anrop
  else giltigt
    F->>A: createArende(data)
    A->>B: POST /arenden
    alt 201
      B-->>A: Arende (status Nytt, skapad)
      A-->>F: Arende
      F->>L: onCreated(arende) → upsert
      L-->>H: ärendet först i listan, panelen visar detaljer
    else 422
      B-->>A: detail[] (loc, msg)
      A-->>F: ApiError(fieldErrors)
      F-->>H: meddelande vid fältet, inmatning behålls
    end
  end
```

## Flöde: lista, sök och filter (R6, R11)

```mermaid
flowchart LR
  Load[GET /arenden] --> State[(listtillstånd i App)]
  Bar[SearchFilterBar<br/>text vid Enter/Sök, listor direkt] --> Filter[(filtertillstånd)]
  State --> F[filterArenden]
  Filter --> F
  F --> S[sortNewestFirst] --> List[ArendeList]
  List -- 0 rader + filter --> NoHit["Inga ärenden matchar"]
  List -- 0 rader, inget filter --> Empty["Inga ärenden ännu"]
```

- Sökningen körs i frontend på den laddade listan. Skäl: backend har ingen sök-endpoint, och den ignorerar okända query-parametrar (F9 öppen).
- Matchning: rubrik + beskrivning (förslag F7), skiftlägesokänslig med `sv-SE`, trimmad. Ren textmatchning utan regex, så `%`, `_`, `<script>` är ofarliga.
- Om F9 stängs som "backend": ersätt `filterArenden` med query-parametrar i `listArenden` och behåll komponenternas API.

## Flöde: detaljer och statusändring (R7–R10)

```mermaid
sequenceDiagram
  participant L as ArendeList
  participant D as ArendeDetail
  participant S as StatusSelect
  participant A as arendenApi
  participant B as Backend / MSW

  L->>D: onSelect(id)
  D->>A: getArende(id)
  A->>B: GET /arenden/{id}
  alt 404
    B-->>D: "Ärendet hittades inte" (R10)
  else 200
    B-->>D: Arende → alla fält (R7)
    S->>A: updateStatus(id, status)
    A->>B: POST /arenden/{id}/status
    alt 200
      B-->>S: uppdaterat Arende → D + upsert i App (R8)
    else 422
      B-->>S: meddelande, listan behåller gammal status (R9)
    end
  end
```

## Felhantering

| Källa | Exempel | Visas för användaren |
| --- | --- | --- |
| 422 validering | `detail: [{loc: ["body","rubrik"], msg: "Value error, Får inte vara tomt…"}]` | Fältmeddelande "Får inte vara tomt…" + "Kontrollera fälten och försök igen." |
| 404 | `detail: "Ärendet hittades inte"` | Samma text |
| Nätverket nere | fetch kastar fel | "Kunde inte nå servern. Försök igen." + knapp "Försök igen" på listan |
| Övrigt / inte JSON | 500 | "Något gick fel. Försök igen." |

All översättning av fel finns i `api/apiError.ts` (`toApiError`).

## Testnivåer

| Nivå | Verktyg | Filer | Täcker |
| --- | --- | --- | --- |
| Enhet | Vitest | `utils/filterArenden.test.ts`, `api/arendenApi.test.ts` | R11-regler, felöversättning |
| Komponent | Testing Library + MSW | `components/*.test.tsx` | A1–A4, A7–A10, redigera/ta bort |
| App | Testing Library + MSW | `App.test.tsx` | A1, A6, A8, A14–A16, XSS-text |
| API | Postman / Newman | `docs/api/*.json` | Riktig backend: A1–A3, A6, A7, A10 |
| Manuellt / webbläsare | Playwright (valfritt) | — | Röktest mot riktig backend |

## Byggcykel

```mermaid
flowchart LR
  A[prettier --check] --> B[eslint] --> C[tsc -b] --> D[vitest run] --> E[vite build]
```

- Lokalt: `cd frontend && npm run check`.
- CI: `.github/workflows/frontend.yml` kör `npm ci` + `npm run check` på pull requests som ändrar `frontend/`.

## Kända luckor

- Redigering och borttagning ligger utanför v1.0 (ADR-002, specens "Out of scope"). De fungerar bara mot mockar. Teamet måste uppdatera ADR-002 och backend måste lägga till `PUT`/`DELETE /arenden/{id}` innan de fungerar på riktigt.
- Statusändring stöds av backend. Sökning och filtrering körs fortfarande i frontenden på den hämtade listan.
- Lagringen ligger i minnet, så R5 (finns kvar efter omstart) uppfylls inte. Uppgift för backend.
- Kategorier, prioriteter, listordning och feltexter använder förslag (F1, F2, F6, F12).
