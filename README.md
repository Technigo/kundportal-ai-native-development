# Kundserviceportalen

Kundserviceportalen is a customer service portal where case handlers register support tickets on behalf of customers who contact support by phone or in writing, and follow the tickets through a workflow with status updates. It is a local-first app built with Next.js 16, TypeScript, Tailwind CSS, SQLite (libSQL) and Drizzle ORM, using fake customer data only.

## Documentation

- [Project brief and spec](docs/project-brief.md): workflows, acceptance criteria, scope
- [Verification plan](docs/verification.md): test selection, results, limits
- [Limitations and next steps](docs/limitations.md)
- [Team](docs/team.md): members, working agreement, ownership and change log
- [Status updates](docs/status/): weekly status
- [Decisions](docs/decisions/README.md): architecture decisions
- [AI usage](docs/ai/README.md): AI workflow and reusable step
- [CLAUDE.md](CLAUDE.md): stack, commands and rules for AI agents

Quickstart and commands are in the app section below.

---

### Requirements

- Node.js 24 or later (`.nvmrc` pins the major version)
- Google Chrome, for the end-to-end tests run locally

### Getting started

```bash
npm install
cp .env.example .env.local   # optional; the defaults use ./data/dev.db
npm run db:reset             # create, migrate and seed the local database
npm run dev
```

Then open http://localhost:3000.

There's no sign-in yet: anyone who opens the app is treated as a case handler and sees every ticket.

### Troubleshooting

**The Tickets page shows `Failed query: select ... from "tickets"`.** The local database has not been set up. If `npm run dev` starts before the database exists, it creates an empty `data/dev.db` file with no tables. Set the database up with one of these:

- `npm run db:migrate` and then `npm run db:seed`: creates the tables and adds demo tickets, and deletes nothing. Run the seed only once, or the demo tickets are added again.
- `npm run db:reset`: deletes `data/dev.db` first, so any tickets you created locally are lost.

Then reload the page. The dev server does not need a restart.

### Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` / `npm run start` | Build for production / serve the build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Generate route types, then check types with TypeScript |
| `npm test` | Run unit and component tests once (Vitest) |
| `npm run test:watch` | Run Vitest in watch mode while you develop |
| `npm run test:e2e` | Reset a separate `data/e2e.db`, build, and run the Playwright tests |
| `npm run test:mutation` | Break `submitTicket` on purpose and check that the right tests fail (`-- --e2e` adds Playwright) |
| `npm run db:generate` | Create a migration in `drizzle/` from changes to `src/db/schema.ts` |
| `npm run db:migrate` | Apply migrations to `DATABASE_URL` |
| `npm run db:seed` | Insert demo tickets |
| `npm run db:reset` | Delete the local database file, then migrate and seed (local files only) |

### Test-driven development

Every change starts with a failing test:

1. **Red:** write a test that describes the behaviour, then run it and watch it fail for the right reason.
2. **Green:** write the least code that makes it pass.
3. **Refactor:** tidy up with the tests still green.

Where each kind of test goes:

- **Unit and component tests** (Vitest + React Testing Library) sit next to the code as `*.test.ts(x)`. Database tests run against a fresh in-memory SQLite per test (`src/test-utils/testDb.ts`) and use `// @vitest-environment node`.
- **End-to-end tests** (Playwright) live in `e2e/`. They run against a production build and a freshly seeded `data/e2e.db`. Async Server Components can't be unit-tested with Vitest, so cover them here.

### Project layout

```
src/app/                 routes (App Router); (portal)/ holds the pages that share the portal shell
src/components/          React components (+ tests)
src/tickets/             ticket validation (zod) and data access
src/db/                  Drizzle schema, client, migrate/seed/reset scripts
src/lib/                 navigation
src/test-utils/          Vitest setup and test database helpers
drizzle/                 generated SQL migrations (commit these)
e2e/                     Playwright specs
data/                    local SQLite databases (git-ignored)
docs/                    spec, decisions, status updates, verification plan
```
