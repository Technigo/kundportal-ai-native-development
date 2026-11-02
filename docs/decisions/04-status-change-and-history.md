# 04: Status change rules and status history

- **Status:** Proposed
- **Deciders:** Jessica Swahn (owner of AC5), to be confirmed by the team after review

## Context

AC5 in [project-brief.md](../project-brief.md) requires that a handler can change a ticket's status between `open`, `in_progress` and `closed` (AC5.1), that each change is stored with a timestamp and shown on the ticket (AC5.2), and that only allowed values are accepted (AC5.3).

Two things were not decided by the brief: which status transitions are allowed, and how the history is stored. There is no sign-in, so the system does not know who the case handler is.

The full specification is in [docs/specs/status-change.md](../specs/status-change.md).

## Decision

1. **Any status can change to any other status.** The server only checks that the new status is one of the known values. A change to the status the ticket already has is silently ignored and not stored.
2. **Status changes are stored in a new table, `ticket_status_changes`,** with the ticket id, the previous status, the new status and a timestamp. The ticket and its history entry are written in one transaction. Only the timestamp is stored, not who made the change.

## Alternatives considered

**Transitions**

- **Strict cycle** (`open → in_progress → closed → open`): makes sure every ticket has been handled before it is closed, and each status has a single next step, so the UI could be one button. Rejected because it blocks real cases: a ticket sometimes needs to skip steps, such as `open` straight to `closed`, or go back to an earlier status. A misclick also could not be undone without going round the whole cycle and leaving wrong entries in the history.
- **Everything except `closed → in_progress`** (suggested by Claude Code in the first draft of the spec): a middle ground, but the rule was not based on any requirement and still restricts the handler.
- **Any status to any other** (chosen): fewer restrictions. Matches AC5.1 as written. Fewer rules to build and test.

**History storage**

- **Only a `status_updated_at` column on `tickets`:** simpler, but keeps only the latest change, so AC5.2 cannot be met.
- **A separate history table** (chosen): keeps every change and can be shown newest first on the ticket.

**Who made the change**

- **Store a handler name in a free-text field:** more information, but the name cannot be trusted without sign-in and adds a field to validate and test.
- **Timestamp only** (chosen): no one is signed in, so the system cannot know who made the change.

## Consequences

- The schema gets a new table and a new migration (`npm run db:generate`, run by the owner).
- Validation only needs to check that the status is a known value; there is no transition matrix to maintain or test.
- The history cannot show who made a change. This is listed in [limitations.md](../limitations.md) until sign-in exists.
- A wrong status can be corrected directly, but the correction also shows in the history.
- If a fourth status such as "Waiting for customer" is added, it works with this model without new transition rules.
