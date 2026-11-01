# CASE-STATUS — Ändra status

## Leverans

En handläggare kan ändra status från ärendedetaljen. Giltiga statusar: `Nytt`, `Pågående`, `Väntar på kund`, `Avslutat`. Alla övergångar mellan giltiga statusar tillåts.

## Krav och testmappning

| Krav-ID | Acceptanskriterium | Minst ett automatiserat test |
|---|---|---|
| CASE-STATUS-001 | Var och en av de fyra statusarna kan sättas från var och en av de andra giltiga statusarna. | `[CASE-STATUS-001]` alla giltiga statusövergångar |
| CASE-STATUS-002 | Okänd status avvisas med begripligt fel; befintlig status förblir oförändrad. | `[CASE-STATUS-002]` ogiltig status ändrar inte ärendet |
| CASE-STATUS-003 | Statusändringen sparas beständigt och syns efter ny hämtning av ärendet. | `[CASE-STATUS-003]` status finns kvar efter omläsning |
| CASE-STATUS-004 | Statusändring på ett ärende som inte finns ger begripligt `not found`-fel. | `[CASE-STATUS-004]` statusändring för saknat ärende |

## Definition av färdig

- Status kan ändras via UI och API och sparas i SQLite.
- Samtliga krav-ID:n täcks av tester som passerar.
- Test-ID:n finns i testnamn eller beskrivningar.
