# Verifieringsplan (mall)

Fylls i löpande. Uppgiften kräver tre saker: vilka tester som finns, hur och varför, samt resultat och begränsningar. Skilj automatiserade tester från manuella kontroller, och planerade från genomförda.

## 1. Vilka tester som finns

| AK | Typ | Beteende och förväntat resultat | Testfil | Status |
|---|---|---|---|---|
| AK1 | happy path | Giltigt ärende sparas med ärendenummer och skapad-tid | `backend/tests/create.test.js`, `newCase.test.js`, `caseNumber.test.js` | grön 2026-11-02 |
| AK2 | error path | Saknat obligatoriskt fält avvisas, inget sparas | `backend/tests/create.test.js`, `newCase.test.js`, `fields.test.js` | grön 2026-10-28 |
| AK3 | gränsfall | Rubrik 100 tecken godtas, 101 avvisas | `backend/tests/create.test.js`, `fields.test.js` | grön 2026-10-28 |
| AK4 | gränsfall | Beskrivning 5000 tecken godtas, 5001 avvisas | `backend/tests/create.test.js`, `fields.test.js` | grön 2026-10-28 |
| AK5 | gränsfall | Enbart mellanslag räknas som tomt | `backend/tests/create.test.js`, `fields.test.js` | grön 2026-10-28 |
| AK6 | error path | Deadline saknas avvisas | `backend/tests/create.test.js`, `fields.test.js` | grön 2026-10-28 |
| AK7 | error path | Passerad deadline avvisas | `backend/tests/create.test.js`, `fields.test.js`, `dagensDatum.test.js` | grön 2026-10-28 |
| AK8 | gränsfall | Dagens datum som deadline godtas | `backend/tests/create.test.js`, `fields.test.js`, `dagensDatum.test.js` | grön 2026-10-28 |
| AK9 | happy path | Ärende finns kvar efter omstart | `backend/tests/read.test.js` | grön 2026-11-02 |
| AK10 | happy path | Alla ärenden visas i listan | `backend/tests/read.test.js` | grön 2026-11-02 |
| AK11 | happy path | Alla fält visas för ett ärende | `backend/tests/read.test.js` | grön 2026-11-02 |
| AK12 | happy path | Statusändring sparas och finns kvar | `backend/tests/update.test.js` | grön 2026-11-02 |
| AK13 | error path | Ogiltig status avvisas, gamla kvar | `backend/tests/update.test.js` | grön 2026-11-02 |
| AK14 | happy path | Ändring av fält sparas, övriga oförändrade | `backend/tests/update.test.js` | grön 2026-11-02 |
| AK15 | error path | Ogiltig ändring avvisas | `backend/tests/update.test.js` | grön 2026-11-02 |
| AK16 | error path | Ärendenummer och skapad kan inte ändras | `backend/tests/update.test.js` | grön 2026-11-02 |
| AK10 | happy path | Alla ärenden från servern visas i listan | `frontend/tests/arenden.test.js` | grön 2026-11-09 |
| AK10 | gränsfall | Tom lista visar ett begripligt meddelande | `frontend/tests/arenden.test.js` | grön 2026-11-09 |
| AK10 | error path | Fel från servern visas och listan kraschar inte | `frontend/tests/arenden.test.js` | grön 2026-11-09 |
| AK11 | happy path | Klick på ett ärende visar alla åtta fält | `frontend/tests/arenden.test.js` | grön 2026-11-09 |
| AK12 | happy path | Statusbyte skickas som PATCH till `/status` och den nya statusen visas i listan | `frontend/tests/arenden.test.js` | grön 2026-11-09 |
| AK12 | gränsfall | Ett pågående statusbyte skickas bara en gång | `frontend/tests/arenden.test.js` | grön 2026-11-09 |
| AK13 | error path | Ogiltig status avvisas. Listan visar fortfarande Nytt. Det avvisade värdet står kvar i statusfältet tills Återställ eller en lyckad sparning | `frontend/tests/arenden.test.js` | grön 2026-11-09 |
| AK14 | happy path | Kategori och prioritet sparas. Övriga fält, inklusive listans status, är oförändrade | `frontend/tests/arenden.test.js` | grön 2026-11-09 |
| AK14 | gränsfall | Rubrik och beskrivning med taggar visas som text | `frontend/tests/arenden.test.js` | grön 2026-11-09 |
| AK15 | error path | Tom rubrik avvisas. Inmatningen står kvar och de sparade värdena är oförändrade | `frontend/tests/arenden.test.js` | grön 2026-11-09 |
| AK15 | error path | Flera fältfel från servern visas vid rätt fält | `frontend/tests/arenden.test.js` | grön 2026-11-09 |
| AK16 | error path | Ärendenummer och skapad är text, går inte att redigera och skickas inte med | `frontend/tests/arenden.test.js` | grön 2026-11-09 |

