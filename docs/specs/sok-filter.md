# Sökning och filtrering

**Id-prefix:** `SF-`

Det här är teamets valda tillägg, se R11 i [kravspec.md](kravspec.md). Specen är skriven utifrån prototypen på `frontend-v2`, och koden rättas mot specen innan den läggs in i `main`. Ordningen står i [beslut.md](../beslut.md).

## Syfte och användare

När antalet ärenden växer behöver handläggaren snabbt hitta rätt ärende utan att gå igenom hela listan.

## Omfattning och icke-mål

### Ingår

- Fritextsökning i rubrik och beskrivning
- Filter på status, kategori och prioritet
- Sökning och filter i kombination
- Besked när inget ärende matchar

### Ingår inte

- Sökning i andra fält än rubrik och beskrivning
- Flera värden i samma filter (se SF-Q5)
- Sökfunktion i backend (se SF-Q6)

## Förutsättningar

Listan över ärenden visas enligt R6 i [kravspec.md](kravspec.md). Där står också de tillåtna värdena för status, kategori och prioritet.

Acceptanskriterierna utgår från de här påhittade ärendena:

| Ärende | Rubrik | Beskrivning | Kategori | Prioritet | Status | Skapad |
| --- | --- | --- | --- | --- | --- | --- |
| C1 | Faktura saknas | Kunden har inte fått sin faktura för oktober. | Fakturering | Hög | Nytt | 2026-10-20 |
| C2 | Kan inte logga in | Inloggningen ger felmeddelande. | Teknik | Medel | Pågående | 2026-10-21 |
| C3 | Fel på faktura | Fel belopp på fakturan. | Fakturering | Låg | Avslutat | 2026-10-22 |

## Beteendekrav

- **SF-R1 – Fritextsökning:** Ett ärende visas om rubriken eller beskrivningen innehåller söktexten, även som en del av ett ord. Stora och små bokstäver spelar ingen roll, inte heller för å, ä och ö.
- **SF-R2 – Filter:** Listan kan filtreras på status, kategori och prioritet. Varje filter har ett värde åt gången eller "Alla", som är förvalt.
- **SF-R3 – Kombination:** Ett ärende visas bara om det uppfyller både söktexten och alla valda filter.
- **SF-R4 – Inga träffar:** När inget ärende matchar visas "Inga ärenden matchar".
- **SF-R5 – Tom söktext:** Mellanslag före och efter söktexten räknas inte. Söktext med bara mellanslag räknas som tom.
- **SF-R6 – Specialtecken:** Alla tecken i söktexten behandlas som vanlig text.
- **SF-R7 – Ordning:** Träffarna visas i samma ordning som listan (R6).
- **SF-R8 – Ingen ändring:** Sökning och filtrering ändrar inga ärenden. När söktext och filter rensas visas alla ärenden igen.
- **SF-R9 – När det slår igenom:** Ett filter gäller direkt. Söktexten gäller när handläggaren trycker Enter eller på knappen Sök.
- **SF-R10 – Längd på söktexten:** Söktexten kan vara högst 100 tecken.

## Acceptanskriterier

Utgångsläget är C1–C3 utan söktext och utan valda filter, om inget annat anges.

### SF-A1

- **Handling:** Handläggaren söker på "faktura"
- **Förväntat resultat:** C3 och C1 visas, med C3 först. C2 visas inte
- **Kontrollerar:** SF-R1, SF-R7

### SF-A2

- **Handling:** Handläggaren söker på "FAKTURA"
- **Förväntat resultat:** Samma som SF-A1
- **Kontrollerar:** SF-R1

### SF-A3

- **Handling:** Handläggaren söker på "FÖR"
- **Förväntat resultat:** Bara C1 visas
- **Kontrollerar:** SF-R1

### SF-A4

- **Handling:** Handläggaren söker på "inloggningen", som bara finns i beskrivningen
- **Förväntat resultat:** Bara C2 visas
- **Kontrollerar:** SF-R1

### SF-A5

- **Handling:** Handläggaren söker på "faktur"
- **Förväntat resultat:** C3 och C1 visas. C2 visas inte
- **Kontrollerar:** SF-R1

