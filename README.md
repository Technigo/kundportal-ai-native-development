# Kundserviceportalen

## Projektöversikt

Kundserviceportalen är ett lokalt arbetsverktyg där en aktiv handläggare åt gången ska kunna registrera, läsa och följa kundärenden. Varje ärende innehåller obligatoriskt kund-ID och kundnamn som anges manuellt. Backendens ticket API och MySQL-lagring finns; React-gränssnittet för ärenden byggs fortfarande. Första versionen prioriterar datorwebbläsare och ett kärnflöde som kan genomföras med tangentbord.

**Projektstatus 2026-11-01:** teknikvalen är React + TypeScript + Vite, FastAPI och MySQL via Docker Compose. Backendens ärende-API har nu registrering, lista, detaljer, statusändring och statusfilter med Alembic-migration; dess 26 backendtester har passerat inklusive MySQL-integration. React-klientens ärendegränssnitt är inte implementerat. Se [API-kontraktet](docs/api-kontrakt.md) och [verifieringsplanen](docs/verifieringsplan.md) för implementationsbeslut och faktiska tester.

### Gruppens underlag

- [Kravspecifikation och acceptanskriterier](docs/kravspecifikation.md)
- [Verifieringsplan, planerade tester och resultat](docs/verifieringsplan.md)
- [API-kontraktets backendbaslinje för frontendgranskning](docs/api-kontrakt.md)

Länka till dessa underlag från teamets löpande PR. Kursens ursprungliga instruktioner finns kvar längre ned i denna README.

### Planerad funktionalitet

- Registrera kundärenden med obligatoriskt, manuellt angivet kund-ID och kundnamn samt validerad rubrik, beskrivning, kategori och prioritet.
- Visa ärendelista och ärendedetaljer med de sparade kunduppgifterna.
- Ändra status mellan Nytt, Pågående, Väntar på kund och Avslutat.
- Bevara ärenden och statusändringar efter omstart.
- Visa begripliga fel när inmatning är felaktig eller en operation misslyckas, och skilja ett bekräftat lagringsfel från ett okänt sparutfall.
- Filtrera ärendelistan på status, fastställd kompletterande funktion.

Endast påhittade uppgifter används. Kunduppgifterna sparas på respektive ärende; ett separat kundregister ingår inte. Kundinloggning, produktionsdrift, externa integrationer och en AI-funktion i produkten ingår inte heller. Efter registrering kan bara status ändras; radering av ärenden ingår inte. Fastställda regler och avgränsningar finns i [kravspecifikationen](docs/kravspecifikation.md).

### Team och teknik

| Uppgift                           | Status                                                                                                                      |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Teamnamn                          | Jiriga                                                                                                                      |
| Medlemmar och GitHub-användarnamn | `Daniel - /danielleven` `Danielle - /danielleroslund` `Lukas - /LurreT` `Alvar - /AlvarArias` `Nora - /NoraAljuburiMasamra` |
| Språk och ramverk                 | `TypeScript`, `React`, `Vite`, `Python`, `FastAPI`                                                                            |
| Backendramverk                    | `FastAPI`                                                                                                                     |
| Klientplattform                   | `Webbapplikation`                                                                                                           |
| Databas/beständig lagring         | `MySQL` via `Docker Compose`                                                                                                 |
| Testverktyg                       | `Vitest`, `Pytest`                                                                                                          |

### Ansvarsfördelning

| Medlem | Huvudansvar | Konkreta uppgifter |
| --- | --- | --- |
| Danielle | Backend | Bygga API, databas, validering och hantering av ärendestatus med FastAPI och MySQL. |
| Daniel | Frontend, delat med Lukas, Nora och Alvar | Bygga formulär, ärendelista, detaljvy och statusfilter i React. |
| Lukas | Integration och utvecklingsmiljö samt delat frontendansvar med Daniel, Nora och Alvar | Koppla ihop frontend och backend, samordna API-format, ordna startkommandon och lokala testkörningar samt utveckla frontend. |
| Nora | UX samt delat frontendansvar med Daniel, Lukas och Alvar | Skissa användarflöden och vyer, precisera acceptanskriterier, utforma felmeddelanden och utveckla frontend. |
| Alvar | Tester samt delat frontendansvar med Daniel, Lukas och Nora | Samordna testplanen, skriva automatiserade tester, dokumentera faktiska testresultat och utveckla frontend. |

