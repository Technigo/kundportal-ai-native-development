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
| CORE-01 | Skapa ärende, status `new` | 201 med ärendet, `status` `new`, `created_at` i UTC. Sparas med samma uppgifter. | [test_create_ticket.py](../backend/tests/test_create_ticket.py) (`test_core01_…`, 2 tester) | Integration | Ja | Grönt |
| CORE-02 | Ärendet finns kvar efter omstart | Ny engine och session mot samma fil: ärendet finns med samma uppgifter. | [test_core_read.py](../backend/tests/test_core_read.py) (`test_core02_ticket_survives_restart`) | Integration, omstart | Ja | Grönt |
| CORE-03 | Lista, nyaste först | Alla ärenden, `created_at` fallande, sedan `id` fallande. | [test_core_read.py](../backend/tests/test_core_read.py) (`test_core03_…`, 3 tester) | Integration | Ja | Grönt |
| CORE-04 | Hämta ett ärende med id | 200 med exakt de uppgifter som sparades. | [test_core_read.py](../backend/tests/test_core_read.py) (`test_core04_…`, `test_core03_list_items_match_get`) | Integration | Ja | Grönt |
| CORE-05 | Trimning före och efter (B10) | Blanktecken och nollbreddstecken i ändarna tas bort, tecken inne i texten behålls. | [test_create_ticket.py](../backend/tests/test_create_ticket.py) (`test_core05_…`, 3 tester) | Integration | Nej | Grönt |
| CORE-06 | Rubrik saknas | 422 "Rubrik måste fyllas i.", inget sparas. | [test_error_format.py](../backend/tests/test_error_format.py) (felsvaret), [test_create_ticket.py](../backend/tests/test_create_ticket.py) (`test_ksp22_nothing_saved_on_422`) | Integration | Ja | Grönt |
| CORE-07 | Beskrivning saknas | 422 "Beskrivning måste fyllas i.", inget sparas. | Samma som CORE-06 | Integration | Nej | Grönt |
| CORE-08 | Okänd kategori eller prioritet | 422 "Välj en giltig kategori." (eller prioritet), inget sparas. | Samma som CORE-06 | Integration | Nej | Grönt |
| CORE-09 | `status` skickas vid skapande | 422 "Status sätts automatiskt och kan inte anges när ett ärende skapas.", inget sparas. | Samma som CORE-06 (`test_core09_…`) | Integration | Nej | Grönt |
| CORE-10 | Okänt id eller id som inte är heltal ger 404 | 404 "Ärendet finns inte.", även för `GET /tickets/abc`. | [test_core_read.py](../backend/tests/test_core_read.py) (okänt heltal), [test_error_format.py](../backend/tests/test_error_format.py) (inte heltal) | Integration | Nej | Grönt |
| CORE-11 | Bara blanktecken eller osynliga tecken | Fältet räknas som tomt: 422 "… måste fyllas i.", inget sparas. | [test_create_ticket.py](../backend/tests/test_create_ticket.py) (rubriken), [test_core_rules.py](../backend/tests/test_core_rules.py) (beskrivningen, `test_core11_…`) | Integration | Ja | Grönt |
| CORE-12 | Rubrik högst 100 tecken, efter trimning | 100 tecken godkänns, 101 ger 422 och inget sparas. Räknas efter trimning. | [test_create_ticket.py](../backend/tests/test_create_ticket.py) (`test_core12_…`, 2 tester) | Integration | Ja | Grönt |
| CORE-13 | Beskrivning högst 2000 tecken | 2000 tecken godkänns, 2001 ger 422 och inget sparas. | [test_core_rules.py](../backend/tests/test_core_rules.py) (`test_core13_…`, 2 tester) | Integration | Nej | Grönt |
| CORE-14 | Svenska tecken och emoji oförändrade | Texten sparas och visas oförändrad. Sammansatta emoji räknas som sina kodpunkter (B11). | [test_create_ticket.py](../backend/tests/test_create_ticket.py) (`test_core14_…`), räkningen i [test_core_rules.py](../backend/tests/test_core_rules.py) (`test_b11_…`, `test_length_is_counted_…`) | Integration | Ja | Grönt |
| CORE-15 | Tom lista är inte ett fel | 200 med `[]`. | [test_core_read.py](../backend/tests/test_core_read.py) (`test_core15_empty_list_returns_200`) | Integration | Nej | Grönt |
| CORE-16 | Fel på svenska, `{"detail": ...}` | Svenska meddelanden, aldrig stacktrace, SQL eller engelska fältnamn. | [test_error_format.py](../backend/tests/test_error_format.py) | Integration | Ja | Grönt |
| CORE-17 | Fel datatyp, trasig JSON, ogiltig UTF-8 | 422 med bara "Ogiltig indata.", inget sparas. | [test_error_format.py](../backend/tests/test_error_format.py) (`test_core17_…`), inget sparas i [test_core_rules.py](../backend/tests/test_core_rules.py) (`test_rejected_ticket_saves_nothing`) | Integration | Nej | Grönt |
| CORE-18 | Flera fel samtidigt, i fältordningen | 422 med alla meddelanden i ordningen rubrik, beskrivning, kategori, prioritet, status. Inget sparas. | [test_error_format.py](../backend/tests/test_error_format.py) (`test_core18_…`), inget sparas i [test_core_rules.py](../backend/tests/test_core_rules.py) (`test_rejected_ticket_saves_nothing`) | Integration | Nej | Grönt |

