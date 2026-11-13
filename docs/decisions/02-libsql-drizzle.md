# 02: libSQL (SQLite) with Drizzle ORM

- **Status:** Accepted
- **Deciders:** Team (grupp-5)

## Context

The project is local-first with fake data and runs locally only.

## Decision

Use SQLite through libSQL: a local file. Use Drizzle ORM for schema, migrations (`drizzle/`, committed) and queries.

## Alternatives considered

- PostgreSQL: needs a running server, against the zero-external-services scope.
- Prisma: heavier tooling than needed.

## Consequences

- Data survives restarts without extra infrastructure.
- Tests use a fresh in-memory SQLite per test.
- Migrations are generated with `npm run db:generate` and are never edited by hand or by agents.
