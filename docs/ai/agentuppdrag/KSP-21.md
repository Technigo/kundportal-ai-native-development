# Agentuppdrag 1: svenskt felformat i backenden (KSP-21)

> **Godkänt av Azalea 2026-10-27.** Utkastet skrevs av AI på min begäran, och valen under
> "Mina val" är mina. Agenten kördes i en egen session med det här uppdraget som enda
> instruktion. Resultatet blev PR #30 (svenskt felformat i backenden):
> https://github.com/desiboli/kundportal-ai-native-development/pull/30.
>
> Filen lades in i repot 2026-10-31, kopierad från min lokala AI-logg. Bara den här rutan är
> ny. Avsnittet "Min granskning" fylldes i efter körningen.

---

## Id i det här uppdraget

**KSP-xx** är ärenden i Linear, **CORE-xx** kraven för kärnan (`docs/specs/SPEC-karna.md`),
**HIST-xx** kraven för statuslogik och historik (`docs/specs/SPEC-arendehistorik.md`) och
**Bx** beslut i CORE-specens beslutstabell.

| Id | Vad det gäller |
| --- | --- |
| KSP-21 | Det här uppdraget: svenskt felformat i backenden |
| KSP-22 | Ärendemodell och `POST /tickets` med validering, inklusive trimning (inte nu) |
| KSP-34 | TicketService, som skriver status och historik i samma transaktion (inte nu) |
| KSP-36 | HIST-09 byggt som agentuppdrag 2 (inte nu) |
| CORE-09 | `status` skickas med när ett ärende skapas → 422 med eget meddelande |
| CORE-10 | Okänt ärende eller id som inte är heltal → 404 "Ärendet finns inte." |
| CORE-16 | Alla fel på svenska som `{"detail": ...}`, aldrig stacktrace, SQL eller engelska |
| CORE-17 | Fel datatyp, saknad kropp, trasig JSON eller ogiltig UTF-8 → 422 "Ogiltig indata." |
| CORE-18 | Flera fel samtidigt → alla meddelanden i fältordningen |
| HIST-09 | Statusbytet avbryts om historikposten inte kan sparas (503) |
| HIST-14 | Samma felformat som CORE-16, för status och historik (backenddelen här) |
| B7 | Fältordningen: rubrik, beskrivning, kategori, prioritet, status |
| B8 | Id som inte är heltal behandlas som okänt ärende (404) |
| B9 | Fel datatyp ger bara "Ogiltig indata.", utan fältmeddelanden |
| B10 | Vad som räknas som tomt: blanktecken och nollbreddstecken (U+200B m.fl.) |
| B12 | Bara ändarna trimmas, texten inne i fältet sparas oförändrad |

## 1. Mål

Alla fel från backendens API har formen `{"detail": "<svenskt meddelande>"}`, utan stacktrace,
SQL eller engelska fältnamn (CORE-16, CORE-17, CORE-18, backenddelen av HIST-14). Ett id som
inte är ett heltal ger 404 "Ärendet finns inte." (CORE-10, B8). Linear: KSP-21, AC1–AC4.

## 2. Läs först

1. `AGENTS.md`, reglerna för agenter i projektet.
2. `docs/specs/SPEC-karna.md` avsnitt 4 (tabellen med felmeddelanden, B7 och B9), CORE-09,
   CORE-10 och CORE-16–18 i avsnitt 5, och beslutstabellen (B7, B8, B9).
3. `docs/api-konventioner.md` avsnitt 2 (felformat och statuskoder).
4. `docs/specs/SPEC-arendehistorik.md`, HIST-14.
5. `docs/ai/testforslag-v1.md`, instruktionen för testförslag.
6. Befintlig kod: `backend/app/main.py`, `backend/app/api/tickets.py` (fem stubbar som svarar
   501), `backend/app/schemas/tickets.py` (kontraktet), `backend/tests/conftest.py` och
   `backend/tests/test_openapi_contract.py`.

**Det här gäller just nu** (beslutat 2026-10-27, bekräftas på teammötet):

- `TicketCreate` har `extra="forbid"`. Okänt fält `status` ger meddelandet i CORE-09. Andra
  okända fält ger *bara* "Ogiltig indata.", utan fältmeddelanden, på samma sätt som fel
  datatyp (B9). Exempel: rubrik saknas och `"foo": 1` ger "Ogiltig indata.".
- Teamet har godkänt att starlette låses i `requirements.txt` på den version som finns
  installerad i dag (1.9.0).
- Id som inte är ett heltal ger 404 "Ärendet finns inte.", inte 422.

## 3. Uppgift

Steg i den här ordningen. Stanna vid varje kontrollpunkt (avsnitt 5).

