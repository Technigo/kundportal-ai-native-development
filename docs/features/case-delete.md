# CASE-DELETE — Ta bort ärende

## Leverans

En handläggare kan ta bort ett ärende från redigeringsläget först efter att ha bekräftat borttagningen. Avbryt lämnar ärendet oförändrat.

## Krav

| Krav-ID | Acceptanskriterium |
|---|---|
| CASE-DELETE-001 | DELETE-endpointen tar bort ett befintligt ärende permanent. |
| CASE-DELETE-002 | Handläggaren kan starta borttagning av ärendet från redigeringsläget. |
| CASE-DELETE-003 | Efter bekräftad borttagning tas ärendet bort ur listan. |
| CASE-DELETE-004 | DELETE-anrop för ett ärende som inte finns ger 404. |
| CASE-DELETE-005 | Ett ogiltigt ärende-ID avvisas utan att något ärende tas bort. |
| CASE-DELETE-006 | Efter bekräftad borttagning i fristående detaljvy visas att ärendet har tagits bort. |
| CASE-DELETE-007 | Om DELETE-anropet misslyckas visas ett begripligt fel. |
| CASE-DELETE-008 | Borttagningsbekräftelsen visas som en tillgänglig dialog med valen Avbryt och Ta bort på riktigt. |
| CASE-DELETE-009 | Avbryt får fokus när dialogen öppnas. |
| CASE-DELETE-010 | Efter ett misslyckat DELETE-anrop kan handläggaren försöka ta bort ärendet igen. |
| CASE-DELETE-011 | Avbryt stänger dialogen utan att skicka DELETE-anrop. |

## Implementation

- `DELETE /api/cases/:id` tar bort det valda ärendet och svarar med 204.
- Redigeringsvyn visar ett bekräftelsesteg före borttagning.
- API-fel visas i bekräftelsen; efter lyckad borttagning uppdateras listan lokalt.

## Verifiering

- `npm test --workspace @kundportal/api -- caseDelete.test.ts` — 5 tester passerade.
- `npm test --workspace @kundportal/web -- CaseDetail.test.tsx CaseList.test.tsx` — 32 tester passerade efter UI-flödet och felhanteringen.
- `npm test` — API: 95 tester och webb: 83 tester passerade.
- `npm run build` — passerade.
- `git diff --check` — passerade.
- Visuell granskning med fiktiva ärenden: bekräftelsen visar rubriken, konsekvensen och tydliga val.
- Efter knapp- och fokusjusteringen: `npm run build --workspace @kundportal/web` — TypeScript-kontroll och frontendbygge passerade.
- Efter knapp- och fokusjusteringen: `git diff --check` — passerade.
- Manuell webbläsarkontroll: bekräftelsen öppnas med fokus på **Avbryt**; borttagningsknapparna använder de nya gemensamma alertvarianterna.

## Definition av färdig

- Borttagning sker endast efter uttrycklig bekräftelse.
- Avbryt gör inga ändringar.
- CASE-DELETE-kraven täcks av passerande tester.
