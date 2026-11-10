Kundserviceportalen

Allmän kravspecifikation – funktioner och acceptanskriterier

Underlag: Examinationsuppgiften ”Bygg Kundserviceportalen med AI-stöd” och gruppens överenskomna lösning.

1. Syfte och omfattning

Det här dokumentet beskriver vad Kundserviceportalen ska kunna göra. Det är skrivet för att fungera som en enkel checklista när gruppen bygger och senare kontrollerar lösningen. Varje krav har ett ID och ett acceptanskriterium som beskriver hur man ser att kravet är uppfyllt.

Portalen är en enkel webbapplikation för att hantera kundärenden. Den har tre sidor: en startsida med ärendelista, ett formulär för att skapa eller redigera ärenden och en detaljsida för ett valt ärende. Gruppen har också valt sökning och filtrering som kompletterande funktion.

Avgränsning: Inga användarkonton eller inloggningar ingår. Produktionsdrift, molnlösning, avancerad autentisering och integration med e-post eller andra kommunikationskanaler krävs inte. Bara påhittade kunduppgifter används.

2. Funktionella krav

Funktionella krav beskriver vad handläggaren ska kunna göra och vad systemet ska visa, spara eller kontrollera.

2.1 Ärendets innehåll

| ID | Krav | Acceptanskriterium |
| --- | --- | --- |
| FR-01 | Varje ärende ska ha en rubrik och en beskrivning. | Rubrik och beskrivning kan anges och sparas för ett ärende. |
| FR-02 | Varje ärende ska ha en kategori och en prioritet. | Kategori och prioritet kan anges och sparas. Gruppen bestämmer vilka värden som ska användas. |
| FR-03 | Varje ärende ska ha kundens e-postadress. | En e-postadress kan anges och sparas som en del av ärendet. |
| FR-04 | Varje ärende ska ha en aktuell status. De tillåtna statusarna är: New, In progress, Waiting for customer och Closed. | Ett ärende har en av de fyra överenskomna statusarna. Statusen visas när ärendet öppnas. |
| FR-05 | Systemet ska spara när ett ärende skapades. | Ett nytt ärende får en skapandetidpunkt som sparas tillsammans med ärendet. |



2.2 Startsidan

| ID | Krav | Acceptanskriterium |
| --- | --- | --- |
| FR-06 | Startsidan ska visa en lista över alla sparade ärenden. | När startsidan öppnas visas de ärenden som finns i lagringen. |
| FR-07 | Startsidan ska ha knappen ”Create new case” (skapa nytt ärende). | När handläggaren väljer knappen öppnas formuläret för att skapa ett ärende. |
| FR-08 | Det ska gå att öppna ett ärende från listan. | När handläggaren väljer ett ärende öppnas detaljsidan för rätt ärende. |





2.3 Formuläret – skapa och redigera

| ID | Krav | Acceptanskriterium |
| --- | --- | --- |
| FR-09 | Samma formulärsida ska kunna användas för att skapa och redigera ärenden. | Formuläret kan öppnas både för ett nytt ärende och för ett redan sparat ärende. |
| FR-10 | Formuläret ska innehålla rubrik, beskrivning, kategori, prioritet, status och kundens e-postadress. | Alla sex fält finns på formulärsidan och kan användas när ärendet sparas. |
| FR-11 | Systemet ska kontrollera att de obligatoriska uppgifterna är ifyllda innan ett ärende sparas. | Det går inte att spara ett ärende med tomt obligatoriskt fält. |
| FR-12 | Användaren ska få ett begripligt meddelande om obligatorisk information saknas. | Vid försök att spara ett ofullständigt ärende visas ett meddelande som förklarar vad som behöver rättas. |
| FR-13 | Handläggaren ska kunna spara ett nytt ärende. | Ett korrekt ifyllt formulär skapar ett nytt ärende som därefter finns i listan. |
| FR-14 | Efter att ett nytt ärende har sparats ska användaren komma tillbaka till startsidan. | När ett nytt ärende sparas öppnas startsidan och det nya ärendet finns där. |
| FR-15 | Handläggaren ska kunna ändra uppgifter i ett befintligt ärende genom formuläret. | Befintliga uppgifter visas i redigeringsläget och ändringar kan sparas i samma ärende. |



