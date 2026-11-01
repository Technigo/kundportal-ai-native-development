Bygg Kundserviceportalen med AI-stöd
Examinationsuppgift · Grupparbete med individuellt bidrag · Vecka 5-8

I det här projektet använder ni kursens arbetssätt för att utveckla en mindre kundserviceportal. Ni går från att förstå och avgränsa ett behov till att specificera, bygga, testa och vidareutveckla en fungerande lösning med AI-stöd.

Målet är att ni ska kunna använda AI som en genomtänkt del av utvecklingsarbetet. Ni behöver kunna förklara vad ni har byggt, hur ni har styrt AI, vilka beslut ni själva har fattat och hur ni har kontrollerat resultatet.

När projektet är klart ska ni ha en körbar lösning och ett underlag som visar vägen från krav till verifierade förändringar.

Uppdraget
Ett företag tar emot kundärenden genom flera kanaler. Informationen hamnar på olika platser och handläggarna har svårt att få en gemensam överblick.

Ni ska bygga Kundserviceportalen, där en handläggare kan registrera ett ärende, se vad det gäller och följa det genom ett enkelt arbetsflöde.

Gruppen väljer språk, ramverk, databas och klientplattform utifrån sin kompetens. Lösningen ska innehålla ett användargränssnitt, applikations- eller backendlogik och beständig lagring. Delarna kan finnas i samma applikation eller vara uppdelade.

Det här ska lösningen kunna göra
Registrera ett nytt kundärende och validera obligatorisk information.
Spara ärenden så att de finns kvar när applikationen startas om.
Visa en lista över ärenden och detaljer för ett valt ärende.
Ändra status på ett ärende.
Hantera minst ett felaktigt användningsfall med ett begripligt besked till användaren.
Verifiera centrala beteenden med automatiserade tester som omfattar både happy paths och relevanta error paths.
Kunna köras och demonstreras av någon annan med hjälp av era instruktioner.
Ett ärende ska innehålla rubrik, beskrivning, kategori, prioritet, aktuell status och tidpunkt då det skapades. Statusar kan exempelvis vara Nytt, Pågående, Väntar på kund och Avslutat. Ni kan anpassa den exakta modellen om ni dokumenterar och motiverar era val.

Välj också minst en kompletterande funktion, exempelvis interna anteckningar, tilldelning till handläggare, sökning och filtrering eller ärendehistorik. Ni kan föreslå en annan relevant funktion. Specificera och avgränsa den innan ni börjar implementera.

Håll uppgiften avgränsad
Använd bara påhittade kunduppgifter. En lokal, körbar lösning räcker. Produktionsdrift, molninfrastruktur, avancerad autentisering och integrationer med e-post eller andra kanaler ingår inte i kraven.

AI används som stöd i utvecklingsarbetet. Det behöver inte finnas en AI-funktion i produkten. Lösningen ska kunna bedömas utan att den som granskar behöver ett personligt betalkonto.

Tester och verifiering
Ni väljer vilka konkreta beteenden och testfall ni testar utifrån er specifikation och de risker ni ser. De automatiserade testerna ska verifiera lösningens centrala beteenden mot era acceptanskriterier. De ska omfatta både happy paths, där användningen lyckas som förväntat, och relevanta error paths, där felaktiga uppgifter eller misslyckade operationer hanteras. Välj också relevanta gränsfall utifrån era regler.

Exempel på möjliga kontroller:

Typ

Exempel

Happy paths

Ett giltigt ärende skapas med rätt uppgifter, eller en statusändring finns kvar när lagringen öppnas på nytt.

Error paths

Saknad obligatorisk information avvisas utan att ett ärende sparas, eller en ogiltig status avvisas utan att den tidigare statusen ändras.

Gränsfall

Text med enbart mellanslag hanteras enligt er regel för obligatoriskt innehåll, eller inmatning vid och över en dokumenterad längdgräns hanteras korrekt.

