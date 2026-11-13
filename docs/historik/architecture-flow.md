# Architecture flow

> **Historiskt underlag.** Filen beskriver arkitekturen för den ursprungliga frontenden från [PR #3](https://github.com/Ottowski/nors-kundportal-development/pull/3), med redigering, borttagning och lagring i minnet. Frontenden i `main` är rättad mot specen, se [PR #7](https://github.com/Ottowski/nors-kundportal-development/pull/7), och ärendena sparas i SQLite. Id som R11.5, F1 och A14 syftar på den tidiga specen, inte på `kravspec.md`. Hur koden är uppbyggd nu står i [CLAUDE.md](../../CLAUDE.md), och det som gäller står i [kravspec.md](../specs/kravspec.md) och [verifieringsplan.md](../verifieringsplan.md).

> Svensk version: [architecture-flow.sv.md](architecture-flow.sv.md)

How the frontend, backend, mocks and tests fit together. Requirement ids (R#, A#, Q#) refer to [specs/](../specs/).

## Overview

```mermaid
flowchart LR
  subgraph Browser
    UI[React components<br/>frontend/src/components]
    App[App.tsx<br/>list state + filter]
    API[api/arendenApi.ts<br/>request + ApiError]
  end
  subgraph Backend[FastAPI backend/app]
    Router[routers/arende_router.py]
    Schema[schemas/arende.py<br/>validation]
    Repo[repositories/arende_repository.py<br/>in-memory]
  end
  MSW[mocks/handlers.ts<br/>MSW]

  UI --> App --> API
  API -- "npm run dev" --> Router
  API -- "npm run dev:mock / tests" --> MSW
  Router --> Schema
  Router --> Repo
```

- `api/arendenApi.ts` is the only module that calls `fetch`.
- The same API module talks to the real backend or to MSW. Components do not know which one.
- Base URL: `VITE_API_URL`, default `http://127.0.0.1:8000`. Backend CORS allows `localhost:5173` and `127.0.0.1:5173`.

## Endpoints

| Method | Path | Used by | Status |
| --- | --- | --- | --- |
| GET | `/arenden` | `App.tsx` (list) | Backend + mock |
| GET | `/arenden/{id}` | `ArendeDetail.tsx` | Backend + mock |
| POST | `/arenden` | `ArendeForm.tsx` | Backend + mock |
| POST | `/arenden/{id}/status` | `StatusSelect.tsx` | **Mock only** (proposed) |
| PUT | `/arenden/{id}` | `ArendeForm.tsx` (edit) | **Mock only**, outside v1.0 scope |
| DELETE | `/arenden/{id}` | `ArendeDetail.tsx` | **Mock only**, outside v1.0 scope |

Postman collection for all of them: `docs/api/`.

## Frontend modules

```
frontend/src/
├── main.tsx              starts MSW worker in --mode mock, mounts App
├── App.tsx               list state, filter state, side panel (view / edit / create)
├── api/
│   ├── arendenApi.ts     listArenden, getArende, createArende, updateStatus, updateArende, deleteArende
│   └── apiError.ts       ApiError, toApiError (FastAPI detail → message + fieldErrors)
├── components/
│   ├── ArendeForm        R1–R4 (create) + edit
│   ├── ArendeList        R6, R11.5
│   ├── ArendeDetail      R7, R10, Redigera / Ta bort
│   ├── StatusSelect      R8, R9
│   ├── SearchFilterBar   R11.1–R11.4
│   └── StatusBadge
├── utils/
│   ├── filterArenden.ts  search + filter + sort (R11, R6)
│   └── formatDate.ts     UTC → sv-SE local time
├── constants/arende.ts   STATUSAR, provisional KATEGORIER/PRIORITETER (Q1/Q2)
├── types/arende.ts       Arende, ArendeCreate, ArendeStatus, ArendeFilter
├── mocks/                data.ts (C1–C3), handlers.ts, node.ts, browser.ts
└── test/setup.ts         MSW server + db.reset per test
```

## Page layout

```
┌───────────────────────────────────────────────┬──────────────────────┐
│ Alla ärenden                                  │      [+ Nytt ärende] │
├───────────────────────────────────────────────┼──────────────────────┤
│ Sök / filter                                  │ Side panel (aside)   │
│ ┌───────────────────────────────────────────┐ │ view:   details,     │
│ │ table, click row → panel view             │ │   Ändra status,      │
│ │ selected row highlighted                  │ │   Redigera, Ta bort  │
│ └───────────────────────────────────────────┘ │ edit:   ArendeForm   │
│                                               │ create: ArendeForm   │
└───────────────────────────────────────────────┴──────────────────────┘
```

- Default: list only, panel closed. Panel state in `App.tsx`: `closed | view(id) | edit(arende) | create`.
- From 900px width the panel is a sticky right column. On smaller screens it shows above the list.
- After create or edit: panel shows the saved case. After delete: panel closes, notice "Ärendet togs bort.".
- Delete asks for confirmation inside the panel ("Ja, ta bort" / "Avbryt").
- Edit/delete are behind `isEditDeleteEnabled()` (`src/constants/features.ts`): on in `npm run dev:mock`, off in `npm run dev` (buttons disabled, note "API saknas"). Force with `VITE_ENABLE_EDIT_DELETE=true|false`.
- Each row has edit (pencil) and delete (trash) icons. Edit opens the edit form; delete opens the panel with the confirmation shown.
- Edit form: "Spara ändringar" updates the case (`PUT`); "Spara som nytt ärende" creates a copy with status Nytt (`POST`) and leaves the original unchanged.

## Flow: create a case (R1–R4)

```mermaid
sequenceDiagram
  actor H as Case handler
  participant F as ArendeForm
  participant A as arendenApi
  participant B as Backend
  participant L as App (list state)

  H->>F: click "Nytt ärende", fill fields, click "Skapa ärende"
  F->>F: client check (empty / spaces only)
  alt field missing
    F-->>H: message per field, no request
  else valid
    F->>A: createArende(data)
    A->>B: POST /arenden
    alt 201
      B-->>A: Arende (status Nytt, skapad)
      A-->>F: Arende
      F->>L: onCreated(arende) → upsert
      L-->>H: case first in list, panel shows details
    else 422
      B-->>A: detail[] (loc, msg)
      A-->>F: ApiError(fieldErrors)
      F-->>H: message next to field, input kept
    end
  end
```

## Flow: list, search and filter (R6, R11)

```mermaid
flowchart LR
  Load[GET /arenden] --> State[(App list state)]
  Bar[SearchFilterBar<br/>q on Enter/Sök, selects at once] --> Filter[(filter state)]
  State --> F[filterArenden]
  Filter --> F
  F --> S[sortNewestFirst] --> List[ArendeList]
  List -- 0 rows + filter --> NoHit["Inga ärenden matchar"]
  List -- 0 rows, no filter --> Empty["Inga ärenden ännu"]
```

- Search runs in the frontend on the loaded list. Reason: the backend has no search endpoint (Q9 open).
- Match: title + description (Q7 proposal), case-insensitive with `sv-SE` locale, trimmed. Plain text match, no regex, so `%`, `_`, `<script>` are safe.
- If Q9 closes as "backend", replace `filterArenden` with query params in `listArenden` and keep the same component API.

## Flow: details and status change (R7–R10)

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
    B-->>D: Arende → all fields (R7)
    S->>A: updateStatus(id, status)
    A->>B: POST /arenden/{id}/status
    alt 200
      B-->>S: updated Arende → D + App upsert (R8)
    else 422
      B-->>S: message, select keeps old status (R9)
    end
  end
```

## Error handling

| Source | Example | Shown to user |
| --- | --- | --- |
| 422 validation | `detail: [{loc: ["body","rubrik"], msg: "Value error, Får inte vara tomt…"}]` | Field message "Får inte vara tomt…" + "Kontrollera fälten och försök igen." |
| 404 | `detail: "Ärendet hittades inte"` | Same text |
| Network down | fetch throws | "Kunde inte nå servern. Försök igen." + retry button on list |
| Other / non-JSON | 500 | "Något gick fel. Försök igen." |

All mapping lives in `api/apiError.ts` (`toApiError`).

## Test levels

| Level | Tool | Files | Covers |
| --- | --- | --- | --- |
| Unit | Vitest | `utils/filterArenden.test.ts`, `api/arendenApi.test.ts` | R11 rules, error mapping |
| Component | Testing Library + MSW | `components/*.test.tsx` | A1–A4, A7–A10, edit/delete |
| App | Testing Library + MSW | `App.test.tsx` | A1, A6, A8, A14–A16, XSS text |
| API | Postman / Newman | `docs/api/*.json` | Real backend: A1–A3, A6, A7, A10 |
| Manual / browser | Playwright (optional) | — | Smoke against real backend |

## Build cycle

```mermaid
flowchart LR
  A[prettier --check] --> B[eslint] --> C[tsc -b] --> D[vitest run] --> E[vite build]
```

- Local: `cd frontend && npm run check`.
- CI: `.github/workflows/frontend.yml` runs `npm ci` + `npm run check` on pull requests that touch `frontend/`.

## Known gaps

- Editing and deleting are outside v1.0 scope (ADR-002, spec "Out of scope"). They work on mocks only. The team must update ADR-002 and the backend must add `PUT`/`DELETE /arenden/{id}` before they work for real.
- Status changes are supported by the backend. Search and filtering remain frontend-only and run on the loaded list.
- Storage is in-memory, so R5 (survive restart) is not met. Backend task.
- Categories, priorities, list order and error texts use proposals (Q1, Q2, Q6, Q12).
