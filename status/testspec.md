Kundserviceportalen

Test- och verifieringsspecifikation

Dokument 2 av 2  |  Kopplat till kravspecifikationen för Kundserviceportalen (FR-01–FR-25 och ÖK-01–ÖK-07).

1. Syfte

Det här dokumentet beskriver vilka funktioner som ska kontrolleras, hur vi testar dem och vad som räknas som godkänt. Varje test har ett test-ID och en koppling till ett eller flera krav i dokument 1.

Examinationsuppgiften kräver automatiserade tester som kontrollerar centrala funktioner, både när allt fungerar (happy path) och när något är fel (error path). Även relevanta gränsfall ska testas. Detta dokument är en plan och checklista – automatiserade tester måste också skrivas som kod i projektet.

2. Så använder vi testfallen

A = föreslås automatiseras i testkod. M = kontrolleras manuellt. Det är en rekommenderad fördelning, inte ett krav på ett visst testverktyg. Testerna kan genomföras mot de delar av applikationen där beteendet enklast kan verifieras.

Happy path: vi gör något korrekt och kontrollerar att det fungerar.

Error path: vi skickar in felaktiga eller ofullständiga uppgifter och kontrollerar att felet hanteras.

Gränsfall: vi testar en särskild situation, till exempel en tom ärendelista eller en sökning utan träffar.

Förberedelse: använd endast påhittade ärenden och se till att varje test startar med rätt testdata. Testerna ska kunna köras om utan att äldre testdata påverkar resultatet.

Testdata: Exempelvis ”Problem med beställning”, en påhittad beskrivning och kund@example.com. För kategori och prioritet används de värden som gruppen beslutar. Inga riktiga kunduppgifter behövs.

3. Testfall – funktion för funktion

Följande testfall är förslag som täcker kraven i dokument 1. När ett krav är implementerat ska motsvarande test kunna köras. Exakta testvärden och tekniskt utförande anpassas efter gruppens lösning.

3.1 Ärendets fält och uppgifter

| Test | Typ | Krav-ID | Så testar vi | Godkänt när |
| --- | --- | --- | --- | --- |
| TV-01 | A | FR-01–04, FR-10, FR-13 | Skapa ett ärende med rubrik, beskrivning, en giltig kategori och prioritet, kundens e-postadress och en tillåten status. | Ärendet sparas och samtliga angivna fält har rätt värden. |
| TV-02 | A | FR-05 | Skapa ett nytt ärende och läs dess skapandetidpunkt från den sparade posten. | Skapandetidpunkten finns och sparas med ärendet. |
| TV-03 | A | FR-04 | Kontrollera de fyra tillåtna statusvärdena: New, In progress, Waiting for customer och Closed. | Varje tillåtet statusvärde kan sparas och visas korrekt. |

3.2 Startsida och navigering

| Test | Typ | Krav-ID | Så testar vi | Godkänt när |
| --- | --- | --- | --- | --- |
| TV-04 | A | FR-06 | Öppna startsidan när det inte finns några ärenden. | Sidan fungerar och visar ingen påhittad ärendepost. Inget fel inträffar. |
| TV-05 | A | FR-06 | Skapa två olika ärenden och öppna startsidan. | Båda ärendena finns med i listan. |
| TV-06 | A | FR-07 | Välj knappen ”Create new case” på startsidan. | Formuläret för ett nytt ärende öppnas. |
| TV-07 | A | FR-08, FR-16 | Öppna ett visst ärende i listan när minst två finns. | Detaljsidan för just det valda ärendet visas. |
| TV-08 | A | FR-13, FR-14 | Fyll i formuläret korrekt och spara ett nytt ärende. | Det nya ärendet lagras, startsidan öppnas och ärendet finns i listan. |

3.3 Formulär, validering och redigering

| Test | Typ | Krav-ID | Så testar vi | Godkänt när |
| --- | --- | --- | --- | --- |
| TV-09 | A | FR-09, FR-10 | Öppna formuläret både för att skapa ett nytt ärende och för att redigera ett sparat. | Samma formulärsida fungerar i båda lägena och visar de sex överenskomna fälten. |
| TV-10 | A | FR-11, FR-12 | Försök spara med ett obligatoriskt fält tomt. Upprepa för de fält som gruppen beslutat är obligatoriska. | Ärendet sparas inte som giltigt och ett begripligt meddelande visar vad som behöver rättas. |
| TV-11 | A | FR-12 | Ta fram ett felaktigt formulär med saknad obligatorisk uppgift och försök spara. | Ett begripligt felmeddelande visas för användaren. |
| TV-12 | A | FR-09, FR-15 | Öppna ett redan sparat ärende i redigeringsläget. | De nuvarande uppgifterna visas i formulärets fält. |
| TV-13 | A | FR-15, FR-18, FR-25 | Ändra exempelvis rubrik och beskrivning för ett befintligt ärende och spara. | Det befintliga ärendet innehåller de nya uppgifterna när det öppnas igen. |

3.4 Detaljsida och status

