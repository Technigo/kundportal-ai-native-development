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

## Requirements and responsibility

The solution requirements from the examination assignment.

Each member owns at least one traceable technical requirement and reviews at least one classmate's change. Every owner writes the automated tests for their own requirement.

| Requirement | Owner | Reviewer |
|---|---|---|
| Register a new ticket and validate required information | Alexandra Petersson | Jessica Swahn |
| Handle at least one invalid use case with a clear message to the user | Alexandra Petersson | Jessica Swahn |
| Persist tickets so they remain after the application restarts | Ariadna Villar | Marie Flem Honningdalnes |
| Show a list of tickets and the details of a selected ticket | Marie Flem Honningdalnes | Alexandra Petersson |
| Change the status of a ticket | Jessica Swahn | Ariadna Villar |
| Add Internal Notes | Marie Flem Honningdalnes | Alexandra Petersson |
| Verify central behaviour with automated tests covering happy paths and relevant error paths | Jessica Swahn | Ariadna Villar |
| Can be run and demonstrated by someone else using our instructions | Ariadna Villar | Marie Flem Honningdalnes |
