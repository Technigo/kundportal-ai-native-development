# AI usage and workflow

## Rules

The rules for AI agents are in [CLAUDE.md](../../CLAUDE.md). They are enforced where possible by [.claude/settings.json](../../.claude/settings.json), which blocks git history changes, pull request commands, reading `.env*` and editing protected paths.

In short: the agent proposes and a human decides, tests come first, and humans make every commit, push and merge.

## Shared workflow

1. Pick a task and an acceptance criterion in [project-brief.md](../project-brief.md).
2. Use the reusable step below to build it.
3. A teammate reviews the diff. Record the reviewer and what was checked.
4. Update [verification.md](../verification.md).
5. Record architecture-level choices in [decisions/](../decisions/README.md).
6. Summarise the week in [status/](../status/README.md).

## Reusable step: `ticket-change`

A project skill at [.claude/skills/ticket-change/SKILL.md](../../.claude/skills/ticket-change/SKILL.md). It turns one acceptance criterion into a small, reviewed change: failing test, minimal code, checks, verification row. Anyone on the team can run it with `/ticket-change`.

## Reusable step: `test-cases`

A project skill at [.claude/skills/test-cases/SKILL.md](../../.claude/skills/test-cases/SKILL.md). It turns one acceptance criterion into a numbered table of proposed test cases (happy path, error path, edge cases) with assumptions and questions. It writes no test code and changes no files. The owners choose the cases, and the building is done with `ticket-change`. Anyone on the team can run it with `/test-cases`.

### Examples of use

**Ticket details (AC4.1–AC4.6), 2026-11-05, owner Marie Flem Honningdalnes, reviewer Alexandra Petersson**

- Criterion: AC4.1 and related criteria in section 4 of [project-brief.md](../project-brief.md).
- Plan: [ticket-list-and-details.md](../specs/ticket-list-and-details.md), seven steps, each approved separately. Decision: [05](../decisions/05-ticket-list-and-details.md).
- Test-first, step by step:
  - Repository: `getTicket` tested in `src/tickets/ticketRepository.test.ts`.
  - Components: `TicketDetails` and `TicketNotice` tested in `src/components/`; `TicketList.test.tsx` updated for the subject link.
  - Route: `/tickets/[id]` in `src/app/(portal)/tickets/[id]/page.tsx`, with a redirect to `/tickets?notice=ticket-not-found` for an unknown or invalid id.
  - End-to-end: open a ticket from the list, go back, and open an unknown id, in `e2e/tickets.spec.ts`.
- A follow-up change set the page title to the ticket subject, with its own e2e check.
- Result: left uncommitted for review, then committed by the owner (commits `55c0cdc`, `6c1d24f`).

**Clear message when a ticket cannot be saved (AC1.8), 2026-11-11, owner Alexandra Petersson, reviewer Jessica Swahn**

- Criterion: AC1.8 in section 1 of [project-brief.md](../project-brief.md).
- Plan: [save-failure-message.md](../specs/save-failure-message.md), reviewed by Jessica before any code was written. Decision: [07](../decisions/07-save-failure-handling.md). After the review, T7 no longer checks the class `text-red-700`; the colour is checked by hand instead.
- Test-first, step by step:
  - Action: T1–T5 in `src/app/(portal)/tickets/actions.test.ts` failed first (T6 passes before the change, as it only checks that field errors give no `formError`), then `submitTicket` got a `try`/`catch` around `getDb()` and `createTicket`, with `redirect` outside it.
  - Form: T7 and T8 in `src/components/TicketForm.test.tsx` failed with `Unable to find role="alert"`, then `TicketForm` got the message above the button.
  - Mutation: M4 moves `redirect` inside the `try` and is caught by T5.
- What the checks found: `npm run typecheck` failed on `button.form` in T7, which Vitest does not type-check. The e2e server did not start either, because the build type-checks. The test was changed to `alert.closest("form")`.
- Manual check in Firefox with VoiceOver: [report](../test-reports/ac1-8-manual-check.md).
- Result: left uncommitted for review, then committed by the owner (commits `e3584eb`, `bb994b0`, `7c8af02`, `cc2a2fd`). Commit `e3584eb` holds both the first tests and the change to `actions.ts`, so the failing step is recorded here, not in the git history.
**Internal notes (AC6.1–AC6.10), 2026-11-10 to 2026-11-11, owner Marie Flem Honningdalnes, reviewer Alexandra Petersson**

- Criterion: section 6 of [project-brief.md](../project-brief.md).
- Plan: [internal-notes.md](../specs/internal-notes.md), nine steps, each approved separately. Decision: [08](../decisions/08-internal-notes.md).
- Each criterion first went through `/test-cases`. The owner chose the cases, then `ticket-change` built them test-first: the agent showed the exact test code, the owner approved it, the test was run and shown failing, then the minimal code was approved and written.
  - Schemas, repository, server actions and components (note form, comments toggle, delete) in `src/tickets/`, `src/app/(portal)/tickets/` and `src/components/`, with Vitest tests next to the code.
  - Tables in `src/db/schema.ts`. The owner ran `npm run db:generate`; the agent did not touch `drizzle/`.
  - Seed data and Playwright tests in `e2e/notes.spec.ts`.
- Two failures were reported and decided by the owner instead of being fixed by the agent: the zod length rule (code points, not UTF-16 units, so the spec was corrected) and the cursor position after focus (put the cursor at the end).
- Later changes asked for by the owner, each with a failing test first: form errors that go away when the comments are closed, when the field loses focus or when typing, and an alert area that is kept when a later form fails validation.
- Checked by AI: a manual mutation check of the notes (2 of 4 mutations caught, see [verification.md](../verification.md)), a two-axis code review (standards and spec) run twice, and a security review (no findings at confidence 8 or higher). The review files were deleted at the owner's request; the owner decided which points to accept.
- Checked by hand by the owner: the pages in `npm run dev`, including the click on "Add note" after an error (accepted as it is).
- Result: left uncommitted for review, then committed by the owner.
