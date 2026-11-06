# Kända begränsningar, risker och förslag på vidareutveckling

> Utkast 2026-11-04 · Samordnare: Azalea (KSP-61) · Var och en skriver punkterna för sin del.
> Id förklaras kort: **KSP-xx** är ärenden i Linear, **CORE-xx** kraven för kärnan
> ([SPEC-karna.md](specs/SPEC-karna.md)) och **HIST-xx** kraven för statuslogik och historik
> ([SPEC-arendehistorik.md](specs/SPEC-arendehistorik.md)).

Examinationen kräver "kända begränsningar, risker och förslag på fortsatt utveckling" i gruppens
underlag. Här samlas det som tidigare stod utspritt i specarna, ADR:erna och veckostatusen.

## 1. Kända begränsningar

### Lösningen som helhet

| Begränsning | Varför | Var det står |
| --- | --- | --- |
| Ingen inloggning, så historiken visar inte vem som gjorde en ändring | Uppgiften har ingen inloggning | HIST-specen, avsnittet om vad som inte ingår |
| Bara lokal körning, med en SQLite-fil i `backend/data/app.db` | Uppgiften kräver ingen driftsättning | [README](../README.md) |
| Historikposter kan inte redigeras eller raderas | Historiken ska gå att lita på, så den är oföränderlig | HIST-specen, [ADR-001](decisions/ADR-001-atomicitet-status-och-historik.md) |
| Ingen sökning eller filtrering i listan, bara nyaste först | Utanför kärnan. Det var tänkt som Amalias tilläggsfunktion med egen spec | CORE-specen, tabellen över vad som ingår |

### Backend (Azalea)

| Begränsning | Följd | Var det står |
| --- | --- | --- |
| Databasfel som ger 503 (HIST-09, historikposten kunde inte sparas) loggas inte. Orsaken sparas i felkedjan men skrivs aldrig ut | Den som felsöker ser bara 503, inte varför | [Agentuppdraget KSP-36](ai/agentuppdrag/KSP-36.md), misstag 4 i [misstagsloggen](ai/misstag-azalea.md) |
| FastAPI:s engelska 422-schema (`HTTPValidationError`, "Validation Error") står kvar i `/openapi.json`, fast API:t svarar på svenska | Den som läser `/docs` ser engelska felbeskrivningar. Att ta bort dem hade ändrat kontraktet som frontendens typer genereras från | Rapporterat i agentuppdraget för KSP-21 (svenskt felformat), kontrollerat 2026-11-04 |
| Status och historik är bara atomiska så länge all skrivning går via `TicketService` | Kod som skriver direkt i databasen kan skapa otakt | [ADR-001](decisions/ADR-001-atomicitet-status-och-historik.md), regeln i [AGENTS.md](../AGENTS.md) |

### Frontend (Mustafa och Amalia)

| Begränsning | Följd | Var det står |
| --- | --- | --- |
| Tidslinjen i detaljvyn (HIST-05) är inte klar. Felmeddelandena i UI (UI-delen av HIST-14) är klara i PR #107 (felmeddelanden i UI) | Historiken syns inte i gränssnittet | KSP-37, KSP-38, [veckostatus V7](status/vecka-7.md) |
| Kontrasten kontrolleras inte automatiskt, eftersom jest-axe i jsdom inte kan räkna ut färger (Amalia) | Kontrasten kontrolleras bara för hand. Vit text i felmeddelandena hade kontrasten 3.78 (kravet är 4.5), och det upptäcktes vid kontrollen för hand | [Verifieringsplanen](verifiering.md), kontroll för hand. PR #107 |
| Temat och `native-select` är ändrade lokalt efter installationen från BOLDkit: `--destructive-foreground` är svart i stället för vitt, och `native-select` kortar för lång text med "…" (Amalia) | Installeras Purple-preseten eller `native-select` igen försvinner ändringarna, och vit text på rött får kontrasten 3.78 igen | Kommentaren i `frontend/src/styles/globals.css`. PR #107 (felmeddelanden i UI) och PR #102 (sök och filter) |
| Engelska standardtexter i BOLDkits `data-table.tsx`, till exempel "Rows per page" och "Page … of …" (Amalia) | Syns inte i dag, eftersom sortering, filter och sidbyte är avstängda, men kommer med om någon slår på dem | Granskningarna av PR #102 |
| Långa beskrivningar ger mycket långa rader på bred skärm i detaljvyn, med samma maxbredd som listan (Amalia) | Svårare att läsa en lång beskrivning. Bedömt som tillräckligt för projektets storlek | Granskningen av PR #104 (samma maxbredd) |
| *(fylls i av Mustafa)* | | |

### Vad testerna inte visar (Azalea, Nicklas)

