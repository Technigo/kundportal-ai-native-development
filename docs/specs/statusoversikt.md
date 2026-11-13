# Statusöversikt

**Id-prefix:** `SO-`

Det här är ett andra tillägg, utöver sökning och filtrering i [sok-filter.md](sok-filter.md). Det byggs bara i frontenden och specificeras före implementationen.

**Så läser du id:na** (samma system som i [kravspec.md](kravspec.md), se [spec-driven-dev.md](spec-driven-dev.md)): `SO-` står för Statusöversikt. Bokstaven efter prefixet anger vad det är: **R** är en regel (vad funktionen ska göra), **A** ett acceptanskriterium (ett konkret exempel som blir ett test), **K** ett kvalitetskrav och **Q** en fråga som har besvarats. Siffran är ett löpnummer. "Kontrollerar: SO-R3" betyder att exemplet prövar regel 3.

## Syfte och användare

Handläggaren ska direkt se hur många ärenden som har varje status, utan att räkna i listan. Det svarar mot problemet i [kravspec.md](kravspec.md): handläggarna har svårt att få en gemensam överblick. *Eget förslag (Nathalie).*

## Omfattning och icke-mål

### Ingår

- En rad under rubriken "Alla ärenden" som visar antalet ärenden per status
- Räkning av alla ärenden som har hämtats till listan

### Ingår inte

- Totalt antal ärenden (se SO-Q3)
- Att klicka på en siffra för att filtrera listan
- Diagram eller procent
- Räkning per kategori eller prioritet
- Ändringar i backend eller i mocken

## Förutsättningar

Listan över ärenden hämtas och visas enligt R6 i [kravspec.md](kravspec.md). Där står också de fyra statusarna i sin ordning: Nytt, Pågående, Väntar på kund och Avslutat.

Acceptanskriterierna utgår från de här påhittade ärendena:

| Ärende | Rubrik | Status |
| --- | --- | --- |
| S1 | Faktura saknas | Nytt |
| S2 | Kan inte logga in | Nytt |
| S3 | Paketet har inte kommit | Pågående |
| S4 | Fel på faktura | Avslutat |

Inget av testärendena har status *Väntar på kund*. Det är med flit: översikten ska ändå visa *Väntar på kund 0* (SO-R1), och så prövas att en status utan ärenden inte försvinner. Kategori, prioritet och beskrivning påverkar inte översikten och står därför inte i tabellen.

## Beteendekrav

- **SO-R1 – Antal per status:** Översikten visar antalet ärenden för var och en av de fyra statusarna, i kravspecens ordning, också när antalet är 0.
- **SO-R2 – Alla ärenden:** Siffrorna gäller alla ärenden. Sökning och filter ändrar dem inte.
- **SO-R3 – Uppdateras direkt:** När ett ärende skapas eller byter status ändras siffrorna direkt, utan att sidan laddas om.
- **SO-R4 – Bara visning:** Översikten ändrar inga ärenden och har inga knappar eller länkar.
- **SO-R5 – Bara när listan är hämtad:** Medan listan laddas, eller om den inte kan hämtas, visas ingen översikt.

## Acceptanskriterier

Utgångsläget är S1–S4 utan söktext och utan valda filter, om inget annat anges.

### SO-A1

- **Utgångsläge:** S1–S4 finns
- **Handling:** Handläggaren öppnar listan
- **Förväntat resultat:** Översikten visar Nytt 2, Pågående 1, Väntar på kund 0 och Avslutat 1, i den ordningen. Översikten har inga knappar eller länkar. Listan visar fortfarande alla fyra ärenden
- **Kontrollerar:** SO-R1, SO-R4

### SO-A2

- **Utgångsläge:** Inga ärenden finns
- **Handling:** Handläggaren öppnar listan
- **Förväntat resultat:** Översikten visar 0 för alla fyra statusar. Listan visar "Inga ärenden ännu"
- **Kontrollerar:** SO-R1

### SO-A3

- **Utgångsläge:** S1–S4 finns. Översikten visar Nytt 2 och Pågående 1
- **Handling:** Handläggaren ändrar status på S1 från *Nytt* till *Pågående*
- **Förväntat resultat:** Översikten visar Nytt 1 och Pågående 2, utan att sidan laddas om. Väntar på kund 0 och Avslutat 1 är oförändrade
- **Kontrollerar:** SO-R3

### SO-A4

