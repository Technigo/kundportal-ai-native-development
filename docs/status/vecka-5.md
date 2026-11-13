# Veckostatus vecka 5: Projektstart och specifikation

> Senast uppdaterat söndag 2026-10-25 kväll, efter teammötet och eftermiddagens PR:er (Azalea).
> Jämför med veckans förväntningar i Disco.

## Planerat

Veckans förväntningar enligt kursen:

1. Teamets fork och löpande PR finns, och åtkomsten är kontrollerad.
2. Avgränsning, teknikval och arbetsfördelning är dokumenterade.
3. De första specifikationerna har acceptanskriterier och en plan för verifiering.
4. En minimal fullstackgrund går att köra med våra instruktioner.

Teamets egen plan: Linear-projektet Kundserviceportalen med sex milstolpar och mallar för
Feature, Bug, Chore och Verification (Mustafa). Spec för kompletterande funktion (Azalea),
spec för kärnan och verifieringsplan (Nicklas), backendskelett (Azalea), frontendskelett.

## Genomfört

| Vad | Vem | Länk |
| --- | --- | --- |
| Fork och löpande PR till kursens repository | Mustafa | Löpande PR till kursens repository: https://github.com/Technigo/kundportal-ai-native-development/pull/2 |
| Teammedlemmar i PR-mallen, alla fyra | Azalea, Amalia | PR #1 (Azalea i PR-mallen): https://github.com/desiboli/kundportal-ai-native-development/pull/1 (mergad), PR #2 (Amalia i PR-mallen): https://github.com/desiboli/kundportal-ai-native-development/pull/2 (granskad och godkänd av Azalea, mergad 2026-10-23) |
| Push-åtkomst till forken kontrollerad | Azalea, Amalia, Nicklas | Pushade branches och PR:er i den här tabellen |
| Linear-projekt, milstolpar och ärendemallar. Beskrivningen av milstolpe 02 rättad 2026-10-23 | Mustafa | [Linear: Kundserviceportalen](https://linear.app/grupp6/project/kundserviceportalen-be4a4840b5ef) |
| Fält för krav-id (CORE-xx, HIST-xx) i alla fyra ärendemallarna, och en rad i Verification om testet faller av rätt anledning | Nicklas | Linear, ärendemallarna |
| Spec v0.3: statuslogik och ärendehistorik, acceptanskriterier HIST-01–14, teststrategi | Azalea | [docs/specs/SPEC-arendehistorik.md](../specs/SPEC-arendehistorik.md), PR #4 (spec, ansvar och veckostatus V5): https://github.com/desiboli/kundportal-ai-native-development/pull/4 (godkänd av Mustafa, mergad 2026-10-23) |
| Arbetsfördelning, bekräftad av alla fyra på mötet 2026-10-25 | Alla | [docs/ansvar-och-granskning.md](../ansvar-och-granskning.md), i samma PR #4 (spec, ansvar och veckostatus V5): https://github.com/desiboli/kundportal-ai-native-development/pull/4 |
| Backendskelett: FastAPI, SQLite, `GET /health`, körinstruktioner i README, port 8010 | Azalea | PR #3 (backendskelett: FastAPI, SQLite och /health): https://github.com/desiboli/kundportal-ai-native-development/pull/3 (godkänd av Mustafa, mergad 2026-10-23) |
| Spec för kärnan v0.2: CORE-01–17, felmeddelanden, gränsfall, mutationer, beslut B1–B8 | Nicklas | PR #5 (spec för kärnan, CORE-01–16): https://github.com/desiboli/kundportal-ai-native-development/pull/5 (granskad av Azalea, alla nio punkter åtgärdade i v0.2, godkänd och mergad 2026-10-24) |
| Amalia har valt sin del: tidslinjen (HIST-05) och UI-delen av HIST-14 | Amalia | PR #7 (Amalia tar tidslinje och felmeddelanden i UI, HIST-05 och HIST-14): https://github.com/desiboli/kundportal-ai-native-development/pull/7 (godkänd av Azalea) |
| HIST-spec v0.4: Amalias del och uppdelningen av HIST-14 i backend- och UI-del | Azalea | PR #8 (HIST-spec v0.4, Amalias del): https://github.com/desiboli/kundportal-ai-native-development/pull/8 (mergad 2026-10-24) |
| HIST-spec v0.5: HIST-08 (404 även för id som inte är heltal) och HIST-10 (bara historiken) efter CORE v0.2 | Azalea | PR #9 (HIST-spec v0.5, HIST-08 och HIST-10 efter CORE v0.2): https://github.com/desiboli/kundportal-ai-native-development/pull/9 (godkänd av Nicklas, mergad 2026-10-25) |
| Spec för kärnan v0.3: beslut B9 (fel datatyp och saknat fält samtidigt ger bara "Ogiltig indata."), B10–B11 och ogiltig UTF-8 | Nicklas | PR #10 (CORE-spec v0.3, B9): https://github.com/desiboli/kundportal-ai-native-development/pull/10 (granskad och godkänd av Azalea, mergad 2026-10-25) |
| Veckostatus V5, läget lördag och besluten på teammötet | Azalea | PR #6 (veckostatus V5, läget lördag): https://github.com/desiboli/kundportal-ai-native-development/pull/6 (mergad 2026-10-25) |
| Frontend-skelett: React, Vite, TypeScript, Tailwind och shadcn/ui under `frontend/` (pnpm) | Mustafa | PR #11 (frontend-skelett med React, Vite och TypeScript): https://github.com/desiboli/kundportal-ai-native-development/pull/11 (godkänd och mergad av Amalia 2026-10-25) |
| Feedback på specen och mallarna | Nicklas, Amalia | Slack, inarbetat i spec v0.3 |
| Svar på feedbacken och sammanfattning av spec v0.3 till teamet | Azalea | Slack 2026-10-23 |

### PR:er efter teammötet

| Vad | Vem | Länk |
| --- | --- | --- |
| HIST-spec v0.6: stack och ansvar beslutade, HIST-06 enligt B9 | Azalea | PR #12 (HIST-spec v0.6, beslut från teammötet): https://github.com/desiboli/kundportal-ai-native-development/pull/12 · **mergad** |
| `AGENTS.md`, `CLAUDE.md` och CI som kör `pytest` på varje PR (jobbet `backend`) | Azalea | PR #13 (AGENTS.md, CLAUDE.md och CI med pytest): https://github.com/desiboli/kundportal-ai-native-development/pull/13 (CI grön) · **mergad** |
| Stackbeslutet som ADR-002 i `docs/decisions/` | Nicklas | PR #14 (ADR-002 teknikstack): https://github.com/desiboli/kundportal-ai-native-development/pull/14 · **mergad** (granskad av Azalea, fem punkter åtgärdade) |
| Frontenden visar backendens `/health` via Vite-proxy till port 8010, frontendkommandon i README | Azalea | PR #15 (koppla frontend till backendens /health): https://github.com/desiboli/kundportal-ai-native-development/pull/15 |
| Instruktion för testförslag v1 (teamets återanvändbara AI-moment) | Nicklas | PR #16 (instruktion för testförslag v1): https://github.com/desiboli/kundportal-ai-native-development/pull/16 · **mergad** (Azaleas två punkter åtgärdade, godkänd) |
| API-konventioner, arkitektur och teststrategi flyttade från Linear till `docs/` (repot är huvudversion) | Azalea | PR #17 (gemensamma dokument flyttade från Linear till repot): https://github.com/desiboli/kundportal-ai-native-development/pull/17 · **mergad** |
| HIST-spec v0.7: luckorna från körningarna av testinstruktion v1 (meddelanden för HIST-06/07, 503 vid HIST-09, omstart i HIST-04), statusbytet i milstolpe 03, ADR-001 i `docs/decisions/` | Azalea | PR #19 (HIST-spec v0.7, luckor och ADR-001): https://github.com/desiboli/kundportal-ai-native-development/pull/19 · godkänd av Nicklas, väntar på nytt godkännande efter att `main` mergats in |
| AGENTS.md pekar på `docs/ai/` och har Mac-kommandon (Nicklas förslag i #13) | Azalea | PR #21 (AGENTS.md pekar på docs/ai/ och har Mac-kommandon): https://github.com/desiboli/kundportal-ai-native-development/pull/21 |
| Testinstruktion v2-nicklas: gränsvärden, prövad på CORE-11–14 mot v1 | Nicklas | PR #20 (testinstruktion v2-nicklas, gränsvärden): https://github.com/desiboli/kundportal-ai-native-development/pull/20 · **mergad** (Azaleas förslag om nedre gränsen infört) |
| CORE-spec v0.4: B12 (vad som sparas) och CORE-18 (flera fel samtidigt) | Nicklas | PR #22 (CORE-spec v0.4, B12 och CORE-18): https://github.com/desiboli/kundportal-ai-native-development/pull/22 · **mergad** (granskad av Azalea) |

### Backloggen i Linear (söndag kväll)

53 ärenden (KSP-6 till KSP-58) i [Linear: Kundserviceportalen](https://linear.app/grupp6/project/kundserviceportalen-be4a4840b5ef), ett per leverans eller PR, med krav-id i beskrivningen, ägare och milstolpe. Arbete som redan är gjort ligger som Done (t.ex. KSP-14 backendskelett), öppna PR:er som In Progress. Beroenden är inlagda (t.ex. att frontenden väntar på API-kontraktet, KSP-20). Platshållaren KSP-5 är avbruten. Lagt in av Azalea, som Mustafa godkände.

| Milstolpe | Ärenden |
| --- | --- |
| 01 Planning & Architecture | KSP-6–13: specarna, ADR-001, ADR-002, AGENTS.md, gemensamma dokument, ansvar |
| 02 Foundation & Database | KSP-14–19: skeletten, frontend–backend, CI, README |
| 03 Case Management | KSP-20–32: API-kontrakt, felformat, CORE-endpoints, statusbytet, CORE- och statustester, frontendens lista, formulär, detaljvy och statusbyte |
| 04 Additional Feature | KSP-33–38: historiktabellen, TicketService, history-endpointen, HIST-09 som agentuppdrag, tidslinje, felmeddelanden i UI |
| 05 Testing & Verification | KSP-39–48: HIST-tester, Schemathesis, mutationsprövning (två), komponenttester, verifieringsplanen |
| 06 Documentation & Delivery | KSP-49–58: testinstruktion v1 och egna förbättringar, veckostatus V5–V8, löpande PR, demo, slutleverans |

## Beslut på teammötet 2026-10-25

| Beslut | Innehåll |
| --- | --- |
| **Stack** | Vi kör på det vi har: backend Python 3.11 + FastAPI + SQLAlchemy + SQLite (port 8010), frontend React + Vite + TypeScript + Tailwind CSS v4 + shadcn/ui, pakethanterare pnpm. Tester: pytest i backend, vitest i frontend |
| **Ansvar** | Bekräftat av alla fyra enligt `docs/ansvar-och-granskning.md` |
| **AI-arbetssätt** | En gemensam `AGENTS.md` och CI på varje PR som grund (Azalea). Därefter en skill per område med en ägare |
| **Huvudversion för dokument** | Gemensamma dokument ändras bara i repot via PR. Linear används för planering (ärenden, milstolpar) och länkar till dokumenten i repot |

## Verifierat

- Backendskelettet: `pytest -q` ger `4 passed` (2026-10-23). Testerna kontrollerar bland
  annat att `/health` faktiskt frågar databasen och svarar 503 med svenskt meddelande om
  den inte går att nå.
- Manuellt: `uvicorn` startar och `/health` svarar `{"status":"ok","database":"ok"}` på
  port 8010. 8010 är projektets standardport, eftersom 8000 redan användes av en annan
  lokal app och svarade med fel innehåll (upptäckt genom att läsa svaret, inte bara statuskoden).
- Specen granskad av Nicklas och Amalia (synpunkter i Slack, inarbetade i v0.3).
- Kodgranskning i GitHub:
  - Azalea granskade PR #2 (Amalia i PR-mallen): https://github.com/desiboli/kundportal-ai-native-development/pull/2
    (kontrollerade att raden har samma format som övriga och att användarnamnet stämmer
    med Amalias konto) och godkände innan merge.
  - Mustafa godkände PR #3 (backendskelett: FastAPI, SQLite och /health): https://github.com/desiboli/kundportal-ai-native-development/pull/3
    och PR #4 (spec, ansvar och veckostatus V5): https://github.com/desiboli/kundportal-ai-native-development/pull/4
    och mergade dem 2026-10-23. Godkännandena saknar kommentar om vad som kontrollerades.
  - Azalea granskade PR #5 (spec för kärnan, CORE-01–16): https://github.com/desiboli/kundportal-ai-native-development/pull/5 2026-10-24 mot
    API-konventionerna och HIST-specen: nio radkommentarer (bl.a. ordningen på felmeddelanden,
    svenskt meddelande vid fel typ, id som inte är ett tal, hur tecken räknas) och
    "Request changes". Nicklas åtgärdade alla nio i v0.2 (commit 915a933), bl.a. nytt
    kriterium CORE-17 och beslut B8 (404 även för id som inte är ett heltal).
    Azalea kontrollerade v0.2 mot alla nio punkterna i filen, godkände och mergade 2026-10-24.
  - Azalea granskade PR #7 (Amalia tar tidslinje och felmeddelanden i UI, HIST-05 och HIST-14): https://github.com/desiboli/kundportal-ai-native-development/pull/7 2026-10-24: kontrollerade att diffen
    bara ändrar de beskrivna raderna och att Linear-dokumentet har samma innehåll. Godkänd
    med två radkommentarer (UI-delen av HIST-14, test för felmeddelandena).

  - Nicklas godkände PR #9 (HIST-spec v0.5, HIST-08 och HIST-10 efter CORE v0.2): https://github.com/desiboli/kundportal-ai-native-development/pull/9,
    och Azalea godkände PR #10 (CORE-spec v0.3, B9): https://github.com/desiboli/kundportal-ai-native-development/pull/10. Båda mergade 2026-10-25.
  - Amalia godkände och mergade PR #11 (frontend-skelett med React, Vite och TypeScript): https://github.com/desiboli/kundportal-ai-native-development/pull/11.
  - Azalea granskade PR #16 (instruktion för testförslag v1): https://github.com/desiboli/kundportal-ai-native-development/pull/16 med kommentarer (hänvisning till teststrategin, gränsen mellan CORE och HIST).

- Azalea granskade Nicklas PR #14 (ADR-002), #16 (v1), #20 (v2-nicklas) och #22 (CORE v0.4)
  2026-10-25. I alla fyra ledde granskningen till ändringar: fem punkter i ADR-002 (c5ac198, 1aa9369),
  hänvisningen till teststrategin och gränsen mellan CORE och HIST i v1 (21ae327), nedre gränsen
  i v2 (10ac589) och tre förslag i v0.4. CORE-18 lades till i HIST-10 (a0bd810 i #19).
- CI: jobbet `backend` i PR #13 (AGENTS.md, CLAUDE.md och CI med pytest): https://github.com/desiboli/kundportal-ai-native-development/pull/13 kör `pytest` och är grönt.
- Fullstacken lokalt (PR #15, koppla frontend till backendens /health): https://github.com/desiboli/kundportal-ai-native-development/pull/15, 2026-10-25:
  `pnpm lint` och `pnpm build` utan fel, proxyn svarar via `curl`, sidan visar
  "ok" när backenden kör och ett svenskt felmeddelande när den är avstängd.
- Nicklas granskade och godkände PR #12, #13, #17 och #19 2026-10-25 kl. 15.08. Han
  kontrollerade stacken mot ADR-002 och HIST-06 mot B9 (#12), meddelandena för 409 och 422
  mot CORE-stilen och ADR-001 (#19), och gav förslag som är införda i #19 och #21. Azalea
  mergade #17, #12 och #13 i den ordningen. #19 mergades om med `main` utan manuella
  ändringar. Innehållet är detsamma som han godkände (jämfört med `git diff`), och CI är grön.
- Testinstruktionen v1 provad 2026-10-25 på HIST-04, HIST-09 och HIST-07 (Azalea, nya
  AI-sessioner). Förslagen följde specens testnivåer. Körningarna visade luckor i specen:
  meddelandet för 409 saknas, och vad `PATCH` svarar när historiken inte kan sparas (HIST-09).

- Verktygsprov 2026-10-24–25 (Azalea, med AI-stöd): Hypothesis och Schemathesis fungerar med
  projektets versioner (pytest 9.1.1, FastAPI 0.159.1). Provkörningen mot en prototyp med
  CORE-reglerna gav fyra fynd, bland annat att ogiltiga tecken i kroppen ger 400 på engelska.
  Publicerade som kommentar på PR #5 (spec för kärnan, CORE-01–16): https://github.com/desiboli/kundportal-ai-native-development/pull/5#issuecomment-6394982815

## Osäkert eller ofärdigt

| Vad | Varför | Plan |
| --- | --- | --- |
| Flera PR:er väntar på granskning (tabellen "Öppna PR:er" ovan), och PR #7 (Amalia tar tidslinje och felmeddelanden i UI): https://github.com/desiboli/kundportal-ai-native-development/pull/7 väntar på att konversationerna löses | Öppnade söndag eftermiddag | Granska måndag. Merge-ordning: först de gemensamma dokumenten (de andra länkar till `docs/`), sedan HIST-spec v0.6 och AGENTS.md/CI, sist kopplingen frontend–backend |
| CI är inte ett krav för merge än | Regeln "Protect main" kräver inte kontrollen `backend` | Mustafa (admin) lägger till `backend` som obligatorisk kontroll när PR:n med AGENTS.md och CI är mergad |
| Ansvarsdokumentet står som "Förslag" | Ändras efter Amalias PR #7 (tidslinje och felmeddelanden i UI): https://github.com/desiboli/kundportal-ai-native-development/pull/7, annars blir det konflikt | Azalea sätter "Bekräftat" när den är mergad |
| CORE-specen och HIST-specen i Linear är fortfarande kopior | Repot är huvudversion | Ersätts med länkar till repot (CORE: Nicklas, HIST och Ansvar: Azalea) |
| Verifieringsplan saknas | Ägs av Nicklas, bygger på specarna | Första utkast vecka 6 (KSP-47, HIST-raderna KSP-48) |
| Beskrivningen i den löpande PR:n (Technigo#2): https://github.com/Technigo/kundportal-ai-native-development/pull/2 saknar Azalea, Amalia och länkar | Bara Mustafa, som öppnade PR:n, kan ändra den | Mustafa uppdaterar. PR #3 (backendskelett): https://github.com/desiboli/kundportal-ai-native-development/pull/3 och PR #4 (spec, ansvar och veckostatus V5): https://github.com/desiboli/kundportal-ai-native-development/pull/4 är nu mergade, så länkarna till `docs/` fungerar |
| Backendskelettet mergades utan att Nicklas hann granska | Mustafa godkände först | Nicklas kan granska i efterhand med kommentarer i PR #3 (backendskelett: FastAPI, SQLite och /health): https://github.com/desiboli/kundportal-ai-native-development/pull/3 |
| Några Linear-ärenden saknar ansvarig: CI för frontend (KSP-18), veckostatus V6–V8 (KSP-53–55), demo (KSP-57), slutleverans (KSP-58) | Inte bestämt på mötet | Fördelas på nästa avstämning |
| Frontenden har inga egna krav-id | Frontendärendena pekar på CORE- och HIST-id tills vidare | Teamet beslutar senare om en frontendspec behövs |

## Nästa steg

| Vad | Ansvarig |
| --- | --- |
| ~~Dokumentera stackbeslutet i `docs/decisions/`~~ mergad i PR #14 (ADR-002 teknikstack): https://github.com/desiboli/kundportal-ai-native-development/pull/14 | Nicklas |
| ~~`AGENTS.md` med teamets regler och CI~~ öppen i PR #13 (AGENTS.md, CLAUDE.md och CI med pytest): https://github.com/desiboli/kundportal-ai-native-development/pull/13 | Azalea |
| Granska och merga de sex öppna PR:erna i ordningen under "Osäkert eller ofärdigt" | Granskarna i varje PR |
| Lägga till `backend` som obligatorisk kontroll i regeln "Protect main" | Mustafa |
| ~~Uppdatera spec för kärnan efter granskningen~~ klart i v0.2, PR #5 (spec för kärnan, CORE-01–16): https://github.com/desiboli/kundportal-ai-native-development/pull/5 | Nicklas |
| ~~Godkänna PR #5~~ godkänd och mergad 2026-10-24: PR #5 (spec för kärnan, CORE-01–16): https://github.com/desiboli/kundportal-ai-native-development/pull/5. HIST-08 och HIST-10 ändrade i PR #9 (HIST-spec v0.5, HIST-08 och HIST-10 efter CORE v0.2): https://github.com/desiboli/kundportal-ai-native-development/pull/9 | Azalea |
| ~~Koppla frontend till `/health`~~ gjort av Azalea i PR #15 (koppla frontend till backendens /health): https://github.com/desiboli/kundportal-ai-native-development/pull/15 | Azalea |
| ~~Granska PR #10 (CORE-spec v0.3, B9): https://github.com/desiboli/kundportal-ai-native-development/pull/10~~ godkänd och mergad 2026-10-25 | Azalea |
| ~~Meddelande för 409 och för fel när historiken inte kan sparas (HIST-07, HIST-09)~~ öppen i PR #19 (HIST-spec v0.7, luckor och ADR-001): https://github.com/desiboli/kundportal-ai-native-development/pull/19 | Azalea |
| Ärendemodell och `POST`/`GET /tickets` enligt CORE (vecka 6) | Azalea |
| ~~Linear-ärenden per uppgift, med krav-id i beskrivningen~~ 53 ärenden inlagda (KSP-6–58). Var och en kontrollerar sina och flyttar dem när arbetet börjar | Alla |
| ~~Ta ställning till fynden om CORE-11, CORE-14 och CORE-17 i kommentaren på PR #5: https://github.com/desiboli/kundportal-ai-native-development/pull/5#issuecomment-6394982815~~ gjort i CORE-spec v0.3, PR #10 (B9–B11): https://github.com/desiboli/kundportal-ai-native-development/pull/10 | Nicklas |
| Uppdatera beskrivningen i den löpande PR:n med alla fyra och länkar | Mustafa |
| Nicklas godkänner #19 igen (godkännandet försvann när `main` mergades in) och granskar #21 | Nicklas |
| ~~Granska PR #16, #20, #14 och #22~~ godkända och mergade | Azalea |
| Merga PR #21 (AGENTS.md) | Azalea |
| Bekräfta openapi-typescript och om Amalia tar detaljvyn och statusbytet (KSP-31, KSP-32) | Alla, tisdag |
| Svara på radkommentarerna i PR #7 (Amalia tar tidslinje och felmeddelanden i UI, HIST-05 och HIST-14): https://github.com/desiboli/kundportal-ai-native-development/pull/7 så att den kan mergas (alla konversationer måste vara lösta) | Amalia |
| ~~Granska PR #9 (HIST-spec v0.5, HIST-08 och HIST-10 efter CORE v0.2): https://github.com/desiboli/kundportal-ai-native-development/pull/9~~ godkänd och mergad 2026-10-25 | Nicklas |
| Uppdatera den löpande PR:n med CORE-specen, ADR-002, `AGENTS.md` och `docs/` när de är mergade | Mustafa |
