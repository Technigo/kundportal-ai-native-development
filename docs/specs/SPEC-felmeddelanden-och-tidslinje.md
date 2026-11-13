# Spec: Felmeddelanden i UI och tidslinjen i detaljvyn

> Status: **v1.2** · Ansvarig: Amalia (amaliaa-91) · Granskare: Mustafa (desiboli), Azalea (Azaalea) · Vecka 7
> Detta dokument är teamets underlag för besluten i KSP-38 (felmeddelanden i UI) och KSP-37
> (tidslinjen i detaljvyn). Det har inga egna krav-id. Det hänvisar till kraven som redan finns:
> **HIST-xx** i [SPEC-arendehistorik.md](SPEC-arendehistorik.md), **CORE-xx** i
> [SPEC-karna.md](SPEC-karna.md), och acceptanskriterier (**AC**) och testfall (**TC**) i Linear
> under **KSP-37**, **KSP-38** och **KSP-45** (komponenttester för tidslinjen och felmeddelandena).
>
> Besluten togs 2026-11-05–07 och byggdes i PR #107 (felmeddelanden i UI):
> https://github.com/desiboli/kundportal-ai-native-development/pull/107 och PR #109 (tidslinjen i
> detaljvyn): https://github.com/desiboli/kundportal-ai-native-development/pull/109.

## 1. Syfte

En handläggare som skapar ett ärende, byter status eller öppnar ett ärende ska, när något går
fel, se på svenska vad som gick fel och kunna avgöra om hen ska rätta sin inmatning, försöka igen
eller gå tillbaka till listan (HIST-14, fel på svenska, och CORE-16, fel utan tekniska detaljer).
Hen ska också kunna se ärendets väg från att det skapades till den status det har nu (HIST-05,
tidslinjen i detaljvyn).

## 2. Omfattning

**Ingår:** hur fel visas i ärendelistan, formuläret, statusbytet, detaljvyn och tidslinjen, och
hur tidslinjen visar, hämtar och uppdaterar historiken.

**Ingår inte:**
- Felformatet och texterna i backenden. Det är backend-delen av HIST-14 (Azalea).
- Att ändra API:ts texter. Det kräver att teamet tillfrågas först (AGENTS.md).
- Validering i frontend. API:t avgör vad som är fel (KSP-30, formuläret).
- Fel vid varje fält. Flera fel visas samlat, som API:t ger dem (beslut B7 i CORE-specen).
- Vem som gjorde en ändring. Det finns ingen inloggning.
- En egen avisering till skärmläsare när en ny post kommer i tidslinjen. Statusbytet visar redan
  den nya statusen.
- En tom historiklista. Den kan inte uppstå, eftersom posten `created` alltid finns (HIST-12).

## 3. Förutsättningar

- Alla felsvar från API:t har formen `{"detail": "<svenskt meddelande>"}` (API-konventionerna,
  avsnitt 2). Texterna står i CORE-specen (avsnitt 4) och HIST-specen (avsnitt 5).
- `GET /tickets/{id}/history` ger posterna äldst först, och vid samma tid efter `id`
  (HIST-03, HIST-11). Första posten är alltid `created` med `from_status: null` (HIST-01).
- Ärenden kan inte raderas (`DELETE` ger 405). Ett ärende som har hämtats finns alltså kvar när
  historiken hämtas. Läggs radering till behöver fallet "ärendet finns men historiken ger 404"
  hanteras.
- När backenden är avstängd svarar Vite-proxyn 502 utan `detail`.

## 4. Felmeddelanden i UI (KSP-38)

| Regel | Krav |
| --- | --- |
| När API:t svarar med ett fel visas `detail` oförändrat: det delas inte upp och skrivs inte om. Flera fältfel kommer som en sträng och visas så | KSP-38 AC1, CORE-18, B7 |
| Ett felsvar utan läsbart `detail` (inte JSON, eller JSON utan `detail`) ger en fast svensk text, aldrig ett tomt meddelande. Statuskoden avgör texten: **502, 503 och 504** (backenden nås inte) ger "Kundserviceportalen svarar inte just nu. Försök igen om en stund.", och **alla andra koder** ger "Något gick fel. Försök igen.", samma som backendens eget 500-svar | KSP-38 AC2 |
| Inget svar alls (nätverksfel) ger "Kundserviceportalen svarar inte just nu. Försök igen om en stund." | KSP-38 AC2 |
| Ett meddelande innehåller aldrig tekniska ord: inga engelska fältnamn som de ser ut i JSON, ingen statuskod, ingen stacktrace, inget `TypeError` eller `fetch` | HIST-14, CORE-16 |
| Felen visas i BOLDkits `Alert`, variant `destructive`, med `role="alert"` | KSP-38 AC3 |
| Texten på den röda bakgrunden är svart (`--destructive-foreground` i temat). Vit text gav kontrasten 3.78, och kravet är 4.5. Svart ger 5.55 | KSP-38 AC3 |
| När ett ärende inte finns (404, också för id som inte är heltal) har felmeddelandet i detaljvyn en länk, "Tillbaka till ärendelistan". Länken visas **bara** vid 404, eftersom rådet vid 500 är att försöka igen | KSP-38 AC4, CORE-10, B8 |
| Det handläggaren skrev i formuläret ligger kvar efter ett fel | KSP-30 |

