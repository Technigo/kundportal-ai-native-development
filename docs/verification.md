# Verification plan

How we check that the acceptance criteria in [project-brief.md](project-brief.md) hold. Commands are in [CLAUDE.md](../CLAUDE.md).

## Test levels and why

| Level | Tool | Used for | Why |
|---|---|---|---|
| Unit | Vitest | zod schema, navigation data | Fast, no UI or database needed |
| Data | Vitest + in-memory SQLite per test | `createTicket`, `getTicket`, `listTickets`, `changeTicketStatus`, `listStatusChanges` | Real queries against a real schema, isolated and fast |
| Persistence | Vitest + a temporary SQLite file per test | A ticket saved through one connection is read through a new one | Shows the ticket is written to the file, which an in-memory database cannot show. It does not restart a process; the manual restart check covers that |
| Server action | Vitest | `submitTicket`, `changeStatus` | Checks validation, saving, revalidation and redirect without a browser |
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
| AC1.8 | `submitTicket` returns a form error with the values and logs only `name`, `cause` and `code` for an unmigrated database, a read-only error, a failing `getDb()` and a thrown value that is not an `Error`, and saves the ticket on the next attempt; `TicketForm` shows the form error with `role="alert"` before the button and hides it while an attempt is pending; mutation M4; manual check with VoiceOver ([report](test-reports/ac1-8-manual-check.md)). No e2e test ([decision 07](decisions/07-save-failure-handling.md)) |
| AC2.1 | `TicketList` renders a row per ticket; e2e list shows requester |
| AC2.2 | `listTickets` newest first; e2e newest first |
| AC2.3 | `TicketList` empty state |
| AC3.1, AC3.2 | `PortalShell`, `navItems`; e2e redirect and keyboard navigation |
| AC7.1 | [persistence.test.ts](../src/db/persistence.test.ts) "keeps a saved ticket when the database file is opened through a new connection" (the ticket is in the file and a new connection reads it); manual restart check (below) (the ticket survives a real dev server restart) |
| AC7.2 | [gitignore.test.ts](../src/db/gitignore.test.ts) "are ignored by git" (`data/dev.db`, `data/e2e.db` and the `-wal` file are ignored and not tracked); manual restart check uses `data/dev.db` (below) |
| AC4.1, AC4.2 | `TicketDetails` shows subject, requester name and email, "No email given", description with line breaks, status, priority and date; `getTicket` returns the ticket or `undefined`; e2e "opens a ticket from the list, shows its details and goes back"; manual check for long words (below) |
| AC4.3 | `TicketDetails` links back to the ticket list; e2e "opens a ticket from the list, shows its details and goes back" |
| AC4.4 | `parseTicketId` accepts plain positive numbers and rejects `0`, `01`, `1e0`, `0x1` and similar; e2e redirect from invalid ids to the list with a message; manual check for `/tickets/01`, `/tickets/1e0`, `/tickets/0x1` (below) |
| AC4.5 | `TicketNotice` shows the message for the known code and nothing for an unknown or missing code; e2e "shows no message for an unknown notice code" |
| AC4.6 | `TicketList` links each subject to `/tickets/[id]`; manual keyboard check (below) |
| AC5.1 (AC-S1, AC-S2) | `StatusForm` offers every status in `ticketStatuses`, starts on the current status and sends the ticket id and new status only on Save; `TicketDetails` has the status form in the "Status and history" section; `changeStatus` saves the new status, revalidates `/tickets` and `/tickets/[id]` and does not redirect; open → closed, closed → in_progress, in_progress → open; e2e "changing the status on the detail page shows it there, in the history and in the list" |
| AC5.2 (AC-S6) | `changeTicketStatus` stores previous status, new status and timestamp; `listStatusChanges` newest first, `id` as tie-break for the same timestamp, only the given ticket, empty for a new ticket; `changeStatus` saves one history entry per change; `TicketDetails` shows the history in the order given as "Open → In progress · Nov 9, 2026" under "Status history", and "No status changes yet." when it is empty; e2e "changing the status on the detail page…"; manual checks "Change the status on the detail page" and "Status still saved after restarting the server" (below) |
| AC5.3 (AC-S3) | `ticketStatusSchema` accepts every status in `ticketStatuses`; rejects "resolved", "" and a missing value with "Invalid status."; `changeStatus` returns "Invalid status." and changes nothing; `StatusForm` shows "Invalid status." next to the dropdown, linked with `aria-describedby` |
| AC-S4 | `changeTicketStatus` returns `not_found` and saves nothing; `changeStatus` redirects to `/tickets?notice=ticket-not-found` for an unknown id, a malformed id ("abc", "0", "01", "") and an unknown id with an invalid status, and changes nothing. The redirect when the ticket disappears between the check and the change has no test |
| AC-S5 | `changeTicketStatus` returns `unchanged`; `changeStatus` gives no error, no revalidation and no history entry for the same status |
| AC-S7 | `TicketList` "shows the status without any control to change it" (no dropdown, button or form) |
| AC6.4 (schema part) | `newNoteSchema` and `newNoteCommentSchema` in `ticketSchema.test.ts`: trimming, empty and whitespace-only, 500 accepted and 501 rejected, inner whitespace kept, length counted in code points, unknown fields stripped. The action and component parts are in the rows below. |
| AC6.1–AC6.3, AC6.5–AC6.7, AC6.9 (data part) | `addNote`, `addNoteComment`, `listNotesWithComments`, `deleteNote` and `deleteNoteComment` in `ticketRepository.test.ts`: notes and comments are saved, same text saved twice, a missing ticket or note returns `undefined`, notes newest first and comments oldest first with id as tie-breaker, a new comment keeps the note order, a comment stays under its own note, `deleteNote` removes the comments too, `deleteNoteComment` removes one comment, a missing or already deleted row returns `false`, a deleted note stays gone and its id is not reused. Not tested: that `deleteNote` is atomic. The action, component and e2e parts are in the rows below. |
| AC6.1, AC6.2, AC6.4, AC6.5, AC6.9 (server action part) | `addNote`, `addNoteComment`, `deleteNote` and `deleteNoteComment` in `actions.test.ts`: saved text is trimmed and the ticket page is revalidated; empty, whitespace-only and 501-character text gives the exact message, keeps the text and saves nothing; a missing or malformed ticket, note or comment id gives the alert message and saves or deletes nothing; the "no longer exists" alert wins over a text error; a missing note or comment revalidates all ticket pages; a successful call clears an earlier alert. Not tested: that `revalidatePath("/tickets/[id]", "page")` works without the `(portal)` group name in the real app (only the call arguments are checked), and the case where a note disappears between the check and the write. The component and e2e parts are in the next rows. |
| AC6.1–AC6.10 (component part) | `InternalNotes.test.tsx` and `TicketDetails.test.tsx`: the "Internal notes" heading, the note form and no empty-state text; note text with date and time in UTC, in the order given; line breaks kept and long words wrapped (class names only, jsdom cannot measure wrapping); HTML shown as text and a URL not a link, for notes and comments; textareas limited to 500 characters; the form sends the ticket or note id and the text; the form is emptied after a save, the button is disabled while saving, errors are shown next to the form that was used with the text kept, other forms keep their text; "Comments (N)" with `aria-expanded`, keyboard use, comments hidden on load and shown only under their own note, open state kept after a save; delete in two steps with "Confirm delete" and "Cancel", the "This also deletes N comments." warning for notes only, several confirm steps at once, the confirm button disabled while deleting; a form error goes away when the comments are closed, when the textarea loses focus or when the handler types, the text is kept, a new failed submit shows the error again, and focus moves to the textarea with the cursor after the text (note form and comment form); the shared alert area (`role="alert"`) shows the "no longer exists" messages, is not cleared by opening or closing comments or by a later form that fails validation, is replaced by a newer message, and is cleared by the next successful add or delete; `TicketDetails` shows the notes after "Status and history". Not tested here: wrapping and the focus and cursor position in a real browser, that the data really changes on the page after a save or delete (the tests re-render with new data), and keyboard focus after the "Delete" button is replaced by "Confirm delete". The e2e part is in the next row. |
| AC6.1–AC6.10 (end-to-end part) | `e2e/notes.spec.ts`: add a note and a comment and reload (comments closed after the reload); a newer note above an older one; the seeded notes and comments in order, with `white-space: pre-wrap` in the browser; delete a comment after a cancel; delete a note with its comment after a cancel, and still gone after a reload; HTML in a note shown as text; no notes in the ticket list (AC6.8); an empty note rejected with the typed spaces kept; a note deleted in another tab shows "This note no longer exists." and the note disappears. Not tested: that the "all pages" revalidate path matches the ticket pages (see the mutation check below), 501 characters (the textarea stops at 500; the schema and action tests cover it) and wrapping of long words. |

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

