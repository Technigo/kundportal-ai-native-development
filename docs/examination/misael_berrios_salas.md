# Individuellt underlag — Misael Berrios Salas

**Teamets fork:** https://github.com/misael86/kundportal-ai-native-development
**Teamets löpande PR:** https://github.com/Technigo/kundportal-ai-native-development/pull/1
**Slutversion för examination:** *(läggs till vid inlämning — se PR-beskrivningen)*

> Arbetsutkast för min individuella redovisning i Disco. Den här filen ska inte committas till teamets repository.

## Verktyg

- IDE: VS Code.
- AI-verktyg: GitHub Copilot med modellval Auto. Min upplevelse var att Copilot oftast valde GPT-6 Luna.
- Jag hade GitHub CLI (`gh`) i terminalen på min dator. Jag minns också att AI:n kunde använda en webbläsare med Playwright för att navigera appen och själv kontrollera delar av en implementation.

## Uppstart, gruppförändring och omstart

Efter att flera personer föll bort ur gruppen blev vi till slut två: Carter och jag. Vi hade svårt att få till ett första gemensamt möte. För att arbetet skulle komma igång tog jag på mig att sätta upp projektet på GitHub och började också själv skapa en första kodgrund med Copilot.

Jag satte upp riktlinjer för hur arbetet skulle ske i branches och pull requests: bland annat att göra fokuserade ändringar, köra relevanta kontroller och be om granskning. I README:n på min planeringsbranch finns sådana instruktioner dokumenterade, till exempel att öppna PR mot teamets `main`, be en teammedlem granska ändringen och invänta grön CI. Det belägger dokumenterade arbetsregler, inte att tekniska branch protection-regler var aktiverade i GitHub.

När Carter och jag väl skulle arbeta vidare valde vi att börja om från en gemensam grund, så att Carter också skulle förstå projektets struktur och känna sig delaktig från början. Jag ville inte att han bara skulle behöva ta över en kodbas som jag redan hade format själv.

