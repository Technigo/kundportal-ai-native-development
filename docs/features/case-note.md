# CASE-NOTE — Hantera intern anteckning

## Leverans

En handläggare kan lägga till eller redigera en intern textanteckning från ärendedetaljen. Anteckningen är valfri vid ärendeskapande. Det finns ingen författare eller ändringshistorik.

## Fältregler

- En anteckning per ärende.
- Text trimmas och får vara högst 2 000 tecken.
- Att spara tom text eller enbart blanksteg raderar anteckningen.

## Krav och testmappning

| Krav-ID | Acceptanskriterium | Minst ett automatiserat test |
|---|---|---|
| CASE-NOTE-001 | Ärende kan skapas och visas utan anteckning. | `[CASE-NOTE-001]` anteckning är valfri |
| CASE-NOTE-002 | Icke-tom anteckning kan läggas till, trimmas och kopplas till rätt ärende. Gränsen 2 000 godtas; 2 001 avvisas. | `[CASE-NOTE-002]` lägg till anteckning och längdgräns |
| CASE-NOTE-003 | Befintlig anteckning kan redigeras och ändringen finns kvar efter omläsning. | `[CASE-NOTE-003]` redigera och läsa om anteckning |
| CASE-NOTE-004 | Tömning eller enbart blanksteg, följt av spara, raderar anteckningen. | `[CASE-NOTE-004]` radera genom att tömma |
| CASE-NOTE-005 | Ogiltig längd avvisas utan att befintlig anteckning ändras. | `[CASE-NOTE-005]` för lång text ändrar inte sparad anteckning |
| CASE-NOTE-006 | Anteckning på ärende som inte finns ger begripligt `not found`-fel. | `[CASE-NOTE-006]` anteckning på saknat ärende |

## Definition av färdig

- Anteckning kan läggas till, läsas, redigeras och raderas via UI och API.
- Samtliga krav-ID:n täcks av tester som passerar.
- Test-ID:n finns i testnamn eller beskrivningar.
