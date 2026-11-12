# CASE-NOTE — Hantera intern anteckning

## Leverans

En handläggare kan lägga till eller redigera en intern textanteckning från ärendedetaljen. Anteckningen är valfri vid ärendeskapande. Det finns ingen författare eller ändringshistorik.

## Fältregler

- En anteckning per ärende.
- Text trimmas och får vara högst 2 000 tecken.
- Att spara tom text eller enbart blanksteg raderar anteckningen.

## Krav

| Krav-ID | Acceptanskriterium |
|---|---|
| CASE-NOTE-001 | Ärende kan skapas och visas utan anteckning. |
| CASE-NOTE-002 | Icke-tom anteckning kan läggas till, trimmas och kopplas till rätt ärende. Gränsen 2 000 godtas; 2 001 avvisas. |
| CASE-NOTE-003 | Befintlig anteckning kan redigeras och ändringen finns kvar efter omläsning. |
| CASE-NOTE-004 | Tömning eller enbart blanksteg, följt av spara, raderar anteckningen. |
| CASE-NOTE-005 | En anteckning som överskrider maxlängden avvisas med ett begripligt valideringsfel. |
| CASE-NOTE-006 | Anteckning på ärende som inte finns ger begripligt `not found`-fel. |
| CASE-NOTE-007 | En avvisad ogiltig anteckning ändrar inte den befintliga anteckningen. |
| CASE-NOTE-008 | Ett ogiltigt ärende-ID avvisas med valideringsfel. |
| CASE-NOTE-009 | En anteckning sparas endast på det valda ärendet. |
| CASE-NOTE-010 | En anteckning på 2 000 tecken godtas. |
| CASE-NOTE-011 | En befintlig anteckning bevaras vid statusändring. |
| CASE-NOTE-012 | Övriga ärendefält bevaras när anteckningen uppdateras. |
| CASE-NOTE-013 | En äldre databas uppgraderas med anteckningsfältet utan att befintliga ärenden förloras. |

## Implementation

- `PATCH /api/cases/:id/note` tar emot `{ "note": "Intern text" }` och returnerar hela det uppdaterade ärendet.
- API:t validerar ID, texttyp och längd efter trimning. Tom text lagras som `null`.
- En valfri SQLite-kolumn `note` läggs till automatiskt när en äldre databas öppnas. Befintliga ärenden bevaras.
- Skapande, detaljhämtning och statusändring returnerar också `note`, som är text eller `null`.
- Detaljvyn har en märkt textruta och Spara anteckning. Samma formulär används för att lägga till, redigera och radera. Ett misslyckat sparande behåller utkastet och visar ett svenskt felbesked.
- Status och anteckning uppdaterar bara sitt eget fält i detaljvyn så att ett sent sparsvar inte skriver över det andra fältet.

## Testfiler

- API, SQLite och uppgradering: [caseNote.test.ts](../../packages/api/src/caseNote.test.ts)
- Anteckningsformulär: [CaseNoteForm.test.tsx](../../packages/web/src/CaseNoteForm.test.tsx)
- Detaljintegration: [CaseDetail.test.tsx](../../packages/web/src/CaseDetail.test.tsx)

## Verifiering

Kört 2026-11-02 med Node.js 22.23.4 vald via `PATH`:

- Före implementation: 25 API-tester föll på saknat anteckningsfält/endpoint. UI-körningen föll på saknat anteckningsformulär.
- `npm test --workspace @kundportal/api -- caseNote.test.ts caseStatus.test.ts caseDetail.test.ts caseList.test.ts cases.test.ts` — 77 tester passerade, inklusive TypeScript-kontroll.
- `npm test --workspace @kundportal/web -- CaseNoteForm.test.tsx CaseDetail.test.tsx CaseStatusForm.test.tsx CaseList.test.tsx CaseForm.test.tsx` — 69 tester passerade.
- `npm run build` — API- och webbbygge passerade, inklusive TypeScript-kontroll.
- Separat webbläsarkontroll med mockade API-svar och fiktivt ärende: lägga till, redigera och radera anteckning fungerade. Formuläret kontrollerades visuellt och rymdes vid faktisk viewportbredd 320 respektive 1 024 px. Detta var inte ett fullständigt end-to-end-test mot SQLite och inga testposter skapades i den lokala databasen.

Steget godkändes för commit av utvecklaren 2026-11-02. Nästa steg är gemensamma UI-komponenter och konsekvent utformning.

## Definition av färdig

- Anteckning kan läggas till, läsas, redigeras och raderas via UI och API.
- Samtliga krav-ID:n täcks av tester som passerar.
- Test-ID:n finns i testnamn eller beskrivningar.
