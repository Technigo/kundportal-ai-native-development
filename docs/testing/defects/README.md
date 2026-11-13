# Defects

One file per defect, named `D<number>-<short-name>.md`, for example `D1-empty-category-saved.md`.
Numbers are never reused. A defect is something that differs from
[kravspec.md](../../specs/kravspec.md) or [sok-filter.md](../../specs/sok-filter.md). If the spec
itself seems wrong, raise an open question (Q#) in the spec instead.

When a defect is fixed, a regression test is added (see "Så väljer vi tester" in the
[verification plan](../../verifieringsplan.md#så-väljer-vi-tester)) and the file is updated, not
deleted.

## Template

```markdown
# D<number>: <short title>

- **Found:** YYYY-MM-DD, by <name>, on <branch> at <commit>
- **Criterion:** <A#, SF-A# or R#>
- **Owner:** <name>
- **Status:** Open | Fixed | Accepted by the team

## Steps

1. …

## Expected

<What the spec says, with a link to the criterion.>

## Actual

<What happened. Link the log in ../evidence/.>

## Resolution

<Fix or team decision, with links to the PR and the regression test.>
```

## Defects

None recorded yet.