| Begränsning | Följd | Var det står |
| --- | --- | --- |
| En saknad `rollback` syns inte över HTTP, eftersom varje begäran får en egen session som stängs | Bara testerna på tjänstenivå skyddar mot det (HIST-09, HIST-10) | `test_atomicity.py`, [verifieringsplanen](verifiering.md) avsnitt 5, K1 |
| `commit` borttagen i statusbytet (M3b) fångas av ett enda omstartstest | Om det testet ändras kan felet passera | `test_restart.py`, verifieringsplanen avsnitt 5 |
| Invarianten (senaste posten är ärendets status) fångar otakt, men inte att både status och post försvann | Den behöver omstartstesterna bredvid sig | [ADR-001](decisions/ADR-001-atomicitet-status-och-historik.md) |
| Ordningen vid samma tidpunkt (HIST-11) skyddas av ett enda test, det enda med fast klocka | Nicklas korsvisa mutation fångades bara av det | Verifieringsplanen avsnitt 5, steg 2 |
| Mutationerna är gjorda för hand och är få | Fler små fel i jämförelser och gränser är inte prövade | [Teststrategin](teststrategi.md) avsnitt 3 |
| CORE-testerna är mutationsprövade bara för CORE-02, 11, 12, 16, 17 och 18 (N1–N7). CORE-01, 03–10 och 13–15 är inte prövade med någon mutation | För de kraven vet vi att testerna är gröna, men inte att de faller om koden blir fel | [Verifieringsplanen](verifiering.md) avsnitt 5, [agentuppdraget KSP-44](ai/agentuppdrag/KSP-44.md) |
| Att ärendet finns kvar efter omstart (CORE-02) prövas av ett enda CORE-test, `test_core02_ticket_survives_restart`. N7 (sparningen bortkopplad) fångades av 33 tester, men de flesta föll för att nästa begäran inte hittade ärendet, inte på omstarten | Ett fel som bara syns vid omstart, till exempel att databasfilen inte läses från konfigurationen, ser bara det testet och omstartstesterna för HIST-04 | Verifieringsplanen avsnitt 5, N7 |
| Vid N7 föll statustesterna redan när ärendet skulle förberedas, inte på sina egna krav (HIST-06, HIST-07) | Ett rött test prövar inte alltid det det ska pröva. Felraderna måste läsas, inte bara antalet röda | [Agentuppdraget KSP-44](ai/agentuppdrag/KSP-44.md), Min granskning |

## 2. Risker

| Risk | Sannolikhet | Konsekvens | Hantering |
| --- | --- | --- | --- |
| Status och historik hamnar i otakt | Låg | Hög: tidslinjen visar något annat än ärendet | En transaktion i `TicketService`, rollback vid alla fel, invarianten efter varje scenario och tester med framkallat fel (ADR-001, HIST-09, HIST-10) |
| En PR mergas med röda tester | Låg | Medel | CI kör backend och frontend på varje PR, och rulesetet för `main` kräver att båda kontrollerna är gröna före merge (KSP-17, CI för backend). Kvar: ett krav som saknar test fångas inte av CI |
| AI:s påståenden tas för sanna utan kontroll | Medel | Medel till hög: fel test eller fel förklaring | Tester före koden, mutationer, och regler i misstagsloggarna efter en människas ja ([arbetssättet](ai/arbetssatt.md)) |
| Ett godkännande gäller inte längre efter nya commits | Medel | Medel: kod mergas utan granskning | Granskaren godkänner igen efter nya commits (hände med PR #56 och #81) |
| *(fylls i av övriga)* | | | |

## 3. Förslag på vidareutveckling

| Förslag | Varför | Hur det kan byggas |
| --- | --- | --- |
| Interna anteckningar och tilldelning av ärenden | Vanliga behov i kundservice | `event_type` är öppen, så nya händelser kan läggas till utan att ändra de gamla (HIST-specen, avsnitt 13). Varje utökning får egen spec |
| Inloggning, så att historiken visar vem som ändrade | Spårbarhet | En användare per handläggare och ett fält i historikposten |
| Loggning av databasfel vid 503 | Felsökning | Logga `__cause__` där vägen fångar `StatusNotSaved` (`backend/app/api/tickets.py`) |
| Sökning och filtrering i listan | Fler ärenden blir svåra att överblicka | Parametrar på `GET /tickets` |
| Automatisk mutationsprövning, till exempel `pytest-gremlins` | Fler mutationer än för hand | Som komplement, eftersom inget verktyg tar bort en ensam `commit()` |
| Skicka handläggaren till det nya ärendet när det har skapats (Amalia) | I dag stängs dialogen utan bekräftelse när ärendet skapas från detaljvyn, så det är svårt att veta att det lyckades | Navigera till `/tickets/{id}` med id:t från svaret på `POST /tickets`. Förslag i granskningen av PR #103 (sidhuvud med navigation) |
| *(fylls i av övriga)* | | |