| Test | Typ | Krav-ID | Så testar vi | Godkänt när |
| --- | --- | --- | --- | --- |
| TV-14 | A | FR-16 | Öppna detaljsidan för ett sparat ärende. | Rubrik, beskrivning, kategori, prioritet, status, kundens e-postadress och skapandetidpunkt visas för rätt ärende. |
| TV-15 | A | FR-17, FR-25 | Ändra ett ärendes status till ett annat tillåtet värde och öppna ärendet igen. | Den ändrade statusen är sparad och visas. |
| TV-16 | A | FR-04, FR-17 | Försök ange ett statusvärde som inte tillhör de fyra tillåtna (via den kodnivå som tar emot och sparar ärendet). | Det otillåtna värdet sparas inte som ärendestatus. |
| TV-17 | A | FR-18 | Öppna ett befintligt ärende på detaljsidan, gå vidare till redigering och spara en ändring. | Ändringen går att se när ärendets detaljer visas igen. |

3.5 Ta bort ärenden

| Test | Typ | Krav-ID | Så testar vi | Godkänt när |
| --- | --- | --- | --- | --- |
| TV-18 | A | FR-19, FR-20 | Skapa ett testärende, ta bort det och öppna ärendelistan. | Ärendet kan tas bort och visas därefter inte längre i listan. |
| TV-19 | A | FR-20 | Ta bort ett ärende, ladda om sidan och starta därefter om applikationen. | Ärendet kommer inte tillbaka efter omladdning eller omstart. |

3.6 Sökning och filtrering

| Test | Typ | Krav-ID | Så testar vi | Godkänt när |
| --- | --- | --- | --- | --- |
| TV-20 | A | FR-21 | Skapa ärenden där endast ett matchar ett sökord i ett av de sökbara fält som gruppen valt. Sök efter ordet. | Det matchande ärendet visas enligt gruppens sökregler. |
| TV-21 | A | FR-21 | Sök efter ett värde som inget sparat ärende matchar. | Inga ärenden visas som träffar och sökningen orsakar inget fel. |
| TV-22 | A | FR-22 | Skapa ärenden med olika värden i det fält gruppen valt för filtrering. Välj ett filter. | Endast de ärenden som uppfyller filtervillkoret visas. |

3.7 Lagring och uppdateringar

| Test | Typ | Krav-ID | Så testar vi | Godkänt när |
| --- | --- | --- | --- | --- |
| TV-23 | A | FR-23 | Skapa ett ärende och ladda om webbsidan. | Ärendet kan fortfarande hämtas och visas. |
| TV-24 | A | FR-24 | Skapa ett ärende, stoppa applikationen och starta den igen med samma beständiga lagring. | Ärendet finns kvar med sina sparade uppgifter. |
| TV-25 | A | FR-23–25 | Ändra uppgifterna i ett ärende, ladda om sidan och öppna ärendet igen. | De uppdaterade uppgifterna finns kvar både i listan (där de visas) och på detaljsidan. |
| TV-26 | A | FR-17, FR-24, FR-25 | Ändra status på ett ärende och starta om applikationen. | Den senaste sparade statusen finns kvar. |

3.8 Körbar lösning och projektets leverans

| Test | Typ | Krav-ID | Så testar vi | Godkänt när |
| --- | --- | --- | --- | --- |
| TV-27 | M | ÖK-01, ÖK-02 | Följ ett helt flöde: startsida → skapa ärende → lista → detaljsida → redigera → statusändring → ta bort. | De tre sidorna fungerar tillsammans med applikationslogik och lagring. |
| TV-28 | M | ÖK-03, ÖK-07 | Låt en person som inte byggt lösningen följa instruktionerna för att starta och använda den lokalt. | Personen kan köra och demonstrera portalen utan personligt betalkonto. |
| TV-29 | M | ÖK-04 | Gå igenom testdata och demonstrationsärenden. | Endast påhittade kunduppgifter används. |
| TV-30 | M | ÖK-05, ÖK-06 | Granska att automatiska tester finns i projektet och körs. Kontrollera att gruppen kan visa sitt AI-arbete, egna beslut och hur resultaten har granskats. | Det finns körbara tester med lyckade fall, relevanta felfall och gränsfall. Gruppen kan beskriva och visa sina AI-stödda arbetssätt. |

4. Kompletterande tester efter gruppens beslut

Följande tester blir aktuella om gruppen väljer motsvarande regel eller funktion. De är inte nya obligatoriska krav i examinationsuppgiften.

E-postformat: Om gruppen bestämmer att e-postadressen ska följa ett visst format: försök spara en ogiltig adress och kontrollera att den hanteras enligt regeln.

Ytterligare tidsstämpel: Om gruppen sparar tidpunkt för senaste ändring: uppdatera ett ärende och kontrollera att tidsstämpeln ändras enligt den valda modellen.

Sökning och filter tillsammans: Om det ska gå att använda sökning och filtrering samtidigt: kontrollera att resultatet följer båda villkoren.

Fler valideringsgränser: Om gruppen bestämmer exempelvis maximal textlängd eller hantering av enbart blanksteg: testa gränsvärdet och ett ogiltigt värde.

5. Enkel checklista vid verifiering

För varje test registrerar gruppen resultatet när det faktiskt har körts. Dokumentet påstår inte att testerna redan är genomförda.

Använd gärna följande rad i en testlogg eller i projektets ärendehantering:

| Test-ID | Resultat | Datum / version | Kommentar eller länk till testkörning |
| --- | --- | --- | --- |
| TV-__ | Ej körd / Godkänd / Underkänd | ________________ | ________________________________ |



Ett test är godkänt när det faktiska resultatet stämmer med kolumnen ”Godkänt när”. Om testet inte går igenom behöver felet rättas och testet köras på nytt. De automatiserade testerna ska kunna köras igen efter ändringar för att upptäcka om något som tidigare fungerade har slutat fungera.