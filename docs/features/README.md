# MVP-featuretickets

Varje ticket är en levererbar vertikal feature. Kraven beskriver observerbara funktioner och felutfall som användaren eller API-konsumenten behöver kunna utföra eller förstå; visuella preferenser hör inte hemma i kravtabellerna. Krav-ID:n är stabila och ska finnas i testnamn eller testbeskrivningar. **Varje funktionellt krav-ID ska täckas av minst ett automatiserat test.** Ett test får täcka flera krav; en feature kan ha flera tester. CI kontrollerar kravtäckning och att nya krav får nya tester vid varje pull request.

Ticketen är klar när acceptanskriterierna är uppfyllda, kopplade tester finns och passerar, relevanta fel/gränsfall hanteras och dokumentationen är uppdaterad. Faktiska körresultat dokumenteras i verifieringsplanen.

| Ticket | Feature | Beroende | Specifikation |
|---|---|---|---|
| CASE-CREATE | Skapa ärende | Projektskelett | [case-create.md](./case-create.md) |
| CASE-LIST | Lista ärenden | Projektskelett | [case-list.md](./case-list.md) |
| CASE-DETAIL | Visa ärendedetalj | CASE-CREATE | [case-detail.md](./case-detail.md) |
| CASE-EDIT | Redigera ärende | CASE-DETAIL | [case-edit.md](./case-edit.md) |
| CASE-DELETE | Ta bort ärende | CASE-EDIT | [case-delete.md](./case-delete.md) |
| CASE-STATUS | Ändra status | CASE-DETAIL | [case-status.md](./case-status.md) |
| CASE-NOTE | Hantera intern anteckning | CASE-DETAIL | [case-note.md](./case-note.md) |
| UI-CONSISTENCY | Tillgängliga kontroller och begriplig feedback | Projektskelett | [ui-consistency.md](./ui-consistency.md) |
| CI-REQ-COVERAGE | Kravtestning i pull requests | MVP-featuretickets | [ci-requirement-coverage.md](./ci-requirement-coverage.md) |

Märk automatiserade testnamn med de funktionella krav-ID:n de täcker. Krav som saknar ett existerande och godkänt test innebär att ticketen inte är klar.
