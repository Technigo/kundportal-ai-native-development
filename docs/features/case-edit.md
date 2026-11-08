# CASE-EDIT — Redigera ärende

## Leverans

En handläggare kan expandera ett ärendekort, visa samtliga uppgifter och redigera alla ändringsbara fält i en gemensam form.

## Krav

| Krav-ID | Acceptanskriterium |
|---|---|
| CASE-EDIT-001 | Rubrik, beskrivning, kategori, prioritet, status och intern anteckning kan redigeras och sparas tillsammans i ett API-anrop. |
| CASE-EDIT-002 | Ogiltiga fältvärden avvisas. |
| CASE-EDIT-003 | Utfällt ärende visas i skrivskyddat läge. |
| CASE-EDIT-005 | Om obligatoriska fält saknas stoppas uppdateringen och användaren får ett specifikt fel kopplat till varje fält som behöver rättas. |
| CASE-EDIT-006 | Uppdatering av ett ärende som inte finns ger 404. |
| CASE-EDIT-007 | Ett ogiltigt ärende-ID avvisas med valideringsfel. |
| CASE-EDIT-008 | Redigeringsfält visas först efter aktivering av redigeringsläget. |
| CASE-EDIT-009 | Skapad-tiden visas i detaljen och kan inte ändras vid redigering. |
| CASE-EDIT-010 | Den skrivskyddade detaljvyn visar den interna anteckningen. |
| CASE-EDIT-011 | Alla uppdaterade värden finns kvar efter omläsning av ärendet. |
| CASE-EDIT-012 | En ogiltig uppdatering ändrar inte några av ärendets fält. |

## Implementation

- `PATCH /api/cases/:id` validerar alla redigerbara fält och uppdaterar dem i en SQL-sats.
- En lyckad ändring visar de sparade uppgifterna direkt i kortet och uppdaterar listans sammanfattning.
- API-fel visas vid formuläret och ger möjlighet att rätta och försöka igen.

## Testfiler

- API och SQLite: [caseUpdate.test.ts](../../packages/api/src/caseUpdate.test.ts)
- Redigeringsform: [CaseDetail.test.tsx](../../packages/web/src/CaseDetail.test.tsx)
- Utfällbart kort: [CaseList.test.tsx](../../packages/web/src/CaseList.test.tsx)

## Verifiering

Verifiering efter tabell-, redigerings- och inline-valideringsändringen (2026-11-08):

- `npm test --workspace @kundportal/web -- CaseForm.test.tsx CaseDetail.test.tsx App.test.tsx` — 36 tester passerade.
- `npm test` — API: 90 tester passerade; webb: 75 tester passerade.
- `npm run build` — API- och webbbygge samt TypeScript-kontroll passerade.
- `git diff --check` — inga whitespace-fel.
- Visuell granskning av redigeringslägets inline-fel har inte körts efter den senaste ändringen.

## Definition av färdig

- Alla redigerbara fält sparas tillsammans, inte som separata anrop.
- Ogiltig data sparas inte; alla CASE-EDIT-krav täcks av passerande kravmärkta tester.
