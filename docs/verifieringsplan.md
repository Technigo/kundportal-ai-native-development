# Verifieringsplan – Kundserviceportalen

Status: uppdaterad 2026-11-01. Grundtester för API-status och frontendens anslutningsvisning har körts. En senare, manuellt rapporterad körning verifierade MySQL-anslutningen; anslutningsgrunden är kontrollerad, men ärendefunktioner och lagring av ärenden har inte verifierats.

Krav och acceptanskriterier finns i [kravspecifikationen](kravspecifikation.md). Installation, körning och demonstrationsflöde finns i [README](../README.md).

## 1. Syfte och urval

Verifieringen ska visa att ärenden skapas med rätt uppgifter, att felaktig inmatning inte sparas, att uppgifter och statusändringar finns kvar efter omstart samt att listor, detaljer och statusfilter visar rätt ärenden.

Urvalet utgår från risken att felaktiga uppgifter sparas, att lagrad information försvinner, att fel ärende visas eller ändras och att en misslyckad operation presenteras som lyckad. Antal tester eller täckningsprocent är inte i sig ett mått på om acceptanskriterierna är uppfyllda.

## 2. Testnivåer och arbetssätt

- **Enhetstester av applikationslogik:** validering, standardvärden och regler för status. Ger snabb och precis återkoppling på regler och gränsfall.
- **Integrationstester med verklig MySQL-testdatabas:** registrering, hämtning, statusändring, sortering och filtrering samt återöppning av lagring. Verifierar samspelet mellan logik och den valda lagringstekniken.
- **Automatiserade tester med simulerat lagringsfel:** verifierar hur applikationslogiken rapporterar en misslyckad skrivning. Kompletterar integrationstesterna men bevisar inte hantering av alla verkliga disk- eller databasfel.
- **Manuella kontroller av gränssnittet:** verifierar synlig återkoppling, navigation, formulärbeteende och demonstration enligt README.

Enhetstester ska inte vara den enda verifieringen av lagringen. Integrationstester använder en separat MySQL-testdatabas som är skild från utvecklingsdatabasen och återställs isolerat mellan tester. Testkonfigurationen ska skydda mot anslutning till utvecklingsdatabasen. Tester får inte ändra utvecklarnas sparade ärenden eller bero på körordning.

För beständighet stängs lagringsanslutningen och nya applikations-/lagringsinstanser öppnas mot samma testdata. Ett separat manuellt test stoppar och startar hela applikationen. Att endast läsa från samma minnesobjekt räcker inte.

Teknikvalen är FastAPI, MySQL via Docker Compose, Pytest, Vitest och React Testing Library. Exakta testkommandon och inställningar för separat testdatabas dokumenteras när projektstrukturen finns. Testnivåerna kan anpassas efter implementationen, men kontrollerna och motiveringen ska behållas eller uppdateras uttryckligen.

## 3. Planerade automatiserade tester

T01–T18 är fortsatt **Planerade**. T19–T22 gäller den körbara grundens health- och anslutningsstatuskontroller. Resultat för körda tester redovisas i avsnitt 6.

