# Kravspecifikation – Kundserviceportalen

Status: produktbeslut fastställda efter gemensam genomgång, 2026-10-30. Dokumentet beskriver krav på första versionen. Implementation och faktisk verifiering återstår. Återstående teknikbeslut framgår av avsnitt 8.

## 1. Syfte och målgrupp

Kundserviceportalen ska ge en handläggare överblick över kundärenden i en lokal installation. Handläggaren ska kunna registrera ett ärende, läsa dess innehåll och följa det genom att ändra status.

Den primära användaren är en handläggare. Första versionen stödjer en aktiv handläggare åt gången. Ärenden registreras manuellt med obligatoriskt kund-ID och kundnamn som handläggaren anger. Kunduppgifterna lagras på respektive ärende. Ett separat kundregister, en separat kundvy och kundinloggning ingår inte.

## 2. Uppdragskrav och fastställda beslut

Uppdraget kräver registrering med validering, beständig lagring, lista och detaljvy, statusändring, begriplig felhantering, automatiserade tester och instruktioner för körning och demonstration. Minst en kompletterande funktion ska specificeras före implementation.

Följande preciseringar är fastställda för första versionen:

- Fältreglerna, kategorierna och prioriteterna i avsnitt 4.
- Fyra statusar och fria övergångar mellan dessa enligt avsnitt 5.
- Filtrering på status som kompletterande funktion enligt K8.
- Felhantering och sortering enligt acceptanskriterierna i avsnitt 6.
- Lokal användning av en aktiv handläggare åt gången, med manuellt angivet kund-ID och kundnamn på varje ärende men utan separat kundregister.
- Heltals-ID för ärenden, textlängd räknad i Unicode-kodpunkter och UTC-tid enligt avsnitt 4.
- Användarbeteenden vid registrering, navigation, filtrering och fel enligt avsnitt 6.
- Kvalitetskrav och gemensamt arbetssätt enligt avsnitt 7 och 9.

Ändrade beslut dokumenteras här, och berörd verifiering uppdateras i verifieringsplanen. Uppdraget föreskriver inte de exakta längdgränserna eller kategorierna; dessa är gruppens beslut. Tekniska detaljer som ännu inte är valda ska fastställas och dokumenteras av teamet inom dessa produktregler.

## 3. Omfattning

### Ingår

- Ett användargränssnitt, applikationslogik och beständig lagring.
- Registrering, ärendelista, ärendedetaljer och statusändring.
- Obligatoriskt kund-ID och kundnamn, manuellt angivna och lagrade på varje ärende.
- Filtrering av ärendelistan på en status åt gången.
- Automatiserad verifiering av centrala beteenden och kompletterande manuella kontroller.
- Lokal installation, körning och demonstration med dokumenterade instruktioner.
- Ett gränssnitt som prioriterar datorwebbläsare och där hela kärnflödet kan genomföras med tangentbord.

### Ingår inte

- Produktionsdrift eller molninfrastruktur.
- Inloggning, behörighetsroller eller separat kundportal.
- Integration med e-post, chatt eller andra ärendekanaler.
- AI-funktioner i produkten.
- Bilagor, interna anteckningar, tilldelning eller ärendehistorik.
- Fritextsökning, flera samtidiga filter eller redigering av andra ärendefält efter registrering.
- Radering av ärenden.
- Samtidig användning eller samtidiga uppdateringar från flera handläggare.
- Ett separat kundregister, uppslagning av kunduppgifter samt kontaktuppgifter som e-postadress och telefonnummer.

Endast påhittade uppgifter får användas i applikation, testdata och demonstration. Lösningen ska kunna bedömas utan ett personligt betalkonto.

Ett felregistrerat kund-ID eller kundnamn, eller en felregistrerad rubrik, beskrivning, kategori eller prioritet, kan inte rättas i första versionen. Detta följer av avgränsningen att endast status får redigeras. Mobilanpassning har lägre prioritet än datorgränssnittet och ingår inte som leveranskrav för första versionen.

## 4. Ärendemodell och validering

