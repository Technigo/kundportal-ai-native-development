# Plan: Ticket list and ticket details (AC2, AC4.1)

Owner: Marie Flem Honningdalnes · Reviewer: Alexandra Petersson
Decision: [05-ticket-list-and-details.md](../decisions/05-ticket-list-and-details.md)
Based on sections 2 and 4 of [project-brief.md](../project-brief.md).

## Current state

- The list is done: `src/app/(portal)/tickets/page.tsx` and `src/components/TicketList.tsx` (AC2.1–AC2.3). The subject is not a link.
- `src/tickets/ticketRepository.ts` has `createTicket` and `listTickets`, but no function that reads one ticket.
- There is no `/tickets/[id]` route.
- Next.js 16: `params` and `searchParams` are Promises and must be awaited. Ticket pages read data per request, so they call `connection()` as the list page does.

## Interaction with `jessica/status-change`

- That branch adds a status dropdown, a Save button and a status history to the detail page. This plan only reserves a section for them.
- It adds a `ticket_status_changes` table. This plan does not use it.
- Both branches edit `docs/decisions/README.md` and `docs/project-brief.md`. Decision numbers: `04` is taken by that branch, this one is `05`.

## Specification

- AC4.1: Given a ticket in the list, when the handler opens it, then the full description and requester details are shown.
- AC4.2: The detail page shows subject, status, priority, created date, requester name, requester email (or "No email given") and the description with line breaks kept.
- AC4.3: The detail page has a "Back to tickets" link.
- AC4.4: Given an id that is not a positive integer or does not exist, when the handler opens `/tickets/[id]`, then they are redirected to `/tickets?notice=ticket-not-found` and the list shows "This ticket does not exist."
- AC4.5: Given any other `notice` value, the list shows no message.
- AC4.6: The subject in the list is a link to the ticket. The list keeps no control for changing data.

## Steps (test-first, following `ticket-change`)

Each step starts with a failing test, then the minimal code. Each step is approved separately.

1. **Repository:** `getTicket(db, id)` returns the ticket or `undefined`. Vitest against the in-memory database in `ticketRepository.test.ts`.
2. **Component:** `TicketDetails` in `src/components/`. React Testing Library tests for AC4.1–AC4.3, including a ticket without email and a multi-line description. It has an empty, labelled section for the status form and history.
3. **Route:** `src/app/(portal)/tickets/[id]/page.tsx`. It awaits `params`, parses the id with zod, calls `connection()` and `getTicket`, and calls `redirect("/tickets?notice=ticket-not-found")` for an invalid or unknown id. Sets the page title from the subject.
4. **Notice on the list:** the tickets page awaits `searchParams` and shows the message for the known code only (AC4.4, AC4.5). Component test for the notice.
5. **Link in the list:** `TicketList` links the subject to `/tickets/[id]` (AC4.6). Update `TicketList.test.tsx`.
6. **End-to-end (Playwright):**
   - Open a ticket from the list, see requester and full description, and go back (AC4.1, AC4.3).
   - Open `/tickets/99999` and `/tickets/abc`, land on the list with the message (AC4.4).
   - Add a ticket with a multi-line description to the e2e seed data if none exists. This changes `src/db/seed.mts` and may change the row order the existing e2e tests depend on, so check them.
7. **Documentation:** set section 4 in `project-brief.md` to Done with AC4.1–AC4.6, update the mapping and run results in `verification.md`, and update `limitations.md` ("No ticket detail view").

## Not in this plan

- Status change and history (Jessica, see [status-change.md](status-change.md) on her branch).
- Internal notes.
- Editing a ticket, searching, filtering or paging the list.

## Risks and open points

- Merge conflicts in `README.md` and `project-brief.md` with `jessica/status-change`.
- Changing seed data can break row-order assertions in `e2e/tickets.spec.ts`.
- Agree with Jessica where in the detail page her section goes. This plan proposes below the ticket facts.
