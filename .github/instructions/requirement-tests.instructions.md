---
description: "Use when creating or editing feature tests in the API or web packages. Keep functional requirement IDs traceable to automated tests."
applyTo: "packages/**/*.test.{ts,tsx}"
---

# Requirement-linked tests

- Read the feature specification before adding or changing tests.
- Include every covered requirement ID in the test name or description, for example `[CASE-CREATE-003]`.
- Keep every functional requirement covered by at least one automated test. A test may cover multiple requirements, and a requirement may need multiple tests.
- When a specification or test changes, check the requirement-to-test mapping and run the relevant tests and `npm run check:requirements`.
- Treat this as a reminder, not proof of coverage; the requirement checker and CI are the enforcement.