| ID | Typ | Krav | Beteende och förväntat resultat | Föreslagen nivå | Testlänk |
| --- | --- | --- | --- | --- | --- |
| <a name="t01"></a>T01 | Happy path | K1 | Giltig registrering sparar ett ärende med rätt trimmade fält, unikt ID, status Nytt och giltig skapandetid. Två registreringar får olika ID:n. | Integration | Saknas |
| <a name="t02"></a>T02 | Error path | K2 | Saknat eller tomt kund-ID, kundnamn, rubrik respektive beskrivning avvisas. Fel identifierar berört fält och antalet sparade ärenden är oförändrat. | Logik och integration | Saknas |
| <a name="t03"></a>T03 | Gränsfall | K2 | Kund-ID, kundnamn, rubrik eller beskrivning med enbart blanksteg avvisas. Inget ärende sparas. | Logik och integration | Saknas |
| <a name="t04"></a>T04 | Gränsfall | K1, K2 | Efter trimning godkänns rubrik på 1 och 100 tecken och beskrivning på 1 och 5 000 tecken; 101 respektive 5 001 avvisas. Kund-ID på 1 och 100 Unicode-kodpunkter och kundnamn på 1 och 200 godkänns; kund-ID på 101 och kundnamn på 201 avvisas. Längd räknas efter trimning. | Logik | Saknas |
| <a name="t05"></a>T05 | Error path | K2 | Tom eller okänd kategori respektive prioritet avvisas i applikationslogiken även utan gränssnittets validering. Inget ärende sparas. | Logik och integration | Saknas |
| <a name="t06"></a>T06 | Happy path | K3 | Ett registrerat ärende finns kvar med samma uppgifter när lagringen stängs och öppnas av nya instanser. | Integration | Saknas |
| <a name="t07"></a>T07 | Happy path | K4, K5 | Flera ärenden listas med angivna listfält i fallande skapandetid. Hämtning med ett ID ger samtliga fält från rätt ärende. | Integration | Saknas |
| <a name="t08"></a>T08 | Gränsfall | K4, K8 | Tom lagring ger en tom ärendelista utan fel. Ett giltigt filter utan träffar ger en tom resultatlista. | Integration | Saknas |
| <a name="t09"></a>T09 | Error path | K5, K6 | Hämtning eller statusändring för ett okänt ID ger ett hanterat fel. Inget ärende skapas och befintliga uppgifter ändras inte. | Integration | Saknas |
| <a name="t10"></a>T10 | Happy path | K3, K6 | Tillåtna statusändringar sparas och finns kvar efter återöppnad lagring. Övriga fält är oförändrade. Återöppning från Avslutat till Pågående ingår. | Logik och integration | Saknas |
| <a name="t11"></a>T11 | Error path | K6 | Tom eller okänd status avvisas och tidigare lagrad status samt övriga ärendefält förblir oförändrade. | Logik och integration | Saknas |
| <a name="t12"></a>T12 | Gränsfall | K6 | Att välja aktuell status igen lyckas utan att ändra några ärendeuppgifter. | Integration | Saknas |
| <a name="t13"></a>T13 | Error path | K7 | Simulerat lagringsfel vid registrering ger ett hanterat misslyckat resultat och inget sparat ärende. Detta kompletterar, men ersätter inte, test mot verklig MySQL-transaktion. | Logik med simulerat fel | Saknas |
| <a name="t14"></a>T14 | Error path | K7 | Simulerat lagringsfel vid statusändring ger ett hanterat misslyckat resultat och lämnar tidigare lagrad status oförändrad. Detta kompletterar, men ersätter inte, test mot verklig MySQL-transaktion. | Logik med simulerat fel | Saknas |
| <a name="t15"></a>T15 | Kompletterande funktion / happy path | K8 | Bland ärenden med olika status returnerar varje statusfilter endast rätt ärenden i rätt sortering. Alla returnerar samtliga. Lagrade uppgifter ändras inte. | Integration | Saknas |
| <a name="t16"></a>T16 | Gränsfall | K1, K2 | Planerat: verifiera trimning av inledande/avslutande mellanslag, tabbar, radbrytningar och U+00A0 från alla fyra textfält före validering och lagring; text som enbart består av dessa tecken avvisas. Kontrollera att inre mellanslag bevaras och att inre tabbar/radbrytningar i beskrivning bevaras. Efter trimning godkänns kund-ID med 100 och kundnamn med 200 Unicode-kodpunkter, medan 101 respektive 201 avvisas; längden före trimning får överstiga gränsen. | Logik och integration | Saknas |
| <a name="t17"></a>T17 | Error path | K7 | Mot separat MySQL-testdatabas framkallas ett kontrollerat fel efter att en skrivning påbörjats men före commit. Efter rollback verifieras via en ny anslutning att tidigare beständiga data är oförändrade. | Integration med verklig MySQL | Saknas |
| <a name="t18"></a>T18 | Gränsfall | K1, K2, Q2 | Planerat: använd samma exempel i Pytest och Vitest för inledande/avslutande mellanslag, tabbar, radbrytningar och U+00A0; avvisa text som bara består av dessa tecken; bevara inre mellanslag och inre tabbar/radbrytningar i beskrivning. Kontrollera efter trimning att kund-ID 100/101, kundnamn 200/201, rubrik 100/101 och beskrivning 5 000/5 001 Unicode-kodpunkter godkänns/avvisas vid respektive maxgräns; även testinnehåll som rått är längre än gränsen ska godkännas när det efter trimning är inom gränsen. | Pytest och Vitest med gemensamma exempel | Saknas |
| <a name="t19"></a>T19 | Grundbeteende | Q1 | `GET /health` returnerar `200` och `{"status":"ok"}` utan att kräva databasanslutning. | Backend med TestClient | [test_health.py](../backend/tests/test_health.py) |
| <a name="t20"></a>T20 | Error path | Q1 | `GET /health/db` returnerar `503` och statusen otillgänglig när `DATABASE_URL` saknas; API:t ska inte rapportera lyckad DB-kontakt. | Backend med TestClient | [test_db_health.py](../backend/tests/test_db_health.py) |
| <a name="t21"></a>T21 | Integration | Q1, Q2 | `GET /health/db` kör `SELECT 1` mot separat MySQL-testdatabas med `kundportal_test`-databas och -användare. Testet avvisar annan databas/driver/user och får inte använda utvecklingsdatabasen. | Integration med verklig MySQL | [test_db_health.py](../backend/tests/test_db_health.py) |
| <a name="t22"></a>T22 | Grundbeteende | Q1, Q2 | React-vyn visar API tillgängligt separat från MySQL otillgängligt när motsvarande health-anrop ger lyckat respektive misslyckat HTTP-svar. Fetch är stubbat; testet verifierar inte nätverksintegration. | Vitest och React Testing Library | [App.test.tsx](../frontend/src/App.test.tsx) |

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

