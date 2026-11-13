---
name: ticket-change
description: Use when building or changing a Kundserviceportalen feature from an acceptance criterion in docs/project-brief.md. Runs the team's test-first routine and leaves the change uncommitted for review.
---

# ticket-change

Turn one acceptance criterion into a small, reviewable change. Follow [CLAUDE.md](../../../CLAUDE.md); its rules override this skill.

## Steps

1. **Pick the criterion.** Name it (for example AC5.1) from `docs/project-brief.md`. If none fits, stop and ask the owners to add one.
2. **Read the Next.js docs** in `node_modules/next/dist/docs/` before writing Next.js code.
3. **Propose.** Name the files, show the exact change, explain why and the trade-offs. Wait for a yes.
4. **Red.** Write one failing test (Vitest for logic and components, Playwright for flows and async Server Components). Run it and show it failing for the right reason.
5. **Green.** Write the least code that passes. Do not edit `drizzle/`; change `src/db/schema.ts` and ask the owners to run `npm run db:generate`.
6. **Check.** Run `npm test`, `npm run lint` and `npm run typecheck`. Run `npm run test:e2e` when a flow changed. Report failures; do not fix them unasked.
7. **Record.** Propose an update to the criterion's row in `docs/verification.md`.
8. **Hand over.** Leave everything uncommitted. Tell the owners to review with `git status` and `git diff`. Say plainly what was checked and what was not.
