# Plan: Internal notes (AC6.1–AC6.10)

Owner: Marie Flem Honningdalnes · Reviewer: Alexandra Petersson
Decision: [09-internal-notes.md](../decisions/09-internal-notes.md)
Based on section 6 of [project-brief.md](../project-brief.md).

## Starting point (2026-11-09, before the work)

This describes the code before the work started. Implemented on 2026-11-11; the tests and results are in [verification.md](../verification.md).

- `src/db/schema.ts` has only the `tickets` table. There is no table for notes or comments, and no foreign keys yet.
- `src/db/client.ts` does not turn on SQLite foreign-key enforcement (`PRAGMA foreign_keys`), so `onDelete: "cascade"` alone does not remove comments.
- `src/components/TicketDetails.tsx` shows the ticket and has an empty `<section aria-label="Status and history" />` reserved for the status work.
- `TicketDetails` formats dates with `dateStyle: "medium"`, UTC, which shows no time. Notes need date and time (AC6.1, AC6.2).
- `parseTicketId` accepts only plain positive decimal numbers (AC4.4).
- There is no sign-in, so the system does not know who the case handler is (project-brief.md, Out of scope).

## Decisions made by the owners (2026-11-09)

| Question | Decision | Reason |
|---|---|---|
| Who sees notes? | Case handlers only, on the detail page. Never the requester. | Notes are internal. |
| Author? | Not stored or shown. | No one is signed in. |
| What does "open for comments" mean? | Handlers can reply with comments under a note. | Owners' choice. |
| Can notes and comments be edited? | No. | Owners' choice. |
| How does deleting work? | Hard delete after a two-step button ("Delete", then "Confirm delete", with "Cancel"). Deleting a note also deletes its comments. A single comment can be deleted the same way. | Simple, and nothing hidden stays in the database. It cannot be undone. |
| Does the note confirm step warn about comments? | Yes. A note with one comment shows "This also deletes 1 comment."; with two or more it shows "This also deletes N comments." A note without comments shows no extra text. | Hard delete cannot be undone, and the comments may be written by others. |
| Maximum length? | 500 characters for a note and for a comment, counted in code points, because zod `.max` counts them that way (an emoji counts as 1; checked in `ticketSchema.test.ts`). The textarea `maxLength` counts UTF-16 code units, so the browser stops at 250 emoji while the server accepts 500. | Consistent with the ticket schemas. The server never rejects what the browser allows. |
| What is stored after trimming? | Only the start and end are trimmed. The inside is stored as typed (blank lines, repeated spaces, `\r\n`). | Same as the ticket description. |
| HTML or script in a note? | Stored raw and shown as plain text. No HTML, no Markdown, no clickable links, no `dangerouslySetInnerHTML`. | React escapes text, and stripping would change what the handler typed. |
| Malformed ticket or note id? | Handled like a missing one, using the strict parsing of `parseTicketId`. | The handler cannot tell the cases apart, and the code is reused. |
| Invalid text and missing parent at once? | The "no longer exists" message wins. | Same rule as `status-change.md`. |
| Does a comment move its note? | No. Notes are sorted only by their own created time. | Simpler, and the order does not jump around. |
| Double click or identical text? | The add button is disabled while saving. Identical texts are allowed and there is no duplicate check. | A text-based check would block legitimate notes. |
| After a successful save? | The form that was used is emptied and its error is cleared. Other forms keep what was typed. | Keeping the text would invite duplicates. |
| Comments in the UI? | Each note shows a button "Comments (N)", also for 0 and 1. The comments and the comment form are hidden until it is clicked. It is closed on every page load and stays open for the rest of the visit. | Keeps the page short. The open state lives in the browser only. |
| Several confirm steps at once? | Allowed. Each delete control keeps its own state. | No shared state, simpler code. |
| Where are "no longer exists" messages shown? | In one alert area (`role="alert"`) at the top of the "Internal notes" section. Validation errors stay next to their own form. | The affected item may be gone, so there is nothing to put the message next to. |
| When does a form error message go away? | When the handler closes the comments, leaves the textarea (it loses focus) or starts typing. The typed text is kept. A new failed submit shows the message again. After an error, focus moves to the textarea with the cursor after the text. Applies to the note form and the comment forms. The alert area is not affected. | The message should not stay next to text that is no longer being fixed. Focus on the field is needed so that "leaves the textarea" can happen, and it announces the error to screen reader users. (2026-11-11) |
| Dates | Date and time in UTC, for example "Nov 9, 2026, 2:30 PM". | Notes need the time to be read as a thread. |
| Empty state | No text. A ticket without notes shows only the heading and the note form. | Owners' choice. |
| Note count in the ticket list | None. | Owners' choice. |
| Foreign-key enforcement | `client.ts` is not changed. `deleteNote` deletes the comments and then the note in one transaction, and the add functions check that the parent exists. Foreign keys are still declared in `schema.ts`. | Keeps the feature inside its own files. Turning on the pragma would be a separate decision. |