1. **Testförslag.** Föreslå tester för CORE-09, CORE-10, CORE-16, CORE-17 och CORE-18 och
   för backenddelen av HIST-14, enligt `docs/ai/testforslag-v1.md`. Skriv ingen testkod än.
2. **Testerna först.** Skriv de tester jag har valt i `backend/tests/test_error_format.py`.
   Kör hela testsviten och visa att de nya testerna faller av rätt anledning: engelska
   meddelanden eller fel statuskod, inte importfel eller felskrivna tester.
3. **Koden.** Skriv felhanterarna så att testerna går igenom:
   - `RequestValidationError` → 422 med svenska fältmeddelanden i fältordningen rubrik,
     beskrivning, kategori, prioritet, status, sammanfogade med mellanslag (B7, CORE-18).
     Fel datatyp, saknad kropp eller trasig JSON ger bara "Ogiltig indata." (B9, CORE-17).
   - Valideringsfel på `ticket_id` i sökvägen → 404 "Ärendet finns inte." (B8).
   - Starlettes `HTTPException` för en kropp som inte går att tolka, t.ex. ogiltig UTF-8
     (i dag 400 "There was an error parsing the body") → 422 "Ogiltig indata.". `HTTPException`
     som redan har ett svenskt `detail` (t.ex. 501 från stubbarna) ska passera oförändrade.
   - Starlettes engelska 404 för en väg som inte finns → 404 "Sidan finns inte.", och 405 för
     fel metod → 405 "Metoden stöds inte.". 404 för ett okänt ärende ger fortfarande
     "Ärendet finns inte.".
   - Oväntade fel → 500 "Något gick fel. Försök igen.", utan tekniska detaljer. Testa det med en route som bara finns i
     testet och som kastar ett fel med flit. 503 (databasfel) ingår inte, se avsnitt 4.
4. **Lås starlette** i `backend/requirements.txt`, och ändra inget annat där.
5. **Rapport** enligt avsnitt 7.

Det som ska ge 201 kan inte testas än, eftersom stubbarna svarar 501. Giltig indata ska ge
501, och det visar att valideringen släppte igenom den.

## 4. Gränser

**Får röra (fyra filer):**

- `backend/app/errors.py` (ny): hanterarna och tabellen som översätter till svenska
- `backend/app/main.py`: bara registreringen av hanterarna i `create_app`
- `backend/requirements.txt`: bara raden för starlette
- `backend/tests/test_error_format.py` (ny): testerna
- Inga andra filer. Om en till behövs, t.ex. `tests/conftest.py`: stanna och fråga (kontrollpunkt 3).

**Får inte:**

- Ändra kontraktet: modellerna i `app/schemas/tickets.py`, vägarna, statuskoderna eller
  `responses` i `app/api/tickets.py`. Om något där måste ändras: stanna och fråga.
- Bygga trimning eller tomhetskontroll (B10, B12, U+200B). Det hör till KSP-22. Om ett test
  kräver trimning: lägg inte till testet, notera det i rapporten.
- Bygga logik i stubbarna, tabeller eller databaskod.
- Bygga en hanterare för databasfel (503). Den byggs när det finns databaskod att testa mot,
  i KSP-34 (TicketService) eller KSP-36 (HIST-09, atomicitet vid fel).
- Ta bort, hoppa över eller försvaga befintliga tester. `test_openapi_contract.py` ska vara grön.
- Lägga till andra beroenden än låsningen av starlette.
- Röra frontend, `docs/` eller CI.
- Committa, pusha eller öppna PR. Det gör jag.
- Hitta på meddelandetexter. Bara texterna i specen och i det här uppdraget får användas
  (500, 404 för okänd väg och 405 står bara här). Om en text saknas: stanna och fråga.

**Kodstil:** namn och kommentarer på engelska, svenska bara i meddelanden (AGENTS.md). En kort
beskrivning överst i varje ny fil och kommentarer som förklarar *varför*, som i
`app/api/tickets.py`. När ett krav-id nämns i kod, docstring eller testnamn förklaras det kort
på engelska, t.ex. `# CORE-10: unknown ticket or non-integer id gives 404`. Ett naket id räcker inte.

## 5. Kontrollpunkter (agenten stannar och väntar på mig)

1. **Efter testförslagen:** visa listan. Jag väljer, stryker eller ändrar innan någon testkod skrivs.
2. **Efter att testerna fallit:** visa kommandot och utskriften (`pytest -q`) och förklara
   varför varje nytt test faller.
3. **Innan någon fil utanför listan i avsnitt 4, eller kontraktet, behöver ändras:** stanna
   och fråga.
