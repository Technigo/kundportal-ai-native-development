# UI-CONSISTENCY — Gemensam UI-stil och felbesked

## Leverans

Frontendens gemensamma kontroller, feedback och statusmarkeringar använder ett konsekvent, tillgängligt formspråk. Palettens basfärger är `#FEF3E2`, `#F4AE52`, `#D4621A` och `#2A1A0E`; text- och interaktionskontrast justeras vid behov.

## Krav och testmappning

| Krav-ID | Acceptanskriterium | Minst ett automatiserat test |
|---|---|---|
| UI-CONSISTENCY-001 | Interaktiva formulärfält har synliga etiketter som är programmatiskt kopplade till fälten. | `[UI-CONSISTENCY-001]` formulärfält har tillgängliga etiketter |
| UI-CONSISTENCY-002 | Validerings- och API-fel visas på svenska, är begripliga och exponeras som tillgänglig feedback. | `[UI-CONSISTENCY-002]` fel visas tillgängligt |
| UI-CONSISTENCY-003 | Ärendestatus visas som text och kan inte enbart utläsas via färg. | `[UI-CONSISTENCY-003]` status har textetikett |
| UI-CONSISTENCY-004 | Gemensamma designvariabler innehåller projektets palett och återanvänds i UI:t. | `[UI-CONSISTENCY-004]` palettvariabler används |
| UI-CONSISTENCY-005 | Gemensamma fält- och knappkomponenter ger konsekvent etikett-, fokus-, fel- och interaktionsbeteende i ärende- och anteckningsformulär. | `[UI-CONSISTENCY-005]` delade komponenter i formulär |

## Definition av färdig

- Återkommande fält, knappar, felmeddelanden och statusmarkeringar använder gemensamma komponenter.
- Samtliga krav-ID:n täcks av tester som passerar.
- Kontrast, fokusläge och smala/breda vyer granskas manuellt; resultatet dokumenteras separat från automatiserade testresultat.
