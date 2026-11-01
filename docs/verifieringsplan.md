# Verifieringsplan – Kundserviceportalen

Status: uppdaterad 2026-11-01. Ärende-API:t, migrationen och demonstrationskommandot har automatiserade integrationstester mot den isolerade MySQL-testdatabasen. Testerna verifierar backendens lagring; React har ännu inga ärendevyer och hela användarflödet är inte manuellt verifierat.

Krav och acceptanskriterier finns i [kravspecifikationen](kravspecifikation.md). Installation, körning och demonstrationsflöde finns i [README](../README.md).

## 1. Syfte och urval

Verifieringen ska visa att ärenden skapas med rätt uppgifter, att felaktig inmatning inte sparas, att uppgifter och statusändringar finns kvar efter omstart samt att listor, detaljer och statusfilter visar rätt ärenden.

Urvalet utgår från risken att felaktiga uppgifter sparas, att lagrad information försvinner, att fel ärende visas eller ändras och att en misslyckad operation presenteras som lyckad. Antal tester eller täckningsprocent är inte i sig ett mått på om acceptanskriterierna är uppfyllda.

## 2. Testnivåer och arbetssätt

- **Enhetstester av applikationslogik:** validering, standardvärden och regler för status. Ger snabb och precis återkoppling på regler och gränsfall.
- **Integrationstester med verklig MySQL-testdatabas:** registrering, hämtning, statusändring, sortering och filtrering samt återöppning av lagring. Verifierar samspelet mellan logik och den valda lagringstekniken.
- **Automatiserade tester med kontrollerade fel efter SQL-skrivning:** verifierar rollback på MySQL-testdatabasen via en ny hämtning. Ett SQLAlchemy-sessionsevent injicerar felet deterministiskt efter flush och före commit; läsning och skrivning sker fortfarande mot riktig MySQL. Ett separat commitfel testas som oklart utfall, inte som säker rollback. Dessa tester täcker inte alla verkliga nätverks- eller serverfel.
- **Manuella kontroller av gränssnittet:** verifierar synlig återkoppling, navigation, formulärbeteende och demonstration enligt README.

Enhetstester ska inte vara den enda verifieringen av lagringen. Integrationsfixturen kräver en `TEST_DATABASE_URL` till `kundportal_test` på port 3307 med den dedikerade testanvändaren. Innan migration eller rensning körs verifierar fixturen URL, faktisk databas och ansluten användare. Den migrerar testdatabasen och rensar endast dess ärenderader mellan tester. Tester får inte ändra utvecklingsdatabasens data eller bero på körordning.

För beständighet stängs lagringsanslutningen och nya applikations-/lagringsinstanser öppnas mot samma testdata. Ett separat manuellt test stoppar och startar hela applikationen. Att endast läsa från samma minnesobjekt räcker inte.