## Change status (AC5): test cases by type

Detailed rules: [specs/status-change.md](specs/status-change.md). The AC column uses the spec's ids (AC-S1 to AC-S7).

| Type | Behaviour | AC | Test | Expected result |
|---|---|---|---|---|
| Happy path | Change the status on the detail page | S1 | [tickets.spec.ts](../e2e/tickets.spec.ts) "changing the status on the detail page shows it there, in the history and in the list" | New status in the badge, a history row and the new status in the list |
| Happy path | The form offers every status and sends only on Save | S1 | [StatusForm.test.tsx](../src/components/StatusForm.test.tsx) "offers every status, starts on the current one…" | All statuses in `ticketStatuses`, current one selected, ticket id and status sent on Save |
| Happy path | A valid change is saved | S1 | [actions.test.ts](../src/app/%28portal%29/tickets/actions.test.ts) "saves the new status and revalidates the list and the detail page" | No error; status saved; one history entry; `/tickets` and `/tickets/[id]` revalidated; no redirect |
| Happy path | Changes in other directions, including back to an earlier status | S2 | actions.test.ts "changes the status from %s to %s" (open → closed, closed → in_progress, in_progress → open) | The new status is saved |
| Happy path | Each change is stored in the history | S6 | [ticketRepository.test.ts](../src/tickets/ticketRepository.test.ts) "stores the previous status, the new status and a timestamp…", "lists the changes newest first", "lists only the changes of the given ticket" | From, to and timestamp saved; newest first; only that ticket's changes |
| Happy path | The history is shown on the ticket | S6 | [TicketDetails.test.tsx](../src/components/TicketDetails.test.tsx) "shows the status history in the order given, with from, to and date" | "Open → In progress · Nov 9, 2026" under "Status history" |
| Error path | Unknown, empty or missing status | S3 | [ticketSchema.test.ts](../src/tickets/ticketSchema.test.ts) "accepts the status %s" and 'rejects %s with "Invalid status."' | Every status in `ticketStatuses` accepted; "resolved", "" and a missing value give "Invalid status." |
| Error path | Invalid status sent to the server | S3 | actions.test.ts 'returns "Invalid status." for the status %j and changes nothing' | "Invalid status."; status and history unchanged |
| Error path | The error is shown next to the dropdown | S3 | StatusForm.test.tsx "shows Invalid status. next to the dropdown when the action returns it" | Message linked to the dropdown with `aria-describedby` |
| Error path | The ticket does not exist | S4 | actions.test.ts "redirects to the list with a notice and changes nothing when the ticket does not exist"; ticketRepository.test.ts "returns not_found and saves nothing…" | Redirect to `/tickets?notice=ticket-not-found`; nothing saved |
| Edge case | Malformed ticket id | S4 | actions.test.ts "treats the malformed ticket id %j as a missing ticket" ("abc", "0", "01", "") | Same redirect as a missing ticket |
| Edge case | Missing ticket and invalid status at once | S4 | actions.test.ts "redirects for a missing ticket even when the status is also invalid" | The redirect wins over "Invalid status." |
| Edge case | Save the status the ticket already has | S5 | ticketRepository.test.ts "ignores a change to the status the ticket already has"; actions.test.ts "ignores a change to the same status without an error or a revalidation" | `unchanged`; no error, no history entry, no revalidation |
| Edge case | Two changes with the same timestamp | S6 | ticketRepository.test.ts "lists the latest saved change first when two changes have the same timestamp" | The later change first (`id` as tie-break) |
| Edge case | A ticket that has never changed status | S6 | ticketRepository.test.ts "returns an empty history for a new ticket"; TicketDetails.test.tsx "says there are no status changes yet when the history is empty" | Empty history; "No status changes yet." |
| Edge case | The list has no way to change the status | S7 | [TicketList.test.tsx](../src/components/TicketList.test.tsx) "shows the status without any control to change it" | Status shown, no dropdown, button or form |

