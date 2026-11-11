# Project Brief and Specification: Kundserviceportalen

## Overview

Kundserviceportalen is a customer service portal for case handlers. A handler registers a ticket on behalf of the person who contacted the company (name, optional email), sees all tickets in one list, and follows them through a simple workflow.

## Users

- **Case handlers**: register and follow tickets. There is no sign-in yet; everyone who opens the app is treated as a case handler.

## Tech stack

| Area | Choice |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | SQLite via libSQL (local file) |
| ORM | Drizzle ORM (schema, migrations, queries) |
| Validation | zod |
| Testing | Vitest + React Testing Library, Playwright |

Reasons for the choices are recorded in [docs/decisions/](decisions/README.md).

## Scope

- **Local-first.** Runs locally; data persists in a local SQLite file and survives restarts.
- **Fake data only.** All requesters and tickets are invented.
- **No external services.** No cloud infrastructure, email APIs or external authentication.

### Out of scope

- Sign-in and roles.
- Customers submitting or viewing their own tickets.
- Sending email.

## Workflows and acceptance criteria

Status: **Done** = implemented and tested, **Planned** = not built yet. Each criterion is mapped to its tests in [docs/verification.md](verification.md).

### 1. Register a ticket (Done, except AC1.8)

- AC1.1: Given a valid name, subject, description and category, when the handler submits the form, then the ticket is saved with status `open` and the time it was created, and the handler is redirected to the ticket list.
- AC1.2: Priority is `low`, `normal` or `high` and defaults to `normal`.
- AC1.3: The requester email is optional. If given, it must be a valid email address.
- AC1.4: Given invalid input, when the handler submits, then nothing is saved, the field errors are shown, and the entered values are kept.
- AC1.5: Input is validated on the server: name 1-120 characters, subject 3-120, description 1-5000, category 1-50, email at most 254. Limits apply to the trimmed value.
- AC1.6: A status sent in the form is ignored; a new ticket always starts as `open`.
- AC1.7: A category is required. It is free text, at most 50 characters, and is saved trimmed. Tickets created before categories existed have the category `General`.
- AC1.8: Given valid input, when the ticket cannot be saved to the database, then the handler stays on `/tickets/new`, nothing is saved, "Could not save the ticket to the database. Please try again." is shown and the entered values are kept. (Planned)

Detailed specification: [docs/specs/register-ticket.md](specs/register-ticket.md). AC1.8: [docs/specs/save-failure-message.md](specs/save-failure-message.md)

### 2. List tickets (Done)

- AC2.1: The list shows every ticket with subject, requester, status, priority and date.
- AC2.2: Tickets are sorted newest first.
- AC2.3: When there are no tickets, an empty state is shown.

### 3. Navigate the portal (Done)

- AC3.1: `/` redirects to `/dashboard`.
- AC3.2: The main navigation has links to Dashboard and Tickets, reachable by keyboard, with the current page marked `aria-current="page"`.

### 4. View ticket details (Done)

- AC4.1: Given a ticket in the list, when the handler opens it, then the full description and requester details are shown.
- AC4.2: The detail page shows subject, status, priority, created date, requester name, requester email (or "No email given") and the description with line breaks kept.
- AC4.3: The detail page has a "Back to tickets" link.
- AC4.4: Given an id that is not a positive integer or does not exist, when the handler opens `/tickets/[id]`, then they are redirected to `/tickets?notice=ticket-not-found` and the list shows "This ticket does not exist."
- AC4.5: Given any other `notice` value, the list shows no message.
- AC4.6: The subject in the list is a link to the ticket. The list keeps no control for changing data.

Detailed specification: [docs/specs/ticket-list-and-details.md](specs/ticket-list-and-details.md)

### 5. Change status and track history (Done)

- AC5.1: The handler can change a ticket's status between `open`, `in_progress` and `closed`.
- AC5.2: Each status change is stored with a timestamp and shown on the ticket.
- AC5.3: Only the allowed status values are accepted.

Detailed specification: [docs/specs/status-change.md](specs/status-change.md)

### 6. Internal notes (Planned)

- AC6.1: Given a ticket, when the handler writes a note on the detail page and adds it, then the note is saved and shown on the ticket with its created date and time, and the form is emptied.
- AC6.2: Each note shows a "Comments (N)" button that shows or hides its comments and a comment form. Given an open note, when the handler writes a comment and adds it, then the comment is saved and shown under that note with its created date and time, and the count is updated.
- AC6.3: Notes are shown newest first and the comments under a note oldest first. A new comment does not change the order of the notes. Notes and comments remain after the application restarts.
- AC6.4: Note and comment text is validated on the server (1–500 characters after trimming). Given invalid text, nothing is saved, an error is shown next to the form and the entered text is kept.
- AC6.5: Given a ticket id or note id that does not exist or is malformed, when a note or comment is sent for it, then nothing is saved and a message says it no longer exists.
- AC6.6: Given a note, when the handler deletes it and confirms in a second step, then the note and all its comments are removed. The confirm step warns when the note has comments. If the handler cancels, nothing changes.
- AC6.7: Given a comment, when the handler deletes it and confirms in a second step, then only that comment is removed.
- AC6.8: Notes and comments are shown only on the ticket detail page. They are not shown in the ticket list, and no author is stored.
- AC6.9: Given a note or comment that was already deleted, when the handler tries to delete it, then nothing else changes and a message says it no longer exists.
- AC6.10: Note and comment text is shown as plain text: HTML in a note is shown literally and is never run.

Detailed specification: [docs/specs/internal-notes.md](specs/internal-notes.md)

## Milestones

1. Boilerplate: UI, server logic and storage connected (done).
2. Register and list tickets, tested (done).
3. Ticket details, tested (done).
4. Status tracking with history (done).
5. Internal notes with comments and delete, tested (planned).