Teknikvalen är FastAPI, MySQL via Docker Compose, Pytest, Vitest och React Testing Library. Backendkommandon och testdatabasens skydd finns i [README](../README.md#installation-och-körning).

## 3. Planerade automatiserade tester

T01–T17 och T23 har backendtester länkade nedan. T18:s gemensamma frontend-/backendtest av trimningsregler är ännu inte färdigt; befintliga backendfall är inte bevis för frontendvalidering. T19–T22 gäller grundens health- och anslutningsstatuskontroller. Körresultat finns i avsnitt 6.

| ID | Typ | Krav | Beteende och förväntat resultat | Föreslagen nivå | Testlänk |
| --- | --- | --- | --- | --- | --- |
| <a name="t01"></a>T01 | Happy path | K1 | Giltig registrering ger trimmade fält, unikt ID, status `new`, UTC-tid med sex decimalsiffror och Location. | Integration | [test_tickets_api.py](../backend/tests/test_tickets_api.py) |
| <a name="t02"></a>T02 | Error path | K2 | Tom text efter trimning och ogiltiga värden avvisas med fältnamn; inget ärende sparas. | Integration | [test_ticket_validation.py](../backend/tests/test_ticket_validation.py) |
| <a name="t03"></a>T03 | Gränsfall | K2 | Kund-ID som enbart består av Unicode-blanksteg avvisas utan lagring. | Integration | [test_ticket_validation.py](../backend/tests/test_ticket_validation.py) |
| <a name="t04"></a>T04 | Gränsfall | K1, K2 | Maxlängd accepteras och maxlängd +1 avvisas för kund-ID, kundnamn, rubrik och beskrivning. Längden kontrolleras efter trimning. | Integration | [test_ticket_validation.py](../backend/tests/test_ticket_validation.py) |
| <a name="t05"></a>T05 | Error path | K2 | Ogiltig kategori och prioritet avvisas med fältspecifika valideringsfel. | Integration | [test_ticket_validation.py](../backend/tests/test_ticket_validation.py) |
| <a name="t06"></a>T06 | Happy path | K3 | Ärendet läses tillbaka via API efter att anslutningspoolen stängts och en ny anslutning öppnats. | Integration med MySQL | [test_tickets_api.py](../backend/tests/test_tickets_api.py) |
| <a name="t07"></a>T07 | Happy path | K4, K5 | Lista och detalj returnerar lagrade fält; listan sorteras med nyast först. | Integration | [test_tickets_api.py](../backend/tests/test_tickets_api.py), [test_ticket_status_and_listing.py](../backend/tests/test_ticket_status_and_listing.py) |
| <a name="t08"></a>T08 | Gränsfall | K4, K8 | Tom lista och giltigt filter utan träff ger tom array. | Integration | [test_ticket_not_found.py](../backend/tests/test_ticket_not_found.py), [test_ticket_status_and_listing.py](../backend/tests/test_ticket_status_and_listing.py) |
| <a name="t09"></a>T09 | Error path | K5, K6 | Okänt positivt ID ger 404 vid läsning och statusändring; icke-positiva ID:n avvisas som ogiltig indata med 422. | Integration | [test_ticket_not_found.py](../backend/tests/test_ticket_not_found.py) |
| <a name="t10"></a>T10 | Happy path | K3, K6 | Alla giltiga statusar, återöppning och statusändring som inte ändrar andra fält verifieras. | Integration | [test_ticket_status_and_listing.py](../backend/tests/test_ticket_status_and_listing.py) |
| <a name="t11"></a>T11 | Error path | K6 | Ogiltig status och extra PATCH-fält ger 422; ärendet förblir oförändrat. | Integration | [test_ticket_status_and_listing.py](../backend/tests/test_ticket_status_and_listing.py) |
| <a name="t12"></a>T12 | Gränsfall | K6 | Samma status kan skickas igen utan att ärendets övriga fält ändras. | Integration | [test_ticket_status_and_listing.py](../backend/tests/test_ticket_status_and_listing.py) |
| <a name="t13"></a>T13 | Error path | K7 | Kontrollerat fel efter SQL INSERT och flush men före commit ger 503 efter bekräftad rollback; ny hämtning visar att inget ärende sparats. | Integration med verklig MySQL | [test_ticket_storage_failures.py](../backend/tests/test_ticket_storage_failures.py) |
| <a name="t14"></a>T14 | Error path | K7 | Kontrollerat fel efter status-UPDATE och flush men före commit återställer tidigare status. Oklart commitutfall rapporteras separat som 500, inte säker rollback. | Integration med verklig MySQL | [test_ticket_storage_failures.py](../backend/tests/test_ticket_storage_failures.py) |
| <a name="t15"></a>T15 | Kompletterande funktion / happy path | K8 | Statusfilter returnerar endast matchande ärenden; okänt statusfilter ger 422. | Integration | [test_ticket_status_and_listing.py](../backend/tests/test_ticket_status_and_listing.py) |
| <a name="t16"></a>T16 | Gränsfall | K1, K2 | Backendtest täcker omgivande blanksteg, tab, radbrytning, U+00A0, endast-blankstegstext, bevarade inre blanksteg och längd efter trimning. | Integration | [test_tickets_api.py](../backend/tests/test_tickets_api.py), [test_ticket_validation.py](../backend/tests/test_ticket_validation.py) |
| <a name="t17"></a>T17 | Error path | K7 | Kontrollerat fel efter SQL-skrivning och före commit följs av rollback och verifiering via ny API-hämtning. | Integration med verklig MySQL | [test_ticket_storage_failures.py](../backend/tests/test_ticket_storage_failures.py) |
| <a name="t18"></a>T18 | Gränsfall | K1, K2, Q2 | **Planerad för frontend:** dela samma trimnings- och längdexempel mellan Pytest och Vitest. Backenddelen finns, men frontendens ärendevalidering och gemensamma exempel saknas. | Pytest och Vitest | Backend: [test_ticket_validation.py](../backend/tests/test_ticket_validation.py); frontenddel saknas |
| <a name="t19"></a>T19 | Grundbeteende | Q1 | `GET /health` returnerar `200` och `{"status":"ok"}` utan att kräva databasanslutning. | Backend med TestClient | [test_health.py](../backend/tests/test_health.py) |
| <a name="t20"></a>T20 | Error path | Q1 | `GET /health/db` returnerar `503` och statusen otillgänglig när `DATABASE_URL` saknas; API:t ska inte rapportera lyckad DB-kontakt. | Backend med TestClient | [test_db_health.py](../backend/tests/test_db_health.py) |
| <a name="t21"></a>T21 | Integration | Q1, Q2 | `GET /health/db` kör `SELECT 1` mot separat MySQL-testdatabas med `kundportal_test`-databas och -användare. Testet avvisar annan databas/driver/user och får inte använda utvecklingsdatabasen. | Integration med verklig MySQL | [test_db_health.py](../backend/tests/test_db_health.py) |
| <a name="t22"></a>T22 | Grundbeteende | Q1, Q2 | React-vyn visar API tillgängligt separat från MySQL otillgängligt när motsvarande health-anrop ger lyckat respektive misslyckat HTTP-svar. Fetch är stubbat; testet verifierar inte nätverksintegration. | Vitest och React Testing Library | [App.test.tsx](../frontend/src/App.test.tsx) |
| <a name="t23"></a>T23 | Error path | Q1, Q2 | Ticket-API utan konfigurerad databas svarar 503 med generiskt `storage_unavailable`; ingen anslutningsinformation exponeras. | Backend med TestClient utan databas | [test_ticket_database_configuration.py](../backend/tests/test_ticket_database_configuration.py) |

Närliggande fall får grupperas och parametriseras. Exakta feltexter behöver inte låsas i logiktester om feltypen och kopplingen till fältet kan verifieras. Begripligheten i den text som användaren faktiskt ser bedöms manuellt.

## 4. Planerade manuella kontroller

Alla kontroller har status **Planerat**. Datum, utförare och utfall fylls i efter faktisk körning.

| ID | Krav | Genomförande och förväntat resultat |
| --- | --- | --- |
| <a name="m01"></a>M01 | K1, K4, K5 | Registrera ett giltigt ärende i gränssnittet. Kontrollera bekräftelse, listfält, detaljfält och navigation tillbaka till listan. |
| <a name="m02"></a>M02 | K2 | Skicka ett ofullständigt formulär och överskrid en längdgräns. Kontrollera att felmeddelandet är begripligt, pekar på rätt fält och att inmatade uppgifter finns kvar. |
| <a name="m03"></a>M03 | K3, K6 | Skapa ett ärende och ändra status. Stoppa hela applikationen, starta igen och kontrollera att rätt ärende och status visas i både lista och detaljvy. |
| <a name="m04"></a>M04 | K4, K8 | Kontrollera tom lista, statusfilter med och utan träffar samt återställning med Alla. Kontrollera att respektive besked är begripligt. |
| <a name="m05"></a>M05 | K7 | Framkalla ett kontrollerat skrivfel i en separat testmiljö. Kontrollera begripligt fel, ingen lyckad bekräftelse, bevarad formulärinmatning och att misslyckad statusändring inte visas som sparad. Dokumentera hur felet framkallades. |
| <a name="m06"></a>M06 | Q1, Q4 | Följ README från en ren klon, installera, starta, kör testerna och genomför demonstrationsflödet. Dokumentera eventuella saknade steg. |
| <a name="m07"></a>M07 | K5, K6 | Begär ett ärende som inte finns via den åtkomstväg implementationen erbjuder. Kontrollera ett begripligt besked och att användaren kan fortsätta använda applikationen. |

## 5. Köra testerna

Exakta kommandon finns i [README](../README.md#installation-och-körning). Kör från `backend`:

```powershell
.\.venv\Scripts\python.exe -m pytest -q
```

Kommandot kräver att den separata `mysql-test`-tjänsten är frisk och att `TEST_DATABASE_URL` pekar på `kundportal_test`. Fixturen verifierar URL och ansluten databas/användare före migration och rensning. Tester lämnar inte ärenderader i testdatabasen.

## 6. Faktiska resultat

### Automatiserade tester

Följande automatiserade grundkontroller kördes tidigare 2026-11-01 i Windows PowerShell på den ocommittade arbetskopian `feature/backend-setup`. De behålls som historik; den senare pytest-körningen och manuella kontrollerna redovisas separat nedan.

Resultaten visar grundbeteenden, inte att ärendefunktionerna är implementerade.

| Exakt kommando (kört från angiven mapp) | Faktiskt resultat |
| --- | --- |
| `backend`: `.\.venv\Scripts\python.exe -m pytest -q -m "not integration"` | Godkänt: 2 passed, 1 deselected. |
| `backend`: `.\.venv\Scripts\python.exe -m pytest -q` | Historiskt resultat: 2 passed, 1 skipped. MySQL-integrationen hoppades över då ingen `TEST_DATABASE_URL` var konfigurerad vid den körningen. En senare körning finns nedan. |
| `frontend`: `npm.cmd test` | Godkänt: 1 test passed. HTTP-svaren är simulerade. |
| `frontend`: `npm.cmd run build` | Godkänt: TypeScript-kontroll och Vite-produktionsbygge lyckades. |
| Repo-rot: `docker compose --env-file .env.example config --quiet` | Godkänt: Compose-konfigurationen kunde valideras. Detta startar inga containrar. |
| `backend`: `.\.venv\Scripts\python.exe -m pip check` | Godkänt: inga trasiga beroenden rapporterades. |

Vid dessa tidigare kontroller kunde `docker info --format '{{.ServerVersion}}'` inte ansluta till Docker Desktop Linux engine via dess named pipe. Detta beskriver den tidigare körningen och ersätts av den senare rapporterade verifieringen nedan.

### Tidigare manuellt rapporterad körning och kontroller

Danielle rapporterade följande verifiering 2026-11-01. Resultatet är manuellt rapporterat och har inte körts om i denna dokumentationsändring.

| Typ | Kommando eller kontroll | Rapporterat resultat |
| --- | --- | --- |
| Automatiserat test, manuellt rapporterat | Från `backend`: `..venv\Scripts\python.exe -m pytest -q` | 3 passed in 0.66s. MySQL-integrationstestet kördes och hoppades inte över. |
| Manuell miljökontroll | `docker compose --profile test ps` | Både `mysql` och `mysql-test` visade `healthy`. |
| Manuell API-kontroll | `GET /health/db` | `{"status":"ok","database":"ok"}`. |
| Manuell gränssnittskontroll | React-vyn | Visade `API: Tillgänglig` och `MySQL: Tillgänglig`. |

Detta verifierade då anslutningsgrunden från backend till MySQL och att gränssnittet visade tillgänglighetsstatus. Det verifierade inte ärendelagring.

### Aktuell automatiserad körning för ticket API

Körd 2026-11-01 i Windows PowerShell från arbetsbranchen `feature/ticket-api`, byggd från `7e170cb`. Integrationsfixturen verifierade `kundportal_test` och dess användare före Alembic-migration, och körde migrationen endast mot testdatabasen.

| Exakt kommando (kört från `backend`) | Faktiskt resultat |
| --- | --- |
| `.\.venv\Scripts\python.exe -m pytest -q` | Godkänt: 26 passed in 1.55s. Inga tester hoppades över. Inkluderar verklig MySQL-testdatabas, ticket-API, migration, rollback, demo-idempotens, health- och CORS-kontroller. |
| `.\.venv\Scripts\python.exe -m pytest -q -m "not integration"` | Godkänt: 6 passed, 20 deselected in 0.57s. |
| `.\.venv\Scripts\python.exe -m pip check` | Godkänt: No broken requirements found. |
| `.\.venv\Scripts\python.exe -m alembic heads` | Godkänt: `0001_create_tickets (head)`. Detta listar revisionen; den fullständiga sviten ovan applicerade den på testdatabasen. |
| `.\.venv\Scripts\alembic.exe upgrade head` med `DATABASE_URL` tillfälligt satt till verifierad test-URL | Godkänt: Alembic anslöt till MySQL och kommandot avslutades med exitkod 0; inget dev-schema användes. |

`docker compose --profile test ps --format "{{.Service}} {{.State}} {{.Health}}"` visade `mysql running healthy` och `mysql-test running healthy`. Testresultaten bekräftar backendbeteenden mot MySQL-testdatabasen, men inte en manuell kontroll av de startade HTTP-processerna eller frontendens ticket-gränssnitt.

### Manuellt rapporterad API-verifiering

Danielle rapporterade följande manuella verifiering 2026-11-01. Resultaten har inte körts om i denna dokumentationsändring.

| Typ | Kommando eller kontroll | Rapporterat resultat |
| --- | --- | --- |
| Automatiserad testsvit, manuellt rapporterat | Från `backend`: `.\.venv\Scripts\python.exe -m pytest -q` | Hela backendtestsviten: 27 passed in 1.50s. |
| Manuell migrationskontroll | Alembic revisionsstatus | `0001_create_tickets (head)`. |
| Manuell API-kontroll | `POST /api/tickets` | `201`; ärende `1` skapades med status `new`. |
| Manuell API-kontroll | `GET /api/tickets` | `200`; ärendet fanns i listan. |
| Manuell API-kontroll | `GET /api/tickets/1` | `200`; rätt ärendedetaljer visades. |
| Manuell API-kontroll | `PATCH /api/tickets/1/status` | `200`; status ändrades till `in_progress`. |
| Manuell API-kontroll | Separat `GET` efter statusändringen | Bekräftade den sparade statusen `in_progress`. |
| Manuell API-kontroll efter omstart av backend | Ny `GET` av ärendet | `200`; samma ärende och status `in_progress` fanns kvar. |

Detta är manuellt rapporterad kontroll av backendens ärendeflöde och beständighet efter omstart av backend. Omstart av MySQL och frontendens ärendeflöde verifierades inte.

Efter varje relevant verifieringstillfälle registreras verkliga resultat enligt följande mall. Ersätt platshållarna först efter genomförd körning.

| Uppgift | Ska dokumenteras |
| --- | --- |
| Datum och utförare | När kontrollen kördes och vem som körde den. |
| Version | Commit-SHA för den testade koden samt eventuella lokala ändringar. |
| Miljö | Operativsystem, runtime, databas och relevanta versioner. |
| Automatiserade tester | Exakt kommando, test-ID:n, faktiskt antal godkända/misslyckade/överhoppade tester samt länk till testutdata eller CI-körning. |
| Manuella kontroller | M-ID:n, genomförda steg, observerat resultat och godkänt/underkänt. Redovisas separat från automatiserade tester. |
| Avvikelser | Berörda krav, länk till felrapport/uppgift och resultat av eventuell omtestning. |

Planerade, överhoppade eller ännu inte implementerade kontroller får inte redovisas som godkända. Den äldre körningen hoppade över T21, men senare manuellt rapporterade och automatiserade körningar genomförde MySQL-kontroller. T18:s gemensamma frontend-/backendtest och frontendens ärendeflöde återstår. Omstart av MySQL har inte verifierats.

## 7. Begränsningar

- Backendtester verifierar de länkade API-beteendena mot testdatabasen. De visar inte att frontendens ännu ej byggda ärendegränssnitt fungerar.
- Logik- och integrationstester visar inte i sig att gränssnittets texter, formulär eller navigation fungerar. Manuella kontroller kompletterar dessa.
- Återöppnad MySQL-anslutning och nya applikations-/lagringsinstanser verifierar beständighet på integrationsnivå. Fullständig omstart av applikationen kontrolleras separat.
- Kontrollerade SQLAlchemy-fel verifierar rollback när fel injiceras efter flush och före commit; de täcker inte alla nätverksavbrott eller MySQL-serverfel. Ett fel i commit behandlas konservativt som oklart utfall.
- Belastning, produktionsdrift, avancerad säkerhet, samtidiga uppdateringar från flera handläggare och externa integrationer ingår inte i denna verifieringsplan.
- Ingen viss testtäckningsprocent utlovas. Slutsatser ska kopplas till verifierade beteenden och kvarvarande risker.

## 8. Ansvar och spårbarhet

Varje utvecklingsuppgift kopplas till ett eller flera krav-ID:n och relevanta test-ID:n. Den som implementerar beteendet ansvarar för att dess verifiering och dokumentation uppdateras. Testförfattare, granskare och faktisk utförare dokumenteras i uppgiften eller PR:n.

Varje student ska kunna förklara varför testerna för det egna bidraget är relevanta, vad de visar och vilka begränsningar de har. Individuella redovisningar hanteras enligt kursinstruktionerna och läggs inte i repot.