**Why these test cases.** They follow the risks in the spec: a change that is not saved, a history that is not stored, values the dropdown cannot send but a direct request can, a ticket that is missing, and a Save that changes nothing. Each case runs at the lowest level that can show it. The schema is tested as a unit, saving and history against a real in-memory SQLite database, the server action with mocked `revalidatePath` and `redirect`, and what the handler sees as components. One e2e test covers the whole flow, because the detail page is an async Server Component. The cases were proposed with `/test-cases` for each criterion and chosen by the owner, and the tests were seen failing before the code was written. The tests that passed at once were checked with temporary changes (see "Mutation check, status change" below).

## Mutation check

Green tests only show that code and tests agree. To show that the tests fail for the right reason, `npm run test:mutation` breaks one line of `submitTicket` on purpose, runs the tests, checks that the named tests fail, and restores the file. Add `-- --e2e` to run Playwright as well (one production build per mutation, a few minutes).

| Mutation | Must fail | Vitest | E2E |
|---|---|---|---|
| Saving is disconnected (AC1.1) | "saves a valid ticket…"; e2e "submitting a valid ticket…" | Caught | Caught |
| Category read from a misspelled field (AC1.1, AC1.7) | "returns a category error…"; e2e "submitting a valid ticket…" | Caught | Caught |
| Category not saved, the database default `General` hides it (AC1.7) | "saves a valid ticket…" (expects `Billing`) | Caught | Not run: the list does not show the category |
| redirect inside the try (AC1.8) | "saves the ticket and redirects when the same values are sent again after a failure" | Caught | Not run: AC1.8 has no e2e test |

