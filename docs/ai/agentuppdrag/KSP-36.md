# Agentuppdrag 2: HIST-09, rollback och 503 när historikposten inte kan sparas (KSP-36)

> **Godkänt av Azalea 2026-11-02, före körningen.** Utkastet skrevs av AI på min begäran,
> utifrån mina beslut från 2026-10-30 och 2026-11-02. Valen under "Mina val" är mina. Agenten
> körs i en egen session med det här uppdraget som enda instruktion. Avsnitten "Hinder och
> frågor" och "Min granskning" fylls i efter körningen.

---

## Id i det här uppdraget

| Id | Vad det gäller |
| --- | --- |
| KSP-36 | Det här uppdraget: koden för HIST-09, byggd av en agent |
| KSP-41 | Azaleas tester för HIST-09, redan skrivna före koden (`fa54194`) |
| KSP-63 | Teamets längre agentarbete vecka 7: kontrollpunkter och hinder dokumenteras |
| HIST-02 | Status och historikpost sparas i samma transaktion |
| HIST-07 | Samma status som nu ger 409 och ingen ny post |
| HIST-09 | Om historikposten inte kan sparas rullas statusbytet tillbaka: 503 "Statusen kunde inte ändras. Försök igen.", gammal status kvar även med ny engine, nästa byte lyckas |
| HIST-14 | Samma svenska felformat för status och historik, utan tekniska detaljer |
| ADR-001 | Beslutet om atomicitet: en transaktion i `TicketService`, `rollback` vid fel, 503 i stället för 500 |

## 1. Mål

När historikposten för ett statusbyte inte kan sparas rullas hela bytet tillbaka, och API:t
svarar 503 `{"detail": "Statusen kunde inte ändras. Försök igen."}`. Ärendet behåller sin gamla
status, och samma session kan användas igen (HIST-09, ADR-001). Alla tester i
`backend/tests/test_atomicity.py` och alla befintliga tester är gröna.

## 2. Läs först

1. `AGENTS.md` och `docs/ai/misstag-azalea.md`.
2. `docs/specs/SPEC-arendehistorik.md`: HIST-09, HIST-14 och avsnitt 10 (mutationerna).
3. `docs/decisions/ADR-001-atomicitet-status-och-historik.md`, särskilt beslutet om 503.
4. `docs/api-konventioner.md` avsnitt 2 (raden för 503).
5. `backend/tests/test_atomicity.py`: de sju testerna som ska bli gröna. Läs kommentarerna:
   de säger vad varje test fångar.
6. Koden: `backend/app/services/tickets.py` (`change_status`), `backend/app/api/tickets.py`
   (`PATCH /tickets/{id}/status`), `backend/app/errors.py` (hanterarna) och
   `backend/app/repositories/history.py` (`add` gör `flush`).

**Det här gäller (Azaleas beslut):**

- **`rollback` vid alla fel** i `change_status` efter att statusen ändrats, så att sessionen
  aldrig lämnas trasig. Felet kastas sedan vidare.
- **503 bara för databasfel** (`SQLAlchemyError`). Andra fel blir fortfarande 500 "Något gick
  fel. Försök igen." via den befintliga hanteraren, så att en bugg inte döljs bakom
  "försök igen".
- Meddelandet är exakt specens: "Statusen kunde inte ändras. Försök igen." Inga andra texter.
- `responses` för `PATCH` har redan 503 i kontraktet. Det ändras inte.

## 3. Uppgift

Testerna finns redan (KSP-41). Agenten skriver **ingen** testkod. Stanna vid varje
kontrollpunkt (avsnitt 5).

1. **Plan, utan kod.** Kör `pytest -q` och visa nollpunkten (väntat: 3 failed, 170 passed).
   Beskriv sedan hur du tänker göra: var `rollback` görs, hur ett databasfel blir 503 (eget
   fel från tjänsten som fångas i vägen, eller en hanterare i `errors.py`) och varför.
2. **Rollback i tjänsten.** `test_hist09_same_service_works_after_failure` ska bli grönt.
3. **503 i API:t.** `test_hist09_failed_history_write_gives_503` och
   `test_hist09_rollback_keeps_non_initial_status` ska bli gröna. Hela sviten grön.
