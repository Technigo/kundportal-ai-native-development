# Teamets AI-arbetsflöde

> Version 1, 2026-11-02 · Ansvarig: Azalea (KSP-60) · Granskare: Nicklas · Länkat från `AGENTS.md`,
> ska länkas från den löpande PR:n (Technigo#2). Id förklaras kort: **KSP-xx** är ärenden i Linear,
> **CORE-xx** kraven för kärnan och **HIST-xx** kraven för statuslogik och historik.

Det här dokumentet samlar hur AI ingår i Grupp 6:s arbete, från spec till granskning. Reglerna står i
[`AGENTS.md`](../../AGENTS.md). Här står **flödet**, det **återanvändbara momentet** och **var en
människa alltid bestämmer**.

## 1. Flödet steg för steg

| Steg | Vad som händer | AI:s roll | Människans roll | Var det syns |
| --- | --- | --- | --- | --- |
| 1. Spec med krav-id | Varje krav får ett id (CORE-01–18, HIST-01–14) med Givet/När/Då | Föreslår formuleringar och luckor | Ägaren bestämmer kravet. Någon annan granskar | `docs/specs/`, beslut i ADR (`docs/decisions/`) |
| 2. Testförslag | AI föreslår tester för ett krav-id enligt teamets instruktion, **utan att skriva testkod** | Skriver förslaget | — | `docs/ai/testforslag-v1.md`, skillen `testforslag` |
| 3. Granskning av förslagen | Varje förslag väljs, stryks eller ändras | — | Väljer, och kontrollerar förslagens påståenden mot specen | Granskningen sparas i ärendets underlag |
| 4. Tester före koden | De valda testerna skrivs och körs. De ska **falla av rätt anledning** | Skriver testerna efter människans val | Läser testerna, kör dem och kontrollerar felraden | En egen commit "test: … före koden" |
| 5. Koden | Koden skrivs tills testerna är gröna. Större moment körs som **agentuppdrag** | Skriver koden, i agentuppdrag i en egen session | Godkänner varje kontrollpunkt och läser hela diffen | `docs/ai/agentuppdrag/` |
| 6. Kontroll av testerna | Fel läggs in med flit (mutationer) för att se att testerna fångar rätt risk, egna och korsvis | Föreslår mutationer, kan köra dem i ett agentuppdrag | Gissar före körningen och tolkar resultatet | `docs/verifiering.md` avsnitt 5 |
| 7. PR med granskning | Egen branch, PR med krav-id och "Hur AI användes", någon annan granskar | Utkast till PR-text och granskning | Granskaren läser hela diffen, kör testerna och skriver vad hen själv kontrollerat | GitHub, CI kör backendtesterna och frontendens lint, build och vitest |
| 8. Veckostatus | Läget jämförs med veckans förväntningar | Utkast utifrån PR:er och Linear | Ansvarig kontrollerar mot kursmaterialet | `docs/status/vecka-N.md` |
| 9. Misstagslogg | När AI gör fel föreslår den misstaget och en regel | Föreslår regeln | Godkänner regeln innan den skrivs in | `docs/ai/misstag-<namn>.md` |

**Exempel på hela flödet:** HIST-09 (inget ändras om historikposten inte kan sparas). Förslag från
v2-azalea granskades, sju tester skrevs före koden och föll av rätt anledning (`fa54194`), koden
byggdes som agentuppdrag med fyra kontrollpunkter (`docs/ai/agentuppdrag/KSP-36.md`), och mutationen
"`commit` före historikposten" fångas nu av rätt tester. [PR #77](https://github.com/desiboli/kundportal-ai-native-development/pull/77).

## 2. Det återanvändbara momentet: instruktionen för testförslag

**Vad:** [`docs/ai/testforslag-v1.md`](testforslag-v1.md) (Nicklas, granskad av Azalea 2026-10-25).
Den fungerar i alla AI-verktyg och finns också som skillen `testforslag` i `.claude/skills/`.

**Så används den:**

```text
Föreslå tester för CORE-07 enligt docs/ai/testforslag-v1.md. Skriv ingen testkod.
```

Förslaget blir en tabell med testnamn, krav-id, Givet/När/Då, förväntat resultat, testnivå och
**vilken mutation som ska få testet att falla**, och sist frågor om specen är otydlig.

**Exempel på faktisk användning:**

| Ärende | Krav | Vad som hände |
| --- | --- | --- |
| KSP-21 (svenskt felformat) | CORE-09, 10, 16–18, HIST-14 | 25 förslag i agentuppdragets första steg. Alla valdes, och testerna föll av rätt anledning före koden: 43 failed → 80 passed ([PR #30](https://github.com/desiboli/kundportal-ai-native-development/pull/30)) |
| KSP-22 (`POST /tickets`) | CORE-01, 05–09, 11–14 | Tio tester (21 fall) enligt v1, före koden: 21 failed → 100 passed ([PR #34](https://github.com/desiboli/kundportal-ai-native-development/pull/34)) |
| KSP-33, 34 (historiken) | HIST-01, 02, 07, 10 | Granskade av Azalea 2026-10-28, före koden: 10 failed → 117 passed ([PR #44](https://github.com/desiboli/kundportal-ai-native-development/pull/44)) |
| KSP-25, 26 (CORE-tester) | CORE-02–04, 10–15 | Med Nicklas förbättring v2-nicklas, granskade 2026-10-28 |
| KSP-41 (HIST-09) | HIST-09 | Med Azaleas förbättring v2-azalea, körning 4: av sju förslag valdes fem, ett ändrades och ett ströks. Ett test på tjänstenivå lades till, som AI rekommenderade och Azalea valde |

**Förbättringar:** var och en har gjort en egen, namngiven version som jämförts med v1:
[`testforslag-v2-nicklas.md`](testforslag-v2-nicklas.md) och
[`testforslag-v2-azalea.md`](testforslag-v2-azalea.md) (sparning och atomicitet, [PR #68](https://github.com/desiboli/kundportal-ai-native-development/pull/68)).

### Vad som fortfarande kräver mänsklig granskning

Instruktionen gör förslagen bättre, men ersätter inte granskningen. Exempel där en människa behövdes:

- **Förslagens påståenden stämmer inte alltid.** I jämförelsen av v1 och v2-azalea sa båda
  versionerna att "alla tester faller i dag" för HIST-09. Det höll inte: bara 2 av 5 respektive 2 av 6
  föll, och av fel skäl (500 i stället för 503). Påståendena kontrolleras därför genom att köra testerna.
- **AI kan ha fel om verktygen.** AI påstod att Pydantic kontrollerar längden före trimningen. Ett
  litet skript som Azalea körde själv visade motsatsen, och det styrde hur trimningen byggdes (KSP-22).
- **Luckor som ingen förslagskörning täcker.** Alla fyra körningarna för HIST-09 såg att "rollback tas
  bort" inte går att fånga över HTTP, men ingen föreslog ett test som fångar det. Testet på tjänstenivå
  kom till i granskningen efteråt: AI rekommenderade det och Azalea valde det.
- **Rätt anledning.** Ett rött test betyder inte att det prövar rätt risk. Mutationen "`commit` före
  historikposten" fångades först bara som "en post saknas" (9 failed). Det syntes bara för att någon
  läste felraderna.
- **Specen äger svaret.** Förväntade felmeddelanden ska vara exakt specens text. Är specen otydlig
  skriver AI en fråga, och kravets ägare bestämmer.

Granskningslistan står sist i instruktionen: varje test kopplat till ett krav-id, exakt förväntat
resultat, en mutation per test och inget som specen inte säger.

## 3. Agentuppdrag

Större moment körs av en agent i en **egen session**, med ett uppdrag som sparas i repot **före**
körningen. Uppdraget innehåller mål, vad agenten ska läsa, uppgiften steg för steg, gränser (vilka
filer den får röra), kontrollpunkter där den stannar och väntar, när det är klart och vad rapporten
ska innehålla. Efteråt fyller ägaren i hinder och frågor och sin granskning.

| Uppdrag | Vad | Kontrollpunkter |
| --- | --- | --- |
| [KSP-21](agentuppdrag/KSP-21.md) (Azalea) | Svenskt felformat i backenden | 4 |
| [KSP-44](agentuppdrag/KSP-44.md) (Nicklas) | Mutationsprövning av egna tester | En per mutation |
| [KSP-36](agentuppdrag/KSP-36.md) (Azalea) | HIST-09: rollback och 503, teamets längre agentarbete vecka 7 | 4 |

Agentens rapport granskas också. I KSP-36 påstod agenten i en kodkommentar att ett databasfel loggas,
vilket inte stämde, och rapporten tog åt sig upptäckten. Det rättades och blev en regel i
misstagsloggen.

## 4. Var AI inte får bestämma själv

Från [`AGENTS.md`](../../AGENTS.md):

**Fråga först:**
- Ändra tabellen `tickets`.
- Lägga till ett beroende.
- Ändra API-kontraktet eller felmeddelanden som frontend redan använder.
- Ändra i någon annans spec eller del.

**Aldrig:**
- Committa hemligheter eller riktiga personuppgifter.
- Ta bort eller försvaga ett test som faller utan att teamet godkänt det.
- Ändra eller radera historikposter från applikationskod.
- Pusha direkt till `main` eller merga den löpande PR:en.

Dessutom: en människa godkänner varje regel i misstagsloggarna, varje kontrollpunkt i ett
agentuppdrag och varje PR innan merge.

## 5. Kända begränsningar i arbetssättet

- Samma instruktion kan ge olika många förslag vid två körningar (HIST-09 med v2: 7 och 4).
- Jämförelserna av instruktionerna är gjorda med en modell och på ett fåtal krav.
