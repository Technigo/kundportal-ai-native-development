# Veckostatus vecka 7: vidareutveckling och arbetssätt

> Läget måndag 2026-11-02 och onsdag 2026-11-04 (Azalea). Uppdateras under veckan. Jämför med veckans förväntningar i
> Disco. Id förklaras kort: **KSP-xx** är ärenden i
> [Linear: Kundserviceportalen](https://linear.app/grupp6/project/kundserviceportalen-be4a4840b5ef),
> **CORE-xx** är kraven för kärnan ([SPEC-karna.md](../specs/SPEC-karna.md)) och **HIST-xx**
> kraven för statuslogik och historik ([SPEC-arendehistorik.md](../specs/SPEC-arendehistorik.md)).

## Planerat

Veckans förväntningar enligt kursen:

1. Den kompletterande funktionen (ärendehistoriken) är integrerad med resten av lösningen, och vi har kontrollerat att de fungerar tillsammans.
2. Ett längre agentarbete är prövat, med kontrollpunkter och hur hinder hanterades dokumenterade.
3. Ett återkommande AI-stött arbetsmoment går att återanvända, med instruktioner och exempel på faktisk användning.
4. Specifikationer, verifieringsresultat och kända begränsningar är uppdaterade.

Teamets plan för veckan (enligt Linear):

| Vad | Ärende | Ansvarig |
| --- | --- | --- |
| Statusbyte och formulär i UI, så att hela flödet går att köra i webbläsaren | KSP-30, KSP-32 | Mustafa, Amalia |
| Tidslinjen i detaljvyn (HIST-05) och felmeddelanden i UI (HIST-14) | KSP-37, KSP-38 | Amalia |
| Komponenttester för lista, formulär och statusbyte, och för tidslinje och felmeddelanden | KSP-46, KSP-45 | Mustafa, Amalia |
| Atomicitet när historikposten inte kan sparas (HIST-09): testerna först och koden som agentuppdrag, teamets längre agentarbete | KSP-41, KSP-36, KSP-63 | Azalea |
| Omstart: status och historik finns kvar (HIST-04) | KSP-40 | Azalea |
| Mutationsprövning, egna och korsvis | KSP-43, KSP-44 | Azalea, Nicklas |
| Teamets AI-arbetsflöde och det återanvändbara momentet (instruktionen för testförslag) | KSP-60 | Azalea |
| Utvärdering av arbetssättet och misstagsloggarna | KSP-62 | Nicklas |
| Kända begränsningar, risker och vidareutveckling | KSP-61 | *ingen ägare än* |
| Veckostatus V7 | KSP-54 | Azalea |

## Läget måndag

| Förväntning | Läge |
| --- | --- |
| 1. Historiken integrerad och kontrollerad med resten | **Pågår.** Backenden för historiken är klar och prövad tillsammans med kärnan (175 passed med PR #77). I UI saknas tidslinjen (KSP-37) och felmeddelandena (KSP-38). Statusbytet i UI, PR #65 (KSP-32): https://github.com/desiboli/kundportal-ai-native-development/pull/65, väntar på Mustafas godkännande |
| 2. Längre agentarbete med kontrollpunkter och hinder | **Klart, väntar på granskning.** HIST-09 byggt av en agent med fyra kontrollpunkter. Uppdraget, hinder och frågor och granskningen står i `docs/ai/agentuppdrag/KSP-36.md`, PR #77 (HIST-09 rollback och 503, tester först och agentuppdrag): https://github.com/desiboli/kundportal-ai-native-development/pull/77. Nicklas körde också sin mutationsprövning som agentuppdrag, PR #72: https://github.com/desiboli/kundportal-ai-native-development/pull/72 |
| 3. Återkommande AI-stött moment, återanvändbart | **Delvis.** Instruktionen för testförslag (`docs/ai/testforslag-v1.md`, också som skillen `testforslag`) har använts i flera ärenden. Senast valdes testerna för HIST-09 ur förslag från v2-azalea (körning 4), som är mergad i PR #68. Beskrivningen av hur momentet används och vad som kräver mänsklig granskning (KSP-60) är inte skriven än |
| 4. Specar, verifiering och kända begränsningar uppdaterade | **Pågår.** Resultatet av Nicklas mutationsprövning och nya felmeddelanden i CORE-specen ligger i öppna PR:er (#71, #73). HIST-09 i verifieringsplanen och KSP-61 (kända begränsningar) återstår |

## Läget onsdag

| Förväntning | Läge |
| --- | --- |
| 1. Historiken integrerad och kontrollerad med resten | **Pågår.** Backenden är klar: HIST-04 (kvar efter omstart), HIST-09 (inget ändras om historikposten inte kan sparas) och HIST-10 (ett ärende som inte kan skapas lämnar ingen historik) är gröna, 192 passed. Formuläret och statusbytet i UI är mergade (#64, #65). I UI saknas fortfarande tidslinjen (HIST-05, KSP-37) och felmeddelandena (UI-delen av HIST-14, KSP-38) |
| 2. Längre agentarbete med kontrollpunkter och hinder | **Klart.** PR #77 (HIST-09 rollback och 503): https://github.com/desiboli/kundportal-ai-native-development/pull/77, godkänd av Nicklas och mergad 2026-11-03 |
| 3. Återkommande AI-stött moment, återanvändbart | **Klart.** `docs/ai/arbetssatt.md` beskriver flödet och momentet (PR #79 (teamets AI-arbetsflöde): https://github.com/desiboli/kundportal-ai-native-development/pull/79). Instruktionen v2-azalea användes i KSP-40 och KSP-66 |
| 4. Specar, verifiering och kända begränsningar uppdaterade | **Delvis.** HIST-specen v0.10, verifieringsplanen och ADR-001 är uppdaterade (#81, #82, #95, #96). Dokumentet om kända begränsningar (KSP-61) saknas och har ingen ägare |

## Genomfört

| Vad | Vem | Länk |
| --- | --- | --- |
| Mutationsprövningen steg 1 i verifieringsplanen: fem mutationer mot de egna historiktesterna (KSP-43) | Azalea | PR #67 (mutationsprövningen steg 1): https://github.com/desiboli/kundportal-ai-native-development/pull/67 · godkänd av Nicklas, mergad 2026-11-02 |
| Testinstruktion v2-azalea: sparning och atomicitet (KSP-50) | Azalea | PR #68 (testinstruktion v2-azalea): https://github.com/desiboli/kundportal-ai-native-development/pull/68 · godkänd av Nicklas, mergad 2026-11-02 |
| Veckostatus V6, slutversionen (KSP-53) | Azalea | PR #69 (veckostatus V6, slutversionen): https://github.com/desiboli/kundportal-ai-native-development/pull/69 · godkänd av Nicklas, mergad 2026-11-02 |
| Misstagslogg för Azaleas AI-agent, `docs/ai/misstag-azalea.md` (KSP-62) | Azalea | PR #70 (misstagslogg för Azaleas AI-agent): https://github.com/desiboli/kundportal-ai-native-development/pull/70 · mergad 2026-11-02 |

| Formulär för att skapa ärende (KSP-30) | Mustafa | PR #64 (formulär för att skapa ärende): https://github.com/desiboli/kundportal-ai-native-development/pull/64 · mergad 2026-11-03 |
| Statusbyte i detaljvyn (KSP-32) | Amalia | PR #65 (statusbyte i detaljvyn): https://github.com/desiboli/kundportal-ai-native-development/pull/65 · mergad 2026-11-03 |
| Statusraderna gröna, ADR-002 och felmeddelanden i CORE-specen (KSP-27) | Nicklas | PR #71 (statusraderna gröna och ADR-002): https://github.com/desiboli/kundportal-ai-native-development/pull/71 · mergad 2026-11-02 |
| Mutationsprövningen av Nicklas tester, egna och korsvis (KSP-44) | Nicklas | PR #72 (agentuppdraget): https://github.com/desiboli/kundportal-ai-native-development/pull/72 · PR #73 (resultatet): https://github.com/desiboli/kundportal-ai-native-development/pull/73 · mergade 2026-11-02 och 2026-11-03 |
| Fler fall för osynliga tecken och gemensam kontroll av invarianten (KSP-26, KSP-27) | Nicklas | PR #74 (osynliga tecken): https://github.com/desiboli/kundportal-ai-native-development/pull/74 · PR #75 (invarianten i conftest.py): https://github.com/desiboli/kundportal-ai-native-development/pull/75 · mergade 2026-11-02 |
| HIST-09 rollback och 503, tester först och agentuppdrag 2 (KSP-41, KSP-36) | Azalea | PR #77 (HIST-09 rollback och 503): https://github.com/desiboli/kundportal-ai-native-development/pull/77 · godkänd av Nicklas, mergad 2026-11-03 |
| Teamets AI-arbetsflöde, `docs/ai/arbetssatt.md` (KSP-60) | Azalea | PR #79 (teamets AI-arbetsflöde): https://github.com/desiboli/kundportal-ai-native-development/pull/79 · godkänd av Nicklas, mergad 2026-11-03 |
| Misstag 3–5 i Azaleas misstagslogg (KSP-62) | Azalea | PR #76 (misstag 3 och 4): https://github.com/desiboli/kundportal-ai-native-development/pull/76 · PR #83 (misstag 5): https://github.com/desiboli/kundportal-ai-native-development/pull/83 · mergade 2026-11-03 och 2026-11-04 |
| Frontendjobb i CI med lint, build och vitest (KSP-18) | Mustafa | PR #84 (frontendjobb i CI): https://github.com/desiboli/kundportal-ai-native-development/pull/84 · mergad 2026-11-03 |
| Körresultat för listans och formulärets komponenttester (KSP-67, KSP-68) | Mustafa | PR #86 (listans komponenttester): https://github.com/desiboli/kundportal-ai-native-development/pull/86 · PR #87 (formulärets komponenttester): https://github.com/desiboli/kundportal-ai-native-development/pull/87 · mergade 2026-11-03 |
| HIST-09 grön i verifieringsplanen och ADR-001 prövad (KSP-41, KSP-48, KSP-8) | Azalea | PR #81 (HIST-09 grön i verifieringsplanen): https://github.com/desiboli/kundportal-ai-native-development/pull/81 · PR #82 (ADR-001 prövad): https://github.com/desiboli/kundportal-ai-native-development/pull/82 · PR #95 (rad 5 fångad): https://github.com/desiboli/kundportal-ai-native-development/pull/95 · mergade 2026-11-04 |
| Omstartstesterna för HIST-04 (KSP-40) | Azalea | PR #93 (HIST-04 status och historik efter omstart): https://github.com/desiboli/kundportal-ai-native-development/pull/93 · godkänd av Nicklas, mergad 2026-11-04 |
| Rollback i `TicketService.create`, HIST-10, och kontroll för hand av HIST-14 (KSP-66, KSP-48) | Azalea | PR #96 (rollback i TicketService.create): https://github.com/desiboli/kundportal-ai-native-development/pull/96 · godkänd av Nicklas, mergad 2026-11-04 |
## Verifierat

- **KSP-41 (testerna för HIST-09), testerna först:** sju tester i `backend/tests/test_atomicity.py`
  från körning 4 med v2-azalea plus ett test på tjänstenivå, som AI rekommenderade och Azalea valde. Felet injiceras som
  `SQLAlchemyError` före och efter `flush`. Före koden (`fa54194`): `3 failed, 170 passed`, två
  500 i stället för 503 och en `SameStatus` utan rollback.
- **KSP-36 (koden för HIST-09) som agentuppdrag:** agenten stannade vid varje kontrollpunkt.
  Efter koden (`eb806a4`): `173 passed`. Två tester för andra fel än databasfel (500) skrevs efter
  koden (`ba84f13`) och visades falla vid var sin mutation: `175 passed`.
- **KSP-36, manuellt på port 8010 (Azalea, 2026-11-02):** statusbyte 200, samma status 409
  "Ärendet har redan den statusen.", okänt ärende 404 "Ärendet finns inte.". Historiken hade två
  poster, och det nekade bytet lämnade ingen.
- **Granskningar 2026-11-02 (Azalea):**
  - PR #72 (agentuppdraget för Nicklas mutationsprövning, KSP-44): godkänd.
  - PR #73 (resultatet av mutationsprövningen, KSP-44): godkänd. Nicklas korsvisa mutation
    (`id.desc()` i sorteringen av historiken) fångades bara av Azaleas test för HIST-11 (samma tid
    ordnas efter id), eftersom det är det enda med en fast klocka.
  - PR #75 (gemensam kontroll av invarianten i `conftest.py`, KSP-27 och KSP-39): godkänd. Bygger
    på Azaleas förslag i granskningen av PR #63.

- **KSP-40 (testerna för HIST-04, status och historik kvar efter omstart), 2026-11-04:** tre
  tester i `backend/tests/test_restart.py` från körning 2 med v2-azalea, skrivna efter koden
  eftersom sparningen redan finns. `186 passed` (`2b6ba41`). Mutationerna, körda av Azalea:
  M3 (`commit` bort i `create`) 3 av 3 föll, M3b (`commit` bort i `change_status`) 1 av 3.
  PR #93 (HIST-04 status och historik efter omstart): https://github.com/desiboli/kundportal-ai-native-development/pull/93, godkänd av Nicklas och mergad 2026-11-04.
- **KSP-66 (rollback i `create`, HIST-10), 2026-11-04:** sex tester före koden. Azalea hittade med ett
  skript att nästa `create` utan rollback sparade det misslyckade ärendet utan historikpost. Före koden
  2 failed, efter `192 passed`. Mutationerna K1 och K2 fångas. API:t svarar 500 som förut (Azaleas beslut).
- **HIST-14 för hand (Azalea, 2026-11-04):** sju felfall i `/docs`, alla på svenska utan tekniska detaljer.

## Osäkert eller ofärdigt

| Vad | Varför | Plan |
| --- | --- | --- |
| Tidslinjen och felmeddelandena i UI (KSP-37, KSP-38) | Inte påbörjade. Utan dem syns historiken inte i UI, vilket är förväntning 1 och demon | Amalia. Behöver komma igång i veckan |
| ~~Formuläret i UI, PR #64 (KSP-30)~~ | Mergad 2026-11-03 | Klart |
| Databasfel som ger 503 loggas inte | Orsaken sparas i felkedjan men skrivs aldrig ut (upptäckt i KSP-36) | Känd begränsning, till KSP-61 |
| Varning från Base UI i frontendtesterna: länken "Systemstatus" i ärendelistan är en `Button` som renderas som `Link` (`render={<Link …/>}`), så knappens semantik försvinner | Finns på `main` sedan ärendelistan (KSP-29). Syntes när Azalea körde testerna för PR #64 (formuläret) 2026-11-02. Blockerar inte, men påverkar tillgängligheten | Mustafa (listan) eller Amalia (UI och tillgänglighet), frågat i Slack |
| ~~`create` gör `commit` utan `rollback`~~ | Löst i KSP-66, PR #96 (rollback i TicketService.create): https://github.com/desiboli/kundportal-ai-native-development/pull/96 | Klart |
| KSP-61 (kända begränsningar) saknar fortfarande ägare | Krävs i gruppens underlag till slutleveransen 2026-11-13 | Fördelas på nästa möte |

## Nästa steg

| Vad | Ansvarig |
| --- | --- |
| Tidslinjen och felmeddelandena i UI (HIST-05, KSP-37, KSP-38) | Amalia |
| Länkar i Technigo#2 till vecka 7 och `docs/ai/arbetssatt.md` (KSP-54, KSP-60), och krav på grön CI i rulesetet (KSP-17) | Mustafa |
| Följa README på egen dator (KSP-19) | Nicklas eller Mustafa |
| Kända begränsningar, risker och vidareutveckling (KSP-61) | Fördelas |
| Sammanfattningen av utvärderingen, PR #57 (KSP-62) | Nicklas, när alla har svarat |