En detalj framgår tydligare av Git-historiken än av min minnesbild: den första projektgrunden finns i [commit `e7012eb6`](https://github.com/misael86/kundportal-ai-native-development/commit/e7012eb6ac80d5f76a0fc1c649aa38678b0f09a8). Jag minns den första grunden som något vi inte tog med oss vidare, men den första MVP:n hann faktiskt mergeas genom [PR #22](https://github.com/misael86/kundportal-ai-native-development/pull/22) den 2 november 2026 och revertades sedan i commit [`a386dbf4`](https://github.com/misael86/kundportal-ai-native-development/commit/a386dbf4e6f0e6133bd51fc8cdf3fd924b2c00db), några minuter senare. Det är därför mer korrekt att säga att vi inte behöll den som grund för fortsatt arbete än att säga att den aldrig mergeades. Historiken visar scaffold, merge och revert; min förklaring till omstarten och hur svårt det var att få till första mötet är min egen retrospektiva redogörelse.

## Planeringsgrenen `docs/project-plan-and-specs`

Jag gjorde hela planeringsbranchen själv med Copilot som stöd. Jag skrev och promptade fram planeringen, specifikationerna, instruktionerna och den tidiga projektgrunden. Det är min egen redogörelse för arbetet; GitHub-historiken ger kompletterande spårbarhet.

Grenen [`docs/project-plan-and-specs`](https://github.com/misael86/kundportal-ai-native-development/tree/docs/project-plan-and-specs) omfattar en plan, krav/specifikationer, instruktioner och en tidig projektgrund. Den föreslår Playwright för E2E och beskriver ett framtida CI-flöde, men [projektplanen](https://github.com/misael86/kundportal-ai-native-development/blob/docs/project-plan-and-specs/docs/plan.md) säger att CI-designen ännu inte implementerats. Grenens `package.json` saknar Playwright-beroende och `test:e2e`-script. Därför ska jag inte beskriva grenen som en färdig, körbar Playwright-lösning eller säga att E2E-tester kördes där.

Arbetet skickades som [PR #21](https://github.com/misael86/kundportal-ai-native-development/pull/21), som stängdes utan merge den 4 november 2026. Den här grenen och dess planering fanns alltså inte i `main` genom den PR:n. GitHub anger mig som PR-författare; av 17 commits listas 15 med mig som författare och två med Copilot. Detta stämmer med min minnesbild att jag ensam drev arbetet med Copilot som stöd; commitmetadata i sig visar inte vilka prompts jag skrev eller exakt vad jag granskade.

Jag skiljer på två saker: att AI:n interaktivt navigerade i appen med webbläsare/Playwright och att ha en automatiserad E2E-svit som går att köra om med ett kommando. Min minnesbild och gruppens processunderlag stöder att vi använde den första typen av kontroll under featurearbetet. Planeringsbranchen innehöll däremot bara en plan för den senare; den hade inget `test:e2e`-kommando. En webbläsarkontroll kunde hjälpa till att upptäcka problem i det synliga flödet, men ersatte inte automatiserade tester eller min egen granskning.

Instruktionerna som jag lade till på planeringsgrenen säger att skapa commits efter godkända kontroller och att aldrig pusha utan uttrycklig begäran. Det dokumenterar önskat arbetssätt, inte att en push genomfördes. I den här VS Code-miljön kan assistenten använda webbläsarverktyg och `gh` för att läsa PR-information. Skrivning till GitHub kräver behörighet och en uttrycklig begäran; dagens verktygstillgång bevisar inte i sig vad som användes i varje tidigare session.

## Mitt arbete på branchen

På `feture/redesign`, som ligger till grund för [PR #25](https://github.com/misael86/kundportal-ai-native-development/pull/25), gjorde jag branchens arbete själv med Copilot som stöd. Jag jobbade bland annat med:

- ärendeflöden i API och webb, till exempel visning, redigering, validering och hantering av status, anteckningar och borttagning
- att dela upp blandade krav i mindre och tydligare beteenden samt komplettera API- och UI-tester
- en CI-kontroll som ser till att krav-ID:n finns i testtitlar och att nya krav får nya tester
- instruktioner för kravmärkta tester, dokumentation och mindre UI-justeringar

Det går att följa ändringarna i branchens commits: `3e778054` (ärendeflöden och tester), `f5d51954` (kravkontroll i CI), `80339c94` (UI-justering), `cd2ebee1` (testinstruktioner) och `920d548e` (dokumentation). Se även [PR #25](https://github.com/misael86/kundportal-ai-native-development/pull/25), [featurekraven](https://github.com/misael86/kundportal-ai-native-development/tree/feture/redesign/docs/features), [kravkontrollen](https://github.com/misael86/kundportal-ai-native-development/blob/feture/redesign/scripts/requirement-coverage.cjs) och [CI-workflowen](https://github.com/misael86/kundportal-ai-native-development/blob/feture/redesign/.github/workflows/ci.yml).

Jag märkte att AI-förslag ibland ändrade en del av gränssnittet utan att uppdatera liknande delar. Därför behövde jag kontrollera fler vyer än den fil eller komponent som först nämndes. Jag såg också att vissa krav innehöll både ett lyckat flöde och ett felutfall. Jag delade upp dem så att de blev lättare att följa upp. Samtidigt räcker det inte att ett krav-ID står i en testtitel: jag behöver också läsa testet och kontrollera att det faktiskt testar rätt sak.

## Riskkontroll av kravtäckningen

Jag bad Copilot att testa om kravkontrollen upptäcker när ett krav-ID saknas i en testtitel. Copilot tog tillfälligt bort ID:t från testtiteln för `CI-REQ-COVERAGE-003`, körde kontrollen, återställde titeln och körde kontrollen igen:

| Steg | Kommando | Resultat |
|---|---|---|
| Krav-ID:t togs tillfälligt bort ur testtiteln | `npm run check:requirements -- HEAD` | **Underkänt som förväntat:** `CI-REQ-COVERAGE-003 has no matching test title in the automated test files.` |
| Testtiteln återställdes | `npm run check:requirements -- HEAD` | **Godkänt:** 84 krav har testtitlar. |

Testfilen återställdes efter försöket, och den tillfälliga ändringen finns inte kvar. Det här visar att kontrollen kan upptäcka när ett krav-ID saknas i testtiteln. Det visar däremot inte att kravet är tydligt eller att testet faktiskt kontrollerar rätt beteende. Jag behöver själv kunna förklara den skillnaden.

Min slutsats är att kontrollen är bra för att se om krav-ID:n finns i testtitlarna, men att den inte kontrollerar testernas innehåll. Flera krav-ID:n kan också stå i samma testtitel utan att kontrollen vet om testet täcker dem allihop. Därför behöver jag granska både kraven och testerna, inte bara lita på resultatet från kontrollen.

## Testresultat och begränsningar

Följande kontroller kördes för arbetet på branchen. Resultaten visar branchens läge, men jag skiljer dem från tidigare teamkörningar och från manuella tester:

- `npm test` — godkänt: API 106 tester och webb 95 tester.
- `npm run test:requirements` — godkänt: 6 tester.
- `npm run check:requirements -- HEAD` — godkänt efter återställningen: 84 krav har testtitlar.
- `git diff --check` — godkänt efter ändringarna.

De här kommandona kontrollerar automatiska tester, kravspårning och whitespace. De visar inte att jag personligen har granskat varje kodväg eller manuellt testat hela appen.

## Egen reflektion: promptomskrivning och tokenkostnad

Jag provade ett arbetssätt där Copilot först skrev om min uppgift. Sedan kortade en Caveman-komprimering ner den omskrivna prompten, och den kortare versionen användes för att utföra uppgiften. Det finns också en konfigurationsändring som visar att de två skills som styrde arbetssättet ändrades: [commit `d5e4b788`](https://github.com/misael86/kundportal-ai-native-development/commit/d5e4b788), med commitmeddelandet ”streamline agent workflow for lower token usage”.

Jag hann inte mäta hur många fler eller färre tokens Caveman faktiskt använde. Min upplevelse var ändå att min tokenanvändning ökade och att tokens tog slut snabbare. Jag kan alltså beskriva hur det kändes när jag använde arbetssättet, men jag har ingen mätning som visar den faktiska skillnaden.

De ursprungliga promptarna, de omskrivna versionerna, de komprimerade versionerna och mätvärdena för varje modellkörning sparades inte. Därför går det inte att räkna ut den faktiska token- eller kontextökningen. Det är också möjligt att en kortare slutprompt sparar tokens i själva utförandet, men att omskrivningen, komprimeringen och tidigare innehåll i chatten samtidigt använder tokens. En kortare prompt betyder alltså inte automatiskt lägre total förbrukning.

Om originalet innehåller **P** tokens och den komprimerade versionen **C** tokens kan själva utförandet som mest spara ungefär **P − C** prompttokens jämfört med att skicka originalet direkt. Den möjliga besparingen behöver vägas mot tokens för omskrivningen och komprimeringen och mot tidigare innehåll i chatten. Utan mätloggar kan jag inte säga hur stor skillnaden blev eller om det blev billigare totalt.

Det jag kan mäta är att de två skill-filerna i committen kortades från sammanlagt **65 rader till 33** (**32 rader färre, cirka 49 %**). Det gäller bara antalet rader i instruktionerna; det visar inte hur många tokens som användes i faktiska uppgifter. I den nya konfigurationen togs den vanliga promptkomprimeringen bort. Caveman-steget skulle bara användas om det uttryckligen efterfrågades. Det visar att instruktionerna kortades, men inte att någon viss tokenbesparing uppnåddes.

## Branchens mätbara krav- och testförändring

Jag jämförde `origin/main` med den nuvarande versionen av branchen för att se hur kraven och testerna förändrats. Baslinjens tester kördes i en tillfällig, isolerad kopia av `origin/main`, så baslinjekörningen ändrade inget i arbetskopian.

| Mått | `origin/main` | Branchen | Skillnad |
|---|---:|---:|---:|
| Krav-ID:n i feature-specifikationerna | 29 | 84 | 57 tillkom, 2 togs bort; netto +55 |
| API-tester | 77 | 106 | +29 |
| Webbtester | 69 | 95 | +26 |
| Totalt API- och webbtester | 146 | 201 | +55 |

De två krav som togs bort var `UI-CONSISTENCY-004` (palett/designvariabler) och `UI-CONSISTENCY-005` (gemensamma formulärkomponenter). Det är mer rättvisande att säga att två UI-krav togs bort än att kalla båda rena visuella krav. Det ena handlade om palettvariabler och det andra om en komponentlösning som inte längre ingick i omfattningen. Projektet har fortfarande UI-krav för tillgänglighet och tydlig återkoppling.

Siffrorna visar hur hela branchen förändrats. De visar inte bara effekten av att göra kraven mindre och mer funktionella. Branchen innehåller också nya och utvecklade ärendeflöden, felhantering och CI. Därför kan jag inte säga att kravuppdelningen ensam ledde till 55 fler tester eller 55 nya krav. Jag kan däremot säga att antalet krav-ID:n ökade netto med 55 och att den automatiska testsviten för kravkontrollen nu har 6 tester.

Kommandon och resultat:

- `npm test` på `origin/main`, i en tillfällig isolerad kopia — API 77/77 och webb 69/69 passerade.
- `npm test` på aktuell branch — API 106/106 och webb 95/95 passerade.
- `npm run test:requirements` — 6/6 passerade.
- `npm run check:requirements -- 95c32743a1b974374582276f21f58a596db0d69b` — passerade; 84 krav-ID:n har testtitlar och 57 nya krav har nya tester.

Det här är mätbara resultat från två versioner av koden, men det var inget kontrollerat försök där uppgift och kontext hölls lika. Därför kan jag inte använda ökningen av tester som bevis för att en viss ändring i mina prompts ensam orsakade resultatet.

## Min initiala prompt och varför vi strukturerade arbetet så

Tidigt i projektet gav jag Copilot en bred kontext i den inledande prompten. Här är kärnan i vad jag beskrev (rekonstruerat från beslutsloggen och conversation-log — den ursprungliga chatten är inte exporterad i sin helhet):

> *Vi är två studenter som bygger en kundserviceportal som kursuppgift. Jag vill att du hjälper mig planera och implementera den stegvis. Vi ska bygga en fullstacklösning med TypeScript, React och SQLite som körs lokalt. Håll beskrivningar korta och i punktform — det ska vara lätt att läsa. Dela upp allt i så små vertikala features som möjligt (t.ex. "lista ärenden" är en feature, "skapa ärende" är en annan). Varje feature ska ha egna krav, egna tester och vara oberoende av de andra. Arbeta spec-driven: definiera krav först, skriv tester utifrån kraven, implementera sedan. Om du är osäker — fråga mig och ge tre alternativ. Ta inga egna beslut.*

**Varför jag valde att strukturera prompten så:**

- **Vertikala, oberoende features** — Gör varje steg enkelt att granska på egen hand. En PR med "skapa ärende" är lätt att reviewe; en PR med "hela systemet" är inte det.
- **Spec-driven, krav-ID:n först** — Tvingar fram tydliga acceptanskriterier innan kod skrivs. Krav-ID:n i testtitlar gör det spårbart i CI.
- **Kort och punktform** — Minskar risken att AI:n skriver lång prosa som är svår att kvalitetssäkra. Lättläst dokumentation är också lättare för en människa att granska.
- **Fråga — ge inte svar** — Jag ville undvika att AI:n tog tekniska beslut utan att jag hade överblick. Det ledde till tydliga diskussioner om t.ex. kategorier (rullista eller fritext?), testbarhet för rulllistor och hur blank text i anteckningsfältet ska behandlas.
- **Separata, oberoende delar** — Features som inte beror på varandra kan implementeras parallellt av Carter och mig utan att vi blockerar varandra.

Resultatet syns i commit-historiken: varje feature landade i ett eget commit med egna tester och krav-ID:n, vilket också gör [CI-kravkontrollen](https://github.com/misael86/kundportal-ai-native-development/blob/main/scripts/requirement-coverage.cjs) meningsfull.

## Manuella tester och iterationer

Under featureutvecklingen testade Carter och jag features manuellt i webbläsaren. Jag personligen itererade på UI:t och hittade saker som automatiserade tester inte hade fångat:

**Exempel 1 — Redigeringsflödet:**
Jag körde igenom hela redigeringsflödet manuellt och märkte att man behövde spara varje fält separat (t.ex. status för sig, anteckning för sig). Det var inte tydligt nog. Jag ändrade flödet så att alla redigeringar — status, anteckning, rubrik m.m. — sparas i ett sammanhållet steg via en "Spara ändringar"-knapp. Automatiserade enhetstester fångade inte detta problem eftersom de testade komponenterna isolerat, inte det sammansatta flödet.

**Exempel 2 — Dropdown-chevron:**
Jag testade manuellt att expandera och kollapsa ärendekort och noterade att chevron-ikonen för dropdown inte var centrerad visuellt. Jag justerade CSS-positioneringen. Inga automatiserade tester täcker ikonpositionering — det kräver manuell visuell kontroll.

Dessa manuella iterationer ledde till commits [`ab3a14aa`](https://github.com/misael86/kundportal-ai-native-development/commit/ab3a14aa) och [`65ba0bd2`](https://github.com/misael86/kundportal-ai-native-development/commit/65ba0bd2).

**Begränsning:** Jag loggade inte varje manuellt teststeg med förväntat/faktiskt utfall. Det jag kan belägga är att problemen hittades, att de ledde till konkreta kodändringar och att de automatiserade testerna passerade efteråt.

## Peer review — granskning av Carters bidrag

Jag granskade och mergade Carters [PR #26](https://github.com/misael86/kundportal-ai-native-development/pull/26) (`accessibility-focus`-branchen), som samlade formulärtillgänglighet under `ACCESSIBILITY-FORMS` med 9 nya krav och tillhörande tester, och lade till tangentbordsfokus i dokumenterade användarflöden.

**Vad jag tittade på:**
- Varför `h1`-rubriken i `App.tsx` fick en `tabIndex={-1}` — jag ställde en inline-kommentar i koden: *"Hur kommer det sig att denna fick en tabindex? borde väl inte ha varit navigerbar innan heller?"* Carter förklarade att fokus flyttas dit när man tar bort alla ärenden, för att skärmläsaren ska få ett meningsfullt ankare. Det fattade jag — kommentaren markerades som resolved.
- Att de 9 nya kraven (`ACCESSIBILITY-FORMS-001–009`) hade matchande testtitlar — kravkontrollen i CI bekräftade det: 89 krav med testtitlar, 9 nya krav med nya tester.
- API-/webb-tester passerade: API 106/106, webb 110/110.

**Vad granskningen ledde till:**
Jag godkände PR:n och mergade in den: *"Snyggt! Hade inte alls tänkt på focus vid tangentbordsnavigering efter att man gjort olika actions!"* Det var ett tillgänglighetsfall jag inte hade tänkt på själv. Tangentbordsfokus vid dynamiska flöden (som efter att ett ärende tagits bort) var ett gap i min egna implementation; Carters PR adderade det systematiskt. Merge-commit: `ac4e931`.

**Begränsning:** Manuell kontroll med tangentbord och hjälpmedel var odokumenterad — det noterades explicit i PR-beskrivningen.

---

## VG 1: Välgrundade avvägningar — testnivå

Jag valde att testa API och webb med separata enhetstester (Vitest + Supertest + React Testing Library) i stället för end-to-end-tester genom hela stacken (Playwright).

| | Enhetstester (det vi valde) | E2E via Playwright |
|---|---|---|
| **Vad det visar** | Isolerat beteende per lager — API avvisar ogiltiga värden, UI visar rätt fel | Hela flödet som en riktig användare ser det |
| **Vad det inte visar** | Integration mellan lagren (t.ex. att ett skapat ärende faktiskt visas i listan) | Enstaka lagers felorsak — svårare att debugga |
| **Arbetsinsats** | Snabbt att skriva och köra, CI-vänligt | Kräver körande app, långsammare, fler beroenden |
| **Passar när** | Många krav, snabb feedback, begränsad tid | Kritiska flöden som måste fungera end-to-end |

**Mitt val och konsekvens:** Jag valde enhetstester för alla 84 krav för att få snabb feedback och CI-integration. Playwright planerades (se `plan.md`) men implementerades inte. Konsekvensen är att integration mellan lager inte är automatiskt testad — det fångades istället av manuella tester i webbläsaren, t.ex. att redigeringsflödet sparar ett sammanhållet steg och inte fält-för-fält, och att dropdown-chevron låg rätt visuellt.

Belägget: [`plan.md`](../../plan.md) (Playwright planerat men ej implementerat), [`ci.yml`](../../.github/workflows/ci.yml) (enhetstester i CI), commit [`ab3a14aa`](https://github.com/misael86/kundportal-ai-native-development/commit/ab3a14aa) (201 tester), manuella testexempel ovan.

---

## VG 2: Kritisk granskning och anpassad kontroll — kravcheckerns räckvidd

Jag identifierade en risk med CI-kravkontrollen: ett krav-ID kan stå i en testtitel utan att testet faktiskt kontrollerar rätt beteende, och flera ID:n kan samlas i en titel utan att checken vet om testet täcker dem alla.

**Jag prövade om kontrollen fångar risken:** Jag bad Copilot tillfälligt ta bort `CI-REQ-COVERAGE-003` ur testtiteln och köra kontrollen.

| Steg | Kommando | Faktiskt resultat |
|---|---|---|
| Krav-ID borttaget ur testtiteln | `npm run check:requirements -- HEAD` | **Underkänt:** `CI-REQ-COVERAGE-003 has no matching test title` |
| Testtiteln återställd | `npm run check:requirements -- HEAD` | **Godkänt:** 84 krav har testtitlar |

**Vad jag anpassade:** Risken ledde till att jag ändrade min granskningspraxis — jag läste testinnehållet manuellt, inte bara CI-resultatet. Det syns konkret i beslut 25–26: när Copilot skapade ett test vars enda syfte var att kontrollera att ett fält *inte* finns, avvisade jag det. Testet passerade checken men bevisade inget om faktiskt beteende. Jag avvisade det för att jag hade läst det och förstod att det gav falskt förtroende.

**Kontrollens begränsning:** Checken visar att krav-ID:n finns i testtitlar — inte att testerna är korrekta, fullständiga eller att ett test med flera ID:n täcker dem alla. Det är en strukturell begränsning som kvarstår och som kräver mänsklig granskning.

Belägget: [`verification-plan.md`](./verification-plan.md) (risktestet dokumenterat), [`decision-log.md`](./decision-log.md) beslut 25–26, [`scripts/requirement-coverage.cjs`](../../scripts/requirement-coverage.cjs).

---

## VG 3: Belagd förbättring av arbetsprocessen — atomära krav

Jag förbättrade hur jag promptade Copilot att skriva krav. Tidigt accepterade jag krav som blandade happy path och error path under ett ID. Jag identifierade begränsningen och korrigerade det systematiskt (beslut 38 i beslutsloggen).

**Konkret exempel:**

| | Före | Efter |
|---|---|---|
| **Krav** | `CASE-DELETE-003: Lyckad radering / misslyckad radering` | `CASE-DELETE-003: Lyckad radering` + `CASE-DELETE-004: Misslyckad radering` |
| **Test** | Ett test som försöker testa två beteenden | Separata, fokuserade tester med ett sammanhållet syfte |
| **CI-nytta** | Svårt att veta vilket beteende som misslyckades | Checken och testnamnet pekar exakt på vilket beteende som bröt |

**Mätbar skillnad:** Krav-ID:n ökade från 29 (före PR #25) till 84 (efter). API-tester ökade från 77 till 106, webb från 69 till 95. Ökningen beror inte enbart på uppdelningen — branchen innehöll också nya features (redigera, radera) — men kravuppdelningen är den direkta orsaken till att *fler existerande beteenden fick egna, spårbara ID:n*.

**Begränsning:** Det var inte ett kontrollerat experiment med exakt samma uppgift i båda versionerna. Jag kan inte isolera effekten av uppdelningen från effekten av ny funktionalitet. Det jag kan säga är att varje uppdelat krav fick sitt eget testfall och att CI-checken nu ger ett tydligare felsignal.

Belägget: [`decision-log.md`](./decision-log.md) beslut 38, [jämförelsetabell i denna fil](#branchens-mätbara-krav--och-testförändring), ordagranna meddelanden i [`conversation-log.md`](./conversation-log.md).
