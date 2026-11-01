# Specification: Change status and track history (AC5)

Owner: Jessica Swahn · Reviewer: Ariadna Villar
Based on section 5 of [project-brief.md](../project-brief.md) (AC5.1–AC5.3).

## Current state

- The statuses already exist: `ticketStatuses = ["open", "in_progress", "closed"]` in `src/tickets/ticketSchema.ts`. The `tickets.status` column is limited to these values and defaults to `"open"`.
- There is no ticket detail page (AC4.1 is "Planned").
- There is no history table and no sign-in, so the system does not know who the case handler is.

## Specification

**What the handler does:** sees each ticket's current status directly in the ticket list, picks a new status on the ticket's row and saves. The new status is shown in the list and the change is stored in the ticket's history.

**Statuses:** `open`, `in_progress`, `closed`.

**Allowed transitions:** a ticket always moves one step forward in a cycle. A closed ticket can be reopened.

```
open → in_progress → closed
  ↑                    │
  └───── (reopen) ─────┘
```

| From \ To | open | in_progress | closed |
|---|---|---|---|
| open | – | ✅ | ❌ |
| in_progress | ❌ | – | ✅ |
| closed | ✅ (reopen) | ❌ | – |

**Rules:**

- Only the three allowed transitions above are saved. Any other transition is rejected with an error message and the status is left unchanged.
- The status is validated on the server, and unknown values are rejected (AC5.3).
- A "change" to the status the ticket already has is silently ignored: no error is shown, nothing changes and no history entry is saved.
- Every successful status change is stored in the history with the previous status, the new status and a timestamp (AC5.2).
- The history does not record who made the change, because no one is signed in and the system cannot know who the handler is. This is noted as a limitation in `docs/limitations.md`.
- The list only offers the statuses the ticket is allowed to move to.

## Acceptance criteria

- **AC-S1 (happy path):** Given a ticket with status `open`, when the handler selects `in_progress` in the list and saves, then the new status is saved and shown in the ticket list.
- **AC-S2 (happy path, full cycle):** Given a ticket, it can move `open → in_progress → closed → open`, and each step is saved.
- **AC-S3 (error path, invalid value):** Given a ticket, when the server receives the status `"resolved"` or an empty value, then nothing is saved, an error message is shown and the ticket's status is unchanged.
- **AC-S4 (error path, transition not allowed):** Given a ticket with status `open`, when the server receives `closed`, then the change is rejected with an error message and the status stays `open`. The same applies to `in_progress → open` and `closed → in_progress`.
- **AC-S5 (error path, ticket not found):** When a status change is sent for a ticket id that does not exist, then nothing changes and the handler gets a "not found" message.
- **AC-S6 (edge case, same status):** Given a ticket with status `in_progress`, when the server receives `in_progress`, then no error is shown, the status is unchanged and no history entry is saved.
- **AC-S7 (history):** Every successful status change is stored with the previous status, the new status and a timestamp, newest first. It is still there after a restart.

## Breakdown into small steps (test-first, following `ticket-change`)

1. **Transition rules (pure function):** `canTransition(from, to)` and a zod schema for status changes in `ticketSchema.ts`. Tested with Vitest.
2. **History table:** a new table `ticket_status_changes` (ticket id, from, to, timestamp) in `src/db/schema.ts`. I run `npm run db:generate` myself.
3. **Repository:** `changeTicketStatus(db, id, to)` in `ticketRepository.ts`. Checks the transition, handles "not found" and "same status", and writes the ticket and the history entry in one transaction. Tested with Vitest against the test database.
4. **Server action:** `changeStatus` in `tickets/actions.ts`, which validates the input, calls the repository and returns errors. Tested with Vitest.
5. **UI in the list:** a status selector on each row in `TicketList` that only offers allowed targets. Component test, then a Playwright test for AC-S1.
6. **Show history:** see the open question below.
7. **Documentation:** update the AC status in `project-brief.md`, `verification.md` and `limitations.md`.

## Decisions

| Question | Decision | Reason |
|---|---|---|
| Which transitions are allowed? | open → in_progress → closed, and closed → open | So that every ticket has always been handled before it is closed |
| Is history included? | Yes | AC5.2 in project-brief.md requires it |
| Where in the UI? | Directly in the ticket list | Fewer steps make it quick to change a status, for example when the handler is back in the list after forgetting to change it on the detail page |
| Change to the same status? | Silently ignored, no history entry | Nothing has changed, so there is no error to show and nothing to store |
| Who made the change? | Only the timestamp is stored | No one is signed in, so the system cannot know who made the change |

## Open question

- **Where is the history shown?** Proposal: on the ticket detail page (AC4.1, owned by Marie), since AC5.2 says the history is "shown on the ticket". To be confirmed with Marie.
