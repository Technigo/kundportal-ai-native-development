# Agentuppdrag: Backend – statusändring och tillåtna värden

- **Ansvarig:** Ruben (planering och steg 1), Otto (steg 2–5)
- **Datum:** 2026-11-02
- **Agent och verktyg:** Claude Code (Claude Opus 5.5) i VS Code
- **PR:** steg 1: [#6](https://github.com/Ottowski/nors-kundportal-development/pull/6), steg 2–5: [#10](https://github.com/Ottowski/nors-kundportal-development/pull/10)

## Före

### Mål

Backend ska uppfylla kravspecen på tre punkter, utan nya funktioner:

1. **Statusändring:** R8 och R9, som prövas av A8 och A9. A8 prövar också R5: statusen finns kvar efter omstart.
2. **Tillåtna värden för kategori och prioritet:** R4, som prövas av A4 och A11.
3. **API-tester med pytest** för A1–A4 och A8–A11. Testnamnen börjar med id:t (`test_a1_...`, `test_a11_...`). Felfallen prövar också R12: beskedet är på svenska och innehåller ingen teknisk text.

A5 ska fortsätta gå igenom.

### Kontext

- [CLAUDE.md](../../CLAUDE.md): regler och lagren i backend.
- [kravspec.md](../specs/kravspec.md): "Ett ärende ska innehålla", R1–R12 och A1–A12.
- [spec-driven-dev.md](../specs/spec-driven-dev.md), [verifieringsplan.md](../verifieringsplan.md) och [beslut.md](../beslut.md).
- `backend/app/` och `backend/tests/test_omstart.py`.
- Frontendens kontrakt för statusändringen, bara för läsning: `frontend/src/api/arendenApi.ts`, `frontend/src/api/apiError.ts` och `frontend/src/mocks/handlers.ts` på `frontend-v2`. Samma anrop finns i mappen "Proposed" i `docs/api/kundportal.postman_collection.json`.

Kontraktet: `POST /arenden/{id}/status` med `{"status": "<värde>"}`. Svaret är 200 med hela ärendet, 404 med `{"detail": "Ärendet hittades inte"}` eller 422 i FastAPIs format, där `loc` slutar med `status` och `msg` är svensk text.

### Avgränsning

- **Får ändras:** `backend/` (kod, tester och `requirements.txt`), exemplet på `POST /arenden` i `README.md`, och i `docs/verifieringsplan.md` raderna för A1–A5 och A8–A11, texten ovanför spårbarhetstabellen, resultattabellen och avsnittet Begränsningar.
- **Får inte ändras:** `frontend/`, `docs/specs/`, övriga delar av `docs/` (även `docs/api/`), frontendens kontrakt för statusändringen, `backend/.env`, `frontend/.env.local` och databasen `backend/app/data/nors.db`. Inga tester får skriva i den databasen. Inga nya funktioner, till exempel redigering av andra fält, radering eller filtrering i backend.
- Om specen är oklar eller verkar fel ändras den inte. Agenten listar det som en fråga, och teamet beslutar.

### Faktiska behörigheter

Claude Code i VS Code, i auto-läge. Under planeringen 2026-11-02 kunde agenten:

- läsa och skriva filer i repot och köra skalkommandon,
- köra `python -m pytest` med `backend/.venv` (Python 3.12, FastAPI 0.162, Pydantic 2.14, pytest 9.2; httpx är inte installerat),
- starta uvicorn på lokala portar mot en temporär databas utanför repot.

Agentens skalkommandon körs i Claude Codes sandlåda. Där varierade serverstarten:

- **Vid de första körningarna:** 27–38 s per start, så A5 gick inte igenom med gränsen 15 s.
- **Vid körningarna i steg 1:** under 1 s per start.

I en vanlig terminal på samma dator tog A5 4,1 s för två starter. Varför starterna ibland var långsamma är inte utrett.

`CLAUDE.md` förbjuder git-kommandon och åtkomst till `backend/.env` och `frontend/.env.local`. Det är inte prövat om verktyget stoppar dem tekniskt, så den gränsen vilar på instruktionen. Att installera paket kräver nätverk och ändrar `.venv`; det är inte heller prövat. Under planeringen begränsade instruktionen agenten till att läsa och skriva det här utkastet.

**Steg 2–5 (Otto):** Copilot SDK i VS Code på Windows (PowerShell). Agenten kan läsa och skriva filer i repot, köra skalkommandon och starta lokala servrar. Kontrollerat 2026-11-04 med `backend/.venv`: Python 3.11.0, FastAPI 0.162.0, Pydantic 2.14.2 och pytest 9.2.0; httpx är inte installerat. Förbudet mot git-kommandon och mot `backend/.env` och `frontend/.env.local` vilar på instruktionen i `CLAUDE.md`; det är inte prövat om verktyget stoppar dem tekniskt. Att installera paket är inte prövat.

### Kontrollpunkter

Agenten stannar och väntar på teamet:

1. Efter planen, innan någon kod skrivs.
2. Innan ett nytt beroende läggs till i `requirements.txt` eller installeras i `.venv`.
3. Före PR:en, med testutfallet. Teamet kör också `python -m pytest` i en vanlig terminal innan PR:en skapas. Steg 1 granskades direkt efter steget.
4. Om ett test inte kan gå igenom utan att `frontend/`, specen eller kontraktet ändras.
5. Om A5 misslyckas av något annat skäl än uppdragets ändringar, till exempel för att servern startar långsamt.

### Klart när

- `python -m pytest` från `backend/` går igenom, med minst ett test per A1, A2, A3, A4, A8, A9, A10 och A11, och A5 går fortfarande igenom.
- Testnamnen börjar med id:t.
- Varje nytt test har setts misslyckas, före koden eller med en tillfällig ändring.
- Felfallen kontrollerar att beskedet är på svenska och saknar teknisk text, till exempel engelska texter från Pydantic, prefixet "Value error" och Python-listor.
- Inget test skriver i `backend/app/data/nors.db`.
- README:s exempel använder tillåtna värden.
- `docs/verifieringsplan.md` visar testnamnen och resultatet för A1–A5 och A8–A11.
- Teamet har granskat ändringarna. Agenten kör inga git-kommandon.

### Instruktionen

> Du ska undersöka och planera ett avgränsat backenduppdrag i Kundserviceportalen NORS. Ändra ingen kod i det här steget.
>
> ## Mål
> Ta fram en plan för att backend ska uppfylla kravspecen på tre punkter:
> 1. Statusändring: R8 och R9, som prövas av A8 och A9.
> 2. Tillåtna värden för kategori och prioritet: R4, som prövas av A4 och A11.
> 3. API-tester med pytest för A1–A4 och A8–A11. Testnamnen börjar med id:t (test_a1_..., test_a11_...). Felfallen ska också pröva R12: beskedet är på svenska och innehåller ingen teknisk text.
>
> Uppdraget som planeras är klart när `python -m pytest` från backend/ går igenom med minst ett test per A# ovan, felfallen ger svenska besked utan teknisk text och docs/verifieringsplan.md visar resultatet.
>
> ## Läs först
> - CLAUDE.md: regler (inga git-kommandon, inga hemliga filer) och lagren i backend
> - docs/specs/kravspec.md: "Ett ärende ska innehålla", R1–R12 och A1–A12
> - docs/specs/spec-driven-dev.md och docs/mallar/agentuppdrag.md
> - docs/verifieringsplan.md och docs/beslut.md
> - backend/app/ och backend/tests/test_omstart.py
>
> ## Det här vet vi redan
> Kontrollera varje punkt i koden. Säg till om något inte stämmer.
> - Backend har POST /arenden, GET /arenden och GET /arenden/{id}. Det finns ingen endpoint för att ändra status, och repositoryts kontrakt saknar en metod för det, både i minnes- och SQLite-versionen.
> - TILLATNA_KATEGORIER och TILLATNA_PRIORITETER i backend/app/schemas/arende.py är tomma, så backend godtar i dag vilket värde som helst.
> - Frontenden på branchen frontend-v2 anropar redan statusändringen så här, och mockarna där följer samma kontrakt:
>   - POST /arenden/{id}/status med body {"status": "<värde>"}
>   - 200 med hela det uppdaterade ärendet
>   - 404 med {"detail": "Ärendet hittades inte"}, samma text som GET /arenden/{id} redan ger
>   - 422 i FastAPIs format, där loc slutar med "status" och msg är svensk text, till exempel "Ogiltig status"
>   Frontenden visar msg-texten vid fältet och tar bort Pydantics prefix "Value error, ".
> - Pydantics egna felmeddelanden är på engelska, till exempel "Field required". Det krockar med R12.
> - Felmeddelandet för ogiltig kategori och prioritet skriver ut en Python-lista. Bedöm om det räknas som teknisk text enligt R12.
> - test_omstart.py (A5) skickar kategorin "Faktura", som inte finns bland specens värden. Testnamnet börjar inte heller med test_a5_.
> - README:s exempel använder "Support" och "Normal", som inte heller är tillåtna värden.
> - requirements.txt har fastapi, uvicorn[standard] och pytest. FastAPI:s TestClient kräver httpx, som inte finns där.
>
> ## Avgränsning
> - Undersök bara. Skapa eller ändra inga filer utom utkastet till agentuppdraget (punkt 4 nedan).
> - Uppdraget som planeras får omfatta backend/, backend/tests/, exemplet i README och raderna för A1–A5 och A8–A11 i docs/verifieringsplan.md. Det omfattar inte frontend/ och inte specarna.
> - Om specen är oklar eller verkar fel: ändra den inte, utan lista det som en fråga.
> - Föreslå inga nya funktioner.
>
> ## Det här vill jag ha tillbaka
> 1. Läget för statusändring, tillåtna värden och tester: vad som finns, vad som saknas och vilka risker du ser.
> 2. Beslut som teamet behöver ta, med för- och nackdelar. Märk ditt eget förslag som förslag. Minst de här:
>    - Följer vi frontendens kontrakt för statusändringen, eller finns det skäl att ändra det?
>    - Hur får vi svenska felmeddelanden utan teknisk text, även när Pydantic själv avvisar indata?
>    - Ska de tillåtna värdena också kontrolleras med CHECK i SQLite? Tänk på att CREATE TABLE IF NOT EXISTS inte ändrar en befintlig databasfil.
>    - Hur ska testerna köras: med TestClient (kräver httpx) eller mot en riktig server som i test_omstart.py? Hur får varje test en egen databas?
> 3. En plan i små steg som går att granska var för sig. Ange vilket A# varje steg gör grönt.
> 4. Ett utkast till agentuppdraget i docs/agentuppdrag/2026-11-02-backend-status-och-varden.md, enligt docs/mallar/agentuppdrag.md. Fyll bara i delen "Före": mål, kontext, avgränsning, faktiska behörigheter, kontrollpunkter och klart när. Klistra in den här prompten under "Instruktionen" och lämna "Efter" tom.
>
> Stanna sedan och vänta tills vi har godkänt planen. Skriv ingen kod förrän vi har sagt ja.

**Steg 2–5 (Otto):** Följ planen och besluten under "Efter", steg 2–5, i den ordningen. Stanna vid kontrollpunkterna ovan och ändra ingen kod förrän teamet har sagt ja till planen. Börja varje steg med ett test som misslyckas, eller med en tillfällig ändring när koden redan fungerar. Följ frontendens kontrakt `POST /arenden/{id}/status` och lägg inga nya funktioner till. Kör inga git-kommandon.

## Efter

### Plan och vårt beslut

Planen godkändes 2026-11-02 efter två ändringar från teamet. Testerna körs mot en riktig server i stället för med FastAPIs TestClient, och felhanteringen förenklades.

**Beslut**

- **Statusändring:** frontendens kontrakt följs som det är. FastAPI kontrollerar body före id, så ett okänt id med en ogiltig status ger 422, inte 404 som i mocken.
- **Svenska besked:** en felhanterare för `RequestValidationError` i en egen modul, registrerad med en rad i `main.py`. Den behåller formatet `{"detail": [{"type", "loc", "msg"}]}` och har tre regler:
  - prefixet "Value error, " tas bort,
  - "Field required" blir "Måste fyllas i",
  - övriga engelska texter blir "Ogiltigt värde".
- **Texter i schemat:** egna regler och deras texter står i schemat.
  - Tom rubrik eller beskrivning: "Får inte vara tomt eller bara mellanslag".
  - Kategori: "Ogiltig kategori. Välj Fakturering, Teknik, Leverans eller Övrigt."
  - Prioritet: "Ogiltig prioritet. Välj Låg, Medel eller Hög."
  - Status: "Ogiltig status".

  Kategori, prioritet och status ger sin egen text för alla felaktiga värden, även `null` och tal. De tillåtna värdena står i specens ordning, och kontrollen kan inte stängas av med en tom lista.
- **CHECK i SQLite:** ingen CHECK för kategori och prioritet; schemat är enda regeln. Status behåller sin CHECK.
- **Testerna:** de körs mot en riktig server som A5, utan nytt beroende. Varje test startar en egen server mot en egen databas i `tmp_path`. Det blir ett test per A#, med fallen samlade i testet. Gränsfall prövas bara där specen nämner dem: bara mellanslag (A3) och fel skiftläge (A4, A11). `STARTTID_SEKUNDER` höjs från 15 till 60, eftersom starten ibland tog upp till 38 s i agentens sandlåda (se Faktiska behörigheter). Gränsen kostar bara tid när servern inte svarar.
- **Verifieringsplanen:**
  - Testnamnen läggs in i kolumnen Test, och "API: passerade <datum>" i Senaste resultat.
  - Rader med en komponentdel behåller status Planerad tills den delen är klar. A5 och A11 blir Genomförd.
- **Branch:** förslaget är en egen branch från `main`. Teamet sköter git.

**Plan**

| Steg | Innehåll | Grönt |
| ---- | -------- | ----- |
| 1 | Testgrund: `kor_server` och `_anrop` flyttas från `test_omstart.py` till en gemensam fil i `tests/`. `_anrop` returnerar svaret även vid 4xx. Gränsen blir 60 s. A5-testet får namnet `test_a5_…` och kategorin "Fakturering". Nya tester för det som redan fungerar. Ingen produktionskod. | A1, A5, A10 (hämta) |
| 2 | Tester för A2 (rubrik saknas eller är tom) och A3 (bara mellanslag). Sedan felhanteraren. | A2, A3 |
| 3 | Tester för A4 och A11. Sedan de tillåtna värdena och texterna. README-exemplet får "Teknik" och "Medel". | A4, A11 |
| 4 | Tester för A8 (ändra status, starta om, övriga fält oförändrade), A9 (ogiltig status avvisas och den gamla statusen ligger kvar) och A10 (statusändring för ett okänt id ger 404). Sedan schemat, `update_status` i kontraktet och i båda repositoryn samtidigt, och endpointen. | A8, A9, A10 |
| 5 | Verifieringsplanen enligt besluten. | – |

Varje steg börjar med ett test som misslyckas, eller med en tillfällig ändring när koden redan fungerar. Agenten stannar vid kontrollpunkterna.

**Överlämning efter steg 1.** Steg 1 läggs in i `main` med en egen PR, så att arbetet på `frontend-v2` kan pågå samtidigt. Otto tar över steg 2–5 på en ny branch från `main`. Innan han börjar:

- läser han besluten ovan och säger till om något behöver ändras,
- fyller han i sina egna behörigheter under Faktiska behörigheter, eftersom de som står där gäller Rubens miljö,
- lägger han in instruktionen för steg 2–5 under Instruktionen.

Arbetet på `frontend-v2` ändrar också raderna för A1–A4 och A8–A10 i `docs/verifieringsplan.md`, så de kan krocka vid merge. Den som lägger in sin branch i `main` sist löser krocken.

**Frågor om specen.** Specen ändras inte. Tills teamet säger annat gäller förslagen:

- **R12:** Vilken del av API-svaret är beskedet? Förslag: `detail` när det är text, och varje `msg` när det är en lista.
- **A2:** Betyder "utan rubrik" att fältet saknas, att det är tomt, eller båda? Förslag: båda.
- **R2:** Kravet gäller också beskrivningen, men inget A# prövar den.
- **Inledande och avslutande mellanslag:** backend tar bort dem när rubrik och beskrivning sparas, men specen säger inget om det. Förslag: det testas inte förrän teamet har bestämt.

### Granskning

**Steg 1**

- **Granskad av:**
- **Vad vi hittade:**
- **Arbete utanför uppdraget som togs bort:**
- **Accepterat, ändrat eller avvisat, och varför:**

**Steg 2–5**

- **Granskad av:** Sravani, två gånger: på `d14df76` och på `0ae922b`. Ruben, 2026-11-08 (Ottos rättningar i `558ff8d`) och 2026-11-09. Se vecka 7 och 8 i [veckostatus](../veckostatus.md).
- **Vad vi hittade:**
  - **Sravani, första gången (`d14df76`):** 10 passed. Det hon påpekade var rättat till andra gången:
    - Mycket stora id ger nu 404 på svenska, både för hämtning och statusändring.
    - `update_status` läser ärendet före commit, på samma anslutning. 400 samtidiga statusändringar fick alla tillbaka den status de bad om.
    - `nors.db` ligger inte längre i repot, och PR-titeln nämner inte längre PUT.
  - **Sravani, andra gången (`0ae922b`):** 12 passed, och Newman 20 av 20 i mapparna Health och Ärenden. Frontenden kontrollerades inte, eftersom PR:en inte ändrar den.
    - Att rätta före merge:
      - "Edit case" i Postman hade bytt från PUT till POST och gav 405.
      - Raderna för A8 och A9 i verifieringsplanen hade skrivits över av misstag: "Nathalie (komponent)" och 2026-11-04 hade blivit "Ruben (komponent)" och 2026-11-03.
      - PR-beskrivningen var tom.
    - Att rätta nu eller senare:
      - "Method Not Allowed" och "Not Found" var på engelska (R12).
      - Ett ensamt Unicode-surrogat gav 500 i stället för 422 på svenska.
      - Gamla rader med värden som inte längre är tillåtna returneras som de är.
      - A8 och A9 låg kvar under "Proposed" i Postman. `docs/api/README.md` och kommentarerna i `arendenApi.ts` och `handlers.ts` var inaktuella, och README:n länkade till `README.sv.md`, som inte finns.
      - Begränsningar i verifieringsplanen sa att A2–A4, A8, A9 och A11 väntade på API-tester.
      - Minneslagringens `update_status` saknade test.
      - Testerna `…_avvisas_och_inget_sparas` krävde exakt två sparade ärenden.
      - `giltig_kategori` och `giltig_prioritet` kunde dela en hjälpfunktion, och några kommentarer låg på fel ställe.
    - En varning till teamet: eftersom `nors.db` har tagits bort ur repot kan en `git pull` ta bort den lokala filen. Appen skapar en tom databas nästa gång den startar.
  - **Ruben, 2026-11-08:** testerna gick igenom. Allt som skulle rättas före merge var rättat. Det mesta av det som kunde vänta var också rättat:
    - 405 och 404 ger svensk text, och ett ensamt surrogat ger 422 på svenska, båda med test.
    - A8 och A9 ligger i mappen Ärenden i Postman, och README:n, kommentarerna och den döda länken är rättade.
    - Minneslagringen har ett test för `update_status`, och `…_avvisas_och_inget_sparas` jämför antalet före och efter.
    - Valideringen delar en hjälpfunktion, och kommentarerna ligger rätt.

    Kvar: verifieringsplanen sa fortfarande att A2–A4, A8, A9 och A11 väntade på API-tester. De fyra nya testerna stod inte i planen, och inget av dem började med ett A-id. Minneslagringens test prövar A8 och kunde heta `test_a8_…`. R12-testerna har inget A# i specen.
  - **Ruben, 2026-11-09:** `python -m pytest` gav 16 passed efter merge av `main`.
- **Arbete utanför uppdraget som togs bort:** PUT för statusändringen, som byttes mot POST, se Ändrat. Inget annat togs bort.
- **Accepterat, ändrat eller avvisat, och varför:**
  - **Ändrat (Otto):** statusändringen byggdes först med PUT. Efter ett beslut i gruppen bytte Otto till POST, som i frontendens kontrakt (`POST /arenden/{id}/status`, se Kontext).
  - **Ändrat (Otto, `558ff8d`):** allt som skulle rättas före merge, och de punkter som Ruben bockade av 2026-11-08.
  - **Ändrat (Ruben, 2026-11-09):** konflikten med `main` löstes. Verifieringsplanen rättades och fick de nya testerna, och minneslagringens test döptes om till `test_a8_…`, så att namnet börjar med id:t. Beslutet om `nors.db` skrevs in i [beslut.md](../beslut.md). Se commits `1a56c78`, `46d5cb6` och `07c0f41`.
  - **Accepterat:** gamla rader med otillåtna värden returneras som de är. Det följer beslutet att inte ha någon CHECK för kategori och prioritet, se [Plan och vårt beslut](#plan-och-vårt-beslut). R12-testerna står i verifieringsplanen utan A#, eftersom specen inte har något A# för dem.
  - **Godkänt:** Ruben godkände PR:en, och Otto mergade den.

### Verifiering

Tabellen visar agentens egna körningar i sandlådan. Teamets körningar i en vanlig terminal läggs till vid varje kontrollpunkt.

| Kommando | Resultat | Datum |
| -------- | -------- | ----- |
| Steg 1: `python -m pytest -v` från `backend/` | 3 passed (A1, A5, A10) på 4,4 s | 2026-11-02 |
| Steg 1: A1 och A10 mot en ändrad kopia av backend (status Pågående i stället för Nytt, tom lista, engelskt besked vid 404) | Varje ändring gav ett misslyckat test | 2026-11-02 |
| Steg 1, Ruben i vanlig terminal på `backend-steg-1` (utgår från `main`): `python -m pytest -v` från `backend/` | 3 passed (A1, A5, A10) | 2026-11-02 |
| Steg 2–5, lokal körning med projektets venv: `.venv\Scripts\python.exe -m pytest -v` från `backend/` | 10 passed (A1–A5, A8–A11) på 40,17 s | 2026-11-05 |
| PR-rättningar, lokal körning med projektets venv: `.venv\Scripts\python.exe -m pytest -v` från `backend/` | 12 passed, inklusive tester för stora id och samtidiga statusändringar, på 42,84 s | 2026-11-06 |

### Avvikelser och öppna frågor

Utanför uppdraget, att följa upp. Läget 2026-11-10 står efter varje punkt.

- **Mockarna:** `frontend/src/mocks/handlers.ts` kontrollerar inte kategori och prioritet, svarar "Field required" och ger 404 före 422 för statusändringen. Efter uppdraget skiljer de sig från backend.
  - ✅ **Löst** i steg 3 i [frontenduppdraget](2026-11-03-frontend-mot-spec.md) ([PR #7](https://github.com/Ottowski/nors-kundportal-development/pull/7)). Mocken kontrollerar kategori och prioritet med backendens texter, svarar "Måste fyllas i" och ger 422 före 404. Testerna i `frontend/src/api/arendenApi.test.ts` prövar det.
- **Postman-samlingen:** samlingen i `docs/api/` hänvisar till den gamla specen och innehåller anrop som specen inte har. Mappen "Proposed" blir inaktuell när statusändringen finns.
  - 🔄 **Delvis löst.** `docs/api/README.md` hänvisar nu till kravspecen och `sok-filter.md`. A8 och A9 ligger i mappen "Ärenden", och mappen "Proposed" heter nu "Not implemented in backend" och körs inte. Kvar: den mappen innehåller fortfarande anrop som specen inte har, nämligen redigering, radering och "A17", ett id som inte finns i kravspecen.
- **Starlettes egna svar:** svaren vid fel adress eller metod ("Not Found", "Method Not Allowed") är på engelska. Frontenden når dem inte.
  - ✅ **Löst.** `backend/app/main.py` svarar "Sidan hittades inte" och "Metoden är inte tillåten". `test_r12_http_fel_for_metod_och_sokvag_ar_pa_svenska` prövar det, se [verifieringsplan.md](../verifieringsplan.md).
- **Lokala databasfiler:** de kan innehålla otillåtna värden. `nors.db` på datorn där planen gjordes har en rad med kategorin och prioriteten "test".
  - ✅ **Hanterat** genom beslutet 2026-11-09 i [beslut.md](../beslut.md): `nors.db` ligger inte i repot, och var och en har en egen fil. Gamla värden visas som de är (`test_legacy_varden_returneras_oforandrade`), men nya ärenden kan bara få tillåtna värden. Den som vill börja om raderar filen. Står också i [begransningar.md](../begransningar.md).