## Messages

| Case | Message |
|---|---|
| Empty note | Please write a note. |
| Empty comment | Please write a comment. |
| Note over 500 characters | Note must be at most 500 characters. |
| Comment over 500 characters | Comment must be at most 500 characters. |
| Note delete confirm, 1 comment | This also deletes 1 comment. |
| Ticket missing or id malformed | This ticket no longer exists. Go back to the ticket list. |
| Note missing or id malformed | This note no longer exists. |
| Comment missing or id malformed | This comment no longer exists. |

## Interaction with the status-change work (Jessica)

- As of 2026-11-09 only the status-change spec and decision 04 are merged (PR #6). The `ticket_status_changes` table and the status code do not exist yet, and no branch has them.
- Both features add a table to `src/db/schema.ts`. Whichever branch is merged second must generate its migration after the first, so the migrations in `drizzle/` do not conflict.
- Both add functions to `ticketRepository.ts` and `tickets/actions.ts`, and a section to `TicketDetails.tsx`. The notes section goes after the "Status and history" section, which is not changed.

## Specification

- AC6.1: Given a ticket, when the handler writes a note in the note form on `/tickets/[id]` and clicks "Add note", then the note is saved and shown with its text (line breaks kept, long words wrapped) and its created date and time in UTC, for example "Nov 9, 2026, 2:30 PM". The note form is then empty. While the request runs, the button is disabled. Two notes with the same text are both saved.
- AC6.2: Each note shows a button "Comments (N)", where N is its number of comments (also "Comments (0)" and "Comments (1)"). The comments and the comment form are hidden when the page loads. Clicking the button shows them and hides them again. The button has `aria-expanded` and can be used with the keyboard. Given an open note, when the handler writes a comment and clicks "Add comment", then the comment is saved and shown under that note and under no other note, with its text and its created date and time. The comment form is then empty, the count goes up by one, and the section stays open. While the request runs, the button is disabled.
- AC6.3: Notes are sorted newest first. Comments under a note are sorted oldest first. Ties on the timestamp are broken by id: notes by id descending, comments by id ascending. A new comment does not change the order of the notes. Notes and comments are still shown after the application restarts.
- AC6.4: Note and comment text is trimmed (start and end only) and validated on the server. Text that is empty or only whitespace is rejected. Text longer than 500 characters is rejected; exactly 500 is accepted. Given invalid text, nothing is saved, the matching message from the table above is shown next to the form that was used, and the entered text is kept. The message goes away when the handler closes the comments, leaves the textarea or starts typing (the text is kept), and a new failed submit shows it again. The textareas have `maxLength={500}` like `TicketForm`, so 501 characters is tested only in the schema and server action tests, not in component or e2e tests.
- AC6.5: Given a ticket id that does not exist or is not a plain positive number, when a note is sent for it, then nothing is saved and "This ticket no longer exists. Go back to the ticket list." is shown in the alert area. Given a note id that does not exist or is malformed, when a comment is sent for it, then nothing is saved and "This note no longer exists." is shown in the alert area. Either "no longer exists" message wins over a text error. The page then shows the current database state plus the message. Typed text stays in a form that still exists; a form that belonged to a deleted note is gone with it.
- AC6.6: Given a note, when the handler clicks "Delete" on it, then "Confirm delete" and "Cancel" appear and nothing is removed yet. If the note has comments, the text "This also deletes 1 comment." (one comment) or "This also deletes N comments." (two or more) is shown too. When the handler clicks "Confirm delete", the note and all its comments are removed from the database and the page. When the handler clicks "Cancel", nothing is removed and the single "Delete" button is shown again. A deleted note does not come back after a restart.
- AC6.7: Given a note with two comments, when the handler clicks "Delete" and then "Confirm delete" on one comment, then only that comment is removed, the count goes down by one, and the note and the other comment stay. "Cancel" removes nothing.
- AC6.8: Notes and comments are shown only on the ticket detail page, in a section with the heading "Internal notes". A ticket with no notes shows only the heading and the note form, with no empty-state text. The ticket list shows no note or comment text and no note count. No author field is stored or shown.
- AC6.9: Given a note or comment that was already deleted (for example in another tab) or a malformed id, when the handler confirms its deletion, then nothing is deleted and "This note no longer exists." or "This comment no longer exists." is shown in the alert area. The page then shows the current database state plus the message. The alert area is cleared by the next successful add or delete. Opening or closing "Comments (N)" does not clear it. A reload does.
- AC6.10: Note and comment text is shown as plain text. Given a note containing `<b>x</b>` or `<script>alert(1)</script>`, the tags are shown literally and nothing is rendered or run as HTML. A URL in a note is not a link.

## Steps (test-first, following `ticket-change`)

Each criterion first goes through `test-cases`, and the owners pick the cases. Each step starts with a failing test, then the minimal code. Each step is approved separately.

1. **Schema (zod):** `newNoteSchema` (ticket id and text) and `newNoteCommentSchema` (note id and text) in `src/tickets/ticketSchema.ts`, using the messages above. Unit tests in `ticketSchema.test.ts` for AC6.4, including 500 accepted, 501 rejected, whitespace-only and inner blank lines kept.
2. **Tables:** the agent proposes the change to `src/db/schema.ts`. The owner makes it and runs `npm run db:generate`.
   - `ticket_notes`: `id`, `ticket_id` referencing `tickets.id`, `body`, `created_at` using the `createdAt()` helper. Index on (`ticket_id`, `created_at`).
   - `ticket_note_comments`: `id`, `note_id` referencing `ticket_notes.id`, `body`, `created_at`. Index on (`note_id`, `created_at`).
   - The agent does not edit `drizzle/`. `client.ts` is not changed.
3. **Repository:** add to `ticketRepository.ts`, with data tests in `ticketRepository.test.ts` against the in-memory database (AC6.1–AC6.3, AC6.5–AC6.7, AC6.9):
   - `addNote` and `addNoteComment` return `undefined` when the parent does not exist.
   - `listNotesWithComments` returns notes and comments in the AC6.3 order, and a new comment does not change the note order.
   - `deleteNote` removes the comments and the note in one transaction.
   - `deleteNoteComment` removes one comment.
   - Both delete functions report whether anything was deleted, so the action can show the AC6.9 message.
4. **Server actions:** `addNote`, `addNoteComment`, `deleteNote` and `deleteNoteComment` in `src/app/(portal)/tickets/actions.ts`. They follow the `submitTicket` pattern, parse ids with the strict rule of `parseTicketId`, check the parent before the text, and revalidate the ticket page (see the next bullet). Server action tests in `actions.test.ts` (AC6.4, AC6.5, AC6.9).
   - `addNoteComment`, `deleteNote` and `deleteNoteComment` take no ticket id from the form. They look up the ticket id through the note (or comment) in the database and revalidate that ticket's page. `addNote` takes the ticket id from the form because the ticket is its parent. If the note or comment no longer exists, there is no ticket id to look up. Then the action revalidates all ticket pages with `revalidatePath("/tickets/[id]", "page")`, so the page shows the current database state with the message (AC6.5, AC6.9). The route is in the `(portal)` group, so step 4 checks in a test whether the pattern needs the group name.
5. **Components:**
   - The notes section (the `InternalNotes` component, passed to `TicketDetails` as `children` and shown after "Status and history") shows the alert area, the note form and the list, with the date-and-time format and no empty-state text. Text uses the `whitespace-pre-wrap wrap-break-word` style and is never rendered as HTML.
   - New client components: the note form, a note item with the "Comments (N)" toggle and the comment form, and the two-step delete control. They use `useActionState`, disable the button while saving, and empty the form after a success. The alert state is lifted to a shared client parent, because four actions write to one alert area.
   - React Testing Library tests for AC6.1, AC6.2, AC6.4 and AC6.6–AC6.10.
   - The delete buttons have `aria-label` "Delete note" and "Delete comment". Tests scope them by note.
   - Wrapping is tested in the component test by checking the class names `whitespace-pre-wrap wrap-break-word`, because jsdom cannot measure wrapping. No e2e test.
   - Read `node_modules/next/dist/docs/` first.
6. **Route:** `src/app/(portal)/tickets/[id]/page.tsx` loads the notes and passes them to `TicketDetails`.
7. **Seed data:** add a few fake notes and comments to `src/db/seed.mts`. Check that the existing e2e tests still pass.
8. **End-to-end (Playwright):**
   - Add a note, open "Comments (0)", add a comment, then reload and see both with the comments closed (AC6.1–AC6.3).
   - Delete a comment, then delete a note with comments, cancelling once first (AC6.6, AC6.7).
   - A note with `<b>x</b>` is shown literally (AC6.10).
   - The ticket list shows no notes (AC6.8).
   - AC6.9 is covered at data, server action and component level; an e2e case needs two tabs and is optional.
9. **Documentation:**
   - Set section 6 in `project-brief.md` to Done.
   - Update the mapping and run results in `verification.md`.
   - In `limitations.md`, note that there is no author and that deleted notes cannot be restored.
   - Write decision `08`, and update `docs/status/week-N.md`.

## Not in this plan

- Editing notes or comments.
- Comments on comments (nested replies).
- Showing who wrote a note.
- Notes in the ticket list, search or export.
- Sorting notes by their latest comment.
- Turning on SQLite foreign-key enforcement for the whole app.
- Status change and history (Jessica, see [status-change.md](status-change.md)).

## Open questions

None. All questions were answered on 2026-11-09 and are in the decisions table above.

Assumed without asking:

- Tickets cannot be deleted, so a note never loses its ticket.
- For an unknown ticket id the detail page still redirects as in AC4.4, so the notes section never renders there.

## Risks and open points

- Migration conflicts in `drizzle/` with the status work. The table does not exist yet, so the order is decided when both branches are ready.
- Hard delete cannot be undone. The two-step button is the only protection against a misclick. The count in the "This also deletes ..." text can be out of date if a colleague adds a comment after the page loaded.
- Merge conflicts in `TicketDetails.tsx`, `actions.ts`, `ticketRepository.ts` and `project-brief.md` with the status work.
- New seed data can change the row order that `e2e/tickets.spec.ts` depends on.
- Notes cannot be edited and deleting a note also deletes its comments. A handler who makes a typo in a note can only fix it by deleting the note, which removes every comment under it (if there are any). The owners accepted this on 2026-11-09. Options if it becomes a problem: allow editing a note's text, or block deleting a note that still has comments.
- With the comments closed on every load, a handler must open each note to read its comments.
