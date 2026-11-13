---
name: ak-check
description: Snabbkontroll av acceptanskriterier (AK) före och efter en kodändring. Läser SPECIFIKATION.md, kör testerna och redovisar kort om de AK man jobbar med är uppfyllda. Använd när användaren ber om att kolla AK, verifiera en ändring, jämföra före/efter, "stämmer det med specen" eller inför commit/PR.
---

# AK-check

Kort kontroll: vilka AK gäller, klarar testerna dem, och vad ändrades med koden?

## Så gör du

1. **Välj AK.** Läs `SPECIFIKATION.md` och lista de AK som ändringen gäller (id, typ, en rad om Then). Fråga användaren om det inte framgår. Räkna aldrig hela specen om det inte efterfrågas.
2. **Koppla till test.** Hitta testet för varje AK (`grep -rn "AK7" backend/tests frontend/tests`). Skriv `saknas` om det inte finns, och `todo/skip` om det inte är ett riktigt test. Dessa räknas **inte** som verifierade.
3. **Före ändringen.** Kör `npm test` (eller riktat: `npx vitest run <fil>`). Notera per AK: grön, röd eller saknar test.
4. **Efter ändringen.** Kör samma kommando igen och jämför.
5. **Rapportera** enligt mallen nedan.

## Rapport

```
AK-check: <vad ändrades>
Kommando: <npm test ...>

| AK  | Typ        | Före       | Efter | Test (fil:rad)        |
|-----|------------|------------|-------|-----------------------|
| AK7 | error path | röd        | grön  | create.test.js:42     |
| AK8 | gränsfall  | saknar test| grön  | create.test.js:55     |

Andra AK som påverkas: <t.ex. regression: AK1 grön→röd, eller "inga">
Osäkert: <det testerna inte visar, eller sådant som inte kördes>
```

## Regler

- Skriv "grön" bara om du faktiskt har kört testet. Annars "ej körd".
- Grön betyder bara att testet passerar. Kolla att testet verkligen kontrollerar AK:ns Then (inte bara statuskod). Säg till om det är för svagt.
- Om ett AK är röd efter ändringen: visa felmeddelandet och föreslå orsak, men ändra inte koden om användaren inte ber om det.
- Kör hela sviten efter ändringen så att regressioner på andra AK syns.
- Committa och pusha aldrig själv.