### SF-A6

- **Handling:** Handläggaren väljer status *Nytt* och sedan *Alla*
- **Förväntat resultat:** Först visas bara C1, sedan alla tre
- **Kontrollerar:** SF-R2

### SF-A7

- **Handling:** Handläggaren väljer kategori *Teknik*
- **Förväntat resultat:** Bara C2 visas
- **Kontrollerar:** SF-R2

### SF-A8

- **Handling:** Handläggaren väljer prioritet *Låg*
- **Förväntat resultat:** Bara C3 visas
- **Kontrollerar:** SF-R2

### SF-A9

- **Handling:** Handläggaren söker på "faktura" och väljer status *Nytt*
- **Förväntat resultat:** Bara C1 visas
- **Kontrollerar:** SF-R3

### SF-A10

- **Handling:** Handläggaren söker på "xyz", rensar söktexten och söker igen
- **Förväntat resultat:** Först visas "Inga ärenden matchar". Sedan visas alla tre med oförändrade uppgifter
- **Kontrollerar:** SF-R4, SF-R8

### SF-A11

- **Handling:** Handläggaren söker på tre mellanslag och sedan på "  faktura  "
- **Förväntat resultat:** Först visas alla tre, sedan samma som SF-A1
- **Kontrollerar:** SF-R5

### SF-A12

- **Handling:** Handläggaren söker på `<script>`
- **Förväntat resultat:** "Inga ärenden matchar" visas, och appen fungerar som vanligt
- **Kontrollerar:** SF-R6

### SF-A13

- **Handling:** Handläggaren skriver "faktura" utan att trycka Enter och trycker sedan Enter
- **Förväntat resultat:** Listan är oförändrad tills Enter trycks. Sedan visas samma som SF-A1
- **Kontrollerar:** SF-R9

### SF-A14

- **Handling:** Handläggaren försöker skriva 101 tecken i sökfältet
- **Förväntat resultat:** Sökfältet innehåller 100 tecken
- **Kontrollerar:** SF-R10

## Kvalitetskrav

K1 i [kravspec.md](kravspec.md) gäller även sökfältet och filtren. Tillägget har inga egna kvalitetskrav.

## Antaganden och öppna frågor

- **SF-Q1 – Ska delar av ord hittas?**
  - **Varför det spelar roll:** Avgör SF-R1 och SF-A5
  - **Status:** Besvarad 2026-10-30, Ruben och Nathalie: Ja, som i `frontend-v2`

- **SF-Q2 – När ska söktexten slå igenom?**
  - **Varför det spelar roll:** Avgör SF-R9 och SF-A13
  - **Status:** Besvarad 2026-10-30, Ruben och Nathalie: När handläggaren trycker Enter eller på Sök. Filter gäller direkt, som i `frontend-v2`

- **SF-Q3 – Ska söktext med bara mellanslag räknas som tom?**
  - **Varför det spelar roll:** Avgör SF-R5 och SF-A11
  - **Status:** Besvarad 2026-10-30, Ruben och Nathalie: Ja, som i `frontend-v2`

- **SF-Q4 – Ska sökfältet ha en maxlängd?**
  - **Varför det spelar roll:** Avgör SF-R10 och SF-A14. Rubrik och beskrivning saknar maxlängd, så en längre text går inte att söka på i sin helhet
  - **Status:** Besvarad 2026-10-30, Ruben och Nathalie: Ja, 100 tecken, som i `frontend-v2`

- **SF-Q5 – Räcker ett värde åt gången i varje filter?**
  - **Varför det spelar roll:** Avgör SF-R2 och avgränsningen
  - **Status:** Besvarad 2026-10-30, Ruben och Nathalie: Ja, som i `frontend-v2`

- **SF-Q6 – Får sökningen göras i webbläsaren, på den lista som redan är hämtad?**
  - **Varför det spelar roll:** Backend har ingen sökfunktion. Svaret avgör avgränsningen och att testerna blir frontendtester
  - **Status:** Besvarad 2026-10-30, Ruben och Nathalie: Ja, som i `frontend-v2`
