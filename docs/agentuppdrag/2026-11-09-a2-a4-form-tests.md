# Agent assignment: Fix the weaknesses in the A2–A4 form tests

> Written in English. The sections follow [the template](../mallar/agentuppdrag.md) in the same
> order: Before (Mål, Kontext, Avgränsning, Faktiska behörigheter, Kontrollpunkter, Klart när,
> Instruktionen) and After.

- **Owner:** Sravani. Took over the A2–A4 component tests from Ruben, agreed at the team meeting
  on 2026-11-09.
- **Date:** 2026-11-09
- **Agent and tools:** Claude Code, the `frontend-developer` agent with the
  [verifiera-mot-spec](../../.claude/skills/verifiera-mot-spec/SKILL.md) skill
- **PR:** [#15](https://github.com/Ottowski/nors-kundportal-development/pull/15) (A2 and A3),
  [#16](https://github.com/Ottowski/nors-kundportal-development/pull/16) (A4 and the first review
  fixes), [#18](https://github.com/Ottowski/nors-kundportal-development/pull/18) (the remaining
  review findings)

## Before

### Goal

A2, A3 and A4 in `frontend/src/components/ArendeForm.test.tsx` check what
[kravspec.md](../specs/kravspec.md) requires, and every check has been seen to fail (step 4 in the
[verification plan](../verifieringsplan.md)).

The weaknesses come from run 3 in the
[skill checklist assignment](2026-11-05-skill-checklista.md). Line numbers refer to commit `9ea263b`:

- **A2, line 60, and A3, line 78:** `expect(db.arenden).toHaveLength(2)` fails only if both the
  form's own validation and the mock's validation are broken.
- **A2 and A3:** the starting state (two cases) is not checked before the action.
- **A4, line 116:** `expect(db.arenden).toHaveLength(2)` can never fail, because the `server.use`
  handler never writes to `db`.
- **A4:** the action in the spec is never performed. No category that is not allowed is sent; the
  form sends "Leverans".
- **A4:** `server.use` replaces the mock's own category check.
- **A4:** `KATEGORI_ERROR` is a copy of `MESSAGES.kategori` in `src/mocks/handlers.ts`, so the test
  still passes if the mock's text changes.
- **A4, line 114:** checking that the title keeps its value is not required by A4.
- **A4 and R12:** stripping the "Value error, " prefix is tested in `src/api/arendenApi.test.ts`
  (line 55), not here. Note this in the report; don't fix it.

This assignment does not change the status of A2–A4 in the verification plan. They stay Planned
until Otto's API tests exist.

### Context

- [CLAUDE.md](../../CLAUDE.md)
- [kravspec.md](../specs/kravspec.md): A2–A4, R2–R4, R12
- [verifieringsplan.md](../verifieringsplan.md): the six steps under "Kod som byggdes före specen"
- [skill checklist assignment](2026-11-05-skill-checklista.md)
- `frontend/src/mocks/handlers.ts`, `frontend/src/test/setup.ts`, `frontend/src/api/arendenApi.test.ts`
- [Baseline before the change](../testing/evidence/2026-11-09-baseline-npm-run-check.txt): 54 of 54
  pass

### Scope

- **May change:** `frontend/src/components/ArendeForm.test.tsx`, only the A2–A4 tests and the
  shared helpers they use.
- **May change only temporarily, to show a check failing, and must be undone right after:**
  `frontend/src/components/ArendeForm.tsx`, `frontend/src/mocks/handlers.ts`.
- **Must not change:** the specs, the verification plan (Sravani updates it), other tests, other
  source files, `package.json` and dependencies.
- **Not included:** the A4 rewrite before checkpoint 2 is decided, API tests in `backend/`
  (Otto), and the R12 prefix test.

### Actual permissions

The agent has Read, Grep, Glob, Edit, Write and Bash. Bash can technically run git, but the
instruction and CLAUDE.md forbid it; Sravani runs all git commands. CLAUDE.md also forbids opening
`frontend/.env.local` and `backend/.env`. The agent can run `npm run test:run` and `npm run check`
in `frontend/`.

### Checkpoints

1. **After the plan for each test, before any edit.** One test at a time: A2, then A3, then A4.
2. **Before A4 is changed.** A user cannot pick a category that is not allowed in the form, so the
   action in A4 cannot be done through the UI. The team decides between:
   - the frontend A4 test only shows that the backend's rejection is displayed, and "nothing saved"
     is proven by the API test (Otto) and `arendenApi.test.ts`; or
   - a new open question (Q#) in kravspec.md.
3. **After each proof that a check can fail:** show the temporary change, the failing test output,
   and that the change has been undone.

### Done when

- Every check in A2–A4 has been seen to fail with a temporary wrong change. Each proof is saved in
  `docs/testing/evidence/` as `YYYY-MM-DD-A#-can-fail.txt`, following
  [the evidence rules](../testing/README.md#rules).
- All temporary changes are undone. Sravani checks that the diff touches only
  `ArendeForm.test.tsx`.
- `npm run check` passes in `frontend/`, and the test names still start with `A2:`, `A3:` and `A4:`.

### Instruction

> Use the verifiera-mot-spec skill to fix A2, A3 and A4 in
> frontend/src/components/ArendeForm.test.tsx against the weaknesses listed under Goal in
> docs/agentuppdrag/2026-11-09-a2-a4-form-tests.md. Work on one test at a time. Only the test file
> may change permanently; undo every temporary change right after the test has failed. Save each
> proof in docs/testing/evidence/ following docs/testing/README.md. Run no git commands. Stop at
> every checkpoint in the assignment and wait for my answer.

## After

### Plan and our decision

**A2 (approved by Sravani on 2026-11-09, unchanged).** The checklist in the skill found two
weaknesses: the starting state was not checked, and "still two cases" and `onSaved` could fail only
if both the form and the mock were broken. The plan:

- check `db.arenden` has two cases before the action;
- record every `POST /arenden` with a helper on `server.events`, and check that the form sends
  none, so "nothing saved" depends on the form alone; a local `afterEach` removes the listener,
  so `src/test/setup.ts` is untouched;
- keep the message, `aria-invalid`, `onSaved` and two-cases checks;
- prove each check can fail with one temporary change per run, using `expect.soft` temporarily
  when one change makes several checks fail.

Changed after the plan (2026-11-09): the recorder spies on `fetch` instead of listening on
`server.events`, and `vi.restoreAllMocks()` in `afterEach` restores it. The form calls `fetch`
as soon as it submits, so a request is recorded before the click resolves. See the
[no-POST proof](../testing/evidence/2026-11-09-A2-A3-no-post-can-fail.txt) and Verification.

**A3 (approved by Sravani on 2026-11-09, unchanged).** The same two weaknesses as A2, fixed the
same way with the same helper. The proof that the message check can fail removes `.trim()` from
the form's `validate`, which is the rule A3 tests: a title of only spaces counts as empty.

**Checkpoint 2 (decided by the team on 2026-11-10): option b.** Sravani wrote Q8 in
[kravspec.md](../specs/kravspec.md), answered by the team: A4 is tested in the backend, and the
form test shows only that the backend's rejection is displayed and not treated as saved.

**A4 (approved by Sravani on 2026-11-10).** Following Q8:

- check the starting state (two cases) before the action;
- remove `expect(db.arenden).toHaveLength(2)`, which could never fail, and the check that the
  title keeps its value, which A4 does not require;
- rename the test to `A4: the backend's rejection of a category is shown clearly and nothing is
  passed on`, since it no longer claims to show that nothing is saved;
- keep the message, `aria-invalid`, alert and `onSaved` checks, and keep `server.use` and
  `KATEGORI_ERROR` (see Deviations).

### Review

- **Reviewed by:** Ruben, 2026-11-10, in
  [PR #16](https://github.com/Ottowski/nors-kundportal-development/pull/16) (with Claude Code).
  Approved.
- **What we found:**
  - Q8 leaves A4 unchanged and decides only where it is tested, as for A11.
  - The simulated 422 in the A4 test has the same shape as the backend's answer from
    `backend/app/fel.py` (`type`, `loc` and `msg` without the "Value error, " prefix).
  - The five A4 proof runs match the test's line numbers, and every temporary change is in
    `ArendeForm.tsx`. CI (Frontend) passed on `13a9137`.
  - Stale text fixed in the review: two rows in `veckostatus.md` that said A4 was not committed,
    and three comments that said the backend's error handler did not exist yet (`apiError.ts`,
    `arendenApi.test.ts`, `constants/arende.ts`). `npm run check` in `frontend/` passed
    afterwards: 7 test files, 68 tests.
- **Work outside the assignment that was removed:** None.
- **Accepted, changed or rejected, and why:** Accepted, since every A4 check has been seen to
  fail and the backend's API test shows that nothing is saved. A check that the frontend's and
  the backend's category lists match is left out, as outside the scope.

### Verification

| Command | Result | Date |
| ------- | ------ | ---- |
| `npx vitest run src/components/ArendeForm.test.tsx -t "A2"`, once per temporary change | A2: every check failed at least once, 5 runs; every change undone and checked byte for byte; see [A2 proof](../testing/evidence/2026-11-09-A2-can-fail.txt) | 2026-11-09 |
| `npm run check` in `frontend/` after the A2 change | Exit 0: format, lint, typecheck and build pass; 5 test files, 54 tests pass | 2026-11-09 |
| `npx vitest run src/components/ArendeForm.test.tsx -t "A3"`, once per temporary change | A3: every check failed at least once, 4 runs; every change undone and checked byte for byte; see [A3 proof](../testing/evidence/2026-11-09-A3-can-fail.txt) | 2026-11-09 |
| `npm run check` in `frontend/` after the A3 change | Exit 0: format, lint, typecheck and build pass; 5 test files, 54 tests pass | 2026-11-09 |
| `npx vitest run src/components/ArendeForm.test.tsx -t "A2\|A3"` after the recorder was changed to spy on `fetch` (code review findings 1 and 4) | The no-POST check failed in A2 and A3 with a request fired in the background, and nothing else failed; change undone and checked byte for byte; see [no-POST proof](../testing/evidence/2026-11-09-A2-A3-no-post-can-fail.txt) | 2026-11-09 |
| `npm run check` in `frontend/` after the recorder change, before merging `main` | Exit 0: format, lint, typecheck and build pass; 5 test files, 54 tests pass | 2026-11-09 |
| `npm run check` in `frontend/` after merging `main` (`c8077a4`) into the branch | Exit 0: format, lint, typecheck and build pass; 7 test files, 68 tests pass, A2 and A3 included; see [log](../testing/evidence/2026-11-09-baseline-after-merge-npm-run-check.txt) | 2026-11-09 |
| `npx vitest run src/components/ArendeForm.test.tsx -t "A4"`, once per temporary change | A4: every check failed in its own run, 5 runs; every change undone and checked byte for byte; see [A4 proof](../testing/evidence/2026-11-10-A4-can-fail.txt) | 2026-11-10 |
| `npm run check` in `frontend/` after the A4 change | Exit 0: format, lint, typecheck and build pass; 7 test files, 68 tests pass | 2026-11-10 |
| `npx vitest run src/components/ArendeForm.test.tsx -t "A4"`, once per temporary change, after the code review changes to A4 | A4: every check failed in its own run, 5 runs, all temporary changes in `ArendeForm.tsx`; the new sent-category check failed when the form sent an empty `kategori`; every change undone and checked byte for byte; the whole file then passed, 8 tests; replaces the earlier runs in the [A4 proof](../testing/evidence/2026-11-10-A4-can-fail.txt) | 2026-11-10 |
| `npm run check` in `frontend/` after the code review changes (A4 checks and the A2/A3 request recorder) | Exit 0: format, lint, typecheck and build pass; 7 test files, 68 tests pass; see [log](../testing/evidence/2026-11-10-baseline-after-review-npm-run-check.txt) | 2026-11-10 |

### Deviations and open questions

- **How the work was run:** Claude Code ran the
  [verifiera-mot-spec](../../.claude/skills/verifiera-mot-spec/SKILL.md) skill directly in the
  main session, not through the `frontend-developer` agent, so that it could stop at each
  checkpoint and wait for Sravani's answer.
- **A2, line 73:** when the form sends despite errors and the mock rejects, the mock's text
  replaces the form's, so the message check fails before the no-request check. The no-request
  check was seen to fail on its own in run 5. Recorded in the A2 proof.
- **Verification plan:** Sravani changed the A2–A4 component owner from Ruben to Sravani. Status
  stays Planned until Otto's API tests exist.
- **After merging `main` on 2026-11-09:** Otto's API tests for A2–A4 exist, and `main` marks A2–A4
  Genomförd. The merge conflict in the verification plan was resolved by keeping the team's API
  tests, status and results, and adding Sravani as component owner and the 2026-11-09 component
  results for A2 and A3. A4 is Genomförd on `main` although its component test still has the
  weaknesses listed under Goal; the team should confirm this together with checkpoint 2.
- **Checkpoint 2 and the spec:** the scope says the specs must not change, but option b in
  checkpoint 2 adds a Q# to kravspec.md. The team chose option b on 2026-11-10, so Sravani added
  Q8. A4 itself is unchanged.
- **A4, `server.use` and `KATEGORI_ERROR` kept:** under Q8 the form test shows only that the form
  displays whatever the backend answers, so the simulated answer is intended. The decided text and
  the mock's own category check are tested with a real disallowed category in
  `src/api/arendenApi.test.ts` ("rejects a category and a priority that are not allowed").
  The code review on 2026-11-10 flagged the copy again. Accepted for the same reason: A4 would
  prove the same thing with any text, and exporting `MESSAGES` would change `handlers.ts`, which
  is outside the scope.
- **A4 and R12:** stripping the "Value error, " prefix is tested in `src/api/arendenApi.test.ts`
  ("strips Pydantic's prefix"), not in the form test, as planned under Goal.
- **A4 after the code review (2026-11-10), differs from the approved plan:** the starting-state
  check (two cases before the action) was removed. Once `server.use` replaces the handler, `db` is
  never used again, so the check only tested the test's own setup; the old proof could make it
  fail only by editing the test. A check was added instead: the replaced handler records each
  request body, and the test checks that the form sent exactly one request with
  `kategori: "Leverans"`. Before, the simulated 422 answered any POST, so A4 passed even if the
  form sent the wrong category. The A4 proof was redone with all five runs against the changed
  test.
