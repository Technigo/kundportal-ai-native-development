# AI-arbetsflöde och evidens

## Gemensamt arbetsflöde

1. Läs featureticket och krav-ID:n; fråga teamet där beteendet är oklart.
2. Skriv test för varje krav före implementation.
3. Låt AI föreslå avgränsad kod eller test. Ange scope, relevanta filer, begränsningar och förväntad verifiering.
4. Granska ändringen själv; kör tester/build och kontrollera faktiska utfall.
5. Notera accepterade, ändrade eller avvisade förslag och varför.
6. Efter teamets godkännande: committa steget och länka evidensen.

Projektets [Copilot-instruktioner](../../.github/copilot-instructions.md), [TDD-skill](../../.github/skills/requirement-driven-tdd/SKILL.md) och [UI-skill](../../.github/skills/ui-consistency/SKILL.md) delar arbetsreglerna. De är inte i sig bevis på att varje student använt eller granskat dem.

## Exempel på spårbar förändring

Vid CASE-CREATE klargjorde teamet att kategori och prioritet ska väljas i rullistor och frågade om kravet gick att testa. Kriteriet förtydligades till två kontroller: UI:t visar endast tillåtna alternativ och API:t avvisar okända värden. Detta finns i CASE-CREATE-003/004 och testerna i [CaseForm.test.tsx](../../packages/web/src/CaseForm.test.tsx) och [cases.test.ts](../../packages/api/src/cases.test.ts).

Detta dokumenterar kravförtydligande och verifiering. Studenten behöver själv beskriva sin roll, granskning och lärdom; det går inte att anta från teamets historik.

## Spår från planerings- och implementeringssessionen

Följande konkreta beslut och kontroller från sessionen kan användas som kompletterande evidens. De ersätter inte studentens egen förklaring.

| Händelse | AI:s bidrag och teamets beslut | Beständigt underlag |
|---|---|---|
| Arbetet delades i små steg | Teamet bad om stopp för granskning efter varje steg och commit efter godkännande. | [plan.md](../../plan.md); stegvisa commits `e7012eb6`, `55d597fa`, `25805521`, `e0ec5616`, `fecff9ee`. |
| Kravspårning förtydligades | Teamet korrigerade att miniminivån är ett test per krav-ID, inte per feature. Regeln ändrades till att ett test får täcka flera krav och en feature kan ha flera tester. | [TDD-skill](../../.github/skills/requirement-driven-tdd/SKILL.md), [kravindex](../features/README.md). |
| Testbarhet för rullistor ifrågasattes | Teamet påpekade att användaren inte kan välja ogiltiga värden i UI:t. Kriteriet kompletterades med UI-test av tillåtna alternativ och API-test av avvisning av okänt värde. | CASE-CREATE-003/004 i [specen](../features/case-create.md) och testfilerna ovan. |
| Testfel användes för felsökning | Första körningar blottlade saknade API-/UI-delar och därefter ett problem med upprepade UI-renderingar i testmiljön. Koden och testuppsättningen justerades tills testerna passerade. | Historik för [API-tester](../../packages/api/src/cases.test.ts) och [UI-tester](../../packages/web/src/CaseForm.test.tsx); slutresultatet i [verifieringsplanen](./verification-plan.md). Den inledande felutskriften är inte sparad i repot. |
| Beroenden granskades | `npm audit` rapporterade först tre sårbarheter i testverktyg. Vitest uppgraderades till 5.0.5; efter ändringen visade `npm audit` 0 sårbarheter. | Version och lockfil i commit `e0ec5616`; faktisk slutkontroll noterad i sessionen. Kör om `npm audit` för aktuellt resultat. |

## Reflektionslogg

Fyll i en rad efter ett faktiskt AI-stött moment. Länka till prompt/instruktion, ändring och testresultat; ange studentens eget bidrag.

| Student | Datum/feature | AI fick i uppdrag | Eget beslut/granskning | Körda kontroller/resultat | Nytta/begränsning | Länk |
|---|---|---|---|---|---|---|
| Fyll i | Fyll i | Fyll i | Fyll i | Fyll i | Fyll i | Fyll i |

Fullständiga AI-konversationer behövs inte; välj relevanta utdrag och spårbara resultat.

## VG-förbättring: jämför före och efter

Välj ett återkommande moment och pröva två versioner på jämförbara uppgifter. Spara:

- uppgift och kontext som hölls lika
- instruktion/prompt i båda versionerna
- AI-resultat och egna ändringar
- tester eller annan kontroll, med resultat
- konkret skillnad, begränsning och när respektive version passar

Fyll inte i slutsatsen innan båda versionerna faktiskt har prövats.
