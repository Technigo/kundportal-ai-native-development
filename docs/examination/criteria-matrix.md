# G- och VG-kriterier: evidensmatris

Statusen gäller teamets synliga underlag, inte enskilda studenters betyg. Individuell redovisning ska skrivas separat i Disco och länka till studentens egna bidrag.

## G

| Kriterium | Underlag i projektet | Status och nästa evidens |
|---|---|---|
| Förstå arbetssättet och eget ansvar | Projektinstruktioner, skills, featurearbete | **Delvis.** Varje student beskriver ett eget exempel och skiljer AI-förslag, egna beslut och kontroller. |
| Problem, specifikation och nedbrytning | [Vertikala tickets](../features/README.md), krav-ID:n och acceptanskriterier | **Delvis.** CASE-CREATE och CASE-LIST är byggda; återstående features ska gå från krav till verifiering. Varje student länkar sitt moment och följer ett krav genom hela flödet. |
| Prompting och kontextstyrning | [Copilot-instruktioner](../../.github/copilot-instructions.md) och [skills](../../.github/skills/) | **Delvis.** Visa en konkret instruktion/prompt, vilken kontext och begränsning som hjälpte, samt vad ni själva granskade. |
| Implementation, testning och felsökning | [Verifieringsplan](./verification-plan.md), kod och kravmärkta tester | **Delvis.** Två features har automatiserade resultat. Fortsätt med happy paths, relevanta fel/gränsfall, faktiska körresultat och begränsningar. Varje student ska kunna förklara sitt testurval och egna kontroller. |
| Avgränsat agentarbete | Ingen separat evidenslogg ännu | **Återstår att belägga individuellt.** Dokumentera ett avgränsat uppdrag, agentens behörighet/gränser, kontrollpunkter, vad du granskade och verifieringsresultatet. |
| Teamarbete och granskning | Delade instruktioner och tickets | **Återstår att belägga.** Registrera vem som granskade en klasskamrats förändring, vad som kontrollerades och vad som ändrades efter granskningen. |
| Återkommande AI-stött arbetsmoment | [Skills](../../.github/skills/) beskriver ett möjligt arbetssätt | **Återstår att belägga i faktisk användning.** Återanvänd momentet på flera tillfällen och notera exempel, granskning, nytta och begränsningar. |
| Självständighet och nytta | Kommer från studentens samlade spårbara bidrag och reflektion | **Återstår individuellt.** Förklara egna avgränsningar och beslut samt konkret nytta och begränsningar med AI. |

## VG — alla tre krävs utöver G

| Fördjupning | Vad som behöver visas | Status |
|---|---|---|
| Välgrundade avvägningar | Jämför verkliga alternativ, för- och nackdelar mot krav, beslut och påverkan. | **Återstår.** Välj ett kommande tekniskt beslut och dokumentera alternativen före beslutet. |
| Kritisk granskning och anpassad kontroll | Identifiera en risk, pröva om en kontroll fångar den, anpassa och visa faktiska resultat. | **Delvis.** Sessionen visar att `npm audit` hittade sårbara testberoenden, att Vitest uppgraderades och att kontrollen därefter gav 0 sårbarheter. För att tydligare visa kriteriets testgranskning: prova också att slå ut persistence-testets kontroll tillfälligt, visa att det fallerar av rätt orsak, återställ och kör grönt. |
| Belagd förbättring av arbetsprocessen | Pröva två jämförbara versioner av ett AI-stött moment; visa skillnad, nytta och begränsningar. | **Återstår.** Jämför exempelvis ett första testförslag med ett förfinat krav-ID/TDD-arbetssätt på liknande uppgifter. Spara båda utfallen; föreslått men oprövat räcker inte. |

## Inför individuell redovisning

- Länka till egna PR:er/commits, tester, beslut och granskningar; skilj eget arbete från teamets.
- Visa körda kontroller med exakta kommandon och resultat. Märk planerade eller manuella kontroller separat.
- Förklara också vad testerna inte visar.
- Spara inte den individuella Disco-redovisningen i teamets repository.
