# Verifieringsplan

> Ansvarig: Nicklas (yrrving) · KSP-47 (verifieringsplanen i Linear) · Skapad 2026-10-27
> Visar **att** varje krav har kontrollerats och med vilket resultat. **Hur** teamet testar
> står i [Teststrategin](teststrategi.md) och upprepas inte här.
> Id förklaras kort: **CORE-xx** är kraven för kärnan ([SPEC-karna.md](specs/SPEC-karna.md)),
> **HIST-xx** kraven för statuslogik och historik ([SPEC-arendehistorik.md](specs/SPEC-arendehistorik.md))
> och **KSP-xx** ärenden i Linear.

## 1. När ett krav räknas som verifierat

Alla fyra ska stämma:

1. Testet är grönt i CI.
2. PR:en med testet är granskad av någon annan än den som skrev det.
3. Testet är mutationsprövat, steg 1 i [Teststrategin](teststrategi.md) (avsnitt 3), så att det
   faller av rätt anledning.
4. Om kravet syns i gränssnittet är det också kontrollerat för hand (avsnitt 3 nedan).

## 2. Översikt per krav

**Status:** *Ej påbörjad* · *Test skrivet* (finns men faller, koden saknas) · *Delvis* (en del
av kravet är grönt) · *Grönt* · *Verifierat* (alla fyra punkterna i avsnitt 1).

### Kärnan (CORE)

Förväntat resultat är en kort sammanfattning av kravet i [SPEC-karna.md](specs/SPEC-karna.md)
(avsnitt 5). Länken går till testfilen, och testnamnet börjar med krav-id:t.

