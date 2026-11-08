# Dokumentgranskning av krav och testplan

Granskningsdatum: 6 november 2026. Granskningen är genomförd med AI-stöd och ska sakgranskas av Ramadan Cilomba och gruppen före godkännande.

## Sammanfattning

Samtliga 32 krav (FR-01–FR-25 och ÖK-01–ÖK-07) har minst en uttrycklig koppling till testfallen TV-01–TV-30. Inget krav saknar helt testkoppling. En koppling innebär dock inte att hela acceptanskriteriet är verifierat: vissa tester täcker bara delar av det eller har för svagt formulerade förväntade resultat.

De viktigaste förbättringarna är att precisera täckningen av alla sparade ärenden, ändrade uppgifter efter omstart, de två vyernas uppdatering samt validerings- och sökresultat. Gruppbeslut behövs om obligatoriska fält, kategori-/prioritetsvärden, sökbara fält och filter. Dokumenten innehåller ingen tydlig direkt motsägelse mellan krav och testfall; de huvudsakliga problemen är ofullständig verifiering och ännu öppna regler.

Detta är en dokumentgranskning. Inga testfall har körts, ingen implementation har bedömts och inga testresultat rapporteras här. Täckning nedan betyder planerad täckning enligt dokumenttexten, inte befintlig testkod eller bevisat fungerande programvara.

## Underlag och avgränsning

Endast följande originaldokument används som normativ grund:

