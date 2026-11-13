# 01: Next.js 16 with App Router

- **Status:** Accepted
- **Deciders:** Team (grupp-5)

## Context

We need one full-stack framework for UI, server logic and routing that the whole team can run locally.

## Decision

Use Next.js 16 with the App Router, React 19, TypeScript and Tailwind CSS. Server actions handle form submissions.

## Alternatives considered

- Separate React frontend and Express backend: more setup, two projects to run.
- Remix or SvelteKit: less familiar to the team.

## Consequences

- Next.js 16 has breaking changes against what AI tools were trained on. Agents must read `node_modules/next/dist/docs/` first (see [CLAUDE.md](../../CLAUDE.md)).
- Async Server Components cannot be unit-tested with Vitest, so they are covered by Playwright.
