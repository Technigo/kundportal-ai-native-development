# Testing specification – Kundserviceportalen NORS

> **Historiskt underlag.** Filen beskriver testningen av den ursprungliga frontenden från [PR #3](https://github.com/Ottowski/nors-kundportal-development/pull/3) och av API:t, med resultat från 2026-11-05. Siffrorna gäller inte frontenden i `main`, som är rättad mot specen, se [PR #7](https://github.com/Ottowski/nors-kundportal-development/pull/7). R#/A# här syftar på `kundportal-sdd`, inte på `kravspec.md`. Det som gäller står i [kravspec.md](../specs/kravspec.md) och [verifieringsplan.md](../verifieringsplan.md).

```text
┌───────────────┬──────────────────────────────────────────────────────┐
│ Field         │ Value                                                │
├───────────────┼──────────────────────────────────────────────────────┤
│ Part          │ Quality assurance: automated, API and manual testing │
├───────────────┼──────────────────────────────────────────────────────┤
│ Owner         │ Sravani Padarthi                                     │
├───────────────┼──────────────────────────────────────────────────────┤
│ State checked │ 2026-11-05                                           │
└───────────────┴──────────────────────────────────────────────────────┘
```

**Related:** [Frontend specification](frontend-spec.md), [Postman guide](../api/README.md), [verification plan](../verifieringsplan.md)

> Part A describes work that exists, with results from the date above. Part B is partly done or
> planned.
>
> The R#/A# ids refer to the requirements in `kundportal-sdd/specs/`.

## Summary

```text
┌──────┬──────┬───────────────────────────┬─────────────────────────┬─────────────────────────────┐
│ Part │ Task │ Test activity             │ Status                  │ Result on 2026-11-05        │
├──────┼──────┼───────────────────────────┼─────────────────────────┼─────────────────────────────┤
│ A    │ QA-1 │ Frontend tests (Vitest,   │ Done                    │ 65 of 65 pass               │
│      │      │ Testing Library, MSW)     │                         │                             │
├──────┼──────┼───────────────────────────┼─────────────────────────┼─────────────────────────────┤
│ A    │ QA-2 │ API tests on existing     │ Done                    │ 20 of 20 assertions pass    │
│      │      │ endpoints (Postman,       │                         │                             │
│      │      │ Newman)                   │                         │                             │
├──────┼──────┼───────────────────────────┼─────────────────────────┼─────────────────────────────┤
│ A    │ QA-3 │ Quality gate (npm run     │ Built, with a known gap │ Fails locally at the format │
│      │      │ check, CI)                │                         │ step; other steps pass      │
├──────┼──────┼───────────────────────────┼─────────────────────────┼─────────────────────────────┤
│ B    │ QA-4 │ Negative and boundary API │ Partly done             │ Probed by hand; 4 candidate │
│      │      │ tests                     │                         │ defects, no saved tests     │
├──────┼──────┼───────────────────────────┼─────────────────────────┼─────────────────────────────┤
│ B    │ QA-5 │ Manual testing            │ Partly done             │ Some checks reported in the │
│      │      │                           │                         │ PR; no test record          │
├──────┼──────┼───────────────────────────┼─────────────────────────┼─────────────────────────────┤
│ B    │ QA-6 │ Browser end-to-end tests  │ Not started             │ No browser test tool        │
│      │      │                           │                         │ installed                   │
├──────┼──────┼───────────────────────────┼─────────────────────────┼─────────────────────────────┤
│ B    │ QA-7 │ AI-assisted test design   │ Not documented          │ No record of the routine    │
│      │      │ with human review         │                         │                             │
└──────┴──────┴───────────────────────────┴─────────────────────────┴─────────────────────────────┘
```

---

# Part A: Implemented

## QA-1: Automated frontend tests

### Task

Keep an automated test suite for the UI, API client and filter logic, running against a mocked API.
Name tests after the criterion they prove, for example `A9: …`.

### Purpose

Regressions should be found in seconds without a running backend, and every criterion should point
to the test that proves it.

### Acceptance criteria

```gherkin
Scenario: The whole suite passes
  Given dependencies are installed
  When "npm run test:run" is run in frontend/
  Then all tests pass

Scenario: Tests are independent
  Given a test changed the mock data
  When the next test starts
  Then the data, handlers and environment stubs have been reset

Scenario: Unexpected requests are rejected
  Given a component calls an endpoint with no mock handler
  When the test runs
  Then the request is rejected and reported as an error

Scenario: Both feature flag states are covered
  Given edit and delete can be on or off
  When the suite runs
  Then the on state and the off state are both tested
```

### Expected outcome

A fast suite that shows which criteria are covered (see [Traceability](#traceability)).

```text
┌────────────┬───────┬──────────┬───────────────────┬────────────────────────────────┐
│ Test files │ Tests │ Result   │ Environment       │ Setup                          │
├────────────┼───────┼──────────┼───────────────────┼────────────────────────────────┤
│ 6          │ 65    │ All pass │ jsdom, mocked API │ frontend/src/test/setup.ts,    │
├────────────┼───────┼──────────┼───────────────────┼────────────────────────────────┤
│            │       │          │                   │ frontend/src/mocks/handlers.ts │
└────────────┴───────┴──────────┴───────────────────┴────────────────────────────────┘
```

**Limit:** these tests run in jsdom against mocks. They do not prove the app works in a real browser
or against the real backend, which is why FE-4 passes here but fails against the backend. A component
that catches errors could also hide a rejected request, so a test still has to check the result on
screen.

---

## QA-2: API testing of existing endpoints

### Task

Test the existing backend endpoints with the Postman collection in `docs/api/`: status codes,
response bodies, validation and error handling.

### Purpose

This is the only automated check that runs against the real backend. It proves what the mocks assume.

### Acceptance criteria

```gherkin
Scenario: Health check
  Given the backend is running
  When GET /health is called
  Then the response is 200 with status "ok"

Scenario: A1 Create a valid case
  Given a complete request body
  When POST /arenden is called
  Then the response is 201
  And the status is "Nytt"
  And id and skapad are set

Scenario: A2, A3, R2 Invalid input is rejected
  Given rubrik is missing, or rubrik or beskrivning contains only spaces, or kategori is missing
  When POST /arenden is called
  Then the response is 422
  And the error names the field

Scenario: A6 List cases
  Given the backend is running
  When GET /arenden is called
  Then the response is 200
  And the body is an array containing the required fields

Scenario: A7 Get one case
  Given a case was created
  When GET /arenden/{id} is called
  Then the response is 200 with all fields and the same id

Scenario: A10 Missing case
  Given the id does not exist
  When GET /arenden/{id} is called
  Then the response is 404 with "Ärendet hittades inte"
```

### Expected outcome

A repeatable API check that any team member can run:

```bash
npx newman run docs/api/kundportal.postman_collection.json \
  -e docs/api/kundportal.postman_environment.json \
  --folder Health --folder Ärenden
```

```text
┌───────────────────┬──────────┬────────────┬────────────────────────────────────────────┐
│ Collection folder │ Requests │ Assertions │ Result                                     │
├───────────────────┼──────────┼────────────┼────────────────────────────────────────────┤
│ Health, Ärenden   │ 9        │ 20         │ All pass against a freshly started backend │
├───────────────────┼──────────┼────────────┼────────────────────────────────────────────┤
│ Proposed          │ Not run  │ Not run    │ Expected to fail until the endpoints exist │
└───────────────────┴──────────┴────────────┴────────────────────────────────────────────┘
```

```text
┌───────────────────────────┬────────────────────┐
│ Missing endpoint          │ Direct call result │
├───────────────────────────┼────────────────────┤
│ POST /arenden/{id}/status │ 404                │
├───────────────────────────┼────────────────────┤
│ PUT /arenden/{id}         │ 405                │
├───────────────────────────┼────────────────────┤
│ DELETE /arenden/{id}      │ 405                │
└───────────────────────────┴────────────────────┘
```

---

## QA-3: Quality gate and CI

### Task

Keep one command, `npm run check`, that runs the format check, lint, type check, tests and build.
Run the same command in GitHub Actions.

### Purpose

Every contribution, whether written by a person or by AI, should meet the same bar before review.

### Acceptance criteria

```gherkin
Scenario: Every step runs
  Given dependencies are installed
  When "npm run check" is run in frontend/
  Then the format check, lint, type check, tests and build run in that order

Scenario: The gate blocks a failure
  Given any step fails
  When "npm run check" runs
  Then the command stops with an error

Scenario: CI runs the gate
  Given a pull request changes files in frontend/, or a push to main does
  When the workflow runs
  Then "npm run check" runs on Node 22
```

### Expected outcome

The result is the same locally and in CI.

**Known gap: the gate does not pass locally on this Windows checkout.**

```text
┌──────────────┬──────────────────────────────────────────────────────────────────────────────────┐
│ Step         │ Result on this checkout                                                          │
├──────────────┼──────────────────────────────────────────────────────────────────────────────────┤
│ Format check │ Fails: 38 files use CRLF line endings; no other problems with --end-of-line auto │
├──────────────┼──────────────────────────────────────────────────────────────────────────────────┤
│ Lint         │ Pass when run separately                                                         │
├──────────────┼──────────────────────────────────────────────────────────────────────────────────┤
│ Type check   │ Pass when run separately                                                         │
├──────────────┼──────────────────────────────────────────────────────────────────────────────────┤
│ Tests        │ Pass when run separately                                                         │
├──────────────┼──────────────────────────────────────────────────────────────────────────────────┤
│ Build        │ Pass when run separately                                                         │
├──────────────┼──────────────────────────────────────────────────────────────────────────────────┤
│ CI workflow  │ Not checked                                                                      │
└──────────────┴──────────────────────────────────────────────────────────────────────────────────┘
```

**Suggested fix (team decision):** add a `.gitattributes` with `eol=lf` for the frontend files, or
set `"endOfLine": "auto"` in `.prettierrc.json`.

**Setup:** `frontend/package.json`, `.github/workflows/frontend.yml`

---

# Part B: Partly done or planned

## QA-4: Negative and boundary API tests

### Task

Add saved Postman tests for the input cases below, and report each confirmed defect to its owner.

### Purpose

The existing tests cover missing fields, but not every invalid value. The frontend's validation can
be bypassed by calling the API directly, so the backend needs its own checks.

### Acceptance criteria

```gherkin
Scenario: Empty category and priority
  Given kategori is "" or prioritet contains only spaces
  When POST /arenden is called
  Then the response is 422

Scenario: Unknown category and priority
  Given the team has decided the allowed values (Q1/Q2)
  And kategori or prioritet is not one of them
  When POST /arenden is called
  Then the response is 422

Scenario: A17 Unknown status filter
  Given status=Fel is in the query string
  When GET /arenden is called
  Then the response is 422

Scenario: Very long title
  Given the team has decided a maximum length
  And rubrik is longer than that maximum
  When POST /arenden is called
  Then the response is 422

Scenario: Invalid id format
  Given the id is not a number
  When GET /arenden/abc is called
  Then the response is 422
```

### Expected outcome

These checks are saved in the collection, and each gap is either fixed or accepted by the team.

Results of one-off calls on 2026-11-05, not yet saved as tests:

```text
┌──────────────────────────┬──────────────────┬────────────────────────┬───────────────────────────┐
│ Input                    │ Expected         │ Actual                 │ Result                    │
├──────────────────────────┼──────────────────┼────────────────────────┼───────────────────────────┤
│ kategori: "", prioritet: │ 422              │ 201, saved             │ Candidate defect          │
│ "   "                    │                  │                        │                           │
├──────────────────────────┼──────────────────┼────────────────────────┼───────────────────────────┤
│ Unknown kategori and     │ 422 once decided │ 201, saved             │ Candidate defect: blocked │
│ prioritet                │                  │                        │ by Q1/Q2                  │
├──────────────────────────┼──────────────────┼────────────────────────┼───────────────────────────┤
│ ?status=Fel              │ 422 (A17)        │ 200, parameter ignored │ Candidate defect: depends │
│                          │                  │                        │ on Q9                     │
├──────────────────────────┼──────────────────┼────────────────────────┼───────────────────────────┤
│ rubrik of 5,000          │ 422 once decided │ 201, saved             │ Candidate defect: no      │
│ characters               │                  │                        │ limit agreed              │
├──────────────────────────┼──────────────────┼────────────────────────┼───────────────────────────┤
│ GET /arenden/abc         │ 422              │ 422                    │ Pass                      │
└──────────────────────────┴──────────────────┴────────────────────────┴───────────────────────────┘
```

The MSW mock also accepts empty kategori and prioritet, so the frontend tests cannot catch the first
candidate defect.

---

## QA-5: Manual testing

### Task

Run the user workflows by hand in a browser, against both the real backend and mock mode, and record
the results in `docs/verifieringsplan.md`.

### Purpose

Manual testing covers what the automated tests do not: real browser behaviour, layout, and whether
the workflow makes sense to a person.

### Acceptance criteria

```gherkin
Scenario: Create and open a case against the real backend
  Given the backend and "npm run dev" are running
  When the tester creates a case and opens it
  Then the case appears first in the list with status "Nytt"
  And all fields are correct in the side panel

Scenario: Validation messages
  Given the form is open
  When the tester submits it empty
  Then every field shows a Swedish message

Scenario: Search and filter
  Given several cases exist
  When the tester combines search text with a status filter
  Then only matching cases are shown

Scenario: Backend stops while the app is open
  Given the app is open
  When the backend is stopped and the page is reloaded
  Then an error with "Försök igen" is shown
  And it recovers once the backend is back and the button is clicked

Scenario: Status change against the real backend
  Given a case is open against the real backend
  When the tester selects a new status
  Then the result is recorded as a defect until FE-4 is finished

Scenario: Keyboard use
  Given the list is shown
  When the tester uses only the keyboard
  Then they can open a case and complete the form

Scenario: Each result is recorded
  Given a manual check is finished
  When the tester records it
  Then the plan shows who ran it, when, on which version, and the result
```

### Expected outcome

`docs/verifieringsplan.md` holds a dated record of manual checks, and any defects have an owner.

```text
┌────────────────────────────────────┬──────────────┬────────────────┬──────────────────────┐
│ Check                              │ Environment  │ Source         │ Recorded in the plan │
├────────────────────────────────────┼──────────────┼────────────────┼──────────────────────┤
│ Create and open a case             │ Real backend │ PR description │ No                   │
├────────────────────────────────────┼──────────────┼────────────────┼──────────────────────┤
│ Side panel and delete confirmation │ Mock mode    │ PR description │ No                   │
└────────────────────────────────────┴──────────────┴────────────────┴──────────────────────┘
```

---

## QA-6: Browser end-to-end tests

### Task

Automate the main workflow in a real browser against the real backend, using a tool such as
Playwright.

### Purpose

This closes the gap between tests that use mocks and tests that have no UI. It is the only level that
would catch FE-4 automatically.

### Acceptance criteria

```gherkin
Scenario: Main workflow
  Given a running backend and frontend
  When a test creates a case through the UI
  Then the case is shown in the list
  And its details can be opened

Scenario: Validation in the browser
  Given the form is open
  When a test submits it empty
  Then the messages are shown
  And no request reaches the backend

Scenario: Status change end to end
  Given the status endpoint exists
  When a test changes a case's status
  Then the new status is still shown after a page reload
```

### Expected outcome

A small suite of 3–5 tests of the most important workflows, runnable with one command.

```text
┌───────────────────────┬─────────────────────────────────────────────────────────────┐
│ Item                  │ State                                                       │
├───────────────────────┼─────────────────────────────────────────────────────────────┤
│ Playwright or Cypress │ Not installed                                               │
├───────────────────────┼─────────────────────────────────────────────────────────────┤
│ Existing UI tests     │ Run in jsdom (see QA-1), so they are not browser automation │
└───────────────────────┴─────────────────────────────────────────────────────────────┘
```

---

## QA-7: AI-assisted test design with human review

### Task

Use AI to propose test scenarios, test code and defect analysis, with a person checking each result
against the requirement and the running code. Document the routine in `docs/ai-arbetssatt.md`.

### Purpose

AI can write tests quickly, but it can also write tests that pass without proving the requirement.
The developer stays responsible for what is merged.

### Acceptance criteria

```gherkin
Scenario: Every generated test traces to a requirement
  Given AI has proposed a test
  When a person reviews it
  Then it is linked to an R#, A# or a stated reason
  Or it is rejected

Scenario: A generated test can really fail
  Given a generated test passes
  When the reviewer breaks the behaviour it checks
  Then the test fails

Scenario: AI claims are verified
  Given AI reports a defect or a passing result
  When a person reviews the claim
  Then it has been reproduced by running the code or the test

Scenario: Mocks are compared with the backend
  Given a mock was written or changed with AI help
  When it is reviewed
  Then its status codes and error format are compared with the real backend

Scenario: Secrets stay out of AI context
  Given AI is working in the repository
  When it reads project files
  Then the protected files listed in CLAUDE.md are not opened
```

### Expected outcome

`docs/ai-arbetssatt.md` describes the routine, and a reviewer can tell what was generated and how it
was checked.

```text
┌──────────────────────────────────────────────┬─────────────────────────────────────────┐
│ Item                                         │ State                                   │
├──────────────────────────────────────────────┼─────────────────────────────────────────┤
│ CLAUDE.md, frontend-feature skill,           │ In place: shared context and test-first │
│ frontend-developer agent                     │ instructions                            │
├──────────────────────────────────────────────┼─────────────────────────────────────────┤
│ "Arbetsflöde" in docs/ai-arbetssatt.md       │ Unfilled template                       │
├──────────────────────────────────────────────┼─────────────────────────────────────────┤
│ "Granskning av AI-förslag" in                │ Unfilled template                       │
│ docs/ai-arbetssatt.md                        │                                         │
├──────────────────────────────────────────────┼─────────────────────────────────────────┤
│ Record that this review routine was followed │ None                                    │
└──────────────────────────────────────────────┴─────────────────────────────────────────┘
```

---

## Traceability

Test files are in `frontend/src/`. "Postman" means the result against the real backend on 2026-11-05.

### Acceptance criteria

```text
┌───────────┬────────────────────────┬───────────────────────────────────┬─────────────────────────┐
│ Criterion │ Behaviour              │ Frontend test                     │ Postman                 │
├───────────┼────────────────────────┼───────────────────────────────────┼─────────────────────────┤
│ A1        │ Create a valid case    │ components/ArendeForm.test.tsx,   │ Pass                    │
│           │                        │ App.test.tsx                      │                         │
├───────────┼────────────────────────┼───────────────────────────────────┼─────────────────────────┤
│ A2        │ Missing title          │ components/ArendeForm.test.tsx    │ Pass                    │
├───────────┼────────────────────────┼───────────────────────────────────┼─────────────────────────┤
│ A3        │ Title with only spaces │ components/ArendeForm.test.tsx    │ Pass                    │
├───────────┼────────────────────────┼───────────────────────────────────┼─────────────────────────┤
│ A4        │ Backend field error    │ components/ArendeForm.test.tsx    │ None                    │
│           │ keeps input            │                                   │                         │
├───────────┼────────────────────────┼───────────────────────────────────┼─────────────────────────┤
│ A5        │ Unknown: referenced    │ None                              │ None                    │
│           │ nowhere in this repo   │                                   │                         │
├───────────┼────────────────────────┼───────────────────────────────────┼─────────────────────────┤
│ A6        │ List columns and data  │ App.test.tsx                      │ Pass                    │
├───────────┼────────────────────────┼───────────────────────────────────┼─────────────────────────┤
│ A7        │ Details show all       │ App.test.tsx,                     │ Pass                    │
│           │ fields                 │ components/ArendeDetail.test.tsx  │                         │
├───────────┼────────────────────────┼───────────────────────────────────┼─────────────────────────┤
│ A8        │ Change status          │ App.test.tsx,                     │ Proposed: endpoint      │
│           │                        │ components/ArendeDetail.test.tsx  │ missing                 │
├───────────┼────────────────────────┼───────────────────────────────────┼─────────────────────────┤
│ A9        │ Rejected status        │ components/ArendeDetail.test.tsx, │ Proposed: endpoint      │
│           │                        │ api/arendenApi.test.ts            │ missing                 │
├───────────┼────────────────────────┼───────────────────────────────────┼─────────────────────────┤
│ A10       │ Missing case           │ components/ArendeDetail.test.tsx  │ Pass                    │
├───────────┼────────────────────────┼───────────────────────────────────┼─────────────────────────┤
│ A11–A13   │ Search, case, status   │ utils/filterArenden.test.ts       │ Not applicable: runs in │
│           │ filter                 │                                   │ frontend                │
├───────────┼────────────────────────┼───────────────────────────────────┼─────────────────────────┤
│ A14–A16   │ Combined, no matches,  │ utils/filterArenden.test.ts,      │ Not applicable: runs in │
│           │ spaces only            │ App.test.tsx                      │ frontend                │
├───────────┼────────────────────────┼───────────────────────────────────┼─────────────────────────┤
│ A17       │ Unknown status filter  │ None                              │ Proposed: returns 200   │
└───────────┴────────────────────────┴───────────────────────────────────┴─────────────────────────┘
```

### Requirements

```text
┌─────────────┬────────────────────────────┬──────────────────────────────────┬─────────────────────────────┐
│ Requirement │ Behaviour                  │ Frontend test                    │ Postman                     │
├─────────────┼────────────────────────────┼──────────────────────────────────┼─────────────────────────────┤
│ R1          │ New case gets status       │ api/arendenApi.test.ts,          │ Pass                        │
│             │ "Nytt"                     │ components/ArendeForm.test.tsx   │                             │
├─────────────┼────────────────────────────┼──────────────────────────────────┼─────────────────────────────┤
│ R2          │ All fields are required    │ components/ArendeForm.test.tsx   │ Pass for two cases; see     │
│             │                            │                                  │ QA-4 for the gaps           │
├─────────────┼────────────────────────────┼──────────────────────────────────┼─────────────────────────────┤
│ R3          │ Backend validation errors  │ api/arendenApi.test.ts           │ Pass                        │
│             │ reach the fields           │                                  │                             │
├─────────────┼────────────────────────────┼──────────────────────────────────┼─────────────────────────────┤
│ R4          │ Unknown: grouped with      │ None by name                     │ None by name                │
│             │ create in                  │                                  │                             │
│             │ docs/architecture-flow.md, │                                  │                             │
│             │ named by no test           │                                  │                             │
├─────────────┼────────────────────────────┼──────────────────────────────────┼─────────────────────────────┤
│ R5          │ Data survives a restart    │ None                             │ Not met: storage is in      │
│             │                            │                                  │ memory                      │
│             │                            │                                  │ (docs/architecture-flow.md) │
├─────────────┼────────────────────────────┼──────────────────────────────────┼─────────────────────────────┤
│ R6          │ List, newest first         │ utils/filterArenden.test.ts      │ Not applicable: sorted in   │
│             │                            │                                  │ frontend                    │
├─────────────┼────────────────────────────┼──────────────────────────────────┼─────────────────────────────┤
│ R7          │ Details show all fields    │ components/ArendeDetail.test.tsx │ Pass                        │
│             │ (see A7)                   │                                  │                             │
├─────────────┼────────────────────────────┼──────────────────────────────────┼─────────────────────────────┤
│ R8, R9      │ Change status, reject      │ api/arendenApi.test.ts, on mocks │ Proposed: endpoint missing  │
│             │ invalid status             │ only                             │                             │
├─────────────┼────────────────────────────┼──────────────────────────────────┼─────────────────────────────┤
│ R10         │ Clear message for a        │ api/arendenApi.test.ts,          │ Pass                        │
│             │ missing case               │ components/ArendeDetail.test.tsx │                             │
├─────────────┼────────────────────────────┼──────────────────────────────────┼─────────────────────────────┤
│ R11.8       │ Filtering does not change  │ utils/filterArenden.test.ts      │ Not applicable: runs in     │
│             │ the input                  │                                  │ frontend                    │
└─────────────┴────────────────────────────┴──────────────────────────────────┴─────────────────────────────┘
```

### Behaviour without a requirement id

```text
┌───────────────────────────────┬───────────────────────────────────┬─────────────────────────────┐
│ Behaviour                     │ Frontend test                     │ Postman                     │
├───────────────────────────────┼───────────────────────────────────┼─────────────────────────────┤
│ Edit and delete with the flag │ App.disabledFeatures.test.tsx     │ Not applicable              │
│ off                           │                                   │                             │
├───────────────────────────────┼───────────────────────────────────┼─────────────────────────────┤
│ Edit and delete with the flag │ App.test.tsx,                     │ Proposed: endpoints missing │
│ on                            │ components/ArendeForm.test.tsx,   │                             │
│                               │ components/ArendeDetail.test.tsx, │                             │
│                               │ api/arendenApi.test.ts            │                             │
├───────────────────────────────┼───────────────────────────────────┼─────────────────────────────┤
│ Network and non-JSON errors   │ api/arendenApi.test.ts            │ None                        │
├───────────────────────────────┼───────────────────────────────────┼─────────────────────────────┤
│ Empty state and retry         │ App.test.tsx                      │ None                        │
├───────────────────────────────┼───────────────────────────────────┼─────────────────────────────┤
│ Status response for a case no │ components/ArendeDetail.test.tsx  │ None                        │
│ longer shown                  │                                   │                             │
└───────────────────────────────┴───────────────────────────────────┴─────────────────────────────┘
```

## Open items

```text
┌───┬───────────────────────────────┬──────────────┬─────────────────────────────┬───────────────┐
│ # │ Item                          │ Task         │ Needs                       │ Owner         │
├───┼───────────────────────────────┼──────────────┼─────────────────────────────┼───────────────┤
│ 1 │ Confirm what A5 and R4        │ Traceability │ Compare with                │ Sravani       │
│   │ require, and whether they     │              │ kundportal-sdd/specs/       │               │
│   │ need tests                    │              │                             │               │
├───┼───────────────────────────────┼──────────────┼─────────────────────────────┼───────────────┤
│ 2 │ Report the candidate defects  │ QA-4         │ Saved Postman tests; fix or │ Sravani, Otto │
│   │ to the backend owner          │              │ accept each one             │               │
├───┼───────────────────────────────┼──────────────┼─────────────────────────────┼───────────────┤
│ 3 │ Fix line endings so npm run   │ QA-3         │ Decision on the fix         │ Team          │
│   │ check passes on Windows       │              │                             │               │
├───┼───────────────────────────────┼──────────────┼─────────────────────────────┼───────────────┤
│ 4 │ Fill in                       │ QA-5         │ Dated record of checks      │ Sravani       │
│   │ docs/verifieringsplan.md with │              │                             │               │
│   │ these results                 │              │                             │               │
├───┼───────────────────────────────┼──────────────┼─────────────────────────────┼───────────────┤
│ 5 │ Decide whether browser        │ QA-6         │ Decision                    │ Team          │
│   │ end-to-end tests are in scope │              │                             │               │
├───┼───────────────────────────────┼──────────────┼─────────────────────────────┼───────────────┤
│ 6 │ Document the AI review        │ QA-7         │ Fill in the two template    │ Team          │
│   │ routine in                    │              │ sections                    │               │
│   │ docs/ai-arbetssatt.md         │              │                             │               │
└───┴───────────────────────────────┴──────────────┴─────────────────────────────┴───────────────┘
```
