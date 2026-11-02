# CASE-DETAIL — Visa ärendedetalj

## Leverans

En handläggare kan välja ett ärende och se dess fullständiga uppgifter.

## Krav och testmappning

| Krav-ID | Acceptanskriterium | Minst ett automatiserat test |
|---|---|---|
| CASE-DETAIL-001 | Detaljvyn visar rubrik, beskrivning, kategori, prioritet, aktuell status och skapandetid för valt ärende. | `caseDetail.test.ts`: valt ärendes fullständiga API-svar. `CaseDetail.test.tsx`: separat test per visat fält, hämtning av valt ID, laddning och byte av ärende inklusive sena svar. `CaseList.test.tsx`: välj ärende i listan och visa dess beskrivning. |
| CASE-DETAIL-002 | Ett ID som inte finns ger ett tydligt `not found`-fel från API:t och begripligt besked i UI:t. | `caseDetail.test.ts`: 404 med svenskt felbesked för saknat ärende samt 400 för ogiltigt ID. `CaseDetail.test.tsx`: begripligt besked vid 404. |
| CASE-DETAIL-003 | Fel vid hämtning visas begripligt och förväxlas inte med ett saknat eller tomt ärende. | `caseDetail.test.ts`: databasfel ger 500 med hämtningsfel. `CaseDetail.test.tsx`: separata tester för nätverksfel, serverfel, ofullständigt svar och ogiltig JSON. |

## Implementation

- `GET /api/cases/:id` hämtar ett ärendes fullständiga uppgifter. ID valideras som ett positivt säkert heltal.
- Ärendets rubrik i listan är en tangentbordsstyrbar knapp som visar detaljvyn under listan.
- Saknat ärende visas som `Ärendet hittades inte.`. Övriga hämtningsfel visas som `Ärendet kunde inte hämtas. Försök igen.`.
- UI:ts befintliga typer och svarskontroller delas mellan formulär, lista och detaljvy i [caseTypes.ts](../../packages/web/src/caseTypes.ts).

## Testfiler

- API och SQLite: [caseDetail.test.ts](../../packages/api/src/caseDetail.test.ts)
- Detaljvy: [CaseDetail.test.tsx](../../packages/web/src/CaseDetail.test.tsx)
- Val från listan: [CaseList.test.tsx](../../packages/web/src/CaseList.test.tsx)

## Verifiering

Kört 2026-11-02 med Node.js 22.23.4, vald via `PATH`:

- Före implementation: API:ts 9 nya tester föll på saknad endpoint/rätt felrespons. UI-testerna föll på saknad detaljkomponent och saknad valknapp.
- `npm test --workspace @kundportal/api -- caseDetail.test.ts caseList.test.ts cases.test.ts` — 19 tester passerade, inklusive TypeScript-kontroll.
- `npm test --workspace @kundportal/web -- CaseDetail.test.tsx CaseList.test.tsx CaseForm.test.tsx` — 31 tester passerade.
- `npm run build` — API- och webbbygge passerade, inklusive TypeScript-kontroll.
- Webbläsarkontroll med mockade API-svar och fiktiva uppgifter: ärende öppnas från listan och detaljen ryms vid faktisk viewportbredd 320 respektive 1 024 px. En lång sammanhängande beskrivning radbryts och radbyten bevaras. Detta är inte ett fullständigt end-to-end-test mot SQLite.
- Lokal API-kontroll: `/api/health` gav 200 och ett saknat ärende gav 404 med `Ärendet hittades inte.`.

Steget granskades och godkändes av utvecklaren 2026-11-02. Statusändring och interna anteckningar ingår inte i detta steg.

## Definition av färdig

- Detaljer hämtas från API:t för valt ärende.
- Samtliga krav-ID:n täcks av tester som passerar.
- Test-ID:n finns i testnamn eller beskrivningar.
