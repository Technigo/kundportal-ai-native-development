# Clear message when a ticket cannot be saved (AC1.8)

Owner: Alexandra Petersson · Reviewer: Jessica Swahn
Covers the requirement "Handle at least one invalid use case with a clear message to the user" in [team.md](../team.md). Today Next.js shows its default error page when saving to the database fails (see [limitations.md](../limitations.md)). Decision: [07](../decisions/07-save-failure-handling.md).

## Current state

- `submitTicket` in `src/app/(portal)/tickets/actions.ts` validates the form with `newTicketSchema`. If the input is valid, it calls `createTicket(getDb(), parsed.data)` and then `revalidatePath("/tickets")` and `redirect("/tickets")`.
- No error is caught around `getDb()` or `createTicket`. If the database throws an error, Next.js shows its default error page, and everything the handler typed is lost.
- `SubmitTicketState` only has `errors` per field and `values`. There is no place for an error that applies to the whole form.
- `TicketForm` (`src/components/TicketForm.tsx`) only shows field errors, below each field.
- Drizzle 0.45 rejects with `DrizzleQueryError` and the message `Failed query: <sql> params: <values>`. The error message therefore contains what the handler typed, for example the name and email. The underlying libSQL error is in `error.cause`, and its code (for example `SQLITE_READONLY`) is in `error.cause.code`. `DrizzleQueryError` does not set its own `name`, so `error.name` is `"Error"`, while `error.cause.name` is `"LibsqlError"`. Checked on 2026-11-10 with an insert into a read-only copy of the database (`SQLITE_READONLY`) and into an unmigrated `:memory:` database (`SQLITE_ERROR`).
- `getDb()` keeps one open connection for as long as the server runs (`src/db/client.ts`). If the database directory is missing, `createClient` throws a plain `Error` without `cause`. If only the file is missing, libSQL creates an empty file, and the insert fails with `SQLITE_ERROR` ("no such table").
- `useActionState` keeps the previous state while a new attempt is pending. The form has `key={JSON.stringify(values)}`, so two identical failed attempts in a row give the same `key`, and the form is not remounted.

## Specification

**What the handler does:** fills in a valid form on `/tickets/new` and clicks **Register ticket**. If the ticket cannot be saved to the database, the handler stays on `/tickets/new`. A message is shown above the button, and everything the handler typed is kept. The handler can click **Register ticket** again to try once more.

### Message

| Case | Message | Where |
|---|---|---|
| The ticket could not be saved to the database | Could not save the ticket to the database. Please try again. | Above the **Register ticket** button |

### Rules