| Fält | Regel |
| --- | --- |
| Ärende-ID | Unikt heltal, skapas automatiskt och ändras inte under ärendets livstid. Ingen obruten nummerföljd utlovas. |
| Kund-ID | Obligatorisk text som anges manuellt. 1–100 Unicode-kodpunkter efter trimning. Inget särskilt formatmönster krävs. Identifierar kunden och är separat från det automatiskt skapade ärende-ID:t. |
| Kundnamn | Obligatorisk text som anges manuellt. 1–200 Unicode-kodpunkter efter trimning. Inget särskilt formatmönster krävs. |
| Rubrik | Obligatorisk. 1–100 tecken efter trimning. |
| Beskrivning | Obligatorisk. 1–5 000 tecken efter trimning. |
| Kategori | Obligatoriskt val: Faktura, Teknisk support eller Övrigt. |
| Prioritet | Obligatoriskt val: Låg, Normal eller Hög. |
| Status | Nytt, Pågående, Väntar på kund eller Avslutat. Sätts automatiskt till Nytt vid registrering. |
| Skapad | Sätts automatiskt av backend när ärendet skapas och lagras i UTC. Kan inte ändras av användaren och bevaras vid statusändring. |

Före validering och lagring tas inledande och avslutande tecken med Unicode-egenskapen `White_Space` bort från kund-ID, kundnamn, rubrik och beskrivning. Uppsättningen är U+0009–U+000D, U+0020, U+0085, U+00A0, U+1680, U+2000–U+200A, U+2028, U+2029, U+202F, U+205F och U+3000. Endast tecken i början och slutet tas bort. Text som blir tom efter trimning avvisas. Inre mellanslag bevaras; inre tabbar och radbrytningar i beskrivningen bevaras.

Kund-ID skapas inte automatiskt och behöver inte vara unikt mellan ärenden. Samma kund-ID får anges för flera ärenden. Kund-ID och kundnamn sparas på varje ärende utan uppslagning eller kontroll mot ett separat kundregister.

Längd räknas i Unicode-kodpunkter efter trimning, inte i UTF-16-kodenheter eller synliga symboler. En sammansatt emoji kan därför räknas som flera tecken. Frontend och backend ska använda samma längddefinition och den uttryckliga `White_Space`-uppsättningen ovan; förlita er inte på att Python `strip()` och JavaScript `trim()` hanterar exakt samma tecken. Gemensamma testexempel ska omfatta blanksteg, tabbar, radbrytningar, U+00A0 och emoji samt de fastställda längdgränserna.

Kategori och prioritet väljs bland tillåtna värden. Ett tomt val eller ett värde utanför listan avvisas. Ärende-ID, startstatus och skapandetid bestäms av applikationslogiken.

Tidpunkter lagras i UTC och skickas i API:t som ISO 8601 med UTC-markeringen `Z`, exempelvis `2026-10-30T14:30:00Z`. Exakt precision dokumenteras i API-kontraktet. Gränssnittet visar ett läsbart datum och klockslag med svensk datumformatering i användarens lokala tidszon.

Reglerna ska upprätthållas i applikationslogiken även om gränssnittets validering kringgås. Gränssnittet kan ge tidigare återkoppling med samma regler.

## 5. Statusflöde

| Status | Betydelse |
| --- | --- |
| Nytt | Ärendet är registrerat och ännu inte påbörjat. |
| Pågående | En handläggare arbetar med ärendet. |
| Väntar på kund | Arbetet väntar på kompletterande information från kunden. |
| Avslutat | Ärendet är färdigbehandlat. |

Alla övergångar mellan de fyra giltiga statusarna tillåts. Ett avslutat ärende kan därför återöppnas. Att välja aktuell status igen är tillåtet och lämnar ärendets uppgifter oförändrade.

Motivering: ett enkelt flöde ger handläggaren flexibilitet och håller implementationen avgränsad. Automatiska övergångar och regler om vem som får ändra status ingår inte.

## 6. Funktionella krav och acceptanskriterier

<a name="k1"></a>

### K1 – Registrera ärende