Inget krav är *Verifierat* än: statusbytet (KSP-24) finns nu, så mutationsprövningen (KSP-44)
är nästa steg. Felsvaren kommer från KSP-21 (Azalea, PR #30),
https://github.com/desiboli/kundportal-ai-native-development/pull/30, och skapa, lista och
visa från KSP-22 och KSP-23. Nicklas tester för CORE (KSP-25 och KSP-26) finns i
`test_core_read.py` och `test_core_rules.py`.

### Statuslogik och historik (HIST)

Förväntat resultat är en kort sammanfattning av kravet i
[SPEC-arendehistorik.md](specs/SPEC-arendehistorik.md) (avsnitt 6).

| Krav | Vad | Förväntat | Test | Ägare | För hand | Status |
| --- | --- | --- | --- | --- | --- | --- |
| HIST-01 | `created`-post när ärendet skapas | Status `new` och exakt en post `created` (`null` → `new`). | [test_history.py](../backend/tests/test_history.py) (`test_hist01_…`, 3 tester) | Azalea | Nej | Grönt |
| HIST-02 | Statusbyte ger `status_changed`-post | Ny status och en post `status_changed` med rätt från och till. | [test_history.py](../backend/tests/test_history.py) (`test_hist02_…`, 3 tester), och invarianten efter varje steg (`test_invariant_latest_entry_matches_ticket_status`) | Azalea | Ja | Grönt |
| HIST-03 | Historiken äldst först | Äldst först, `to_status` i en post är `from_status` i nästa. | [test_read_history.py](../backend/tests/test_read_history.py) (`test_hist03_history_is_oldest_first_and_chained`) | Azalea | Ja | Grönt |
| HIST-04 | Historiken finns kvar efter omstart | Status och historik oförändrade med ny engine och session, alla fält. | Inget än. Skrivs i KSP-40 (status och historik efter omstart) | Azalea | Ja | Ej påbörjad |
| HIST-05 | Tidslinjen i detaljvyn | Varje post med svenska etiketter och lokal tid, senaste stämmer med status. | – | Amalia | Ja | Ej påbörjad |
| HIST-06 | Ogiltig status ger 422 | 422 "Välj en giltig status." för en okänd kod. Fel datatyp, `null` eller andra fält än `status`: 422 "Ogiltig indata.". Status och historik oförändrade. | [test_status_rules.py](../backend/tests/test_status_rules.py) (`test_hist06_…`, 7 fall: okänd kod, svensk etikett, versaler, tom, mellanslag först, fel datatyp, `null`; `test_other_fields_in_patch_…`, 2 fall), [test_error_format.py](../backend/tests/test_error_format.py) (saknad status och saknad kropp) | Nicklas | Nej | Grönt |
| HIST-07 | Samma status ger 409 | 409 "Ärendet har redan den statusen.", ingen ny post. Alla fyra statusar. | Servicedelen: [test_history.py](../backend/tests/test_history.py) (Azalea). API:t: [test_status_rules.py](../backend/tests/test_status_rules.py) (`test_hist07_…`, alla fyra statusar) | Nicklas | Nej | Grönt |
| HIST-08 | Okänt ärende ger 404 | 404 "Ärendet finns inte.", inget skapas. Även id som inte är heltal. | [test_read_history.py](../backend/tests/test_read_history.py) (`GET …/history` för `999` och `abc`), [test_history.py](../backend/tests/test_history.py) (`PATCH` för `999`), [test_error_format.py](../backend/tests/test_error_format.py) (`PATCH /tickets/abc/status`) | Azalea | Nej | Grönt |
| HIST-09 | Inget ändras om historikposten inte kan sparas | 503 "Statusen kunde inte ändras. Försök igen.", gammal status kvar, nästa byte lyckas. | Inget än. Skrivs i KSP-41 (atomicitet med injicerat fel), koden i KSP-36 | Azalea | Nej | Ej påbörjad |
| HIST-10 | Ingen historikpost när ärendet inte kan skapas | Ingen historikpost kvar efter en avvisad `POST`. | [test_history.py](../backend/tests/test_history.py) (`test_hist10_rejected_ticket_has_no_history`) | Azalea | Nej | Grönt |
| HIST-11 | Samma tid, ordnas efter id | Samma `occurred_at` ordnas efter `id`, alltid lika. | [test_read_history.py](../backend/tests/test_read_history.py) (`test_hist11_same_time_is_ordered_by_id`, fast klocka) | Azalea | Nej | Grönt |
| HIST-12 | Ärende utan statusbyten har bara `created` | En lista med exakt en post (`created`), inte tom. | [test_read_history.py](../backend/tests/test_read_history.py) (`test_hist12_new_ticket_history_has_only_created`) | Azalea | Nej | Grönt |
| HIST-13 | Avslutat ärende kan öppnas igen | `closed` → `new` godkänns och loggas som vanligt statusbyte. | [test_status_rules.py](../backend/tests/test_status_rules.py) (`test_hist13_closed_ticket_can_be_opened_again`) | Nicklas | Nej | Grönt |
| HIST-14 | Fel på svenska för status och historik | Svenska meddelanden, aldrig stacktrace eller databasdetaljer. | [test_error_format.py](../backend/tests/test_error_format.py) (backenddelen, `test_hist14_…`, 2 tester) | Azalea, Amalia (UI) | Ja | Delvis: UI-delen saknas |

Ägare enligt [Teststrategin](teststrategi.md) (avsnitt 2). Azalea fyller i test och status
för sina rader i KSP-48. Nicklas tester för HIST-06, 07 och 13 (KSP-27) finns i
`test_status_rules.py`, som också kontrollerar invarianten efter varje scenario (PR #63).

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

Kommando (macOS/Linux): `cd backend && .venv/bin/python -m pytest -q`. Windows: se
[Teststrategin](teststrategi.md) (avsnitt 5).

## 5. Mutationsprövning

Mutationerna står i [Teststrategin](teststrategi.md) (avsnitt 3) och i specarna. Här sparas
resultatet: vilket test som föll, eller att inget föll och vad som ändrades i testet.

| Datum | Steg | Mutation | Krav | Test som föll | Gjord av |
| --- | --- | --- | --- | --- | --- |
| 2026-10-31 | 1 | M1b: historikposten `created` tas bort i `TicketService.create` | HIST-01, 02, 03 | 11 failed: HIST-01 ×3, HIST-02 ×2, HIST-03, HIST-11, HIST-12, invarianten och samma status (`test_history.py`, `test_read_history.py`). Alla på saknad `created`-post | Azalea |
| 2026-10-31 | 1 | M1: historikposten `status_changed` tas bort i `TicketService.change_status` | HIST-02, 03 | 9 failed: HIST-02 ×3, HIST-03, HIST-11, invarianten, historiken per ärende, kontraktsfälten (tack vare invariantraden från PR #61) och HIST-13 i `test_status_rules.py`. Alla på saknad `status_changed`-post | Azalea |
| 2026-11-01 | 1 | M2: `commit` flyttad före historikposten i `change_status` | HIST-09 | 9 failed, samma som M1: posten commitas aldrig och ser ut att saknas. **Delvis fångad:** inget test kontrollerar att statusen är oförändrad när historiken inte kan sparas. Testerna för HIST-09 med injicerat fel (KSP-41) behövs | Azalea |
| 2026-11-01 | 1 | M3: `commit` tas bort i `create` (bara `flush`) | HIST-04, CORE-02 | 52 failed, bland annat `test_core02_ticket_survives_restart`: inget sparas, så nästa begäran får 404 eller tomma listor | Azalea |
| 2026-11-01 | 1 | M3b: `commit` tas bort i `change_status` | HIST-04, HIST-02 | 32 failed: HIST-02 ×3, HIST-03, HIST-11 och 25 tester för statusreglerna (statusen sparas inte). Testet för kontraktsfälten klarade sig, eftersom status och post försvann tillsammans och invarianten höll | Azalea |

*Steg 1 kördes för hand på `335fe45` (main efter PR #61), en mutation i taget i en egen arbetskopia. Nollpunkt: 166 passed. Underlag: Azaleas loggbok och jämförelsetabell (lokalt).*

## 6. Testförslag från AI

En rad per gång en instruktion i [`docs/ai/`](ai/) används (Teststrategin, avsnitt 4).

| Datum | Krav | Instruktion | Förslag | Accepterade / ändrade / avvisade | Varför | Av |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-10-25 | CORE-11–14 | v1 | 23 tester, 6 frågor | Provkörning, inga tester skrivna | Jämförelse mot facit, se [v2-nicklas](ai/testforslag-v2-nicklas.md) | Nicklas |
| 2026-10-25 | CORE-11–14 | v2-nicklas | 29 tester (24 *Måste*) | Provkörning, inga tester skrivna | Alla 19 fall i facit kom med, se [v2-nicklas](ai/testforslag-v2-nicklas.md) | Nicklas |
| 2026-10-27 | KSP-21: CORE-09, 10, 16–18, HIST-14 | v1 | 25 tester, 6 frågor | 25 / 0 / 0 | Alla valdes, frågorna besvarades. Se PR #30 (svenskt felformat i backenden): https://github.com/desiboli/kundportal-ai-native-development/pull/30 | Azalea |
| 2026-10-28 | KSP-25 och 26 (tester för kärnan): CORE-02–05, 10–15, 17, 18 | v2-nicklas | 13 tester | 11 / 1 / 1 | Ett ändrades: två ärenden med samma tid skapas via tjänsten med en fast klocka. Ett ströks, rubrik med ett tecken fångade inget nytt. Se PR #39 (längd, tomma fält och tecken): https://github.com/desiboli/kundportal-ai-native-development/pull/39 och PR #41 (lista och visa ärenden): https://github.com/desiboli/kundportal-ai-native-development/pull/41 | Nicklas |
| 2026-10-28 | KSP-27 (tester för statusreglerna): HIST-06, 07, 13 | v2-nicklas, körd efter att testerna skrevs | 6 tester (4 Måste, 2 Bra att ha), 4 frågor | 4 / 0 / 0, 2 väntar på svar från specägaren | Måste-testerna var redan skrivna, samma 23 fall. Bra att ha-testerna väntar på svar om null och andra fält i PATCH. Se PR #43 (statusreglerna): https://github.com/desiboli/kundportal-ai-native-development/pull/43 | Nicklas |