4. **Rapport** enligt avsnitt 7.

## 4. Gränser

**Får röra (tre filer):**

- `backend/app/services/tickets.py`: bara `change_status` och ett eventuellt nytt fel
- `backend/app/api/tickets.py`: bara `change_status`-vägen och dess docstring
- `backend/app/errors.py`: bara om planen behöver en hanterare där
- Inga andra filer. Om en till behövs: stanna och fråga.

**Får inte:**

- Ändra, ta bort, hoppa över eller försvaga något test, särskilt inte i `test_atomicity.py`.
  Verkar ett test fel: stanna och fråga.
- Ändra tabellen `tickets`, modellerna eller kontraktet (vägar, statuskoder, `responses`).
- Ändra `create` eller andra metoder än `change_status`. Ser du samma risk där: skriv det i
  rapporten, bygg inget.
- Fånga alla fel som 503, eller lägga `str(exc)` eller annan teknisk text i svaret.
- Hitta på meddelandetexter.
- Lägga till beroenden, röra frontend, `docs/` eller CI.
- Committa, pusha eller öppna PR. Det gör Azalea.

**Kodstil:** namn och kommentarer på engelska, svenska bara i meddelanden. Kommentarer som
förklarar *varför*, och varje krav-id förklarat kort, t.ex.
`# HIST-09: roll back so the session can be used again (ADR-001)`.

## 5. Kontrollpunkter (agenten stannar och väntar på Azalea)

1. **Efter planen:** nollpunkten och planen. Ingen kod förrän Azalea godkänt.
2. **Efter rollback i tjänsten:** diffen och `pytest -q tests/test_atomicity.py`.
3. **Efter 503 i API:t:** hela diffen och `pytest -q` för hela sviten.
4. **Före varje fil utanför avsnitt 4, eller om ett test verkar fel:** stanna och fråga.

## 6. Klart när

- `.\.venv\Scripts\python -m pytest -q` i `backend/` ger bara gröna tester (väntat: 173 passed).
- Azalea har läst hela diffen och kört testerna själv.
- Azalea har startat servern på port 8010 och provat att ett vanligt statusbyte fortfarande ger
  200, att samma status ger 409 och att ett okänt ärende ger 404.

## 7. Rapport från agenten

- Vilka filer som ändrades och varför
- Testutskrift före (3 failed) och efter, med antal
- Varje fråga eller hinder under arbetet och hur det löstes (krävs i KSP-63)
- Vad den inte gjorde och varför
- Antaganden den gjorde

## Mina val

Från `01-Plan.md`:

1. Agenten får bara röra `services/tickets.py`, `errors.py` och `api/tickets.py` (2026-10-30).
2. Uppdraget räknas som teamets längre agentarbete, KSP-63 (2026-10-30).
3. `rollback` vid alla fel, 503 bara för databasfel (`SQLAlchemyError`) (2026-11-02).
4. Testerna skrivs före koden och rörs inte av agenten (2026-11-02, `fa54194`).

5. Agenten fortsätter på `test/ksp-41-hist09-rollback`, så att PR:en visar testerna först och
   koden sedan (AI:s förslag, valt 2026-11-02).
6. Manuellt prov: de tre fallen i avsnitt 6 (200, 409, 404 på port 8010). Ett databasfel går
   inte att framkalla för hand utan att ändra koden, så HIST-09 prövas av testerna. Provet
   visar att agenten inte förstört resten av statusbytet (AI:s förslag, valt 2026-11-02).

---

## Hinder och frågor under körningen

