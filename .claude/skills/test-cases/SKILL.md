---
name: test-cases
description: Use before writing tests for an acceptance criterion in docs/project-brief.md or docs/specs/ (for example AC5.3 or AC-S3). Proposes test cases in a table for the owners to choose from; writes no test code and changes no files.
---

# test-cases

Turn one acceptance criterion into a list of proposed test cases that the owners choose from. This skill only proposes: it writes no test code and changes no files. Follow [CLAUDE.md](../../../CLAUDE.md); its rules override this skill.

## Input

One acceptance criterion, named by its id:

- `ACx.y` (for example AC5.3) from `docs/project-brief.md`.
- `AC-Sx` (for example AC-S3) from a spec in `docs/specs/`. If more than one spec uses the id, ask which one.

If no criterion is given, or the id cannot be found, stop and ask.

## Steps

1. **Find the criterion.** Quote it word for word with its file. Before proposing anything, read the spec's Decisions table and open questions, then the rest of the spec (rules, error messages). These often decide the expected result.
2. **Read the test levels** in `docs/verification.md`, and its criterion-to-test mapping to see what is already tested.
3. **Read the code it touches**, if any exists (for example `src/tickets/`, `src/app/(portal)/tickets/`), to pick realistic test levels. Read only; do not run anything.
4. **Propose test cases.** Cover at least one happy path, one error path and the relevant edge cases (empty values, limits, unknown values, missing records, the same value twice). Keep each case to one behaviour.
5. **Mark assumptions and ask questions.** Every guess about behaviour the criterion or spec does not state is marked as an assumption. List the questions the owners must answer before those cases can be built. Do not ask about anything the Decisions table already settles: use the decision and name it in the Expected result or Details.
6. **Let the owners choose.** Number the cases and ask which ones to build. Stop there. Building them is done separately, with the `ticket-change` skill.

## Output

Start with the quoted criterion and its source, then the table:

| # | Behaviour | Type | Test level | Expected result |
|---|---|---|---|---|
| 1 | | | | |

- **Type:** happy path, error path or edge case.
- **Test level:** unit, data, server action, component or end-to-end, as in `docs/verification.md`. Async Server Components and full flows go to end-to-end.
- **Expected result:** concrete and checkable, using the exact values and messages from the spec where they exist.
- Mark a row that rests on an assumption with **(assumption)** in the Behaviour column.
- Keep every cell to about 60 characters. Longer details go in Details.

After the table:

- **Details:** numbered by row number, for rows that need more than the table holds: exact messages, setup, why, and the spec decision the row relies on.
- **Already covered:** existing tests from `docs/verification.md` that already check part of the criterion, if any.
- **Assumptions:** numbered, each tied to the rows it affects.
- **Questions:** numbered, for the owners to answer.
- **Your choice:** ask which rows to build (for example "1, 3, 4"), and whether any should change.

## Rules

- Write no test code and change no files, not even `docs/verification.md`. Show snippets only if the owners ask.
- Do not run tests or commands; reading and searching files is enough.
- Do not invent behaviour. If the criterion or spec does not say, mark it as an assumption or ask.
- Use only the test levels in `docs/verification.md`. If a case needs a level that is not there, say so instead of adding one.
- Keep the list short and relevant: usually 3–8 cases. Leave out cases that only test the framework or a library.
- Do not build anything until the owners have picked the cases, and then only through `ticket-change`.
