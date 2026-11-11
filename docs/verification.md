# Verification plan

How we check that the acceptance criteria in [project-brief.md](project-brief.md) hold. Commands are in [CLAUDE.md](../CLAUDE.md).

## Test levels and why

| Level | Tool | Used for | Why |
|---|---|---|---|
| Unit | Vitest | zod schema, navigation data | Fast, no UI or database needed |
| Data | Vitest + in-memory SQLite per test | `createTicket`, `getTicket`, `listTickets` | Real queries against a real schema, isolated and fast |
| Persistence | Vitest + a temporary SQLite file per test | A ticket saved through one connection is read through a new one | Shows the ticket is written to the file, which an in-memory database cannot show. It does not restart a process; the manual restart check covers that |
| Server action | Vitest | `submitTicket` | Checks validation, saving, revalidation and redirect without a browser |
| Component | Vitest + React Testing Library | `TicketForm`, `TicketList`, `TicketDetails`, `TicketNotice`, `PortalShell` | Checks labels, errors and states the user sees |
| End-to-end | Playwright (Chrome) against a production build and `data/e2e.db` | Full flows, keyboard navigation, async Server Components | Async Server Components cannot be unit-tested with Vitest |

## Criterion to test mapping

| Criterion | Tests |
|---|---|
| AC1.1 | `submitTicket` saves a valid ticket with a trimmed category and redirects; `createTicket` stores status open, category and creation time; e2e "submitting a valid ticket shows it at the top of the list" |
| AC1.2 | `newTicketSchema` defaults priority and rejects unknown priorities; `submitTicket` gives an empty priority `normal` and saves nothing for `urgent` |
| AC1.3 | `newTicketSchema` optional email, email with only spaces as no email, exact message for an invalid email, 254 accepted and 255 rejected; `submitTicket` invalid email and no email; e2e invalid email |
| AC1.4 | `newTicketSchema` exact messages for name, subject and description with only spaces; `submitTicket` returns errors and values, and the category message for a blank category; `TicketForm` shows errors, links the category error with `aria-describedby` and keeps values; e2e short subject, missing category and missing name (nothing saved) |
| AC1.5 | `newTicketSchema` trimming and limits: subject 3 and 120, name 120, description 5000, category 50, email 254 accepted, one more rejected with exact messages; `TicketForm` `maxlength` on every text field |
| AC1.6 | `newTicketSchema` strips unknown fields; `submitTicket` ignores a status |
| AC1.7 | `newTicketSchema` requires and trims the category with exact messages; `submitTicket` saves the trimmed category; `createTicket` gives a ticket without a category `General`; `TicketForm` category field; e2e missing category; manual migration check (below) |
| AC2.1 | `TicketList` renders a row per ticket; e2e list shows requester |
| AC2.2 | `listTickets` newest first; e2e newest first |
| AC2.3 | `TicketList` empty state |
| AC3.1, AC3.2 | `PortalShell`, `navItems`; e2e redirect and keyboard navigation |
| AC4.x, AC5.x | Not built, no tests yet |
| AC7.1 | [persistence.test.ts](../src/db/persistence.test.ts) "keeps a saved ticket when the database file is opened through a new connection" (the ticket is in the file and a new connection reads it); manual restart check (below) (the ticket survives a real dev server restart) |
| AC7.2 | `.gitignore` ignores `/data/*.db`; manual restart check uses `data/dev.db` (below) |

## Register a ticket (AC1): test cases by type

Detailed rules: [specs/register-ticket.md](specs/register-ticket.md).

| Type | Behaviour | AC | Test | Expected result |
|---|---|---|---|---|
| Happy path | A valid ticket is saved and the handler lands on the list | 1.1 | [actions.test.ts](../src/app/%28portal%29/tickets/actions.test.ts) "saves a valid ticket…"; [tickets.spec.ts](../e2e/tickets.spec.ts) "submitting a valid ticket…" | Saved with status `open`, trimmed category; redirect to `/tickets`, ticket first in list |
| Happy path | Ticket without email | 1.3 | actions.test.ts "saves a ticket without a requester email" | Saved, email `null` |
| Happy path | Ticket saved without a category (existing tickets) | 1.7 | [ticketRepository.test.ts](../src/tickets/ticketRepository.test.ts) "gives a ticket saved without a category the category General" | Category `General` |
| Error path | Missing or blank category | 1.4, 1.7 | [ticketSchema.test.ts](../src/tickets/ticketSchema.test.ts) "rejects a category that is empty / only spaces…"; actions.test.ts "returns a category error…"; [TicketForm.test.tsx](../src/components/TicketForm.test.tsx) "shows the category error…"; tickets.spec.ts "shows an error when the category is missing…" | Nothing saved; "Please enter a category." next to the field; input kept |
| Error path | Invalid email | 1.3, 1.4 | actions.test.ts "returns an error for an invalid requester email…"; tickets.spec.ts "shows an error for an invalid requester email…" | Nothing saved; "Please enter a valid email address." |
| Error path | Subject too short | 1.4 | tickets.spec.ts "shows a validation error… subject is too short" | "Subject must be at least 3 characters."; input kept |
| Error path | Missing requester name in the browser | 1.4 | tickets.spec.ts "shows an error when the requester name is missing and saves nothing" | "Please enter who contacted us."; input kept; ticket not in the list |
| Error path | Name, subject or description with only spaces | 1.4 | ticketSchema.test.ts "rejects … with only spaces with a clear message" | The field's exact message, and no other error |
| Error path | Unknown priority sent directly | 1.2 | actions.test.ts "rejects an unknown priority sent directly…" | Only a priority error; `urgent` kept; nothing saved |
| Error path | Status sent directly | 1.6 | actions.test.ts "ignores a status sent in the form" | Status saved as `open` |
| Edge case | Category at the limit, also with spaces around | 1.5, 1.7 | ticketSchema.test.ts "accepts a category of 50 characters after trimming and rejects 51…" | 50 accepted; 51 gives "Category must be at most 50 characters." |
| Edge case | Category with spaces around | 1.7 | ticketSchema.test.ts "trims whitespace around the category" | Saved as `Billing` |
| Edge case | Empty priority | 1.2 | actions.test.ts "gives a ticket sent with an empty priority the priority normal" | Saved with `normal` |
| Edge case | Subject at 2 and 3 characters | 1.5 | ticketSchema.test.ts "accepts a subject of 3 characters and rejects 2…" | 3 accepted; 2 gives "Subject must be at least 3 characters." |
| Edge case | Name, subject and description at the upper limit | 1.5 | ticketSchema.test.ts "accepts … at … characters and rejects one more…" | 120 / 120 / 5000 accepted; one more gives the field's message |
| Edge case | Email at 254 and 255 characters | 1.3, 1.5 | ticketSchema.test.ts "accepts an email of 254 characters and rejects 255…" | 254 accepted; 255 gives only "Email must be at most 254 characters." |
| Edge case | Email with only spaces | 1.3 | ticketSchema.test.ts "rejects an invalid email with a clear message and treats one with only spaces as no email" | No email |
| Edge case | Form limits | 1.5 | TicketForm.test.tsx "limits each text field to its documented length" | `maxlength` 120 / 254 / 120 / 5000 / 50 |

