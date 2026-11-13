# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Kundserviceportalen NORS: a blank team-project starter (course/examination context, Swedish-language UI and docs) with a FastAPI backend and a React + TypeScript + Vite frontend. The two halves are independent apps run in separate terminals; there is no root-level build or workspace setup (the root `package-lock.json` is empty and unused — dependencies live in `frontend/`).

## Rules for Claude

### General

- **Focus on a single task**: Work on one task at a time. Don't touch unrelated issues or features beyond the current request.
- **Clarity and conciseness**: Clear, easy-to-understand code and explanations. Avoid unnecessary jargon.
- **Error reporting**: Describe errors or impossibilities clearly and suggest solutions.
- **Privacy**: Never expose the operator's name, email or other private information without clearing it first, e.g. when interacting with external public services that ask for it.
- **Downloads folder**: Never open, read, list, search or run anything in `~/Downloads` (any letter case) without first asking and getting a yes. That covers Read, Bash (`cat`, `ls`, `grep`, `find`, `open`, …) and subagents. A pasted path or a task that seems to need the file is not permission. Name the exact file and what you will do with it; a yes covers only that file for that task. The user may instead move the file into the repo or paste the relevant part.

### Advice and decisions

Applies when presenting options, recommending a path, or answering a "should we…" question — not when carrying out a task that is already decided.

Challenge before answering. Check each point against code, docs or data rather than memory:

- **Wrong assumptions**: which premise in the question, or in your own first answer, does not hold?
- **What could fail**: edge cases, existing data, course/examination requirements, and the next feature that has to build on this.
- **Hidden upside**: is there a bigger outcome nearby that the question as asked would miss?

If the premises hold, say so in one line. Don't invent objections.

### Restrictions

- Never run any git commands (no status, diff, add, commit, push, pull, branch, etc.). The user handles all git operations; code changes are reviewed and committed by a human.
- Never read, open, grep, or otherwise access these secret files, and don't print their contents:
  - `frontend/.env.local`
  - `backend/.env`

## Commands

Setup, run and test commands live in `README.md` (backend: `uvicorn app.main:app --reload` from `backend/`; frontend: `npm run dev` from `frontend/`, or `npm run dev:mock` to run on MSW mocks without a backend; tests: `python -m pytest` from `backend/` and `npm run test:run` from `frontend/`). Don't restate them here. The README shows PowerShell activation; on macOS/Linux use `source .venv/bin/activate`. API tests run against a real uvicorn server, not TestClient (httpx is not installed). Use `kor_server` and `anrop` from `tests/server.py`; each test gets its own DB in `tmp_path` via `NORS_DB_PATH`, so `app/data/nors.db` is never touched. `npm run check` in `frontend/` runs Prettier, ESLint, TypeScript, the tests and the build; CI (`.github/workflows/frontend.yml`) runs it.

## Architecture

- `backend/app/main.py` — single FastAPI `app` (`app.main:app`) with `/` and `/health`, mounts the routers. CORS is restricted to the Vite dev origins (`http://localhost:5173`, `http://127.0.0.1:5173`); if the frontend runs on another port/host, update `allow_origins` there.
- `frontend/src/` — `main.tsx` mounts `App.tsx` and starts the MSW worker in `--mode mock`. `api/arendenApi.ts` is the only place that calls `fetch`; it turns FastAPI errors (`detail` string or 422 list) into `ApiError` with per-field messages. The base URL is `VITE_API_URL` or `http://127.0.0.1:8000` (no Vite proxy, hence CORS).
- `frontend/src/mocks/handlers.ts` follows the rules, error texts and `POST /arenden/{id}/status` decided for the backend in `docs/agentuppdrag/2026-11-02-backend-status-och-varden.md`; the real backend does not have all of them yet. Tests use it via `msw/node` (`src/test/setup.ts`); `db.reset()` runs after each test.
- Search and filtering run in the frontend on the loaded list (`utils/filterArenden.ts`), per `docs/specs/sok-filter.md`. The category and priority values in `constants/arende.ts` must match `docs/specs/kravspec.md`.
- Dependencies are unpinned in `backend/requirements.txt`; add new ones there or in `frontend/package.json`.

### Adding new backend code

Layers under `backend/app/`, one file per resource (`arende` is the reference example). Never put routes or storage logic in `main.py`.

1. **Schemas** — `schemas/<resurs>.py`: Pydantic models (`<Resurs>Create`, `<Resurs>`) and enums. Validation lives here.
2. **Repository** — `repositories/<resurs>_repository.py`: an abstract `<Resurs>Repository` contract, the in-memory implementation and a `get_<resurs>_repository()` dependency. Swapping storage must not touch routers.
3. **Router** — `routers/<resurs>_router.py`: `APIRouter` with `prefix` and `tags`, repository injected via `Depends`, no storage logic. Mount it with `app.include_router(...)` in `main.py`.
4. **Tests** — `backend/tests/`, named after the acceptance criterion (see Documentation).

**SQLite layer** (decided in `docs/beslut.md`): the connection setup lives in `app/db.py`, the database file in `app/data/nors.db` (or the path in `NORS_DB_PATH`), and each resource gets `repositories/sqlite_<resurs>_repository.py` implementing the same abstract contract as the in-memory one. `main.py` switches to it with `app.dependency_overrides[get_<resurs>_repository]`; schemas and routers stay untouched. Include a test that data survives a restart (`tests/test_omstart.py`).

### Adding new frontend code

Follow the structure in `frontend/src/`: shared types in `types/`, allowed values in `constants/` (matching the spec), all API calls in `api/arendenApi.ts`, components in `components/`, pure functions in `utils/`, and MSW handlers that mirror the backend in `mocks/`. Put each test next to the file it tests (Vitest and Testing Library), named after its A# or SF-A# id. Run `npm run check` before a PR.

## Documentation

`docs/` (Swedish) is the single source of truth; start at `docs/README.md`. Don't restate requirements or decisions here, link to them.

- Requirements: `docs/specs/kravspec.md` (core flow) and one file per add-on (e.g. `docs/specs/sok-filter.md`). IDs: R# requirements, A# acceptance criteria, K# quality requirements, Q# open questions; add-on specs use a prefix (e.g. `SF-R1`). IDs are never renumbered.
- Spec-level decisions live in the spec (the Q# is marked answered); project-level decisions live in `docs/beslut.md`.
- Test names start with the A# id (`test_a2_...`, `it("A2: ...")`); traceability is in `docs/verifieringsplan.md`.
- Bounded agent assignments are documented in `docs/agentuppdrag/` using `docs/mallar/agentuppdrag.md`. Workflow: `docs/specs/spec-driven-dev.md`.

## Workflow notes

- PRs use the template at `.github/PULL_REQUEST_TEMPLATE/teamets-projekt.md` (final-version commit link, team info, links to shared docs). Individual written reports go to Disco as Markdown and must not be added to the repo; a blank template is in `docs/mallar/individuell-redovisning.md`.
- `.venv`, `node_modules` and `.env` are git-ignored; don't commit them.