## 5. Tidslinjen i detaljvyn (KSP-37)

**Visning**

| Regel | Krav |
| --- | --- |
| Avsnittet "Historik" (`<h2>`) ligger under ärendet | KSP-37 AC5 |
| Posterna visas med den **senaste överst**, så att den aktuella statusen hamnar bredvid statusmärket. API:t ger dem äldst först, och UI:t vänder bara ordningen. Det sorterar aldrig själv | KSP-37 AC2, HIST-03, HIST-11 |
| Ett statusbyte visas som "~~Nytt~~ → Pågående", med svenska etiketter. Den gamla statusen är överstruken (`<s>`, inte längre gällande). Pilen är dold för skärmläsare, som läser "Nytt till Pågående" | KSP-37 AC1, HIST-05 |
| Posten `created` har ingen gammal status. Rubriken är statusen, "Nytt", och raden "Ärendet skapades" står under | HIST-05 |
| Varje post visar tiden i lokal tid, `ÅÅÅÅ-MM-DD TT:MM`, som "Skapad" i detaljvyn (KSP-31 AC6), i ett `<time>`-element | KSP-37 AC1 |
| Den senaste posten, den översta, har en större lila prick (24 px) och den dolda texten "(aktuell status)", så att den inte bara syns i färg och storlek. Tidigare poster har mindre prickar (16 px). Skuggan på prickarna är 2 px i stället för BOLDkits 4 px | KSP-37 AC3, HIST-05 |
| Tidslinjen är en lista för skärmläsare (`role="list"` och `role="listitem"`), eftersom BOLDkits `timeline` bara består av `div`-element | KSP-38 AC3 |

**Hämtning**

| Regel | Krav |
| --- | --- |
| Historiken hämtas först när ärendet har kommit med 200. Ger ärendet 404 hämtas ingen historik, och bara detaljvyns felmeddelande visas | HIST-08 |
| Efter ett lyckat statusbyte och efter en 409 hämtas historiken igen, och den nya posten syns utan att sidan laddas om. Efter 422 eller 503 har inget ändrats, och historiken hämtas inte igen | KSP-37 AC4, HIST-07 |
| Vid första laddningen visas ett skelett, som läses som "Laddar historiken …" | HIST-05 |
| Vid en ny hämtning står den gamla listan kvar tills den nya har kommit, så att inget blinkar | KSP-37 AC4 |
| Det är ett **medvetet undantag** från HIST-05 (senaste posten stämmer med ärendets status): under den korta stunden visar statusmärket redan den nya statusen, medan tidslinjens senaste post är den gamla. Undantaget gäller bara visningen. Det sparade är alltid i takt, eftersom status och historikpost sparas i samma transaktion (ADR-001) | HIST-05, ADR-001 |

**Fel**

| Regel | Krav |
| --- | --- |
| Om ärendet har hämtats men historiken inte går att hämta (felsvar, inget svar, eller ett svar som inte är en lista) visas ärendet som vanligt. Tidslinjen visar "Historiken kunde inte hämtas." och en knapp, "Försök igen", som bara hämtar historiken igen | HIST-14, TC4 i KSP-45 |
| Det är ett **medvetet undantag** från att `detail` visas som det är: "Något gick fel. Försök igen." säger inte att det bara är historiken som saknas | HIST-14 |
| Om en ny hämtning efter ett statusbyte misslyckas ersätter felet den gamla listan, så att en lista som ligger efter ärendet aldrig visas | HIST-14 |

## 6. Beslut

Besluten är Amalias, om inget annat står. Varför de togs:

| Beslut | Varför | Alternativ som valdes bort |
| --- | --- | --- |
| Felen visas samlat, inte vid varje fält | API:t ger en sträng (B7), och att dela upp den vore att skriva om `detail` | fel per fält, som kräver ett ändrat API-kontrakt |
| 502, 503 och 504 ger "svarar inte", allt annat "Något gick fel" | Ett svar utan `detail` från backenden betyder att backenden svarade. Annars kunde en 404 visa "svarar inte" bredvid länken tillbaka. Risken är liten, men rättningen likaså (fynd 3 i Mustafas granskning av PR #107) | samma text för alla svar utan `detail` |
| Svart text på rött i temat, inte i `Alert` | Felet satt i temat: bytet till Purple-preseten (KSP-72) gjorde den röda ljusare. Rättat i temat gäller det också framtida röda knappar och märken (fynd 2 i Mustafas granskning) | `text-black` bara i `Alert` |
| Länken tillbaka bara vid 404 | Vid andra fel är rådet att försöka igen | länk vid alla fel |
| Tidslinjens eget felmeddelande med en knapp | Ärendet syns och fungerar, bara historiken saknas. Knappen säger vad handläggaren kan göra, så texten behöver inte upprepa "Försök igen" | `detail` som det är, eller omladdning av sidan |
| Historiken hämtas efter ärendet, inte samtidigt | Vid 404 blir det bara ett felmeddelande och inget onödigt anrop | båda samtidigt, och historikens fel döljs |
| Historiken hämtas igen från API:t efter ett byte | Rätt tid och id från databasen, och vid en 409 syns också den andras post | bygga posten i webbläsaren |
| Senaste posten överst (teamets beslut 2026-11-09) | Den aktuella statusen hamnar bredvid statusmärket, och resultatet av ett statusbyte syns direkt, också när ärendet har många poster. Mustafas förslag i granskningen av PR #109. KSP-37 AC2 ändrades från "äldst först" | äldst först, som API:t ger dem |
| Den gamla listan står kvar under en ny hämtning, ett medvetet undantag från HIST-05 | Mot en lokal backend tar hämtningen några millisekunder, och en lista som blinkar bort är störande. Undantaget gäller bara visningen, inte det som är sparat (ADR-001), så HIST-specen behöver inte ändras. Azalea godtog undantaget i granskningen av PR #112 | skelettet vid varje hämtning, eller att ta bort pricken "aktuell" under hämtningen |
| Rubriken "Nytt" för `created`, med "Ärendet skapades" under | Samma form som de andra posterna, och "Ärendet skapades" som rubrik kunde förvirra (efter kontroll i webbläsaren 2026-11-07) | rubriken "Ärendet skapades" med "Status: Nytt" |
| Överstruken gammal status, mindre tidigare prickar och mindre skugga | Den aktuella posten stack inte ut tillräckligt, och skuggan tog över (efter kontroll i webbläsaren 2026-11-07) | samma storlek på alla prickar |

## 7. Kända begränsningar

- **Kontrasten** kontrolleras bara för hand. jest-axe kan inte räkna färger i jsdom.
- **`--destructive-foreground` och `native-select`** är ändrade lokalt efter installationen från
  BOLDkit. Installeras Purple-preseten eller komponenten igen försvinner ändringarna.
- **Två statusbyten inom samma minut** får samma tid i tidslinjen. Ordningen är ändå rätt.
- **Felhanteringen för API-anrop** finns på två ställen, i `api/tickets.ts` och i ärendelistan.
  KSP-79 (gemensam felhantering) samlar den.

## 8. Verifiering

- **Komponenttester:** `frontend/src/components/ticket-timeline.test.tsx` (visningen) och
  `frontend/src/pages/ticket-timeline.test.tsx` (tidslinjen i detaljvyn). Felmeddelandena testas i
  testfilerna för listan, formuläret, detaljvyn och statusbytet. Testerna börjar på krav-id:t,
  till exempel `HIST-05:`, `HIST-14:`, `KSP-37:` och `KSP-38:`.
- **Kontroll för hand:** checklistan "Felmeddelanden i gränssnittet" i
  [verifieringsplanen](../verifiering.md), avsnitt 3, med kontrasten.
- **Status per krav:** raderna för HIST-05 och HIST-14 i verifieringsplanen, avsnitt 2.

## Ändringslogg

| Version | Datum | Ändring |
| --- | --- | --- |
| v1 | 2026-11-08 | Första versionen. Besluten från KSP-37 och KSP-38 (PR #107 och PR #109) samlade på ett ställe |
| v1.1 | 2026-11-09 | Den gamla listan under en ny hämtning är skriven som ett medvetet undantag från HIST-05, i avsnitt 5 och i beslutstabellen. Efter Azaleas granskning |
| v1.2 | 2026-11-09 | Senaste posten överst i tidslinjen, efter teamets beslut. Avsnitt 5 (Visning) och beslutstabellen. KSP-37 AC2 ändrad |