Kompletterande funktion

Om ni valt interna anteckningar kan ni kontrollera att anteckningen kopplas till rätt ärende och att en tom anteckning hanteras enligt specifikationen.

Exemplen är stöd för ert urval, inte en obligatorisk testlista. Motivera varför era val ger relevant verifiering av lösningens centrala beteenden.

Dokumentera kort i er verifieringsplan på GitHub:

Vilka tester som finns: länka till testerna och ange beteende, acceptanskriterium och förväntat resultat. Visa vilka happy paths, error paths och gränsfall som ingår.
Hur och varför: beskriv vald testnivå och varför ni valt både dessa testfall och sättet att testa.
Resultat och begränsningar: visa faktiska körresultat och vad kontrollerna inte visar. Skilj automatiserade tester från manuella kontroller och planerade kontroller från genomförda.
Närliggande tester kan beskrivas tillsammans. Dokumentera hur testerna körs så att vi kan upprepa dem. Ni väljer verktyg och testnivå; automatiserade tester genom hela gränssnittet krävs inte. Manuella kontroller kan komplettera, exempelvis för att bedöma om felmeddelanden är begripliga.

Happy paths och error paths ingår redan för G. Antal tester och täckningsprocent avgör inte betygsnivån. Varje student ska kunna visa och förklara verifieringen av sitt eget bidrag.

Kursexaminationens veckosektioner
Uppgiften introduceras vecka 4 och projektarbetet genomförs vecka 5-8. Ni får börja frivilligt redan vecka 4. Den fristående kodövningen finns kvar.

Veckorna beskriver vad vi förväntar oss att ni ska ha klart vid respektive veckas slut. Ni får gärna ligga före och gå vidare med kommande delar när ni är redo. Har ni hunnit längre är det bara positivt! Fortsätt att dokumentera och kontrollera det ni gör, så att vi kan följa arbetet.

Arbetet utvecklas tillsammans med veckornas undervisning. Ni behöver inte kunna alla metoder när ni börjar. Agentarbete och gemensamma AI-arbetsflöden introduceras under projektperioden. Projektstarten vecka 5 förutsätter inte att ni har börjat tidigare.

Arbeta löpande med både lösningen och dokumentationen. Använd GitHub för att planera uppgifter, följa förändringar och granska varandras bidrag. Gör ansvar, frågor och nästa steg tydliga så att arbetet kan fortsätta även när ni arbetar vid olika tider.

Varje team använder en egen fork och samma löpande PR till kursens gemensamma GitHub-repository. Startinstruktionerna finns på undersidan för vecka 5.

Ditt individuella bidrag
Du ansvarar för ett eget, spårbart tekniskt utvecklingsmoment i gruppens lösning. Det innebär att du ska:

formulera eller förbättra uppgiftens specifikation och acceptanskriterier
ge AI relevant kontext och leda minst ett avgränsat moment med en AI-agent
bidra med kod, tester, automation eller annan teknisk implementation
granska AI:s förslag, korrigera där det behövs och verifiera ditt resultat
granska minst en klasskamrats förändring i gruppen
bidra till teamets gemensamma AI-arbetssätt och själv använda AI för ett återkommande eller automatiserat utvecklingsmoment
kunna förklara dina beslut och hur ditt bidrag passar in i helheten
Gruppen bygger fullstacklösningen tillsammans. Du behöver inte själv implementera alla lager, men du behöver förstå hur ditt bidrag fungerar tillsammans med övriga delar.

Betygskriterier
Vi sätter ett individuellt betyg utifrån ditt spårbara arbete, dina förklaringar och genomförda kontroller. Teamets lösning ger sammanhanget för bedömningen. En fungerande gruppleverans visar inte ensam vad varje student kan.

