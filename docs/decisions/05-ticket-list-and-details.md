# 05: Ticket list and ticket details

- **Status:** Proposed
- **Deciders:** Marie Flem Honningdalnes (owner), to be confirmed by the team after review by Alexandra Petersson

## Context

The ticket list (AC2.1–AC2.3 in [project-brief.md](../project-brief.md)) is done. Viewing a ticket's details (AC4.1) is planned: the handler opens a ticket from the list and sees the full description and the requester details.

Today the subject in `TicketList` is plain text, there is no route for a single ticket, and the repository has no function that reads one ticket.

The branch `jessica/status-change` proposes a status change with history ([decision 04](04-status-change-and-history.md), [spec](../specs/status-change.md)). It places the status form and the history on the ticket detail page. The detail page must therefore leave room for them, but must not build them.

The plan is in [docs/specs/ticket-list-and-details.md](../specs/ticket-list-and-details.md).

## Decision

1. **The detail page is `/tickets/[id]`.** It is a Server Component that reads the ticket through a new repository function `getTicket(db, id)`.
2. **The subject in the ticket list becomes a link** to `/tickets/[id]`. The list stays read-only: it has no control for changing data.
3. **The detail page shows** subject, status, priority, created date, requester name, requester email (or "No email given") and the full description with line breaks kept.
4. **The detail page has a "Back to tickets" link** to `/tickets`.
5. **An unknown or invalid id redirects to `/tickets?notice=ticket-not-found`.** The list shows the message "This ticket does not exist." above the table. Only that known notice code is mapped to text; any other value is ignored.
6. **The page has a marked section for status change and history.** It is empty until the status-change work is merged. The detail page does not depend on the `ticket_status_changes` table.

## Alternatives considered

- **Side panel next to the list:** one screen, but the ticket has no URL of its own, so it cannot be linked or reloaded, and it is harder to test.
- **Modal over the list:** same drawbacks as the side panel, and worse keyboard handling.
- **404 page for an unknown id** (suggested in the first draft): standard Next.js behaviour with `notFound()`, but the owner prefers sending the handler back to the list with a message.
- **Redirect without a message:** simpler, but the handler would not know why they are back on the list.
- **A flash message in a cookie instead of a query parameter:** hides the notice after one view, but needs cookie handling for a very small gain. The query parameter is visible and can be tested directly.

## Consequences

- The repository gets `getTicket`. `TicketList` and the tickets page change. A new route and a new component are added.
- No schema change and no migration.
- The notice code is a fixed list in the code, so user input is never rendered as text.
- The e2e seed data should contain a ticket with a multi-line description.
- Both this branch and `jessica/status-change` edit the decision index in [README.md](README.md) and [project-brief.md](../project-brief.md); the second one merged resolves a small conflict.
- When status change is built, its form and history go into the marked section of the detail page.
