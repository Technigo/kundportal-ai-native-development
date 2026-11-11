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
| Automatiserade tester | Exakt kommando, test-ID:n, faktiskt antal godkända/misslyckade/överhoppade tester samt länk till testutdata eller CI-körning. |
| Manuella kontroller | M-ID:n, genomförda steg, observerat resultat och godkänt/underkänt. Redovisas separat från automatiserade tester. |
| Avvikelser | Berörda krav, länk till felrapport/uppgift och resultat av eventuell omtestning. |

Planerade, överhoppade eller ännu inte implementerade kontroller får inte redovisas som godkända.

<a name="verifiering-issue-2"></a>

### Issue #2 – Teknikbeslut och API-kontrakt

Den 6 november 2026 gav den lokala körningen på [`afab9e7`](https://github.com/danielleven/kundportal-ai-native-development-grupp-1/commit/afab9e73414220512229b3ec6ca1ba325f4c2bf1) 27 godkända backendtester, varav 21 mot den separata MySQL-testdatabasen, och 7 godkända frontendtester. Typkontroll och bygge gick igenom. Se [arbetsloggen](arbetslogg.md#verifiering-issue-2) för kommandon, begränsningar och de 37 bekräftade punkterna.

<a name="verifiering-issue-12"></a>

### Issue #12 – Detaljpanel med kunduppgifter och bevarad listnavigation

Den 9 november 2026 gav den lokala körningen på branchen `feature/ticket-detail` ([`8c13d6a`](https://github.com/danielleven/kundportal-ai-native-development-grupp-1/commit/8c13d6ab749d3bfff4f5368e6d9cb7cd6c23b6f1)) 27 godkända backendtester mot den separata MySQL-testdatabasen, bland annat T07 och T09, och 17 godkända frontendtester. Typkontroll och bygge gick igenom. Daniel kontrollerade tangentbordsnavigering och detaljdelen av M01 manuellt i webbläsaren. CI kördes inte, eftersom GitHub-kontot var spärrat. Se [arbetsloggen](arbetslogg.md#verifiering-issue-12) för kommandon, begränsningar och de bekräftade punkterna.

### Issue #13 – Statusändring i detaljpanelen (K3, K6, K7, K8)

Kontrollerat lokalt den 11 november 2026 av Codex på Windows med Node.js 24.16.0, Python 3.12.14 och den separata MySQL-testdatabasen. Branch `feature/status-change` baserad på `8b18114`.

- **Frontend:** `npm.cmd test` gav 70 godkända, 0 misslyckade och 0 överhoppade tester. `npm.cmd run build` klarade typkontroll och bygge. [Flödestesterna](../frontend/src/App.status.test.tsx) täcker statusval, tangentbordsnavigation, oförändrad status under sparandet, bekräftad status i lista och detaljpanel, valt filter samt återhämtning efter fel och okänt sparutfall (T09, T10, T12, T14 och T15 på klientsidan). [API-klientens test](../frontend/src/api/tickets.test.ts) kontrollerar att PATCH skickar endast status.
- **Backend:** `python -m pytest -q` kördes med projektets virtuella miljö och den isolerade MySQL-testdatabasen. Resultat: 47 godkända, 0 misslyckade och 0 överhoppade tester. Den befintliga testsviten täcker bland annat T09–T12 och T14.
- **Manuell kontroll i Chrome:** Ett påhittat ärende ändrades från Nytt till Avslutat och den sparade statusen syntes i lista och detaljpanel efter omstart av backend och omladdning av klienten (del av M03). Med filtret Avslutat aktivt återöppnades ärendet som Pågående med piltangenter och Enter. Detaljpanelen visade Pågående och den filtrerade listan visade tomläget (M04).
- Omstart av MySQL, framkallat lagringsfel via webbläsaren (M05) och GitHub Actions återstår för denna branch.

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