- Med giltigt kund-ID, kundnamn, rubrik, beskrivning, kategori och prioritet sparas exakt ett nytt ärende per lyckad registreringsoperation.
- Registreringsformuläret innehåller obligatoriska fält för kund-ID och kundnamn. Båda anges manuellt och sparas tillsammans med ärendets övriga uppgifter.
- Sparade uppgifter följer fältreglerna. Ärendet får ett unikt ID, status Nytt och skapandetid.
- Användaren får en bekräftelse efter lyckad lagring och kan hitta ärendet i listan och öppna dess detaljer.
- Bekräftelse visas först när backend har bekräftat att ärendet sparats. Därefter öppnas det nya ärendets detaljvy och registreringsformuläret töms.
- Ytterligare inskick blockeras medan registreringsanropet pågår. Ett dubbelklick får inte starta två registreringsanrop från formuläret.
- Formuläret töms inte vid valideringsfel, lagringsfel eller okänt sparutfall. Okänt sparutfall hanteras enligt K7.

<a name="k2"></a>

### K2 – Validera inmatning

- Tomma obligatoriska fält, text med enbart blanksteg, för långa texter och ogiltiga val avvisas enligt avsnitt 4.
- Saknat eller tomt kund-ID respektive kundnamn avvisas även om gränssnittets validering kringgås. Kundfält med enbart blanksteg räknas som tomma.
- Inget ärende sparas när valideringen misslyckas.
- Gränssnittet visar ett begripligt fel som identifierar fältet och hur felet rättas. Redan ifyllda uppgifter finns kvar.
- Exempel: ”Ange kund-ID”, ”Ange kundnamn”, ”Ange en rubrik” och ”Rubriken får innehålla högst 100 tecken”.

<a name="k3"></a>

### K3 – Bevara ärenden

- Ett sparat ärende finns kvar med samma ID och uppgifter när applikationen stoppas och startas igen med samma lagring.
- En sparad statusändring finns också kvar efter omstart.
- Minneslagring som töms vid omstart uppfyller inte kravet.
- En vanlig start eller omstart bevarar befintliga ärenden och får inte tyst tömma eller ersätta databasen.
- Återställning av utvecklingsdata och skapande av demonstrationsdata kräver separata, uttryckliga kommandon. Detta är utvecklingsrutiner, inte en funktion för att radera ärenden i användargränssnittet.
- Automatiserade tester använder separat temporär lagring och får inte ändra utvecklarnas sparade ärenden.

<a name="k4"></a>

### K4 – Visa ärendelista

- Listan visar ärende-ID, kund-ID, kundnamn, rubrik, kategori, prioritet, status och skapandetid för sparade ärenden.
- Senast skapade ärenden visas först. Ärenden med samma skapandetid får visas i valfri inbördes ordning.
- Om inga ärenden finns visas ett tydligt tomläge, exempelvis ”Det finns inga ärenden ännu”.
- Gränssnittet skiljer mellan pågående laddning, en lyckad hämtning utan ärenden och en misslyckad hämtning.
- Vid hämtningsfel visas ett begripligt fel och möjlighet att försöka hämta igen. Felet får inte presenteras som en tom lista. Om tidigare hämtade uppgifter visas ska det framgå att de inte kunde uppdateras.

<a name="k5"></a>

### K5 – Visa ärendedetaljer

- Ett ärende kan öppnas från listan. Alla fält i ärendemodellen visas och tillhör det valda ärendet.
- Kund-ID och kundnamn visas med de värden som sparats på det valda ärendet.
- Om ett efterfrågat ID inte finns visas ett begripligt besked, exempelvis ”Ärendet kunde inte hittas”.
- Användaren kan återgå till ärendelistan.

<a name="k6"></a>

### K6 – Ändra status

- En giltig statusändring på ett befintligt ärende sparas och visas i både detaljvy och lista.
- En statusändring presenteras som sparad först efter bekräftelse från backend. Vid okänt utfall gäller K7.
- Ärendets ID, kund-ID, kundnamn, rubrik, beskrivning, kategori, prioritet och skapandetid ändras inte av statusoperationen.
- Ett ogiltigt statusvärde avvisas utan att den tidigare statusen ändras.
- Ett okänt ärende-ID ger ett begripligt fel och skapar inte ett nytt ärende.
- Statusändringen finns kvar efter omstart enligt K3.

<a name="k7"></a>

### K7 – Hantera lagringsfel och okänt sparutfall

