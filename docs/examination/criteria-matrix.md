# G- och VG-kriterier: evidensmatris

Statusen gäller teamets synliga underlag, inte enskilda studenters betyg. Individuell redovisning ska skrivas separat i Disco och länka till studentens egna bidrag.

## G

| Kriterium | Underlag i projektet | Status och nästa evidens |
|---|---|---|
| Förstå arbetssättet och eget ansvar | [Beslutslogg](./decision-log.md), [chattexcerpt och sessionsindex](./conversation-log.md), instruktioner och skills | **Egen reflektion finns, självrapporterad.** Studenten beskriver beslut om funktionella krav, helhetsgranskning och AI-begränsningar; ska själv använda exemplet i Disco och kunna förklara kontrollerna. |
| Problem, specifikation och nedbrytning | [Vertikala tickets](../features/README.md), krav-ID:n, acceptanskriterier och [PR #25](https://github.com/misael86/kundportal-ai-native-development/pull/25) | **Egen insats självrapporterad; artefakter spårbara.** PR #25 innehåller kravuppdelning, funktionella krav och kravtestning. Studenten bör länka sitt moment och följa ett krav från specifikation genom verifiering i Disco. |
| Prompting och kontextstyrning | [Copilot-instruktioner](../../.github/copilot-instructions.md), [skills](../../.github/skills/), sessionsutdrag | **Delvis, självrapporterat.** Studenten beskriver AI-förslag som missade helhetsändringar eller lade till visuella krav; exempel finns i [sessionsindexet](./conversation-log.md). Förklara konkret kontext och egna korrigeringar i Disco. |
| Implementation, testning och felsökning | [Verifieringsplan](./verification-plan.md), kod, kravmärkta tester och PR #25 | **Egen implementation och manuell testning självrapporterad; resultatdetaljer saknas.** Dokumentera ett konkret manuellt scenario och utfall. De automatiska körresultaten här är inte personligt attribuerade. |
| Avgränsat agentarbete | Playwright-delstegets uppdrag, CPU-/CI-krav och [PR #24](https://github.com/misael86/kundportal-ai-native-development/pull/24) | **Egen insats självrapporterad; mer förklaring behövs.** Beskriv scope, agentens gränser, egen granskning och verifiering i Disco. |
| Teamarbete och granskning | PR:er och teamets featurearbete | **Återstår att belägga individuellt.** Ingen dokumenterad peer review i detta underlag visar vem som granskade vems ändring, vad som kontrollerades och följden. |
| Återkommande AI-stött arbetsmoment | Upprepade krav/test/CI-moment i [PR #24](https://github.com/misael86/kundportal-ai-native-development/pull/24) och [PR #25](https://github.com/misael86/kundportal-ai-native-development/pull/25) | **Delvis, egen användning självrapporterad.** Studenten beskriver återkommande krav/test- och manuella iterationsmoment; komplettera i Disco med konkret upprepning, resultat och begränsningar. |
| Självständighet och nytta | Personens spårbara bidrag och [egen reflektion](./ai-workflow.md) | **Delvis, självrapporterat.** Egen avgränsning till funktionella krav och helhetskontroll framgår; konkret nytta och verifieringsgränser behöver förklaras i Disco. |

## VG — alla tre krävs utöver G

| Fördjupning | Vad som behöver visas | Status |
|---|---|---|
| Välgrundade avvägningar | Jämför verkliga alternativ, för- och nackdelar mot krav, beslut och påverkan. | **Återstår.** Produktbeslut finns, men inget källbelagt alternativresonemang i nuvarande dokumentation uppfyller detta. Spara ett jämförande exempel innan beslut. |
| Kritisk granskning och anpassad kontroll | Identifiera risk, pröva om kontrollen fångar den, anpassa och visa faktiska resultat. | **Delvis.** Projektet dokumenterar felvägar, tester och en kravtäckningskontroll. VG-exempel med riskfokuserad negativ kontroll/mutation och resultat saknas fortfarande; gör och dokumentera en kontrollerad teständring som förväntat fallerar, återställ och kör grönt. |
| Belagd förbättring av arbetsprocessen | Pröva två jämförbara versioner av ett AI-stött moment; visa skillnad, nytta och begränsningar. | **Återstår.** PR-CI automatiserar kravtestning, men ingen före/efter-jämförelse av arbetsmomentets kvalitet/effekt har dokumenterats. Spara båda utfallen; föreslaget men oprövat räcker inte. |

## Inför individuell redovisning

- Länka till egna PR:er/commits, tester, beslut och granskningar; skilj eget arbete från teamets.
- Visa körda kontroller med exakta kommandon och resultat. Märk planerade eller manuella kontroller separat.
- Förklara också vad testerna inte visar.
- Spara inte den individuella Disco-redovisningen i teamets repository.