Vitest run on 2026-11-11, with `git diff` showing `actions.ts` unchanged afterwards. The E2E column is from 2026-11-07, before AC1.8; `-- --e2e` was not run again.

**What the check found.** The first version removed the category line in mutation 2. TypeScript then stopped `npm run build`, so no e2e test ran, and the script wrongly reported "missed". The script now reports ERROR when no tests ran, and mutation 2 uses a misspelled field name that still builds. Running the old mutation again gave "ERROR, the tests did not run" instead of "missed".

Script: [scripts/mutation-check.mjs](../scripts/mutation-check.mjs).

## Mutation check, internal notes (manual)

Done by hand on 2026-11-11 with `npx playwright test e2e/notes.spec.ts`. Each mutation was one temporary edit to a source file. Both files were restored afterwards and were identical before and after (`shasum`). The `npm run test:mutation` script covers only `submitTicket` and was not used.

| Mutation | Should fail | Result |
|---|---|---|
| A: the "all pages" revalidate path in `actions.ts` no longer matches (`/nothing/[id]`) | e2e "note deleted in another tab" | Missed: all 9 passed |
| B: the "Cancel" button of a delete is a submit button | e2e "deletes only the chosen comment, after a cancel" and "deletes a note with its comment…" | Missed: all 9 passed |
| C: the "note is gone" case calls no `revalidatePath` at all | e2e "note deleted in another tab" | Caught: that test failed |
| D: the confirm form sends the wrong id (`id + 100000`) | the two delete tests and the other-tab test | Caught: 3 tests failed |

