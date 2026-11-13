# Veckostatus vecka 6: det centrala flödet

> Slutversion för veckan, söndag 2026-11-01 (Azalea). Föregående version: torsdag 2026-10-29.
> Jämför med veckans förväntningar i Disco. Id förklaras kort: **KSP-xx** är ärenden i
> [Linear: Kundserviceportalen](https://linear.app/grupp6/project/kundserviceportalen-be4a4840b5ef),
> **CORE-xx** är kraven för kärnan ([SPEC-karna.md](../specs/SPEC-karna.md)) och **HIST-xx**
> kraven för statuslogik och historik ([SPEC-arendehistorik.md](../specs/SPEC-arendehistorik.md)).

## Planerat

Veckans förväntningar enligt kursen:

1. Det centrala flödet fungerar: registrera och spara ärenden, visa lista och detaljer, ändra status.
2. Avgränsat agentarbete är genomfört, med sparade instruktioner och mänsklig granskning.
3. Automatiserade tester för centrala beteenden är körda och resultaten dokumenterade.
4. Varje students tekniska bidrag går att följa i projektet.

Teamets plan för veckan (milstolpe 03 Case Management i Linear):

| Vad | Ärende | Ansvarig |
| --- | --- | --- |
| API-kontraktet i OpenAPI med stubbar, så att frontend kan bygga direkt | KSP-20 | Azalea |
| Svenskt felformat i backenden (`{"detail": ...}`) | KSP-21 | Azalea |
| Ärendemodell, `POST /tickets`, `GET /tickets` och `GET /tickets/{id}` | KSP-22, KSP-23 | Azalea |
| Statusbyte `PATCH /tickets/{id}/status` | KSP-24 | Azalea |
| Historiktabellen och TicketService | KSP-33, KSP-34 | Azalea |
| TypeScript-typer från OpenAPI, ärendelista och formulär | KSP-28–30 | Mustafa |
| Detaljvy och statusbyte i frontend | KSP-31, KSP-32 | Amalia |
| Tester för CORE och för statusreglerna (HIST-06, 07, 13), verifieringsplan | KSP-25–27, KSP-47 | Nicklas |

## Läget vid veckans slut

| Förväntning | Läge |
| --- | --- |
| 1. Det centrala flödet fungerar | **Delvis.** Backenden är klar: skapa (`POST /tickets`), lista, visa och ändra status, med historik. I UI finns ärendelistan och detaljvyn på `main`. Formuläret för att skapa ärenden, PR #64 (KSP-30): https://github.com/desiboli/kundportal-ai-native-development/pull/64, och statusbytet, PR #65 (KSP-32): https://github.com/desiboli/kundportal-ai-native-development/pull/65, är öppna, så hela flödet går ännu inte att köra i webbläsaren |
| 2. Avgränsat agentarbete med sparade instruktioner och mänsklig granskning | **Klart.** Agentuppdraget för svenskt felformat (KSP-21) ligger i `docs/ai/agentuppdrag/KSP-21.md`, med gränser, fyra kontrollpunkter och Azaleas granskning, PR #62 (agentuppdraget i repot): https://github.com/desiboli/kundportal-ai-native-development/pull/62 |
| 3. Automatiserade tester för centrala beteenden, körda och dokumenterade | **Klart för backenden:** 166 passed på `main` (`9fee37a`). Resultaten och förväntat resultat står i `docs/verifiering.md`, med CORE-raderna (KSP-47) och HIST-raderna (KSP-48). Frontendtester finns för listan och detaljvyn |
| 4. Varje students tekniska bidrag går att följa | **Klart.** Varje del har egna PR:er med krav-id, se Genomfört |

## Genomfört

| Vad | Vem | Länk |
| --- | --- | --- |
| API-kontraktet: alla fem endpoints för CORE och HIST i `/openapi.json` med modeller, enum, längdgränser och felsvar. Stubbarna svarar 501 "Funktionen är inte klar än." | Azalea | PR #26 (API-kontraktet i OpenAPI med fem stubbar): https://github.com/desiboli/kundportal-ai-native-development/pull/26 · mergad 2026-10-27 |
| Frontenden når backendens `/health` via Vite-proxyn (`/api` → port 8010). Startsidan visar om backenden och databasen svarar | Azalea | PR #15 (koppla frontend till backendens /health): https://github.com/desiboli/kundportal-ai-native-development/pull/15 · mergad 2026-10-26 |
| Veckostatus V6 | Azalea | PR #27 (veckostatus V6): https://github.com/desiboli/kundportal-ai-native-development/pull/27 · mergad 2026-10-27 |
| Ny regel i AGENTS.md (teamets regler för AI-verktyg): varje id förklaras kort, i AI-svar, commits, PR:er, dokument och kod (KSP-10, teamets AI-arbetssätt) | Azalea | PR #29 (AGENTS.md, förklara varje krav-id kort): https://github.com/desiboli/kundportal-ai-native-development/pull/29 · mergad 2026-10-27 |
| Svenskt felformat i backenden: alla fel är `{"detail": "<svenskt meddelande>"}` utan stacktrace, SQL eller engelska fältnamn (CORE-16, HIST-14). Fältfel i fältordningen (CORE-18), "Ogiltig indata." för fel datatyp, trasig JSON och ogiltig UTF-8 (CORE-17), 404 "Ärendet finns inte." för id som inte är heltal (CORE-10), svenska 404, 405 och 500. Byggt som teamets första agentuppdrag, med fyra kontrollpunkter där Azalea godkände varje steg (KSP-21) | Azalea (med AI-agent) | PR #30 (svenskt felformat i backenden): https://github.com/desiboli/kundportal-ai-native-development/pull/30 · godkänd av Nicklas, mergad 2026-10-27 |
| Saknad status i statusbytet (`PATCH` med `{}`) ger "Välj en giltig status." enligt HIST-06 (okänd eller saknad status). Ett anrop helt utan kropp ger fortfarande "Ogiltig indata." (B9). Hittat av Nicklas i granskningen av PR #30 | Azalea | PR #32 (saknad status i PATCH ger "Välj en giltig status."): https://github.com/desiboli/kundportal-ai-native-development/pull/32 · godkänd av Nicklas, mergad 2026-10-27 |
| Registrera ärenden: `POST /tickets` sparar i SQLite med status `new` och tid i UTC (CORE-01, giltigt ärende ger 201). Rubrik och beskrivning trimmas i ändarna, även nollbreddstecken (CORE-05, B10, B12), en rubrik med bara blanktecken räknas som tom (CORE-11), och längden räknas efter trimning (CORE-12, max 100 tecken). Tabellen `tickets`, TicketRepository och TicketService enligt lagren i arkitekturen (KSP-22) | Azalea | PR #34 (ärendemodell och POST /tickets med trimning): https://github.com/desiboli/kundportal-ai-native-development/pull/34 · godkänd av Nicklas, mergad 2026-10-28 |
| Lista och visa ärenden: `GET /tickets` visar alla ärenden nyaste först (CORE-03, B5) och `[]` när inga finns (CORE-15). `GET /tickets/{id}` visar ett ärende med exakt det som sparades (CORE-04), och okänt id ger 404 "Ärendet finns inte." (CORE-10). Byggt mot Nicklas tester i PR #40 (lista och öppna ärenden, KSP-25): https://github.com/desiboli/kundportal-ai-native-development/pull/40 (KSP-23) | Azalea (kod), Nicklas (tester) | PR #41 (lista och visa ärenden, GET /tickets och GET /tickets/{id}): https://github.com/desiboli/kundportal-ai-native-development/pull/41 · mergad 2026-10-28 |
| Historiken: tabellen `ticket_history`, där varje nytt ärende får posten `created` (HIST-01) och varje statusbyte skriver ny status och posten `status_changed` i samma transaktion (HIST-02, ADR-001). Samma status avvisas i servicen, så ingen post "x → x" skrivs (servicedelen av HIST-07). SQLite kontrollerar att varje post pekar på ett riktigt ärende (KSP-33, KSP-34) | Azalea | PR #44 (historiken skrivs med status i samma transaktion): https://github.com/desiboli/kundportal-ai-native-development/pull/44 · godkänd av Nicklas, mergad 2026-10-28 |
| Läsa historiken: `GET /tickets/{id}/history` ger ett ärendes poster äldst först (HIST-03), med samma tid ordnat efter id (HIST-11). Ett ärende utan byten ger bara `created` (HIST-12), och ett okänt id ger 404 (HIST-08). Flyttad från vecka 7, eftersom Nicklas tester för statusreglerna läser historiken (KSP-35) | Azalea | PR #45 (läsa historiken, GET /tickets/{id}/history): https://github.com/desiboli/kundportal-ai-native-development/pull/45 · godkänd av Nicklas, mergad 2026-10-29 |
| Ny regel i AGENTS.md: statusar skickas och sparas som koder (`new`, `in_progress` …), svenska etiketter bara i UI (KSP-10, teamets AI-arbetssätt) | Azalea | PR #46 (AGENTS.md, statusar skickas som koder): https://github.com/desiboli/kundportal-ai-native-development/pull/46 · godkänd av Nicklas, mergad 2026-10-29 |
| Ändra status: `PATCH /tickets/{id}/status` byter status och skriver historikposten i samma transaktion. Okänd eller saknad status ger 422 (HIST-06), samma status 409 (HIST-07), okänt ärende 404 (HIST-08), och ett avslutat ärende kan öppnas igen (HIST-13). `{"status": null}` och andra fält än `status` ger "Ogiltig indata." (HIST-spec v0.9, svar på Nicklas frågor i PR #43). Byggt mot Nicklas tester för statusreglerna (KSP-27) (KSP-24) | Azalea (kod), Nicklas (tester) | PR #49 (ändra status, PATCH /tickets/{id}/status): https://github.com/desiboli/kundportal-ai-native-development/pull/49 · godkänd av Nicklas, mergad 2026-10-29 |
| Ansvarsdokumentet till "Bekräftat" och de fyra statusarna motiverade i HIST-specen (KSP-13) | Azalea | PR #48 (ansvaret bekräftat och statusarna motiverade): https://github.com/desiboli/kundportal-ai-native-development/pull/48 · mergad 2026-10-29. Nicklas godkände, men godkännandet avfärdades automatiskt när konflikten med v0.9 i HIST-specen löstes (commit `669ccda`), och PR:en mergades utan nytt godkännande. Nicklas ombeds titta på konfliktlösningen i efterhand |
| CORE-spec v0.5: CORE-01 (giltigt ärende ger 201) kräver också att ärendet sparas | Nicklas | PR #36 (CORE-01 kräver att ärendet sparas): https://github.com/desiboli/kundportal-ai-native-development/pull/36 · godkänd av Azalea, mergad 2026-10-28 |
| BOLDkit-temat i frontenden, med komponenterna badge och card (KSP-59) | Amalia | PR #38 (BOLDkit-tema med badge och card): https://github.com/desiboli/kundportal-ai-native-development/pull/38 · mergad 2026-10-28 |
| CORE-tester för beskrivningens längd, tomma fält och hur tecken räknas (KSP-26) | Nicklas | PR #39 (beskrivningens längd, tomma fält och tecken): https://github.com/desiboli/kundportal-ai-native-development/pull/39 · godkänd av Azalea, mergad 2026-10-29 |
| Körresultat, förväntat resultat och länkar till testerna i verifieringsplanen (KSP-47) | Nicklas | PR #42 (körresultat och testförslag från AI 2026-10-28): https://github.com/desiboli/kundportal-ai-native-development/pull/42 · godkänd av Azalea, mergad 2026-10-29 |
| Skills i `.claude/skills/` för testförslag, API-typer från OpenAPI och BOLDkit (KSP-65) | Mustafa | PR #47 (skills för testförslag, API-typer och BOLDkit): https://github.com/desiboli/kundportal-ai-native-development/pull/47 · godkänd av Nicklas och Azalea (efter ändringarna), mergad 2026-10-30 |
| ADR-002 (teknikstacken): BOLDkit valt för utseendet, med skälen och en öppen fråga om kontrasten (KSP-9) | Nicklas | PR #50 (ADR-002, BOLDkit valt för utseendet): https://github.com/desiboli/kundportal-ai-native-development/pull/50 · granskad av Amalia och Azalea, mergad 2026-10-30 |
| Veckostatus V6, läget torsdag (KSP-53) | Azalea | PR #51 (veckostatus V6, läget torsdag): https://github.com/desiboli/kundportal-ai-native-development/pull/51 · godkänd av Nicklas, mergad 2026-10-30 |
| Testverktyg i frontend: vitest, jsdom, Testing Library och jest-axe, lagda som fråga enligt AGENTS.md eftersom de är nya beroenden (KSP-64) | Amalia | PR #53 (förslag på testverktyg): https://github.com/desiboli/kundportal-ai-native-development/pull/53 · godkänd av Azalea och Mustafa, mergad 2026-10-30 |
| Tester för `{"status": null}` och andra fält än `status` i `PATCH` (HIST-06, okänd eller saknad status), och CORE-raderna gröna i verifieringsplanen (KSP-27, KSP-47) | Nicklas | PR #54 (null och andra fält i statusbytet): https://github.com/desiboli/kundportal-ai-native-development/pull/54 · godkänd av Azalea, mergad 2026-10-30 |
| TypeScript-typer genererade från `/openapi.json` med openapi-typescript (KSP-28) | Mustafa | PR #58 (generera TypeScript-typer från OpenAPI): https://github.com/desiboli/kundportal-ai-native-development/pull/58 · mergad 2026-10-30 |
| Ärendelistan i UI: nyaste först (CORE-03) och ett meddelande när listan är tom (CORE-15), med svenska etiketter för koderna (KSP-29) | Mustafa | PR #59 (ärendelista): https://github.com/desiboli/kundportal-ai-native-development/pull/59 · mergad 2026-10-30 |
| Detaljvyn i UI: ett ärende visas med det som sparades (CORE-04), och okänt id ger "Ärendet finns inte." (CORE-10) (KSP-31) | Amalia | PR #60 (detaljvy för ett ärende): https://github.com/desiboli/kundportal-ai-native-development/pull/60 · godkänd av Azalea efter fyra radkommentarer, mergad 2026-10-31 |
| Ny regel i AGENTS.md: agenten föreslår sina misstag och en regel mot dem, och en människa godkänner regeln innan den skrivs in i `docs/ai/misstag-<namn>.md` (KSP-62, utvärdering av arbetssättet) | Nicklas | PR #55 (AGENTS.md, misstagslogg för AI-agenten): https://github.com/desiboli/kundportal-ai-native-development/pull/55 · godkänd av Azalea, mergad 2026-10-31 |
| ADR-001-invarianten (senaste historikpostens `to_status` är ärendets status) kontrolleras i fyra HIST-scenarier till, som HIST-specen kräver efter varje scenario (TC8 i KSP-39, Azaleas HIST-tester) | Azalea | PR #61 (invarianten efter varje HIST-scenario, TC8): https://github.com/desiboli/kundportal-ai-native-development/pull/61 · godkänd av Nicklas, mergad 2026-10-31 |
| Agentuppdraget för svenskt felformat i repot, `docs/ai/agentuppdrag/KSP-21.md`: mål, gränser, fyra kontrollpunkter och granskningen efter körningen (KSP-21) | Azalea | PR #62 (agentuppdraget för svenskt felformat i repot): https://github.com/desiboli/kundportal-ai-native-development/pull/62 · godkänd av Nicklas, mergad 2026-10-31 |
| HIST-raderna i verifieringsplanen: test, status och förväntat resultat. HIST-01, 02, 03, 08, 10, 11, 12 och backenddelen av HIST-14 är gröna. HIST-04 (omstart) och HIST-09 (atomicitet vid fel) har inga tester än (KSP-48, pågår) | Azalea | PR #56 (HIST-raderna i verifieringsplanen): https://github.com/desiboli/kundportal-ai-native-development/pull/56 · mergad 2026-11-01. Nicklas godkände 2026-10-30, men godkännandet avfärdades automatiskt efter nya commits, och PR:en mergades utan nytt godkännande. Nicklas ombeds titta på de sista ändringarna i efterhand |

## Verifierat

- KSP-20, testerna först: 30 kontraktstester i `backend/tests/test_openapi_contract.py`
  skrevs före koden. Commit `abede58` (bara testerna): `30 failed, 4 passed`, eftersom
  vägarna och modellerna saknades. Commit `dcaa890` (koden): `34 passed`. CI (jobbet
  `backend`) grön på PR #26 (API-kontraktet i OpenAPI med fem stubbar): https://github.com/desiboli/kundportal-ai-native-development/pull/26.
- KSP-20, granskningen: Nicklas (backend) läste kontraktet mot CORE avsnitt 4 och HIST
  avsnitt 4–5 och körde testerna lokalt (34 passed). Amalia kontrollerade fälten och
  felsvaren för detaljvy, statusbyte och tidslinje och körde backenden (`/docs`, 501).
  Mustafa kontrollerade att modellerna räcker för lista, formulär, detaljvy och statusbyte.
  Alla tre godkände.
- KSP-16, granskningen: Mustafa begärde ändringar på PR #15 (koppla frontend till backendens /health): https://github.com/desiboli/kundportal-ai-native-development/pull/15.
  De gjordes, och Amalia och Mustafa godkände.
- KSP-21, testerna först: 25 tester (46 fall) i `backend/tests/test_error_format.py` skrevs
  före koden och föll av rätt anledning (engelska meddelanden eller fel statuskod):
  `43 failed, 37 passed`. Efter koden: `80 passed`. Första körningen efter koden gav ett
  fallerande test (`{"status": 5}`, HIST-06). Koden rättades och testet ändrades inte.
- KSP-21, manuellt på port 8010 (Azalea, 2026-10-27): `GET /tickets/abc` gav 404 "Ärendet finns
  inte.", `{"title": 5}`, trasig JSON och ogiltig UTF-8 gav 422 "Ogiltig indata.", `GET /tiketts`
  gav 404 "Sidan finns inte." och `DELETE /tickets/1` gav 405 "Metoden stöds inte.".

- HIST-06, saknad status: testet `test_hist06_missing_status_gives_invalid_status` skrevs först
  och föll av rätt anledning ("Ogiltig indata." i stället för "Välj en giltig status."):
  `1 failed, 81 passed`. Efter rättningen: `82 passed`.
- KSP-22 (ärendemodell och `POST /tickets`), testerna först: tio egna tester (21 fall) i
  `backend/tests/test_create_ticket.py`, enligt testinstruktionen v1. De läser SQLite-filen direkt
  för att se vad som sparades. Commit `99638a4` (bara testerna): `21 failed, 80 passed`.
  Commit `33600e8` (koden): `100 passed`. Två tester som byggde på stubbens 501 för `POST` är
  ändrade som PR #26 beskrev, godkänt av Azalea.
- KSP-22, manuellt på port 8010 med en tillfällig databas: mellanslag och U+200B trimmas,
  en rubrik med bara U+200B, mellanslag och tabb ger 422 "Rubrik måste fyllas i.", 100 tecken
  med mellanslag runt ger 201, och `status` ger 422.
- Granskning av Nicklas verifieringsplan, PR #33 (verifieringsplan, KSP-47): https://github.com/desiboli/kundportal-ai-native-development/pull/33.
  Azalea läste hela `docs/verifiering.md` och lämnade tre radkommentarer: CORE-10 (okänt id
  ger 404) ska peka på KSP-23 och inte KSP-22, saknad status i HIST-06 testas i PR #32, och
  kolumnen Commit bör vara en hel länk. Granskningen lämnades först som *Comment*:
  https://github.com/desiboli/kundportal-ai-native-development/pull/33#pullrequestreview-5672768553.
  Nicklas rättade alla tre punkterna, och Azalea godkände 2026-10-27 när trådarna var
  besvarade. Mergad 2026-10-28.
- Felsökning där AI hade fel: AI påstod att längdkontrollen i Pydantic körs före en
  before-validator. Ett litet skript, som Azalea körde själv, visade motsatsen. Det styrde
  hur trimningen byggdes i KSP-22.
- KSP-23 (lista och visa ärenden), testerna först: Nicklas sju tester i
  `backend/tests/test_core_read.py` skrevs före koden och föll av rätt anledning (`7 failed`,
  501 från stubbarna). Efter koden: `107 passed`. Två tester som byggde på stubbarnas 501 är
  ändrade som i KSP-22, godkänt av Azalea. Azalea körde testerna själv (107 och 7 passed).
- KSP-23, manuellt på port 8010 med en tillfällig databas: tom lista gav `[]`, två ärenden
  visades nyaste först, ett ärende hämtades med samma uppgifter, och `999` och `abc` gav 404.
- KSP-33 och KSP-34 (historiken), testerna först: Azaleas nio HIST-tester (10 fall) i
  `backend/tests/test_history.py` skrevs före koden och föll av rätt anledning (`10 failed`:
  tabellen och `change_status()` saknades). Efter koden: `117 passed`.
- KSP-33 och KSP-34, manuellt (Azalea): ett ärende skapat i `/docs`, status bytt via servicen.
  Databasen visade två poster (`created` med samma tid som ärendet, sedan `status_changed`)
  och att invarianten håller. Samma status igen stoppades (`SameStatus`) utan någon ny post.
- Granskning av PR #44 (historiken): Nicklas läste koden mot HIST-specen och ADR-001 och
  fick 117 passed lokalt. Han provade också sina 23 tester för statusreglerna mot
  `change_status()` (23 passed).
- KSP-35 (läsa historiken), testerna först: Azaleas sju tester i `test_read_history.py`
  föll på 501 (6) eller var redan gröna som skydd (`abc`, tack vare KSP-21). Efter koden:
  `123 passed`. Azalea provade själv i `/docs`: ett nytt ärende gav en post, ett ärende med
  ett byte gav två poster äldst först, och `999` och `abc` gav 404.
- KSP-24 (ändra status), testerna först: Nicklas 23 tester för statusreglerna (KSP-27, hans
  commit från PR #43) och Azaleas test för HIST-08 på `PATCH` föll alla på 501: `24 failed`.
  Efter koden: `146 passed`. För andra fält i `PATCH` skärptes kontraktstestet först och föll
  av rätt anledning (`KeyError: 'additionalProperties'`). Efter `extra="forbid"`: `146 passed`.
- KSP-24, manuellt (Azalea, 2026-10-29): `146 passed` lokalt, och alla sju proven i "Så testar
  du" i #49 gav det förväntade svaret. Historiken blev `created`, new → in_progress,
  in_progress → closed, closed → new, utan poster från de avvisade anropen (409 och 422).
- Granskningar 2026-10-29 (Azalea):
  - PR #39 (Nicklas CORE-tester för längd, tomma fält och tecken, KSP-26): https://github.com/desiboli/kundportal-ai-native-development/pull/39
    godkänd igen efter rättelsen av de osynliga tecknen. Branchen ihop med main gav `134 passed`.
  - PR #42 (körresultat och förväntat resultat i verifieringsplanen, KSP-47): https://github.com/desiboli/kundportal-ai-native-development/pull/42
    godkänd med tre radkommentarer, bland annat att CORE-13 (beskrivning högst 2000 tecken) inte
    är grönt på main förrän #39 är mergad.
  - PR #43 (statusreglerna, KSP-27): https://github.com/desiboli/kundportal-ai-native-development/pull/43
    svar som ägare av HIST-specen på Nicklas två frågor: `null` och andra fält i `PATCH` ger
    "Ogiltig indata.".
  - PR #47 (skills för testförslag, API-typer och BOLDkit): https://github.com/desiboli/kundportal-ai-native-development/pull/47
    ändringar begärda: symlänkarna till `grill-me` och `grilling` fungerar inte på Windows,
    BOLDkit-skillen säger emot ADR-002 och `@boldkit/mcp` saknar låst version.
- KSP-27 (statusreglerna), `null` och andra fält i `PATCH`: Nicklas provade att de nya testerna
  kan falla. Utan `extra="forbid"` föll testet för andra fält, och när `status` fick vara `null`
  föll null-testet. Ändringarna i koden återställdes. Efter: `166 passed` (PR #54).
- TC8 i KSP-39 (invarianten efter varje HIST-scenario): bara testfiler ändrade, `166 passed`
  (PR #61). Nicklas granskade och godkände.
- Hela backendsviten på `main` (`9fee37a`) 2026-11-01: `166 passed`.
- Granskningar 2026-10-30 till 2026-11-01 (Azalea):
  - PR #47 (skills, KSP-65): godkänd 2026-10-30 när de tre punkterna var åtgärdade.
  - PR #53 (testverktyg i frontend, KSP-64) och PR #54 (null och andra fält, KSP-27): godkända.
  - PR #55 (misstagslogg för AI-agenten, KSP-62): tre kommentarer 2026-10-30, godkänd i omgång 2
    2026-10-31 när loggen låg i repot och en människa godkänner regeln.
  - PR #60 (detaljvyn, KSP-31): fyra radkommentarer, bland annat samma felruta och nätverkstext
    som listan och två tester till för felvägen. Godkänd 2026-10-31.
  - PR #63 (invarianten i statusreglerna, KSP-27): https://github.com/desiboli/kundportal-ai-native-development/pull/63
    godkänd 2026-11-01.
  - PR #64 (formulär för att skapa ärende, KSP-30): https://github.com/desiboli/kundportal-ai-native-development/pull/64
    ändringar begärda 2026-11-01, av både Azalea och Amalia.

## Osäkert eller ofärdigt

| Vad | Varför | Plan |
| --- | --- | --- |
| FastAPI lägger själv till en engelsk 422 (`HTTPValidationError`) på `GET /tickets/{ticket_id}` och `/history` | Vägar med en parameter får den automatiskt. Den stämmer inte med CORE-10 (404 för id som inte är heltal) och CORE-16 | Inte rättat i KSP-21: API:t svarar nu 404, men `/openapi.json` deklarerar fortfarande den engelska 422:an (även på `PATCH /tickets/{ticket_id}/status`). Att ta bort den ändrar kontraktet, så frågan ligger hos Mustafa i PR #30 (svenskt felformat i backenden): https://github.com/desiboli/kundportal-ai-native-development/pull/30 |
| 503 för databasfel i svenskt felformat (AC3 i KSP-21) | Det finns ingen databaskod att testa mot än | Byggs i KSP-34 (TicketService) eller KSP-36 (HIST-09) |
| 501-testerna i PR #26 (API-kontraktet i OpenAPI med fem stubbar): https://github.com/desiboli/kundportal-ai-native-development/pull/26 är tillfälliga | Varje stubb byts mot riktig logik | Ersätts av beteendetester i det KSP-ärende som bygger vägen |
| `max_length` på rubrik och beskrivning kontrolleras före trimningen (Nicklas granskning av PR #26 (API-kontraktet i OpenAPI med fem stubbar): https://github.com/desiboli/kundportal-ai-native-development/pull/26) | CORE-12 och B10 säger att längden räknas efter trimning, så 100 tecken med mellanslag runt ska godkännas | Rättat i PR #34 (ärendemodell och POST /tickets med trimning): https://github.com/desiboli/kundportal-ai-native-development/pull/34, med test (`test_core12_100_chars_after_trim_is_accepted`) |
| Ska andra okända fält än `status` avvisas i `POST /tickets`? (`extra="forbid"`) | CORE-09 gäller bara `status` | Azalea beslutade 2026-10-27: ja, andra okända fält ger bara "Ogiltig indata." (byggt i KSP-21). Nicklas bekräftar i granskningen av PR #30 (svenskt felformat i backenden): https://github.com/desiboli/kundportal-ai-native-development/pull/30 och lägger det i så fall i CORE-specen |
| `docs/ansvar-och-granskning.md` har kvar rader med "Förslag" | Ansvaret bekräftades på teammötet 2026-10-25 | Klart: PR #48 (ansvaret bekräftat och statusarna motiverade): https://github.com/desiboli/kundportal-ai-native-development/pull/48, mergad 2026-10-29 (KSP-13) |
| PR #43 (statusreglerna) är kvar som öppen | Nicklas tester kom in på `main` via PR #49 (ändra status), där hans commit följde med | Klart: #43 är stängd |
| Formuläret och statusbytet i UI är inte mergade | Ärendelistan (PR #59) och detaljvyn (PR #60) är på `main`. Formuläret har ändringar begärda, och statusbytet väntar på granskning. Hela flödet går därför inte att köra i webbläsaren än | Mustafa åtgärdar PR #64 (formulär för att skapa ärende, KSP-30): https://github.com/desiboli/kundportal-ai-native-development/pull/64. Amalia får PR #65 (statusbyte i detaljvyn, KSP-32) granskad: https://github.com/desiboli/kundportal-ai-native-development/pull/65. Mål: början av vecka 7 |
| Den löpande PR:n (Technigo#2) länkar till veckostatusen men inte till `docs/verifiering.md`, `AGENTS.md` eller `docs/ai/` | Bedömarna går via den löpande PR:n, och bara Mustafa kan redigera den | Mustafa (KSP-56): https://github.com/Technigo/kundportal-ai-native-development/pull/2 |
| Tre PR:er mergades utan ett giltigt godkännande: PR #58 (TypeScript-typer, KSP-28), PR #59 (ärendelistan, KSP-29) och PR #56 (HIST-raderna, KSP-48) | `main` avfärdar ett godkännande när nya commits kommer, men kräver inget godkännande före merge. AGENTS.md säger att någon annan granskar före merge | Granskning i efterhand: Azalea granskar #58 (API-kontraktet, enligt KSP-28), Amalia #59 och Nicklas de sista ändringarna i #56. Förslag: branchskyddet för `main` kräver ett godkännande (Mustafa) |
| Öppna PR:er vid veckans slut | Skickade under helgen | PR #57 (utvärdering av arbetssättet, frågor till alla, KSP-62): https://github.com/desiboli/kundportal-ai-native-development/pull/57 · PR #63 (invarianten i statusreglerna, KSP-27), godkänd av Azalea · PR #66 (ansvaret för detaljvy, statusbyte och frontendtester, KSP-31 och KSP-32): https://github.com/desiboli/kundportal-ai-native-development/pull/66 · PR #67 (mutationsprövningen steg 1 i verifieringsplanen, KSP-43): https://github.com/desiboli/kundportal-ai-native-development/pull/67 · PR #68 (testinstruktion v2-azalea, KSP-50): https://github.com/desiboli/kundportal-ai-native-development/pull/68 |
| HIST-specen v0.8 i #48 och v0.9 i #49 | Båda ändrade rad 3 i specen | Löst i #48 (commit `669ccda`), mergad: specen är v0.9 med båda ändringarna |

## Nästa steg

| Vad | Ansvarig |
| --- | --- |
| Åtgärda granskningen av formuläret, PR #64 (KSP-30), så att ärenden kan skapas i UI | Mustafa |
| Granska och merga statusbytet i UI, PR #65 (KSP-32) | Amalia, granskare Azalea och Mustafa |
| Granska PR #66 (ansvaret för detaljvy, statusbyte och frontendtester) | Azalea, Mustafa |
| Granska PR #67 (mutationsprövningen steg 1, KSP-43) och PR #68 (testinstruktion v2-azalea, KSP-50) | Nicklas |
| Svara på frågorna i PR #57 (utvärdering av arbetssättet, KSP-62) | Alla |
| Granska i efterhand: #58 (Azalea), #59 (Amalia) och de sista ändringarna i #56 (Nicklas). Slå på krav på ett godkännande i branchskyddet för `main` | Azalea, Amalia, Nicklas, Mustafa |
| Bestämma hur FastAPI:s engelska 422 (`HTTPValidationError`) tas bort ur `/openapi.json` | Mustafa och Azalea |
| Länka `docs/verifiering.md`, AGENTS.md och `docs/ai/` från den löpande PR:n (Technigo#2): https://github.com/Technigo/kundportal-ai-native-development/pull/2 | Mustafa (KSP-56) |
| Atomicitet när historikposten inte kan sparas (HIST-09), som andra agentuppdraget och teamets längre agentarbete vecka 7, med testerna i KSP-41 och omstartstestet för HIST-04 i KSP-40 | Azalea (KSP-36) |
| Komponenttester för lista, formulär och statusbyte, och för tidslinje och felmeddelanden | Mustafa (KSP-46), Amalia (KSP-45) |
| Teamets AI-arbetsflöde, `docs/ai/arbetssatt.md` | Azalea (KSP-60) |
| Fördela ärenden utan ägare på nästa möte: KSP-18 (frontendtester i CI), KSP-54 och KSP-55 (veckostatus V7 och V8), KSP-57 (demon), KSP-58 (slutleveransen) och KSP-61 (kända begränsningar, risker och vidareutveckling) | Alla |
