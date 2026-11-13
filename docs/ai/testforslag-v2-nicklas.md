# Instruktion för testförslag (v2-nicklas: gränsvärden)

> Version: **v2-nicklas** · Ansvarig: Nicklas (yrrving) · Bygger på [v1](testforslag-v1.md) · 2026-10-25
> Egen, namngiven förbättring enligt Teststrategin (avsnitt 4). v1 gäller fortfarande för teamet.
> Används så här: *"Föreslå tester för CORE-12 enligt docs/ai/testforslag-v2-nicklas.md"*.

## Varför en v2

När v1 kördes på CORE-11–14 hittade den bra specialfall men täckte gränserna ojämnt:
100 och 101 tecken fanns med, men inte 99. Fallen där koden räknar tecken på fel sätt kom
med, men av tur och inte för att instruktionen bad om dem. Förslaget blev också 23 tester
utan ordning, vilket var tungt att granska. v2 lägger till tre steg för krav med gränser.

## Syfte

Samma som v1: ett genomtänkt förslag på tester **innan** testerna skrivs. v2 ser dessutom
till att varje gräns i kravet testas på båda sidor, och att förslaget går snabbt att granska.

## Indata

- Ett eller flera krav-id, t.ex. `CORE-12`.
- Specen där kravet står (`docs/specs/`) och `AGENTS.md`.

## Gör så här

1. Läs kravet i specen, och de delar av specen som kravet hänvisar till (felmeddelanden,
   beslut, API-kontrakt).
2. **Gränstabell (nytt i v2).** Skriv upp varje gräns som kravet eller dess beslut sätter,
   t.ex. minsta och största längd. För varje gräns: ta fram ett fall **precis under**,
   **precis på** och **precis över**, för både den nedre och den övre gränsen. Står ingen
   nedre gräns i specen: skriv det som en fråga i stället för att hitta på en.
   "Under den nedre gränsen" är ofta samma fall som ett tomt fält (t.ex. 0 tecken efter
   trimning, CORE-06/07/11). Hänvisa då till det kravet i stället för att föreslå testet en
   gång till.
3. **Hur räknas det (nytt i v2).** Skriv ut hur specen räknar, t.ex. "tecken = Unicode-
   kodpunkter, efter trimning". Ta fram minst ett fall nära gränsen som ger **fel resultat**
   om koden räknar på ett annat sätt (före trimning, i byte, i UTF-16 eller i synliga tecken).
4. Föreslå övriga tester för kravet, som i v1:
   - minst ett **happy path**-fall,
   - de **error paths** som kravet nämner,
   - andra relevanta **gränsfall**.
5. Välj testnivå enligt [Teststrategin](../teststrategi.md) (avsnitt 2, Testnivåer)
   och säg varför.
6. Ange för varje test **vilken mutation** i koden som ska få testet att falla.
7. **Prioritera (nytt i v2).** Märk varje test *Måste* eller *Bra att ha*. *Måste* är
   fallen från gränstabellen, räknesättet och kravets egna exempel. Lista *Måste* först.
8. Skriv **inte** testkoden än. Förslaget granskas först.

## Utdata

1. **Gränstabellen:**

| Krav-id | Gräns | Under | På | Över | Räknas som |
| --- | --- | --- | --- | --- | --- |
| CORE-12 | Rubrik max 100 | 99 → godkänns | 100 → godkänns | 101 → 422 | kodpunkter efter trimning |

2. **Testtabellen**, *Måste* först:

| Prio | Testnamn | Krav-id | Givet / När / Då | Förväntat resultat | Nivå | Ska falla om … |
| --- | --- | --- | --- | --- | --- | --- |
| Måste | `test_core12_title_100_chars_is_accepted` | CORE-12 | Givet en rubrik på exakt 100 tecken, när ärendet skapas, då … | 201, ärendet sparas | Integration | gränsen ändras från `<= 100` till `< 100` |

3. **Frågor** om något i specen är otydligt.

## Gränser

- Hitta inte på krav. Allt som testas ska gå att peka på i specen.
- Ändra inte specen. Är den otydlig: skriv en fråga.
- Förväntade felmeddelanden ska vara **exakt** de som står i specen.
- Håll dig till den spec som kravet står i. Där CORE och HIST gränsar till varandra
  (t.ex. CORE-06 och HIST-10) föreslås fallet bara för det krav som äger beteendet.
  Nämn det andra kravet i en fråga i stället för att föreslå samma test två gånger.
- Bara påhittade uppgifter.

## Granskning (görs av människan)

- [ ] Varje gräns i gränstabellen har under, på och över.
- [ ] Minst ett fall fångar fel räknesätt.
- [ ] Varje test går att koppla till ett krav-id.
- [ ] Förväntat resultat är exakt (statuskod, meddelande, vad som finns i databasen).
- [ ] Varje test har en mutation som får det att falla.
- [ ] Inget test kontrollerar något som specen inte säger.

## Hur v2 prövas mot v1

Samma krav (CORE-11–14), samma prompt, ny AI-session, samma facit. Jämför:

| Mått | v1 | v2 |
| --- | --- | --- |
| Gränser med under, på och över (av alla gränser) | 0 / 4 | 4 / 4 |
| Fall som fångar fel räknesätt | 7, utan översikt | 9, i en egen tabell |
| Antal *Måste*-tester / totalt antal tester | – / 23 | 24 / 29 |
| Fall i facit (19) som saknas | 3 (99, 1999, 98 + 🇸🇪) | 0 |

**Resultat (körning 2026-10-25):** v2 nådde målet för gränserna: alla fyra gränser täcktes
på båda sidor, och alla 19 fall i facit kom med. Räknesätten kom med i båda versionerna,
men i v2 som en tabell som visar vad varje fel räknesätt ger. Prioriteringen hjälpte
inte: 24 av 29 blev *Måste*, så förslaget blev större att granska än i v1.