**What the check found.**
- **A:** with any `revalidatePath` call, even one that matches no page, the page you are viewing still refreshes. The test therefore shows that a revalidate call is needed (mutation C), but not that the pattern `/tickets/[id]` matches the ticket pages without the `(portal)` group name. Whether other already-open ticket tabs refresh is not tested.
- **B:** probably an equivalent mutation. The click handler most likely unmounts the form before the browser submits it, so "Cancel as submit" still deletes nothing. This was not checked. "Cancel removes nothing" is covered by the two delete tests and the component tests.
- **C and D** show that the delete flow and the "note is gone" flow are really checked.
- Not tried: mutations in the repository, the schemas and the add flows. The data and action tests cover them but have no mutation check.

## Mutation check, status change (manual)

Some status tests passed on their first run, or needed to be shown failing for the right reason. Each check was one temporary change that was then removed, and the file was checked to be unchanged afterwards. The `npm run test:mutation` script covers only `submitTicket` and was not used.

| Mutation | Should fail | Result |
|---|---|---|
| `changeTicketStatus` returns `"changed"` instead of `"not_found"` for a missing ticket (AC-S4) | "returns not_found and saves nothing when the ticket does not exist" | Caught. Done 2026-11-09 by Claude Code, approved by Jessica Swahn, who checked the restore in the diff |
| The insert into `ticket_status_changes` is commented out (AC-S6) | Written down before the run: "stores the previous status…", "lists the changes newest first", "lists only the changes of the given ticket", "ignores a change to the status the ticket already has" | Caught: exactly those 4 failed. The tests for the same timestamp, an empty history and a missing ticket passed, as they do not depend on the insert. Done 2026-11-09 by Jessica Swahn; file unchanged afterwards (checked in Fork) |
| A temporary "Change" button in the ticket list (AC-S7) | "shows the status without any control to change it" | Caught. Done 2026-11-10 by Claude Code; `TicketList.tsx` unchanged afterwards |
| The detail page passes an empty history (AC-S1, AC-S6) | e2e "changing the status on the detail page…" | Caught. Done 2026-11-10 by Claude Code; `page.tsx` unchanged afterwards |

## Manual checks

### Data, setup and failures

