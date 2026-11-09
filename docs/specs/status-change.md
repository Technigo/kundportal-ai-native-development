# Specification: Change status and track history (AC5)

Owner: Jessica Swahn · Reviewer: Ariadna Villar
Based on section 5 of [project-brief.md](../project-brief.md) (AC5.1–AC5.3).

## Current state

- The statuses already exist: `ticketStatuses = ["open", "in_progress", "closed"]` in `src/tickets/ticketSchema.ts`. The `tickets.status` column is limited to these values and defaults to `"open"`.
- There is no ticket detail page yet (AC4.1, owned by Marie, is "Planned").
- There is no history table and no sign-in, so the system does not know who the case handler is.

## Specification

**What the handler does:** opens a ticket's detail page, sees its current status, picks a new status in a dropdown and clicks **Save**. The new status is shown on the detail page and in the ticket list, and the change is stored in the ticket's history, which is shown on the detail page.

**Statuses:** `open`, `in_progress`, `closed`.

**Allowed transitions:** a ticket can change from any status to any other status.

| From \ To | open | in_progress | closed |
|---|---|---|---|
| open | – | ✅ | ✅ |
| in_progress | ✅ | – | ✅ |
| closed | ✅ | ✅ | – |

**Rules:**

- The status can only be changed on the ticket detail page. The ticket list only shows the status.
- The dropdown starts on the current status. Nothing is saved until the handler clicks **Save**, which works as a confirmation step.
- The status is validated on the server, and unknown values are rejected (AC5.3).
- A "change" to the status the ticket already has is silently ignored: no error is shown, nothing changes and no history entry is saved.
- Every successful status change is stored in the history with the previous status, the new status and a timestamp (AC5.2). The history is shown on the detail page, newest first.
- The history does not record who made the change, because no one is signed in and the system cannot know who the handler is. This is noted as a limitation in `docs/limitations.md`.

**Error messages:**

| Case | What happens | Message |
|---|---|---|
| The ticket does not exist, or the ticket id is malformed | Redirect to `/tickets?notice=ticket-not-found`, the same as the detail page (AC4.4) | This ticket does not exist. |
| Invalid status (only possible through a direct request) | Shown on the detail page, next to the status control | Invalid status. |

## Acceptance criteria

- **AC-S1 (happy path):** Given a ticket with status `open`, when the handler selects `in_progress` on the detail page and clicks Save, then the new status is saved and shown on the detail page and in the ticket list.
- **AC-S2 (happy path, any transition):** Given a ticket, it can change between all three statuses in any direction, for example `open → closed` and `closed → in_progress`, and each change is saved.
- **AC-S3 (error path, invalid value):** Given a ticket, when the server receives the status `"resolved"` or an empty value, then nothing is saved, the "Invalid status." message is shown and the ticket's status is unchanged.
- **AC-S4 (error path, ticket not found):** When a status change is sent for a ticket id that does not exist or is malformed, then nothing changes and the handler is redirected to the ticket list with the message "This ticket does not exist."
- **AC-S5 (edge case, same status):** Given a ticket with status `in_progress`, when the handler saves `in_progress`, then no error is shown, the status is unchanged and no history entry is saved.
- **AC-S6 (history):** Every successful status change is stored with the previous status, the new status and a timestamp, and shown on the detail page newest first. It is still there after a restart.
- **AC-S7 (list is read-only):** The ticket list shows each ticket's status but has no control for changing it.

## Breakdown into small steps (test-first, following `ticket-change`)

1. **Status change schema:** a zod schema for a status change (ticket id + new status) in `ticketSchema.ts`. Tested with Vitest.
2. **History table:** a new table `ticket_status_changes` (ticket id, from, to, timestamp) in `src/db/schema.ts`. I run `npm run db:generate` myself.
3. **Repository:** `changeTicketStatus(db, id, to)` and `listStatusChanges(db, id)` in `ticketRepository.ts`. Handles "not found" and "same status", and writes the ticket and the history entry in one transaction. Tested with Vitest against the test database.
4. **Server action:** `changeStatus` in `tickets/actions.ts`, which parses the ticket id with `parseTicketId`, validates the status, calls the repository, returns the "Invalid status." error and redirects when the ticket does not exist. Tested with Vitest.
5. **UI on the detail page:** a status form (dropdown + Save) and the history list, placed on Marie's detail page (AC4.1). Component tests, then a Playwright test for AC-S1. Depends on the detail page.
6. **Documentation:** update the AC status in `project-brief.md`, `verification.md` and `limitations.md`.

Steps 1–4 do not depend on the detail page and can be built first.

## Decisions

| Question | Decision | Reason |
|---|---|---|
| Which transitions are allowed? | Any status to any other status | Fewer restrictions. A handler should not be blocked by fixed steps: sometimes a status needs to skip steps, for example from `open` straight to `closed`, and sometimes go back to an earlier status, such as waiting for customer if that status is added |
| Is history included? | Yes | AC5.2 in project-brief.md requires it |
| Where in the UI? | Only on the ticket detail page, with a dropdown and a Save button | It feels safer: Save works as a confirmation, and a confirmation in the small space of a list row easily becomes cluttered |
| Where is the history shown? | On the ticket detail page | AC5.2 says the history is "shown on the ticket" |
| Change to the same status? | Silently ignored, no history entry | Nothing has changed, so there is no error to show and nothing to store |
| Who made the change? | Only the timestamp is stored | No one is signed in, so the system cannot know who made the change |
| Status and ticket id both invalid? | The redirect for a missing ticket wins | There is no point in validating a status if the ticket does not even exist |
| What happens when the ticket does not exist? | `changeStatus` redirects to `/tickets?notice=ticket-not-found` | The detail page already does this (AC4.4), so the whole app shows the same message, and there is no status control to show an error next to |
| Is a malformed ticket id treated as "does not exist"? | Yes, using `parseTicketId` | The same rule as the detail page (AC4.4) |
| Trim or normalise the status value? | No, it must match exactly | The dropdown always sends fixed values, so other values only come from direct requests |

Earlier versions of this spec allowed only `open → in_progress → closed → open` and placed the status change in the ticket list. See the git history of this file for those versions.

## Open questions

- **Detail page:** confirm with Marie that the status form and the history are placed on her detail page (AC4.1), and when the page will be ready.
- **"Waiting for customer":** should a fourth status be added? The assignment mentions it as an example. It affects the database schema, validation and the list, so it is a team decision.