Tester utan AK-nummer, samma fil, gröna 2026-11-09. De täcker beteenden som specen inte numrerar:

- Oförändrade fält skickar inget PATCH.
- Nätverksfel (status 0) visas och inget visas som sparat.
- Återställ efter 400 återställer alla fem fälten och rör inte listan. Den rensar också fältfel och meddelandet, även "Statusen är ändrad.". Återställ är inaktiv medan en sparning pågår.
- Ett pågående sparande skickas bara en gång. Knappen är aktiv igen efter 400 och status 0.
- Ett allmänt fel ersätter det förra och rensas när nästa sparning startar.
- Fältfel från båda anropen visas vid rätt fält.
- Fält avvisas och status sparas: "Statusen är ändrad. Övriga fält kunde inte sparas."
- Fält sparas och status avvisas: "Övriga fält är sparade. Statusen kunde inte ändras."
- Enter i rubrikfältet gör samma sparning. Enter i beskrivningen skickar inget.

Att Spara är inaktiv tills något är ändrat har inget automatiserat test. Det är kontrollerat manuellt, se avsnitt 3.

## 2. Hur och varför

_Vald testnivå (t.ex. integrationstest mot HTTP + databas), varför just dessa testfall, och varför sättet att testa._

### Del 1 (AK1–AK8)

- **Integrationstester mot HTTP och databas** (`create.test.js`), ett eller flera per AK. De går genom hela kedjan. För varje error path räknas raderna i databasen, så att "inget sparas" verkligen kontrolleras.
- **Enhetstester** (`fields.test.js`, `newCase.test.js`, `caseNumber.test.js`) för gränsfall som är många eller krångliga att köra via HTTP. Exempel: ogiltiga datum som `2026-02-30`, och att `2026-9` följs av `2026-10`.
- **Tidszonstest** (`dagensDatum.test.js`). Testet byter datorns tidszon, eftersom ett fel med "dagens datum" annars inte syns på en dator som står på svensk tid.
- **Kontroll av testerna.** Felaktiga varianter av koden byttes in en i taget, och testerna blev röda varje gång (se `docs/del1-ai-logg.md`).

### Del 2 (AK9–AK16)

- **Integrationstester mot HTTP och databas** (`read.test.js`, `update.test.js`). Efter varje avvisad ändring läses ärendet på nytt och jämförs med hur det såg ut före, så att "oförändrat" verkligen kontrolleras.
- **Omstart testas med en riktig fil.** Servern stängs och en ny server öppnar samma fil med en ny anslutning. Bara det som finns i filen kan då läsas.
- **Passerad deadline** testas genom att starta om servern med en klocka som går en vecka senare.
- **Kontroll av testerna.** Sju felaktiga varianter byttes in en i taget, se resultatet nedan.

### Del 4 (AK10–AK16, gränssnittet)

- **JSDOM med fejkad `fetch`** (`frontend/tests/arenden.test.js`). Del 2 svarar fortfarande 501, så ett anrop mot den riktiga servern kan inte visa om sidan ritar rätt. Testerna kontrollerar vad sidan skickar och vad den visar.
- Varje AK har happy path och, där det finns, error path eller gränsfall. Sidan skickar bara fält som ändrats: status till `PATCH /api/arenden/:arendenummer/status`, övriga fält till `PATCH /api/arenden/:arendenummer`.
- Text från servern läses med `textContent`. Därför finns ett eget test för rubrik och beskrivning som innehåller taggar.
- Detaljen är medvetet inte en `dl` med åtta textvärden. Ärendenummer, skapad och deadline är text. Rubrik, beskrivning, kategori och prioritet är formulärfält. Status är en lista. Fälten ska inte visas två gånger.
- Deadline går inte att redigera. Öppen fråga 2 i specen är inte avgjord.
- **Kontroll av testerna.** Felaktiga varianter byttes in en i taget, testerna blev röda, och koden återställdes. Exempel: ett sparat fält skrev över den avvisade statusen, en sparad status skrev över den avvisade rubriken, status skickades fast den var oförändrad, och vakten släpptes när det första av två svar kom.

## 3. Resultat och begränsningar

_Faktiska körresultat (kommando + utfall), vad testerna inte visar, manuella kontroller (t.ex. är felmeddelandena begripliga?)._

### Del 1 (AK1–AK8), 2026-10-28

**Automatiserat**

- `npm test` på `main` (528569f) plus ändringarna för Del 1:
  - backend 179 gröna, 12 todo
  - frontend 7 gröna, 10 todo
- Samma resultat för backend med `TZ=UTC` och `TZ=America/New_York`.

**Manuellt**