| Check | Why manual | Status | Result |
|---|---|---|---|
| Existing tickets get the category `General` after `npm run db:migrate` (AC1.7) | Tests migrate an empty database, so they do not show existing rows | Done 2026-11-07 on `data/dev.db` | All 4 existing tickets had `General` |
| A ticket is still there after the dev server restarts (AC7.1) | The test opens a new connection but does not restart a real server | Done 2026-11-10 and again 2026-11-11 after the review fixes, on `data/dev.db` | Ticket "Restart check 2026-11-10" (and on 2026-11-11 "Restart check 2026-11-11", id 7) saved with `createTicket`, shown on `/tickets`; dev server stopped and started with `npm run dev`; ticket still shown on `/tickets` and on its details page |
| The persistence test fails when tickets are not kept in the file (AC7.1) | The test passed on its first run because persistence already worked, so it was never seen failing | Done 2026-11-10 (Ariadna Villar, with an AI agent) | `createDb` in `src/db/client.ts` changed by hand to always use `:memory:`: the test failed with "no such table: tickets" on the new connection. File restored and identical (`shasum`) |
| The persistence test cleans up its temporary database on Windows (AC7.1) | macOS and Linux can delete a file that is still open, so the error only shows on Windows, and CI runs on `ubuntu-latest` only | Done 2026-11-11 on Windows by Jessica Swahn | **Fails in the cleanup:** the test passes, but deleting the temporary folder in `afterEach` throws EPERM, even though each client is closed first. Fix applied 2026-11-13: `rmSync` retries up to 5 times, waiting 100 ms longer each time (about 1.5 s in total at most). Waiting for a Windows run of the fix. Listed in [limitations.md](limitations.md) |
| The gitignore test fails when database files are not ignored (AC7.2) | The test passed on its first run because the rule already existed, so it was never seen failing | Done 2026-11-11 (Ariadna Villar, with an AI agent) | `/data/*.db` removed from `.gitignore` by hand: the `data/dev.db` and `data/e2e.db` cases failed (`git check-ignore` exited with an error), the `-wal` case still passed because `/data/*.db-*` covers it. File restored and identical (`shasum`) |
| The run and demo guide works on macOS from a fresh ZIP download ([decision 10](decisions/10-run-and-demo-instructions.md)) | Following the guide checks the instructions themselves, which CI does not | Done 2026-11-12 (with an AI agent) | [docs/demo.md](demo.md) Parts 2–7, "Next time" and "start over" followed with Node.js 24.21.0 and 26.13.1; every "You should see" matched, including the status change in step 4 |
| The run and demo guide works on Windows from a fresh ZIP download ([decision 10](decisions/10-run-and-demo-instructions.md)) | The Windows steps (PowerShell, security window, `Terminate batch job`) cannot be checked on macOS, and CI does not run Windows | Done 2026-11-13 by Jessica Swahn on Windows with Node.js 24.22.2 | Parts 2–7 followed. Part 3 did not work as written: typing `powershell` in the File Explorer address bar did nothing; right-click in the folder and **Open in Terminal** worked. `npm install` gave warnings, as the guide says. `db:reset` printed the same lines as the guide. No security window was shown, and Control + C stopped the app without `Terminate batch job`. Every step in Part 6 matched. Afterwards, Part 3 in [docs/demo.md](demo.md) was changed to **Open in Terminal**, with a line to follow only the steps for your own computer; the changed step has not been followed again on Windows |
| Error messages for registering a ticket are understandable | Judging clarity needs a person | Done 2026-11-07 by Alexandra Petersson with `npm run dev` | Invalid email (`Alex@hej`) and an empty category, with the other fields valid and priority `low`: both errors shown next to their fields, the other fields accepted. After correcting the email (`alec@hej.se`) and the category the ticket was saved. The messages were judged clear. Not judged by hand: an empty form, a name with only spaces and a too-short subject (covered by automated tests) |
| A valid ticket cannot be saved because the database is read-only (AC1.8) | The e2e tests share one database, and the server must be restarted around the change ([decision 07](decisions/07-save-failure-handling.md)) | Done 2026-11-11 by Alexandra Petersson in Firefox on macOS with `npm run dev`, `chmod 444` and `chmod 644` on `data/dev.db` | The message was shown in red directly above **Register ticket**. The page stayed on `/tickets/new`, all values were kept, no field was marked invalid and focus did not move to the message. VoiceOver announced the message, hid it while the next attempt was pending and announced it again when that attempt also failed. The server logged `Failed to save ticket { name: 'Error', cause: 'LibsqlError', code: 'SQLITE_READONLY' }` without the entered values. After `chmod 644` and a restart the ticket was saved and the list was shown. On 2026-11-11 Jessica Swahn did the same steps on Windows with `attrib +R` and `attrib -R`, with the same result (without a screen reader). Screenshots: [browser](images/ac1-8-save-failure-browser.png), [terminal](images/ac1-8-save-failure-terminal.png), [browser on Windows](images/ac1-8-save-failure-browser-windows.png), [terminal on Windows](images/ac1-8-save-failure-terminal-windows.png). Full report: [ac1-8-manual-check.md](test-reports/ac1-8-manual-check.md) |

### In the browser

Automated tests cannot see layout or real browser behaviour. These checks are done by hand in Chrome with `npm run dev` and fresh seed data.