- Om lagring misslyckas vid registrering eller statusändring visas ett begripligt fel, exempelvis ”Ändringen kunde inte sparas. Försök igen”.
- Ingen lyckad bekräftelse visas. Inmatade formulärvärden behålls vid misslyckad registrering.
- En misslyckad skrivoperation lämnar den tidigare beständiga datan oförändrad. Gränssnittet får inte presentera ändringen som sparad.
- Ett okänt sparutfall skiljs från ett bekräftat lagringsfel. Om backend kan ha sparat ändringen men bekräftelsen uteblir ska gränssnittet ange att sparandet inte kunde bekräftas. Det får varken påstå att ändringen sparats eller att den beständiga datan är oförändrad.
- Vid okänt utfall behålls formulärinmatningen och användaren erbjuds att kontrollera utfallet genom att hämta ärendelistan igen. Registreringen återförsöks inte automatiskt.

<a name="k8"></a>

### K8 – Filtrera på status, kompletterande funktion

- Ärendelistan har valen Alla, Nytt, Pågående, Väntar på kund och Avslutat.
- Alla är förvalt och visar alla ärenden.
- Valt filter behålls när användaren öppnar ett ärende och återgår till listan. Efter en fullständig sidomladdning återgår filtret till Alla.
- Ett statusval visar endast ärenden med exakt den statusen och behåller sorteringen enligt K4.
- Om inga ärenden matchar visas ett tydligt besked, exempelvis ”Inga ärenden matchar vald status”.
- När användaren väljer Alla återställs listan utan att lagrade ärenden ändras.
- Efter en bekräftad statusändring visar återgång till listan aktuella uppgifter med det tidigare valda filtret. Om ett ärende ändras från Nytt till Pågående ska det därför inte längre synas när filtret Nytt är valt.

Motivering: filtret hjälper handläggaren att hitta ärenden som behöver hanteras och kräver inga ytterligare fält i ärendemodellen.

## 7. Kvalitetskrav och leverans

| ID | Krav | Acceptanskriterium |
| --- | --- | --- |
| <a name="q1"></a>Q1 | Lokal och reproducerbar körning | README beskriver faktiska förutsättningar, installation, lagringskonfiguration och startkommandon. En annan person kan följa instruktionerna och starta lösningen lokalt. |
| <a name="q2"></a>Q2 | Automatiserad verifiering | Centrala beteenden verifieras mot acceptanskriterier med happy paths, relevanta error paths och gränsfall. Backend och frontend använder gemensamma valideringsexempel. Dubbelklick och övriga fastställda beteenden för registrering, navigation och fel verifieras. Testkommandon och testlänkar dokumenteras. |
| <a name="q3"></a>Q3 | Spårbar verifiering | Verifieringsplanen skiljer planerade tester från genomförda kontroller, automatiserat från manuellt och dokumenterar faktiska resultat samt begränsningar. |
| <a name="q4"></a>Q4 | Demonstration och eget bidrag | README beskriver ett demonstrationsflöde. Varje medlem kan visa sitt bidrag och förklara dess verifiering genom länkade uppgifter, PR:er och tester. |
| <a name="q5"></a>Q5 | Användbarhet på dator | Hela kärnflödet går att genomföra med tangentbord i datorwebbläsare. Fält har tydliga etiketter och fokusmarkeringen är synlig. Fel ska kunna förstås utan att användaren enbart behöver tolka färg. |
| <a name="q6"></a>Q6 | Integration, granskning och merge | En funktion räknas som färdig först efter verifiering mot den riktiga motparten, relevanta körda tester, uppdaterad dokumentation och granskning av en annan teammedlem. Både backend- och frontendtester ska vara godkända för den aktuella PR-versionen i GitHub Actions före merge till teamets main. |
| <a name="q7"></a>Q7 | Gemensamt arbetssätt för AI-stöd | Gemensamma AI-instruktioner versionshanteras i repot. Varje medlem ska kunna förklara sitt bidrag, vilka kontroller som genomförts och vad dessa faktiskt visar, även för AI-genererad kod. |

