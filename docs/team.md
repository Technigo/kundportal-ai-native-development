# Team

## Members

- Marie Flem Honningdalnes
- Alexandra Petersson
- Ariadna Villar
- Jessica Swahn

## Working agreement

We share responsibility for the Customer Service Portal (Kundserviceportalen) across the 4-week examination period.

- **Shared ownership.** Every member can read, run, and explain the whole codebase. Components have a named owner (see below), but no one works in isolation.
- **One fork, one `main`.** We work in the team fork. Smaller tasks go on short-lived branches and are reviewed in internal PRs to our own `main`. The continuous PR from fork `main` to the course repo `main` stays open and is not merged.
- **Traceable reviews.** Each internal PR records who reviewed it, what was checked, and what changed as a result.
- **Weekly status.** We update `docs/status/week-N.md` each week with the expected outcome, what is done, and what is open or uncertain.
- **AI use.** AI agents may draft code, tests, and docs, but a human owns and reviews every change. We record which tasks involved an AI agent and what was verified by hand.
- **Fake data only.** No real customer data in the repo, in seeds, or in prompts.
- **Communication.** Blockers are raised early. Decisions that affect the architecture are written down in a new md-file for each descision `docs/decisions/` Decisions should follow structure in `docs/decisions/README.md` .

## Component ownership and AI-agent task tracking

Placeholder: fill in as work is assigned.

| Component / task | Owner | Reviewer | AI agent used (tool, task) | Verified by | Status |
|---|---|---|---|---|---|
| Project setup and boilerplate | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Not started |
| Database schema (Drizzle) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Not started |
| Ticket submission (UI + server logic) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Not started |
| Ticket list and detail views | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Not started |
| Status tracking | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Not started |
| Tests (Vitest) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Not started |
| Documentation | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Not started |
| Specification and acceptance criteria | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Not started |
| Validation and user-facing error messages | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Not started |
| Complementary feature (choose and specify first, e.g. internal notes, assignment, search/filter or ticket history) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Not started |
| Project AI instructions and shared AI workflow | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Not started |
| Reusable/automated AI task (shared instruction or automation) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Not started |
| Technical decisions (`docs/decisions/`) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Not started |
| Peer review: each member reviews at least one classmate's change | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Not started |
| Weekly status weeks 6–8 (`docs/status/`) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Not started |
| Known limitations, risks and future development | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Not started |
| Week 8 demo preparation | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Not started |
| Mark final version in continuous PR ("Slutversion för examination") | _TBD_ | _TBD_ | _TBD_ | _TBD_ | Not started |

## Requirements and responsibility

The solution requirements from the examination assignment. Proposal: to be confirmed by the team.

Each member owns at least one traceable technical requirement and reviews at least one classmate's change. Every owner writes the automated tests for their own requirement.

| Requirement | Owner | Reviewer |
|---|---|---|
| Register a new ticket and validate required information | Alexandra Petersson | Jessica Swahn |
| Handle at least one invalid use case with a clear message to the user | Alexandra Petersson | Jessica Swahn |
| Persist tickets so they remain after the application restarts | Ariadna Villar | Marie Flem Honningdalnes |
| Show a list of tickets and the details of a selected ticket | Marie Flem Honningdalnes | Alexandra Petersson |
| Change the status of a ticket | Jessica Swahn | Ariadna Villar |
| Add Internal Notes | Jessica Swahn | Alexandra Petersson |

| Verify central behaviour with automated tests covering happy paths and relevant error paths | Jessica Swahn | Ariadna Villar |
| Can be run and demonstrated by someone else using our instructions | Ariadna Villar | Marie Flem Honningdalnes |
