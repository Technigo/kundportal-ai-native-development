# Utvärdering av arbetssättet (KSP-62)

> Utkast. Var och en fyller i sin del, gärna senast måndag 2026-11-09.
> Nicklas skriver sammanfattningen och teamet godkänner den före demon.

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
- **Om ett test prövar rätt risk.** Ett rött test betyder inte att det fångar rätt fel. Jag lade
  själv till tjänstetestet för HIST-09, eftersom ingen förslagskörning såg att en saknad rollback inte
  syns över HTTP, och jag behöll omstartstestet för HIST-10 eftersom specen säger "ny engine".
- **Begriplighet.** Om felmeddelandena går att förstå för en handläggare kan bara en människa bedöma.
  Jag gjorde kontrollen av HIST-14 för hand (sju felfall i `/docs`).

**4. Vad skulle jag förbättra?**

- **Kontrollera innan något påstås.** Lägg en kolumn "Kontrollerat?" i testinstruktionen, så att varje
  påstående om hur ett test faller är kört eller märkt som okontrollerat.
- **Skriva ned gissningen före mutationen.** Då går det att visa att vi förutsåg resultatet.
- **Krav på grön CI före merge.** Rulesetet kräver i dag ingen statuskontroll (KSP-17).

## Mustafa

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

(Skrivs när alla har svarat.)
