# Veckostatus vecka 8: demo och slutleverans

> Läget torsdag 2026-11-12 efter demon (Azalea). *Verifierat* ifyllt torsdag kväll 2026-11-12 på `e01f69a`
> (Mustafa, med Claude Code). Slutläget fylls i fredag 13/11. Jämför med veckans förväntningar i
> Disco. Id förklaras kort: **KSP-xx** är ärenden i
> [Linear: Kundserviceportalen](https://linear.app/grupp6/project/kundserviceportalen-be4a4840b5ef),
> **CORE-xx** är kraven för kärnan ([SPEC-karna.md](../specs/SPEC-karna.md)) och **HIST-xx**
> kraven för statuslogik och historik ([SPEC-arendehistorik.md](../specs/SPEC-arendehistorik.md)).

## Planerat

Veckans förväntningar enligt kursen:

1. **Till demon torsdag 12/11:** den största delen av arbetet är genomförd, och vi kan visa ett fungerande centralt flöde, ett viktigt beslut och ett exempel på verifiering.
2. **Till slutdeadline fredag 13/11 kl. 23.59:** slutversionen är markerad, lösningen och testerna går att köra enligt instruktionerna, gruppens och varje students underlag är inlämnat, och kända begränsningar och återstående brister framgår.
3. Utvärdering av arbetssättet: var AI hjälpte, när det skapade extra arbete, vilka beslut vi fattade själva och vad vi skulle förbättra.
4. Någon annan än den som skrev körinstruktionerna har följt dem.

Teamets plan för veckan (enligt Linear):

| Vad | Ärende | Ansvarig |
| --- | --- | --- |
| Tidslinjen i detaljvyn (HIST-05) och felmeddelanden i UI (UI-delen av HIST-14) | KSP-37, KSP-38 | Amalia |
| Header, gemensam bredd, sök och filter i listan | KSP-75, KSP-76, KSP-77 | Mustafa |
| Demon: flöde, beslut och verifiering, cirka fem minuter | KSP-57 | Mustafa |
| Demovideo, till demon 2026-11-12. Utgår, ingår inte i slutleveransen | KSP-78 | Mustafa |
| Kända begränsningar, risker och vidareutveckling | KSP-61 | Azalea samordnar, alla |
| Utvärdering av arbetssättet | KSP-62 | Nicklas |
| Verifieringsplanen: Verifierat för urvalet | KSP-47, KSP-48 | Nicklas, Azalea |
| Följa README på egen dator, och rätta Node-kravet | KSP-19 | Nicklas (gjort 2026-11-04), Azalea (README) |
| Markerad slutversion och länk i Technigo#2 | KSP-56 | Mustafa |
| Veckostatus V8 | KSP-55 | Azalea |

## Läget torsdag

| Förväntning | Läge |
| --- | --- |
| 1. Demon: flöde, beslut och verifiering | Hela flödet finns på `main`: skapa, lista, visa, statusbyte, tidslinjen (HIST-05) och felmeddelanden på svenska (UI-delen av HIST-14). Backend 192 passed. Tidslinjen visar sedan teamets beslut 2026-11-09 den senaste posten överst, medan API:t ger äldst först (HIST-03). **Gjort:** teamet höll demon 2026-11-12 (KSP-57) |
| 2. Slutversion, körbar lösning och underlag | Körinstruktionerna är rättade: README kräver Node 22.19 (PR #110 (Node-kravet i README, KSP-19): https://github.com/desiboli/kundportal-ai-native-development/pull/110). CI kräver `backend` och `frontend` före merge (KSP-17). Kända begränsningar och risker finns i `docs/begransningar-och-risker.md` (KSP-61, PR #98, #115 och #116). Slutversionen markeras fredag (KSP-56) |
| 3. Utvärdering av arbetssättet | **Gjort.** PR #57 (utvärdering av arbetssättet, KSP-62): https://github.com/desiboli/kundportal-ai-native-development/pull/57, öppnad 2026-10-30 och mergad 2026-11-11 (Nicklas). Utvärderingen finns i `docs/ai/utvardering.md` |
| 4. Körinstruktionerna följda av någon annan | **Gjort** av Nicklas 2026-11-04 på macOS (KSP-19). Node-kravet rättat i PR #110, mergad 2026-11-08 |

## Genomfört

| Vad | Vem | Länk |
| --- | --- | --- |
| Felmeddelanden i UI (UI-delen av HIST-14, KSP-38) | Amalia | PR #107 (felmeddelanden i UI): https://github.com/desiboli/kundportal-ai-native-development/pull/107, mergad 2026-11-09 |
| Tidslinjen i detaljvyn (HIST-05, KSP-37), senaste posten överst | Amalia | PR #109 (tidslinjen i detaljvyn): https://github.com/desiboli/kundportal-ai-native-development/pull/109, mergad 2026-11-09 |
| Städning i testerna efter Azaleas granskningar av #71 och #74 (KSP-27, KSP-26) | Nicklas | PR #80 (städning efter granskning): https://github.com/desiboli/kundportal-ai-native-development/pull/80, mergad 2026-11-09 |
| Node-kravet i README (KSP-19) | Azalea | PR #110 (Node-kravet i README): https://github.com/desiboli/kundportal-ai-native-development/pull/110, mergad 2026-11-08 |
| HIST-01, 02, 04, 09 och 11 *Verifierat* (KSP-48) | Azalea | PR #111 (HIST Verifierat): https://github.com/desiboli/kundportal-ai-native-development/pull/111, mergad 2026-11-10 |
| HIST-03 (historiken äldst först) *Verifierat*, mutationen M4 och kontrollen för hand mot API:t (KSP-48) | Azalea | PR #113 (HIST-03 Verifierat): https://github.com/desiboli/kundportal-ai-native-development/pull/113, mergad 2026-11-10 |
| Veckostatus V8, läget tisdag (KSP-55) | Azalea | PR #114 (veckostatus V8): https://github.com/desiboli/kundportal-ai-native-development/pull/114, mergad 2026-11-10 |
| Kända begränsningar, risker och vidareutveckling (KSP-61) | Azalea samordnade, alla | PR #98 (kända begränsningar): https://github.com/desiboli/kundportal-ai-native-development/pull/98, mergad 2026-11-10 |
| Frontendbegränsningen för de genererade typerna (KSP-61) | Mustafa | PR #115 (frontendbegränsningen): https://github.com/desiboli/kundportal-ai-native-development/pull/115, mergad 2026-11-10 |
| Två begränsningar i sök och filter i listan (KSP-61) | Mustafa | PR #116 (sök och filter): https://github.com/desiboli/kundportal-ai-native-development/pull/116, mergad 2026-11-10 |
| Utvärdering av arbetssättet (KSP-62) | Nicklas | PR #57 (utvärderingen): https://github.com/desiboli/kundportal-ai-native-development/pull/57, mergad 2026-11-11 |
| Spec för felmeddelanden i UI och tidslinjen, med undantaget från HIST-05 under en ny hämtning (KSP-38, KSP-37) | Amalia | PR #112 (specen för felmeddelanden och tidslinjen): https://github.com/desiboli/kundportal-ai-native-development/pull/112, mergad 2026-11-11 |
| Gemensam felhantering för API-anrop, inget beteende ändrat (KSP-79) | Amalia | PR #117 (gemensam felhantering): https://github.com/desiboli/kundportal-ai-native-development/pull/117, mergad 2026-11-12 |

## Verifierat

Körda 2026-11-12 på `e01f69a` (merge av PR #118, veckostatus V8 torsdag), samma kommandon som CI:

- **Backend:** `python -m pytest -q` gav 192 passed.
- **Frontend:** `pnpm lint` utan fel, `pnpm build` lyckades och `pnpm test:run` gav 101 passed i 11 testfiler.
- **CI på `main`:** `tests` grön för `e01f69a`.
- **Demoflödet i webbläsaren** på `e01f69a`, backend på port 8010 med en tom tillfällig databas och
  `pnpm dev`. Genomgånget av Claude Code via Playwright på Mustafas uppdrag, inte för hand av en människa:
  1. Tom lista visar "Inga ärenden än" (CORE-15, tom lista är inget fel).
  2. Tomt formulär ger "Rubrik måste fyllas i. Beskrivning måste fyllas i. Välj en giltig kategori. Välj en
     giltig prioritet." (CORE-18, alla meddelanden i fältordning, och CORE-06, CORE-07 och CORE-08: rubrik saknas,
     beskrivning saknas, okänd kategori eller prioritet).
  3. Ett påhittat ärende (Faktura och betalning, Hög) registreras och syns i listan som #1 med status Nytt
     (CORE-01, ärendet skapas med status `new`).
  4. Detaljvyn visar de sparade uppgifterna och tidslinjen med "Ärendet skapades" (CORE-04, ärendet
     hämtas med sitt id).
  5. Status Nytt till Pågående sparas. Tidslinjen visar "Nytt → till Pågående (aktuell status)" överst
     (HIST-05, tidslinjen i detaljvyn).
  6. `/tickets/999` visar "Ärendet finns inte." och en länk tillbaka (CORE-10, okänt ärende ger 404).
  7. Efter omstart av backend mot samma databas ger API:t ärendet med `in_progress` och två
     historikposter äldst först, `created` och `status_changed` (CORE-02, ärendet finns kvar efter omstart,
     och HIST-03, historiken äldst först).

  Webbläsarens konsol visade bara 422- och 404-svaren från steg 2 och 6, inga fel i appen.

## Osäkert eller ofärdigt

| Vad | Varför | Plan |
| --- | --- | --- |
| Frågan på demon varför 16 av 18 nya tester föll för KSP-37 (tidslinjen) | Vi hade inget tydligt svar direkt. Svaret: testerna skrevs före koden mot ett tomt skal (`9970983`), så 16 föll av rätt anledning. De 2 gröna var HIST-08-testerna (okänt ärende ger 404 och ingen historik), och mutationen TL1 visar att de skyddar 404-fallet (`docs/verifiering.md`, avsnitt 4 och 5) | Förklaringen fanns bara i commit-meddelandet. Lärdom: skriv varför ett test är grönt före koden där resultatet redovisas |

## Nästa steg

| Vad | Ansvarig |
| --- | --- |
| Markera slutversionen och länka den i Technigo#2 (KSP-56) | Mustafa |
| Lämna in individuella redovisningar i Disco senast 13/11 kl. 23.59 | Alla |
| Veckostatus V8: slutläget, med länken till slutversionen (KSP-55) | Azalea |
