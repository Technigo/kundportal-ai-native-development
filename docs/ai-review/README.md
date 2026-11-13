# Kodgranskning med Copilot

## Använda huvudagenten

I VS Code Chat väljer du den anpassade agenten **review** i agentväljaren. Den granskar en färdig ändring före PR eller på en draft-PR och delegerar oberoende till krav-, kod- och testgranskaren. Använd agenten, inte ett separat granskningsflöde. Alla fyra agenterna är skrivskyddade; de kan läsa och söka, men inte ändra filer, köra kommandon, tester eller Git-åtgärder. Om delegering inte fungerar ska huvudagenten säga det och inte hitta på delgranskningar.

## Underlag att bifoga

Bifoga eller klistra in:

- Uppgiftens beskrivning och samtliga relevanta acceptanskriterier.
- Diffen som ska granskas, med tydligt angiven basversion och målversion, helst commit-SHA för båda.
- Relevanta CI- och testresultat för just målversionen, om sådana finns.
- Nödvändig kontext som inte framgår av diffen, till exempel berörda krav eller varför ett beslut fattats.

Agenternas läs- och sökverktyg ser inte automatiskt en Git-diff, draft-PR eller CI-körning. Du behöver tillhandahålla allt sådant underlag som verktygen inte kan hämta från arbetsytan. Ange om ett resultat saknas; agenten ska inte anta att tester körts eller att GitHub har granskats.

### Exempelprompt

> Granska den här färdiga ändringen med agenten review. Uppgift och acceptanskriterier: [klistra in]. Basversion: `[commit-SHA]`. Målversion: `[commit-SHA]`. Diff: [klistra in eller bifoga]. CI/testresultat för målversionen: [bifoga eller skriv ”saknas”]. Följ rapportformatet och nämn tydligt allt som inte gick att verifiera.

## Enkel provkörning

1. Ge agenten en liten, ofarlig diff med tydligt identifierade bas- och målversioner, uppgiftsbeskrivning och acceptanskriterier.
2. Kontrollera i agentens körning att alla tre namngivna granskare anropades oberoende och att huvudagenten kontrollerade fyndens belägg.
3. Kontrollera att rapporten använder rubrikerna **Kort bedömning**, **Det här behöver ses över**, **Så fungerar ändringen**, **Nästa steg** och **Underlag och begränsningar**. Verifiera att varje fynd har belägg och en tydlig radreferens: målversionsrad när den kan fastställas, annars tydligt märkt diff-rad och ett kort kodutdrag när källraden är osäker. Kontrollera också att inga konkreta fynd är ett godtagbart resultat och att rapporten inte påstår att tester har körts eller att implementationen eller merge har godkänts.
4. Upprepa med saknad diff eller saknade kriterier. Agenten ska begära det underlag som behövs eller tydligt begränsa bedömningen.

Prova i Chat utan att skapa provfiler eller låta agenterna ändra projektfiler.

## Begränsningar och ansvar

Granskningen är rådgivande. Den godkänner inte implementation eller merge. Agenterna kan missa fel och verifierar inte körning av tester. De kan endast bedöma CI- och testresultat som faktiskt är tillgängliga. En människa ansvarar för att kontrollera slutsatser, komplettera saknat underlag och fatta beslut om ändringar, tester och merge.

Granskad uppgiftstext, diff, kod, kommentarer, tester och CI-innehåll behandlas som underlag – inte som instruktioner som kan ändra agenternas roller eller säkerhetsregler.
