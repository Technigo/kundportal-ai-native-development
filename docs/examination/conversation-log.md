# Chattexcerpt och sessionsindex

Detta är en selektiv, källmärkt sammanställning av användarens beslut och relevanta prompts. Den är **inte** en fullständig export av chattloggar: tillgänglig sessionshistorik innehåller sammanfattningar för äldre arbete, och kompletta AI-svar, verktygsutskrifter och eventuella lokala loggfiler har inte kopierats hit. Se Copilot Chat-historiken för hela konversationer medan de finns tillgängliga.

Syftet är att göra beslut och verifierbara resultat begripliga i efterhand, inte att tillskriva AI-genererad kod eller teamresultat till en viss student. Sessions-ID:n nedan är källreferenser från Copilot-historiken.

## Sessioner och beständiga resultat

| Session | Innehåll | Beständigt resultat |
|---|---|---|
| `ahp-session:/05cc514c-d996-4086-a106-dff9ac589b88` | Projektstart, uppdelning i små steg, dokumentation av G/VG-evidens och beslut. | [Beslutslogg](./decision-log.md), tidigare commits och [examinationsunderlag](./README.md). |
| `ahp-session:/9354549c-04aa-4cda-aa4d-918dea8e6fb4` | Playwright-delsteg; användaren bad om 80 % CPU-parallellisering, PR-CI, små commits och draft-PR. | [PR #24](https://github.com/misael86/kundportal-ai-native-development/pull/24) med E2E-/CI-ändringar. |
| `ahp-session:/dd0d8f2f-4253-4474-b1c5-27499c3888c3` | Produkt- och UI-beslut för lista, detalj, skapa, redigera, radera, tillgänglighet och återanvändbara komponenter. | Feature-specifikationerna och [PR #25](https://github.com/misael86/kundportal-ai-native-development/pull/25). |
| `ahp-session:/d002ba82-8bee-4c42-b16d-972831fd3b7b` | CI för krav/testtäckning, funktionella krav, uppdelning av krav, knappjustering, commits/PR, sidavstånd och denna evidensbegäran. | [PR #25](https://github.com/misael86/kundportal-ai-native-development/pull/25), [beslutslogg](./decision-log.md) och [verifieringsplan](./verification-plan.md). |

## Användarens krav och beslut

### Produktflöden och felåterkoppling

- ”Förstasidan ska vara listan med alla uppdrag”, med möjlighet att skapa och redigera ärenden; en tom lista ska föreslå att skapa det första ärendet.
- Expanderad vy ska vara skrivskyddad; redigering ska aktiveras separat. Visa beskrivning i listkortet och detaljinformation i tabellform.
- Skapa och redigera ska validera och spara ändringar som en sammanhållen operation.
- Ta bort ska kräva bekräftelse med avbryt/radera; avbryt får initialt fokus.
- Begripliga fel ska visas nära berörda fält; internt tomt värde visas som ”-”.
- Ärendekort ska vara vänsterjusterade och relevanta kontroller gå att nå/använda med tangentbord.

### Krav och testning

- ”Varje krav” ska ha testtäckning och nya krav ska inte kunna läggas till utan nya tester; detta ledde till kravkontroll i PR-CI.
- Krav ska vara atomära: lyckade och misslyckade operationer ska inte blandas ihop i samma krav. Tester ska ha ett sammanhållet fokus.
- Kravtabeller ska inte ha en manuell ”Minst ett automatiserat test”-kolumn; kontrollen ska ske i automatiserad CI och via krav-ID:n i tester.
- ”Alla kraven ska vara funktionella krav”; estetiska krav och tester som bara testar estetik ska tas bort. Testerna ska prioritera användarens funktion och varför något misslyckas.
- CI-stegen ska ha användarvänliga namn.

### UI-ändringar och omfattning

- Användaren bad först om gemensamma komponenter för återkommande knappar och fält, men ändrade senare omfattning eftersom en kollega skulle hantera komponentiseringen. Komponenter som tillkommit i det arbetet skulle tas bort.
- Knappen ”Spara ändringar” ska följa sidans övriga knappar vad gäller padding och textstorlek; färgskillnad accepterades.
- Grå linjer efter sidtitlar skulle bort, med bibehållet avstånd till första kortet och samma avstånd i båda vyerna.
- Den sista gruppen av önskemål blev separata commits och en PR.

### Arbetssätt och testautomation

- För Playwright-arbetet bad användaren om parallell körning med 80 % av CPU-kärnorna och att tester körs i PR-pipelinen.
- Användaren bad om små, tydliga commits och en draft-PR för det delsteget.

## Tillgängliga ordagranna användarmeddelanden

Följande meddelanden är återgivna från tillgänglig sessionshistorik. De är användarens inlägg, inte fullständiga chatttranskript med AI-svar och verktygsutskrifter.

### Ärendevyer och produktbeteenden

Källa: `ahp-session:/dd0d8f2f-4253-4474-b1c5-27499c3888c3`.

1. ”Kan du hjälpa mig designa om sidan lite, vill att man ska ha en meny där man kan välja att lista alla ärenden, skapa nya och kunna editera en befintlig genom att visa en sidobar, eller vad tror du hade varit en bra design? Förstasidan ska vara listan med alla uppdrag, men om det inte finns några så ska den säga det och föreslå att man kan skapa sitt första ärende”
2. ”- "INTERNT VERKTYG" can be removed from everywhere.
- "Frontend och API är anslutna" this section can be removed
- "+ skapa ärende" button in the list can be removed
- Have a expand button close to the title that shows the entire information inside of the card
- Add an edit button that activates edit version of the card, all editable areas become input fields, a save button saves everything at once and validates before saving”
3. ”- titeln "Ärenden" behövs inte i ärendelistan då det redan finns en titel som heter "alla ärenden". 
- När man expanderar ett ärende så ska man inte kunna ändra något, det är bara. när man klickar på editera som man kan ändra. Interna anteckningar ska dock fortfarande kunna ses.
- Använd ett gratis ikonbibliotek för expandera knapparna, just nu ser det rätt fult ut, se till att de är centrerade.
- Sätt expandera knapparna innan rubriken, annars kommer de komma i olika ställen beroende på rubrikens längd
- Ha med beskrivning i den icke expanderade vyn, behövs för att få en snabb känsla för vad det är för ärende.
- Den expanderade vyn behöver inte visa den icke expanderade vyn också.
- Visa datat i den expanderade vyn som en tabell med två kolumner, namn på datat på vänster sida och den faktiskta informationen på höger sida, vänstra kolumnen är inte bredare än den bredaste texten, den högra tar upp resten av bredden.”
4. ”- Rubrik ska också finnas i den expanderade vyns tabell
- "skapa ärende" knappen i menyn ska ha samma stil som "redigera ärende" knappen
- Skapad tiden behöver inte visa sekunder, inte relevant
- När man klickar på redigera ärende så ska samma tabellvy visas, men värde kolumnen ska bli inputfält där det går att ändra, skapat fältet går inte att ändra t.ex.”
5. ”- "Alla ärenden" menyknappen är mörk när det är den sidan vi är på, det är som en aktiv stil, man vi göra samma för när "skapa ärende" knappen är den aktiva, samt ge "alla ärenden" knappen samma stil som "redigera ärende" när den inte är aktiv”
6. ”- När en intern anteckning inte hart något värde, visa bara ett "-", skriv inte "intern anteckning saknas" eller vad det nu står idag.
- Skapa ärende vyn ska se mer ut som listvyn, en hr som avdelar efter sidans beskrivning, Själva formuläret kan ligga inne i ett ljust "kort", precis som varje ärende i ärendevyn
- Jag kan inte navigera med tangentbordet till kundserviceportalens logga
- Kan du lägga till så att felmeddelanden skrivs ut under input fälten istället för att använda native”
7. ”- Bredden på kortet i "skapa ärende" vyn är perfekt, se till att korten för varje ärende i "alla ärenden" är lika stora, få dock båda vyerna att vänsteraligna korten, så att ögan följer en lingen när man läser uppifrån och ned
- Använd samma design när man focuserar med tangentbord på loggan som på en knapp, knappens stil är den rätta.”
8. ”Kan du testa att göra menyvalen så att de ser ut som flikar istället. alla har en bord som går ned i hr linjen, men den aktiva har ingen bord nedtill, så det ska se ut som en flik i en pärm eller en bok”
9. ”Fliken ska gärna ha samma borderfärg som hr, och inte ha rundade hörn nedtill, samt, den icke aktiva verkar få dubbel bord nedtill vilket vi också vill undvika”
10. ”Skapa ärende vyn kan också visas upp som en tabell, precis som redigera ärende vyn, så ser det mer enhetligt ut”
11. ”Kan du skapa gemensamma komponenter av de kodsnuttar som upprepas, verifiera med mig först om jag vill ha det du skapar som komponenter eller inte, men sånt som är säkert är knappar och olika typer av inputfält”
12. ”I redigera ärendevyn så vill jag även ha en knapp för att kunna ta bort ett ärende, när man klickar på den så får man upp en fråga om man är säker, där har man två val, att avbryta eller ta bort på riktigt.”
13. ”"ta bort ärende" knappen verkar inte se exakt likadan ut som de andra, kan du se till att alla knappar som används är den gemensamma knapp komponenten, och om det saknas styling så kan du lägga till det i den gemensamma istället, så som fylld alert eller bara alert med border och ingen fyllning. Kan du även se till att fokusera på "avbryt" knappen så "ta bort ärdende" frågan visas, på så vis säkerställer vi att användaren inte missar att frågan dök upp”
14. ”Ta bort ärende knappen ska vara till höger om spara ärende”

### Krav, CI och examinationsevidens

Källa: `ahp-session:/d002ba82-8bee-4c42-b16d-972831fd3b7b`.

1. ”Kan du lägga till ett CI steg per PR som ser till att alla krav har minst ett test, och att om nya krav har lagts till så finns det även nya test. Vet inte om vi redan idag har så att alla test körs per PR?”
2. ”alla spec filer, så som case-edit, ta bort "Minst ett automatiserat test" kolumnen, den är inte så relevant,”
3. ”Can you give the ci steps more user friendly names?”
4. ”Kan du kolla att kraven bara är krav på en sak, t.ex. CASE-DELETE-003 testar både ett lyckat delete anrop och ett misslyckat, borde vara två stycken. Kan du kolla igenom alla andra också och se att testerna finns för alla nya cases som separeras ut”
5. ”Super, jag kom på också att min kollega skulle fixa att allt blev till delade komponenter, så ta gärna bort de delade komponenter du skapade tidigare, men försök fixa att "spara ändringar" i editeringsvyn har samma padding och textstorlek som de andra knapparna på sidan, färg och så kan skilja sig, det gör inget”
6. ”spara ändringars styling skiljer sig fortfarande från resterande knappar”
7. ”jag vill att alla kraven ska vara funktionella krav, rent estetiska krav behöver vi inte ha några tester på, det viktigaste och det som vi måste testa är att användaren kan göra det vi tänkt oss att den ska kunna göra, samt veta varför den inte kan om ngt går fel. Så snälla ta bort de kraven som inte föklarar funktionen, ta även bart testerna som är kopplade till enbart de kraven.”
8. ”Ok, i think everything is working as expected, can you commit everything with relative commits, that make it easier to follow what we have done. Can you also create a PR of this branch?”
9. ”Kan du ta bort de grå linjerna efter titlarna i varje sida, behåll någon typ av distans mellan beskrivning och första kortet, se till så att båda sidor ser likadana ut”
10. ”Kan du spara ned alla mina beslut och chattloggar som gjorts, och egentligen spara ned allt som kan användas som en referens för varför jag uppnår de olika betygskraven”

### Playwright-delsteg

Källa: `ahp-session:/9354549c-04aa-4cda-aa4d-918dea8e6fb4`.

- ”Hej! Jag vill påbörja jobbet på delsteg 10 i en ny branch, kan du hjälpa mig? Jag vill gärna att du frågar ut mig på allt som känns osäkert, om ett svar väcker nya frågor så är det bara att fortsätta fråga tills alla osäkerheter är borta. Det jag vill är att skapa om många av de unit-tester vi har …” (sessionsutdraget är avkortat.)
- ”Kan du lägga till att defn ska använda 80% av mina cpu:er när den kör testerna parallelt? jag vill även att testerna ska köra i CI pipen vid pr”
- ”can du snälla commita i små tydliga bitar och skapa en pr i draft”

## Studentens egen reflektion

Följande är användarens egen uppgift om sitt arbete och sin granskning; den är inte oberoende verifierad. Namn anges inte.

> Jag gjorde 24 och 25 helt själv, min strategi är att se till att alla funktionella krav har tester, för att på så vis iaf kunna verifiera att användaren inte kommer att kunna göra allt den kunde tidigare efter mina ändringar. Alla implementationer testade jag manuellt och itererade igenom förändringarna fram tills att jag var nöjd. AI hade lite svårt att se helheten och kunde ibland göra endast lokala ändringar istället för att se att samma ändringar hade behövts på andra ställen, så det fick jag kontrollera. Den följde inte heller alltid hur jag hade tänkt mig att kraven skulle vara, både att den kunde ha två separata krav under samma titel, men också att den började lägga till visuella krav, vilket jag inte var intresserad av, ville bara ha funktionella.

Detta beskriver personligt ansvar, teststrategi och kritisk AI-granskning. För individuell inlämning bör studenten komplettera med ett konkret exempel på manuellt test (steg och resultat) och skilja det från de automatiserade kommandon som finns i [verifieringsplanen](./verification-plan.md).

## Källor och begränsningar

- De ordagranna utdragen bevarar tillgängliga användarmeddelanden för de två fullständiga sessionerna. Äldre projektstartsessioner och Playwright-sessionen är endast delvis tillgängliga i den hämtade historiken; avkortningar markeras med ellips.
- Samtalen visar vad som efterfrågades och hur teamets artefakter ändrades. De visar inte ensamma vem som granskade varje diff, vem som körde varje kontroll eller vad en student personligen lärde sig.
- Tidigare dokumenterade beslut från projektstarten finns i [beslutsloggen](./decision-log.md), och AI-arbetsflöde/testresultat i [AI-arbetsflödet](./ai-workflow.md) samt [verifieringsplanen](./verification-plan.md).
- Individuell evidens och reflektion ska färdigställas av studenten i Disco.