- [Kundserviceportalen_Kravspecifikation.docx](https://github.com/bezerkt1/kundportal-ai-native-development/blob/4cd8e77e298252f6dc451ee93796446762152363/Kundserviceportalen_Kravspecifikation.docx)
- [Kundserviceportalen_Test_och_verifieringsspecifikation.docx](https://github.com/bezerkt1/kundportal-ai-native-development/blob/4cd8e77e298252f6dc451ee93796446762152363/Kundserviceportalen_Test_och_verifieringsspecifikation.docx)

Båda lästes direkt från `origin/feature/requirements-documentation`, commit `4cd8e77e298252f6dc451ee93796446762152363`. Originalfilerna har inte ändrats eller kopierats in i rapportbranchen. Rapportbranchen skapades från uppdaterad `origin/main`, commit `68b3002`.

Kravens formuleringar och acceptanskriterier har jämförts med testernas kravkoppling, instruktion och kolumnen ”Godkänt när”. Tidigare PR-granskningar, applikationskod och andra kravdokument används inte för att lägga till eller omtolka krav. Testspecifikationens avsnitt 4 är uttryckligen villkorat av gruppbeslut och behandlas därför inte som obligatoriska tillägg.

## Spårbarhet: krav till testfall

”Planerad” betyder att relevant kontroll är beskriven, inte att testet har genomförts. ”Delvis” betyder att en del av acceptanskriteriet inte uttryckligen kontrolleras. Test-ID i tabellen är dokumentets egna kopplingar, om inte annat anges i kommentaren.

| Krav | Innehåll i korthet | Kopplade testfall | Bedömning och kommentar |
|---|---|---|---|
| FR-01 | Rubrik och beskrivning | TV-01 | Planerad: båda ska sparas med rätt värden. |
| FR-02 | Kategori och prioritet | TV-01 | Planerad; tillåtna värden kräver gruppbeslut, se B1. |
| FR-03 | Kundens e-postadress | TV-01 | Planerad: adressen sparas. Formatvalidering är inget uttryckligt krav. |
| FR-04 | Fyra tillåtna statusar och visning | TV-01, TV-03, TV-16 | Planerad: giltiga värden samt otillåtet värde. TV-03 behöver ange var värdena visas, se F5. |
| FR-05 | Sparad skapandetidpunkt | TV-02 | Planerad: läses ur sparad post. Mindre precisering möjlig, se P3. |
| FR-06 | Alla sparade ärenden i startsidans lista | TV-04, TV-05 | Delvis: tom lista och två ärenden täcks, men förväntat resultat utesluter inte extra poster; allmängiltig fullständighet behöver stärkas, se F1. |
| FR-07 | Knapp öppnar nytt formulär | TV-06 | Planerad och tydlig. |
| FR-08 | Öppna rätt ärende från listan | TV-07 | Planerad: minst två ärenden skiljer rätt val från fel val. |
| FR-09 | Samma formulär för skapa och redigera | TV-09, TV-12 | Planerad: båda lägena och förifyllning. Definiera vad samma formulärsida betyder, se B2. |
| FR-10 | Sex fält på formuläret | TV-01, TV-09 | Planerad genom kombinationen av fältvisning och sparande. TV-01 ensamt visar inte att fälten finns i gränssnittet. |
| FR-11 | Tomma obligatoriska fält hindrar sparande | TV-10 | Planerad men oprecist utfall: ”sparas inte som giltigt”, se F3. Obligatoriska fält behöver beslutas, se B1. |
| FR-12 | Begripligt meddelande om vad som saknas | TV-10, TV-11 | Planerad men TV-11 är svagare och överlappar TV-10; se F3 och P1. |
| FR-13 | Skapa nytt ärende som finns i listan | TV-01, TV-08 | Planerad: datavärden respektive användarflöde. |
| FR-14 | Tillbaka till startsidan efter sparande | TV-08 | Planerad: startsidan ska öppnas efter sparande, inte först efter ett separat navigeringssteg. |
| FR-15 | Förifyllda uppgifter och ändring av samma ärende | TV-12, TV-13 | Delvis: förifyllning och ändrade värden täcks, men oförändrad identitet bör uttryckligen kontrolleras, se F4. |
| FR-16 | Rätt ärendes sju uppgifter på detaljsidan | TV-07, TV-14 | Planerad: rätt val och samtliga sju uppgifter. |
| FR-17 | Sparad ändring till tillåten status | TV-15, TV-16, TV-26 | Planerad; TV-15 provar ett annat värde medan TV-03 provar alla värden utan att ange ändringsflöde, se F5. |
| FR-18 | Redigering via formulär och resultat på detaljsidan | TV-13, TV-17 | Planerad, tydligast genom TV-17:s flöde. |
| FR-19 | Ta bort sparat ärende | TV-18 | Planerad. Testet får inte ersättas av enbart döljning i listan; TV-19 kompletterar. |
| FR-20 | Borttaget ärende förblir borta | TV-18, TV-19 | Planerad: lista, omladdning och omstart. |
| FR-21 | Sökresultat matchar sökvillkoret | TV-20, TV-21 | Delvis: TV-20 kräver inte uttryckligen att icke-matchande ärenden utesluts, se F6. Sökregler kräver beslut. |
| FR-22 | Filter begränsar listan | TV-22 | Planerad men förväntat resultat bör även kräva att alla matchande ärenden visas, se F6. Filter kräver beslut. |
| FR-23 | Skapade och ändrade ärenden efter omladdning | TV-23, TV-25 | Planerad: skapande respektive uppdatering täcks. |
| FR-24 | Ärenden och aktuella uppgifter efter omstart | TV-24, TV-25, TV-26 | Delvis: TV-25 har ingen omstart trots kravkoppling; TV-26 provar ändrad status men inte andra ändrade uppgifter, se F2. |
| FR-25 | Lista och detaljsida visar sparade ändringar | TV-13, TV-15, TV-25, TV-26 | Planerad främst genom TV-25; övriga anger inte alltid båda vyerna, se F4. |
| ÖK-01 | Tre sammanhängande sidor | TV-27 | Planerad manuellt; TV-06–09 och TV-17 ger även stöd i delflöden. |
| ÖK-02 | Gränssnitt, logik och lagring tillsammans | TV-27 | Planerad manuellt för skapa, visa, ändra och ta bort. Sparade utfall bör anges per steg, se P2. |
| ÖK-03 | Annan person kan starta lokalt med instruktioner | TV-28 | Planerad manuellt med oberoende person. |
| ÖK-04 | Endast påhittade kunduppgifter | TV-29 | Delvis: test- och demonstrationsdata granskas, men utvecklingsdata nämns inte i kontrollsteget, se F7. |
| ÖK-05 | Automatiserade happy paths, error paths och gränsfall | TV-30 | Planerad som manuell kontroll av att automatiserade tester finns och körs. A-markering i TV-01–26 bevisar inte att kod eller körresultat finns. Se P2. |
| ÖK-06 | AI-stöd, egna beslut och granskning kan visas | TV-30 | Planerad manuell underlagsgranskning. Skilj detta från testkörning, se P1. |
| ÖK-07 | Inget personligt betalkonto behövs | TV-28 | Planerad manuellt i uppstarts- och demonstrationsflödet. |

## Faktiska brister i testbeskrivningarna

Prioritet ”viktig” betyder att formuleringen bör rättas innan testplanen används som belägg för full täckning. Det betyder inte att ett fel har påvisats i programvaran.

| ID | Prioritet | Test och krav | Brist och föreslagen precisering |
|---|---|---|---|
| F1 | Viktig | TV-05, FR-06 | ”Båda ärendena finns med” tillåter även oväntade extra poster. Ange en känd lagrad mängd med särskiljbara värden och kräv att den visade mängden motsvarar denna utan saknade eller extra ärenden. Två poster är ett relevant grundfall men inte bevis för alla datamängder; välj större datamängd om listbegränsning är en identifierad risk, utan att införa ett nytt numeriskt krav. |
| F2 | Viktig | TV-24–26, FR-24 | TV-25 är kopplat till FR-24 men provar bara omladdning. TV-24 provar ny post efter omstart och TV-26 en ändrad status. Komplettera ett befintligt fall med att också ändra exempelvis beskrivningen, stoppa/starta applikationen med samma lagring och hämta det ändrade ärendet. Kontrollera senaste värdena. Definiera vilka processer som stoppas så att omstart skiljs från webbläsaromladdning. |
| F3 | Viktig | TV-10–11, FR-11–12 | ”Sparas inte som giltigt” kan tolkas som att en ogiltig post ändå sparas. Kräv att inget nytt ärende skapas; vid kontroll av redigering ska tidigare sparade värden vara oförändrade. Ange att meddelandet identifierar den saknade uppgiften. TV-11 kräver bara ett begripligt meddelande och kan därmed godkänna ett generellt fel som inte förklarar vad som ska rättas. |
| F4 | Viktig | TV-13, TV-15, TV-25–26; FR-15, FR-25 | TV-13 säger att det befintliga ärendet innehåller nya värden men anger ingen konkret identitetskontroll. Behåll samma ärendeidentifierare i förberedelse och återhämtning och kontrollera att uppdateringen inte skapat en ny post. TV-25 nämner båda vyerna, medan övriga fall inte gör det: använd TV-25 som uttryckligt gemensamt kontrollsteg för uppdaterad lista och detaljsida, för de fält som respektive vy visar. Detta kräver inte att tekniskt ID visas för användaren. |
| F5 | Viktig | TV-03, TV-15–16; FR-04, FR-17 | TV-03 kontrollerar alla statusvärden utan att ange om det gäller skapande eller uppdatering eller var visningen verifieras. TV-15 provar bara ett byte. Precisera att ett befintligt ärende kan uppdateras till vart och ett av de fyra tillåtna värdena, med ett annat startvärde, och att sparat värde hämtas och visas. TV-16 bör skilja försök vid skapande från uppdatering; efter ett otillåtet uppdateringsförsök ska tidigare status finnas kvar. Inga särskilda övergångsbegränsningar eller HTTP-koder förutsätts. |
| F6 | Viktig | TV-20, TV-22; FR-21–22 | TV-20 godkänns när det matchande ärendet visas, även om alla andra också visas. TV-22 kräver ”endast” matchande poster men säger inte uttryckligen att alla matchningar ska komma med. Kräv i båda fallen exakt den förväntade uppsättningen ärenden, med både matchande och icke-matchande testdata. Upprepa för gruppens beslutade sökbara fält och filter. |
| F7 | Viktig | TV-29, ÖK-04 | Kravet omfattar utveckling, test och demonstration, medan kontrollsteget bara anger testdata och demonstrationsärenden. Lägg till granskning av relevanta utvecklingsdata, exempeldata och data som levereras med projektet. Dokumentera granskat underlag och begränsningar; ett stickprov bevisar inte all historisk användning. |

## Möjliga förbättringar och överlapp

Följande är förbättringsförslag inom befintliga krav, inte nya funktioner eller ovillkorliga extra testkrav.

| ID | Prioritet | Testfall | Bedömning och rekommendation |
|---|---|---|---|
| P1 | Mindre viktig | TV-10/11, TV-13/17, TV-30 | TV-11 överlappar TV-10 nästan helt. Slå ihop dem eller låt TV-10 kontrollera utebliven lagring och TV-11 granska felmeddelandets begriplighet i gränssnittet. TV-13 och TV-17 kan dela testdata och uppdateringssteg, men TV-17 har ett eget värde genom navigeringen från detaljsidan. TV-30 innehåller två olika leveranskontroller (automatisering och AI-underlag); dokumentera separata delresultat så att en godkänd del inte döljer en annan som saknas. Behåll hänvisningar till båda ID om testkod delas. |
| P2 | Viktig | TV-01–30, särskilt TV-27–30 | Ange konkreta testdata, förväntade värden, förberedelse/återställning och vald testnivå. För navigering och visning räcker inte enbart ett API-test som belägg för gränssnittsbeteendet; en manuell komplettering kan anges. För TV-27: dokumentera förväntat utfall efter varje CRUD-steg. För TV-30: länka till testkod och faktiska körningar samt vilka centrala happy paths, error paths och gränsfall de visar. Registrera version och resultat först efter verklig kontroll. |
| P3 | Mindre viktig | TV-02, FR-05 | Precisera att skapandetidpunkten är ett tolkningsbart datum/tidsvärde kopplat till just den sparade posten. Om testet jämför mot klockan behöver tolerans och tidszon anges som testmetod. Dokumenten beslutar inte visningsformat eller särskild tidszon; inför inte sådana produktkrav här. |
| P4 | Mindre viktig | TV-18–19, TV-23–26 | Behåll dessa fall: de provar olika saker (omedelbar borttagning, beständig borttagning, ny post efter omladdning/omstart och uppdaterad post). Återanvänd testhjälpare och förberedelser om lämpligt, men slå inte ihop bort de separata förväntade resultaten. Använd gärna två ärenden vid ändring/borttagning för att upptäcka påverkan på fel post. |

TV-01 och TV-08 är inte onödiga dubbletter: det första kontrollerar sparade fältvärden, det andra återgång och listvisning. TV-03, TV-15, TV-16 och TV-26 skiljer på giltiga värden, uppdatering, ogiltig inmatning och beständighet. TV-07 och TV-14 skiljer på val av rätt post och detaljinnehåll. Ingen av dessa överlappningar motiverar att täckningen tas bort.

## Happy paths, error paths och gränsfall

| Typ | Redan planerat | Lucka eller begränsning |
|---|---|---|
| Happy paths | Skapa med fältvärden (TV-01–03), navigera och lista (TV-05–09), redigera och visa (TV-12–15, TV-17), ta bort (TV-18–19), söka/filtrera (TV-20, TV-22), lagring (TV-23–26). | Ändrad beskrivning/annan redigerbar uppgift efter omstart behöver uttryckligt utfall (F2). Exakt träffmängd och alla giltiga statusvärden vid uppdatering behöver preciseras (F5–F6). |
| Error paths | Tom obligatorisk information med felmeddelande (TV-10–11) och otillåten status (TV-16). | Utebliven ny lagring respektive oförändrat tidigare värde behöver göras verifierbart (F3, F5). Det är relevanta felfall som följer direkt av befintliga krav. |
| Gränsfall | Tom lista (TV-04), ingen sökträff (TV-21), fyra tillåtna statusvärden mot ett otillåtet (TV-03/16). | Filter utan träff är ett relevant föreslaget komplement till FR-22: den förväntade mängden är tom. Obligatoriska textfält med enbart blanksteg och längdgränser kan inte bedömas förrän gruppen beslutat regler, se B3. |

Dokumenten kräver inte uttryckligen tester för nätverksavbrott, obefintligt ärende-ID, samtidiga uppdateringar eller särskilda databasfel. Dessa klassas därför inte här som saknad obligatorisk testtäckning. Eventuella sådana tillägg behöver motiveras och förankras av gruppen.

## Frågor som gruppen behöver besluta om

| ID | Fråga | Berörda krav/tester | Konsekvens |
|---|---|---|---|
| B1 | Vilka fält är obligatoriska? Vilka kategori-/prioritetsvärden, sökbara fält och filter gäller? Vilka matchningsregler används för sökning? | FR-02, FR-11–12, FR-21–22; TV-01, TV-10–11, TV-20–22. | Kraven lämnar uttryckligen flera val till gruppen. Utan fastställda regler går det inte att välja entydiga indata och förväntade utfall. Dokumentera beslut och hänvisa till dem från testerna. |
| B2 | Vad innebär ”samma formulärsida” och vilka uppgifter får redigeras? | FR-09–10, FR-15, FR-18; TV-09, TV-12–13, TV-17. | Testerna ligger i huvudsak i linje med kraven, men TV-13:s exempel med ändrad rubrik kan uppfattas som beslut om redigerbara fält. Bekräfta tolkningen och välj testdata därefter. Kravtexten får inte tyst ersättas av nuvarande implementation eller tidigare PR-scope. |
| B3 | Ska blanksteg räknas som tomt innehåll? Finns längdgränser eller e-postformatregel? | FR-03, FR-11; testspecifikationens avsnitt 4. | Inga exakta sådana regler finns i dokumentens krav. När regler beslutas kan motsvarande gränsfall och felfall läggas till. De är inte konstaterade obligatoriska luckor nu. |
| B4 | Ska sökning och filtrering kunna kombineras? Ska tidpunkt för senaste ändring finnas? | Testspecifikationens avsnitt 4. | Dessa kontroller är uttryckligen villkorade. De får inte göras till krav genom denna rapport. Om gruppen beslutar dem behövs uppdaterat kravunderlag och testkoppling. |

FR-14 och TV-08 säger båda att startsidan öppnas efter sparande. Det finns alltså ingen dokumentintern konflikt där. Om gruppen avser att användaren först ska trycka på en separat tillbaka-knapp behöver det diskuteras som en eventuell kravändring, inte godkännas genom att testets förväntade resultat försvagas.

## Föreslagen prioritering

1. Fastställ öppna regler i B1–B2 så att berörda testfall kan få entydiga förväntade resultat.
2. Precisera F1–F7 innan full täckning påstås. Särskilt F2 innebär att en nuvarande kravkoppling inte motsvaras av teststeget.
3. Konkretisera testnivåer och verifieringsunderlag enligt P2. Behåll skillnaden mellan plan, testkod och faktisk körning.
4. Minska onödigt dubbelarbete enligt P1 och förbättra tids-/testdataprecision enligt P3–P4. Behandla B3–B4 först när gruppen beslutat reglerna.

## AI-användning och mänsklig verifiering

AI har hjälpt till att läsa text och tabeller ur DOCX-filerna, jämföra samtliga krav med testfallen, sammanställa spårbarhet och formulera förbättringsförslag. Rapporten är AI-stödd och ännu inte mänskligt godkänd. AI har inte kört testfallen, verifierat programvaran eller beslutat nya krav. A betyder i källdokumentet en rekommendation om automatisering, inte att automatiserade tester redan finns eller har godkänts.

Ramadan Cilomba behöver kontrollera att rapportens återgivning och slutsatser stämmer med originalens tabeller, särskilt FR-09–10, FR-14–15, FR-24 och TV-09/13/25. Gruppen behöver bekräfta vilka dokumentversioner som är gällande och ta ställning till B1–B4. Kontrollera även att rapportens gräns mellan faktiska brister och förslag är rimlig innan den används i gemensam planering.

Efter gruppens beslut kan ansvariga uppdatera testplanen och implementera relevanta tester i en separat uppgift. Varje verklig körning ska därefter dokumenteras med test-ID, datum/version, faktiskt resultat och länk till underlag. Inga tidigare manuella PR-kontroller räknas automatiskt som genomförande av TV-01–TV-30.

## Kontroll av denna rapport

- Alla 25 FR-krav och sju ÖK-krav har en rad i spårbarhetstabellen.
- Samtliga TV-01–TV-30 finns representerade i kravkopplingarna och har granskats med instruktion och förväntat resultat.
- Faktiska textbrister, möjliga förbättringar och gruppbeslut redovisas separat.
- Ingen frontend-/backendkod eller originalfil har ändrats som del av granskningen.
- Rapporten innehåller inga påståenden om genomförda testkörningar eller mänskligt godkännande.
