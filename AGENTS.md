# AGENTS.md: regler för AI-agenter i Kundserviceportalen

Gäller alla AI-verktyg i teamet (Claude Code, Cursor, Codex, Copilot med flera) och oss
själva. Håll filen kort. Detaljer finns i specarna och i `docs/`.

## Projektet

Kundserviceportal för handläggare: skapa, lista och visa ärenden, ändra status och se
historiken. Grupparbete i kursen AI Native Development (Grupp 6).

| Del | Teknik | Mapp |
| --- | --- | --- |
| Backend | Python 3.11, FastAPI, SQLAlchemy 2, SQLite, pytest | `backend/` |
| Frontend | React, Vite, TypeScript, Tailwind CSS v4, shadcn/ui, pnpm | `frontend/` |
| Specar | Kärnan (CORE-id) och statuslogik och historik (HIST-id) | `docs/specs/` |
| Ansvar | Vem äger och granskar vad | `docs/ansvar-och-granskning.md` |
| Veckostatus | En fil per vecka | `docs/status/` |
| Gemensamma regler | API-konventioner, arkitektur, teststrategi | `docs/api-konventioner.md`, `docs/arkitektur.md`, `docs/teststrategi.md` |
| AI-instruktioner | Teamets instruktion för testförslag (v1) och var och ens namngivna förbättring | `docs/ai/` |
| Skills | Testförslag, API-typer från OpenAPI, BOLDkit som designsystem. `grill-me` startas med `/grill-me` | `.claude/skills/` |

## Kommandon

```powershell
cd backend
.\.venv\Scripts\python -m pytest -q
.\.venv\Scripts\python -m uvicorn app.main:app --reload --reload-dir app --port 8010
```

```bash
cd backend
.venv/bin/python -m pytest -q                      # macOS/Linux
.venv/bin/python -m uvicorn app.main:app --reload --reload-dir app --port 8010
```

Frontend: se `frontend/README.md` (pnpm). Backend körs på **port 8010**, inte 8000.

## Alltid

- **Läs rätt spec först.** Varje ändring utgår från ett krav-id (`CORE-xx` eller `HIST-xx`).
- **Testförslag från AI** tas fram enligt instruktionen i `docs/ai/` (t.ex. *"Föreslå tester för CORE-07 enligt docs/ai/testforslag-v1.md"*) och granskas innan testkoden skrivs.
- **Krav-id i allt:** i testets namn eller docstring, i commit-meddelandet och i PR:en.
- **Förklara varje id kort**, aldrig ett naket `KSP-xx` (ärende i Linear), `CORE-xx`, `HIST-xx`
  eller `Bx` (beslut i en spec). Skriv några ord om vad det gäller, t.ex. "CORE-10 (okänt
  ärende ger 404)". Gäller svar från AI, commits, PR:er, Slack, dokument och kod. I koden
  på engelska: `# CORE-10: unknown ticket or non-integer id gives 404`.
- **Testerna först:** skriv eller ändra testet, se det falla av rätt anledning, bygg sedan.
- **Kör testerna före varje commit.** CI kör dem igen på varje PR.
- **Misstagslogg:** gör agenten ett misstag (t.ex. ett felaktigt antagande, ett test som inte
  körts eller en ändring i fel fil) föreslår den misstaget och en regel som förhindrar att det
  händer igen. Raden skrivs in i `docs/ai/misstag-<namn>.md` först när en människa har
  godkänt regeln. Loggen läses innan arbetet börjar.
- **Felformat:** alla fel är `{"detail": "<begripligt svenskt meddelande>"}`, aldrig
  stacktrace, SQL eller engelska fältnamn. Fel datatyp eller trasig JSON ger
  "Ogiltig indata." (CORE-17, B9). Id som inte är heltal ger 404 "Ärendet finns inte." (B8).
- **Status ändras bara** via `PATCH /tickets/{id}/status` och `TicketService`, i samma
  transaktion som historikposten.
- **Statusar är koder** i API, databas och tester: `new`, `in_progress`,
  `waiting_on_customer`, `closed`. Bara UI visar svenska etiketter (Nytt, Pågående,
  Väntar på kund, Avslutat). Se antagande 2 i `docs/specs/SPEC-arendehistorik.md`.
- **Arbeta i en egen branch** och öppna en intern PR mot forkens `main`. Någon annan granskar
  innan merge. Alla konversationer i PR:en ska vara lösta.
- **Branchnamn** följer conventional commits (commitlint): `typ/ksp-id-kort-slug`.
  Typen är en commitlint-typ (`feat`, `fix`, `docs`, `test`, `chore`, `refactor`, `ci`),
  som i `feat/ksp-24-statusbyte` och `fix/hist-06-saknad-status`. Använd inte Linears
  `gitBranchName` och inte ett användarnamn som prefix (`adambenals/ksp-28-…`).
- **PR-referenser** skrivs med hel länk och beskrivning, t.ex.
  `PR #3 (backendskelett): https://github.com/desiboli/kundportal-ai-native-development/pull/3`.
- **Engelska i koden:** namn och kommentarer på engelska, svenska bara i texter som
  användaren ser och i felmeddelanden (`docs/api-konventioner.md`, avsnitt 4).
- **Påhittade uppgifter**, aldrig riktiga kunduppgifter.
- **Repot är huvudversion.** Gemensamma dokument ändras bara i repot, via PR. Linear används
  för planering (ärenden, milstolpar) och länkar hit.

## Fråga först

- Ändra tabellen `tickets` (kärnan och historiken bygger på den).
- Lägga till ett beroende (paket i `requirements.txt` eller `package.json`).
- Ändra API-kontraktet eller felmeddelanden som frontend redan använder.
- Ändra i någon annans spec eller del. Varje del har en ägare, se ansvarsdokumentet.

## Aldrig

- Committa hemligheter eller riktiga personuppgifter.
- Ta bort eller försvaga ett test som faller utan att teamet godkänt det.
- Ändra eller radera historikposter från applikationskod.
- Pusha direkt till `main` eller merga den löpande PR:en till kursens repository.
