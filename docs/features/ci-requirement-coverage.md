# CI-REQ-COVERAGE — Kravtestning i pull requests

## Leverans

Varje pull request kontrollerar att alla funktionella krav i feature-specifikationerna har automatiserade tester och att nya krav får nya kravmärkta tester. Visuella preferenser ligger utanför kravtäckningen. Samtliga API- och webbtester körs i samma CI-jobb.

## Krav

| Krav-ID | Acceptanskriterium |
|---|---|
| CI-REQ-COVERAGE-001 | Varje funktionellt krav-ID i en feature-specifikations kravtabell finns i minst en automatiserad testtitels kravmärkning. CI rapporterar krav som saknar test. |
| CI-REQ-COVERAGE-002 | Ett funktionellt krav-ID som tillkommer i pull requesten måste också förekomma i en ny automatiserad testtitel tillagd i samma ändring. Ett befintligt test eller enbart dokumenterad testmappning räcker inte. |
| CI-REQ-COVERAGE-003 | Varje pull request kör hela API- och webbtestsviten med `npm test`. |

## Implementation

- `.github/workflows/ci.yml` körs vid pull request och installerar låsta beroenden med `npm ci`.
- `npm run test:requirements` testar kravkontrollerns positiva och negativa fall.
- `npm run check:requirements -- <bas-commit>` kontrollerar samtliga kravtabeller och jämför krav-ID:n med PR:ens bascommit.
- `npm test` kör API- och webbtesterna; `npm run build` verifierar TypeScript och produktionsbyggen.

## Definition av färdig

- Alla funktionella kravtabellrader har minst en kravmärkt testtitel i API- eller webbtesterna.
- Nya krav-ID:n måste ha en ny kravmärkt testtitel i samma pull request.
- CI blockerar pull requesten om en kontroll eller testsvit misslyckas.

## Verifiering efter att visuella krav tagits bort

Kört 2026-11-09:

- `npm test` — API: 106 tester och webb: 95 tester passerade.
- `npm run test:requirements` — 6 tester passerade.
- `npm run check:requirements -- HEAD` — 84 kvarvarande krav har testtitlar; 57 nya krav har nya tester.
- `git diff --check` — passerade.