Den riktiga servern startades med en tillfällig databasfil (`PORT=3917 DB_PATH=<tillfällig fil> npm start`). Sedan skickades tre `POST /api/arenden` med `curl`:

| Begäran | Svar |
|---|---|
| Giltigt ärende med dagens datum som deadline | `201` och `2026-1` |
| Tom kropp `{}` | `400` med fältfel för alla sex fält |
| Rubrik på 101 tecken och deadline `2020-01-01` | `400` med båda felen samtidigt |

Efteråt fanns exakt 1 ärende i databasen.

**Begränsningar**

- AK1 säger att ärendet "visas i ärendelistan". Det är inte testat, eftersom `GET /api/arenden` (Del 2) inte är byggd än.
- Bara API-svaren är kontrollerade. Hur felmeddelandena visas i formuläret är inte kontrollerat (Del 3).
- Med `TZ=Pacific/Auckland` blir 2 tester röda. Orsaken är `FIXED_NOW` i testhjälpen, inte koden. Förslaget till teamet finns i `docs/del1-ai-logg.md`.
- Flera servrar mot samma databasfil: en krock ger `500`, aldrig dubbla ärendenummer. Det finns ingen `busy_timeout`.

### Del 2 (AK9–AK16), 2026-11-02

**Automatiserat**

- `npm test` på `main` (db261d3) plus ändringarna för Del 2:
  - backend 221 gröna, 0 todo
  - frontend 7 gröna, 10 todo

**Fångar testerna felet?**

| Felaktig variant | Röda tester |
|---|---|
| Databasen sparas bara i minnet (AK9) | 5 |
| Ingen kontroll av rubrik vid ändring (AK15) | 4 |
| Ingen `trim()` vid ändring | 1 |
| Ändringen rör även status (AK14) | 6 |
| Deadline kontrolleras alltid, även när den inte ändras | 1 |
| Ingen kontroll av status (AK13) | 4 |
| Listan sorteras med äldsta först | 1 |

**Manuellt**

Den riktiga servern startades med en tillfällig databasfil, tillsammans med `frontend/index.html` från grenen `view-detail`. Sedan skickades begäran med `curl`:

| Begäran | Svar |
|---|---|
| `POST` giltigt ärende | `201` och `2026-1` |
| `GET` listan | `200` med ärendet |
| `PATCH …/status` till Pågående | `200`, ny status |
| `PATCH` kategori och prioritet, plus `skapad: "x"` | `200`, nya värden, `skapad` oförändrad |
| `PATCH` prioritet 6 | `400` med fältfel |
| `PATCH` med trasig JSON | `400` |

**Begränsningar**

- Bara API-svaren är kontrollerade. Listan och detaljvyn i webbläsaren är inte provade mot den här koden.
- Deadline vid ändring är ett förslag på öppen fråga 2 i specen. Teamet har inte bekräftat det.
- En sökväg med trasig kodning (`/api/arenden/%E0`) ger `500` i stället för `404`. Felet ligger i `decodeURIComponent` i `app.js`, som är en skelettfil.

### Del 4, 2026-11-09

**Automatiserat**

- `npm test`:
  - backend 179 gröna, 12 todo
  - frontend 29 gröna, 5 todo, varav 24 i `frontend/tests/arenden.test.js`

**Manuellt**

Sidan öppnades på `http://localhost:3000/`. `fetch` byttes ut i sidan, eftersom listan och sparning mot den riktiga servern svarar 501.

- En kolumn i ordningen ärendenummer, rubrik, beskrivning, kategori, prioritet, status, skapad, deadline. En knapp med texten Spara.
- Ändrad kategori och status, ett klick: ett fältanrop och ett statusanrop. Båda värdena visades som sparade och meddelanderutan tömdes.
- Återställ lade tillbaka rubriken. Ett nytt klick på Spara skickade ingenting.
- Spara var inaktiv från start, aktiv efter en ändring, och inaktiv igen när värdet återställdes eller efter Återställ.
- Vid 1280, 768 och 375 px: ingen sidledsscroll, och dialogen rymdes. På 375 px ligger Återställ och Spara under varandra. Innehållet scrollar lodrätt i dialogen vid 1280 och 375 px. Vid 768 px rymdes det utan scroll.

**Begränsningar**

- Inget riktigt PATCH eller GET är kontrollerat. Servern svarar 501.
- "Finns kvar efter omstart" i AK12 och AK14 är inte visat. Det hör till backend.
- Prioritet 6 och en kategori utanför listan kan inte väljas i formuläret. De fältfelen är simulerade serversvar.
- En beskrivning på cirka 5000 tecken, en rubrik på 100 tecken utan mellanslag och texten för en tom lista är inte kontrollerade i webbläsaren.
- Att Spara är inaktiv tills något ändras saknar automatiserat test.

## Så körs testerna

```bash
npm install
npm test
```