Rollerna anger huvudansvar. Arbetet fördelas flexibelt och teammedlemmarna hjälper varandra där det behövs. Uppgifter kopplas till relevanta krav-ID:n och verifiering. Alla ansvarar för tester och dokumentation för sina egna ändringar, och andra teammedlemmar validerar dem.

### Gemensamt arbetssätt

En funktion räknas som färdig när den har verifierats mot den riktiga motparten, relevanta tester har körts, dokumentationen har uppdaterats och en annan teammedlem har granskat ändringen. Simulerade API-svar får användas under parallell utveckling; verifiering av integrationen görs mot den riktiga frontend- och backendlösningen.

Både backend- och frontendtester ska vara godkända vid lokal körning på den aktuella PR-versionen före merge till teamets `main`. Granskningen dokumenterar vem som granskade, vad som kontrollerades och vad återkopplingen ledde till.

Gemensamma AI-instruktioner ska versionshanteras i repot. Varje medlem ska kunna förklara sitt bidrag, vilka kontroller som genomförts och vad de faktiskt visar, även för AI-genererad kod. Instruktionerna återstår att lägga till.

### Installation och körning

Följande instruktioner gäller PowerShell från repots rot. Frontend och backend körs lokalt; Docker används endast för MySQL. Ärende-API:t är tillgängligt via FastAPI men frontendens ärendevyer finns ännu inte.

#### Förutsättningar

- Python 3.9 eller senare.
- Node.js 20.19+ eller 22.12+ och npm.
- Docker Desktop med Linux-containrar startad.

#### 1. Lokal konfiguration

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Byt exempelvärdena för lösenord i `.env` mot lokala lösenord och håll filen privat. Om du byter användarnamn eller lösenord ska du även uppdatera motsvarande `DATABASE_URL` eller `TEST_DATABASE_URL`. `.env` ignoreras av Git; checka aldrig in lokala anslutningsuppgifter. Behåll `DATABASE_URL` riktad mot `kundportal_dev` och `TEST_DATABASE_URL` riktad mot separat `kundportal_test`.

#### 2. Starta MySQL

```powershell
docker compose up -d mysql
docker compose ps
```

Vänta tills tjänsten visar `healthy`. Utvecklingsdatabasen använder den namngivna volymen `mysql_data` och bevaras vid vanlig omstart. Vanlig backendstart skapar eller återställer inte tabeller; schemamigrering körs uttryckligen i nästa steg.

För MySQL-integrationstester, starta den separata testservern:

```powershell
docker compose --profile test up -d mysql-test
docker compose --profile test ps
```

Testservern använder port `3307`, databasen `kundportal_test` och användaren `kundportal_test`. Testet verifierar dessa värden innan anslutning och använder aldrig utvecklingsdatabasen. Testtjänsten har ingen uttryckligt konfigurerad namngiven volym.

#### 3. Installera backend

Skapa miljön och installera beroenden från repots rot:

```powershell
py -3.9 -m venv backend\.venv
backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

#### 4. Skapa eller uppdatera databasschemat

Kör från ett PowerShell-fönster i repots rot efter att utvecklings-MySQL är `healthy`:

```powershell
Set-Location backend
.\.venv\Scripts\alembic.exe upgrade head
```

Kommandot använder `DATABASE_URL` från projektets `.env` och skapar/uppdaterar endast schemat. Det körs inte automatiskt vid backendstart. Kör inte detta kommando med utvecklings-URL när avsikten är testkörning; integrationstester validerar separat `TEST_DATABASE_URL` och migrerar endast `kundportal_test`.

#### 5. Skapa demonstrationsärenden (valfritt)

Efter migration kan påhittad demonstrationsdata skapas med ett separat, uttryckligt kommando:

```powershell
Set-Location backend
.\.venv\Scripts\python.exe -m app.seed_demo
```

Kommandot körs inte vid start och kan upprepas utan att lägga till samma demonstrationsärenden igen.

#### 6. Starta backend

Efter migration startar du backend i ett separat PowerShell-fönster:

```powershell
Set-Location backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

#### 7. Installera och starta frontend

Starta frontend i ett annat PowerShell-fönster:

```powershell
Set-Location frontend
npm ci
npm run dev
```

Öppna adressen som Vite skriver ut, normalt `http://localhost:5173`. Vyn visar API-status separat från MySQL-status.

#### 8. Prova ärende-API:t i FastAPI

