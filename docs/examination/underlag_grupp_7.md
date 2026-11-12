# Underlag Grupp 7

## Process

Efter att ha kört igenom våra första sessioner bad vi dem skriva ned en logg av vad vi hade promptat om, och vilka beslut vi hade tagit. Se [beslutsloggen](./decision-log.md). Följande är en sammanfattning av den.

### Uppstart och första kodgrunden

Misael berättar retrospektivt att flera personer föll bort ur gruppen och att det till slut var han och Carter kvar. Det var svårt att få till ett första gemensamt möte. Misael tog därför initiativ till att sätta upp GitHub-projektet och började med Copilot skapa en första kodgrund. När de skulle arbeta vidare valde de att börja om från en gemensam bas, så att Carter också skulle förstå grunden och vara delaktig från start.

Git-historiken visar en första projektgrund i [commit `e7012eb6`](https://github.com/misael86/kundportal-ai-native-development/commit/e7012eb6ac80d5f76a0fc1c649aa38678b0f09a8). Den första MVP:n hann mergeas genom [PR #22](https://github.com/misael86/kundportal-ai-native-development/pull/22) den 2 november 2026 och sedan revertades i [commit `a386dbf4`](https://github.com/misael86/kundportal-ai-native-development/commit/a386dbf4e6f0e6133bd51fc8cdf3fd924b2c00db). Därför är det mer precist att säga att den första lösningen inte behölls som grund för fortsatt arbete än att den aldrig mergeades. Historiken belägger scaffold, merge och revert, men inte i sig gruppens skäl eller upplevelse av uppstarten.

- README:n på Misaels [planeringsbranch](https://github.com/misael86/kundportal-ai-native-development/blob/docs/project-plan-and-specs/README.md) beskriver fokuserade branches/commits, relevanta tester före PR, intern PR mot `main`, peer review och grön CI. Det belägger dokumenterade arbetssättskrav, inte att branch protection var tekniskt aktiverat.
- Misael uppger att han hade `gh` installerat lokalt och att AI:n kunde navigera i appen med webbläsare/Playwright för att kontrollera en implementation. Detta är en retrospektiv beskrivning av tillgängliga utvecklingsverktyg och interaktiv kontroll; det ska inte likställas med en körbar Playwright E2E-svit.

- Vi började hela arbetet med att dra igång en planneringsagent på gratisversionen av GitHub Copilot. Vi valde ingen modell, utan den tog den bäst lämpade som oftast blev GPT-6 Luna.
- Vi skrev kortfattat vad vi höll på med, att det är en uppgift för en kurs där vi är två personer i gruppen och vad vi ska bygga.
- Vi gav den lite info om oss, vad vi har för programmeringsvanor och bad den föreslå ramverk och arkitektur.
- Vi berättade att detta bara ska köras lokalt, så den behövde inte tänka på hosting.
- Vi sa åt den att dela koden vertikalt, så att varje feature skulle ha sin egen mapp, egna krav, egna tester etc. Dvs "lista ärenden" är en feature och "skapa ärende" är en annan.
- Vi berättade även från start att det skulle vara spec driven, vi ska gemensamt definera upp kraven och sedan ska testerna byggas utifrån det, varje krav måste ha minst ett test. Testerna skrivs först och implementationen sedan.
- Den första implementationen skulle endast vara skelettet för projektet, mapstrukturer, README, package.json etc.
- För att den AI genererade dokumentationen inte skulle bli för stor och svårläst bad vi den att vara så kortfattad som möjligt, inte lägga till onödiga ord och försöka skriva i punktlistor istället för långa paragrafer.
- Det enda kravet vi hade angående UIt var att den skulle följa en färgpalette som vi gav den, för att få sidan att ha en lite egen touch.
- Om det finns osäkerheter så bad vi AIn att inte ta egna beslut, utan istället fråga oss och alltid ge tre alternativ på lösningar.
- Sen bestämde vi för att den skulle försöka dela upp all implementation av MVPn, dvs grunden innan vi kunde börja på de individuella delarna, till så små vertikala features som möjligt. Resulterade i att vi fick features som "skapa ärende", "ta bort ärende", "visa ärendets detaljer", "editera ärende", "lägg till anteckningar på ärende", "lista alla ärenden" och "hantera ärendestatus".
- Varje feature skulle implementeras separat, först en grillning av kravspecen, sedan skriva testerna som refererade till kravspecen och sedan implementera, när implementationen var klar så använde den sig av playwright för att göra klick-tester likt en QA. Och sedan fick vi möjligheten att kolla igenom koden innan allt committades och vi påbörjade nästa steg.
- De två första featursen granskade vi koden lite noggrannare på och kollade att testerna var vettiga. När vi kände oss nöjda med hur allt implementerats så lät vi Copilot köra vidare med resterande features som vi testade manuellt bara men inte kollade koden på så noggrannt längre.
- Vi insåg att ett krav egentligen kunden bestå av flera delkrav, t.ex. kunde happy path och error path båda vara skrivna under ett och samma krav. Så för att vårt krav på att det skulle finnas ett test per specifierat krav skulle vara bra nog, så sa vi åt den att splittra alla krav i så små delar som möjligt, så att de bara beskrev en funktion åt gången, och att testerna bara fick testa ett krav åt gången.
- Vi hittade även att den skapade tester som inte riktigt gav något, t.ex. så hade vi sagt att interna anteckningar inte var ett fält som man kunde fylla i när man skapade ett ärende, utan bara från listvyn när man editerade ett ärende. Så då skapade copilot ett test som såg till att ett inputfält med en label där det stod något i stil med "anteckningar" inte fanns. Detta ansåg vi var ett dåligt test iom att vi inte kunde säkerhetsställa att det fanns en anteckningsinput med en annan label bara. Så vi sa åt den att inte skriva tester som testade att saker inte fanns.
- Carter minns att vi även diskuterade om vi skulle använda npm-paket för validering. Enligt hans minnesbild valde vi att hålla MVP:n enkel och skriva valideringen själva i stället för att lägga till ett särskilt valideringsbibliotek. Kodbasen stöder att valideringen är egen implementation i React/TypeScript och API:t; den visar däremot inte ensam att ett sådant beslutssamtal ägde rum.
- Carter minns också att vi bad Copilot fånga återanvändbara arbetssätt som instruktioner eller skills. Det vi kan belägga i repot är att gemensamma Copilot-instruktioner samt TDD- och UI-skills lades till i [commit `55d597fa`](https://github.com/misael86/kundportal-ai-native-development/commit/55d597fa). De hjälper till att bevara arbetssättet, men de bevisar inte den exakta prompten som ledde till att de skrevs.

## Webbläsare, Playwright och GitHub

I processbeskrivningen ovan står att Copilot använde Playwright för webbläsarklicktester efter implementation av features. Det är gruppens retrospektiva beskrivning av arbetssättet. Separat finns planeringen på grenen [`docs/project-plan-and-specs`](https://github.com/misael86/kundportal-ai-native-development/tree/docs/project-plan-and-specs): [projektplanen](https://github.com/misael86/kundportal-ai-native-development/blob/docs/project-plan-and-specs/docs/plan.md) föreslår Playwright för E2E och beskriver ett CI-flöde. Samma plan säger uttryckligen att CI-designen ännu inte var implementerad. Grenens `package.json` saknar Playwright-beroende och `test:e2e`-script. Det här belägger en plan, inte en körbar Playwright-svit eller utförda E2E-tester på den grenen.

Planeringsgrenen hör till [PR #21](https://github.com/misael86/kundportal-ai-native-development/pull/21), som stängdes utan merge den 4 november 2026. Den grenen blev alltså inte del av `main` genom PR #21. PR:en anger Misael som författare; committhistoriken har 17 commits, varav 15 med Misael som commitförfattare och två med Copilot. Misael uppger att han gjorde hela branchen själv med Copilot som stöd. Git-krediteringen visar kontona bakom commits, men inte exakt vilka prompts han skrev eller vad han personligen granskade.

I den aktuella VS Code-miljön kan assistenten interagera med en öppen webbläsarsida och använda `gh` för att läsa PR-information och ändringar. Webbläsarkontroll av appen förutsätter att appen är igång. Lokala filer kan ändras i arbetskopian; skrivning till GitHub, till exempel push, kräver behörighet och uttrycklig begäran. Dessa verktyg är miljöfunktioner, inte funktioner som automatiskt finns i själva portalen eller i varje assistentsession.

Instruktionerna på planeringsgrenen säger att skapa commits efter godkända kontroller och att inte pusha utan uttrycklig begäran. Det är instruktioner för arbetsflödet, inte belägg för att en GitHub-skrivning faktiskt gjordes.

## Framtida arbete

- Koden i sig följer inte standarden som vi skulle ha haft i ett projekt på jobbet. Vi har väldigt basal statehantering och route hantering.
- Om vi hade haft fler tokens så hade man kunna få koden mer förklarad under tiden man arbetar, t.ex. låta den skapa små commits som man själv behöver godkänna fram tills det att allt blivit utvecklat. Ger en större förståelse för den producerad koden, samt att man reviewar små bitar åt gången istället för en stor PR. Men tar längre tid att utvecka på detta sätt.

## Spårbar läsning för examination

Filerna nedan kompletterar detta gruppunderlag och gör beslut, implementation och verifiering lättare att följa. De visar gruppens artefakter; individuell insats behöver styrkas separat.

- [Examinationsöversikt](./README.md) — ingång till gruppens och individernas evidens.
- [Beslutslogg](./decision-log.md) — dokumenterade val och förtydliganden från projektsessionerna.
- [Chattexcerpt och sessionsindex](./conversation-log.md) — utvalda promptbeslut, med noteringar om vad historiken inte innehåller.
- [AI-arbetsflöde](./ai-workflow.md) — hur besluten kopplades till arbetsflöde och artefakter.
- [Verifieringsplan](./verification-plan.md) — faktiska kommandon, resultat och begränsningar.
- [Kriteriematris](./criteria-matrix.md) — status för G/VG och vad som ännu behöver beläggas.
 