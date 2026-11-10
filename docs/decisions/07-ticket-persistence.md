# 07: Tickets persist in a local SQLite file

- **Status:** Proposed
- **Date:** 2026-11-10
- **Deciders:** Ariadna Villar (owner of the persistence requirement), reviewed by Marie Flem Honningdalnes

## Context

The assignment requires that tickets remain after the application restarts (see the requirements table in [team.md](../team.md)). [Decision 02](02-libsql-drizzle.md) chose SQLite through libSQL, but it did not record how persistence works: where the data lives, what survives a restart and how the database is set up.

On 2026-11-10 the Tickets page crashed on a machine where `data/dev.db` was an empty file that had never been migrated. That showed that setting up the database is part of this decision too.

## Decision

1. **Tickets are stored in a local SQLite file, not in memory.** The file is `DATABASE_URL`, with the default `file:./data/dev.db` set in `src/db/client.ts`. Stopping and starting the app (`npm run dev` or `npm run start`) keeps every ticket.
2. **Every write goes straight to the file.** `createTicket` in `src/tickets/ticketRepository.ts` returns only after the insert has finished. There is no cache to flush before closing the app.
3. **The database file is git-ignored** (`/data/*.db` in [.gitignore](../../.gitignore)). Each team member has their own local data, and no ticket data, fake or not, reaches the repository.
4. **The schema comes from the committed migrations in `drizzle/`.** A new clone sets up the database once with `npm run db:reset`, or with `npm run db:migrate` followed by `npm run db:seed` (see "Getting started" and "Troubleshooting" in the [README](../../README.md)). The app does not migrate automatically when it starts.
5. **Tests never touch `data/dev.db`.** Vitest uses a fresh in-memory database for each test (`src/test-utils/testDb.ts`), and the end-to-end tests use their own `data/e2e.db`.

## Alternatives considered

- **An in-memory database or a JavaScript array:** the simplest option, but every ticket is lost on restart, which fails the requirement.
- **Migrating automatically when the app starts:** avoids the empty-database crash, but it changes the schema without anyone asking for it, and the migration code runs on every server start. Rejected for now; it could be a new decision later.
- **Hosted Turso as the default:** works across machines, but it is an external service, which is out of scope. `DATABASE_URL` and `DATABASE_AUTH_TOKEN` still make it possible.

## Consequences

- Tickets survive restarts with no extra infrastructure.
- `npm run db:reset` deletes all local tickets, so [CLAUDE.md](../../CLAUDE.md) requires agents to warn before running it.
- The data exists on one machine only. There is no backup and no sharing between team members.
- If the database has not been set up, the Tickets page shows the default error page instead of a clear message (see [limitations.md](../limitations.md)).
- This decision builds on [02](02-libsql-drizzle.md) and does not supersede it.