Öppna `http://localhost:8000/docs`. Prova `POST /api/tickets` med registreringsexemplet i [API-kontraktet](docs/api-kontrakt.md), kontrollera svaret och dess `id`, läs det med `GET /api/tickets/{id}`, prova lista/filter via `GET /api/tickets?status=in_progress` och ändra enbart status med `PATCH /api/tickets/{id}/status`.

#### 9. Kontrollera anslutningen

```powershell
Invoke-RestMethod http://localhost:8000/health
Invoke-RestMethod http://localhost:8000/health/db
```

`/health` kontrollerar endast att API:t svarar. `/health/db` kör `SELECT 1` mot `DATABASE_URL` och svarar `503` om databasen inte kan nås. Bekräfta även statusen i frontendvyn. Detta är den verkliga anslutningskontrollen; simulerade frontendtester bevisar inte MySQL-anslutningen.

#### 10. Tester

Backendtester som inte kräver databas:

```powershell
Set-Location backend
.\.venv\Scripts\python.exe -m pytest -q -m "not integration"
```

MySQL-testet och hela backendsviten kräver att `mysql-test` är startad och frisk:

```powershell
Set-Location backend
.\.venv\Scripts\python.exe -m pytest -q
```

Integrationsfixturen kontrollerar att `TEST_DATABASE_URL` är riktad mot `kundportal_test` på port 3307 och verifierar databas- och användaridentitet före migration eller städning. Den migrerar testdatabasen och rensar endast dess ärenderader mellan tester. Tester använder aldrig `DATABASE_URL` mot utvecklingsdatabasen.

Frontendtester och produktionsbygge:

```powershell
Set-Location frontend
npm test
npm run build
```

Frontendtestet stubbar HTTP-svaren och kontrollerar bara att API-status och MySQL-status visas separat. Det ersätter inte MySQL-integrationstestet eller manuell kontroll av hela anslutningskedjan.

Avsluta lokala utvecklingsservrar med `Ctrl+C`. Stoppa MySQL utan att radera data med `docker compose stop mysql`; starta igen med `docker compose up -d mysql`. Start/omstart tömmer eller återställer inte utvecklingsdatabasen. Inga återställnings- eller seedkommandon finns ännu.

En annan person ska kunna följa instruktionerna utan ett personligt betalkonto. Körinstruktionerna verifieras från en ren klon enligt M06 i verifieringsplanen.

### Planerat demonstrationsflöde

Detta flöde är en plan för den färdiga lösningen och har ännu inte genomförts.

1. Starta applikationen enligt körinstruktionerna och öppna ärendelistan.
2. Försök skapa ärenden med saknat kund-ID, kundnamn respektive rubrik. Visa fältspecifika fel, bevarad inmatning och att inget ärende sparas.
3. Skapa två giltiga ärenden med påhittat innehåll och manuellt angivet kund-ID och kundnamn. Kontrollera att bekräftad registrering öppnar det nya ärendets detaljvy och att rätt kunduppgifter visas i både lista och detaljer.
4. Filtrera på Nytt, öppna ett ärende och ändra dess status till Pågående. Återgå till listan och kontrollera att filtret Nytt är kvar och att det ändrade ärendet inte längre matchar.
5. Filtrera på Pågående och kontrollera att det ändrade ärendet visas. Visa även ett filter utan träffar och återställ listan med Alla.
6. Välj ett statusfilter och ladda om sidan helt. Kontrollera att filtret återgår till Alla och att ärendena finns kvar.
7. Stoppa hela applikationen och starta den igen med samma lagring. Visa att ärenden, kunduppgifter och statusändring finns kvar.
8. Genomför kärnflödet med tangentbord och kontrollera synlig fokusmarkering samt begripliga felmeddelanden.
9. Kör de automatiserade testerna och visa faktiska resultat samt kända begränsningar i verifieringsplanen.

### Arbetsplan

Utgå från de fastställda produktkraven och granska [API-kontraktsutkastet](docs/api-kontrakt.md) tillsammans innan frontend och backend utvecklas parallellt. Fördela arbetet flexibelt i uppgifter kopplade till krav-ID:n och verifiering.

Det första integrationsmålet är att skapa ett ärende i React, spara det via FastAPI i MySQL och läsa tillbaka det efter omladdning. Lukas samordnar denna kedja så snart grunderna finns. Bygg därefter vidare på lista och detaljer, statusändring och felhantering samt statusfilter. Integrera och verifiera löpande och uppdatera tester och dokumentation tillsammans med respektive funktion. Teamet fastställer interna leveransdatum.

