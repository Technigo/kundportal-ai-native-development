# CASE-DETAIL — Visa ärendedetalj

## Leverans

En handläggare kan välja ett ärende och se dess fullständiga uppgifter.

## Krav

| Krav-ID | Acceptanskriterium |
|---|---|
| CASE-DETAIL-001 | Detaljvyn visar rubrik, beskrivning, kategori, prioritet, aktuell status och skapandetid för valt ärende. |
| CASE-DETAIL-002 | Ett ID som inte finns ger ett tydligt `not found`-fel från API:t och begripligt besked i UI:t. |
| CASE-DETAIL-003 | Fel vid hämtning visas begripligt och förväxlas inte med ett saknat eller tomt ärende. |
| CASE-DETAIL-004 | Handläggaren kan expandera ett ärende i listan för att läsa dess fullständiga information i kortet. |
| CASE-DETAIL-005 | Ett ogiltigt ärende-ID ger ett tydligt valideringsfel från API:t. |
| CASE-DETAIL-006 | Detaljvyn kan fällas ihop efter att ha expanderats. |

## Implementation

- `GET /api/cases/:id` hämtar ett ärendes fullständiga uppgifter. ID valideras som ett positivt säkert heltal.
- Ärendekortets tangentbordsstyrbara kontroll öppnar fullständiga detaljer i kortet, och detaljen kan fällas ihop.
- Utfällt kort visar inte den hopfällda sammanfattningen samtidigt. Läsvyn har inga redigeringsfält.
- Saknat ärende visas som `Ärendet hittades inte.`. Övriga hämtningsfel visas som `Ärendet kunde inte hämtas. Försök igen.`.
- UI:ts befintliga typer och svarskontroller delas mellan formulär, lista och detaljvy i [caseTypes.ts](../../packages/web/src/caseTypes.ts).

## Testfiler

- API och SQLite: [caseDetail.test.ts](../../packages/api/src/caseDetail.test.ts)
- Detaljvy: [CaseDetail.test.tsx](../../packages/web/src/CaseDetail.test.tsx)
- Val från listan: [CaseList.test.tsx](../../packages/web/src/CaseList.test.tsx)

## Verifiering

Senaste kontroll 2026-11-08:

- `npm test` — API: 90 tester passerade; webb: 72 tester passerade.
- `npm run build` — API- och webbbygge samt TypeScript-kontroll passerade.
- Visuell kontroll med mockade fiktiva ärenden vid 320 px och 1 280 px: detaljinformationen ryms utan horisontell overflow.

Kört 2026-11-02 med Node.js 22.23.4, vald via `PATH`:

- Före implementation: API:ts 9 nya tester föll på saknad endpoint/rätt felrespons. UI-testerna föll på saknad detaljkomponent och saknad valknapp.
- `npm test --workspace @kundportal/api -- caseDetail.test.ts caseList.test.ts cases.test.ts` — 19 tester passerade, inklusive TypeScript-kontroll.
- `npm test --workspace @kundportal/web -- CaseDetail.test.tsx CaseList.test.tsx CaseForm.test.tsx` — 31 tester passerade.
- `npm run build` — API- och webbbygge passerade, inklusive TypeScript-kontroll.
- Webbläsarkontroll med mockade API-svar och fiktiva uppgifter: ärende öppnas från listan och detaljen ryms vid faktisk viewportbredd 320 respektive 1 024 px. En lång sammanhängande beskrivning radbryts och radbyten bevaras. Detta är inte ett fullständigt end-to-end-test mot SQLite.
- Lokal API-kontroll: `/api/health` gav 200 och ett saknat ärende gav 404 med `Ärendet hittades inte.`.

Historisk verifiering från 2026-11-02 nedan gäller den ursprungliga detaljvyn. Expandering och skrivskyddsläget täcks av `[CASE-DETAIL-004]` i [CaseList.test.tsx](../../packages/web/src/CaseList.test.tsx) och `[CASE-EDIT-003]` i [CaseDetail.test.tsx](../../packages/web/src/CaseDetail.test.tsx).

## Definition av färdig

- Detaljer hämtas från API:t för valt ärende.
- Samtliga krav-ID:n täcks av tester som passerar.
- Test-ID:n finns i testnamn eller beskrivningar.
