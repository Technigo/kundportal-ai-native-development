AC-S5 is already covered at the data and server action levels. What's missing is a test of what the handler sees in the browser, plus a few nearby edge cases.

**Criterion** (`docs/specs/status-change.md:48`):

> **AC-S5 (edge case, same status):** Given a ticket with status `in_progress`, when the handler saves `in_progress`, then no error is shown, the status is unchanged and no history entry is saved.

The spec rule it rests on (line 31): *"A 'change' to the status the ticket already has is silently ignored: no error is shown, nothing changes and no history entry is saved."*

**Code involved:**
- `changeTicketStatus` returns `"unchanged"` (`src/tickets/ticketRepository.ts:36`).
- `changeStatus` returns `undefined` and only revalidates when the result is `"changed"` (`src/app/(portal)/tickets/actions.ts:80`).
- `StatusForm` only shows an error when `state.error` is set.

| # | Behaviour | Type | Test level | Expected result |
|---|---|---|---|---|
| 1 | Saving the current status on the detail page of an `in_progress` ticket | happy path | end-to-end | No "Invalid status." text and no error area. The status badge still shows "In progress". The number of history rows is the same as before. |
| 2 | Same status on a ticket that has never been changed (`open`, empty history) | edge case | data | `changeTicketStatus(db, id, "open")` returns `"unchanged"`. `listStatusChanges` returns `[]`. |
| 3 | Same status for each value in `ticketStatuses` (`open`, `in_progress`, `closed`) | edge case | server action | For each status: `changeStatus` returns `undefined`, the status stays the same, no new history entry, `revalidatePath` is not called. |
| 4 | Saving the same status twice in a row | edge case | server action | Both calls return `undefined`. The history count stays the same as before the first call. |
| 5 | **(assumption)** An earlier "Invalid status." is gone after a same-status Save | edge case | component | `StatusForm`: the action first returns `{ error: "Invalid status." }`, then `undefined`. After that, the error text is gone and `aria-invalid` is removed from the dropdown. |
| 6 | **(assumption)** A real change after a same-status Save is still recorded | happy path | data | Sequence `in_progress → in_progress → closed` gives exactly one new entry, `in_progress → closed`. `fromStatus` is `in_progress`. |

**Already covered** (`docs/verification.md:43`):
- `ticketRepository.test.ts:179–185`: the `in_progress → in_progress` case returns `"unchanged"`, the status stays the same and there is still only 1 history entry.
- `actions.test.ts:228–238`: "ignores a change to the same status without an error or a revalidation". It checks `undefined` state, status unchanged, history count 1, no `revalidatePath` and no `redirect`.
- This already meets the criterion exactly at the data and server action levels. Only the browser level (row 1) has no test.

**Assumptions**
1. Row 5: "no error is shown" also means an earlier error disappears. The spec only describes a fresh Save. The code does clear it, because `changeStatus` returns `undefined`, but no test checks that.
2. Row 6: "nothing changes" also means the ignored Save does not affect the `fromStatus` of the next real change. The spec doesn't say this, but it follows from "nothing changes".

**Questions**
1. Is row 1 worth an end-to-end run? The behaviour is already proven at the action level, and the e2e tests share one seeded database. The test must use a ticket whose status is `in_progress` and must not affect the order other tests depend on.
2. Should row 1 also check that the page doesn't reload or show any notice? The spec says "silently ignored" but doesn't say how that looks in the browser.
3. Should a same-status Save still revalidate the page? The current code and test say no. That means if another tab changed the status in the meantime, this page won't refresh. Is that acceptable?

**Your choice:** which rows should I build (for example "1, 3, 5"), and should any of them change? I'd suggest 1 and 5, because they cover what the handler actually sees and are the only real gaps. Rows 2, 3, 4 and 6 add little to the tests that already exist. Building is done separately with `ticket-change`.
