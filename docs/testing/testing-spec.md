# Testing specification – Kundserviceportalen NORS

```text
┌───────────────┬──────────────────────────────────────────────────────┐
│ Field         │ Value                                                │
├───────────────┼──────────────────────────────────────────────────────┤
│ Part          │ Quality assurance: automated, API and manual testing │
├───────────────┼──────────────────────────────────────────────────────┤
│ Owner         │ Sravani Padarthi                                     │
├───────────────┼──────────────────────────────────────────────────────┤
│ State checked │ 2026-11-10                                           │
└───────────────┴──────────────────────────────────────────────────────┘
```

**Related:** [verification plan](../verifieringsplan.md), [requirements](../specs/kravspec.md),
[search and filter](../specs/sok-filter.md), [Postman guide](../api/README.md),
[test evidence](README.md)

> Part A describes work that exists, with results from the dates given. Part B is partly done.
> Part C is out of scope.
>
> The ids refer to [kravspec.md](../specs/kravspec.md) (R1–R12, A1–A12, K1) and
> [sok-filter.md](../specs/sok-filter.md) (SF-R1–SF-R10, SF-A1–SF-A14). Which test covers which
> criterion is recorded only in the [verification plan](../verifieringsplan.md#spårbarhet).

## Summary

```text
┌──────┬──────┬───────────────────────────┬────────────────┬────────────────────────────────────┐
│ Part │ Task │ Test activity             │ Status         │ Result                             │
├──────┼──────┼───────────────────────────┼────────────────┼────────────────────────────────────┤
│ A    │ QA-1 │ Frontend tests (Vitest,   │ Done           │ 68 of 68 pass on 2026-11-09        │
│      │      │ Testing Library, MSW)     │                │                                    │
├──────┼──────┼───────────────────────────┼────────────────┼────────────────────────────────────┤
│ A    │ QA-2 │ API tests on existing     │ Done           │ 20 of 20 assertions pass on        │
│      │      │ endpoints (Postman,       │                │ 2026-11-05; not rerun since        │
│      │      │ Newman)                   │                │                                    │
├──────┼──────┼───────────────────────────┼────────────────┼────────────────────────────────────┤
│ A    │ QA-3 │ Quality gate (npm run     │ Done           │ Every step passes locally on       │
│      │      │ check, CI)                │                │ 2026-11-09; CI results not checked │
├──────┼──────┼───────────────────────────┼────────────────┼────────────────────────────────────┤
│ A    │ QA-7 │ AI-assisted test design   │ Done           │ Routine in docs/ai-arbetssatt.md,  │
│      │      │ with human review         │                │ followed in the agent assignments  │
├──────┼──────┼───────────────────────────┼────────────────┼────────────────────────────────────┤
│ A    │ QA-5 │ Manual testing            │ Done           │ K1 passed on 2026-11-06; full      │
│      │      │                           │                │ chain against the real backend     │
│      │      │                           │                │ passed on 2026-11-10               │
├──────┼──────┼───────────────────────────┼────────────────┼────────────────────────────────────┤
│ B    │ QA-4 │ Negative and boundary API │ Partly done    │ 4 candidate defects from           │
│      │      │ tests                     │                │ 2026-11-05 need a rerun; no saved  │
│      │      │                           │                │ tests                              │
├──────┼──────┼───────────────────────────┼────────────────┼────────────────────────────────────┤
│ C    │ QA-6 │ Browser end-to-end tests  │ Out of scope   │ Team decision in the verification  │
│      │      │                           │                │ plan                               │
└──────┴──────┴───────────────────────────┴────────────────┴────────────────────────────────────┘
```

---

# Part A: Implemented

## QA-1: Automated frontend tests

### Task

Keep an automated test suite for the UI, API client and filter logic, running against a mocked API.
Name tests after the criterion they prove, for example `A9: …` or `SF-A1: …`.

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

Scenario: Every check can fail
  Given a test is named after an A# or SF-A#
  When the code is temporarily changed to do the wrong thing
  Then every check in the test fails at least once
  And the proof is recorded (step 4 in the verification plan)
```

### Expected outcome

A fast suite that shows which criteria are covered (see
[the verification plan](../verifieringsplan.md#spårbarhet)).

```text
┌────────────┬───────┬──────────┬───────────────────┬────────────────────────────────┐
│ Test files │ Tests │ Result   │ Environment       │ Setup                          │
├────────────┼───────┼──────────┼───────────────────┼────────────────────────────────┤
│ 7          │ 68    │ All pass │ jsdom, mocked API │ frontend/src/test/setup.ts,    │
│            │       │          │                   │ frontend/src/mocks/handlers.ts │
└────────────┴───────┴──────────┴───────────────────┴────────────────────────────────┘
```

Evidence: [2026-11-09 run after merging main](evidence/2026-11-09-baseline-after-merge-npm-run-check.txt).
Before the merge, 54 of 54 passed in 5 files ([2026-11-09 run](evidence/2026-11-09-baseline-npm-run-check.txt)).

**Limit:** these tests run in jsdom against mocks. They do not prove the app works in a real browser
or against the real backend. `POST /arenden/{id}/status` was added to the backend on 2026-11-09
(step 4 of the [backend agent assignment](../agentuppdrag/2026-11-02-backend-status-och-varden.md)),
and the whole team checked it, with the rest of the chain, against the real backend on 2026-11-10
(QA-5). A component
that catches errors could also hide a rejected request, so a test still has to check the result on
screen.

**Fixed weaknesses:** the
[skill checklist assignment](../agentuppdrag/2026-11-05-skill-checklista.md) found checks in A2–A4
in `components/ArendeForm.test.tsx` that could not fail. A2 and A3 were fixed on 2026-11-09: they now check the starting state and that the form sends no
request, and every check has been seen to fail ([A2 proof](evidence/2026-11-09-A2-can-fail.txt),
[A3 proof](evidence/2026-11-09-A3-can-fail.txt),
[agent assignment](../agentuppdrag/2026-11-09-a2-a4-form-tests.md)). A4 was fixed on 2026-11-10
after Q8 in [kravspec.md](../specs/kravspec.md): the form cannot send a category that is not
allowed, so the form test shows only that the backend's rejection is displayed, and the backend's
API test shows that nothing is saved ([A4 proof](evidence/2026-11-10-A4-can-fail.txt)).

---

## QA-2: API testing of existing endpoints

### Task

Test the existing backend endpoints with the Postman collection in `docs/api/`: status codes,
response bodies, validation and error handling.

### Purpose

The team's pytest tests in `backend/tests/` check the backend from inside the repository. The
Postman collection checks the same running backend from outside, the way a client calls it, and can
be run by anyone with Postman or Newman.

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
│ Collection folder │ Requests │ Assertions │ Result on 2026-11-05                       │
├───────────────────┼──────────┼────────────┼────────────────────────────────────────────┤
│ Health, Ärenden   │ 9        │ 20         │ All pass against a freshly started backend │
├───────────────────┼──────────┼────────────┼────────────────────────────────────────────┤
│ Proposed          │ Not run  │ Not run    │ Expected to fail until the endpoints exist │
└───────────────────┴──────────┴────────────┴────────────────────────────────────────────┘
```

`POST /arenden/{id}/status`, needed for A8 and A9, gave 404 on 2026-11-05. It was added to the
backend on 2026-11-09 (step 4 of the
[backend agent assignment](../agentuppdrag/2026-11-02-backend-status-och-varden.md)). The Postman
requests for A8 and A9 have not been run against it yet.

Editing and deleting a case are out of scope in [kravspec.md](../specs/kravspec.md), so `PUT` and
`DELETE` are not missing endpoints. The collection's Proposed folder still has requests for them and
for a status filter in the backend; see open item 2.

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

```text
┌──────────────┬──────────────────────────────────────────────────────┐
│ Step         │ Result on 2026-11-09, after merging main (c8077a4)   │
├──────────────┼──────────────────────────────────────────────────────┤
│ Format check │ Pass                                                 │
├──────────────┼──────────────────────────────────────────────────────┤
│ Lint         │ Pass                                                 │
├──────────────┼──────────────────────────────────────────────────────┤
│ Type check   │ Pass                                                 │
├──────────────┼──────────────────────────────────────────────────────┤
│ Tests        │ Pass: 68 of 68                                       │
├──────────────┼──────────────────────────────────────────────────────┤
│ Build        │ Pass                                                 │
├──────────────┼──────────────────────────────────────────────────────┤
│ CI workflow  │ Runs npm run check on Node 22; results not checked   │
│              │ by QA                                                │
└──────────────┴──────────────────────────────────────────────────────┘
```

Evidence: [2026-11-09 run after merging main](evidence/2026-11-09-baseline-after-merge-npm-run-check.txt),
the [2026-11-09 run before the merge](evidence/2026-11-09-baseline-npm-run-check.txt), and the
[2026-11-08 baseline](evidence/2026-11-08-baseline-npm-run-check.txt) taken before any
QA changes.

The earlier gap, where the format check failed on Windows because of CRLF line endings, is fixed:
`.gitattributes` checks out text files with `eol=lf`.

**Setup:** `frontend/package.json`, `.github/workflows/frontend.yml`, `.gitattributes`

---

## QA-7: AI-assisted test design with human review

### Task

Use AI to propose test scenarios, test code and defect analysis, with a person checking each result
against the requirement and the running code. The routine is in
[ai-arbetssatt.md](../ai-arbetssatt.md).

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

A reviewer can tell what was generated and how it was checked.

```text
┌──────────────────────────────────────────┬──────────────────────────────────────────────────┐
│ Item                                     │ State                                            │
├──────────────────────────────────────────┼──────────────────────────────────────────────────┤
│ CLAUDE.md, verifiera-mot-spec skill,     │ In place: shared context and the six             │
│ frontend-developer agent                 │ verification steps                               │
├──────────────────────────────────────────┼──────────────────────────────────────────────────┤
│ "Arbetsflöde" in docs/ai-arbetssatt.md   │ Filled in                                        │
├──────────────────────────────────────────┼──────────────────────────────────────────────────┤
│ "Granskning av AI-förslag" in            │ Filled in                                        │
│ docs/ai-arbetssatt.md                    │                                                  │
├──────────────────────────────────────────┼──────────────────────────────────────────────────┤
│ Record that the routine was followed     │ agentuppdrag/2026-11-04-a9-test.md,              │
│                                          │ agentuppdrag/2026-11-05-skill-checklista.md      │
└──────────────────────────────────────────┴──────────────────────────────────────────────────┘
```

---

## QA-5: Manual testing

### Task

Run the manual checks in
[the verification plan](../verifieringsplan.md#manuella-kontroller) and record each run there.
Attachments such as screenshots go in [docs/testing/manual/](manual/README.md).

### Purpose

Manual testing covers what the automated tests do not: that the frontend and backend work together,
that messages make sense to a person (R12), and keyboard use (K1).

### Acceptance criteria

```gherkin
Scenario: Each result is recorded
  Given a manual check is finished
  When the tester records it
  Then the verification plan shows who ran it, when, on which commit, and the result

Scenario: Deviations get an owner
  Given a manual check does not give the expected result
  When it is recorded
  Then a defect is described in docs/testing/defects/ with an owner
```

The steps themselves are only in the verification plan.

### Expected outcome

```text
┌──────────────────────────────────┬────────────────┬────────────────────────────────┐
│ Check in the verification plan   │ Environment    │ State                          │
├──────────────────────────────────┼────────────────┼────────────────────────────────┤
│ K1 – bara tangentbord            │ Mock mode      │ Passed on 2026-11-06 (Ruben,   │
│                                  │                │ Nathalie)                      │
├──────────────────────────────────┼────────────────┼────────────────────────────────┤
│ Hela kedjan mot riktig backend   │ Real backend   │ Passed on 2026-11-10 (whole    │
│                                  │                │ team)                          │
└──────────────────────────────────┴────────────────┴────────────────────────────────┘
```

---

# Part B: Partly done

## QA-4: Negative and boundary API tests

### Task

Add saved Postman tests for the input cases below, and report each confirmed defect to its owner in
[docs/testing/defects/](defects/README.md).

### Purpose

The existing requests cover missing fields, but not every invalid value. The frontend's validation
can be bypassed by calling the API directly, so the backend needs its own checks.

### Acceptance criteria

```gherkin
Scenario: Empty category and priority
  Given kategori is "" or prioritet contains only spaces
  When POST /arenden is called
  Then the response is 422

Scenario: A4 Category that is not allowed
  Given kategori is not one of Fakturering, Teknik, Leverans or Övrigt
  When POST /arenden is called
  Then the response is 422
  And no case is saved

Scenario: A11 Priority that is not allowed
  Given prioritet is not one of Låg, Medel or Hög
  When POST /arenden is called
  Then the response is 422
  And no case is saved

Scenario: A long title is accepted
  Given rubrik is 5,000 characters (Q3: no maximum length)
  When POST /arenden is called
  Then the response is 201

Scenario: Invalid id format
  Given the id is not a number
  When GET /arenden/abc is called
  Then the response is 422
```

The A11 API test in pytest belongs to Otto (see the verification plan). The Postman request checks
the same rule from outside and should be agreed with Otto first so the work is not done twice.

### Expected outcome

These checks are saved in the collection, and each gap is either fixed or accepted by the team.

Results of one-off calls on 2026-11-05, not yet saved as tests:

```text
┌──────────────────────────┬──────────────────┬────────────────────────┬──────────────────────────┐
│ Input                    │ Expected         │ Actual on 2026-11-05   │ Result                   │
├──────────────────────────┼──────────────────┼────────────────────────┼──────────────────────────┤
│ kategori: "", prioritet: │ 422 (R2, R4)     │ 201, saved             │ Candidate defect: rerun  │
│ "   "                    │                  │                        │                          │
├──────────────────────────┼──────────────────┼────────────────────────┼──────────────────────────┤
│ kategori and prioritet   │ 422 (A4, A11)    │ 201, saved             │ Candidate defect: rerun  │
│ not allowed              │                  │                        │                          │
├──────────────────────────┼──────────────────┼────────────────────────┼──────────────────────────┤
│ rubrik of 5,000          │ 201 (Q3: no      │ 201, saved             │ Pass                     │
│ characters               │ maximum length)  │                        │                          │
├──────────────────────────┼──────────────────┼────────────────────────┼──────────────────────────┤
│ GET /arenden/abc         │ 422              │ 422                    │ Pass                     │
└──────────────────────────┴──────────────────┴────────────────────────┴──────────────────────────┘
```

Since these calls, `backend/app/schemas/arende.py` has gained validators for kategori and prioritet,
so the two candidate defects must be rerun before they are reported. The MSW mock rejects any value
outside the allowed lists (`frontend/src/mocks/handlers.ts`).

A status filter in the backend (`?status=Fel`) is not tested: search and filtering run in the
frontend (SF-Q6 in [sok-filter.md](../specs/sok-filter.md)), so the backend is right to ignore the
parameter.

---

# Part C: Out of scope

## QA-6: Browser end-to-end tests

Not planned. The team decided not to test through the whole UI, because the course does not require
it and it takes long to build (see
[the verification plan](../verifieringsplan.md#testnivå-och-motivering)). The gap between tests
on mocks and the real backend is covered by the manual check
[Hela kedjan mot riktig backend](../verifieringsplan.md#hela-kedjan-mot-riktig-backend) in QA-5.

This changes only if the team decides otherwise.

---

## Traceability

Which test covers which A#, K# and SF-A# is recorded only in
[the verification plan](../verifieringsplan.md#spårbarhet). This file adds the Postman results,
which the plan does not have.

### Postman per criterion

```text
┌───────────┬──────────────────────────────────────────────────────┬────────────────────────┐
│ Criterion │ Postman request                                      │ Result on 2026-11-05   │
├───────────┼──────────────────────────────────────────────────────┼────────────────────────┤
│ A1        │ A1 Create valid case                                 │ Pass                   │
├───────────┼──────────────────────────────────────────────────────┼────────────────────────┤
│ A2        │ A2 Create without rubrik → 422                       │ Pass                   │
├───────────┼──────────────────────────────────────────────────────┼────────────────────────┤
│ A3        │ A3 Create with spaces-only rubrik → 422              │ Pass                   │
├───────────┼──────────────────────────────────────────────────────┼────────────────────────┤
│ A4        │ None                                                 │ Gap: see QA-4          │
├───────────┼──────────────────────────────────────────────────────┼────────────────────────┤
│ A6        │ A6 List cases                                        │ Pass                   │
├───────────┼──────────────────────────────────────────────────────┼────────────────────────┤
│ A7        │ A7 Get case by id                                    │ Pass                   │
├───────────┼──────────────────────────────────────────────────────┼────────────────────────┤
│ A8        │ A8 Change status (Proposed folder)                   │ Not run (endpoint new) │
├───────────┼──────────────────────────────────────────────────────┼────────────────────────┤
│ A9        │ A9 Change to invalid status → 422 (Proposed folder)  │ Not run (endpoint new) │
├───────────┼──────────────────────────────────────────────────────┼────────────────────────┤
│ A10       │ A10 Get missing case → 404                           │ Pass                   │
├───────────┼──────────────────────────────────────────────────────┼────────────────────────┤
│ A11       │ None                                                 │ Gap: see QA-4          │
├───────────┼──────────────────────────────────────────────────────┼────────────────────────┤
│ R2        │ R2 Create with spaces-only beskrivning → 422, R2     │ Pass                   │
│           │ Create without kategori → 422                        │                        │
└───────────┴──────────────────────────────────────────────────────┴────────────────────────┘
```

A5, A12, K1 and the SF-A# criteria are not covered by Postman: storage is tested with pytest, and
sorting, search and filtering run in the frontend.

### Behaviour without a requirement id

Frontend tests that are not named after an A# or SF-A#:

```text
┌──────────────────────────────────────────┬──────────────────────────────────────────────┐
│ Behaviour                                │ Frontend test                                │
├──────────────────────────────────────────┼──────────────────────────────────────────────┤
│ Network and non-JSON errors              │ api/arendenApi.test.ts                       │
├──────────────────────────────────────────┼──────────────────────────────────────────────┤
│ Empty state, and error with retry        │ App.test.tsx                                 │
├──────────────────────────────────────────┼──────────────────────────────────────────────┤
│ Only status can be changed: no edit      │ App.test.tsx                                 │
│ option                                   │                                              │
├──────────────────────────────────────────┼──────────────────────────────────────────────┤
│ Status response for a case no longer     │ components/ArendeDetail.test.tsx             │
│ shown                                    │                                              │
├──────────────────────────────────────────┼──────────────────────────────────────────────┤
│ Focus moves to the first invalid field   │ components/ArendeForm.test.tsx               │
└──────────────────────────────────────────┴──────────────────────────────────────────────┘
```

## Open items

```text
┌────┬──────────────────────────────────────────┬──────────────┬────────────────────────────┬────────────────┐
│ #  │ Item                                     │ Task         │ Needs                      │ Owner          │
├────┼──────────────────────────────────────────┼──────────────┼────────────────────────────┼────────────────┤
│ 1  │ Rerun the QA-4 candidates and report     │ QA-4         │ Running backend; saved     │ Sravani, Otto  │
│    │ each confirmed one in                    │              │ Postman tests              │                │
│    │ docs/testing/defects/                    │              │                            │                │
├────┼──────────────────────────────────────────┼──────────────┼────────────────────────────┼────────────────┤
│ 2  │ Remove A17, Edit case, Delete case and   │ QA-2, QA-4   │ Nothing                    │ Sravani        │
│    │ Get deleted case from the Postman        │              │                            │                │
│    │ collection, and point docs/api/README.md │              │                            │                │
│    │ at docs/specs/                           │              │                            │                │
├────┼──────────────────────────────────────────┼──────────────┼────────────────────────────┼────────────────┤
│ 6  │ Check the CI result on frontend PRs      │ QA-3         │ Nothing                    │ Sravani        │
└────┴──────────────────────────────────────────┴──────────────┴────────────────────────────┴────────────────┘
```

Closed on 2026-11-09: what A5 and R4 require (now defined in kravspec.md), the CRLF gap in the
quality gate (fixed by `.gitattributes`), the scope of browser end-to-end tests (QA-6, team
decision), and the AI review routine (filled in in ai-arbetssatt.md).

Closed on 2026-11-10: items 3 and 4, the weaknesses in A2–A4 and how A4 is tested in the frontend
(Q8 in kravspec.md, answered by the team; see the
[agent assignment](../agentuppdrag/2026-11-09-a2-a4-form-tests.md)). Item 5, the full chain against
the real backend: the whole team ran all seven steps locally and every step gave the expected
result (see the [verification plan](../verifieringsplan.md#hela-kedjan-mot-riktig-backend)).
