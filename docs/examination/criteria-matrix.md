# G- och VG-kriterier: evidensmatris

Statusen gäller teamets synliga underlag, inte enskilda studenters betyg. Individuell redovisning ska skrivas separat i Disco och länka till studentens egna bidrag.

## G

| Kriterium | Underlag i projektet | Status och nästa evidens |
|---|---|---|
| Förstå arbetssättet och eget ansvar | [Beslutslogg](./decision-log.md), [chattexcerpt och sessionsindex](./conversation-log.md), instruktioner och skills | **Egen reflektion finns, självrapporterad.** Studenten beskriver beslut om funktionella krav, helhetsgranskning och AI-begränsningar; ska själv använda exemplet i Disco och kunna förklara kontrollerna. |
| Problem, specifikation och nedbrytning | [Vertikala tickets](../features/README.md), krav-ID:n, acceptanskriterier och [PR #25](https://github.com/misael86/kundportal-ai-native-development/pull/25) | **Egen insats självrapporterad; artefakter spårbara.** Misael uppger att han tog initiativ till GitHub-upplägg och första projektgrund när gruppen krympte till två, och att han och Carter sedan började om gemensamt. Git visar första scaffold i commit `e7012eb6`, merge genom PR #22 och revert i `a386dbf4`. Misael uppger att han själv gjorde PR #21:s planeringsbranch; för arbete före `feture/redesign` skiljs hans minnesbild från teamets resultat. |
| Prompting och kontextstyrning | [Copilot-instruktioner](../../.github/copilot-instructions.md), [skills](../../.github/skills/), sessionsutdrag | **Delvis, självrapporterat.** Misael beskriver AI-förslag på branchen som missade helhetsändringar eller lade till visuella krav; exempel finns i [sessionsindexet](./conversation-log.md). Förklara konkret kontext och egna korrigeringar i Disco. |
| Implementation, testning och felsökning | [Verifieringsplan](./verification-plan.md), kod, kravmärkta tester och PR #25 | **Egen implementation och manuell testning självrapporterad; resultatdetaljer saknas.** Dokumentera ett konkret manuellt scenario och utfall. De automatiska körresultaten här är inte personligt attribuerade. |
| Planering, prompting och agentarbete | [Planeringsgrenen `docs/project-plan-and-specs`](https://github.com/misael86/kundportal-ai-native-development/tree/docs/project-plan-and-specs) och [PR #21](https://github.com/misael86/kundportal-ai-native-development/pull/21) | **Egen insats självrapporterad och branchspårbar.** Misael uppger att han gjorde hela branchen själv med Copilot som stöd; GitHub visar honom som PR-författare och som författare till 15 av 17 commits, medan två är författade av Copilot. PR #21 stängdes utan merge. Playwright E2E och CI var planerade, inte implementerade på grenen. Individuell reflektion bör fortfarande beskriva en konkret prompt, ett beslut och vad han granskade. |
| Teamarbete och granskning | PR:er och teamets featurearbete | **Återstår att belägga individuellt.** Ingen dokumenterad peer review i detta underlag visar vem som granskade vems ändring, vad som kontrollerades och följden. |
| Återkommande AI-stött arbetsmoment | AI-instruktioner och agentflöde på [planeringsgrenen](https://github.com/misael86/kundportal-ai-native-development/tree/docs/project-plan-and-specs) samt krav-/testarbete i [PR #25](https://github.com/misael86/kundportal-ai-native-development/pull/25) | **Egen insats självrapporterad; artefakter spårbara.** Misael uppger att planeringsgrenen var hans eget arbete med Copilot. Underlaget visar instruktioner och ett Playwright-/CI-upplägg, men den automatiserade E2E-sviten implementerades inte där. Komplettera i Disco med ett konkret exempel på prompt, eget beslut, granskning och verifiering. |
| Självständighet och nytta | Personens spårbara bidrag och [egen reflektion](./ai-workflow.md) | **Delvis, självrapporterat.** Egen avgränsning till funktionella krav och helhetskontroll framgår; konkret nytta och verifieringsgränser behöver förklaras i Disco. |

## VG — alla tre krävs utöver G

| Fördjupning | Vad som behöver visas | Status |
|---|---|---|
| Välgrundade avvägningar | Jämför verkliga alternativ, för- och nackdelar mot krav, beslut och påverkan. | **Återstår.** Produktbeslut finns, men inget källbelagt alternativresonemang i nuvarande dokumentation uppfyller detta. Spara ett jämförande exempel innan beslut. |
| Kritisk granskning och anpassad kontroll | Identifiera risk, pröva om kontrollen fångar den, anpassa och visa faktiska resultat. | **Delvis.** I Copilot-sessionen på Misaels begäran ändrades tillfälligt testtiteln för `CI-REQ-COVERAGE-003`; kravkontrollen underkändes med saknat test-ID. Efter återställning passerade kontrollen och fann 84 krav. Se [verifieringsplanen](./verification-plan.md). Misael reflekterar att flera krav-ID:n kan stå i samma testtitel utan att checker bedömer om testet täcker dem. Detta visar att just saknat ID fångas, inte att testinnehållet är korrekt; individuell förklaring av kontrollens nytta och begränsning behövs fortfarande. |
| Belagd förbättring av arbetsprocessen | Pröva två jämförbara versioner av ett AI-stött moment; visa skillnad, nytta och begränsningar. | **Återstår.** PR-CI automatiserar kravtestning, men ingen före/efter-jämförelse av arbetsmomentets kvalitet/effekt har dokumenterats. Spara båda utfallen; föreslaget men oprövat räcker inte. |

## Inför individuell redovisning

- Länka till egna PR:er/commits, tester, beslut och granskningar; skilj eget arbete från teamets.
- Visa körda kontroller med exakta kommandon och resultat. Märk planerade eller manuella kontroller separat.
- Förklara också vad testerna inte visar.
- Spara inte den individuella Disco-redovisningen i teamets repository.
