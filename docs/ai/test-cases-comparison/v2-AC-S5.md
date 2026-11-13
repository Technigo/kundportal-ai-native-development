Here are the proposed test cases for AC-S5. I've read the spec, `docs/verification.md` and the code.

> **AC-S5 (edge case, same status):** Given a ticket with status `in_progress`, when the handler saves `in_progress`, then no error is shown, the status is unchanged and no history entry is saved.
>
> Source: `docs/specs/status-change.md:48`

AC-S5 is already tested in the repository and in the server action. Nothing yet tests what the handler sees in the browser, and a few nearby edge cases are untested.

| # | Behaviour | Type | Test level | Expected result |
|---|---|---|---|---|
| 1 | Handler clicks Save on `in_progress` without changing it | happy path | end-to-end | No "Invalid status.", badge still In progress, same history rows |
| 2 | Same status for every status, including `open` and `closed` | edge case | data | `unchanged` for each; status kept; history count unchanged |
| 3 | New ticket saved as `open` (never changed) | edge case | server action | Returns `undefined`; history stays empty; no revalidate |
| 4 | Same status sent with other casing: `IN_PROGRESS` | error path | server action | `{ error: "Invalid status." }`; status and history unchanged |
| 5 | Same-status save clears an earlier error **(assumption)** | edge case | component | "Invalid status." gone; `aria-invalid` removed |
| 6 | Saving the same status twice after a real change | edge case | end-to-end | Exactly one history row for the real change |

**Details**

1. Setup: open a ticket in the browser and change it to In progress first, so the test doesn't depend on the seed data having an `in_progress` ticket. Then click Save without touching the dropdown. Count the rows under "Status history" before and after. Check that the list row still shows In progress. This relies on the spec decision "Change to the same status? Silently ignored, no history entry".
2. Loop over `ticketStatuses` so a fourth status would be covered automatically, as the "Waiting for customer" decision describes. The existing test only checks `in_progress`.
3. This is the only case where the history must stay empty (`[]`) rather than keep its length. It catches a bug that writes an `open → open` row.
4. Relies on the decision "Trim or normalise the status value? No, it must match exactly". It checks that "same status" doesn't treat different casing as a match: the value has to fail validation first.
5. Render `StatusForm` with a mock action that returns `{ error: "Invalid status." }` and then `undefined`. Today `useActionState` replaces the state, so the error should go away. The spec only says "no error is shown", which doesn't settle what happens to an error that is already on screen.
6. Can be merged into row 1 to save one e2e run: click Save twice.

**Already covered** (`docs/verification.md`, row AC-S5)
- `ticketRepository.test.ts:178`: "ignores a change to the status the ticket already has" checks for `unchanged`, an unchanged status and a history length of 1.
- `actions.test.ts:228`: "ignores a change to the same status without an error or a revalidation" checks for `undefined`, no revalidation, no redirect and a history length of 1.

**Assumptions**
1. Row 5: an earlier "Invalid status." message should disappear when a same-status save succeeds.
2. Rows 1 and 6: the e2e tests can change one ticket's status first without breaking other tests that share the seeded `data/e2e.db`.

**Questions**
1. If a "Invalid status." message is still showing, should a same-status Save clear it (row 5)?
2. Do you want an e2e test for AC-S5 at all? The behaviour is already checked at two levels, and an e2e test adds one more test that depends on the shared seed data. Or are rows 2–4 enough?
3. Should rows 1 and 6 be one e2e test or two?

**Your choice:** which rows should I build, for example "2, 3, 4"? Should any of them change first? I'll build the ones you pick with the `ticket-change` skill.

I haven't run any tests or commands, and I haven't changed any files.
