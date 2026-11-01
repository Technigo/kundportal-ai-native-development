# Project instructions

- Build a local-first customer-service portal; use fictional customer data only.
- Use TypeScript with React/Vite, Express and SQLite. Keep UI, API and persistence boundaries clear.
- Work in small, independently verifiable vertical features. Stop for developer review before starting the next step when requested.
- After a step is verified and approved by the user, commit that step's changes before starting the next one. Stage only files belonging to that step; leave unrelated and user-owned changes untouched.
- For each feature, follow its ticket and stable requirement IDs. Write a failing requirement-linked test before implementing; keep the requirement-to-test mapping current.
- Validate input at the API boundary and return clear errors. Do not silently hide failures.
- Reuse shared UI components and follow the project's palette and accessibility guidance in the `ui-consistency` skill.
- Run the narrowest relevant tests and build before reporting a change as verified. Report commands and actual results.
- Help the team preserve course evidence using `docs/examination/`; distinguish completed evidence from planned work and ask a focused reflection question when personal evidence is missing. Never infer one student's contribution from team work.
- Do not add authentication, hosting or external integrations unless a feature ticket requires them.
