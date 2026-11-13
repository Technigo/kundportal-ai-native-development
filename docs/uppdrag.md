> Kursens uppgiftsbeskrivning för examinationsuppgiften, ordagrant. Ändra inte texten. Våra tolkningar och beslut står i [specs/kravspec.md](specs/kravspec.md). Avsnittet "Från kursens övningsmaterial" längst ner är ett tillägg och ingår inte i uppgiftsbeskrivningen.

# **Bygg Kundserviceportalen med AI-stöd**

**Examinationsuppgift · Grupparbete med individuellt bidrag · Vecka 5-8**

I det här projektet använder ni kursens arbetssätt för att utveckla en mindre kundserviceportal. Ni går från att förstå och avgränsa ett behov till att specificera, bygga, testa och vidareutveckla en fungerande lösning med AI-stöd.

Målet är att ni ska kunna använda AI som en genomtänkt del av utvecklingsarbetet. Ni behöver kunna förklara vad ni har byggt, hur ni har styrt AI, vilka beslut ni själva har fattat och hur ni har kontrollerat resultatet.

När projektet är klart ska ni ha en körbar lösning och ett underlag som visar vägen från krav till verifierade förändringar.

# **Uppdraget**

Ett företag tar emot kundärenden genom flera kanaler. Informationen hamnar på olika platser och handläggarna har svårt att få en gemensam överblick.

Ni ska bygga **Kundserviceportalen**, där en handläggare kan registrera ett ärende, se vad det gäller och följa det genom ett enkelt arbetsflöde.

Gruppen väljer språk, ramverk, databas och klientplattform utifrån sin kompetens. Lösningen ska innehålla ett användargränssnitt, applikations- eller backendlogik och beständig lagring. Delarna kan finnas i samma applikation eller vara uppdelade.

### **Det här ska lösningen kunna göra**

- Registrera ett nytt kundärende och validera obligatorisk information.
- Spara ärenden så att de finns kvar när applikationen startas om.
- Visa en lista över ärenden och detaljer för ett valt ärende.
- Ändra status på ett ärende.
- Hantera minst ett felaktigt användningsfall med ett begripligt besked till användaren.
- Verifiera centrala beteenden med automatiserade tester som omfattar både happy paths och relevanta error paths.
- Kunna köras och demonstreras av någon annan med hjälp av era instruktioner.

Ett ärende ska innehålla rubrik, beskrivning, kategori, prioritet, aktuell status och tidpunkt då det skapades. Statusar kan exempelvis vara **Nytt**, **Pågående**, **Väntar på kund** och **Avslutat**. Ni kan anpassa den exakta modellen om ni dokumenterar och motiverar era val.

Välj också minst en kompletterande funktion, exempelvis interna anteckningar, tilldelning till handläggare, sökning och filtrering eller ärendehistorik. Ni kan föreslå en annan relevant funktion. Specificera och avgränsa den innan ni börjar implementera.

### **Håll uppgiften avgränsad**

Använd bara påhittade kunduppgifter. En lokal, körbar lösning räcker. Produktionsdrift, molninfrastruktur, avancerad autentisering och integrationer med e-post eller andra kanaler ingår inte i kraven.

AI används som stöd i utvecklingsarbetet. Det behöver inte finnas en AI-funktion i produkten. Lösningen ska kunna bedömas utan att den som granskar behöver ett personligt betalkonto.

# **Tester och verifiering**

Ni väljer vilka konkreta beteenden och testfall ni testar utifrån er specifikation och de risker ni ser. De automatiserade testerna ska verifiera lösningens centrala beteenden mot era acceptanskriterier. De ska omfatta både **happy paths**, där användningen lyckas som förväntat, och relevanta **error paths**, där felaktiga uppgifter eller misslyckade operationer hanteras. Välj också relevanta gränsfall utifrån era regler.

Exempel på möjliga kontroller:

| Typ | Exempel |
| --- | --- |
| Happy paths | Ett giltigt ärende skapas med rätt uppgifter, eller en statusändring finns kvar när lagringen öppnas på nytt. |
| Error paths | Saknad obligatorisk information avvisas utan att ett ärende sparas, eller en ogiltig status avvisas utan att den tidigare statusen ändras. |
| Gränsfall | Text med enbart mellanslag hanteras enligt er regel för obligatoriskt innehåll, eller inmatning vid och över en dokumenterad längdgräns hanteras korrekt. |
| Kompletterande funktion | Om ni valt interna anteckningar kan ni kontrollera att anteckningen kopplas till rätt ärende och att en tom anteckning hanteras enligt specifikationen. |

Exemplen är stöd för ert urval, inte en obligatorisk testlista. Motivera varför era val ger relevant verifiering av lösningens centrala beteenden.

Dokumentera kort i er verifieringsplan på GitHub:

- **Vilka tester som finns:** länka till testerna och ange beteende, acceptanskriterium och förväntat resultat. Visa vilka happy paths, error paths och gränsfall som ingår.
- **Hur och varför:** beskriv vald testnivå och varför ni valt både dessa testfall och sättet att testa.
- **Resultat och begränsningar:** visa faktiska körresultat och vad kontrollerna inte visar. Skilj automatiserade tester från manuella kontroller och planerade kontroller från genomförda.

Närliggande tester kan beskrivas tillsammans. Dokumentera hur testerna körs så att vi kan upprepa dem. Ni väljer verktyg och testnivå; automatiserade tester genom hela gränssnittet krävs inte. Manuella kontroller kan komplettera, exempelvis för att bedöma om felmeddelanden är begripliga.

Happy paths och error paths ingår redan för G. Antal tester och täckningsprocent avgör inte betygsnivån. Varje student ska kunna visa och förklara verifieringen av sitt eget bidrag.

# **Kursexaminationens veckosektioner**

Uppgiften introduceras vecka 4 och projektarbetet genomförs vecka 5-8. Ni får börja frivilligt redan vecka 4. Den fristående kodövningen finns kvar.

Veckorna beskriver vad vi förväntar oss att ni ska ha klart vid respektive veckas slut. Ni får gärna ligga före och gå vidare med kommande delar när ni är redo. Har ni hunnit längre är det bara positivt! Fortsätt att dokumentera och kontrollera det ni gör, så att vi kan följa arbetet.

Arbetet utvecklas tillsammans med veckornas undervisning. Ni behöver inte kunna alla metoder när ni börjar. Agentarbete och gemensamma AI-arbetsflöden introduceras under projektperioden. Projektstarten vecka 5 förutsätter inte att ni har börjat tidigare.

Arbeta löpande med både lösningen och dokumentationen. Använd GitHub för att planera uppgifter, följa förändringar och granska varandras bidrag. Gör ansvar, frågor och nästa steg tydliga så att arbetet kan fortsätta även när ni arbetar vid olika tider.

Varje team använder en egen fork och samma löpande PR till kursens gemensamma GitHub-repository. Startinstruktionerna finns på undersidan för vecka 5.

---

# Från kursens övningsmaterial

Det här ingår inte i uppgiftsbeskrivningen ovan. Citaten är ordagranna.

Övningen "Skriv specifikation v1" anger i sin specstruktur:

> **Kvalitetskrav**
>
> Minst ett kontrollerbart icke-funktionellt krav, märkt som ditt eget övningsförslag. Ange hur det kan kontrolleras.

"Starterkit: Börja skriva en specifikation" säger:

> Kvalitetskrav kan beskrivas separat när de behövs.