2.4 Detaljsidan och status

| ID | Krav | Acceptanskriterium |
| --- | --- | --- |
| FR-16 | Detaljsidan ska visa uppgifterna för det valda ärendet. | Det går att se rubrik, beskrivning, kategori, prioritet, status, kundens e-postadress och skapandetidpunkt för rätt ärende. |
| FR-17 | Handläggaren ska kunna ändra status för ett befintligt ärende. | Status kan ändras till någon av de fyra tillåtna statusarna och ändringen sparas. |
| FR-18 | Det ska gå att redigera ett befintligt ärende via formulärsidan. | Handläggaren kan öppna formuläret för ett sparat ärende och sedan se de sparade ändringarna på detaljsidan. |



2.5 Ta bort ärenden

| ID | Krav | Acceptanskriterium |
| --- | --- | --- |
| FR-19 | Handläggaren ska kunna ta bort ett ärende. | Det går att ta bort ett tidigare sparat ärende. |
| FR-20 | Ett borttaget ärende ska inte längre finnas kvar bland sparade ärenden. | Ärendet försvinner från listan och är fortfarande borttaget efter att sidan eller applikationen öppnats på nytt. |



2.6 Sökning och filtrering

| ID | Krav | Acceptanskriterium |
| --- | --- | --- |
| FR-21 | Handläggaren ska kunna söka bland ärenden. | En sökning visar de ärenden som matchar sökvillkoret. Gruppen ska bestämma vilka uppgifter som går att söka i. |
| FR-22 | Handläggaren ska kunna filtrera ärendelistan. | Ett valt filter begränsar vilka ärenden som visas. Gruppen ska bestämma vilka filter som finns. |



2.7 Lagring och uppdatering

| ID | Krav | Acceptanskriterium |
| --- | --- | --- |
| FR-23 | Ärenden ska sparas i beständig lagring. | Skapade och ändrade ärenden finns kvar när webbsidan laddas om. |
| FR-24 | Sparade ärenden ska finnas kvar efter omstart av applikationen. | När applikationen startas på nytt går det fortfarande att visa tidigare sparade ärenden och deras aktuella uppgifter. |
| FR-25 | Listan och detaljsidan ska visa sparade ändringar. | När ett ärende har ändrats visas de uppdaterade uppgifterna när det öppnas igen. |



3. Övergripande krav från uppgiften

Dessa krav gäller den färdiga lösningen eller projektets leverans. De beskriver inte ytterligare funktioner i portalen.

| ID | Krav | Acceptanskriterium |
| --- | --- | --- |
| ÖK-01 | Lösningen ska vara en webbapplikation med tre sammanhängande sidor: startsida, formulär och detaljsida. | Det går att röra sig mellan sidorna enligt de flöden som beskrivs ovan. |
| ÖK-02 | Lösningen ska innehålla användargränssnitt, applikationslogik och beständig lagring. | De tre delarna fungerar tillsammans för att skapa, visa, ändra och ta bort ärenden. |
| ÖK-03 | Lösningen ska kunna köras lokalt och demonstreras av någon annan med hjälp av instruktioner. | En person som följer instruktionerna kan starta och använda applikationen. |
| ÖK-04 | Endast påhittade kunduppgifter ska användas vid utveckling, test och demonstration. | Inga riktiga kunduppgifter behövs för att visa eller testa funktionerna. |
| ÖK-05 | Centrala funktioner ska kontrolleras med automatiserade tester. | Det finns automatiserade tester i projektet för både fungerande och felaktiga användningsfall samt relevanta gränsfall. |
| ÖK-06 | Utvecklingsarbetet ska använda AI som stöd, och gruppen ska kunna förklara sina val och hur resultatet kontrollerats. | Gruppen kan visa hur AI använts och vilka egna beslut och kontroller som genomförts. Produkten behöver inte innehålla AI. |
| ÖK-07 | Lösningen ska kunna granskas utan ett personligt betalkonto. | En granskare behöver inget eget betalkonto för att kunna köra och bedöma lösningen. |