Each rule has an id (R1–R12). The [Verification](#verification) table shows which test or check covers each rule.

- **R1:** Applies only when the input is valid. If a field is invalid, the field errors are shown as today (AC1.4), and the database is not called.
- **R2:** Any value thrown by `getDb()` or `createTicket` counts as a failed save, also a value that is not an `Error`. Examples are a locked or read-only database file (`SQLITE_BUSY`, `SQLITE_READONLY`), a database file without tables (`SQLITE_ERROR`) and a missing database directory (`getDb()` throws).
- **R3:** `redirect("/tickets")` and `revalidatePath` are outside the error handling. `redirect` works by throwing its own error, and that error must not be caught and shown as a database error.
- **R4:** The handler is not redirected. The page is still `/tickets/new`, and the Next.js default error page is not shown.
- **R5:** All entered values are kept, including email and priority, in the same way as for field errors.
- **R6:** No field is marked with `aria-invalid`, because the error is not caused by a field.
- **R7:** The message has `role="alert"`, so screen readers announce it. It uses the same red text colour as the field errors (`text-red-700`). The colour is checked in the manual check, not in T7.
- **R8:** The message is inside the form and comes before the **Register ticket** button in DOM order.
- **R9:** Focus is not moved to the message. The message is announced through `role="alert"`.
- **R10:** The button returns to **Register ticket** and is enabled again when the response has arrived.
- **R11:** The message is shown only when no attempt is pending (`!pending && state?.formError`). On the next attempt it disappears as soon as the button is clicked. If saving succeeds, the handler is sent to the ticket list. If it fails again, the message is shown again and is announced again, because the element is added anew. If the input is now invalid, only the field errors are shown.
- **R12:** The server logs the error with exactly `console.error("Failed to save ticket", { name, cause, code })`:
  - `name` is `error.name` if the thrown value is an `Error`, otherwise `typeof error`. For Drizzle errors it is `"Error"`.
  - `cause` is `error.cause.name` if `error.cause` is an `Error` (for example `"LibsqlError"`), otherwise `undefined`.
  - `code` is `error.cause.code` if it is a non-empty string (for example `"SQLITE_READONLY"`), otherwise `undefined`.
  - The values are read with optional chaining, so that reading them can never throw a new error inside `catch`.
  - The log does not contain the error message or the form values, because Drizzle's message contains the values (see [Current state](#current-state)).

### Proposed solution

- Add an optional field for errors that apply to the whole form to `SubmitTicketState`, for example `formError?: string`.
- In `submitTicket`: put `getDb()` and `createTicket` in a `try`. In `catch`, log `console.error("Failed to save ticket", { name, cause, code })` as the rules say and return `{ errors: {}, values, formError: "Could not save the ticket to the database. Please try again." }`.
- In `TicketForm`: when `!pending && state?.formError`, show `state.formError` in an element with `role="alert"` directly before the button.

## Acceptance criteria

- **AC1.8 (error path, database error):** Given valid input, when the handler submits the form and the ticket cannot be saved to the database, then the handler stays on `/tickets/new`. No ticket is saved. "Could not save the ticket to the database. Please try again." is shown above **Register ticket** with `role="alert"`, and all entered values are kept.
  - No field gets `aria-invalid`.
  - `redirect` and `revalidatePath` are not called.
  - The error is logged as `console.error("Failed to save ticket", { name, cause, code })`, without the error message and without the form values.
  - While a new attempt is pending, the message is not shown.
  - On the next successful attempt the ticket is saved and the handler is sent to the ticket list.

## Verification

AC1.8 is verified with Vitest, a mutation and a manual check, not with e2e. The reasons are in [decision 07](../decisions/07-save-failure-handling.md).

**How the action tests cause the error:**

- **Real database error:** `mocks.db` is set to an unmigrated database from `createDb(":memory:")`. The insert then rejects with a real `DrizzleQueryError` whose `cause` is a `LibsqlError` with `code: "SQLITE_ERROR"`. This proves the log shape against the real libraries, not a hand-built error.
- **Read-only error:** `mocks.db` stays the migrated test database from `createTestDb()`. `vi.spyOn(db, "insert")` makes the next call throw `new DrizzleQueryError(sql, params, new LibsqlError("…", "SQLITE_READONLY"))`. `DrizzleQueryError` is exported by `drizzle-orm` and `LibsqlError` by `@libsql/client`. The spy throws before any SQL runs, so the check "the test database has no tickets" only shows that nothing else was written.
- **`getDb()` fails:** the mock of `@/db/client` changes from a fixed arrow function to `getDb: vi.fn(() => mocks.db)`, so that a single test can make it throw a plain `Error`.

| # | Type | File | What is tested | Rules |
|---|---|---|---|---|
| T1 | Action test | `src/app/(portal)/tickets/actions.test.ts` | Unmigrated `:memory:` database: `formError` is returned with the exact text, `values` are unchanged, and `console.error` is called once with exactly `"Failed to save ticket", { name: "Error", cause: "LibsqlError", code: "SQLITE_ERROR" }` | R2, R5, R12 |
| T2 | Action test | `src/app/(portal)/tickets/actions.test.ts` | Spy on `insert` throws a read-only error: `formError` is returned, `values` are unchanged, the test database has no tickets, `redirect` and `revalidatePath` are not called, and `console.error` is called once with exactly `"Failed to save ticket", { name: "Error", cause: "LibsqlError", code: "SQLITE_READONLY" }`. No `console.error` call contains the form values or the error message | R2, R4, R5, R12 |
| T3 | Action test | `src/app/(portal)/tickets/actions.test.ts` | `getDb()` throws a plain `Error`: `formError` is returned, and the log is `{ name: "Error", cause: undefined, code: undefined }` | R2, R12 |
| T4 | Action test | `src/app/(portal)/tickets/actions.test.ts` | A value that is not an `Error` is thrown (the string `"boom"`): `formError` is returned, and the log is `{ name: "string", cause: undefined, code: undefined }` | R2, R12 |
| T5 | Action test | `src/app/(portal)/tickets/actions.test.ts` | The first call fails and the second call with the same values succeeds: the ticket is saved once, and `redirect("/tickets")` is called | R3, R11 |
| T6 | Action test | `src/app/(portal)/tickets/actions.test.ts` | Invalid input: add `expect(state?.formError).toBeUndefined()` to the existing test for invalid input | R1 |
| T7 | Component test | `src/components/TicketForm.test.tsx` | `formError` is shown with `role="alert"`, inside the form and before the button in DOM order (`compareDocumentPosition`). The values are kept, no field has `aria-invalid`, the alert is not `document.activeElement`, and the button says **Register ticket** and is enabled. For R7 only `role="alert"` is tested; the class `text-red-700` was removed from T7 after the review, so the colour is covered by MC | R5, R6, R7 (`role="alert"`), R8, R9, R10 |
| T8 | Component test | `src/components/TicketForm.test.tsx` | Two failed attempts in a row with the same values: the alert is gone while the second attempt is pending, and it is shown again when the response arrives | R11 |
| M4 | Mutation | `scripts/mutation-check.mjs` | Mutation 4: move `redirect("/tickets")` inside the `try`. Must fail: T5, because the redirect error is caught and returned as `formError` | R3 |
| MC | Manual check | [verification.md](../verification.md) | See [Manual check](#manual-check) below | R4, R7, R9 (red text, announcement, focus in a real browser) |

### Manual check

Use the database file that `DATABASE_URL` points to. By default it is `data/dev.db`. The server must be restarted around each change, because `getDb()` keeps its connection open.

| Step | macOS / Linux | Windows |
|---|---|---|
| 1. Stop `npm run dev` | `Ctrl+C` | `Ctrl+C` |
| 2. Make the database read-only | `chmod 444 data/dev.db` | `attrib +R data\dev.db` |
| 3. Start the server and register a valid ticket | `npm run dev` | `npm run dev` |
| 4. Check | The message is shown in red above the button, the page is still `/tickets/new` and the values are kept | Same |
| 5. Stop the server and make the database writable | `chmod 644 data/dev.db` | `attrib -R data\dev.db` |
| 6. Start the server and click **Register ticket** again | `npm run dev` | `npm run dev` |
| 7. Check | The ticket is saved and the ticket list is shown | Same |

On 2026-11-10 the `chmod` behaviour was checked on a copy of the database with libSQL directly, not yet with `npm run dev`: a connection opened while the file is read-only fails with `SQLITE_READONLY`, and `chmod` on an open connection has no effect. On 2026-11-11 the whole check was done with `npm run dev` in Firefox on macOS: see the [test report](../test-reports/ac1-8-manual-check.md). The Windows steps have not been tried yet.

## Steps (test-first, following `ticket-change`)

All steps were done by 2026-11-11, except the Windows steps of the manual check.

1. **Spec:** Jessica reviews this spec and [decision 07](../decisions/07-save-failure-handling.md).
2. **Action:** change the `getDb` mock to `vi.fn`, write T1–T6 and see them fail. Then add `formError`, `try`/`catch` and the logging to `submitTicket`.
3. **Form:** write T7 and T8 and see them fail. Then show `formError` in `TicketForm` when no attempt is pending.
4. **Mutation:** add M4 to `scripts/mutation-check.mjs` and check that it is caught.
5. **Checks:** run `npm test`, `npm run lint`, `npm run typecheck` and `npm run test:e2e`. Do the manual check.
6. **Documentation:** update [verification.md](../verification.md), [limitations.md](../limitations.md) (remove the item about the default error page and item 7 under "Proposed further development", and renumber the items after it) and [ai/README.md](../ai/README.md).

## Decisions

The decisions that affect architecture and testing are also recorded in [decision 07](../decisions/07-save-failure-handling.md).

| Question | Decision | Reason |
|---|---|---|
| Which error counts as the "invalid use case"? | A database error when a valid ticket is saved | The validation errors (AC1.3, AC1.4) already cover the requirement in part. A database error gives the default error page today, and the handler loses everything they typed |
| Which text is shown? | "Could not save the ticket to the database. Please try again." | Decided by Alexandra. The text says what happened and what the handler can do. English, as the team decided on 21 October 2026 |
| Does the handler stay on the page? | Yes, on `/tickets/new`, without a redirect | The handler should be able to try again without typing the ticket again |
| Where is the message shown? | Above **Register ticket**, with `role="alert"` | The handler is already looking there after clicking. `role="alert"` makes screen readers announce the message |
| Is the error logged? | Yes, as `console.error("Failed to save ticket", { name, cause, code })`, with `cause` from `error.cause.name` and `code` from `error.cause.code`. Not the error message and not the form values | The error should be possible to debug. `name` alone is only `"Error"` for Drizzle errors, so `cause` and `code` are what say what went wrong. Drizzle's message contains the form values, and personal data should not end up in the log |
| When is the message hidden? | While a new attempt is pending | Otherwise an old message stays visible during the new attempt, and a second identical failure is not announced again by screen readers |
| How is AC1.8 verified? | Vitest, mutation M4 and a manual check, no e2e test | The e2e tests share one database (`data/e2e.db`), so making it read-only would break the other tests. The server would also have to be restarted in the middle of the run, because `getDb()` keeps its connection open. Making a file read-only also works differently on Windows |

## Open questions

None at the moment.
