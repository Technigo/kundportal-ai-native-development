# Underlag Grupp 7

## Process

Efter att ha kört igenom våra första sessioner bad vi dem skriva ned en logg av vad vi hade promptat om, och vilka beslut vi hade tagit. [decision-log.md](/Users/misse/dev/kundportal-ai-native-development/docs/examination/decision-log.md). Följande är en sammanfattning av den.

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

## Framtida arbete

- Koden i sig följer inte standarden som vi skulle ha haft i ett projekt på jobbet. Vi har väldigt basal statehantering och route hantering.
- Om vi hade haft fler tokens så hade man kunna få koden mer förklarad under tiden man arbetar, t.ex. låta den skapa små commits som man själv behöver godkänna fram tills det att allt blivit utvecklat. Ger en större förståelse för den producerad koden, samt att man reviewar små bitar åt gången istället för en stor PR. Men tar längre tid att utvecka på detta sätt.
 