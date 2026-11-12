---
name: requirement-driven-tdd
description: 'Use when defining or implementing a feature ticket, acceptance criteria, test-driven development, or requirement-to-test traceability. Keep each requirement verifiable and linked to at least one test.'
---

# Requirement-driven TDD

## Use when

- Creating or refining a vertical feature ticket.
- Implementing a feature or checking that its requirements are tested.

## Procedure

1. Read the feature ticket and its requirement specification. Clarify missing behavior before coding.
2. Check that each requirement has a stable, unique ID, observable acceptance criteria, and a defined completion condition.
3. Map every requirement ID to at least one automated test. A test may cover multiple requirement IDs; a feature may need multiple tests. Do not assume one test per feature is sufficient.
4. For each behavior not yet covered, add a failing test and label it with every applicable requirement ID.
5. Implement only enough to pass the test; run it and the relevant regression tests. Repeat until every requirement ID has test coverage.
6. Refactor without changing behavior, then run the relevant checks again.
7. Update the ticket's requirement-to-test mapping with test locations and actual results. Do not claim unrun tests passed.
8. Stop at the feature boundary for review; do not silently start a dependent or unrelated feature.
