# 03: Vitest and Playwright, test-first

- **Status:** Accepted
- **Deciders:** Team (grupp-5)

## Context

AI agents write much of the code. We need fast, automatic checks and a repeatable way to prove that changes work.

## Decision

Use Vitest with React Testing Library for unit, data, server action and component tests. Use Playwright for end-to-end tests against a production build and a separate seeded database. Every change starts with a failing test.

## Alternatives considered

- Jest: slower setup with this stack.
- Cypress: Playwright is already configured and covers our needs.

## Consequences

- Test results feed [docs/verification.md](../verification.md).
- e2e tests run in Chrome only.
