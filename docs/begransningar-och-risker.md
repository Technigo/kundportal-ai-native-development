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
| Tidslinjen i detaljvyn (HIST-05) och felmeddelandena i UI (UI-delen av HIST-14) är inte klara | Historiken syns inte i gränssnittet | KSP-37, KSP-38, [veckostatus V7](status/vecka-7.md) |
| *(fylls i av Mustafa och Amalia)* | | |

### Vad testerna inte visar (Azalea, Nicklas)

| Begränsning | Följd | Var det står |
| --- | --- | --- |
| En saknad `rollback` syns inte över HTTP, eftersom varje begäran får en egen session som stängs | Bara testerna på tjänstenivå skyddar mot det (HIST-09, HIST-10) | `test_atomicity.py`, [verifieringsplanen](verifiering.md) avsnitt 5, K1 |
| `commit` borttagen i statusbytet (M3b) fångas av ett enda omstartstest | Om det testet ändras kan felet passera | `test_restart.py`, verifieringsplanen avsnitt 5 |
| Invarianten (senaste posten är ärendets status) fångar otakt, men inte att både status och post försvann | Den behöver omstartstesterna bredvid sig | [ADR-001](decisions/ADR-001-atomicitet-status-och-historik.md) |
| Ordningen vid samma tidpunkt (HIST-11) skyddas av ett enda test, det enda med fast klocka | Nicklas korsvisa mutation fångades bara av det | Verifieringsplanen avsnitt 5, steg 2 |
| Mutationerna är gjorda för hand och är få | Fler små fel i jämförelser och gränser är inte prövade | [Teststrategin](teststrategi.md) avsnitt 3 |
| *(CORE-testerna fylls i av Nicklas)* | | |

## 2. Risker

| Risk | Sannolikhet | Konsekvens | Hantering |
| --- | --- | --- | --- |
| Status och historik hamnar i otakt | Låg | Hög: tidslinjen visar något annat än ärendet | En transaktion i `TicketService`, rollback vid alla fel, invarianten efter varje scenario och tester med framkallat fel (ADR-001, HIST-09, HIST-10) |
| En PR mergas med röda tester | Medel | Medel | CI kör backend och frontend på varje PR, men rulesetet kräver inte att kontrollerna är gröna (KSP-17, Mustafa) |
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
| *(fylls i av övriga)* | | |
