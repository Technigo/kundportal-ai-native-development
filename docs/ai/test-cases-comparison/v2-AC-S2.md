Here are the proposed test cases for AC-S2. I've read the spec, `docs/verification.md` and the code (repository, action, `StatusForm` and the e2e test).

> **AC-S2 (happy path, any transition):** Given a ticket, it can change between all three statuses in any direction, for example `open → closed` and `closed → in_progress`, and each change is saved.
>
> Source: `docs/specs/status-change.md:45`

Some transitions are tested today, but no level tests all six. The server action test checks the saved status but not the history entry for each transition. In the browser, only one change (`open → in_progress`) is tested.

| # | Behaviour | Type | Test level | Expected result |
|---|---|---|---|---|
| 1 | Each of the six transitions in the repository | happy path | data | `changed`; new status saved; one entry with correct from/to |
| 2 | Each of the six transitions through `changeStatus` | happy path | server action | Status saved; one history entry from → to; both paths revalidated |
| 3 | Back and forth: open → closed → open → in_progress | edge case | data | Ends `in_progress`; 3 entries, newest first |
| 4 | Form starts on `closed` and sends a backward change to `open` | edge case | component | Dropdown shows Closed; action gets `status=open` on Save |
| 5 | Form follows a new saved status after a change | edge case | component | Re-rendered with `closed`: dropdown shows Closed |
| 6 | Invalid status sent for a `closed` ticket | error path | server action | `{ error: "Invalid status." }`; still `closed`; no new entry |
| 7 | Two changes in a row in the browser: open → closed → in_progress | happy path | end-to-end | Two history rows, newest first; badge and list say In progress |

**Details**

1. Build the pairs from `ticketStatuses` (every `from ≠ to`), so a fourth status is covered automatically, as the "Waiting for customer" decision describes. Relies on the decision "Any status to any other status" and the table in the spec. To get a ticket into the `from` status, change it there first and then count only the new entry.
2. The existing `it.each` covers three transitions (open → closed, closed → in_progress, in_progress → open) and only checks the status and the detail-page revalidation. This row adds in_progress → closed and closed → open, and checks the history entry and the `/tickets` revalidation for all six. It could replace the existing `it.each` or extend it.
3. Shows that going back to an earlier status works more than once and that every change is stored. The ordering itself is already tested for one forward chain.
4. The existing component test always starts on the first status and changes to the second, so it only goes forward. This one checks the spec rule "The dropdown starts on the current status" for a status other than `open`.
5. `StatusForm` uses `key={status}` to remount the form. Without that, the dropdown would show the old value after a save, and the next change would start from the wrong value. Today only the e2e test covers this, and only once.
6. AC-S3 is tested only from `open`. This row shows that validation doesn't depend on the current status. It's on the edge of AC-S2; drop it if you'd rather keep it under AC-S3.
7. Create a new ticket, as the existing e2e test does, so the test doesn't depend on the shared seed data. History rows show only the date, so check the order by the arrow text ("Closed → In progress" first), not by time. Relies on the decision "Where is the history shown? On the ticket detail page".

**Already covered** (`docs/verification.md`, row AC5.1 (AC-S1, AC-S2))
- `actions.test.ts:215`: "changes the status from %s to %s" for open → closed, closed → in_progress and in_progress → open. It checks the status and the `/tickets/[id]` revalidation.
- `actions.test.ts:204`: open → in_progress saves, writes one history entry and revalidates both paths.
- `ticketRepository.test.ts:130`: open → in_progress → closed, listed newest first.
- `e2e/tickets.spec.ts:149`: one change (`open → in_progress`) is shown on the detail page, in the history and in the list.

**Assumptions**

None. Every row rests on the spec's transition table, its rules or the Decisions table.

**Questions**
1. Row 2: should it replace the existing `it.each` in `actions.test.ts`, or add to it?
2. Row 7: do you want a second e2e test, or are rows 1–5 enough? Each e2e test makes the run slower.
3. Row 6: keep it under AC-S2, or move it to AC-S3?

**Your choice:** which rows should I build, for example "1, 2, 5"? Should any of them change first? I'll build the ones you pick with the `ticket-change` skill.

I haven't run any tests or commands, and I haven't changed any files.
