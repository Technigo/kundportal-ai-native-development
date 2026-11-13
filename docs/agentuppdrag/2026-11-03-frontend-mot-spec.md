# Agentuppdrag: Frontend – rätta frontend-v2 mot specen

- **Ansvarig:** Ruben & Nathalie
- **Datum:** 2026-11-03
- **Agent och verktyg:** Claude Code (Claude Opus 5.5) i VS Code, med skillen `verifiera-mot-spec`
- **PR:** [#7](https://github.com/Ottowski/nors-kundportal-development/pull/7)

## Före

### Mål

Frontenden på `frontend-v2` ska följa specen innan den läggs in i `main`, enligt "Kod som byggdes före specen" i [verifieringsplan.md](../verifieringsplan.md):

1. **Kärnflödet:** A1–A4, A6–A10 och A12 har varsitt test i frontenden som prövar det kriteriet kräver.
2. **Sökning och filtrering:** SF-A1–SF-A14 i [sok-filter.md](../specs/sok-filter.md) har varsitt test, och testnamnen börjar med `SF-A#`.
3. **Redigeringen tas bort** ur kod, tester och mockar, eftersom bara status får ändras ([beslut.md](../beslut.md), 2026-10-30).
4. **Mockarna svarar som backend**, enligt besluten i [backenduppdraget](2026-11-02-backend-status-och-varden.md): felmeddelanden, tillåtna värden och statusändringen.

### Kontext

- [CLAUDE.md](../../CLAUDE.md): regler och frontendens struktur.
- [kravspec.md](../specs/kravspec.md) och [sok-filter.md](../specs/sok-filter.md).
- [verifieringsplan.md](../verifieringsplan.md): de sex stegen och spårbarhetstabellen.
- [beslut.md](../beslut.md): besluten 2026-10-29 och 2026-10-30.
- "Plan och vårt beslut" i [backenduppdraget](2026-11-02-backend-status-och-varden.md): kontraktet för statusändringen och felmeddelandena.
- `.claude/skills/verifiera-mot-spec/SKILL.md` och `frontend/src/`.

### Avgränsning

- **Får ändras:** `frontend/` (kod, tester och mockar), i `docs/verifieringsplan.md` frontendens rader, texten ovanför spårbarhetstabellen, avsnitten Hur testerna körs, Manuella kontroller, Resultat och Begränsningar, frontendavsnitten i `CLAUDE.md`, och skillen och agentdefinitionen i `.claude/`.
- **Får inte ändras:** `backend/`, `docs/specs/`, övriga delar av `docs/` (även `docs/api/`), kontraktet för statusändringen, `backend/.env` och `frontend/.env.local`. Inga nya funktioner.
- **Ingår inte:** A5 och A11, som bara prövas i backend, och K1, som teamet kontrollerar manuellt.
- Om specen är oklar eller verkar fel ändras den inte. Agenten listar det som en fråga, och teamet beslutar.

### Faktiska behörigheter

Claude Code i VS Code, i auto-läge, på Rubens dator. Agenten kan:

- läsa och skriva filer i repot och köra skalkommandon,
- köra `npm run check` i `frontend/` (Node 24.22, npm 11.19) och `python -m pytest` i `backend/`.

CI kör `npm run check` med Node 22 på varje PR som ändrar `frontend/` (`.github/workflows/frontend.yml`).

`CLAUDE.md` förbjuder git-kommandon och åtkomst till `backend/.env` och `frontend/.env.local`. Det är inte prövat om verktyget stoppar dem tekniskt, så den gränsen vilar på instruktionen.

### Kontrollpunkter

Agenten stannar och väntar på teamet:

1. Efter planen, innan någon fil ändras.
2. Innan ett nytt beroende läggs till.
3. Före PR:en, med utfallet av `npm run check`. Teamet kör också `npm run check` och `python -m pytest` själva innan PR:en skapas.
4. Om ett test inte kan gå igenom utan att specen, backend eller kontraktet ändras.

### Klart när

- `npm run check` i `frontend/` går igenom, och `python -m pytest` i `backend/` går fortfarande igenom.
- Varje A# och SF-A# i målet har minst ett test vars namn börjar med id:t (`A2: …`, `SF-A1: …`) och som prövar utgångsläge, handling och förväntat resultat i specen.
- Varje sådant test har setts misslyckas när koden gjorde fel.
- Ingen redigering finns kvar: ingen `PUT /arenden/{id}` i mockarna, ingen flagga och inga tester för redigering.
- Mockarna ger samma felmeddelanden som besluten i backenduppdraget.
- `docs/verifieringsplan.md` visar testnamn, status och resultat för frontendens rader.
- Teamet har granskat ändringarna. Agenten kör inga git-kommandon.

### Instruktionen

> Du ska undersöka och planera ett avgränsat frontenduppdrag i Kundserviceportalen NORS, på branchen frontend-v2. Ändra inga filer i det här steget.
>
> ## Läs först
> - docs/agentuppdrag/2026-11-03-frontend-mot-spec.md: mål, avgränsning, kontrollpunkter och klart när för det här uppdraget
> - CLAUDE.md, docs/specs/kravspec.md och docs/specs/sok-filter.md
> - docs/verifieringsplan.md, särskilt "Kod som byggdes före specen" och spårbarhetstabellen
> - "Plan och vårt beslut" i docs/agentuppdrag/2026-11-02-backend-status-och-varden.md
> - .claude/skills/verifiera-mot-spec/SKILL.md
> - frontend/src/
>
> ## Det här vet vi redan
> Kontrollera varje punkt i koden. Säg till om något inte stämmer.
> - npm run check gick igenom 2026-11-02: 58 tester i 6 filer, och bygget lyckades.
> - Sökningens tester heter fortfarande A11–A16 (filterArenden.test.ts och App.test.tsx) och krockar med kärnspecens A11 och A12. Några har inget id alls.
> - Redigeringen finns kvar: isEditEnabled() i constants/features.ts, PUT /arenden/:id i mocks/handlers.ts och tester i App.test.tsx, App.disabledFeatures.test.tsx, ArendeForm.test.tsx, ArendeDetail.test.tsx och arendenApi.test.ts.
> - Verifieringsplanen saknar test för SF-A5, SF-A8, SF-A13 och SF-A14.
> - Mockarna skiljer sig från besluten i backenduppdraget: de svarar "Field required", kontrollerar inte kategori och prioritet, och ger 404 före 422 vid statusändring.
> - Kommentaren i constants/arende.ts säger att kategorier och prioriteter inte är beslutade. De beslutades 2026-10-30 (Q1 och Q2).
> - .claude/agents/frontend-developer.md pekar på docs/api/README.md för kontraktet, men den filen handlar om Postman. Skillen hänvisar till handlingsplan.md, som inte finns i repot.
> - A11 har bara nivån API i verifieringsplanen, men skillen nämner ett formulärtest för A11.
>
> ## Avgränsning
> Undersök bara. Följ avgränsningen i agentuppdraget. Föreslå inga nya funktioner.
>
> ## Det här vill jag ha tillbaka
> 1. Läget per A# och SF-A#: vilket test som hör till, om det prövar det kriteriet kräver, och om koden gör det specen säger.
> 2. Beslut som teamet behöver ta, med för- och nackdelar. Märk ditt eget förslag som förslag.
> 3. En plan i små steg. Ange vilka A# och SF-A# varje steg gör klara.
>
> Stanna sedan och vänta tills vi har godkänt planen. Ändra inga filer förrän vi har sagt ja.

## Efter

### Plan och vårt beslut

Planen godkändes 2026-11-03 utan ändringar. Teamet följde agentens förslag i alla fyra besluten.

**Beslut**

- **Mockarna:** de svarar med backendens beslutade texter, utan prefixet "Value error, ". Koden i `apiError.ts` som tar bort prefixet står kvar och får ett eget test, eftersom dagens backend skickar prefixet tills steg 2 i backenduppdraget är klart.
- **Id i testnamn:** id:t sitter bara på testet som prövar kriteriet. Andra tester får beskrivande namn och står kvar, till exempel `App`: A7 (layouten) och `App`: A8 (listfiltret efter en statusändring).
- **Tester utan id:** de står kvar, till exempel fokus på första ogiltiga fält, avstängd knapp under sparning och felmeddelande när API:t inte svarar.
- **A4 och A11:** A4 prövas också i komponenten, där testet visar hur backendens fel visas. A11 prövas bara i API:t, eftersom felet visas på samma sätt.

**Plan**

| Steg | Innehåll | Klart |
| ---- | -------- | ----- |
| 1 | `.claude/`: rätt hänvisningar i agentdefinitionen och skillen, och A11 bort ur skillens tabell | – |
| 2 | Redigeringen bort ur kod, mockar, tester och `CLAUDE.md`. Kolumnen Åtgärder försvinner, och testet för A6 får fyra kolumnrubriker | – |
| 3 | Mockarna efter backendbesluten, med testerna i `arendenApi.test.ts`. Inaktuella kommentarer i de filer som ändras | – |
| 4 | Kärnflödets tester mot specen: utgångsläge, alla fält och inget sparat vid fel | A1–A4, A6–A10, A12 |
| 5 | Sökningens tester: nya namn, specens söktexter och fyra nya tester | SF-A1–SF-A14 |
| 6 | Verifieringsplanen: testnamn, nivå och resultat. Sedan `npm run check` och `python -m pytest` | – |

Varje steg som ändrar ett test börjar med att testet ses misslyckas, vid behov med en tillfällig felaktig ändring i koden. Agenten stannar före PR:en.

### Granskning

- **Granskad av:** Nathalie, 2026-11-03, på `71c237b`.
- **Vad vi hittade:** Punkt 1–6 under Klart när stämmer.
  - Jag körde `npm run check` och `python -m pytest` själv: 54 passed och 3 passed.
  - Jag jämförde A2, A9 och A12 med kravspec.md som stickprov: de stämmer.
  - A9-testet blev rött när beskedet i `StatusSelect.tsx` stängdes av, och grönt igen när det kom tillbaka.
  - I appen (`npm run dev:mock`) finns ingen redigering, och statusändringen fungerar.
  - Mockens felmeddelanden är desamma som backendbesluten.
  - `git log` visar att agentens commits inte ändrade filer utanför avgränsningen.
  - Två svagheter i A9-testet: det kontrollerar inte att ärendet börjar med status Nytt, och kontrollen av datan går alltid igenom, eftersom den låtsade backenden inte ändrar något.
- **Arbete utanför uppdraget som togs bort:** `fil.md` och `handlingsplan.md`, arbetsanteckningar från före agenten.
- **Accepterat, ändrat eller avvisat, och varför:** Accepterat. Kontrollerna visar att frontenden följer specen inom uppdragets gränser. A9-svagheterna är förslag, inte krav. Två saker utanför PR:en tas upp separat:
  - `npm run check` misslyckas på Windows, eftersom filerna får CRLF-radslut. Förslaget om `.gitattributes` ligger som kommentar i PR:en.
  - `npm audit` visar 15 sårbarheter i beroendena.

### Verifiering

| Kommando | Resultat | Datum |
| -------- | -------- | ----- |
| Steg 2: `npx vitest run src/App.test.tsx -t "A6"` innan kolumnen Åtgärder togs bort | Misslyckades: listan hade fem kolumnrubriker, testet väntade fyra | 2026-11-03 |
| Steg 2: det nya testet "only status can be changed…" med en tillfällig knapp "Redigera" i detaljvyn | Misslyckades: knappen hittades | 2026-11-03 |
| Steg 2: `npm run check` i `frontend/` | Format, lint, typer och bygge gick igenom. 45 tester i 5 filer passerade (förut 58 i 6 filer: 14 tester för redigering togs bort, 1 regressionstest kom till) | 2026-11-03 |
| Steg 3: `npx vitest run src/api/arendenApi.test.ts` med de tre nya testerna för mockarna, före ändringen | Misslyckades: otillåten kategori och prioritet godtogs, saknat fält gav "Field required", och statusändring för okänt id gav 404 före 422 | 2026-11-03 |
| Steg 3: testet för prefixet "Value error, " med borttagningen tillfälligt avstängd i `apiError.ts` | Misslyckades: prefixet fanns kvar i beskedet | 2026-11-03 |
| Steg 3: `npm run check` i `frontend/` | Format, lint, typer och bygge gick igenom. 49 tester i 5 filer passerade | 2026-11-03 |
| Steg 4a: A2, A3 och A4 med formulärets egen kontroll och visningen av backendens fältfel tillfälligt avstängda | Alla tre misslyckades: inget besked visades | 2026-11-03 |
| Steg 4a: A1 med mocken tillfälligt ändrad till status Pågående, och sedan med listan utan skapad-tid | Misslyckades båda gångerna: fel status sparades, skapad-tiden syntes inte | 2026-11-03 |
| Steg 4a: `npm run check` i `frontend/` | Format, lint, typer och bygge gick igenom. 49 tester i 5 filer passerade | 2026-11-03 |
| Steg 4b: A6 med listan tillfälligt ändrad att visa kategori i kolumnen Prioritet | Misslyckades | 2026-11-03 |
| Steg 4b: A12 med sorteringen tillfälligt ändrad till id i stället för skapad-tid | Misslyckades: [3, 2, 1] i stället för [2, 1, 3]. Det gamla testet hade gått igenom, eftersom id och skapad-tid hade samma ordning i dess data | 2026-11-03 |
| Steg 4b: det nya testet för R6 (samma skapad-tid) med ordningen på id tillfälligt borttagen | Misslyckades: [1, 2] i stället för [2, 1] | 2026-11-03 |
| Steg 4b: `npm run check` i `frontend/` | Format, lint, typer och bygge gick igenom. 50 tester i 5 filer passerade | 2026-11-03 |
| Steg 4c: A7 med detaljvyn tillfälligt utan skapad-tid | Misslyckades | 2026-11-03 |
| Steg 4c: A8 med mocken tillfälligt ändrad så att statusändringen också ändrar prioriteten | Misslyckades: övriga fält var inte oförändrade | 2026-11-03 |
| Steg 4c: A9 med beskedet tillfälligt borttaget när statusen avvisas | Misslyckades: inget besked visades | 2026-11-03 |
| Steg 4c: A10 med backendens besked tillfälligt ersatt av ett allmänt fel | Misslyckades: "Ärendet hittades inte" visades inte | 2026-11-03 |
| Steg 4c: `npm run check` i `frontend/` | Format, lint, typer och bygge gick igenom. 50 tester i 5 filer passerade | 2026-11-03 |
| Steg 5a: `filterArenden.test.ts` med sex tillfälliga fel i `filterArenden.ts`, ett i taget: skiftläget spelar roll, bara rubriken genomsöks, bara hela ord hittas, träffarna sorteras på id, filtren ignoreras, mellanslag tas inte bort | Varje fel gav misslyckade tester, och varje SF-test i steget misslyckades minst en gång | 2026-11-03 |
| Steg 5a: `npm run check` i `frontend/` | Format, lint, typer och bygge gick igenom. 51 tester i 5 filer passerade | 2026-11-03 |
| Steg 5b: SF-A10 och SF-A12 med beskedet "Inga ärenden matchar" tillfälligt borttaget | Båda misslyckades | 2026-11-03 |
| Steg 5b: SF-A10 med en tom sökning som tillfälligt behöll den förra söktexten | Misslyckades: alla tre visades inte igen | 2026-11-03 |
| Steg 5b: SF-A13 med söktexten tillfälligt ändrad att gälla medan man skriver | Misslyckades: listan ändrades före Enter | 2026-11-03 |
| Steg 5b: SF-A14 med maxlängden på sökfältet tillfälligt borttagen | Misslyckades: fältet tog emot 101 tecken | 2026-11-03 |
| Steg 5b: `npm run check` i `frontend/` | Format, lint, typer och bygge gick igenom. 54 tester i 5 filer passerade | 2026-11-03 |
| Steg 6: `npm run check` i `frontend/` och `python -m pytest` i `backend/` | 54 passed i frontend, 3 passed i backend | 2026-11-03 |
| Steg 6: skript som jämför testnamnen i `docs/verifieringsplan.md` med testerna i koden | Alla namn i de 27 raderna finns i koden | 2026-11-03 |
| Steg 6, Ruben i vanlig terminal på `front-end-rebuild` (`60843cc`, bygger på `frontend-v2`): `npm run check` från `frontend/` och `python -m pytest` från `backend/` | 54 passed och bygget lyckades, 3 passed | 2026-11-03 |
| Granskning, Nathalie på `front-end-rebuild` (`71c237b`): `npm run check` från `frontend/` | Stoppade i format:check på grund av CRLF-radslut i Windows. `npx prettier --check . --end-of-line auto` gick igenom. Lint, typer, 54 passed och bygget gick igenom. `python -m pytest`: 3 passed | 2026-11-03 |
| Granskning, Nathalie: A9 med `setError` i `StatusSelect.tsx` tillfälligt avstängd | Misslyckades: inget besked visades. Grönt igen efter återställning, och `git status` var ren | 2026-11-03 |

### Avvikelser och öppna frågor

- **Mot den riktiga backend:** statusändringen fungerar först när steg 4 i backenduppdraget är klart. Tills dess visar appen "Not Found". Kategori, prioritet och felmeddelanden följer besluten först efter steg 2 och 3 där. Det står också under Begränsningar i verifieringsplanen.
- **Sex nya tester utan A#:** ett regressionstest för att inget går att redigera (steg 2), fyra tester för att mockarna följer backendbesluten (steg 3) och ett test för R6, samma skapad-tid (steg 4b). De prövar regler och beslut som inget acceptanskriterium täcker.
- **Manuella kontroller:** efter steg 6 lade agenten på teamets begäran till ett avsnitt i verifieringsplanen med stegen för två manuella kontroller: hela kedjan mot riktig backend och K1. Kursen kräver att manuella kontroller skiljs från automatiska och går att upprepa. Båda är planerade, och teamet gör dem.
- **Ansvarig i verifieringsplanen** fylldes i av agenten: Ruben för frontenddelarna och Otto för API-delarna som återstår. Teamet bekräftar.
- **Utanför uppdraget:** `docs/api/README.md` hänvisar till `kundportal-sdd` och till en `README.sv.md` som inte finns.
