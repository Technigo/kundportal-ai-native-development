# CASE-LIST — Lista ärenden

## Leverans

En handläggare kan se sparade ärenden i UI:t. Listan sorteras med nyaste ärendet först.

## Krav och testmappning

| Krav-ID | Acceptanskriterium | Minst ett automatiserat test |
|---|---|---|
| CASE-LIST-001 | Listan visar alla sparade ärenden med rubrik, kategori, prioritet, status och skapandetid, sorterade nyast först. | `[CASE-LIST-001]` ärendesammanfattning och sortering |
| CASE-LIST-002 | Om det saknas ärenden visas ett begripligt tomt läge; API:t returnerar en tom lista. | `[CASE-LIST-002]` tom lista i API och UI |
| CASE-LIST-003 | Fel vid hämtning visas begripligt och presenteras inte som en tom, lyckad lista. | `[CASE-LIST-003]` fel vid hämtning |

## Definition av färdig

- Listan hämtar beständiga ärenden från API:t.
- Samtliga krav-ID:n täcks av tester som passerar.
- Test-ID:n finns i testnamn eller beskrivningar.
