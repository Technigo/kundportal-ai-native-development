# CASE-STATUS — Ändra status

## Leverans

En handläggare kan ändra status från ärendedetaljen. Giltiga statusar: `Nytt`, `Pågående`, `Väntar på kund`, `Avslutat`. Alla övergångar mellan giltiga statusar tillåts.

## Krav och testmappning

| Krav-ID | Acceptanskriterium | Minst ett automatiserat test |
|---|---|---|
| CASE-STATUS-001 | Var och en av de fyra statusarna kan sättas från var och en av de andra giltiga statusarna. | `caseStatus.test.ts`: 16 kombinationer inklusive oförändrad status. `CaseStatusForm.test.tsx`: tillåtna alternativ, initialt vald status och PATCH-anrop. |
| CASE-STATUS-002 | Okänd status avvisas med begripligt fel; befintlig status förblir oförändrad. | `caseStatus.test.ts`: separata tester för felbesked vid ogiltig indata och oförändrad lagrad status. `CaseStatusForm.test.tsx`: begripligt 400-fel. `CaseDetail.test.tsx`: befintlig status visas efter avvisad ändring. |
| CASE-STATUS-003 | Statusändringen sparas beständigt och syns efter ny hämtning av ärendet. | `caseStatus.test.ts`: ny databasanslutning och hämtning, oförändrade övriga fält samt listans status. `CaseStatusForm.test.tsx`: bekräftad uppdatering, sparmeddelande, skydd mot dubbelsparning, felhantering och omförsök. `CaseDetail.test.tsx` och `CaseList.test.tsx`: uppdaterad status i respektive vy. |
| CASE-STATUS-004 | Statusändring på ett ärende som inte finns ger begripligt `not found`-fel. | `caseStatus.test.ts`: 404 för saknat ärende och 400 för ogiltigt ID. `CaseStatusForm.test.tsx`: begripligt besked vid 404. |

## Implementation

- `PATCH /api/cases/:id/status` tar emot `{ "status": "Pågående" }` och returnerar hela det uppdaterade ärendet.
- API:t validerar ID och status innan SQLite uppdateras. Uppdatering och retur av ärendet sker i samma SQL-sats.
- Saknat ärende ger 404, ogiltig indata 400 och databasfel 500 med svenskt felbesked. Databasfel loggas på servern.
- Detaljvyn har en märkt rullista och knappen Spara status. Listan och detaljen uppdateras först efter bekräftat API-svar. Sparfel visas utan att den tidigare visade statusen skrivs över.

## Testfiler

- API och beständig lagring: [caseStatus.test.ts](../../packages/api/src/caseStatus.test.ts)
- Statusformulär: [CaseStatusForm.test.tsx](../../packages/web/src/CaseStatusForm.test.tsx)
- Detaljvy: [CaseDetail.test.tsx](../../packages/web/src/CaseDetail.test.tsx)
- Ärendelista: [CaseList.test.tsx](../../packages/web/src/CaseList.test.tsx)

## Verifiering

Kört 2026-11-02 med Node.js 22.23.4 vald via `PATH`:

- Före implementation: 33 API-tester föll på saknad PATCH-endpoint. UI-körningen föll på saknat statusformulär och saknad statuskontroll i detaljvyn.
- `npm test --workspace @kundportal/api -- caseStatus.test.ts caseDetail.test.ts caseList.test.ts cases.test.ts` — 52 tester passerade, inklusive TypeScript-kontroll.
- `npm test --workspace @kundportal/web -- CaseStatusForm.test.tsx CaseDetail.test.tsx CaseList.test.tsx CaseForm.test.tsx` — 49 tester passerade.
- `npm run build` — API- och webbbygge passerade, inklusive TypeScript-kontroll.
- Separat webbläsarkontroll med mockade API-svar och fiktivt ärende: status sparades och visades i både listan och detaljen. Formuläret kontrollerades visuellt och rymdes vid faktisk viewportbredd 320 respektive 1 024 px. Inga poster skapades i den lokala databasen. Detta var inte ett fullständigt end-to-end-test mot SQLite.

Steget godkändes för commit av utvecklaren 2026-11-02. Interna anteckningar ingår inte i detta steg.

## Definition av färdig

- Status kan ändras via UI och API och sparas i SQLite.
- Samtliga krav-ID:n täcks av tester som passerar.
- Test-ID:n finns i testnamn eller beskrivningar.
