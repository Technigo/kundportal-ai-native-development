# Known limitations, risks and next steps

## Limitations

- No status change yet. Tickets always stay `open`.
- No status history is stored.
- The status history does not record who made a change, because there is no sign-in.
- No email is sent to the requester.
- Data is stored in a local SQLite file. The app is meant to run locally only.
- End-to-end tests run in Chrome only.
- The persistence test (`src/db/persistence.test.ts`) has not been run on Windows. Windows cannot delete a file that is still open (EBUSY), so the test closes each database client before it deletes its temporary folder. This fix is untested on Windows: it has only run on macOS and in CI on Linux.
- No pagination: the ticket list loads every ticket.
- The category is only entered in the New ticket form. It is not shown in the ticket list or on the ticket details page yet.
- If saving a ticket fails in the database, the handler sees the default error page instead of a clear message.
- If the local database has not been set up (no `data/dev.db`, or an empty file with no tables), the Tickets page shows the default error page with `Failed query: select ... from "tickets"` instead of a message saying how to set it up. The fix is in the README under "Troubleshooting".
- Notes and comments cannot be edited. A typo is fixed by deleting the note (and its comments) and writing it again.
- Notes and comments have no author, because there is no sign-in.
- A deleted note or comment cannot be restored.
- The "This also deletes N comments." warning can be out of date if someone adds a comment after the page loaded.
- Foreign keys are not enforced in the database. The code checks that a note or ticket exists before it saves a note or comment.
- After the "note is gone" case, the actions refresh all ticket pages. Whether other open tabs on other tickets also refresh is not tested.
- Keyboard focus is lost when the "Delete" button is replaced by "Confirm delete".
- Text typed in a comment form and not sent is lost when the comments are closed. After a failed send, only the text from that send comes back.
- A form error message is hidden as soon as the textarea loses focus. With the mouse, the submit button can move up before the mouse is released (tested by hand, accepted). Switching to another window also hides the message, and a slow error that arrives after the comments were closed still shows when they are opened again. A slow error can also move focus back to the form that sent it.

## Risks

| Risk | Effect | Mitigation |
|---|---|---|
| No authentication | Any user can read all tickets if the app is exposed | Keep it local and fake-data only until sign-in exists |
| Real customer data entered by mistake | Privacy breach | Fake data only is a team rule; seeds use invented names |
| Next.js 16 differs from AI training data | Agents suggest outdated APIs | CLAUDE.md requires reading `node_modules/next/dist/docs/` first |
| AI-generated code merged without review | Bugs, security issues | Owners review every diff and make every commit; see [ai/README.md](ai/README.md) |
| e2e tests depend on seed data | Flaky or wrong failures after seed changes | Reset `data/e2e.db` before each run (already done by `npm run test:e2e`) |
| Hard delete of notes | A misclick on "Confirm delete" loses the note and its comments for good | Two-step button with a warning; see [decision 08](decisions/08-internal-notes.md) |

## Proposed further development


1. Status change with a stored history table.
2. Sign-in and roles (handler, admin).
3. Customer view of their own tickets.
4. Email notification on status change.
5. Pagination, search and filters in the list.
6. A CI pipeline for lint, typecheck and tests.
7. A clear message to the handler when a ticket cannot be saved.
8. Show the category in the ticket list and on the ticket details page.
9. Edit notes and comments, and show the author once sign-in exists.
10. Soft delete or undo for notes.
