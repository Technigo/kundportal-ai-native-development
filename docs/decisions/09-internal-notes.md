# 09: Internal notes and comments

- **Status:** Accepted
- **Date:** 2026-11-11
- **Deciders:** Marie Flem Honningdalnes (owner of AC6), reviewed by Alexandra Petersson

## Context

Case handlers need to write internal notes on a ticket and reply to them with comments (AC6.1–AC6.10 in [project-brief.md](../project-brief.md)). The questions and answers are in the decisions table of the [internal-notes spec](../specs/internal-notes.md). This file records the choices that are hardest to change later.

## Decision

1. **Two tables, `ticket_notes` and `ticket_note_comments`.** A comment belongs to a note, and comments have no comments of their own.
2. **Delete is a hard delete.** Deleting a note deletes its comments. Nothing is hidden in the database and nothing can be restored. A two-step button ("Delete", then "Confirm delete" or "Cancel") is the only protection, and a note with comments says how many comments the delete also removes.
3. **No edit.** To fix a typo, the handler deletes the note (and its comments) and writes it again.
4. **No author.** Nobody is signed in, so the system does not know who wrote a note.
5. **Foreign keys are declared but not enforced.** `client.ts` does not turn on `PRAGMA foreign_keys`. `deleteNote` removes the comments and the note in one transaction, and the add functions check that the parent exists. Turning the pragma on would affect the whole app and is a separate decision.
6. **Text is plain text, 1–500 characters after trimming at both ends.** It is stored as typed and shown by React as text, never as HTML. Length is counted in code points, as zod does.
7. **Notes are sorted newest first, comments oldest first, ties by id.** A new comment does not move its note.
8. **The page shows one alert area for "no longer exists" messages.** When a note or comment is gone, the actions refresh all ticket pages, so the page shows the current state.

## Alternatives considered

- **Soft delete (a `deleted_at` column):** allows undo, but hidden rows stay in the database and every query must filter them.
- **Edit with history:** more useful, but needs an edit flow, a history table and more tests.
- **Turn on foreign-key enforcement with `ON DELETE CASCADE`:** the database would remove comments itself, but it changes behaviour for the whole app and belongs in its own decision.
- **One flat comment list per ticket:** simpler, but the owners wanted replies under a note.

## Consequences

- A misclick on "Confirm delete" loses the note and its comments for good.
- The "This also deletes N comments." count can be out of date if a colleague adds a comment after the page loaded.
- A typo in a note can only be fixed by deleting it, which also removes its comments.
- Without enforced foreign keys, the database itself does not stop a comment without a note. Only the code does.
- When sign-in exists, an author column and an edit flow can be added in a new decision.
