AC-S2 is mostly covered, but no single test runs all six transitions, and the per-transition action test doesn't check the history entry. Two directions, `in_progress → closed` and `closed → open`, are never tested through `changeStatus`.

**Criterion** (`docs/specs/status-change.md:45`):

> **AC-S2 (happy path, any transition):** Given a ticket, it can change between all three statuses in any direction, for example `open → closed` and `closed → in_progress`, and each change is saved.

**Spec context:**
- "Allowed transitions: a ticket can change from any status to any other status." The table on lines 20–24 lists six transitions.
- The Decisions section says the reason is that a handler should be able to skip steps and go back to an earlier status.
- Every successful change is stored in the history with the previous status, the new status and a timestamp (AC-S6).

**Code involved:**
- `changeTicketStatus` has no transition rules. It only checks for "not found" and "same status" (`src/tickets/ticketRepository.ts:32–40`).
- `changeStatus` validates against `ticketStatusSchema` and revalidates the list and detail page on `"changed"` (`src/app/(portal)/tickets/actions.ts:69–85`).
- `StatusForm` renders one option per status in `ticketStatuses`, with none disabled.

| # | Behaviour | Type | Test level | Expected result |
|---|---|---|---|---|
| 1 | Every one of the six transitions, built from `ticketStatuses` (each status to each other status) | happy path | server action | For each pair: `changeStatus` returns `undefined`, `getTicket` shows the new status, exactly one new history entry with the right `fromStatus` and `toStatus`, `revalidatePath` called with `/tickets` and `/tickets/{id}`, no redirect. |
| 2 | Every one of the six transitions at the repository level | happy path | data | For each pair: `changeTicketStatus` returns `"changed"`, the ticket has the new status, and the newest history entry has that `fromStatus` and `toStatus` and a `changedAt` date. |
| 3 | One ticket goes through all six transitions in a row (for example open → in_progress → closed → open → closed → in_progress → open) | edge case | data | Every call returns `"changed"`. `listStatusChanges` returns 6 entries, newest first, in reverse order of the chain. Each entry's `fromStatus` equals the `toStatus` of the entry before it. |
| 4 | Going backwards on the detail page: `closed → in_progress` (the example in the criterion) | happy path | end-to-end | The detail page shows "In progress" in the badge. The newest history row reads "Closed → In progress · {date}". The ticket list row shows "In progress". |
| 5 | **(assumption)** The dropdown lets you pick any other status from every starting status | edge case | component | For each status in `ticketStatuses` as the current status, `StatusForm` shows all three options with none disabled. Choosing either of the other two and clicking Save sends `ticketId` and that status. |
| 6 | Reopening a closed ticket is not treated as an error | error path | server action | `closed → open`: returns `undefined`, not `{ error: "Invalid status." }`, and the status is `open` afterwards. (This is already part of row 1. Build it on its own only if row 1 is not chosen.) |

**Already covered** (`docs/verification.md:39`, `src/app/(portal)/tickets/actions.test.ts:204–226`, `src/tickets/ticketRepository.test.ts:121–140`):
- Server action level:
  - `open → in_progress` checks the status, 1 history entry and both revalidations.
  - `open → closed`, `closed → in_progress` and `in_progress → open` check the status and the detail page revalidation only, not the history.
- Data level: `open → in_progress` and `in_progress → closed` check `fromStatus`, `toStatus` and the timestamp.
- End-to-end: `tickets.spec.ts:149` covers `open → in_progress`, the first transition only.
- Never tested through `changeStatus`: `in_progress → closed` and `closed → open`. Only the forward direction is tested end to end.

**Assumptions**
1. Row 5: "any direction" means the UI never hides or disables an option based on the current status. The spec says this for the server, and the dropdown "starts on the current status", but it doesn't say the UI must offer every option. The current code does offer them all.
2. Row 3: the chain is a valid way to check "each change is saved" in sequence, and the spec's "newest first" (AC-S6) is the order to check against.

**Questions**
1. Should row 1 replace the existing `it.each` with three pairs (`actions.test.ts:215–226`), or be added next to it? Replacing it avoids duplication. Adding next to it keeps the existing tests unchanged.
2. Row 4 needs a closed ticket in the browser. Should the test create its own ticket and close it through the UI first, which is slower but independent? Or should a closed ticket be added to the e2e seed data, which changes the shared database other tests depend on?
3. Is it enough to check only the newest history entry in rows 1 and 2, or must the whole history match?

**Your choice:** which rows should I build (for example "1, 3, 4"), and should any of them change? I'd suggest 1 and 4. Row 1 closes the two untested directions and checks the history for every transition. Row 4 checks the backward direction the criterion names, end to end. Building is done separately with `ticket-change`.
