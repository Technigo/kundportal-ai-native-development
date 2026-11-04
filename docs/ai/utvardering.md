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

## Sammanfattning

(Skrivs när alla har svarat.)
