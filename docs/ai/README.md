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