- **Utgångsläge:** S1–S4 finns. Översikten visar Nytt 2
- **Handling:** Handläggaren skapar ett nytt ärende med giltiga uppgifter
- **Förväntat resultat:** Översikten visar Nytt 3, utan att sidan laddas om. Pågående 1, Väntar på kund 0 och Avslutat 1 är oförändrade
- **Kontrollerar:** SO-R3

### SO-A5

- **Utgångsläge:** S1–S4 finns. Översikten visar Nytt 2, Pågående 1, Väntar på kund 0 och Avslutat 1
- **Handling:** Handläggaren söker på "xyz" och väljer sedan status *Avslutat* i filtret
- **Förväntat resultat:** Listan visar "Inga ärenden matchar". Översikten visar fortfarande Nytt 2, Pågående 1, Väntar på kund 0 och Avslutat 1. Inget ärende har ändrats
- **Kontrollerar:** SO-R2, SO-R4

### SO-A6

- **Utgångsläge:** Listan kan inte hämtas
- **Handling:** Handläggaren öppnar sidan
- **Förväntat resultat:** Ett felbesked visas. Ingen översikt visas, alltså inga nollor
- **Kontrollerar:** SO-R5

### SO-A7

- **Utgångsläge:** Listan håller på att hämtas
- **Handling:** Handläggaren öppnar sidan
- **Förväntat resultat:** "Laddar ärenden…" visas. Ingen översikt visas, alltså inga nollor
- **Kontrollerar:** SO-R5

### SO-A8

- **Utgångsläge:** Tre ärenden finns, alla med status *Avslutat*
- **Handling:** Handläggaren öppnar listan
- **Förväntat resultat:** Översikten visar Nytt 0, Pågående 0, Väntar på kund 0 och Avslutat 3, i den ordningen
- **Kontrollerar:** SO-R1

## Kvalitetskrav

- **SO-K1 – Skärmläsare:** Översikten har namnet "Antal ärenden per status", och varje siffra står ihop med sin status, så att en skärmläsare läser upp till exempel "Nytt 2". *Förslag (Nathalie).* **Kontrolleras genom:** ett automatiskt test som hittar översikten på dess namn och läser texten för varje status.

K1 i [kravspec.md](kravspec.md) gäller också, men översikten har inget att klicka på.

## Antaganden och öppna frågor

- **SO-Q1 – Ska siffrorna gälla alla ärenden eller bara de som syns efter sökning och filter?**
  - **Varför det spelar roll:** Avgör SO-R2 och SO-A5. Om siffrorna följer filtret visar översikten samma sak som listan, och ett statusfilter gör att tre siffror alltid blir 0
  - **Status:** Besvarad 2026-11-05, Nathalie: Alla ärenden

- **SO-Q2 – Vilket kvalitetskrav ska gälla?**
  - **Varför det spelar roll:** Specmallen kräver minst ett kontrollerbart kvalitetskrav. K1 (tangentbord) prövar inget här, eftersom översikten inte går att klicka på
  - **Status:** Besvarad 2026-11-05, Nathalie: SO-K1, skärmläsare, kontrolleras med ett automatiskt test. Den som använder skärmläsare ska höra varje status ihop med sin siffra, i tur och ordning: "Antal ärenden per status: Nytt 2, Pågående 1, Väntar på kund 0, Avslutat 1". Det fungerar inte av sig självt. Står statusnamnen och siffrorna på olika ställen i koden läses de upp isär, och utan ett namn vet lyssnaren inte vad siffrorna gäller. Kravet går att kontrollera med ett test, så kontrollen behöver inte göras för hand

- **SO-Q3 – Ska översikten också visa det totala antalet ärenden?**
  - **Varför det spelar roll:** Avgör vad översikten visar och vad SO-A1–SO-A5 ska kontrollera
  - **Status:** Besvarad 2026-11-05, Nathalie: Nej, bara antal per status. Det håller funktionen liten, och totalen är summan av siffrorna

## Checklista: när är specen klar?

- [x] Varje regel har ett nummer.
- [x] Varje regel har minst ett konkret exempel.
- [x] Exemplen säger vad som inte ska försvinna eller ändras.
- [x] Det som saknar svar står som öppen fråga.
- [x] Egna förslag är märkta.
- [x] En annan person kan bygga och kontrollera utifrån specen utan att fråga oss. *(Kontrollerat av Ruben i granskningen av [PR #12](https://github.com/Ottowski/nors-kundportal-development/pull/12), 2026-11-08.)*
