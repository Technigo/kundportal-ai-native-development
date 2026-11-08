# Known limitations, risks and next steps

## Limitations

- No ticket detail view and no status change yet. Tickets always stay `open`.
- No status history is stored.
- The status history does not record who made a change, because there is no sign-in.
- No email is sent to the requester.
- Data is stored in a local SQLite file. The app is meant to run locally only.
- End-to-end tests run in Chrome only.
- No pagination: the ticket list loads every ticket.
- The category is only entered in the New ticket form. It is not shown in the ticket list or on the ticket details page yet.
- If saving a ticket fails in the database, the handler sees the default error page instead of a clear message.

## Risks

| Risk | Effect | Mitigation |
|---|---|---|
| No authentication | Any user can read all tickets if the app is exposed | Keep it local and fake-data only until sign-in exists |
| Real customer data entered by mistake | Privacy breach | Fake data only is a team rule; seeds use invented names |
| Next.js 16 differs from AI training data | Agents suggest outdated APIs | CLAUDE.md requires reading `node_modules/next/dist/docs/` first |
| AI-generated code merged without review | Bugs, security issues | Owners review every diff and make every commit; see [ai/README.md](ai/README.md) |
| e2e tests depend on seed data | Flaky or wrong failures after seed changes | Reset `data/e2e.db` before each run (already done by `npm run test:e2e`) |

## Proposed further development

1. Ticket detail view.
2. Status change with a stored history table.
3. Sign-in and roles (handler, admin).
4. Customer view of their own tickets.
5. Email notification on status change.
6. Pagination, search and filters in the list.
7. A CI pipeline for lint, typecheck and tests.
8. A clear message to the handler when a ticket cannot be saved.
9. Show the category in the ticket list and on the ticket details page.
