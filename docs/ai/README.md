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
