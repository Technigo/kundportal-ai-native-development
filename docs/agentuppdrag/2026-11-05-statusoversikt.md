# Agentuppdrag: statusöversikt i frontenden

- **Ansvarig:** Nathalie
- **Datum:** 2026-11-05
- **Agent och verktyg:** Claude Code (Opus 5.5) i VS Code, med skillen `verifiera-mot-spec`
- **PR:** [#12](https://github.com/Ottowski/nors-kundportal-development/pull/12)

## Före

### Mål

Statusöversikten i [statusoversikt.md](../specs/statusoversikt.md) ska byggas och testas: SO-R1–SO-R5, SO-A1–SO-A6 och kvalitetskravet SO-K1. Översikten är en rad under rubriken "Alla ärenden" som visar antalet ärenden per status, till exempel Nytt 2, Pågående 1, Väntar på kund 0, Avslutat 1.

Specen är skriven och committad före koden. Här skrivs koden och testerna efter specen, inte tvärtom.

[A9-uppdraget](2026-11-04-a9-test.md#avvikelser-och-öppna-frågor) nämnde att dess tester inte visar att listan i App uppdateras efter en statusändring. Det finns redan ett test för det i `App.test.tsx` ("a status change in the panel is reflected by the list filter"). SO-A3 prövar samma sak för översikten.

### Kontext

- [CLAUDE.md](../../CLAUDE.md): regler och frontendens struktur.
- [statusoversikt.md](../specs/statusoversikt.md): hela specen. Den gäller, inte koden.
- R6 och statusarna i [kravspec.md](../specs/kravspec.md).
- `.claude/skills/verifiera-mot-spec/SKILL.md`, särskilt "Checklista för varje test". Skillen nämner bara A# och SF-A#, men checklistan gäller också SO-A#.
- `frontend/src/App.tsx` och `App.test.tsx`, `constants/arende.ts` (`STATUSAR`), `utils/filterArenden.ts` och dess test (mönster för en ren funktion), `components/StatusBadge.tsx` (stil), `components/ArendeDetail.test.tsx` (mönster för statusändring) och `src/mocks/handlers.ts` (bara läsas).

### Avgränsning

- **Får ändras:**
  - ny `frontend/src/utils/countByStatus.ts` och `countByStatus.test.ts`
  - ny `frontend/src/components/StatusOverview.tsx` och `StatusOverview.test.tsx`
  - `frontend/src/App.tsx`: import och en rad som visar översikten när listan är laddad
  - `frontend/src/App.test.tsx`: nya tester för SO-A3–SO-A6
  - `frontend/src/App.css`: nya regler för översikten, om det behövs
  - det här agentuppdraget
- **Får inte ändras:** befintliga tester, övrig produktionskod i `frontend/src/` (till exempel `SearchFilterBar.tsx`, `ArendeList.tsx`, `ArendeDetail.tsx`), mocken i `src/mocks/` och `src/test/setup.ts`, `backend/`, `docs/specs/`, `backend/.env` och `frontend/.env.local`. Inga nya beroenden.
- **Beteenden som inte får ändras:** listan, sökningen, filtren, formuläret och detaljvyn fungerar som förut. Översikten använder hela listan (`list.arenden`), inte den filtrerade (`visible`), enligt SO-R2.
- **Tillfälliga fel:** för att visa att ett test kan misslyckas behöver koden göra fel en kort stund. Fel i produktionskoden gör **jag** själv. Agenten föreslår exakt vilken ändring som ska prövas (fil, rad och ändring). Efteråt återställer jag ändringen direkt och kontrollerar med `git status` att inget ligger kvar. Fel som kan göras i själva testet, till exempel ett annat utgångsläge med `db.reset(...)`, får agenten göra.
- Om specen är oklar ändras den inte. Agenten listar det som en fråga, och jag beslutar.

### Faktiska behörigheter

Claude Code i VS Code på min dator. Agenten kan läsa och skriva filer i repot och köra skalkommandon, till exempel `npx vitest` och `npm run check` i `frontend/`.

`CLAUDE.md` förbjuder git-kommandon och åtkomst till `backend/.env` och `frontend/.env.local`. Verktyget stoppar inte det tekniskt, så den gränsen vilar på instruktionen. Jag kör alla git-kommandon själv, också `git status` och `git diff` för att kontrollera agentens ändringar.

Agenten planerar i Plan mode, där den inte kan ändra filer. Sedan arbetar den i läget där den frågar före varje ändring.

### Kontrollpunkter

Agenten stannar och väntar på mig:

1. Efter planen, innan någon fil ändras. Innan agenten börjar committar jag det här uppdraget, så att allt går att ångra.
2. Efter varje steg i planen (räknefunktionen, komponenten, App). Jag läser ändringen, kör testerna och committar innan nästa steg.
3. Innan en fil utanför listan "Får ändras" ändras.
4. När ett tillfälligt fel i produktionskoden behövs. Agenten beskriver ändringen, och jag gör den själv.
5. Om ett test inte kan bli grönt utan att mocken, specen eller befintliga tester ändras.
6. Innan arbetet rapporteras som klart, med de faktiska utskrifterna från testkörningarna.

### Klart när

- Varje SO-A1–SO-A6 och SO-K1 har minst ett test, och testnamnet börjar med id:t, till exempel `SO-A1: …`.
- Varje test har gåtts igenom med checklistan i skillen, med svar per punkt.
- Varje test kontrollerar utgångsläget innan handlingen, när specen anger ett.
- Varje test har setts bli **rött av rätt anledning** med ett tillfälligt fel: rätt `expect` misslyckas med väntat meddelande, inte en krasch av något annat. Minst:
  - **SO-A1:** rött när en status hoppas över eller räknas fel i `countByStatus.ts`.
  - **SO-A2:** rött när statusar med 0 ärenden inte visas.
  - **SO-A3 och SO-A4:** röda när översikten inte uppdateras efter en statusändring eller ett nytt ärende.
  - **SO-A5:** rött när `App.tsx` ger översikten `visible` i stället för `list.arenden`.
  - **SO-A6:** rött när översikten visas fast listan inte kunde hämtas.
  - **SO-K1:** rött när översikten saknar namnet "Antal ärenden per status", eller när statusnamn och siffra inte står ihop.
- Efter varje tillfälligt fel visar `git status` att inget ligger kvar.
- Befintliga tester är oförändrade och går igenom.
- `npm run check` i `frontend/` går igenom på min dator, och CI på PR:en är grön.
- `npm run dev:mock`: siffrorna stämmer med listan, ändras när en status ändras eller ett ärende skapas, och ändras inte av sökning och filter.
- Agentens slutrapport säger vad testerna **inte** visar.
- Jag har själv kört kontrollerna ovan och skrivit in resultaten under Verifiering.

### Instruktionen

> Du ska undersöka och planera ett avgränsat uppdrag i Kundserviceportalen NORS, på branchen statusoversikt. Ändra inga filer i det här steget.
>
> ## Läs först
>
> - docs/agentuppdrag/2026-11-05-statusoversikt.md: mål, avgränsning, kontrollpunkter och klart när
> - docs/specs/statusoversikt.md: hela specen
> - .claude/skills/verifiera-mot-spec/SKILL.md: checklistan gäller också SO-A#
> - frontend/src/App.tsx och App.test.tsx (där översikten ska visas och testas), constants/arende.ts (statusarna och deras ordning), utils/filterArenden.ts med test (mönster för en ren funktion och dess test), components/StatusBadge.tsx (hur status visas i dag), components/ArendeDetail.test.tsx (mönster för hur vi testar en statusändring och kontrollerar utgångsläget) och src/mocks/handlers.ts (hur testdatan sätts med db.reset, bara läsas)
>
> ## Avgränsning
>
> Bara filerna under "Får ändras" i agentuppdraget. Inte mocken, befintliga tester, backend eller specen. Inga nya beroenden.
>
> ## Det här vill jag ha tillbaka
>
> 1. En plan i små steg: räknefunktionen, komponenten, sedan App. Planen ska visa var du stannar och väntar på mig efter varje steg.
> 2. Minst två sätt att bygga räknefunktionen och komponenten, med för- och nackdelar. Märk ditt eget förslag som förslag. Att översikten räknar alla ärenden och inte bara de som syns är redan beslutat (SO-Q1) och ska inte väljas om.
> 3. För varje SO-A och SO-K1: vilket test, i vilken fil, vilka gränsfall testet prövar (till exempel inga ärenden, en status med noll ärenden eller alla ärenden med samma status), hur utgångsläget kontrolleras, vilket tillfälligt fel som ska göra testet rött, och vilket felmeddelande vi väntar oss då, så att vi ser att det blir rött av rätt anledning. Fel i produktionskoden gör jag själv, så beskriv dem exakt (fil, rad och ändring).
> 4. Vilka filer du ändrar, och vad du inte rör.
> 5. Vilka antaganden du gör och vad du behöver fråga mig om. Om något i specen är oklart: fråga, ändra inte specen. Säg till om ett befintligt test riskerar att bli rött, till exempel för att ett statusnamn nu syns två gånger på sidan, eller om testdatan inte räcker för att pröva specen.
>
> Stanna sedan och vänta tills jag har godkänt planen. Ändra inga filer förrän jag har sagt ja. Kör inga git-kommandon. När du är klar ska din rapport innehålla de faktiska utskrifterna från testkörningarna och vad testerna inte visar.

## Efter

### Plan och mitt beslut

Agenten planerade i Plan mode i en egen chatt, med mina egna filer stängda. Planen gav två sätt att bygga räknefunktionen (ett objekt eller en lista i specens ordning) och komponenten (`<ul>` eller `<dl>`). Agenten föreslog listan i båda fallen. Med `<ul>` kan testet hitta översikten på dess namn (SO-K1), vilket inte går med `<dl>`. För varje test angav den vilket tillfälligt fel som ska göra testet rött och vilket felmeddelande som väntas.

**Mina beslut**

- **Placering:** direkt under rubriken "Alla ärenden", som specen säger.
- **StatusBadge:** översikten använder samma märken som tabellen. Ett märke är bara text, så skärmläsaren läser "Nytt 2".
- **Två nya acceptanskriterier i specen före koden:** två planerade tester hette `SO-R1: …` och `SO-R5: …`. Testnamn ska börja med ett A-id, annars går de inte att spåra här. De prövade gränsfall som specen saknade exempel för, så jag lade till SO-A7 (listan laddas) och SO-A8 (alla ärenden har samma status).
- **SO-A8 också i App:** agenten ville bara pröva SO-A8 på räknefunktionen "som du bad om", vilket jag inte hade gjort. Specens handling är "öppnar listan" (punkt 1 i skillens checklista), så SO-A8 fick ett App-test också.
- **Fler tester i `App.test.tsx` än under "Får ändras":** SO-A1, SO-A2, SO-A7 och SO-A8, inte bara SO-A3–SO-A6. Bara App-testet kan visa listan.
- **Ändring under arbetet:** i steg 3 fick agenten göra felen i produktionskoden, utom P2, som jag gjorde själv eftersom det prövar mitt beslut i SO-Q1. Agenten visade varje ändring och utskrift, och jag kontrollerade med `git status` att allt var återställt.

**Plan**

| Steg | Innehåll                                                            | Commit                                                                     |
| ---- | ------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 1    | Räknefunktionen och dess test (SO-A1, SO-A2, SO-A8)                 | "Räkna ärenden per status"                                                 |
| 2    | Komponenten och dess test (SO-K1, SO-A1, SO-A2), regeln `.overview` | "Komponent för statusöversikt", "Test: tom statusöversikt ger tydlig diff" |
| 3    | En rad i `App.tsx`, tester SO-A1–SO-A8 i `App.test.tsx`             | `8d9e688` "Visa statusöversikten i appen"                                  |
| 4    | Slutrapport                                                         | –                                                                          |

### Granskning

- **Granskad av:** Nathalie, 2026-11-06, och Ruben i [granskningen av PR #12](https://github.com/Ottowski/nors-kundportal-development/pull/12), 2026-11-08. Ruben godkände PR:en. Han bekräftade att specen kom före koden och att koden följer SO-R1, SO-R2 och SO-R5. Han bedömde också att han kan bygga och kontrollera utifrån specen utan att fråga, och bockade av den sista punkten i specens checklista.
- **Vad jag hittade:**
  - Två gånger blev testerna röda av fel anledning. Vid fel 2 låg fel 1 kvar, eftersom jag inte hade kontrollerat med `git status`. Vid fel 3 blev ett mellanslag `{" "}` när filen sparades. Agenten läste felmeddelandena och såg det. Båda kördes om.
  - Vid fel 4 kraschade SO-A2 i en hjälpfunktion i stället för att bli rött på sin kontroll. Agenten sa att planen hade fel och bytte `getAllByRole` mot `queryAllByRole`.
  - Agenten upptäckte själv att kontrollen av länkar saknade ett tillfälligt fel, och lade till fel 5.
  - Agentens chatt stod en tid i läget "Edit automatically". Jag bytte till "Ask before edits" och kontrollerade med `git status` och `git diff` att bara det väntade hade ändrats.
  - P2 visade att SO-A5 är det enda testet som märker om översikten bara räknar de ärenden som syns (SO-R2).
- **Arbete utanför uppdraget som togs bort:** Inget. Agenten erbjöd sig att göra namnet "Antal ärenden per status" till en konstant i `App.test.tsx`. Jag sa nej, eftersom testerna redan var prövade.
- **Accepterat, ändrat eller avvisat, och varför:**
  - **Accepterat:** listan i specens ordning och `<ul>` med namn (kan testas på namnet), `queryAllByRole` (rätt kontroll blir röd), fel 5 och en liten marginal ovanför översikten (ser bra ut i appen).
  - **Ändrat:** testnamnen `SO-R1`/`SO-R5` blev SO-A7 och SO-A8 i specen, och SO-A8 fick ett App-test.
  - **Avvisat:** att ändra "Får ändras" i delen Före, som agentens slutrapport föreslog. Delen Före ska visa uppdraget som det var. Ändringarna står här.

### Verifiering

Felen i steg 1 och 2, och P2, gjorde jag själv. Efter varje fel återställde jag och kontrollerade med `git status`.

| Kommando                                                                                      | Resultat                                                                                                                                                                             | Datum      |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| `npx vitest run src/utils/countByStatus.test.ts`, fel a–c i `countByStatus.ts` (jag)          | a: alla tre röda, Avslutat saknas. b: SO-A1 och SO-A8 röda, SO-A2 grönt som väntat. c: alla tre röda, statusarna med 0 saknas                                                        | 2026-11-05 |
| `npx vitest run src/components/StatusOverview.test.tsx`, fel 1–5 i `StatusOverview.tsx` (jag) | 1: alla tre röda, listan saknar namn. 2: alla tre röda, 8 poster i stället för 4. 3: bara SO-A1 rött (knappar). 4: alla tre röda, nollorna saknas. 5: bara SO-A1 rött (länkar)       | 2026-11-06 |
| Fel i testet, `db.reset()` och utan `server.use` (agenten)                                    | Varje App-test rött på sin rad för utgångsläget                                                                                                                                      | 2026-11-06 |
| `npx vitest run`, P1 och P3–P6 (agenten)                                                      | P1: 7 röda, SO-A6 grönt. P3: SO-A6 och SO-A7 röda. P4: SO-A3 och SO-A4 röda, listan uppdaterades men inte översikten. P5 och P6: 10 röda                                             | 2026-11-06 |
| `npx vitest run`, P2 `arenden={visible}` i `App.tsx` (jag)                                    | Bara SO-A5 rött, rad 330: Nytt 0, Pågående 0, Avslutat 0 efter sökningen                                                                                                             | 2026-11-06 |
| `git status` efter sista felet                                                                | `working tree clean`                                                                                                                                                                 | 2026-11-06 |
| Jag: `npm run check` i `frontend/` på `8d9e688`                                               | 68 passed och bygget lyckades                                                                                                                                                        | 2026-11-06 |
| Jag: `npm run dev:mock`                                                                       | Översikten under rubriken. Siffrorna ändras direkt vid statusändring och nytt ärende, och inte vid sökning. Se [verifieringsplanen](../verifieringsplan.md#statusöversikten-i-appen) | 2026-11-06 |
| Ruben i granskningen, på `bcbb39a`: `npm run check` och stegen i "Statusöversikten i appen"   | Format, lint, typer och bygge gick igenom, 68 passed. Alla fyra stegen som förväntat, och siffrorna ändras inte heller av statusfiltret                                              | 2026-11-08 |

### Avvikelser och öppna frågor

- **Vad testerna inte visar:** att sidan inte laddas om (SO-R3, kontrollerat i appen i stället), hur en riktig skärmläsare läser översikten, att en siffra med `aria-hidden` skulle döljas, laddningen efter "Försök igen", och att frontend och backend fungerar ihop.
- **Förklarade men inte prövade kontroller:** i `App.test.tsx` raderna för "Inga ärenden ännu", "Inga ärenden matchar", att mocken sparar status, att formuläret sparar och att inget ärende ändras. Felet skulle ligga i kod vi inte fick ändra, och beteendet har egna tester.
- **Testerna jämför texten exakt.** Ett mellanslag sist i en post gör dem röda, fast en skärmläsare läser likadant. Jag valde att inte ändra det.
- **Märkena i översikten liknar knappar** men går inte att klicka på (SO-R4). Att filtrera genom att klicka står under "Ingår inte" i specen och är ett förslag på fortsatt utveckling.
- **Skillen `verifiera-mot-spec`** nämner bara A# och SF-A#. Checklistan fungerade ändå för SO-A#, eftersom instruktionen sa det.