| Krav | Vad | Förväntat | Test | Nivå | För hand | Status |
| --- | --- | --- | --- | --- | --- | --- |
| CORE-01 | Skapa ärende, status `new` | 201 med ärendet, `status` `new`, `created_at` i UTC. Sparas med samma uppgifter. | [test_create_ticket.py](../backend/tests/test_create_ticket.py) (`test_core01_…`, 2 tester). Formuläret postar rubrik, beskrivning, kategori och prioritet, utan `status`, och ärendet syns i listan: [create-ticket-form.test.tsx](../frontend/src/components/create-ticket-form.test.tsx) (`test_core01_valid_ticket_is_posted_and_shown`) | Integration och komponent | Ja | Grönt |
| CORE-02 | Ärendet finns kvar efter omstart | Ny engine och session mot samma fil: ärendet finns med samma uppgifter. | [test_core_read.py](../backend/tests/test_core_read.py) (`test_core02_ticket_survives_restart`) | Integration, omstart | Ja | Grönt |
| CORE-03 | Lista, nyaste först | Alla ärenden, `created_at` fallande, sedan `id` fallande. | [test_core_read.py](../backend/tests/test_core_read.py) (`test_core03_…`, 3 tester). Komponenten visar API:ts ordning och svenska etiketter: [TicketListPage.test.tsx](../frontend/src/pages/TicketListPage.test.tsx) (`test_core03_keeps_the_order_from_the_api`, `test_core03_shows_swedish_labels_not_codes`) | Integration och komponent | Ja | Grönt |
| CORE-04 | Hämta ett ärende med id | 200 med exakt de uppgifter som sparades. | [test_core_read.py](../backend/tests/test_core_read.py) (`test_core04_…`, `test_core03_list_items_match_get`) | Integration | Ja | Grönt |
| CORE-05 | Trimning före och efter (B10) | Blanktecken och nollbreddstecken i ändarna tas bort, tecken inne i texten behålls. | [test_create_ticket.py](../backend/tests/test_create_ticket.py) (`test_core05_…`, 3 tester) | Integration | Nej | Grönt |
| CORE-06 | Rubrik saknas | 422 "Rubrik måste fyllas i.", inget sparas. | [test_error_format.py](../backend/tests/test_error_format.py) (felsvaret), [test_create_ticket.py](../backend/tests/test_create_ticket.py) (`test_ksp22_nothing_saved_on_422`) | Integration | Ja | Grönt |
| CORE-07 | Beskrivning saknas | 422 "Beskrivning måste fyllas i.", inget sparas. | Samma som CORE-06 | Integration | Nej | Grönt |
| CORE-08 | Okänd kategori eller prioritet | 422 "Välj en giltig kategori." (eller prioritet), inget sparas. | Samma som CORE-06 | Integration | Nej | Grönt |
| CORE-09 | `status` skickas vid skapande | 422 "Status sätts automatiskt och kan inte anges när ett ärende skapas.", inget sparas. | Samma som CORE-06 (`test_core09_…`) | Integration | Nej | Grönt |
| CORE-10 | Okänt id eller id som inte är heltal ger 404 | 404 "Ärendet finns inte.", även för `GET /tickets/abc`. | [test_core_read.py](../backend/tests/test_core_read.py) (okänt heltal), [test_error_format.py](../backend/tests/test_error_format.py) (inte heltal) | Integration | Nej | Grönt |
| CORE-11 | Bara blanktecken eller osynliga tecken | Fältet räknas som tomt: 422 "… måste fyllas i.", inget sparas. | [test_create_ticket.py](../backend/tests/test_create_ticket.py) (rubriken), [test_core_rules.py](../backend/tests/test_core_rules.py) (beskrivningen, `test_core11_…`) | Integration | Ja | Grönt |
| CORE-12 | Rubrik högst 100 tecken, efter trimning | 100 tecken godkänns, 101 ger 422 och inget sparas. Räknas efter trimning. | [test_create_ticket.py](../backend/tests/test_create_ticket.py) (`test_core12_…`, 2 tester). Räknaren visar kodpunkter på den råa texten: 100 kan skickas och 101 visas som `101 / 100`: [create-ticket-form.test.tsx](../frontend/src/components/create-ticket-form.test.tsx) (`test_core12_one_hundred_code_points_is_submitted`, `test_core12_one_hundred_one_shows_detail`) | Integration och komponent | Ja | Grönt |
| CORE-13 | Beskrivning högst 2000 tecken | 2000 tecken godkänns, 2001 ger 422 och inget sparas. | [test_core_rules.py](../backend/tests/test_core_rules.py) (`test_core13_…`, 2 tester) | Integration | Nej | Grönt |
| CORE-14 | Svenska tecken och emoji oförändrade | Texten sparas och visas oförändrad. Sammansatta emoji räknas som sina kodpunkter (B11). | [test_create_ticket.py](../backend/tests/test_create_ticket.py) (`test_core14_…`), räkningen i [test_core_rules.py](../backend/tests/test_core_rules.py) (`test_b11_…`, `test_length_is_counted_…`). Samma kodpunkter i räknaren: [code-points.test.ts](../frontend/src/lib/code-points.test.ts) (`test_core14_smiling_face_is_one_code_point`, `test_core14_flag_is_two_code_points`, `test_core14_compound_emoji_is_three_code_points`) och [create-ticket-form.test.tsx](../frontend/src/components/create-ticket-form.test.tsx) (`test_core14_compound_emoji_counts_as_code_points`, `test_b11_fields_have_no_maxlength`) | Integration och komponent | Ja | Grönt |
| CORE-15 | Tom lista är inte ett fel | 200 med `[]`. | [test_core_read.py](../backend/tests/test_core_read.py) (`test_core15_empty_list_returns_200`). Komponenten visar ett meddelande, inte ett fel: [TicketListPage.test.tsx](../frontend/src/pages/TicketListPage.test.tsx) (`test_core15_empty_list_shows_a_message_not_an_error`) | Integration och komponent | Nej | Grönt |
| CORE-16 | Fel på svenska, `{"detail": ...}` | Svenska meddelanden, aldrig stacktrace, SQL eller engelska fältnamn. | [test_error_format.py](../backend/tests/test_error_format.py) | Integration | Ja | Grönt |
| CORE-17 | Fel datatyp, trasig JSON, ogiltig UTF-8 | 422 med bara "Ogiltig indata.", inget sparas. | [test_error_format.py](../backend/tests/test_error_format.py) (`test_core17_…`), inget sparas i [test_core_rules.py](../backend/tests/test_core_rules.py) (`test_rejected_ticket_saves_nothing`) | Integration | Nej | Grönt |
| CORE-18 | Flera fel samtidigt, i fältordningen | 422 med alla meddelanden i ordningen rubrik, beskrivning, kategori, prioritet, status. Inget sparas. | [test_error_format.py](../backend/tests/test_error_format.py) (`test_core18_…`), inget sparas i [test_core_rules.py](../backend/tests/test_core_rules.py) (`test_rejected_ticket_saves_nothing`) | Integration | Nej | Grönt |