G: samtliga G-kriterier nedan är uppfyllda.
VG: samtliga G-kriterier och alla tre fördjupningskriterier är uppfyllda.
IG: ett eller flera G-kriterier är inte uppfyllda när bedömningen avslutas.
Ett saknat kriterium kan inte kompenseras av en starkare prestation inom ett annat. Om G är uppfyllt men någon VG-fördjupning saknas blir betyget G. Teknikval, antal funktioner, commits, tester eller täckningsprocent ger inte i sig ett högre betyg.

För G ska du visa följande
Område

Vad du ska visa

Förståelse av arbetssättet

Du förklarar AI-native utveckling och ditt eget ansvar genom ett relevant exempel från arbetet. Du skiljer AI:s förslag från dina beslut och faktiska kontroller.

Problem, specifikation och nedbrytning

Du avgränsar och delar upp ditt moment i hanterbara steg med prövbara acceptanskriterier. Du förklarar hur spec-driven development har styrt implementation och verifiering.

Prompting och kontextstyrning

Du visar instruktioner med relevant kontext och begränsningar och förklarar varför de behövdes.

Implementation, testning och felsökning

Du genomför ett spårbart tekniskt bidrag med AI-stöd, granskar resultatet och verifierar det mot kraven. Du motiverar testurval och testmetod, visar körresultat och förklarar AI:s roll i kodning, test och felsökning samt hur avvikelser undersöks. Happy paths och relevanta error paths ingår enligt testavsnittet.

Avgränsat agentarbete

Du leder minst ett avgränsat agentmoment och förklarar agentic development genom det arbetet. Du visar uppdrag, gränser, kontrollpunkter och egen granskning.

Teamarbete

Du granskar minst en klasskamrats förändring och bidrar till teamets gemensamma AI-arbetssätt. Du förklarar hur AI ingår i arbetsflödet och hur ditt bidrag fungerar i helheten.

Återkommande arbetsmoment

Du visar egen användning av AI för ett återkommande eller automatiserat utvecklingsmoment, med konkreta exempel, granskning, nytta och begränsningar. Du får använda teamets gemensamma instruktion eller automation.

Självständighet och nytta

Ditt samlade arbete visar att du tar ansvar för att avgränsa, styra, granska och verifiera samt motivera egna beslut. Du visar konkret hur AI bidragit till kvalitet och effektivitet och beskriver begränsningarna.

Att ta hjälp är förenligt med självständighet. Du behöver inte hitta fel i varje AI-förslag, men även ett beslut att acceptera ett förslag ska ha stöd i granskning och verifiering.

För VG ska du dessutom visa alla tre fördjupningar
Fördjupning

Vad du ska visa

Välgrundade avvägningar

Du jämför relevanta alternativ i ett konkret beslut, väger fördelar och nackdelar mot kraven och visar hur ditt val påverkade arbetet.

Kritisk granskning och anpassad kontroll

Du identifierar en relevant risk eller svaghet i AI-förslaget eller verifieringen. Du prövar om kontrollerna fångar risken, anpassar vid behov och visar med faktiska resultat hur risken hanteras.

Belagd förbättring av arbetsprocessen

Du motiverar och prövar en förbättring av ett AI-stött arbetsmoment. Du jämför användning och resultat och visar nyttan, begränsningarna och när arbetssättet passar.

Samma arbetsmoment kan ge underlag för flera kriterier. Du behöver inte göra tre separata uppgifter eller visa VG-nivå i varje beslut. Alla tre fördjupningar ska däremot vara tydligt belagda i ditt eget arbete. En längre reflektion eller en förbättring som du bara föreslår räcker inte.

Exempel på skillnaden mellan G och VG-fördjupning
Exemplen illustrerar nivån inom respektive område. De är inte obligatoriska tillvägagångssätt och avgör inte ensamma kursbetyget.

Område

Exempel på G

Exempel på VG-fördjupning

Avvägning

Du väljer integrationstest för lagringskravet och förklarar vad det visar och inte visar.

