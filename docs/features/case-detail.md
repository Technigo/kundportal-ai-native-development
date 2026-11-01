# CASE-DETAIL — Visa ärendedetalj

## Leverans

En handläggare kan välja ett ärende och se dess fullständiga uppgifter.

## Krav och testmappning

| Krav-ID | Acceptanskriterium | Minst ett automatiserat test |
|---|---|---|
| CASE-DETAIL-001 | Detaljvyn visar rubrik, beskrivning, kategori, prioritet, aktuell status och skapandetid för valt ärende. | `[CASE-DETAIL-001]` visar alla ärendeuppgifter |
| CASE-DETAIL-002 | Ett ID som inte finns ger ett tydligt `not found`-fel från API:t och begripligt besked i UI:t. | `[CASE-DETAIL-002]` saknat ärende |
| CASE-DETAIL-003 | Fel vid hämtning visas begripligt och förväxlas inte med ett saknat eller tomt ärende. | `[CASE-DETAIL-003]` hämtningsfel |

## Definition av färdig

- Detaljer hämtas från API:t för valt ärende.
- Samtliga krav-ID:n täcks av tester som passerar.
- Test-ID:n finns i testnamn eller beskrivningar.
