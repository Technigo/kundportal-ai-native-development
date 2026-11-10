# Arbetslogg

<a name="verifiering-issue-2"></a>

## Issue #2 – Teknikbeslut och API-kontrakt

**2026-11-06 · Verifierare: Lukas · Uppgiftsstatus: Done.** Lukas bekräftade punktstatusarna nedan och att [issue #2 (G1)](https://github.com/danielleven/kundportal-ai-native-development-grupp-1/issues/2) är klart. Han bedömde att API-kontraktet räcker som arbetsunderlag och att de slutliga API-reglerna kan fastställas senare. Punktstatusarna beskriver vad underlaget visar enligt issuets checklista.

**Version och granskning.** Codex granskade dokumenten och körde tester på [`afab9e7`](https://github.com/danielleven/kundportal-ai-native-development-grupp-1/commit/afab9e73414220512229b3ec6ca1ba325f4c2bf1) med ren arbetskopia. Före dokumentationen hade `main` gått vidare till `f823f57`, som bara lägger till verifieringsskillen och dess metadata. [PR #18](https://github.com/danielleven/kundportal-ai-native-development-grupp-1/pull/18) och [PR #19](https://github.com/danielleven/kundportal-ai-native-development-grupp-1/pull/19) innehåller teknikvalet och API-arbetet. Lukas godkände båda PR:erna den 2 november. En separat gruppgranskning av det slutliga kontraktet saknar dokumentation.

**Automatiserade kontroller den 6 november.** Codex körde testerna i Windows med Python 3.12.14, Node 24.16.0 och den befintliga, friska Docker-tjänsten `mysql-test`. Integrationsfixturen kontrollerade identiteten för den isolerade databasen `kundportal_test` före migration och rensning.

| Mapp | Kommando | Godkända | Misslyckade | Överhoppade | Ej körda |
| --- | --- | --- | --- | --- | --- |
| `backend` | `.\.venv\Scripts\python.exe -m pytest -q -m 'not integration'` | 6 | 0 | 0 | 21 bortvalda i denna körning |
| `backend` | `.\.venv\Scripts\python.exe -m pytest -q --tb=no` | 27, varav 21 MySQL-integrationstester | 0 | 0 | 0 |
| `frontend` | `npm.cmd test` | 7 | 0 | 0 | 0 |
| `frontend` | `npm.cmd run build` | `tsc -b` och Vite-bygget | 0 | 0 | 0 |

Pytest rapporterade en deprecationsvarning för Starlettes användning av `httpx`. Frontendtesterna använde simulerade API-svar. Inga GitHub Actions-körningar hittades för de granskade versionerna.

**Tidigare manuella kontroller.** Danielle rapporterade den 1 november att `POST /api/tickets` gav `201` med status `new`, att listan och detaljanropet gav `200` med rätt ärende och att statusändring med `PATCH` gav `200` och bekräftades med en ny `GET`. Efter backendomstart gav `GET` samma ärende och status. Commit för kontrollerna saknas. I denna avstämning genomfördes ingen ny manuell helflödeskontroll, renklonskontroll eller fullständig omstart av applikationen och MySQL.

### Bekräftade punkter

Punkt 1–4 gäller uppgiftens egen checklista. Punkt 5–31 gäller produktbeteendena i K1–K8. Deras API-delar hör till kontraktsgranskningen i punkt 1–4. Punkt 32–37 gäller dokumentation och verifiering enligt Q1–Q3.

| Punkt | Kriterium | Bekräftad status | Underlag och kvarvarande luckor |
| --- | --- | --- | --- |
| 1 | Gruppens bekräftelse av fältregler, statusflöde och filter | Delvis uppfyllt | [Kravspecen från den 30 oktober](https://github.com/danielleven/kundportal-ai-native-development-grupp-1/blob/179614562203a53784548e39219455f45a59de50/docs/kravspecifikation.md) anger en gemensam genomgång. Nuvarande kravspec kallar reglerna förslag. Senare API-preciseringar saknar dokumenterat gruppgodkännande. |
| 2 | Exempel på lyckade svar, valideringsfel, okänt ID och lagringsfel | Delvis uppfyllt | [API-kontraktet](api-kontrakt.md) visar lyckat ärendesvar och `422` som JSON. `404` och `503` beskrivs i text och täcks av API-tester. Fullständiga JSON-exempel för de två svaren saknas. `500` vid okänt sparutfall beskrivs separat. |
| 3 | Kärnkontraktet kan användas före statusfiltret | Uppfyllt | Registrering, lista, detaljer och statusändring kan användas utan filter. Kontraktet gör `status` valfri och listtestet anropar listan utan parametern. |
| 4 | README, kravspec och verifieringsplan återger samma beslut | Delvis uppfyllt | FastAPI, MySQL och testupplägget är dokumenterade. README och kravspec anger olika beslutsstatus för filtret. Kundfältens längdgränser, tidsformatets precision och hänvisningen till `White_Space` är ofullständigt samordnade mellan kontrakt och kravspec. |
| 5 | K1 · En giltig registrering sparar ett ärende | Utanför uppgiftens del | T01 kontrollerar `201` och skilda ID:n för två registreringar. |
| 6 | K1 · Fältregler, unikt ID, Nytt och skapandetid | Utanför uppgiftens del | T01 och T16 kontrollerar sparade fält, ID, `new`, trimning och UTC-format. |
| 7 | K1 · Bekräftelse samt åtkomst via lista och detaljer | Utanför uppgiftens del | API:t returnerar ärendet och `Location`. Bekräftelse och navigation i UI ingår i M01. |
| 8 | K2 · Tomma, för långa eller ogiltiga värden avvisas | Utanför uppgiftens del | T02–T05 och T16 täcker utvalda backendfall. Gemensamma fall för frontend och backend saknas, bland annat för emoji. |
| 9 | K2 · Inget ärende sparas vid valideringsfel | Utanför uppgiftens del | Backendtesterna läser listan efter avvisade anrop. |
| 10 | K2 · Begripliga fältfel och bevarad inmatning | Utanför uppgiftens del | API-fält testas. Formulärbeteendet ingår i M02. |
| 11 | K3 · Samma ärende efter omstart med beständig lagring | Utanför uppgiftens del | T06 läser samma ärende från en ny MySQL-anslutning. Full omstart ingår i M03. |
| 12 | K3 · Sparad status finns kvar efter omstart | Utanför uppgiftens del | Danielle rapporterade backendomstart. Full omstart med samma lagring är ej verifierad. |
| 13 | K4 · Listan visar föreskrivna fält | Utanför uppgiftens del | Mockat listtest kontrollerar flera fält. Datumformatet testas separat. |
| 14 | K4 · Nyast först och valfri ordning vid samma tid | Utanför uppgiftens del | T07 kontrollerar fallande tidsstämplar. Listvyn bevarar API-ordningen i ett mockat test. |
| 15 | K4 · Tydligt tomläge | Utanför uppgiftens del | T08 kontrollerar tomt API-svar. Ett mockat listtest kontrollerar texten. |
| 16 | K5 · Öppna valt ärende och visa alla fält | Utanför uppgiftens del | T06/T07 kontrollerar API-data. Detaljpanelen ligger utanför den testade versionen. |
| 17 | K5 · Begripligt besked vid okänt ID | Utanför uppgiftens del | T09 kontrollerar `404 not_found`. Begripligheten i UI ingår i M07. |
| 18 | K5 · Återgång till listan | Utanför uppgiftens del | Navigation från detaljvyn täcks ej i den testade versionen. |
| 19 | K6 · Giltig statusändring sparas och visas i båda vyerna | Utanför uppgiftens del | API-test och rapporterad manuell `GET` ger stöd för backend. Båda UI-vyerna återstår att kontrollera. |
| 20 | K6 · Övriga fält bevaras vid statusändring | Utanför uppgiftens del | T10/T12 jämför övriga fält genom en statussekvens och vid samma status igen. |
| 21 | K6 · Ogiltig status avvisas och tidigare status bevaras | Utanför uppgiftens del | T11 testar okänd status och extra fält samt läser tillbaka oförändrat ärende. |
| 22 | K6 · Okänt ID ger fel och skapar inget ärende | Utanför uppgiftens del | T09 kontrollerar `404` och att listan förblir tom. UI-beskedet ingår i M07. |
| 23 | K6 · Statusändringen finns kvar efter omstart | Utanför uppgiftens del | Tidigare backendomstart är rapporterad. Full omstart är ej verifierad. |
| 24 | K7 · Begripligt besked vid lagringsfel | Utanför uppgiftens del | T13/T14 skiljer `503` från `500` vid kontrollerade fel. Användarbeskedet ingår i M05. |
| 25 | K7 · Ingen framgångsbekräftelse och bevarad inmatning vid fel | Utanför uppgiftens del | Beteendet beskrivs i API-kontraktet. Formuläret och återkopplingen ingår i M05. |
| 26 | K7 · Tidigare data bevaras vid bekräftat skrivfel och UI visar ingen framgång | Utanför uppgiftens del | T13/T14 läser MySQL-data efter kontrollerat fel. Ett separat test visar möjlig sparning vid okänt utfall. UI-visningen återstår att verifiera. |
| 27 | K8 · Alla fem filterval visas | Utanför uppgiftens del | Filterkomponenten bygger alla fem val. Frontendtesterna använder ett urval. |
| 28 | K8 · Alla är förvalt och visar alla ärenden | Utanför uppgiftens del | Mockat frontendtest kontrollerar förvalt Alla. Backendtest använder listan utan filter. |
| 29 | K8 · Exakt status med bibehållen sortering | Utanför uppgiftens del | T15 kontrollerar en träff för `in_progress`. Sortering inom flera filtrerade träffar är ej verifierad. |
| 30 | K8 · Tydligt besked vid noll träffar | Utanför uppgiftens del | T08 kontrollerar tomt API-svar. Mockat frontendtest kontrollerar beskedet. |
| 31 | K8 · Alla återställer listan utan lagringsändring | Utanför uppgiftens del | Mockat frontendtest kontrollerar återställningen. Separat jämförelse av lagrade data före och efter filtrering saknas. |
| 32 | Q1 · README beskriver förutsättningar, installation, lagring och start | Uppfyllt | Dokumentgranskningen fann samtliga instruktionstyper. |
| 33 | Q1 · En annan person kan starta från ren klon | Utanför uppgiftens del | M06 saknar spårbart resultat i underlaget. |
| 34 | Q2 · Centrala beteenden täcks av lyckade fall, fel och gränsfall | Utanför uppgiftens del | De lokala sviterna passerade. Full verifiering av produktflödet hör till funktionsleveranserna. |
| 35 | Q2 · Testkommandon och testlänkar är dokumenterade | Uppfyllt | README beskriver kommandona och verifieringsplanen länkar till testfilerna. |
| 36 | Q3 · Planerade, automatiserade och manuella kontroller hålls isär | Uppfyllt | Dokumentgranskningen bekräftade uppdelningen. |
| 37 | Q3 · Resultat och begränsningar är spårbara | Delvis uppfyllt | Historiska körningar saknar commit. README anger 26 backendtester och verifieringsplanen 27 utan versionskoppling mellan uppgifterna. |

Se [verifieringsplanens sammanfattning](verifieringsplan.md#verifiering-issue-2) för en kort översikt över körresultaten.

<a name="verifiering-issue-12"></a>

## Issue #12 – Detaljpanel med kunduppgifter och bevarad listnavigation

**2026-11-09 · Verifierare: Daniel · Uppgiftsstatus: Inte Done.** Daniel bekräftade punktstatusarna nedan för [issue #12](https://github.com/danielleven/kundportal-ai-native-development-grupp-1/issues/12). Alla acceptanskriterier i issuet bedöms uppfyllda. Uppgiften är ändå inte klar enligt Q6: [PR #26](https://github.com/danielleven/kundportal-ai-native-development-grupp-1/pull/26) saknar oberoende granskning och grön CI.

**Version och granskning.** Claude Code granskade branchen `feature/ticket-detail` på [`8f3aafa`](https://github.com/danielleven/kundportal-ai-native-development-grupp-1/commit/8f3aafa), där `main` (`8aac679`) är inmergad. Under avstämningen lades ändringar till efter Daniels beslut: fokushantering i `TicketDetail.tsx` och `TicketList.tsx` samt fyra nya tester i `TicketDetail.test.tsx` och `App.test.tsx`. De committades sedan oförändrade som [`8c13d6a`](https://github.com/danielleven/kundportal-ai-native-development-grupp-1/commit/8c13d6ab749d3bfff4f5368e6d9cb7cd6c23b6f1). Alla körningar nedan gäller den versionen. Oberoende granskning av PR #26 saknas.

**Automatiserade kontroller den 9 november.** Körda av Claude Code i Windows med Python 3.12.10, Node 24.15.0 och Docker-tjänsten `mysql-test`, som startades frisk för körningen. `TEST_DATABASE_URL` pekade på den isolerade databasen `kundportal_test` på port 3307.

| Mapp | Kommando | Godkända | Misslyckade | Överhoppade | Ej körda |
| --- | --- | --- | --- | --- | --- |
| `backend` | `.\.venv\Scripts\python.exe -m pytest -q -rs` | 27, bland annat T07 och T09 | 0 | 0 | 0 |
| `frontend` | `npm test` | 17 | 0 | 0 | 0 |
| `frontend` | `npm run build` | `tsc -b` och Vite-bygget | 0 | 0 | 0 |

Pytest rapporterade en deprecationsvarning för Starlettes användning av `httpx`. Frontendtesterna använder simulerade API-svar och körs i jsdom.

Två nya tester riskprovades. När skyddet mot sena svar i `useTicket.ts` togs bort tillfälligt, fallerade testet för byte av ärende. När återlämningen av fokus i `TicketList.tsx` togs bort, fallerade fokustestet. Koden återställdes och hela sviten kördes igen med 17 godkända tester.

**CI.** GitHub Actions startade på `8f3aafa` men körde inga jobb: *"The job was not started because your account is locked due to a billing issue."* CI-status för PR #26 är därför ej verifierad.

**Manuella kontroller.**
- Den 5 november gav `GET /api/tickets/999` svaret `404 not_found` mot riktig backend och MySQL. Kontrollen gjordes med curl, inte i gränssnittet.
- Den 9 november rapporterade Daniel två kontroller i webbläsaren mot riktig backend med tre påhittade ärenden.
  - Tangentbord: Tab till en ärenderubrik, Enter, Tab till "Stäng" och Enter fungerade. Fokusramen syntes och fokus återvände till raden.
  - Detaljdelen av M01: panelen visade rätt fält för ärende #2, och det gick att återgå till listan.
- Registreringsdelen av M01 ingår inte. M07 kan inte nås i gränssnittet, eftersom bara ärenden som finns i listan kan öppnas.

### Bekräftade punkter

Punkt 1–6b är issuets acceptanskriterier.

| Punkt | Kriterium | Bekräftad status | Underlag och kvarvarande luckor |
| --- | --- | --- | --- |
| 1 | K5 · Valt ärendes ID, kund-ID, kundnamn, rubrik, beskrivning, kategori, prioritet, status och skapandetid visas med lagrade värden | Uppfyllt | Vitest kontrollerar samtliga fält och att rätt ID hämtas. Daniel kontrollerade ärende #2 manuellt. T07 kontrollerar API-datan. |
| 2 | Radbrytningar bevaras, med svenska etiketter och läsbar lokal tid | Uppfyllt | Vitest kontrollerar radbrytningar och etiketter. Formatet för detaljdatum testas i `formatDate.test.ts`. |
| 3 | K5 · Okänt ID ger ett begripligt besked och en väg tillbaka till listan | Uppfyllt | Vitest kontrollerar "Ärendet kunde inte hittas" och att "Stäng" fungerar i det läget. T09 kontrollerar `404 not_found`. M07 går inte att nå i gränssnittet, se ovan. |
| 4 | Hämtningsfel hanteras begripligt, och fel ärendes detaljer visas inte som det valda | Uppfyllt | Vitest kontrollerar felbesked med nytt försök och att ett sent svar för ett tidigare valt ärende inte visas. Testet är riskprovat. |
| 5 | K8 · Återgång till listan med samma statusfilter | Uppfyllt | Vitest öppnar ett ärende med filtret Pågående, stänger panelen och kontrollerar att Pågående fortfarande är valt. Filterkriterierna i K8 hör till #14. |
| 6a | Panel och navigation fungerar med tangentbord och synlig fokus | Uppfyllt | Vitest kontrollerar att fokus flyttas till panelen och tillbaka till raden. Testet är riskprovat. Daniel kontrollerade det manuellt i webbläsaren. |
| 6b | Ingen radering, och ingen redigering av andra fält än status | Uppfyllt | Granskat i koden. Panelen saknar sådana kontroller. |
| – | Statusväljare i panelen (K6, ui-design) | Utanför uppgiftens del | Hör till #13. |
| – | Q2 · Happy path, fel och gränsfall för K5 | Uppfyllt för K5 | Happy path, okänt ID, hämtningsfel, sent svar och navigation täcks av Vitest. |
| – | Q3 · Spårbara resultat | Uppfyllt för uppgiften | Denna post skiljer automatiserade, manuella och rapporterade kontroller åt och anger testad commit. |
| – | Q6 · Grön CI och granskning före merge | Ej verifierat | CI startade inte på grund av kontospärr. Oberoende granskning saknas. |