Du jämför integrationstest med test genom gränssnittet utifrån vad de kontrollerar och arbetet de kräver. Du motiverar valet och visar i genomförda kontroller vilka krav det täcker och vilka begränsningar som återstår.

Testning

Du visar tester för relevanta happy paths och error paths, med förväntade resultat och körresultat.

Du undersöker om testet kan missa utebliven sparning. Genom att tillfälligt koppla bort sparningen visar du att kontrollen misslyckas av rätt anledning, eller förbättrar den om den inte gör det.

Arbetsprocess

Du använder teamets instruktion för testförslag i återkommande arbete och visar hur du granskat förslagen och vilken nytta de gav.

Du förbättrar instruktionen utifrån en upptäckt begränsning och prövar båda versionerna på jämförbara uppgifter. Du visar vad som blev bättre och vilka begränsningar jämförelsen har.

Jämförelser behöver inte innehålla exakta tidsmätningar. Underlaget kan exempelvis visa färre korrigeringar, bättre upptäckt av fel eller tydligare överlämning. Slutsatserna ska ha stöd i det du faktiskt har prövat.

Om gruppens leverans är ofullständig
Gruppens brister sänker inte automatiskt ditt betyg. Vi bedömer vad ditt eget arbete visar. Samtidigt kan vi inte bedöma ett kriterium som uppfyllt om nödvändigt underlag saknas eller om gruppens brister gör att ditt resultat inte går att verifiera. Det gäller både G och VG. En välskriven redovisning ersätter inte genomfört och spårbart arbete.

Följ upp arbetet varje vecka
Uppdatera teamets fork och samma löpande PR varje vecka under vecka 5-8. Skriv en kort veckostatus i projektets dokumentation och länka till den från PR:n. Behåll tidigare veckors status så att progressionen går att följa:

Planerat: vad ni tänkte göra.
Genomfört: vad ni faktiskt har gjort, med länkar till relevanta förändringar.
Verifierat: vilka kontroller ni har kört och vad de visade.
Osäkert eller ofärdigt: vad som återstår eller behöver undersökas.
Nästa steg: vad ni arbetar vidare med och vem som ansvarar.
Dessa checkpoints används för progression och återkoppling. De är inte separata examinationer. Jämför ert faktiska läge med veckans förväntningar. Om något återstår beskriver ni vad, varför och hur ni planerar att komma vidare. Har ni hunnit längre visar ni det också i veckostatusen.

Gruppens kod, tester och gemensamma dokumentation finns på GitHub och nås via teamets löpande PR. Din individuella redovisning lämnar du som ett separat dokument i Disco. Lägg tydliga länkar till gruppens underlag i PR-beskrivningen och länka till ditt eget arbete från det individuella dokumentet.

Det här lämnar ni in
Gruppens kod, tester och gemensamma dokumentation finns på GitHub och nås via teamets löpande PR. Din individuella redovisning lämnar du som ett separat dokument i Disco. Lägg tydliga länkar till gruppens underlag i PR-beskrivningen och länka till ditt eget arbete från det individuella dokumentet.

Gruppens underlag
Länkar till teamets fork och löpande PR till kursens gemensamma repository, med en tydligt markerad slutversion och instruktioner för att köra lösningen och testerna.
Specifikationer, acceptanskriterier, automatiserade tester och en verifieringsplan med testurval, motiveringar, körresultat och begränsningar enligt avsnittet om tester och verifiering.
Projektets AI-instruktioner, tekniska beslut och spårbar historik över förändringar och granskningar.
Veckostatus och en beskrivning av ert gemensamma AI-arbetsflöde, inklusive det återanvändbara arbetsmomentet.
Kända begränsningar, risker och förslag på fortsatt utveckling.
Ditt individuella underlag
Lämna din korta individuella redovisning som en Markdown-fil (.md) i Disco. Märk dokumentet med ditt namn och länka till teamets repository, löpande PR och markerade slutversion. Ta också med direkta länkar till ditt eget bidrag, exempelvis kod, tester, styrdokument, pull requests eller commits.

