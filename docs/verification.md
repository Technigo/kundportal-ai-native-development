# Verification plan

How we check that the acceptance criteria in [project-brief.md](project-brief.md) hold. Commands are in [CLAUDE.md](../CLAUDE.md).

## Test levels and why

| Level | Tool | Used for | Why |
|---|---|---|---|
| Unit | Vitest | zod schema, navigation data | Fast, no UI or database needed |
| Data | Vitest + in-memory SQLite per test | `createTicket`, `getTicket`, `listTickets` | Real queries against a real schema, isolated and fast |
| Server action | Vitest | `submitTicket` | Checks validation, saving, revalidation and redirect without a browser |
| Component | Vitest + React Testing Library | `TicketForm`, `TicketList`, `TicketDetails`, `TicketNotice`, `PortalShell` | Checks labels, errors and states the user sees |
| End-to-end | Playwright (Chrome) against a production build and `data/e2e.db` | Full flows, keyboard navigation, async Server Components | Async Server Components cannot be unit-tested with Vitest |

## Criterion to test mapping

| Criterion | Tests |
|---|---|
| AC1.1 | `submitTicket` saves a valid ticket and redirects; `createTicket` stores status open; e2e "submitting a valid ticket shows it at the top of the list" |
| AC1.2 | `newTicketSchema` defaults priority and rejects unknown priorities |
| AC1.3 | `newTicketSchema` optional email; `submitTicket` invalid email and no email; e2e invalid email |
| AC1.4 | `submitTicket` returns errors and values; `TicketForm` shows errors and keeps values; e2e short subject |
| AC1.5 | `newTicketSchema` trimming, limits and required name |
| AC1.6 | `newTicketSchema` strips unknown fields; `submitTicket` ignores a status |
| AC2.1 | `TicketList` renders a row per ticket; e2e list shows requester |
| AC2.2 | `listTickets` newest first; e2e newest first |
| AC2.3 | `TicketList` empty state |
| AC3.1, AC3.2 | `PortalShell`, `navItems`; e2e redirect and keyboard navigation |
| AC4.1 | `getTicket` returns the ticket; `TicketDetails` shows requester name and email, and the full description; e2e "opens a ticket from the list, shows its details and goes back" |
| AC4.2 | `TicketDetails` shows subject, status, priority and date; no-email text; description keeps line breaks; e2e "sets the page title from the ticket subject"; e2e "long words in subject and description do not overflow the page" |
| AC4.3 | `TicketDetails` links back to the list; e2e "opens a ticket from the list, shows its details and goes back" |
| AC4.4 | `getTicket` returns undefined for an unknown id; `parseTicketId` accepts plain positive numbers only; `TicketNotice` shows the message for `ticket-not-found`; e2e redirects from `/tickets/99999`, `/tickets/abc`, `/tickets/01`, `/tickets/1e0` and `/tickets/0x1` |
| AC4.5 | `TicketNotice` shows nothing for an unknown or missing code; e2e "shows no message for an unknown notice code" |
| AC4.6 | `TicketList` "links each subject to the ticket details" |
| AC5.3 (AC-S3) | `statusChangeSchema` accepts open, in_progress and closed; rejects "resolved" and "" with "Invalid status." (schema only; server action not built) |
| AC5.1, AC5.2 | Not built, no tests yet |

## Latest run results

Run on 2026-11-09 on branch `marie/ticket-list-details`.

| Command | Result |
|---|---|
| `npm test` | 10 files, 59 tests passed |
| `npm run lint` | No errors |
| `npm run typecheck` | No errors |
| `npm run test:e2e` | 15 tests passed |

Update this table when you rerun the checks.

## Manual checks

Automated tests cannot see layout or real browser behaviour. These checks are done by hand in Chrome with `npm run dev` and fresh seed data.

| Check | Criterion | Expected | Last result |
|---|---|---|---|
| Long URL without spaces in the description | AC4.2 | Text wraps inside the box, no horizontal scroll | Failed on 2026-11-08 (Alexandra), fixed on 2026-11-09, to be re-checked |
| `/tickets/01`, `/tickets/1e0`, `/tickets/0x1` | AC4.4 | Redirect to the list with the message | Failed on 2026-11-08 (Alexandra), fixed on 2026-11-09, to be re-checked |
| `?notice=hej`, `?notice=`, `?notice=<b>x</b>`, `?notice=toString` | AC4.5 | No message, no tags rendered | Passed (Alexandra, 2026-11-08) |
| Keyboard only: list, ticket, Back to tickets | AC4.6, AC3.2 | All reachable, focus visible | Passed (Alexandra, 2026-11-08) |
| Screen reader | All | Pages are announced in a sensible order | Not done |

## Limitations of the verification

- No tests for AC5.x because the feature is not built.
- End-to-end tests cover Chrome only.
- No accessibility audit beyond the keyboard navigation test and labelled form fields. No screen reader test.
- e2e tests share one seeded database, so they depend on the seed data order.
