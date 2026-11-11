# ACCESSIBILITY-FORMS — Tillgängliga kontroller och begriplig feedback

## Leverans

Interaktiva kontroller kan identifieras och användas, och användaren får veta vad som behöver rättas när en åtgärd inte kan genomföras.

## Krav

| Krav-ID | Acceptanskriterium |
|---|---|
| ACCESSIBILITY-FORMS-001 | Fält i formulär för att skapa, redigera, statusändra och anteckna har tillgängliga namn som beskriver vad användaren ska ange eller välja. |
| ACCESSIBILITY-FORMS-002 | När obligatoriska fält saknas stoppas inskickning. Berörda fält markeras ogiltiga, och deras svenska felbesked är kopplade till fälten så hjälpmedel kan läsa dem. |
| ACCESSIBILITY-FORMS-003 | Ärendestatus visas som text och kan inte enbart utläsas via färg. |
| ACCESSIBILITY-FORMS-004 | API-fel visas på svenska som begriplig, tillgänglig feedback. |

## Definition av färdig

- Formulärfält och felmeddelanden kan tolkas med tangentbord och hjälpmedel.
- Samtliga krav-ID:n täcks av tester som passerar.

## Verifiering av tillgängliga och begripliga kontroller

Kört 2026-11-08:

- Testerna för formulärfält, valideringsfel och status finns i [CaseForm.test.tsx](../../packages/web/src/CaseForm.test.tsx), [CaseDetail.test.tsx](../../packages/web/src/CaseDetail.test.tsx) och [CaseList.test.tsx](../../packages/web/src/CaseList.test.tsx).