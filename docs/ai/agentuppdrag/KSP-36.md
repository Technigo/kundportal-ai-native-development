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

## Hinder och frågor under körningen (fylls i)

| Kontrollpunkt | Hinder eller fråga | Hur det löstes | Mitt beslut |
| --- | --- | --- | --- |

## Min granskning (fylls i efter körningen)

| Del av diffen | Accepterade / ändrade / avvisade | Varför |
| --- | --- | --- |