Den individuella redovisningen ska inte läggas i teamets repository eller länkas från teamets PR. Du behöver inte dela dokumentet med dina klasskamrater. Projektets gemensamma dokumentation finns fortsatt i repositoryt.

Du väljer själv hur du strukturerar dokumentet. Beskriv:

vad du ansvarade för och hur du avgränsade uppgiften
hur du använde spec-driven development: följ ett acceptanskriterium från specifikation genom AI-instruktion och implementation till kontroll
hur du använde prompting och kontextstyrning, med en konkret instruktion och varför informationen och begränsningarna behövdes
vad agentic development innebar i ditt moment: vad agenten fick göra, vilka gränser du satte och hur du följde upp arbetet
vad du accepterade, ändrade eller avvisade och varför
hur AI kan användas i kodning, test och felsökning, med koppling till ditt bidrag och vad dina kontroller visade. Skilj det du genomförde från det du beskriver som ett möjligt arbetssätt
hur AI ingick i teamets arbetsflöde, hur du samarbetade och hur du granskade en klasskamrats förändring
vilket återkommande eller automatiserat AI-stött moment du själv använde, med konkreta exempel på användning, granskning, nytta och begränsningar
vad AI-native utveckling innebär och hur det syns i ditt arbete, inklusive AI:s möjligheter, begränsningar och ditt eget ansvar
Förklara begreppen genom dina exempel och koppla påståenden till det arbete du länkar till. Samma exempel kan besvara flera punkter.

För att visa VG-fördjupningarna anger du också vilka alternativ du jämförde, vilken risk du undersökte och vilken förbättring av arbetssättet du prövade. Länka till beslut, relevanta versioner, jämförelser och kontrollresultat som stöder dina slutsatser. Det kan ingå i samma exempel och redovisning.

Välj relevanta utdrag, beslut och körresultat. Fullständiga AI-konversationer behöver inte lämnas in.

Vi granskar teamets kodbas och styrdokument, exempelvis specifikationer, AI-instruktioner och tekniska beslut, utanför föreläsningstiden. För varje student kopplar vi de egna reflektionerna till det spårbara arbetet i projektet. En allmän beskrivning av teamets arbete behöver därför kompletteras med vad just du gjorde, varför och hur du kontrollerade resultatet.

Kontrollera att vi har åtkomst till repositoryt och att länkarna fungerar.

Om något är oklart kan vi kontakta dig individuellt, exempelvis via Slack, och be dig förklara ett beslut, visa var en förändring finns eller förtydliga vad en kontroll visar. Ditt svar ska anknyta till ditt faktiska arbete. En välskriven redovisning ersätter inte ett spårbart eget bidrag. Om underlaget fortfarande inte visar ett kriterium behöver det kompletteras innan kriteriet kan bedömas som uppfyllt.

Markera er slutversion
När ni är klara med inlämningen:

Se till att gruppens kod, tester och gemensamma dokumentation är sparade och pushade till teamets GitHub-repository.
Kopiera länken till den commit som innehåller er slutversion.
Lägg länken överst i beskrivningen av teamets löpande PR, under rubriken Slutversion för examination.
Länken visar exakt vilken version av projektet vi ska bedöma. Varje student hänvisar till denna slutversion i sitt individuella dokument i Disco.

Här kan du lämna in
Ladda upp din individuella redovisning som en Markdown-fil (.md) i din egen inlämning i Disco. Dokumentet ska innehålla länkar till teamets löpande PR, markerade slutversion och det arbete som visar ditt eget bidrag. Alla i teamet kan hänvisa till samma gemensamma PR, men varje student lämnar sin egen redovisning.

Kontrollera att dokumentet går att öppna, att länkarna fungerar och att kursansvarig har åtkomst till underlagen på GitHub.