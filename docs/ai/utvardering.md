# Utvärdering av arbetssättet (KSP-62)

## Frågorna

Svara med 2–3 konkreta exempel, gärna med länk till en PR, ett test eller ett beslut.

1. Var hjälpte AI dig eller gruppen?
2. När skapade AI extra arbete eller fel?
3. Vilka beslut fick ni fatta själva, och varför kunde AI inte göra det?
4. Vad skulle du förbättra i arbetssättet om projektet fortsatte?

## Amalia

**1. Var hjälpte AI?**

- **Granskning av mina egna beslut innan bygget.** Innan tidslinjen byggdes bad jag AI leta efter
  motsägelser och saknade fall i min spec. Den hittade att två av mina egna beslut krockade: att den
  gamla listan ligger kvar vid en ny hämtning bryter en kort stund mot att den senaste posten ska
  stämma med ärendets status (KSP-37 AC3, tidslinjen), och det var inte bestämt vad som händer om den
  nya hämtningen misslyckas. Det löstes innan någon kod skrevs.
  [PR #109](https://github.com/desiboli/kundportal-ai-native-development/pull/109)
- **Tester som hittade fel i befintlig kod.** När testerna för felmeddelandena (KSP-38) skrevs hittade
  AI att ett svar utan `detail` gav ett tomt felmeddelande, och jest-axe hittade att uppgifterna i
  detaljvyn låg för djupt i `<dl>`, så att skärmläsare kan missa kopplingen mellan etikett och värde.
  Båda fanns sedan tidigare. [PR #107](https://github.com/desiboli/kundportal-ai-native-development/pull/107)
- **Snabb kontroll mot källor.** AI räknade ut kontrasten från temat, sökte i BOLDkit-registret och
  hittade en tidslinjekomponent utan nya beroenden, och kontrollerade vilka filer två grenar delar
  innan en merge.

**2. När skapade AI extra arbete eller fel?**

- **Påståenden som inte var prövade.** AI skrev att ordgränser skyddar svenska ord i kontrollen av
  tekniska ord, men hade bara provat "statusen". Mustafa visade i granskningen att "Välj en giltig
  status." flaggades. AI påstod också att PR #103 (sidhuvudet) måste mergas före mitt arbete, utan att
  jämföra filerna (misstag 1 i min misstagslogg). [PR #106](https://github.com/desiboli/kundportal-ai-native-development/pull/106)
- **Id i koden som ingen annan kunde slå upp.** AI använde id från min privata spec (K1, R3) i
  kommentarer och testnamn. Mustafa fångade det, och allt fick skrivas om. Det blev fem commits med
  rättningar efter hans granskning.
- **Den gick längre än jag bad om, eller tolkade mig fel.** Den byggde detaljvyn när jag bara ville ha
  testerna, la in en förklaring i PR:en som var menad för mig, och återställde en gång ny kod med
  `git checkout` när en mutation skulle tas bort.

**3. Vilka beslut fick jag fatta själv, och varför?**

- **Kontrasten.** jest-axe kan inte räkna färger i testmiljön, så felet syntes inte i testerna. Jag
  mätte 3.78 för vit text på rött vid kontrollen för hand (kravet är 4.5) och bestämde svart text. Var
  rättningen skulle sitta (temat eller komponenten) avgjorde jag efter Mustafas granskning.
- **Utseendet.** Att den aktuella pricken inte stack ut, att skuggan tog över, och att "Ärendet
  skapades" som rubrik kunde förvirra såg jag först när jag provade tidslinjen i webbläsaren. AI hade
  godkänt alla de valen.
- **Vad som är värt att göra.** Jag strök granskningspunkter som inte höll när jag provade dem
  (sökning på "#5", engelska texter i avstängda funktioner), och bedömde att långa rader i detaljvyn
  var "good enough". Mustafas fynd om "svarar inte" rättade jag trots liten risk, eftersom det känns
  svårt att avvisa en granskares fynd. Det är bedömningar av projektets storlek och av teamet, inte av
  koden.

**4. Vad skulle jag förbättra?**

- **Lägga beslut i repot direkt när de påverkar teamets kod.** Min spec för felmeddelandena och
  tidslinjen började som en kursövning och låg privat. Men den innehöll till slut beslut som styr
  koden, och när AI använde dess id (K1, R3) kunde ingen annan i teamet slå upp dem. Om projektet
  fortsatte skulle jag lägga besluten i `docs/specs/` så fort de påverkar koden.
- **Kontroll för hand tidigare.** Kontrasten och utseendet hittades först när allt var byggt. En kort
  kontroll i webbläsaren efter första versionen hade sparat ett varv.
- **Pröva mot hela underlaget.** En kontroll ska prövas mot alla texter i felkatalogen, och en
  påstådd krock mot `git diff --stat`, innan AI säger att något håller.

## Azalea

**1. Var hjälpte AI?**

- **Testförslag som fångade fler fel.** Min instruktion v2-azalea kräver att testerna läser
  resultatet via en annan kanal och jämför mot förväntade värden. Det gav omstartstestet för
  HIST-04 (status och historik finns kvar efter omstart), som är det enda som fångar en saknad
  `commit` i statusbytet (M3b). Svaren före omstarten visade också fel status, så en jämförelse
  bara med dem hade släppt igenom felet.
  [PR #93](https://github.com/desiboli/kundportal-ai-native-development/pull/93)
- **Ett längre agentuppdrag med kontrollpunkter.** Rollback och 503 för HIST-09 (inget ändras om
  historikposten inte kan sparas) byggdes av en agent i en egen session, med fyra kontrollpunkter där
  jag godkände varje steg. [PR #77](https://github.com/desiboli/kundportal-ai-native-development/pull/77)
- **Snabba mutationer och förklarade felrader.** AI körde mutationerna och förklarade varför ett test
  föll, till exempel att omstartstestet med flera byten faller redan före omstarten när `commit`
  saknas i `create`, eftersom varje begäran har en egen session.

**2. När skapade AI extra arbete eller fel?**

- **Påståenden som inte var kontrollerade.** I testförslaget för KSP-66 (rollback i `create`) stod
  att två tester skulle falla på `PendingRollbackError`. Jag körde ett skript och såg att nästa
  `create` i stället sparar ärendet utan historikpost, vilket bryter mot HIST-01. Tidigare påstod
  agenten i KSP-36 att ett databasfel loggas, vilket inte stämde. Båda blev regler i min
  misstagslogg (misstag 4 och 8). [PR #96](https://github.com/desiboli/kundportal-ai-native-development/pull/96)
- **Den hoppade över arbetssättet.** I KSP-40 föreslog AI commit, PR och In Review direkt, utan att
  jag hade läst testerna och utan granskare (misstag 6). Den skrev också svar på engelska fast jag
  bett om svenska (misstag 7).
- **Följdarbete i repot.** Flera PR:er lade till rader sist i samma tabeller och gav konflikter som
  fick lösas för hand (#81 och #93).

**3. Vilka beslut fick vi fatta själva, och varför?**

- **Vad API:t svarar.** För KSP-66 valde jag 500 i stället för 503 när ett ärende inte kan skapas.
  503 hade ändrat kontraktet för `POST /tickets` och Nicklas CORE-spec. Det är ett beslut om ägarskap
  och kontrakt, inte om kod.
- **Om ett test prövar rätt risk.** Ett rött test betyder inte att det fångar rätt fel.
  Tjänstetestet för HIST-09 rekommenderades av AI och valdes av mig. Ingen förslagskörning med v1
  eller v2 föreslog det, eftersom en saknad rollback inte syns över HTTP. Jag behöll omstartstestet
  för HIST-10, eftersom specen säger "ny engine".
- **Begriplighet.** Om felmeddelandena går att förstå för en handläggare kan bara en människa bedöma.
  Jag gjorde kontrollen av HIST-14 för hand (sju felfall i `/docs`).

**4. Vad skulle jag förbättra?**

- **Kontrollera innan något påstås.** Lägg en kolumn "Kontrollerat?" i testinstruktionen, så att varje
  påstående om hur ett test faller är kört eller märkt som okontrollerat.
- **Skriva ned gissningen före mutationen.** Då går det att visa att vi förutsåg resultatet.
- **Krav på grön CI före merge.** Infördes under projektet (KSP-17): rulesetet kräver nu backend och
  frontend.

## Mustafa

**1. Var hjälpte AI?**

- **Frågor före implementation.** Jag samlade fyra skills för teamet, bland annat `grill-me` från [skills.sh](https://www.skills.sh/), som får AI att undersöka kraven och koden och ställa frågor innan den bygger. Vid planeringen av ärendelistan satte jag gränser så att AI inte tog över andras arbete eller ändrade API:t. [PR #47](https://github.com/desiboli/kundportal-ai-native-development/pull/47), [PR #59](https://github.com/desiboli/kundportal-ai-native-development/pull/59)

- **En typkontroll som inte kontrollerade något.** Alla 40 tester var gröna, men bygget stoppades av ett typfel. AI hjälpte mig hitta att typkontrollen var felinställd och inte läste några filer. Jag rättade kommandot och lade in automatiska kontroller (CI) som körs på varje ändring innan den får läggas in i huvudgrenen. Det gav resultat redan dagen efter: när en AI-agent byggde sök och filter upptäckte CI ett typfel i agentens kod. Felet rättades innan ändringen kom in i huvudgrenen. [PR #64](https://github.com/desiboli/kundportal-ai-native-development/pull/64) · [PR #84](https://github.com/desiboli/kundportal-ai-native-development/pull/84) · [PR #102](https://github.com/desiboli/kundportal-ai-native-development/pull/102)

- **Kodgranskning med belägg.** Vid granskningen av felmeddelandena använde jag AI för att köra tester och hitta fel. Bland sju konkreta fynd fanns en testhjälpare som felaktigt flaggade "Välj en giltig status." och ett missvisande felmeddelande om att backenden inte svarade. [PR #107](https://github.com/desiboli/kundportal-ai-native-development/pull/107)

**2. När skapade AI extra arbete eller fel?**

- **AI beskrev projektet som det hade varit, inte som det var.** Teamets dokument om kända begränsningar skrevs med hjälp av AI utifrån specar, beslut och veckostatus. När jag granskade det använde jag AI som stöd för att jämföra påståendena med koden i huvudgrenen. Jag hittade tio påståenden som inte längre stämde. Några gällde problem som redan hade rättats, andra beskrev ändringar som ännu inte var klara. Dokumentet lät trovärdigt, men speglade inte projektets faktiska läge. Därför godkände jag det inte förrän uppgifterna hade kontrollerats mot koden och rättats. [PR #98](https://github.com/desiboli/kundportal-ai-native-development/pull/98)

- **Kontraktet användes bara i testerna.** AI skapade typer från backendens API-kontrakt men använde dem inte i koden som skickade ärenden. Jag hittade också att ett sparat ärende kunde saknas i listan om formuläret stängdes under sparningen. Jag rättade båda problemen. [PR #64](https://github.com/desiboli/kundportal-ai-native-development/pull/64)

- **Fungerande kod med otydligt resultat.** När ett ärende skapades inifrån ett annat stängdes bara formuläret, utan tydlig bekräftelse. Jag skrev ett test som visade problemet och ändrade koden så att det nya ärendet öppnas direkt. [PR #103](https://github.com/desiboli/kundportal-ai-native-development/pull/103)

**3. Vilka beslut fick jag fatta själv, och varför?**

- **Arbetsordning och ansvar.** Jag planerade milstolpar och beroenden i Linear. Datatyperna (KSP-28) behövdes före flera frontenddelar, och vi delade upp arbetet med en ägare och granskare per del. AI kunde föreslå en plan, men inte avgöra teamets ansvar och prioriteringar.

- **Vad som hör hemma i portalen.** Jag tog bort en sida för backendstatus, bytte den röda huvudfärgen och bestämde omfattningen för sök och filter utan backendändringar. Det var beslut utifrån projektets syfte, inte bara vad AI kunde bygga. [PR #92](https://github.com/desiboli/kundportal-ai-native-development/pull/92), [PR #91](https://github.com/desiboli/kundportal-ai-native-development/pull/91), [PR #102](https://github.com/desiboli/kundportal-ai-native-development/pull/102)

- **Gränser och kvalitetskrav.** Jag organiserade teamets skills och införde CI för lint, bygge och tester. AI föreslog både separat typkontroll och bygge, men jag såg att bygget redan typkontrollerade och valde bort dubbelarbetet. AI kunde föreslå kontroller, men jag behövde avgöra vilka som var nödvändiga. [PR #47](https://github.com/desiboli/kundportal-ai-native-development/pull/47), [PR #84](https://github.com/desiboli/kundportal-ai-native-development/pull/84)

**4. Vad skulle jag förbättra?**

- **Kontrollera API-kontraktet i CI.** Frontendens typer genereras manuellt från backendens kontrakt. Jag skulle automatisera genereringen och kontrollera att implementationen använder typerna, så att kontraktsfel upptäcks tidigare.

- **Testa hela flödet.** Mina frontendtester använder simulerade backend-svar. Jag skulle komplettera med tester mot den riktiga backenden, från att skapa ett ärende till att hitta det och ändra status.

- **Göra AI-granskning till en skill.** I PR #107 hjälpte AI mig hitta konkreta fel, men fynden behövde bedömas. Jag skulle dokumentera arbetssättet som en skill där AI undersöker och redovisar belägg, medan granskaren avgör vad som behöver rättas. [PR #107](https://github.com/desiboli/kundportal-ai-native-development/pull/107)

## Nicklas

**1. Var hjälpte AI?**

- **En instruktion som gick att mäta.** Jag skrev först en egen facitlista med 19 gränsfall för
  CORE-11–14 (tomt, längd och tecken) och lät sedan AI föreslå tester med instruktionen v1. Den
  missade tre fall och alla fyra gränser. Med min förbättring v2-nicklas fick den med alla 19 och
  4 av 4. [PR #20](https://github.com/desiboli/kundportal-ai-native-development/pull/20)
- **Mutationsprövningen som agentuppdrag.** Uppdraget skrevs och sparades innan körningen, och en
  agent lade in sju fel i koden ett i taget (N1–N7). Jag gissade före varje körning. N3 visade att
  bara ett av fem osynliga tecken prövades, så testerna för de fyra andra lades till.
  [PR #72](https://github.com/desiboli/kundportal-ai-native-development/pull/72),
  [PR #73](https://github.com/desiboli/kundportal-ai-native-development/pull/73)
- **Granskning med körning.** När jag granskade körde AI testerna och små mutationer åt mig. I
  API-kontraktet hittade vi att längden kontrollerades före trimningen (CORE-12).
  [PR #26](https://github.com/desiboli/kundportal-ai-native-development/pull/26)

**2. När skapade AI extra arbete eller fel?**

- **Text som gick ut utan att jag sett den.** AI ändrade en PR-titel och lade till en mening i ett
  svar utan att visa mig först. Ett osynligt tecken (U+200B) hamnade också i en fil två gånger.
  Båda blev regler i min misstagslogg.
- **Kommandon som gjorde något annat än jag trodde.** `gh` utan `-R` letade i kursens repo, och en
  kommentar på samma rad som ett kommando skapade fyra extra Python-miljöer i zsh. I Linear blev en
  text med radbrytningar till flera kortkommandon, så att ett halvt svar postades och en ansvarig
  togs bort. Det fick städas för hand.
- **Ett resultat som såg komplett ut men inte var det.** Uppdraget för N5 gällde bara mina
  testfiler, så raden visade inte de 38 tester i `test_error_format.py` som också föll. Azalea
  hittade det i granskningen. [PR #105](https://github.com/desiboli/kundportal-ai-native-development/pull/105)

**3. Vilka beslut fick jag fatta själv, och varför?**

- **Vad som räcker för Verifierat.** Vi hann inte mutationspröva allt, så jag valde de krav där ett
  fel skadar mest (sparning, historik, statusregler och validering). Resten står kvar som *Grönt*,
  som en känd begränsning. Det är en prioritering, inte en fråga om kod.
- **Om ett test föll av rätt anledning.** AI rapporterade antalet röda, men jag fick läsa
  felraderna. Vid N7 föll statustesterna redan när ärendet skulle förberedas, inte på sina egna krav.
- **Vems sak det är.** Jag satte inte Verifierat på Azaleas rader, fast AI kunde ha gjort det,
  eftersom planen säger att hon fyller i sina egna.

**4. Vad skulle jag förbättra?**

- **Pröva mot hela sviten.** En mutation ska köras mot alla tester, inte bara mina, så att
  resultatet visar vad teamet faktiskt fångar.
- **Kontroll för hand i varje vecka, inte i slutet.** Min kontroll den 3/11 hittade saker som inga
  tester ser.
- **Följa README från noll tidigt.** Jag gjorde det först 4/11 och hittade att frontenden kräver
  Node 22.19, inte 20.

## Sammanfattning

Alla fyra har svarat på samma fyra frågor. Här är det som gick igen hos flera av oss.

**AI hjälpte mest när den fick visa belägg.** De bästa exemplen är när AI körde något och visade
resultatet, inte när den bara skrev. Den hittade motsägelser i en spec innan koden skrevs (Amalia,
#109), körde mutationer och förklarade varför ett test föll (Azalea, #67, #113; Nicklas, #72, #73), hittade fel
som redan fanns i koden när nya tester skrevs (Amalia, #107) och hjälpte till att hitta en
typkontroll som inte läste några filer, vilket ledde till CI (Mustafa, #64, #84). Instruktioner och
agentuppdrag med kontrollpunkter gjorde resultatet mätbart (Nicklas v2, #20; Azalea, #77).

**AI skapade extra arbete när påståenden inte var prövade.** Alla fyra har exempel på samma sak:
AI sa att något höll utan att ha kontrollerat det. Ordgränserna skyddade inte "Välj en giltig
status." (Amalia), två tester föll inte som testförslaget sa (Azalea, #96), dokumentet om kända
begränsningar hade flera påståenden som inte längre stämde (Mustafa, #98), och en mutationsrad visade
inte alla tester som föll (Nicklas, #105). Ett annat mönster är att AI gick längre än vi bett om:
den byggde mer än vi ville, föreslog commit och PR utan granskare, eller skickade text som vi inte
hade sett. Felen hittades nästan alltid i granskningen av någon annan i teamet.

**Besluten om ansvar, risk och begriplighet fattade vi själva.** AI kunde föreslå, men inte avgöra:

- vem som äger vad och i vilken ordning arbetet görs (Mustafas plan i Linear, att Nicklas inte satte
  Verifierat på Azaleas rader),
- vad som får ändras i kontraktet (Azalea valde 500 i stället för 503 för att inte ändra CORE-specen),
- vad som räcker (vilka krav som mutationsprövas, vad som är "good enough" för projektets storlek),
- om ett test faller av rätt anledning (Azalea, Nicklas),
- om något går att förstå och se för en människa (kontrasten 3.78, tidslinjens utseende,
  felmeddelandena i `/docs`).

**Det vi skulle förbättra.** Tre saker kommer från flera av oss:

1. **Kontrollera innan något påstås.** En kolumn "Kontrollerat?" i testinstruktionen (Azalea), pröva
   mot hela underlaget (Amalia) och mot hela testsviten (Nicklas).
2. **Pröva i webbläsaren tidigt och ofta.** Kontroll för hand varje vecka i stället för i slutet
   (Amalia, Nicklas), och tester mot den riktiga backenden för hela flödet (Mustafa).
3. **Låt repot och CI bära besluten.** Beslut som styr koden ska ligga i `docs/specs/` direkt
   (Amalia), och kontraktet ska kontrolleras automatiskt (Mustafa). Krav på grön CI före merge
   (Azalea) är redan infört (KSP-17).

**Slutsats.** AI gjorde det billigt att bygga och att testa, men arbetet flyttade till att
kontrollera. Det som fungerade bäst för oss var när AI tog fram belägg och en människa avgjorde,
och när någon annan i teamet granskade.