## Mutation check

Green tests only show that code and tests agree. To show that the tests fail for the right reason, `npm run test:mutation` breaks one line of `submitTicket` on purpose, runs the tests, checks that the named tests fail, and restores the file. Add `-- --e2e` to run Playwright as well (one production build per mutation, a few minutes).

| Mutation | Must fail | Vitest | E2E |
|---|---|---|---|
| Saving is disconnected (AC1.1) | "saves a valid ticket…"; e2e "submitting a valid ticket…" | Caught | Caught |
| Category read from a misspelled field (AC1.1, AC1.7) | "returns a category error…"; e2e "submitting a valid ticket…" | Caught | Caught |
| Category not saved, the database default `General` hides it (AC1.7) | "saves a valid ticket…" (expects `Billing`) | Caught | Not run: the list does not show the category |

Run on 2026-11-07. The file was identical before and after (`shasum`).

**What the check found.** The first version removed the category line in mutation 2. TypeScript then stopped `npm run build`, so no e2e test ran, and the script wrongly reported "missed". The script now reports ERROR when no tests ran, and mutation 2 uses a misspelled field name that still builds. Running the old mutation again gave "ERROR, the tests did not run" instead of "missed".

Script: [scripts/mutation-check.mjs](../scripts/mutation-check.mjs).

## Manual checks

| Check | Why manual | Status | Result |
|---|---|---|---|
| Existing tickets get the category `General` after `npm run db:migrate` (AC1.7) | Tests migrate an empty database, so they do not show existing rows | Done 2026-11-07 on `data/dev.db` | All 4 existing tickets had `General` |
| A ticket is still there after the dev server restarts (AC7.1) | The test opens a new connection but does not restart a real server | Done 2026-11-10 on `data/dev.db` (Ariadna Villar, with an AI agent) | Ticket "Restart check 2026-11-10" saved with `createTicket`, shown on `/tickets`; dev server stopped and started with `npm run dev`; ticket still shown |
| The persistence test fails when tickets are not kept in the file (AC7.1) | The test passed on its first run because persistence already worked, so it was never seen failing | Done 2026-11-10 (Ariadna Villar, with an AI agent) | `createDb` in `src/db/client.ts` changed by hand to always use `:memory:`: the test failed with "no such table: tickets" on the new connection. File restored and identical (`shasum`) |
| The persistence test cleans up its temporary database on Windows (AC7.1) | macOS and Linux can delete a file that is still open, so the EBUSY error only shows on Windows, and CI runs on `ubuntu-latest` only | Not done | To do on Windows: run `npx vitest run src/db/persistence.test.ts` before and after the change that closes each client before `rmSync`; record whether `afterEach` fails with EBUSY |
| Error messages for registering a ticket are understandable | Judging clarity needs a person | Done 2026-11-07 by Alexandra Petersson with `npm run dev` | Invalid email (`Alex@hej`) and an empty category, with the other fields valid and priority `low`: both errors shown next to their fields, the other fields accepted. After correcting the email (`alec@hej.se`) and the category the ticket was saved. The messages were judged clear. Not judged by hand: an empty form, a name with only spaces and a too-short subject (covered by automated tests) |

## Latest run results

Run on 2026-11-09 on branch `Alexandra/register-ticket`, after merging `main` (ticket details).

| Command | Result |
|---|---|
| `npm test` | 10 files, 78 tests passed |
| `npm run lint` | No errors |
| `npm run typecheck` | No errors |
| `npm run test:e2e` | 17 tests passed |
| `npm run test:mutation -- --e2e` | 5 of 5 caught (3 Vitest, 2 e2e) |

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
- The AC1 tests added after the code (blank fields, limits, email, priority, `maxlength`, missing name) passed on their first run, because the behaviour already existed. They were not seen failing first; the mutation check covers `submitTicket` only.
- The ticket list does not show the category, so e2e cannot show that it is saved. The action test covers it, and mutation 3 shows that the test catches it.
- The mutation check tries three hand-picked mutations in `submitTicket`, not every possible fault.