Verifieringen av K7 ska omfatta minst ett integrationstest mot verklig MySQL-testlagring där ett kontrollerat fel framkallas efter att en skrivoperation påbörjats men före commit. Efteråt kontrolleras via en ny anslutning att den tidigare beständiga datan är oförändrad. Simulerade felsvar kan komplettera denna kontroll men ersätter den inte. Testet får aldrig använda utvecklingsdatabasen.

Simulerade API-svar får användas för parallell utveckling. De räcker inte för att godkänna den integrerade funktionen enligt Q6. Automatiserade och manuella resultat ska fortsatt redovisas separat enligt Q3; fastställda krav innebär inte att några tester redan är genomförda.

## 8. Fastställd teknik och återstående beslut

### Fastställt

| Beslut | Fastställt läge |
| --- | --- |
| Språk och klientplattform | React och TypeScript med Vite i en webbapplikation med Python-backend. |
| Backendramverk | FastAPI. |
| Beständig lagring | MySQL via Docker Compose. |
| Testverktyg och automatisk körning | Pytest för backend, Vitest för frontend och testkörningar i GitHub Actions. |
| Fältregler, statusflöde och kompletterande funktion | Reglerna i avsnitt 4–6 gäller, inklusive statusfilter enligt K8. |
| Kunduppgifter | Obligatoriskt, manuellt angivet kund-ID och kundnamn lagras på varje ärende. Inget separat kundregister ingår. |
| Ärende-ID, textlängd och tid | Automatiskt heltals-ID för ärenden, Unicode-kodpunkter efter trimning och UTC-tid enligt avsnitt 4. |
| Team och samarbete | Huvudansvar finns i [README](../README.md#ansvarsfördelning). Lukas ansvarar för integration och utvecklingsmiljö. Arbetet fördelas flexibelt och teammedlemmarna hjälper varandra. Alla ansvarar för tester och dokumentation för sina ändringar, och andra teammedlemmar validerar dem. |

### Återstår att fastställa och dokumentera

| Beslut | Nuvarande läge |
| --- | --- |
| Granskning av API-kontrakt | [Utkastet](api-kontrakt.md) föreslår API-adresser, operationer, JSON-format, tillåtna värden och felstruktur. Teamet behöver granska och godkänna kontraktet innan implementation. |
| Tekniska preciseringar | Kundfältens format, längdgränser och trimningsregler är beslutade enligt avsnitt 4. Tidsprecision, beroendeversioner, projektstruktur och konfiguration återstår att fastställa och dokumentera. |
| Lagring och körkommandon | MySQL via Docker Compose är valt. Databasens konfiguration, migration/initiering, separata kommandon för återställning och demonstrationsdata samt installations-, start- och testkommandon dokumenteras i README och verifieringsplanen där det är relevant. |
| Uppgiftsfördelning och interna leveransdatum | Planeras flexibelt av teamet utifrån huvudansvaret i README. Inga fasta uppgiftsägare eller interna datum har beslutats i denna genomgång. |

## 9. Arbetsordning och gemensamt arbetssätt

1. Granska och fastställ API-kontraktsutkastet och återstående preciseringar gemensamt så att parallell utveckling följer samma interface.
2. Skapa körbar projektstruktur, startkommandon och automatiska testkörningar samt uppdatera installationsinstruktionerna.
3. Bygg den första integrerade kedjan: skapa ett ärende i React, spara det via FastAPI i MySQL och visa det igen efter omladdning. Lukas samordnar denna integration så snart grunderna finns. Utveckla registrering, validering och lagring med tester för K1–K3.
4. Bygg lista och detaljvy med tester för K4–K5.
5. Bygg statusändring och felhantering med tester för K6–K7.
6. Bygg statusfiltret med tester för K8.
7. Genomför manuella kontroller, verifiera körning från en ren klon och dokumentera resultaten.

Integrera och verifiera funktioner löpande. Funktioner räknas som färdiga enligt Q6; verifieringen får inte skjutas upp till en avslutande sammanslagning av delarna.

Varje utvecklingsuppgift kopplas till krav-ID, acceptanskriterier och hur ändringen ska verifieras. Arbetet fördelas flexibelt inom teamet. Granskningen ska vara spårbar: vem som granskade, vad som kontrollerades och vad återkopplingen ledde till. Gemensamma AI-instruktioner och dokumentation uppdateras när ett beslut ändras.
