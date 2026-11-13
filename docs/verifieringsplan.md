# Verifieringsplan – Kundserviceportalen

Status: uppdaterad 2026-11-01. Backendens ärende-API har automatiserade tester mot MySQL-testdatabasen `kundportal_test`. Frontendens ärendeflöde är inte implementerat eller verifierat.

Krav och acceptanskriterier finns i [kravspecifikationen](kravspecifikation.md). Installation, körning och demonstrationsflöde finns i [README](../README.md).

## 1. Syfte och urval

Verifieringen ska visa att ärenden skapas med rätt uppgifter, att felaktig inmatning inte sparas, att uppgifter och statusändringar finns kvar efter omstart samt att listor, detaljer och statusfilter visar rätt ärenden.

Urvalet utgår från risken att felaktiga uppgifter sparas, att lagrad information försvinner, att fel ärende visas eller ändras och att en misslyckad operation presenteras som lyckad. Antal tester eller täckningsprocent är inte i sig ett mått på om acceptanskriterierna är uppfyllda.

## 2. Testnivåer och arbetssätt

- **Enhetstester av applikationslogik:** validering, standardvärden och regler för status. Ger snabb och precis återkoppling på regler och gränsfall.
- **Integrationstester med verklig MySQL-testdatabas:** registrering, hämtning, statusändring, sortering och filtrering samt återöppning av lagring. Verifierar samspelet mellan logik och den lagringsteknik som faktiskt används.
- **Automatiserade tester med kontrollerade fel:** fel injiceras mot MySQL efter SQL-skrivning och före commit för att kontrollera rollback. Commitfel testas separat som oklart utfall. Testerna bevisar inte hantering av alla verkliga nätverks- eller databasfel.
- **Manuella kontroller av gränssnittet:** verifierar synlig återkoppling, navigation, formulärbeteende och demonstration enligt README.

Enhetstester ska inte vara den enda verifieringen av lagringen. Integrationstester använder den separata MySQL-testdatabasen `kundportal_test`. Testkonfigurationen verifierar databasen och användaren före migration eller rensning och får inte ändra utvecklingsdatabasens data. Tester ska inte bero på körordning.

För beständighet stängs lagringsanslutningen och en ny öppnas mot samma testdata. Ett separat manuellt test stoppar och startar hela applikationen. Att endast läsa från samma minnesobjekt räcker inte.

