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

### 1. Register a ticket (Done)

- AC1.1: Given a valid name, subject and description, when the handler submits the form, then the ticket is saved with status `open` and the handler is redirected to the ticket list.
- AC1.2: Priority is `low`, `normal` or `high` and defaults to `normal`.
- AC1.3: The requester email is optional. If given, it must be a valid email address.
- AC1.4: Given invalid input, when the handler submits, then nothing is saved, the field errors are shown, and the entered values are kept.
- AC1.5: Input is validated on the server: name 1-120 characters, subject 3-120, description 1-5000, email at most 254.
- AC1.6: A status sent in the form is ignored; a new ticket always starts as `open`.

### 2. List tickets (Done)

- AC2.1: The list shows every ticket with subject, requester, status, priority and date.
- AC2.2: Tickets are sorted newest first.
- AC2.3: When there are no tickets, an empty state is shown.

### 3. Navigate the portal (Done)

- AC3.1: `/` redirects to `/dashboard`.
- AC3.2: The main navigation has links to Dashboard and Tickets, reachable by keyboard, with the current page marked `aria-current="page"`.

### 4. View ticket details (Planned)

- AC4.1: Given a ticket in the list, when the handler opens it, then the full description and requester details are shown.

Detailed specification: [docs/specs/ticket-list-and-details.md](specs/ticket-list-and-details.md)

### 5. Change status and track history (Planned)

- AC5.1: The handler can change a ticket's status between `open`, `in_progress` and `closed`.
- AC5.2: Each status change is stored with a timestamp and shown on the ticket.
- AC5.3: Only the allowed status values are accepted.

Detailed specification: [docs/specs/status-change.md](specs/status-change.md)

## Milestones

1. Boilerplate: UI, server logic and storage connected (done).
2. Register and list tickets, tested (done).
3. Ticket details and status tracking with history (next).
