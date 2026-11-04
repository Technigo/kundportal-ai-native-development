# Decisions

Architecture and project decisions, one file per decision, following the ADR format. Name files `NN-short-title.md` (for example `04-sign-in.md`).

## Format

Each file has:

- **Status:** Proposed, Accepted, or Superseded by NN
- **Deciders:** who decided
- **Context:** why a decision was needed
- **Decision:** what we chose
- **Alternatives considered:** what else we looked at and why not
- **Consequences:** what follows from the choice

## Rules

- A decision file is never rewritten after it is accepted.
- To change a decision, write a new file and set the old file's status to "Superseded by NN". That status line is the only edit allowed in an old file.
- Record decisions that affect architecture, stack, testing or how we use AI.

## Index

| # | Decision | Status |
|---|---|---|
| [01](01-nextjs-16.md) | Next.js 16 with App Router | Accepted |
| [02](02-libsql-drizzle.md) | libSQL (SQLite) with Drizzle ORM | Accepted |
| [03](03-vitest-playwright.md) | Vitest and Playwright, test-first | Accepted |
| [04](04-status-change-and-history.md) | Status change rules and status history | Proposed |
| [05](05-ticket-list-and-details.md) | Ticket list and ticket details | Proposed |