Backendtester körs med Pytest och frontendtester med Vitest. Installation och testkommandon finns i [README:s körinstruktioner](../README.md#installation-och-körning).

## 3. Planerade automatiserade tester

Backendtester finns för T01–T16 enligt länkarna nedan. T16 har begränsad backendtäckning; frontendens validering och ärendeflöde saknas. Raderna beskriver vad som ska verifieras, inte bevis för att hela produktflödet är färdigt.

| ID | Typ | Krav | Beteende och förväntat resultat | Föreslagen nivå | Testlänk |
| --- | --- | --- | --- | --- | --- |
| T01 | Happy path | K1 | Giltig registrering sparar ett ärende med rätt fält, unikt ID, status Nytt och giltig skapandetid. Två registreringar får olika ID:n. | Integration | [test_tickets_api.py](../backend/tests/test_tickets_api.py) |
| T02 | Error path | K2 | Saknad eller tom rubrik respektive beskrivning avvisas. Fel identifierar berört fält och antalet sparade ärenden är oförändrat. Notering: saknade fält testas inte explicit; text som enbart består av blanksteg täcks i T03. | Logik och integration | [test_ticket_validation.py](../backend/tests/test_ticket_validation.py) |
| T03 | Gränsfall | K2 | Kund-ID, kundnamn, rubrik eller beskrivning med enbart blanksteg avvisas. Inget ärende sparas. | Logik och integration | [test_ticket_validation.py](../backend/tests/test_ticket_validation.py) |
| T04 | Gränsfall | K1, K2 | Rubrik på 1 och 100 tecken godkänns; 101 avvisas. Beskrivning på 1 och 5 000 tecken godkänns; 5 001 avvisas. Längd räknas efter trimning. Notering: testerna kontrollerar maxlängd och maxlängd +1 för alla textfält, men inte minimilängderna. | Logik | [test_ticket_validation.py](../backend/tests/test_ticket_validation.py) |
| T05 | Error path | K2 | Tom eller okänd kategori respektive prioritet avvisas i applikationslogiken även utan gränssnittets validering. Inget ärende sparas. Notering: okända värden testas; tom kategori och prioritet testas inte separat. | Logik och integration | [test_ticket_validation.py](../backend/tests/test_ticket_validation.py) |
| T06 | Happy path | K3 | Ett registrerat ärende finns kvar med samma uppgifter när lagringen stängs och öppnas av nya instanser. | Integration | [test_tickets_api.py](../backend/tests/test_tickets_api.py), [test_ticket_persistence.py](../backend/tests/test_ticket_persistence.py) |
| T07 | Happy path | K4, K5 | Flera ärenden listas med angivna listfält i fallande skapandetid. Hämtning med ett ID ger samtliga fält från rätt ärende. | Integration | [test_tickets_api.py](../backend/tests/test_tickets_api.py), [test_ticket_status_and_listing.py](../backend/tests/test_ticket_status_and_listing.py) |
| T08 | Gränsfall | K4, K8 | Tom lagring ger en tom ärendelista utan fel. Ett giltigt filter utan träffar ger en tom resultatlista. | Integration | [test_ticket_not_found.py](../backend/tests/test_ticket_not_found.py), [test_ticket_status_and_listing.py](../backend/tests/test_ticket_status_and_listing.py) |
| T09 | Error path | K5, K6 | Hämtning eller statusändring för ett okänt ID ger ett hanterat fel. Inget ärende skapas och befintliga uppgifter ändras inte. | Integration | [test_ticket_not_found.py](../backend/tests/test_ticket_not_found.py) |
| T10 | Happy path | K3, K6 | Tillåtna statusändringar sparas och finns kvar efter återöppnad lagring. Övriga fält är oförändrade. Återöppning från Avslutat till Pågående ingår. Notering: testerna täcker en statussekvens och beständighet efter att alla databasanslutningar stängts, men inte återöppning från Avslutat till Pågående; beständighet efter backendomstart kontrollerades manuellt. | Logik och integration | [test_ticket_status_and_listing.py](../backend/tests/test_ticket_status_and_listing.py), [test_ticket_persistence.py](../backend/tests/test_ticket_persistence.py) |
| T11 | Error path | K6 | Tom eller okänd status avvisas och tidigare lagrad status samt övriga ärendefält förblir oförändrade. Notering: okänd status och extra PATCH-fält testas; tom eller saknad status testas inte separat. | Logik och integration | [test_ticket_status_and_listing.py](../backend/tests/test_ticket_status_and_listing.py) |
| T12 | Gränsfall | K6 | Att välja aktuell status igen lyckas utan att ändra några ärendeuppgifter. | Integration | [test_ticket_status_and_listing.py](../backend/tests/test_ticket_status_and_listing.py) |
| T13 | Error path | K7 | Ett kontrollerat fel efter SQL-skrivning men före commit ger rollback; ny hämtning visar att inget ärende sparats. | Integration med verklig MySQL | [test_ticket_storage_failures.py](../backend/tests/test_ticket_storage_failures.py) |
| T14 | Error path | K7 | Ett kontrollerat fel vid statusändring före commit återställer tidigare status. Oklart commitutfall rapporteras separat. | Integration med verklig MySQL | [test_ticket_storage_failures.py](../backend/tests/test_ticket_storage_failures.py) |
| T15 | Kompletterande funktion / happy path | K8 | Bland ärenden med olika status returnerar varje statusfilter endast rätt ärenden i rätt sortering. Alla returnerar samtliga. Lagrade uppgifter ändras inte. Notering: testerna kontrollerar filtret `in_progress`, ett giltigt filter utan träff och listan utan filter; övriga statusfilter saknar explicita testfall och det finns inget separat påstående som verifierar att filtrering lämnar lagrade uppgifter oförändrade. | Integration | [test_ticket_status_and_listing.py](../backend/tests/test_ticket_status_and_listing.py) |
| T16 | Gränsfall | K1, K2 | Inledande och avslutande blanksteg trimmas från textfält. Backendtester täcker utvalda blanksteg och fältlängder; frontendens gemensamma trimnings- och längdtester återstår. | Logik och integration | [test_tickets_api.py](../backend/tests/test_tickets_api.py), [test_ticket_validation.py](../backend/tests/test_ticket_validation.py) |

Närliggande fall får grupperas och parametriseras. Exakta feltexter behöver inte låsas i logiktester om feltypen och kopplingen till fältet kan verifieras. Begripligheten i den text som användaren faktiskt ser bedöms manuellt.

## 4. Planerade manuella kontroller

Följande gränssnittskontroller har status **Planerat**. Datum, utförare och utfall fylls i efter faktisk körning.

| ID | Krav | Genomförande och förväntat resultat |
| --- | --- | --- |
| M01 | K1, K4, K5 | Registrera ett giltigt ärende i gränssnittet. Kontrollera bekräftelse, listfält, detaljfält och navigation tillbaka till listan. |
| M02 | K2 | Skicka ett ofullständigt formulär och överskrid en längdgräns. Kontrollera att felmeddelandet är begripligt, pekar på rätt fält och att inmatade uppgifter finns kvar. |
| M03 | K3, K6 | Skapa ett ärende och ändra status. Stoppa hela applikationen, starta igen och kontrollera att rätt ärende och status visas i både lista och detaljvy. |
| M04 | K4, K8 | Kontrollera tom lista, statusfilter med och utan träffar samt återställning med Alla. Kontrollera att respektive besked är begripligt. |
| M05 | K7 | Framkalla ett kontrollerat skrivfel i en separat testmiljö. Kontrollera begripligt fel, ingen lyckad bekräftelse, bevarad formulärinmatning och att misslyckad statusändring inte visas som sparad. Dokumentera hur felet framkallades. |
| M06 | Q1, Q4 | Följ README från en ren klon, installera, starta, kör testerna och genomför demonstrationsflödet. Dokumentera eventuella saknade steg. |
| M07 | K5, K6 | Begär ett ärende som inte finns via den åtkomstväg implementationen erbjuder. Kontrollera ett begripligt besked och att användaren kan fortsätta använda applikationen. |

## 5. Köra testerna

Installation, start av MySQL och testkommandon finns i [README:s körinstruktioner](../README.md#installation-och-körning). Backendens integrationstester använder separat MySQL-testdatabas `kundportal_test`. Frontendtesterna körs med Vitest.

## 6. Faktiska resultat

Senaste rapporterade backendkörning av Danielle den 2026-11-01: `.\.venv\Scripts\python.exe -m pytest -q` från `backend` — **27 passed in 1.50s**. Kodversionen för körningen är inte dokumenterad; körningen gjordes inte om vid denna dokumentationsändring.

Backendkörning av Alvar den 2026-11-02 på macOS med Python 3.9.6, SQLAlchemy 2.0.55 och MySQL 8.4 (`mysql-test`): `.venv/bin/python -m pytest -q` från `backend` — **47 passed**, inga misslyckade eller överhoppade. Versionen är `main` (b63b3b8) med lokala, ännu ej granskade ändringar på grenen `feature/backend-tester`: nya tester i `test_ticket_database_constraints.py`, `test_ticket_persistence.py`, `test_ticket_unexpected_error.py`, `test_ticket_validation.py` och `test_ticket_status_and_listing.py` samt sortering på `id` vid lika `created_at` och felsvar `internal_error` för oväntade serverfel.

Tidigare rapporterad frontendkontroll: `npm.cmd test` — 1 test passed med simulerade HTTP-svar; `npm.cmd run build` lyckades. Detta verifierar inte ärendeflödet.

Manuella API-kontroller rapporterade av Danielle den 2026-11-01, separat från testerna. Kodversionen är inte dokumenterad:

- `POST /api/tickets`: 201; ärende skapades med status `new`.
- `GET /api/tickets` och `GET /api/tickets/1`: 200; ärendet och dess detaljer returnerades.
- `PATCH /api/tickets/1/status`: 200; status ändrades till `in_progress`, vilket bekräftades med en separat GET.
- Efter omstart av backend returnerade en ny GET samma ärende och status.

Detta verifierar inte frontendens ärendeflöde eller fullständig omstart av applikationen. Omstart av MySQL verifierades inte.

Efter varje relevant verifieringstillfälle registreras verkliga resultat enligt följande mall. Ersätt platshållarna först efter genomförd körning.

| Uppgift | Ska dokumenteras |
| --- | --- |
| Datum och utförare | När kontrollen kördes och vem som körde den. |
| Version | Commit-SHA för den testade koden samt eventuella lokala ändringar. |
| Miljö | Operativsystem, runtime, databas och relevanta versioner. |
| Automatiserade tester | Exakt kommando, test-ID:n, faktiskt antal godkända/misslyckade/överhoppade tester samt länk till testutdata. |
| Manuella kontroller | M-ID:n, genomförda steg, observerat resultat och godkänt/underkänt. Redovisas separat från automatiserade tester. |
| Avvikelser | Berörda krav, länk till felrapport/uppgift och resultat av eventuell omtestning. |

Planerade, överhoppade eller ännu inte implementerade kontroller får inte redovisas som godkända.

<a name="verifiering-issue-2"></a>

### Issue #2 – Teknikbeslut och API-kontrakt

Den 6 november 2026 gav den lokala körningen på [`afab9e7`](https://github.com/danielleven/kundportal-ai-native-development-grupp-1/commit/afab9e73414220512229b3ec6ca1ba325f4c2bf1) 27 godkända backendtester, varav 21 mot den separata MySQL-testdatabasen, och 7 godkända frontendtester. Typkontroll och bygge gick igenom. Se [arbetsloggen](arbetslogg.md#verifiering-issue-2) för kommandon, begränsningar och de 37 bekräftade punkterna.

<a name="verifiering-issue-12"></a>

### Issue #12 – Detaljpanel med kunduppgifter och bevarad listnavigation

Den 9 november 2026 gav den lokala körningen på branchen `feature/ticket-detail` ([`8c13d6a`](https://github.com/danielleven/kundportal-ai-native-development-grupp-1/commit/8c13d6ab749d3bfff4f5368e6d9cb7cd6c23b6f1)) 27 godkända backendtester mot den separata MySQL-testdatabasen, bland annat T07 och T09, och 17 godkända frontendtester. Typkontroll och bygge gick igenom. Daniel kontrollerade tangentbordsnavigering och detaljdelen av M01 manuellt i webbläsaren. Se [arbetsloggen](arbetslogg.md#verifiering-issue-12) för kommandon, begränsningar och de bekräftade punkterna.

### Issue #13 – Statusändring i detaljpanelen (K3, K6, K7, K8)

Kontrollerat lokalt den 11 november 2026 av Codex på Windows med Node.js 24.16.0, Python 3.12.14 och den separata MySQL-testdatabasen. Branch `feature/status-change` baserad på `8b18114`.

- **Frontend:** `npm.cmd test` gav 70 godkända, 0 misslyckade och 0 överhoppade tester. `npm.cmd run build` klarade typkontroll och bygge. [Flödestesterna](../frontend/src/App.status.test.tsx) täcker statusval, tangentbordsnavigation, oförändrad status under sparandet, bekräftad status i lista och detaljpanel, valt filter samt återhämtning efter fel och okänt sparutfall (T09, T10, T12, T14 och T15 på klientsidan). [API-klientens test](../frontend/src/api/tickets.test.ts) kontrollerar att PATCH skickar endast status.
- **Backend:** `python -m pytest -q` kördes med projektets virtuella miljö och den isolerade MySQL-testdatabasen. Resultat: 47 godkända, 0 misslyckade och 0 överhoppade tester. Den befintliga testsviten täcker bland annat T09–T12 och T14.
- **Manuell kontroll i Chrome:** Ett påhittat ärende ändrades från Nytt till Avslutat och den sparade statusen syntes i lista och detaljpanel efter omstart av backend och omladdning av klienten (del av M03). Med filtret Avslutat aktivt återöppnades ärendet som Pågående med piltangenter och Enter. Detaljpanelen visade Pågående och den filtrerade listan visade tomläget (M04).
- Omstart av MySQL och framkallat lagringsfel via webbläsaren (M05) återstod efter den här körningen.

<a name="verifiering-issue-13"></a>

### Bekräftad verifiering av issue #13 – Statusändring i detaljpanelen

**2026-11-11 · Verifierare: Lukas · Testutförare: Codex · Uppgiftsstatus: Inte Done.** Lukas bekräftade samtliga 24 bedömningar nedan för [issue #13](https://github.com/danielleven/kundportal-ai-native-development-grupp-1/issues/13). Den här avstämningen ersätter den tidigare lokala bedömningen av issue #13 ovan. Körningarna redovisas separat. Vid avstämningen saknades belägg för en PR och oberoende granskning av den testade commiten.

Avstämningen kördes på `feature/status-change` vid `ccba1dfc25ec90bbd76116baa0978b22338ec892` utan lokala ändringar i källkod eller tester. Miljön var Windows, Node.js 24.16.0, Python 3.12.14 och MySQL 8.4.13 med den separata databasen `kundportal_test` på port 3307. De manuella gränssnittskontrollerna kördes i Chrome mot Vite och FastAPI med påhittade ärenden i samma testdatabas.

#### Automatiserade körningar

| Katalog | Kommando | Godkända | Misslyckade | Överhoppade | Ej körda |
| --- | --- | ---: | ---: | ---: | ---: |
| `frontend` | `npm.cmd test -- --reporter=verbose` | 70 i 8 filer, varav 12 statusspecifika | 0 | 0 | 0 |
| `backend` | `.\.venv\Scripts\python.exe -m pytest -q -rs` | 47, varav 40 markerade MySQL-integrationstester | 0 | 0 | 0 |
| `frontend` | `npm.cmd run build` | Typkontroll och produktionsbygge godkända | – | – | – |

`.\.venv\Scripts\python.exe -m pytest --collect-only -q -m integration` bekräftade att 40 av de 47 backendtesterna har integrationsmarkören. Backendkörningen gav en deprecationsvarning från Starlettes testklient.

| Fall | Kontrollerat beteende | Test |
| --- | --- | --- |
| Frontend · statusval | Fyra alternativ, vald status, piltangenter, Escape och återställt fokus | [Statusflöde](../frontend/src/App.status.test.tsx#L55) |
| Frontend · lyckat svar | Båda vyerna behåller föregående status tills PATCH bekräftas och visar sedan den sparade statusen | [Statusflöde](../frontend/src/App.status.test.tsx#L76) |
| Frontend · aktivt filter | Ärendet försvinner ur det tidigare filtret, filtret behålls och fokus återgår dit när panelen stängs | [Statusflöde](../frontend/src/App.status.test.tsx#L101) |
| Frontend · hämtningsfel efter sparande | Bekräftad status visas i matchande lista även när listans omladdning misslyckas | [Statusflöde](../frontend/src/App.status.test.tsx#L119) |
| Frontend · samma status | Aktuell status kan väljas och sparas igen | [Statusflöde](../frontend/src/App.status.test.tsx#L139) |
| Frontend · 404, 422 och 503 | Tre fall kontrollerar begripliga fel, bevarad sparad status och bevarat försök utan sparbekräftelse | [Statusflöde](../frontend/src/App.status.test.tsx#L150) |
| Frontend · okänt sparutfall och nätverksfel | Två fall kontrollerar obekräftat utfall, ny hämtning av detalj och lista samt en enda PATCH | [Statusflöde](../frontend/src/App.status.test.tsx#L169) |
| Frontend · pågående skrivning | Om ett ärende stängs och öppnas under en skrivning kan ingen andra skrivning startas | [Statusflöde](../frontend/src/App.status.test.tsx#L194) |
| API-klient | Rätt PATCH-adress, JSON-header och endast `status` i innehållet | [API-klienttest](../frontend/src/api/tickets.test.ts#L6) |
| Frontend · regressioner | Detaljfält och fel för okänt ärende, filtrering och tomlägen samt fel och bevarad inmatning vid registrering | [Detaljpanel](../frontend/src/features/tickets/TicketDetail.test.tsx), [Ärendelista](../frontend/src/features/tickets/TicketList.test.tsx), [Registreringsformulär](../frontend/src/features/tickets/TicketForm.test.tsx) |
| T06, T10 | Ärende och uppdaterad status läses från MySQL efter stängning av samtliga anslutningar. En sekvens av tillåtna statusändringar bevarar övriga fält. | [Beständighet](../backend/tests/test_ticket_persistence.py#L29), [Statusövergångar](../backend/tests/test_ticket_status_and_listing.py#L11) |
| T09 | Okänt positivt ID ger 404 vid GET och PATCH utan att skapa något ärende. Ogiltiga ID:n avvisas separat. | [Okänt eller ogiltigt ID](../backend/tests/test_ticket_not_found.py) |
| T11, T12 | Okänd status och extra PATCH-fält avvisas. Val av samma status returnerar ett oförändrat ärende. | [Statusvalidering](../backend/tests/test_ticket_status_and_listing.py#L69), [Samma status](../backend/tests/test_ticket_status_and_listing.py#L88) |
| T13, T14 | Rollback vid fel före commit för registrering och statusändring. Backendtesterna av okänt commitutfall gäller registrering. | [Kontrollerade lagringsfel](../backend/tests/test_ticket_storage_failures.py) |
| T07, T08, T15 | Listans ordning, exakt filter för `in_progress`, filter utan träff och listning utan filter | [Listning och filter](../backend/tests/test_ticket_status_and_listing.py#L33), [Lika skapandetid](../backend/tests/test_ticket_status_and_listing.py#L103), [Tom lagring](../backend/tests/test_ticket_not_found.py#L8) |
| Kompletterande backendkontroller | Databasen avvisar ogiltiga statusvärden även vid direkt SQL. CORS tillåter preflight för PATCH. | [Databasbegränsningar](../backend/tests/test_ticket_database_constraints.py), [CORS](../backend/tests/test_ticket_cors.py) |

#### Manuella kontroller mot FastAPI och MySQL

| Kontroll | Genomförande och observerat resultat |
| --- | --- |
| T10/T12 · Statusflöde och tangentbord | Öppnade ett påhittat ärende i Chrome och valde Nytt igen, Väntar på kund och Avslutat. Återöppnade till Pågående med piltangenter och Enter. Den valda statusen hade bock, korrekt markerat radioval och en synlig fokusram. ID, skapandetid och övriga detaljfält förblev oförändrade. |
| T11 · Validering i API:t | Skickade PATCH för ett befintligt testärende med saknad, tom, `null` respektive okänd status. Varje anrop gav `422 validation_error`. GET efter varje anrop returnerade det oförändrade ärendet. |
| M03 · Beständighet | Stoppade och startade om frontend och backend och laddade om Chrome. Ärendet hade samma ID och övriga fält. Pågående visades i både listan och detaljpanelen. MySQL förblev igång. Fullständig omstart av alla tre tjänster följs upp i [issue #15](https://github.com/danielleven/kundportal-ai-native-development-grupp-1/issues/15). |
| M04 · Filter vid statusändring | Med Avslutat aktivt återöppnades det enda matchande ärendet till Pågående. Listan hämtades med samma filter och visade sitt tomläge. Alla återställde listan. En omladdning återställde också Alla som förval. |
| M05 · Bekräftat skrivfel | Framkallade ett SQLAlchemy-fel i `after_flush` för PATCH på ett särskilt testärende. FastAPI svarade 503. Chrome visade ett begripligt fel och bevarade det försökta valet. En ny hämtning visade att den tidigare statusen fortfarande fanns i MySQL. Sparbekräftelse uteblev. |
| M05 · Okänt sparutfall | Framkallade ett SQLAlchemy-fel i `after_commit` för PATCH. FastAPI svarade 500. Chrome visade obekräftat utfall och behöll tidigare visad status tills **Uppdatera listan** läste tillbaka den nya statusen. API-loggen visade en PATCH följd av GET-anrop för ärendet och listan. |
| M05 · Nätverksfel | Stoppade testbackend med ett ärende öppet och försökte ändra status. Chrome visade obekräftat utfall och behöll Pågående. Ny hämtning efter omstart visade Pågående. |
| M07 · Okänt ärende vid statusändring | Öppnade ett testärende, tog bort just det ärendet från den isolerade testdatabasen och försökte spara en ny status. PATCH gav 404 och Chrome visade ”Ärendet kunde inte hittas.” Det gick att stänga panelen och fortsätta med ett annat ärende. En ny listning visade att det borttagna ärendet inte hade återskapats. |

Felprovningen använde en separat FastAPI-process med en tillfällig sessionsersättning för de avsedda testärendena. Testärendena städades bort efter körningen. Kontrollerad felprovning av registrering i Chrome ingick inte i avstämningen.

#### Bekräftade bedömningar

| Punkt | Krav eller kriterium | Bekräftad status | Underlag eller återstående kontroll |
| ---: | --- | --- | --- |
| 1 | K3 · Samma ärende och uppgifter efter omstart | Delvis uppfyllt | T06 och Chrome efter omstart av frontend och backend. Full MySQL-omstart återstår i #15. |
| 2 | K3/K6 · Sparad status efter omstart | Delvis uppfyllt | T10 och statusdelen av M03. MySQL var igång under omstarten. |
| 3 | K3 · Beständig lagring | Uppfyllt | T06/T10 läste tillbaka samma ärende och status från MySQL efter stängda anslutningar. |
| 4 | K6 · Fyra statusval, återöppning och samma status igen | Uppfyllt | T10/T12 och Chrome, inklusive Avslutat → Pågående. Eget Vitest-fall för den övergången saknas. |
| 5 | K6 · Sparbekräftelse först efter lyckat svar | Uppfyllt | Vitest verifierade tidigare status under PATCH och bekräftad status efter svaret. |
| 6 | K6/K8 · Ny status i båda vyerna och omladdning med aktivt filter | Uppfyllt | Vitest och M04 mot FastAPI/MySQL. Ärendet försvann ur filtret när det slutade matcha. |
| 7 | K6 · Övriga ärendefält bevaras | Uppfyllt | API-klienttest, T10/T12 och jämförelse av detaljfält i Chrome. |
| 8 | K6 · Ogiltig status avvisas och tidigare status bevaras | Uppfyllt | T11, Vitest och manuellt API-prov för saknad, tom, `null` och okänd status. |
| 9 | K6 · Okänt ID ger begripligt fel och skapar inget ärende | Uppfyllt | T09, Vitest och statusdelen av M07. Det gick att fortsätta med ett annat ärende. |
| 10 | Issue #13 · Statustext, vald markering, tangentbord och synligt fokus | Uppfyllt | Vitest och Chrome. Dropdownen följer uppdragsgivarens beställning. Designreferensen beskriver en segmenterad väljare. |
| 11 | K7 · Begripligt besked och ingen bekräftelse vid lagringsfel | Uppfyllt | Vitest och M05 med fel före commit. Försökt val fanns kvar och sparbekräftelse uteblev. |
| 12 | K7 · Tidigare beständig status bevaras vid bekräftat skrivfel | Uppfyllt | T14 och ny hämtning från riktig MySQL under M05. |
| 13 | K7 · Okänt utfall eller nätverksfel kan kontrolleras utan omsändning | Uppfyllt | Vitest och Chrome med fel efter commit respektive avstängd backend. API-loggen visade en PATCH följd av GET-anrop vid kontrollen efter commit. |
| 14 | K7 · Felbesked, bevarad inmatning och rollback vid registrering | Utanför uppgiftens del | T13 och formulärtesterna passerade. Registreringsdelen av M05 ingick inte i den manuella körningen. |
| 15 | K8 · Alla och de fyra statusvalen finns | Utanför uppgiftens del | Valen observerades i Chrome. Filterkontrollen i sin helhet hör till #14. |
| 16 | K8 · Alla är förvalt och visar alla ärenden | Utanför uppgiftens del | Vitest och Chrome. Kriteriet hör till #14. |
| 17 | K8 · Exakt matchning och bibehållen sortering | Delvis uppfyllt | T15, Vitest och Chrome. Sortering med flera träffar per status återstår i #14. |
| 18 | K8 · Begripligt tomläge när inget matchar | Uppfyllt | T08, Vitest och M04 efter återöppning från Avslutat. |
| 19 | K8 · Alla återställer listan utan att ändra lagrad data | Utanför uppgiftens del | Vitest och Chrome visade återställd lista. En uttrycklig jämförelse av lagrade uppgifter hör till #14. |
| 20 | Q2 · Automatiserade lyckade fall, fel och gränsfall | Delvis uppfyllt | Båda sviterna passerade. Issue #13:s efterfrågade Vitest-fall för återöppning täcktes manuellt i Chrome. |
| 21 | Q2 · Testkommandon och testlänkar | Uppfyllt | Dokumentgranskat mot den körda versionen och länkat ovan. |
| 22 | Q3 · Planerade, automatiserade och manuella kontroller framgår | Uppfyllt | Dokumentgranskat. Planerade kontroller och faktiska körningar har separata avsnitt. |
| 23 | Q3 · Faktiska resultat och begränsningar är spårbara | Uppfyllt | Vid avstämningen väntade den nya posten på punktbekräftelsen. Bekräftelsen och testunderlaget är nu införda här. |
| 24 | Leveransvillkor · Oberoende granskning | Ej verifierat | Lokal verifiering genomförd. PR och oberoende granskning saknades i det tillgängliga underlaget för `ccba1df`. |

## 7. Begränsningar

- Backendtester verifierar beteenden mot testdatabasen. De visar inte att frontendens ärendegränssnitt fungerar.
- Logik- och integrationstester visar inte i sig att gränssnittets texter, formulär eller navigation fungerar. Manuella kontroller kompletterar dessa.
- Återöppnad lagring verifierar beständighet på integrationsnivå. Fullständig omstart av applikationen är inte verifierad.
- Kontrollerade SQL-fel verifierar den valda felvägen, inte alla verkliga lagringsfel.
- Belastning, produktionsdrift, avancerad säkerhet, samtidiga uppdateringar från flera handläggare och externa integrationer ingår inte i denna verifieringsplan.
- Ingen viss testtäckningsprocent utlovas. Slutsatser ska kopplas till verifierade beteenden och kvarvarande risker.

## 8. Ansvar och spårbarhet

Varje utvecklingsuppgift kopplas till ett eller flera krav-ID:n och relevanta test-ID:n. Den som implementerar beteendet ansvarar för att dess verifiering och dokumentation uppdateras. Testförfattare, granskare och faktisk utförare dokumenteras i uppgiften eller PR:n.

Varje student ska kunna förklara varför testerna för det egna bidraget är relevanta, vad de visar och vilka begränsningar de har. Individuella redovisningar hanteras enligt kursinstruktionerna och läggs inte i repot.