| Check | Criterion | Expected | Last result |
|---|---|---|---|
| Long URL without spaces in the description | AC4.2 | Text wraps inside the box, no horizontal scroll | Failed on 2026-11-08 (Alexandra), fixed on 2026-11-09, passed on re-check 2026-11-10 (Alexandra) |
| `/tickets/01`, `/tickets/1e0`, `/tickets/0x1` | AC4.4 | Redirect to the list with the message | Failed on 2026-11-08 (Alexandra), fixed on 2026-11-09, passed on re-check 2026-11-10 (Alexandra) |
| `?notice=hej`, `?notice=`, `?notice=<b>x</b>`, `?notice=toString` | AC4.5 | No message, no tags rendered | Passed (Alexandra, 2026-11-08) |
| Keyboard only: list, ticket, Back to tickets | AC4.6, AC3.2 | All reachable, focus visible | Passed (Alexandra, 2026-11-08) |
| Screen reader | All | Pages are announced in a sensible order | Not done for whole pages. Only the AC1.8 save error message was checked with VoiceOver (see above) |
| Change the status on the detail page | AC-S1 | After choosing a new status and clicking Save, the status badge, the history and the ticket list all show the new status | Passed (Jessica, 2026-11-10) |
| Status still saved after restarting the server | AC-S6 | After stopping and starting `npm run dev`, the ticket list and the detail page still show the changed status, and the history row is still there | Passed (Jessica, 2026-11-10): the ticket changed before still had the new status in the list, and its detail page still showed the history row |

## Latest run results

Run on 2026-11-11 on branch `jessica/status-change-backend`, after the review fixes for PR #13.

| Command | Result |
|---|---|
| `npm test` | 11 files, 109 tests passed |
| `npm run lint` | No errors |
| `npm run typecheck` | No errors |
| `npm run test:e2e` | 18 tests passed |
| `npm run test:mutation -- --e2e` | Not rerun. Last run 2026-11-09: 5 of 5 caught (3 Vitest, 2 e2e) |

`npm run test:mutation -- --e2e` was not run on 2026-11-11. The mutation check for the notes is the manual one above.

Update this table when you rerun the checks.

## Limitations of the verification

- "Still there after a restart" (AC-S6) is a manual check only.
- "Invalid status." on the detail page is tested at component level only. The dropdown cannot send an unknown value, so e2e cannot reach it.
- Two status tests passed on their first run, because the code already existed: the AC-S7 list test and the e2e test for AC-S1. They were seen failing with temporary changes (see "Mutation check, status change").
- The history shows the date only, so the e2e test checks the date format, not the exact date.
- End-to-end tests cover Chrome only.
- No accessibility audit beyond the keyboard navigation test and labelled form fields. The only screen reader test is the VoiceOver check of the save error message (AC1.8).
- e2e tests share one seeded database, so they depend on the seed data order.
- The AC1 tests added after the code (blank fields, limits, email, priority, `maxlength`, missing name) passed on their first run, because the behaviour already existed. They were not seen failing first; the mutation check covers `submitTicket` only.
- The ticket list does not show the category, so e2e cannot show that it is saved. The action test covers it, and mutation 3 shows that the test catches it.
- The mutation check tries four hand-picked mutations in `submitTicket`, not every possible fault.
- The persistence test failed on Windows in its cleanup: deleting its temporary folder threw EPERM. A retry is now applied but not yet run on Windows. The test passes on macOS and in CI on Linux, so a Windows-only cleanup problem is not caught automatically.
- The schema, data, action and component tests for the notes were seen failing before the code existed, except one component test (the count after a comment is deleted), which passed before the code because it only re-renders. The e2e tests in `e2e/notes.spec.ts` were written after the code and passed on their first run. The manual mutation check found that the revalidate pattern for other open tabs is not tested.
- No manual check of the look of the notes section (button styles, spacing) was done by a second person.