4. **När koden är klar:** visa hela diffen och testutskriften, och vänta på min granskning.

## 6. Klart när

- `.\.venv\Scripts\python -m pytest -q` i `backend/` ger bara gröna tester, både de nya och de gamla.
- Inget svar från API:t innehåller engelska meddelanden, stacktrace eller SQL i de fall som
  testerna täcker.
- Jag har själv startat servern på port 8010 och provat manuellt:
  - `GET /tickets/abc` ger 404 "Ärendet finns inte."
  - `POST /tickets` med `{"title": 5}` ger 422 "Ogiltig indata."
  - `POST /tickets` med trasig JSON ger 422 "Ogiltig indata."
  - `GET /tiketts` ger 404 "Sidan finns inte."
  - Ogiltig UTF-8 ger 422 "Ogiltig indata." (i dag 400 "There was an error parsing the body",
    kontrollerat 2026-10-27). Kommandot i Git Bash:
    `printf '{"title":"\xff"}' | curl -s -X POST http://localhost:8010/tickets -H "Content-Type: application/json" --data-binary @-`

## 7. Rapport från agenten

- Vilka filer som ändrades och varför
- Testutskrift före koden (failed) och efter (passed), med antal
- Vad den inte gjorde och varför (t.ex. fall som kräver trimning, KSP-22)
- Osäkerheter, t.ex. om FastAPIs `HTTPValidationError` står kvar i `/openapi.json`. Den ska
  bara undersöka och rapportera, inte ändra.
- Antaganden den gjorde

## Mina val (2026-10-27)

AI visade för- och nackdelar för varje fråga, och jag valde:

1. Andra okända fält än `status` ger bara "Ogiltig indata." (som B9, fel datatyp).
2. 500 ingår, 503 väntar till KSP-34/KSP-36 när det finns databaskod att testa mot.
3. Texten för 500: "Något gick fel. Försök igen."
4. Svenska för Starlettes 404 och 405: "Sidan finns inte." och "Metoden stöds inte.".
5. Fyra filer, ingen femte. Manuella kontroller utöver de tre: `/tiketts` och ogiltig UTF-8.

**Till Nicklas (CORE-specen):** texterna i 1, 3 och 4 finns inte i specen än.


---

## Min granskning (fylls i efter körningen)

| Del av diffen | Accepterade / ändrade / avvisade | Varför |
| --- | --- | --- |
| 25 testförslag (kontrollpunkt 1) | Accepterade alla, och agentens svar på de sex frågorna | Varje test pekar på ett krav-id, och meddelandena är exakt specens |
| `backend/tests/test_error_format.py` | Accepterade | Testerna föll av rätt anledning: engelska meddelanden eller fel statuskod, inga importfel |
| `backend/app/errors.py` | Accepterade | Bara texter från specen eller mina val. Rättningen efter det fallerande testet gjordes i koden, inte i testet |
| Den enhetliga regeln: en kod som inte är en sträng är fel datatyp, även för kategori och prioritet | Accepterade, och ändrade därmed mitt eget första svar på fråga 1 | HIST-06 säger "samma som B9", samma regel för alla fält är lättare att förklara och testa, och en handläggare kan aldrig skicka en siffra från formuläret |
| `backend/app/main.py` | Accepterade | Bara registreringen av hanterarna, som uppdraget tillät |
| `backend/requirements.txt` | Accepterade | Bara raden `starlette==1.9.0`, som teamet godkänt |
| OpenAPI-luckan (FastAPI:s engelska 422 står kvar i `/openapi.json`) | Inte ändrad, bara rapporterad | Ändringen var förbjuden i uppdraget. Den rättas i ett eget ärende efter att Mustafa tillfrågats |

**Testkörningar:** före koden `43 failed, 37 passed`. Efter koden först `1 failed, 79 passed` (`{"status": 5}`), sedan `80 passed`. Jag körde `pytest -q` själv och fick 80 passed.

**Vad agenten gjorde fel eller missade:**

- Den påstod först att Pydantic inte kan skilja `"category": 5` från en okänd kategori. Ett fallerande test visade att den hade fel, och agenten frågade mig innan den gick emot mitt svar.
- Överlämningen sa att HIST-specen saknade text för `PATCH` med `{}`. Det stämde inte: specen säger "okänd eller saknad status → Välj en giltig status.". Nicklas hittade det i granskningen, och det rättades i PR #32 (saknad status i PATCH ger "Välj en giltig status."): https://github.com/desiboli/kundportal-ai-native-development/pull/32.

**PR:** PR #30 (svenskt felformat i backenden): https://github.com/desiboli/kundportal-ai-native-development/pull/30, godkänd av Nicklas och mergad 2026-10-27.