Körresultat redovisas i verifieringsplanen först efter faktisk körning. Kursens regler för gemensamma och individuella underlag gäller enligt instruktionerna nedan.

---

Här samlar ni teamets arbete med Kundserviceportalen i kursen AI Native Development. Ni väljer teknik och bygger en mindre fullstacklösning med AI-stöd. Använd bara påhittade kunduppgifter.

**Uppgift, betygskriterier, veckoförväntningar och deadline finns under Kursexamination i Disco.** Börja där och återvänd dit under arbetet.
[Länk till Disco](https://technigo.disco.co/p/fall-2026-ai-native-development/collection/Q29sbGVjdGlvbjozNzg3Ng==?u=25dab1f8-7abb-463e-a19e-d379efb7caae&drawerTab=comments)

## Kom igång

Projektarbetet börjar vecka 5. Ni får börja frivilligt vecka 4; den veckans fristående kodövning finns kvar.

1. Läs uppgiften och veckans förväntningar i Disco.
2. **En person i teamet skapar en publik fork** från [kursens repository](https://github.com/Technigo/kundportal-ai-native-development) på sitt GitHub-konto. Den personen bjuder in övriga teammedlemmar som **collaborators** via **Settings -> Collaborators -> Add people**. Alla accepterar sin inbjudan och kontrollerar att de kan pusha till teamets fork. Vi kan läsa koden och underlagen i den publika forken utan en separat inbjudan.
3. Klona teamets fork till era datorer.
4. Gör en första förändring: beskriv teamet och er första plan i er dokumentation. Committa och pusha förändringen till `main` i teamets fork. Körbar kod behövs inte för att öppna PR:n.
5. Öppna teamets löpande PR enligt nästa avsnitt.
6. Fortsätt med projektarbetet enligt vecka 5 i Disco.

Ni arbetar i **samma fork** under projektet. Det räcker att en person skapar den. Se [GitHubs instruktion för att bjuda in collaborators](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/inviting-collaborators-to-a-personal-repository) om ni behöver hjälp.

## Branches och pull requests

Teamets löpande PR går **från `main` i teamets fork till `main` i kursens repository**.

| Val i GitHub    | Ange                                        |
| --------------- | ------------------------------------------- |
| Base repository | `Technigo/kundportal-ai-native-development` |
| Base            | `main`                                      |
| Head repository | Teamets fork                                |
| Compare         | `main`                                      |

Välj **compare across forks** om båda repositories inte visas. Använd teamets namn i PR-rubriken. Kopiera innehållet i [PR-mallen för teamets projekt](.github/PULL_REQUEST_TEMPLATE/teamets-projekt.md) till beskrivningen och fyll i det som finns vid starten. Resten växer fram under projektet.

Håll samma PR öppen under projektperioden. Den används för uppföljning och inlämning och ska inte mergas till kursens repository under arbetet. Nya commits på teamets `main` syns i samma PR.

Inom teamets fork kan ni använda separata branches för mindre uppgifter och granska dem i interna PR:er till **teamets egen `main`**. Kontrollera vilket repository som är mål innan ni öppnar en intern PR. Gör granskningen spårbar: vem granskade, vad kontrollerades och vad ledde återkopplingen till?

[GitHubs guide för PR från en fork](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request-from-a-fork) beskriver valen i gränssnittet.

## Er dokumentation

Ni utformar själva dokumentationen och styrningen av era AI-verktyg utifrån uppgiften i Disco. Länka till teamets gemensamma underlag från den löpande PR:n, så att vi kan följa ert arbete.

## Slutversion och inlämning

När gruppens kod, tester och gemensamma dokumentation är pushade kopierar ni länken till den commit som innehåller slutversionen. Lägg länken överst i teamets löpande PR-beskrivning under **Slutversion för examination**. Kontrollera att länkarna till underlagen visar den inlämnade versionen i teamets fork.

Varje student lämnar sin individuella redovisning som en **Markdown-fil (.md) i sin egen inlämning i Disco**. Märk dokumentet med ditt namn och länka till teamets fork, löpande PR, markerade slutversion och det arbete som visar ditt eget bidrag.

Den individuella redovisningen ska inte läggas i teamets repository eller länkas från teamets PR. Du behöver inte dela dokumentet med dina klasskamrater. Gruppens kod, tester och gemensamma dokumentation finns fortsatt på GitHub.

Följ den aktuella instruktionen och deadlinen i Disco.
