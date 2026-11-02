# Veckostatus vecka 7: vidareutveckling och arbetssätt

> Läget måndag 2026-11-02 (Azalea). Uppdateras under veckan. Jämför med veckans förväntningar i
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

## Genomfört

| Vad | Vem | Länk |
| --- | --- | --- |
| Mutationsprövningen steg 1 i verifieringsplanen: fem mutationer mot de egna historiktesterna (KSP-43) | Azalea | PR #67 (mutationsprövningen steg 1): https://github.com/desiboli/kundportal-ai-native-development/pull/67 · godkänd av Nicklas, mergad 2026-11-02 |
| Testinstruktion v2-azalea: sparning och atomicitet (KSP-50) | Azalea | PR #68 (testinstruktion v2-azalea): https://github.com/desiboli/kundportal-ai-native-development/pull/68 · godkänd av Nicklas, mergad 2026-11-02 |
| Veckostatus V6, slutversionen (KSP-53) | Azalea | PR #69 (veckostatus V6, slutversionen): https://github.com/desiboli/kundportal-ai-native-development/pull/69 · godkänd av Nicklas, mergad 2026-11-02 |
| Misstagslogg för Azaleas AI-agent, `docs/ai/misstag-azalea.md` (KSP-62) | Azalea | PR #70 (misstagslogg för Azaleas AI-agent): https://github.com/desiboli/kundportal-ai-native-development/pull/70 · mergad 2026-11-02 |

## Verifierat

- **KSP-41 (testerna för HIST-09), testerna först:** sju tester i `backend/tests/test_atomicity.py`
  från körning 4 med v2-azalea plus ett eget test på tjänstenivå. Felet injiceras som
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

## Osäkert eller ofärdigt

| Vad | Varför | Plan |
| --- | --- | --- |
| Tidslinjen och felmeddelandena i UI (KSP-37, KSP-38) | Inte påbörjade. Utan dem syns historiken inte i UI, vilket är förväntning 1 och demon | Amalia. Behöver komma igång i veckan |
| Formuläret i UI, PR #64 (KSP-30): https://github.com/desiboli/kundportal-ai-native-development/pull/64 | Ändringar begärda av Azalea och Amalia. Typfelet är åtgärdat | Azalea och Amalia granskar igen |
| Databasfel som ger 503 loggas inte | Orsaken sparas i felkedjan men skrivs aldrig ut (upptäckt i KSP-36) | Känd begränsning, till KSP-61 |
| Varning från Base UI i frontendtesterna: länken "Systemstatus" i ärendelistan är en `Button` som renderas som `Link` (`render={<Link …/>}`), så knappens semantik försvinner | Finns på `main` sedan ärendelistan (KSP-29). Syntes när Azalea körde testerna för PR #64 (formuläret) 2026-11-02. Blockerar inte, men påverkar tillgängligheten | Mustafa (listan) eller Amalia (UI och tillgänglighet), frågat i Slack |
| `create` gör `commit` utan `rollback` | Samma risk som `change_status` hade före KSP-36. Syns inte över HTTP | Eget ärende i Linear (Azalea beslutade 2026-11-02) |
| KSP-61 (kända begränsningar) saknar ägare i Linear | Fördelades inte på förra mötet | Fördelas i veckan. Azalea tog KSP-54 (veckostatus V7) 2026-11-02 |

## Nästa steg

| Vad | Ansvarig |
| --- | --- |
| Granska PR #77 (HIST-09 rollback och 503) och PR #76 (misstag 3 och 4 i misstagsloggen) | Nicklas |
| Granska PR #74 (fler fall för osynliga tecken och rubrikens gräns), PR #71 (ADR-002 och felmeddelanden i CORE-specen) och PR #64 (formuläret) | Azalea |
| Godkänna och merga statusbytet i UI, PR #65 | Mustafa |
| Tidslinjen och felmeddelandena i UI | Amalia (KSP-37, KSP-38) |
| Mutationerna igen med HIST-09-testerna, och omstartstestet för HIST-04 | Azalea (KSP-43, KSP-40) |
| Beskriva det återanvändbara momentet, `docs/ai/arbetssatt.md` | Azalea (KSP-60) |
| Fördela KSP-61 (kända begränsningar) | Alla |
