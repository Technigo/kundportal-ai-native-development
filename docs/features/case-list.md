# CASE-LIST — Lista ärenden

## Leverans

En handläggare kan se sparade ärenden i UI:t. Listan sorteras med nyaste ärendet först.

## Krav

| Krav-ID | Acceptanskriterium |
|---|---|
| CASE-LIST-001 | Listan visar alla sparade ärenden med rubrik, kategori, prioritet, status och skapandetid. |
| CASE-LIST-002 | API:t returnerar en tom lista när det saknas ärenden. |
| CASE-LIST-003 | Fel vid hämtning visas begripligt och presenteras inte som en tom, lyckad lista. |
| CASE-LIST-004 | Ett tomt läge förklarar att listan saknar ärenden. |
| CASE-WORKSPACE-001 | Startsidan visar alla ärenden. |
| CASE-WORKSPACE-002 | När ett ärende skapats återgår appen till listan. |
| CASE-WORKSPACE-004 | Loggan är nåbar med tangentbord. |
| CASE-WORKSPACE-005 | Huvudmenyn anger programmatiskt vilken vy som är aktiv. |
| CASE-LIST-006 | Listan sorteras med det nyaste ärendet först. |
| CASE-LIST-007 | När listan är tom visas ett begripligt tomt läge i UI:t. |
| CASE-LIST-008 | Det tomma läget erbjuder en knapp för att skapa det första ärendet. |
| CASE-LIST-009 | Varje hopfällt ärendekort visar en kort beskrivning. |
| CASE-WORKSPACE-006 | Huvudmenyn låter handläggaren växla mellan listan och skapa-vyn. |
| CASE-WORKSPACE-007 | Efter att ett ärende skapats visas en bekräftelse. |
| CASE-WORKSPACE-008 | Efter att ett ärende skapats hämtas den uppdaterade listan. |

## Testfiler

- API, sortering och beskrivning: [caseList.test.ts](../../packages/api/src/caseList.test.ts)
- Lista, tomläge och felbesked: [CaseList.test.tsx](../../packages/web/src/CaseList.test.tsx)
- Meny och skapa-flöde: [App.test.tsx](../../packages/web/src/App.test.tsx)
- Utfällbart kort: `[CASE-DETAIL-004]` i [CaseList.test.tsx](../../packages/web/src/CaseList.test.tsx)
- Kör båda testsviterna med `npm test`.

## Verifiering

Kört 2026-11-08:

- `npm test` — API: 90 tester passerade; webb: 72 tester passerade.
- `npm run build` — API- och webbbygge samt TypeScript-kontroll passerade.
- Visuell kontroll med fiktiva API-svar vid 320 px och 1 280 px: tomlägets CTA visas och beskrivningen visas i hopfällt kort.
- Senare workspace-kontroll: `[CASE-WORKSPACE-004]` verifierad i webbläsare och `App.test.tsx`; loggan får tangentbordsfokus och fokusmarkering.
- 2026-11-08: ärendekortens bredd matchar skapa-formulärets bredd och kortens vänsterkant linjerar i båda vyerna; kontrollerat vid 320 px och 1 280 px. Loggans tangentbordsfokus använder samma orange 3 px kontur och 2 px offset som menyknapparna.

## Definition av färdig

- Listan hämtar beständiga ärenden från API:t.
- Samtliga list- och workspace-krav-ID:n täcks av tester som passerar.
- Test-ID:n finns i testnamn eller beskrivningar.
