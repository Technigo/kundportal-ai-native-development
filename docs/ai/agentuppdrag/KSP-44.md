# Agentuppdrag: mutationsprövning av Nicklas tester (KSP-44)

> **Godkänt av Nicklas 2026-11-02, före körningen.** Utkastet skrevs av AI på min begäran.
> Valet av mutationer och gränserna är mina. Agenten körs i en egen session med det här
> uppdraget som enda instruktion. Avsnittet "Min granskning" fylls i efter körningen.

---

## Id i det här uppdraget

| Id | Vad det gäller |
| --- | --- |
| KSP-44 | Det här uppdraget: mutationsprövning av Nicklas tester, egna och korsvis |
| KSP-43 | Azaleas mutationsprövning, steg 1 klart i PR #67 |
| CORE-02 | Ärendet finns kvar efter omstart |
| CORE-11 | Tom rubrik eller beskrivning, även bara mellanslag eller nollbreddstecken, ger 422 |
| CORE-12 | Rubriken får vara högst 100 tecken |
| CORE-16 | Alla fel på svenska som `{"detail": ...}` |
| CORE-17 | Fel datatyp eller trasig JSON ger "Ogiltig indata." |
| CORE-18 | Flera fel samtidigt ger alla meddelanden i fältordningen |
| HIST-07 | Samma status som nu ger 409 och ingen ny historikpost |

## 1. Mål

Visa att mina tester faller **av rätt anledning** när ett fel läggs in med flit i den riktiga
koden, en mutation i taget. Resultatet blir rader i `docs/verifiering.md` avsnitt 5. Det är
steg 1 i teststrategin, avsnitt 3 (egna tester), och steg 2 (korsvis) på Azaleas tester.

## 2. Läs först

1. `AGENTS.md`.
2. `docs/teststrategi.md` avsnitt 3 (mutationsprövning, korsvis).
3. `docs/specs/SPEC-karna.md` avsnitt 6 (mutationer för kärnan).
4. `docs/verifiering.md` avsnitt 5 (formatet för resultatet, och Azaleas rader som exempel).

## 3. Steg 1: mina egna tester

Mina testfiler: `backend/tests/test_core_rules.py`, `backend/tests/test_core_read.py` och
`backend/tests/test_status_rules.py`.

| Nr | Mutation (en i taget) | Var i koden | Ska fångas av |
| --- | --- | --- | --- |
| N1 | 409-kontrollen för samma status tas bort | `SameStatus` i `TicketService.change_status` | HIST-07 |
| N2 | Trimningen tas bort | `trim_ends` i `backend/app/schemas/tickets.py` | CORE-11 |
| N3 | Trimningen tar inte bort nollbreddstecken | `.strip(ZERO_WIDTH_CHARS)` i samma fil | CORE-11 |
| N4 | Gränsen för rubriken blir 99 i stället för 100 (`<= 100` blir `< 100`) | `max_length=100` för `title` | CORE-12 |
| N5 | Den svenska felhanteraren för valideringsfel tas bort | `add_exception_handler(RequestValidationError, …)` i `backend/app/errors.py` | CORE-16, CORE-17 |
| N6 | Valideringen visar bara det första felet | `validation_error_handler` i `backend/app/errors.py` | CORE-18 |
| N7 | Sparningen kopplas bort: `commit` tas bort i `create` | `TicketService.create` | CORE-02 |

## 4. Steg 2: korsvis på Azaleas tester

Azalea sa i PR #67 att hennes steg 1 är klart. Jag väljer en eller två mutationer som hon inte
känner till i förväg (teststrategin avsnitt 3). **De står inte här**, utan skrivs in i
resultatet efter körningen. Azalea visar sedan vilket test som föll och varför.

## 5. Gränser

- **Ändra inga tester.** Är ett test grönt trots mutationen: rapportera det och stanna.
  Det är jag som förbättrar testet, i en egen PR.
- **En mutation i taget**, bara i `backend/app/`. Inga andra filer.
- **Återställ efter varje körning** med `git checkout -- <fil>` och visa att `git status` är ren
  innan nästa mutation.
- **Ingen commit, ingen push.** Agenten skriver bara resultatet i sitt svar till mig.
- Säg aldrig att en mutation är fångad utan att nämna testet och raden som slog till.

## 6. Kontrollpunkter

Före körningarna: kör `pytest -q` och visa nollpunkten (antal passed).

För varje mutation:

1. Visa diffen (`git diff`). Jag skriver min gissning innan testerna körs.
2. Kör mina tre testfiler: `.venv/bin/python -m pytest -q tests/test_core_rules.py tests/test_core_read.py tests/test_status_rules.py`.
3. Rapportera antal failed och passed, vilka test som föll och den första raden i felet.
4. Svara på frågan: föll testet av **rätt anledning**, alltså på den kontroll som hör till kravet?
5. Återställ och visa att `git status` är ren.

Efter alla: kör hela sviten igen och visa att den är tillbaka på nollpunkten.

## 7. Resultat

En rad per mutation i formatet i `docs/verifiering.md` avsnitt 5:
datum, steg, mutation, krav, test som föll, gjord av.

## 8. Min granskning

*Fylls i efter körningen: vilka resultat jag kontrollerade själv, vad som förvånade och vad
som ska ändras i testerna.*
