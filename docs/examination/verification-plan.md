# Verifieringsplan

Kravspecifikationerna definierar acceptanskriterier och planerade test-ID:n. Varje krav-ID ska ha minst ett automatiserat test; ett test kan täcka flera krav. Endast rader märkta **Kört** har verifierats. Manuella kontroller och planerade tester räknas inte som automatiserade resultat.

## Körkommandon

| Kommando | Senast rapporterat resultat |
|---|---|
| `npm test` | **Kört:** API 10/10 och UI 9/9 tester passerade efter CASE-LIST. |
| `npm run build` | **Kört:** API TypeScript-build och Vite-produktionsbygge passerade efter CASE-LIST. |

Kör om kommandona när kod ändras och uppdatera resultaten innan slutversionen. Dessa resultat visar inte i sig att alla MVP-krav är klara.

## Implementerade krav

| Krav-ID | Automatiserad kontroll | Nivå och resultat |
|---|---|---|
| CASE-CREATE-001 | `[cases.test.ts](../../packages/api/src/cases.test.ts)`, `[CaseForm.test.tsx](../../packages/web/src/CaseForm.test.tsx)` | API/UI; **Kört**, testsviterna passerade. |
| CASE-CREATE-002 | Samma testfiler som ovan | API/UI; **Kört**, testsviterna passerade. |
| CASE-CREATE-003 | Samma testfiler som ovan; tillåtna värden, rullista och API-avvisning | API/UI; **Kört**, testsviterna passerade. |
| CASE-CREATE-004 | Samma testfiler som ovan; tillåtna värden, rullista och API-avvisning | API/UI; **Kört**, testsviterna passerade. |
| CASE-CREATE-005 | `[cases.test.ts](../../packages/api/src/cases.test.ts)` | API; **Kört**, standardstatus och tidsstämpel kontrolleras. |
| CASE-CREATE-006 | `[cases.test.ts](../../packages/api/src/cases.test.ts)` | API/SQLite; **Kört**, stängd databas öppnas igen och sparad rad läses. |
| CASE-CREATE-007 | `[cases.test.ts](../../packages/api/src/cases.test.ts)`, `[CaseForm.test.tsx](../../packages/web/src/CaseForm.test.tsx)` | API/UI; **Kört**, ogiltigt ärende avvisas, lagring förblir tom och fel visas. |
| CASE-CREATE-008 | Samma testfiler som ovan | API/UI; **Kört**, ärende skapas utan anteckning. |
| CASE-LIST-001 | `[caseList.test.ts](../../packages/api/src/caseList.test.ts)`, `[CaseList.test.tsx](../../packages/web/src/CaseList.test.tsx)` | API/UI; **Kört**, sammanfattning och nyast-först-sortering kontrolleras. |
| CASE-LIST-002 | Samma testfiler som ovan | API/UI; **Kört**, API ger tom array och UI visar tomläge. |
| CASE-LIST-003 | `[CaseList.test.tsx](../../packages/web/src/CaseList.test.tsx)` | UI; **Kört**, hämtningsfel visas separat från tomlista. |

## Återstående verifiering

- CASE-DETAIL, CASE-STATUS, CASE-NOTE och UI-CONSISTENCY är ännu inte implementerade; deras test-ID:n är **planerade**, inte körda.
- Playwright E2E-flöden har inte lagts till.
- Kontrast, fokusläge och smala/breda vyer behöver manuell granskning och dokumenterat resultat.
- Ingen negativ kontroll/mutation av persistence-testet är ännu dokumenterad för VG.

## Begränsningar

- API-/UI-testerna verifierar avgränsade lager; de ersätter inte Playwright-flöde eller manuell UI-granskning.
- CASE-CREATE-006 verifierar återläsning efter att testanslutningen stängts och SQLite öppnats igen, men inte separat start/stopp av hela applikationen.
- Inga verifieringsresultat säger något om produktionsdrift, autentisering eller externa integrationer; dessa ingår inte i MVP:n.
