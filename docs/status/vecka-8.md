# Veckostatus vecka 8: demo och slutleverans

> Läget tisdag 2026-11-10 (Azalea). Uppdateras under veckan. Jämför med veckans förväntningar i
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
| Demon: flöde, beslut och verifiering, cirka fem minuter | KSP-57 | Mustafa presenterar *(fylls i: övriga delar)* |
| Demovideo | KSP-78 | Mustafa |
| Kända begränsningar, risker och vidareutveckling | KSP-61 | Azalea samordnar, alla |
| Utvärdering av arbetssättet | KSP-62 | Nicklas |
| Verifieringsplanen: Verifierat för urvalet | KSP-47, KSP-48 | Nicklas, Azalea |
| Följa README på egen dator, och rätta Node-kravet | KSP-19 | Nicklas (gjort 2026-11-04), Azalea (README) |
| Markerad slutversion och länk i Technigo#2 | KSP-56 | Mustafa |
| Veckostatus V8 | KSP-55 | Azalea |

## Läget tisdag

| Förväntning | Läge |
| --- | --- |
| 1. Demon: flöde, beslut och verifiering | Hela flödet finns på `main`: skapa, lista, visa, statusbyte, tidslinjen (HIST-05) och felmeddelanden på svenska (UI-delen av HIST-14). Backend 192 passed. Tidslinjen visar sedan teamets beslut 2026-11-09 den senaste posten överst, medan API:t ger äldst först (HIST-03). Demon planeras av Mustafa (KSP-57) |
| 2. Slutversion, körbar lösning och underlag | Körinstruktionerna är rättade: README kräver Node 22.19 (PR #110 (Node-kravet i README, KSP-19): https://github.com/desiboli/kundportal-ai-native-development/pull/110). CI kräver `backend` och `frontend` före merge (KSP-17). Kända begränsningar och risker ligger i PR #98 (KSP-61): https://github.com/desiboli/kundportal-ai-native-development/pull/98. Slutversionen markeras fredag (KSP-56) |
| 3. Utvärdering av arbetssättet | PR #57 (utvärdering av arbetssättet, KSP-62): https://github.com/desiboli/kundportal-ai-native-development/pull/57, öppen 2026-11-10 (Nicklas, KSP-62) |
| 4. Körinstruktionerna följda av någon annan | **Gjort** av Nicklas 2026-11-04 på macOS (KSP-19). Node-kravet rättat i PR #110, mergad 2026-11-08 |

## Genomfört

| Vad | Vem | Länk |
| --- | --- | --- |
| Felmeddelanden i UI (UI-delen av HIST-14, KSP-38) | Amalia | PR #107 (felmeddelanden i UI): https://github.com/desiboli/kundportal-ai-native-development/pull/107, mergad 2026-11-09 |
| Tidslinjen i detaljvyn (HIST-05, KSP-37), senaste posten överst | Amalia | PR #109 (tidslinjen i detaljvyn): https://github.com/desiboli/kundportal-ai-native-development/pull/109, mergad 2026-11-09 |
| Städning i testerna för statusreglerna (KSP-27) | Nicklas | PR #80 (städning efter granskning): https://github.com/desiboli/kundportal-ai-native-development/pull/80, mergad 2026-11-09 |
| Node-kravet i README (KSP-19) | Azalea | PR #110 (Node-kravet i README): https://github.com/desiboli/kundportal-ai-native-development/pull/110, mergad 2026-11-08 |
| HIST-01, 02, 04, 09 och 11 *Verifierat* (KSP-48) | Azalea | PR #111 (HIST Verifierat): https://github.com/desiboli/kundportal-ai-native-development/pull/111, mergad 2026-11-10 |
| *(fylls i: #113, #98, #112 och fler när de mergas)* | | |

## Verifierat

- *(fylls i: körresultat för hela sviten på slutversionen, backend och frontend)*
- *(fylls i: kontroll för hand av demoflödet, med commit)*

## Osäkert eller ofärdigt

| Vad | Varför | Plan |
| --- | --- | --- |
| HIST-03 (historiken äldst först) *Verifierat* | Tidslinjen vänder ordningen, så kontrollen för hand gjordes mot API:t 2026-11-10, och mutationen M4 vänder ordningen i API:t. Ligger i PR #113 (HIST-03 Verifierat, KSP-48): https://github.com/desiboli/kundportal-ai-native-development/pull/113 | Nicklas granskar |
| Demon (KSP-57) och demovideon (KSP-78) | Demon är torsdag 12/11 | Mustafa presenterar. Videon är In Progress |
| *(fylls i)* | | |

## Nästa steg

| Vad | Ansvarig |
| --- | --- |
| Markera slutversionen och länka den i Technigo#2 (KSP-56) | Mustafa |
| Lämna in individuella redovisningar i Disco senast 13/11 kl. 23.59 | Alla |
| *(fylls i)* | |