Inget krav är *Verifierat* än: statusbytet (KSP-24) finns nu, så mutationsprövningen (KSP-44)
är nästa steg. Felsvaren kommer från KSP-21 (Azalea, PR #30),
https://github.com/desiboli/kundportal-ai-native-development/pull/30, och skapa, lista och
visa från KSP-22 och KSP-23. Nicklas tester för CORE (KSP-25 och KSP-26) finns i
`test_core_read.py` och `test_core_rules.py`. Listans komponenttester
(KSP-67, komponenttest: listan visar ärenden och tom lista) ligger i
`frontend/src/pages/TicketListPage.test.tsx` sedan ärendelistan (KSP-29) och pekas ut på
CORE-03 och CORE-15 ovan. Formulärets komponenttester
(KSP-68, formuläret skickar rätt data och visar `detail` vid 422) ligger i
`frontend/src/components/create-ticket-form.test.tsx` sedan formuläret (KSP-30)
och pekas ut på CORE-01 ovan. KSP-30 AC4 (vid 422 visas `detail` som det är) är
`test_ac4_422_detail_is_shown_unchanged` i samma fil: texten visas oförändrad
inuti dialogen. CORE-11 (bara blanktecken räknas som tomt) ligger kvar på
backendraden. Räknaren (KSP-69, teckenräkning med emoji stämmer med backend)
använder Unicode-kodpunkter på den råa texten, samma räkning som backend för emoji
(beslut B11). CORE-12 (rubrik högst 100 tecken) är
`test_core12_one_hundred_code_points_is_submitted` och
`test_core12_one_hundred_one_shows_detail` i
`frontend/src/components/create-ticket-form.test.tsx`. CORE-14 (svenska tecken och
emoji, sammansatta emoji som sina kodpunkter) är
`test_core14_smiling_face_is_one_code_point`, `test_core14_flag_is_two_code_points`
och `test_core14_compound_emoji_is_three_code_points` i
`frontend/src/lib/code-points.test.ts`, samt
`test_core14_compound_emoji_counts_as_code_points` och
`test_b11_fields_have_no_maxlength` i formulärfilen. CORE-13 (beskrivning högst
2000 tecken) ligger kvar på backendraden. Statusen är fortfarande Grönt: mutationsprövning och kontroll för
hand återstår innan ett krav är Verifierat.

### Statuslogik och historik (HIST)

Förväntat resultat är en kort sammanfattning av kravet i
[SPEC-arendehistorik.md](specs/SPEC-arendehistorik.md) (avsnitt 6).

| Krav | Vad | Förväntat | Test | Ägare | För hand | Status |
| --- | --- | --- | --- | --- | --- | --- |
| HIST-01 | `created`-post när ärendet skapas | Status `new` och exakt en post `created` (`null` → `new`). | [test_history.py](../backend/tests/test_history.py) (`test_hist01_…`, 3 tester) | Azalea | Nej | Verifierat |
| HIST-02 | Statusbyte ger `status_changed`-post | Ny status och en post `status_changed` med rätt från och till. | [test_history.py](../backend/tests/test_history.py) (`test_hist02_…`, 3 tester), och invarianten efter varje steg (`test_invariant_latest_entry_matches_ticket_status`). I detaljvyn skickas statuskoden och den nya statusen visas: [ticket-status-change.test.tsx](../frontend/src/pages/ticket-status-change.test.tsx) (`HIST-02: sends the status code, not the label`, `HIST-02: shows the new status as a badge after saving`) | Azalea | Ja | Verifierat |
| HIST-03 | Historiken äldst först | Äldst först, `to_status` i en post är `from_status` i nästa. | [test_read_history.py](../backend/tests/test_read_history.py) (`test_hist03_history_is_oldest_first_and_chained`) | Azalea | Ja | Grönt |
| HIST-04 | Historiken finns kvar efter omstart | Status och historik oförändrade med ny engine och session, alla fält. | [test_restart.py](../backend/tests/test_restart.py) (`test_hist04_…`, 3 tester: status och historik efter flera byten, posten `created`, och att den nya appen läser `DATABASE_URL`). Från v2-azalea, körning 2 i KSP-50 (KSP-40) | Azalea | Ja | Verifierat |
| HIST-05 | Tidslinjen i detaljvyn | Varje post med svenska etiketter och lokal tid, senaste stämmer med status. | – | Amalia | Ja | Ej påbörjad |
| HIST-06 | Ogiltig status ger 422 | 422 "Välj en giltig status." (fel datatyp: "Ogiltig indata."), status och historik oförändrade. | [test_status_rules.py](../backend/tests/test_status_rules.py) (`test_hist06_…`, 7 fall: okänd kod, svensk etikett, versaler, tom, mellanslag först, fel datatyp, `null`; `test_other_fields_in_patch_…`, 2 fall: andra fält ger "Ogiltig indata."), [test_error_format.py](../backend/tests/test_error_format.py) (saknad status och saknad kropp) | Nicklas | Nej | Grönt |
| HIST-07 | Samma status ger 409 | 409 "Ärendet har redan den statusen.", ingen ny post. Alla fyra statusar. | Servicedelen: [test_history.py](../backend/tests/test_history.py) (Azalea). API:t: [test_status_rules.py](../backend/tests/test_status_rules.py) (`test_hist07_…`, alla fyra statusar). I detaljvyn visas `detail` och aktuell status hämtas igen: [ticket-status-change.test.tsx](../frontend/src/pages/ticket-status-change.test.tsx) (`HIST-07: same status shows the message and fetches the current status again`) | Nicklas | Nej | Grönt |
| HIST-08 | Okänt ärende ger 404 | 404 "Ärendet finns inte.", inget skapas. Även id som inte är heltal. | [test_read_history.py](../backend/tests/test_read_history.py) (`GET …/history` för `999` och `abc`), [test_history.py](../backend/tests/test_history.py) (`PATCH` för `999`), [test_error_format.py](../backend/tests/test_error_format.py) (`PATCH /tickets/abc/status`) | Azalea | Nej | Grönt |
| HIST-09 | Inget ändras om historikposten inte kan sparas | 503 "Statusen kunde inte ändras. Försök igen.", gammal status kvar, nästa byte lyckas. | [test_atomicity.py](../backend/tests/test_atomicity.py) (`test_hist09_…`, 9 tester: 503, status oförändrad via API:t och med ny engine, ingen ny post, rollback från en annan status än `new`, nästa byte lyckas, tjänsten fungerar efter felet, och två för andra fel än databasfel, som ger 500). Testerna skrevs före koden (KSP-41), koden som agentuppdrag (KSP-36) | Azalea | Nej | Verifierat |
| HIST-10 | Ingen historikpost när ärendet inte kan skapas | Ingen historikpost kvar efter en avvisad `POST`. Om posten `created` inte kan sparas rullas allt tillbaka: 500 "Något gick fel. Försök igen.", inget ärende och ingen post, och nästa `create` fungerar (spec v0.10). | [test_history.py](../backend/tests/test_history.py) (`test_hist10_rejected_ticket_has_no_history`) och [test_atomicity.py](../backend/tests/test_atomicity.py) (`test_hist10_…`, 6 tester, KSP-66) | Azalea | Ja | Grönt |
| HIST-11 | Samma tid, ordnas efter id | Samma `occurred_at` ordnas efter `id`, alltid lika. | [test_read_history.py](../backend/tests/test_read_history.py) (`test_hist11_same_time_is_ordered_by_id`, fast klocka) | Azalea | Nej | Verifierat |
| HIST-12 | Ärende utan statusbyten har bara `created` | En lista med exakt en post (`created`), inte tom. | [test_read_history.py](../backend/tests/test_read_history.py) (`test_hist12_new_ticket_history_has_only_created`) | Azalea | Nej | Grönt |
| HIST-13 | Avslutat ärende kan öppnas igen | `closed` → `new` godkänns och loggas som vanligt statusbyte. | [test_status_rules.py](../backend/tests/test_status_rules.py) (`test_hist13_closed_ticket_can_be_opened_again`) | Nicklas | Nej | Grönt |
| HIST-14 | Fel på svenska för status och historik | Svenska meddelanden, aldrig stacktrace eller databasdetaljer. | [test_error_format.py](../backend/tests/test_error_format.py) (backenddelen, `test_hist14_…`, 2 tester) | Azalea, Amalia (UI) | Ja | Delvis: backenddelen grön, också kontrollerad för hand 2026-11-04. UI-delen saknas |

Ägare enligt [Teststrategin](teststrategi.md) (avsnitt 2). Azalea fyller i test och status
för sina rader i KSP-48. HIST-01, 02, 04, 09 och 11 är *Verifierade* 2026-11-05: grönt i CI på `main`, testerna granskade av Nicklas (PR #44, #45, #77 och #93) och mutationsprövade i avsnitt 5 (HIST-01 M1b, HIST-02 M1 och M3b, HIST-04 M3 och M3b, HIST-09 M2 igen, HIST-11 Nicklas korsvisa mutation). HIST-02 och HIST-04 syns i gränssnittet och kontrollerades för hand 2026-11-03 (avsnitt 4). Nicklas tester för HIST-06, 07 och 13 (KSP-27) finns i
`test_status_rules.py`, som också kontrollerar invarianten efter varje scenario (PR #63).

Statusbytets komponenttester (KSP-70, lyckat byte visar den nya statusen och 409 visar
meddelandet) ligger i `frontend/src/pages/ticket-status-change.test.tsx` sedan statusbytet
(KSP-32, PR #65): https://github.com/desiboli/kundportal-ai-native-development/pull/65.
De pekas ut på HIST-02 och HIST-07 ovan. HIST-06 (ogiltig status ger 422) ingår inte i den körningen.

## 3. Kontroll för hand

Görs före varje veckostatus och före demon, mot den senaste `main`. Resultatet skrivs in i
avsnitt 4 med "för hand" i kolumnen Typ.

**Demoflödet**

- [ ] Skapa ett ärende i formuläret (CORE-01).
- [ ] Ärendet syns överst i listan (CORE-03).
- [ ] Detaljvyn visar samma uppgifter som skrevs in (CORE-04).
- [ ] Byt status. Den nya statusen syns direkt (HIST-02).
- [ ] Historiken visar skapandet och statusbytet, äldst först (HIST-03, HIST-05).

**Felmeddelanden i gränssnittet**

- [ ] Tom rubrik och rubrik med bara mellanslag ger "Rubrik måste fyllas i." (CORE-06, CORE-11).
- [ ] En rubrik på 101 tecken ger "Rubriken får vara högst 100 tecken." (CORE-12).
- [ ] En rubrik med å, ä, ö och emoji sparas och visas oförändrad (CORE-14).
- [ ] Meddelandena går att förstå utan att veta hur systemet fungerar (CORE-16, HIST-14).

**Omstart**

- [ ] Starta om backenden. Ärendet och dess historik finns kvar (CORE-02, HIST-04).

## 4. Körresultat

En rad per körning. Minst en gång i veckan och före slutleveransen. Linear-ärendena länkar hit.
Commit skrivs som en hel länk, t.ex.
`https://github.com/desiboli/kundportal-ai-native-development/commit/<hash>`, så att det går
att klicka sig till exakt den version som kördes.

| Datum | Commit | Typ | Resultat | Körd av |
| --- | --- | --- | --- | --- |
| 2026-10-28 | https://github.com/desiboli/kundportal-ai-native-development/commit/65c9f4dc98f9c496e8bf980db8b7f2fe6deb2da6 | automatiskt (pytest) | 107 passed | Nicklas |
| 2026-10-29 | https://github.com/desiboli/kundportal-ai-native-development/commit/115912b509d56346811927b9f67f10180e1032ed | automatiskt (pytest), efter PR #49 (ändra status) | 163 passed, varav 38 HIST-tester (`-k "hist or invariant"`) | Azalea |
| 2026-10-29 | https://github.com/desiboli/kundportal-ai-native-development/commit/e24a30978d47bf71141dfb53a84877b336846cd4 | automatiskt (pytest) | 163 passed | Nicklas |
| 2026-10-29 | https://github.com/desiboli/kundportal-ai-native-development/commit/e24a30978d47bf71141dfb53a84877b336846cd4 | för hand | Frontend finns inte än, så avsnitt 3 gjordes mot API:t i `/docs`. Skapa, lista, öppna, byta status och historiken gav förväntat svar. Tom rubrik, bara mellanslag och 101 tecken gav rätt meddelande, och inget sparades. Å, ä, ö och emoji oförändrade. Efter omstart fanns ärendet och historiken kvar. | Nicklas |
| 2026-11-03 | https://github.com/desiboli/kundportal-ai-native-development/commit/ad57c10d76fa678e8ddd22322efbdfe5493e0f1c | automatiskt (pytest), efter PR #77 (HIST-09 rollback och 503) och PR #65 (statusbyte i detaljvyn) | 183 passed, varav 48 HIST-tester (`-k "hist or invariant"`) och 9 i `test_atomicity.py` (HIST-09) | Azalea |
| 2026-11-03 | https://github.com/desiboli/kundportal-ai-native-development/commit/2a923e940c2cdb428a494a12877164386c10c665 | automatiskt (vitest, `TicketListPage.test.tsx`) | 4 passed. CORE-03 (lista, nyaste först) ×2: ordningen från API:t behålls och koderna visas som svenska etiketter. CORE-15 (tom lista är inte ett fel): meddelandet "Inga ärenden", inget fel. Samma fil har också CORE-12 (rubrik på exakt 100 tecken), från ärendelistan (KSP-29). | Mustafa (agent) |
| 2026-11-03 | https://github.com/desiboli/kundportal-ai-native-development/commit/2a923e940c2cdb428a494a12877164386c10c665 | automatiskt (vitest, `create-ticket-form.test.tsx`) | 2 passed, 18 skipped. CORE-01 (skapa ärende, status `new`): `test_core01_valid_ticket_is_posted_and_shown` postar rubrik, beskrivning, kategori och prioritet, utan `status`, och ärendet syns i listan. KSP-30 AC4 (vid 422 visas `detail` som det är): `test_ac4_422_detail_is_shown_unchanged`. Övriga tester i filen kördes inte. | Mustafa (agent) |
| 2026-11-03 | https://github.com/desiboli/kundportal-ai-native-development/commit/2a923e940c2cdb428a494a12877164386c10c665 | automatiskt (vitest, `code-points.test.ts`, `create-ticket-form.test.tsx`) | 7 passed, 16 skipped. CORE-12 (rubrik högst 100 tecken): `test_core12_one_hundred_code_points_is_submitted` skickar 100 kodpunkter, `test_core12_one_hundred_one_shows_detail` visar `101 / 100`. CORE-14 och beslut B11 (emoji som kodpunkter): `test_core14_smiling_face_is_one_code_point` (😊 = 1), `test_core14_flag_is_two_code_points` (🇸🇪 = 2), `test_core14_compound_emoji_is_three_code_points` (👩‍💻 = 3), `test_core14_compound_emoji_counts_as_code_points` (`101 / 100`, inte `103 / 100`) och `test_b11_fields_have_no_maxlength` (inget `maxlength`). Övriga tester i formulärfilen kördes inte. CORE-13 (beskrivning högst 2000 tecken) kördes inte. | Mustafa (agent) |
| 2026-11-03 | https://github.com/desiboli/kundportal-ai-native-development/commit/2a923e940c2cdb428a494a12877164386c10c665 | automatiskt (vitest, `ticket-status-change.test.tsx`) | 3 passed, 10 skipped. HIST-02 (statusbyte ger en historikpost; i vyn syns den nya statusen): `HIST-02: sends the status code, not the label` skickar `closed`, och `HIST-02: shows the new status as a badge after saving` visar Avslutat. HIST-07 (samma status ger 409): `HIST-07: same status shows the message and fetches the current status again` visar "Ärendet har redan den statusen." och hämtar ärendet igen. Övriga tester i filen kördes inte. | Mustafa (agent) |
| 2026-11-03 | https://github.com/desiboli/kundportal-ai-native-development/commit/95cc998a7117aa34cc4fb4214593997323e79a44 | automatiskt (vitest, `pnpm test:run`) | 54 passed, 7 filer. Hela frontendens svit, inklusive de 20 testerna i `create-ticket-form.test.tsx`. | Mustafa (agent) |
| 2026-11-04 | https://github.com/desiboli/kundportal-ai-native-development/commit/2b6ba419b912e4d5f4d1b5b3ee0171eb4977ad63 | automatiskt (pytest), efter KSP-40 (tester för HIST-04) | 186 passed. HIST-04 (status och historik kvar efter omstart): `test_restart.py` 3 passed, med M3 och M3b se avsnitt 5. | Claude Code i Azaleas session. `test_restart.py` också av Azalea |
| 2026-11-04 | https://github.com/desiboli/kundportal-ai-native-development/commit/32c6c2bbae5cf22a06fc3e007050adbd8a09ccd5 | för hand (`/docs` på port 8010) | HIST-14 (backenddelen): sju felfall för status och historik. 404 "Ärendet finns inte." för okänt ärende i `PATCH` och `GET …/history`, 422 "Välj en giltig status." för `"klar"`, 422 "Ogiltig indata." för `5`, andra fält och trasig JSON, 409 "Ärendet har redan den statusen.". Alla som `{"detail": …}` på svenska, ingen stacktrace, SQL eller engelska fältnamn. Begripliga för en handläggare (Azaleas bedömning). | Azalea |
| 2026-11-04 | https://github.com/desiboli/kundportal-ai-native-development/commit/f6a348d1f83eb91f292d0acd97d69d4f128772e3 | automatiskt (pytest), efter KSP-66 (rollback i `create`) | 192 passed. HIST-10: 6 passed i `test_atomicity.py` (`-k hist10`), före koden 2 failed och 4 passed (`9fc207b`). Mutationerna K1–K3 i avsnitt 5. | Claude Code i Azaleas session, `-k hist10` också av Azalea |

Kommando (macOS/Linux): `cd backend && .venv/bin/python -m pytest -q`. Listans komponenttester (KSP-67): `cd frontend && pnpm exec vitest run src/pages/TicketListPage.test.tsx`. Formulärets komponenttester (KSP-68): `cd frontend && pnpm exec vitest run src/components/create-ticket-form.test.tsx -t "test_core01_valid_ticket_is_posted_and_shown|test_ac4_422_detail_is_shown_unchanged"`. Teckenräkning med emoji (KSP-69): `cd frontend && pnpm exec vitest run src/lib/code-points.test.ts src/components/create-ticket-form.test.tsx -t "test_core14_smiling_face_is_one_code_point|test_core14_flag_is_two_code_points|test_core14_compound_emoji_is_three_code_points|test_core14_compound_emoji_counts_as_code_points|test_core12_one_hundred_code_points_is_submitted|test_core12_one_hundred_one_shows_detail|test_b11_fields_have_no_maxlength"`. Statusbytets komponenttester (KSP-70): `cd frontend && pnpm exec vitest run src/pages/ticket-status-change.test.tsx -t "HIST-02: sends the status code, not the label|HIST-02: shows the new status as a badge after saving|HIST-07: same status shows the message and fetches the current status again"`. Hela frontendens svit: `cd frontend && pnpm test:run`. Windows: se
[Teststrategin](teststrategi.md) (avsnitt 5).

## 5. Mutationsprövning

Mutationerna står i [Teststrategin](teststrategi.md) (avsnitt 3) och i specarna. Här sparas
resultatet: vilket test som föll, eller att inget föll och vad som ändrades i testet.

| Datum | Steg | Mutation | Krav | Test som föll | Gjord av |
| --- | --- | --- | --- | --- | --- |
| 2026-10-31 | 1 | M1b: historikposten `created` tas bort i `TicketService.create` | HIST-01, 02, 03 | 11 failed: HIST-01 ×3, HIST-02 ×2, HIST-03, HIST-11, HIST-12, invarianten och samma status (`test_history.py`, `test_read_history.py`). Alla på saknad `created`-post | Azalea |
| 2026-10-31 | 1 | M1: historikposten `status_changed` tas bort i `TicketService.change_status` | HIST-02, 03 | 9 failed: HIST-02 ×3, HIST-03, HIST-11, invarianten, historiken per ärende, kontraktsfälten (tack vare invariantraden från PR #61) och HIST-13 i `test_status_rules.py`. Alla på saknad `status_changed`-post | Azalea |
| 2026-11-01 | 1 | M2: `commit` flyttad före historikposten i `change_status` | HIST-09 | 9 failed, samma som M1: posten commitas aldrig och ser ut att saknas. **Delvis fångad:** inget test kontrollerar att statusen är oförändrad när historiken inte kan sparas. Testerna för HIST-09 med injicerat fel (KSP-41) behövs. **Åtgärdat i KSP-41, se raden M2 igen 2026-11-02.** | Azalea |
| 2026-11-02 | 1 | M2 igen, efter KSP-36 (HIST-09 rollback och 503): `commit` flyttad före historikposten i `change_status`, på `59bb5fc` (sista commiten i PR #77, före mergen) | HIST-09 | 37 failed, 138 passed. Nu fångad på statusen: 7 tester i `test_atomicity.py` föll, eftersom statusen redan är sparad när historikposten misslyckas. Före KSP-41 (testerna för HIST-09) föll 9, och inget av dem kontrollerade statusen | Azalea |
| 2026-11-01 | 1 | M3: `commit` tas bort i `create` (bara `flush`) | HIST-04, CORE-02 | 52 failed, bland annat `test_core02_ticket_survives_restart`: inget sparas, så nästa begäran får 404 eller tomma listor | Azalea |
| 2026-11-01 | 1 | M3b: `commit` tas bort i `change_status` | HIST-04, HIST-02 | 32 failed: HIST-02 ×3, HIST-03, HIST-11 och 25 tester för statusreglerna (statusen sparas inte). Testet för kontraktsfälten klarade sig, eftersom status och post försvann tillsammans och invarianten höll | Azalea |
| 2026-11-02 | 1 | N1: 409-kontrollen för samma status tas bort i `TicketService.change_status` | HIST-07 | 4 failed: `test_hist07_same_status_gives_409_and_nothing_changes` för alla fyra statusar (`test_status_rules.py`), på `status_code == 409` | Nicklas (agent) |
| 2026-11-02 | 1 | N2: trimningen tas bort i `trim_ends` | CORE-11 | 6 failed: tom beskrivning ×3 och blandade tecken (201 i stället för 422), längd efter trimning ×2 (`test_core_rules.py`) | Nicklas (agent) |
| 2026-11-02 | 1 | N3: nollbreddstecken trimmas inte, bara vanliga blanktecken | CORE-11 | 3 failed: de tre fallen med U+200B (`test_core_rules.py`). Bara U+200B prövas, inte de fyra andra tecknen i `ZERO_WIDTH_CHARS` | Nicklas (agent) |
| 2026-11-02 | 1 | N4: `max_length` för rubriken blir 99 (`<= 100` blir `< 100`) | CORE-12 | 4 failed: rubrikerna på exakt 100 tecken i `test_length_is_counted_in_code_points_after_trimming` | Nicklas (agent) |
| 2026-11-02 | 1 | N5: den svenska hanteraren för valideringsfel tas bort | CORE-16, CORE-17 | 18 failed: 9 i `test_core_rules.py` och 9 i `test_status_rules.py`, alla på jämförelsen med `{"detail": ...}`. Statuskoden var fortfarande 422 | Nicklas (agent) |
| 2026-11-02 | 1 | N6: valideringen visar bara det första felet | CORE-18 | 1 failed: `test_rejected_ticket_saves_nothing[core18_two_errors]`, det andra meddelandet saknades | Nicklas (agent) |
| 2026-11-02 | 1 | N7: sparningen kopplas bort, `commit` tas bort i `create` | CORE-02 | 33 failed, bland annat `test_core02_ticket_survives_restart` (404 efter omstart). Statustesterna föll redan när ärendet skulle förberedas. Längdtesterna klarade sig, eftersom de inte läser tillbaka ärendet. Kontrollerat för hand av Nicklas: samma resultat | Nicklas (agent) |
| 2026-11-02 | 2 | Korsvis på Azaleas tester: poster med samma tid sorteras med högst id först (`id.desc()` i `HistoryRepository`) | HIST-11 | 1 failed, 165 passed i hela sviten: `test_hist11_same_time_is_ordered_by_id` (`[3, 2, 1]` i stället för `[1, 2, 3]`). Bara det testet har en fast klocka, så bara det kan se felet | Nicklas (för hand) |
| 2026-11-04 | 1 | M3 igen, mot testerna för HIST-04 (KSP-40), på `30c4f84` | HIST-04 | 3 av 3 i `test_restart.py`. Två av rätt anledning, 404 efter omstarten (posten `created` och konfigurationen). Testet med flera byten föll redan före omstarten (404 vid första bytet). Hela sviten: 72 failed | Claude Code i Azaleas session, körd igen av Azalea |
| 2026-11-04 | 1 | M3b igen, mot testerna för HIST-04 (KSP-40), på `30c4f84` | HIST-04 | 1 av 3: testet med flera byten, `'new' == 'waiting_on_customer'` efter omstarten. De två andra byter aldrig status och kan inte se M3b. Hela sviten: 37 failed | Claude Code i Azaleas session, körd igen av Azalea |
| 2026-11-04 | 1 | K1: `rollback` borttagen i `create`, efter KSP-66 | HIST-10, HIST-01 | 2 av 6 i `test_hist10_…`: båda tjänstetesterna, `assert 2 == 1` (nästa `create` sparar det misslyckade ärendet utan post). Test 1–4 klarar sig, eftersom sessionen stängs efter varje begäran | Claude Code i Azaleas session |
| 2026-11-04 | 1 | K2: `except Exception` smalnad till `except SQLAlchemyError` i `create` | HIST-10 | 1 av 6: `test_hist10_same_service_works_after_bug_in_create`, `assert 2 == 1` | Claude Code i Azaleas session |
| 2026-11-04 | 1 | K3: `commit` före `history.add` i `create`, före koden | HIST-10 | 5 av 6: test 2–6. Test 1 (svaret 500) föll inte, väntat: dess mutation är teknisk text eller ett svalt fel | Claude Code i Azaleas session |

*Steg 1 kördes för hand på `335fe45` (main efter PR #61), en mutation i taget i en egen arbetskopia. Nollpunkt: 166 passed. Underlag: Azaleas loggbok och jämförelsetabell (lokalt).*

*Nicklas steg 1 (N1–N7, KSP-44) kördes av en agent i en egen session, med [uppdraget](ai/agentuppdrag/KSP-44.md) som enda instruktion, på `d795736` (main efter PR #70), en mutation i taget. Nicklas gissade före varje körning. Steg 2 kördes för hand. Nollpunkt och slut: 166 passed.*

## 6. Testförslag från AI

En rad per gång en instruktion i [`docs/ai/`](ai/) används (Teststrategin, avsnitt 4).

| Datum | Krav | Instruktion | Förslag | Accepterade / ändrade / avvisade | Varför | Av |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-10-25 | CORE-11–14 | v1 | 23 tester, 6 frågor | Provkörning, inga tester skrivna | Jämförelse mot facit, se [v2-nicklas](ai/testforslag-v2-nicklas.md) | Nicklas |
| 2026-10-25 | CORE-11–14 | v2-nicklas | 29 tester (24 *Måste*) | Provkörning, inga tester skrivna | Alla 19 fall i facit kom med, se [v2-nicklas](ai/testforslag-v2-nicklas.md) | Nicklas |
| 2026-10-27 | KSP-21: CORE-09, 10, 16–18, HIST-14 | v1 | 25 tester, 6 frågor | 25 / 0 / 0 | Alla valdes, frågorna besvarades. Se PR #30 (svenskt felformat i backenden): https://github.com/desiboli/kundportal-ai-native-development/pull/30 | Azalea |
| 2026-10-28 | KSP-25 och 26 (tester för kärnan): CORE-02–05, 10–15, 17, 18 | v2-nicklas | 13 tester | 11 / 1 / 1 | Ett ändrades: två ärenden med samma tid skapas via tjänsten med en fast klocka. Ett ströks, rubrik med ett tecken fångade inget nytt. Se PR #39 (längd, tomma fält och tecken): https://github.com/desiboli/kundportal-ai-native-development/pull/39 och PR #41 (lista och visa ärenden): https://github.com/desiboli/kundportal-ai-native-development/pull/41 | Nicklas |
| 2026-10-28 | KSP-27 (tester för statusreglerna): HIST-06, 07, 13 | v2-nicklas, körd efter att testerna skrevs | 6 tester (4 Måste, 2 Bra att ha), 4 frågor | 4 / 0 / 0, 2 väntar på svar från specägaren | Måste-testerna var redan skrivna, samma 23 fall. Bra att ha-testerna väntar på svar om null och andra fält i PATCH. Se PR #43 (statusreglerna): https://github.com/desiboli/kundportal-ai-native-development/pull/43 | Nicklas |
