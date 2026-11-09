# 06: Category is free text

- **Status:** Accepted
- **Date:** 2026-11-09
- **Deciders:** Alexandra Petersson (owner of AC1), reviewed by Jessica Swahn

## Context

The ticket model in the assignment requires a category. AC1.7 in [project-brief.md](../project-brief.md) adds it to ticket registration. The choice was already made in the decisions table of the [register-ticket spec](../specs/register-ticket.md#beslut), but there was no decision file for it, and the team asked whether category is free text.

## Decision

1. **Category is required free text, 1–50 characters, saved trimmed.** It is validated on the server in `newTicketSchema` (`src/tickets/ticketSchema.ts`). Only spaces counts as empty.
2. **The form has a text field, not a fixed list.** The field has `maxLength` 50.
3. **Tickets created before categories existed have the category `General`.** It is the column default in `src/db/schema.ts`.
4. **Category is shown only in the new ticket form.** The ticket list (AC2), the ticket details (AC4) and status change (AC5) do not show it.

## Alternatives considered

- **A fixed list of categories (select):** consistent values that are easy to filter on, but the team would first have to agree on the list, and changing it later needs a code change or a new table.
- **A category table managed in the portal:** flexible, but needs its own pages, validation and tests, which is too much for this assignment.
- **Optional category:** simpler form, but the assignment's ticket model requires a category.

## Consequences

- The same category can be spelled in different ways (`Billing`, `billing`, `Invoice`). Filtering or reporting on category would need cleanup first.
- Moving to a fixed list later needs a new decision, a schema change and a plan for the existing free-text values.
- No extra table or admin page is needed.