| Kontrollpunkt | Hinder eller fråga | Hur det löstes | Mitt beslut |
| --- | --- | --- | --- |
| 1 | Var ska konstanten för 503-meddelandet ligga? Uppdraget tillät `errors.py` bara för en hanterare | Agenten stannade och frågade i stället för att tänja på gränsen | A: i `errors.py` bredvid `SAME_STATUS`, ingen hanterare, så att alla meddelanden ligger på ett ställe |
| 1 | `create` har samma risk som `change_status` hade: `commit` utan `rollback` | Rapporterat, inte byggt, eftersom det låg utanför uppdraget | Eget ärende i Linear. Samma lösning som i `change_status`, med tester först |
| 2 | Inga | – | Godkände steg 2 efter diffen och `test_atomicity.py` (2 failed, 5 passed, som väntat) |
| 3 | Jag slog på auto mode i agentens session efter kontrollpunkt 2, så filändringarna i steg 3 godkändes inte en och en | Kontrollen låg i att agenten stannade vid kontrollpunkt 3, vilket den gjorde | Planen var godkänd och steg 2 hade fungerat, så jag litade på att kontrollpunkt 3 räckte |
| 3 | Två meddelanden som inte var till agenten kom in i dess session ("kan du börja anteckna och dokumentera", "nej vänta") | Agenten skrev inget och stannade före rapporten | – |
| 3 | Kommentaren i `change_status` påstod att databasfelet finns kvar i serverns logg. Det loggas aldrig, eftersom vägen gör om det till en hanterad `HTTPException` | Upptäckt i huvudsessionen (AI provade med ett skript), inte av agenten, fast agentens rapport sa det. Agenten rättade kommentaren på min instruktion | Rätta kommentaren, ingen loggning. Saknad loggning blir en känd begränsning |
| 3 | 500-grenen (andra fel än databasfel) prövades inte av något test. Agenten påpekade det själv | Två tester skrivna efter koden i huvudsessionen (`ba84f13`). Båda faller vid var sin mutation | Eget test efteråt |
| 3 | Mitt meddelande om kommentaren kom fram avklippt | Agenten tolkade det, sa öppet att den tolkat, och tolkningen var rätt | – |

## Min granskning

| Del av diffen | Accepterade / ändrade / avvisade | Varför |
| --- | --- | --- |
| Planen (kontrollpunkt 1): eget fel `StatusNotSaved` från tjänsten, 503 i vägen | Accepterade | Samma mönster som `TicketNotFound` (404) och `SameStatus` (409). En hanterare för `SQLAlchemyError` i `errors.py` hade också gällt `POST /tickets` med fel text |
| `services/tickets.py`: `try` runt bytet, posten och `commit`, `rollback` i båda grenarna | Accepterade | `except SQLAlchemyError` (rad 120) kommer före `except Exception` (rad 127), annars blir inget 503 |
| `errors.py`: `STATUS_NOT_CHANGED` | Accepterade | Exakt specens text (HIST-specen rad 197 och 240), kontrollerat av både mig och AI |
| `api/tickets.py`: `except StatusNotSaved` → 503 (rad 88–92) | Accepterade | Bara den svenska texten skickas, aldrig databasfelet (HIST-14) |
| Kommentaren "The cause stays in the server log" | Ändrade | Stämde inte. Nu: orsaken sparas som `__cause__` men loggas inte |
| Agentens rapport, raden om loggkommentaren | Rättad här | Rapporten sa att agenten upptäckte felet själv. Det gjorde den inte |

**Testkörningar:** före koden `3 failed, 170 passed`. Efter steg 2 `2 failed, 5 passed` i
`test_atomicity.py`. Efter steg 3 `173 passed`. Jag körde hela sviten själv och fick
`173 passed`. Efter de två testerna för 500-grenen `175 passed`.

**Mitt manuella prov (port 8010, `/docs`):** statusbyte 200, samma status 409 "Ärendet har redan
den statusen.", okänt ärende 404 "Ärendet finns inte.", och historiken för ärendet hade två
poster (`created` och `new` → `in_progress`). Det nekade bytet lämnade ingen post.

**Vad agenten gjorde fel eller missade:**

- Den påstod i planen och i en kodkommentar att orsaken till databasfelet hamnar i serverns
  logg, utan att ha kontrollerat det.
- Rapporten tog åt sig upptäckten av det felet.

**Kända begränsningar:** databasfel som ger 503 loggas inte. `create` gör fortfarande `commit`
utan `rollback` (eget ärende i Linear).

**Commits:** `fa54194` (testerna före koden), `b1e4c60` (uppdraget före körningen), `eb806a4`
(koden), `ba84f13` (testerna för 500-grenen, efter koden).