Körkommandon finns i [README](../README.md#installation-och-körning). Backendtester utan databas körs med `pytest -q -m "not integration"`. MySQL-integrationen kräver den separata `mysql-test`-tjänsten och körs aldrig mot utvecklingsdatabasen.

Före verifiering och inlämning ska följande fyllas i här eller länkas till i README:

1. Nödvändiga verktyg och versioner.
2. Kommando för installation av beroenden.
3. Hur separat MySQL-testdatabas skapas, konfigureras och isoleras från utvecklingsdatabasen.
4. Exakta kommandon för att köra samtliga automatiserade tester från repots rot.
5. Hur ett lyckat respektive misslyckat testresultat känns igen.
6. Eventuella förberedelser och hur testdata städas bort.

Se [README:s körinstruktioner](../README.md#installation-och-körning).

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

### Senare rapporterad körning och manuella kontroller

Danielle rapporterade följande verifiering 2026-11-01. Resultatet är manuellt rapporterat och har inte körts om i denna dokumentationsändring.

| Typ | Kommando eller kontroll | Rapporterat resultat |
| --- | --- | --- |
| Automatiserat test, manuellt rapporterat | Från `backend`: `..venv\Scripts\python.exe -m pytest -q` | 3 passed in 0.66s. MySQL-integrationstestet kördes och hoppades inte över. |
| Manuell miljökontroll | `docker compose --profile test ps` | Både `mysql` och `mysql-test` visade `healthy`. |
| Manuell API-kontroll | `GET /health/db` | `{"status":"ok","database":"ok"}`. |
| Manuell gränssnittskontroll | React-vyn | Visade `API: Tillgänglig` och `MySQL: Tillgänglig`. |

Detta verifierar anslutningsgrunden från backend till MySQL och att gränssnittet visar tillgänglighetsstatus. Det verifierar inte registrering, beständig lagring, omläsning eller annan lagring av ärenden. `/health`-svaret rapporterades inte separat i denna körning.

Efter varje relevant verifieringstillfälle registreras verkliga resultat enligt följande mall. Ersätt platshållarna först efter genomförd körning.

| Uppgift | Ska dokumenteras |
| --- | --- |
| Datum och utförare | När kontrollen kördes och vem som körde den. |
| Version | Commit-SHA för den testade koden samt eventuella lokala ändringar. |
| Miljö | Operativsystem, runtime, databas och relevanta versioner. |
| Automatiserade tester | Exakt kommando, test-ID:n, faktiskt antal godkända/misslyckade/överhoppade tester samt länk till testutdata eller CI-körning. |
| Manuella kontroller | M-ID:n, genomförda steg, observerat resultat och godkänt/underkänt. Redovisas separat från automatiserade tester. |
| Avvikelser | Berörda krav, länk till felrapport/uppgift och resultat av eventuell omtestning. |

Planerade, överhoppade eller ännu inte implementerade kontroller får inte redovisas som godkända. Den tidigare pytest-körningens T21 hoppades över; den senare rapporterade körningen anger att MySQL-integrationstestet kördes utan att hoppas över. Ärendefunktionernas planerade tester är fortfarande inte genomförda.

## 7. Begränsningar

- Planen är inte bevis för att kraven är uppfyllda. Testlänkar och verkliga körresultat återstår.
- Logik- och integrationstester visar inte i sig att gränssnittets texter, formulär eller navigation fungerar. Manuella kontroller kompletterar dessa.
- Återöppnad MySQL-anslutning och nya applikations-/lagringsinstanser verifierar beständighet på integrationsnivå. Fullständig omstart av applikationen kontrolleras separat.
- Simulerade skrivfel verifierar den valda felvägen, inte alla verkliga lagringsfel. Vid implementation ska det dokumenteras var felet injiceras och vilken återställning testet faktiskt visar.
- Belastning, produktionsdrift, avancerad säkerhet, samtidiga uppdateringar från flera handläggare och externa integrationer ingår inte i denna verifieringsplan.
- Ingen viss testtäckningsprocent utlovas. Slutsatser ska kopplas till verifierade beteenden och kvarvarande risker.

## 8. Ansvar och spårbarhet

Varje utvecklingsuppgift kopplas till ett eller flera krav-ID:n och relevanta test-ID:n. Den som implementerar beteendet ansvarar för att dess verifiering och dokumentation uppdateras. Testförfattare, granskare och faktisk utförare dokumenteras i uppgiften eller PR:n.

Varje student ska kunna förklara varför testerna för det egna bidraget är relevanta, vad de visar och vilka begränsningar de har. Individuella redovisningar hanteras enligt kursinstruktionerna och läggs inte i repot.
