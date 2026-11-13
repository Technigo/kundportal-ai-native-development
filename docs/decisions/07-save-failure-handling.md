# 07: Handling a failed save when registering a ticket

- **Status:** Accepted
- **Date:** 2026-11-10
- **Deciders:** Alexandra Petersson (owner of AC1), reviewed by Jessica Swahn

## Context

AC1.8 in [project-brief.md](../project-brief.md) adds a clear message when a valid ticket cannot be saved to the database. Today `submitTicket` catches no errors, so Next.js shows its default error page and the handler loses everything they typed. The details are in the [save-failure-message spec](../specs/save-failure-message.md). Three choices affect the architecture and the testing: where the error lives in the form state, what is logged, and how the behaviour is verified.

## Decision

1. **A form-level error in the action state.** `SubmitTicketState` gets an optional `formError?: string` next to the field errors. `submitTicket` catches errors from `getDb()` and `createTicket` only, and returns `formError` with the entered values. `redirect` and `revalidatePath` stay outside the `try`. `TicketForm` shows `formError` with `role="alert"` above the button, and only when no attempt is pending.
2. **The log has no personal data.** The error is logged as `console.error("Failed to save ticket", { name, cause, code })`, where `cause` is `error.cause.name` and `code` is `error.cause.code`. The error message is not logged, because Drizzle's `DrizzleQueryError` message contains the SQL parameters, that is, what the handler typed.
3. **Verified with Vitest, a mutation and a manual check, not with e2e.** The action tests use an unmigrated `:memory:` database for a real `DrizzleQueryError`, and spies for the other cases. A mutation moves `redirect` inside the `try`. The manual check makes the database file read-only.

## Alternatives considered

- **A Next.js `error.tsx` boundary for the route:** shows a nicer page than the default, but the handler still leaves the form and loses the entered values.
- **Log the whole error:** easiest to debug, but names and email addresses would end up in the server log.
- **No logging:** no personal data, but a failed save would leave no trace for developers.
- **An e2e test with a flag that makes saving fail:** gives a browser test, but puts test-only code in the production path. Making `data/e2e.db` read-only instead would break the other e2e tests, which share the database, and would need a server restart during the run.

## Consequences

- Other forms can reuse `formError` for errors that are not tied to a field.
- The log shows the kind of error (for example `LibsqlError` and `SQLITE_READONLY`) but not the SQL or the values. Some errors may be harder to debug.
- There is no automated browser test for AC1.8. The visible result (red text, announcement, focus) depends on the manual check in [verification.md](../verification.md).
- The manual check differs between macOS/Linux (`chmod`) and Windows (`attrib`).
