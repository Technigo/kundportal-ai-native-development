# CASE-CREATE — Skapa ärende

## Leverans

En handläggare kan registrera ett ärende i UI:t. Frontend, API och SQLite validerar och sparar uppgifterna. Fel visas begripligt utan att ett ogiltigt ärende skapas.

## Fältregler

- Rubrik: krävs efter trimning; 1–120 tecken.
- Beskrivning: krävs efter trimning; 1–2 000 tecken.
- Kategori: krävs och väljs i rullista; `Konto`, `Fakturering`, `Tekniskt` eller `Övrigt`.
- Prioritet: krävs och väljs i rullista; `Låg`, `Normal` eller `Hög`.
- Status sätts till `Nytt`; skapandetid sätts av systemet.
- Intern anteckning krävs inte vid skapande; se [CASE-NOTE](./case-note.md).

## Krav

| Krav-ID | Acceptanskriterium |
|---|---|
| CASE-CREATE-001 | Giltig rubrik sparas trimmad. Saknad, tom eller blank rubrik avvisas. Längd 120 godtas; 121 avvisas. |
| CASE-CREATE-002 | Giltig beskrivning sparas trimmad. Saknad, tom eller blank beskrivning avvisas. Längd 2 000 godtas; 2 001 avvisas. |
| CASE-CREATE-003 | Kategori krävs och väljs i en rullista som bara visar de fyra tillåtna kategorierna. |
| CASE-CREATE-004 | Prioritet krävs och väljs i en rullista som bara visar de tre tillåtna prioriteterna. |
| CASE-CREATE-005 | Giltigt ärende får status `Nytt`. |
| CASE-CREATE-006 | Sparat ärende finns kvar och kan läsas efter ny databasanslutning. |
| CASE-CREATE-007 | Ett ogiltigt anrop ger begripligt valideringsfel. |
| CASE-CREATE-008 | Ärende kan skapas utan anteckning. |
| CASE-CREATE-009 | Om obligatoriska fält saknas stoppas skapandet och användaren får ett specifikt svenskt fel för varje fält som behöver rättas. |
| CASE-CREATE-014 | API:t avvisar okänd kategori. |
| CASE-CREATE-015 | API:t avvisar okänd prioritet. |
| CASE-CREATE-016 | Giltigt ärende får en systemgenererad skapandetid. |
| CASE-CREATE-017 | Ogiltigt anrop skapar inget ärende. |

## Testfiler

- API, validering och SQLite: [cases.test.ts](../../packages/api/src/cases.test.ts)
- Formulär, rullistor och felbesked: [CaseForm.test.tsx](../../packages/web/src/CaseForm.test.tsx)
- Kör båda testsviterna med `npm test`.

## Verifiering av formulär- och valideringsändringar

Kört 2026-11-08:

- `npm test --workspace @kundportal/web -- CaseForm.test.tsx CaseDetail.test.tsx App.test.tsx` — 36 tester passerade.
- `npm test` — API: 90 tester passerade; webb: 75 tester passerade.
- `npm run build` — API- och webbbygge samt TypeScript-kontroll passerade.
- `git diff --check` — inga whitespace-fel.
- Visuell granskning i webbläsare vid 320 px och 1 280 px: formulärkort och avdelare visas, inga horisontella overflow uppstår och tomma fält får inline-fel.
- Tangentbordsgranskning: Tab fokuserar loggan och visar en tydlig fokusmarkering.
- 2026-11-08: formulärets bredd och vänsterkant matchar ärendekorten i listvyn vid 320 px och 1 280 px.

Verifiering efter tabell-layout för skapa-formuläret:

- `npm test --workspace @kundportal/web -- CaseForm.test.tsx CaseDetail.test.tsx App.test.tsx` — 38 tester passerade.
- `npm run build --workspace @kundportal/web` — TypeScript-kontroll och frontendbygge passerade.
- `git diff --check` — inga whitespace-fel.
- Visuell granskning vid 320 px: tabell och formulärkort ryms utan horisontell overflow.

## Definition av färdig

- UI, API och beständig lagring fungerar tillsammans.
- Alla krav-ID:n täcks av tester som passerar.
- Valideringsfel visas på svenska; felaktiga anrop ändrar inte lagringen.
- Klientvalidering stoppar ogiltig inskickning och förklarar vilka obligatoriska fält som ska rättas.
- Test-ID:n finns i testnamn eller beskrivningar och README beskriver vid behov nya körkommandon.
