# 10: Someone else can run and demonstrate the app from our instructions

- **Status:** Proposed
- **Date:** 2026-11-11
- **Deciders:** Ariadna Villar (owner of the requirement "Can be run and demonstrated by someone else using our instructions"); reviewer Marie Flem Honningdalnes ([team.md](../team.md)), review pending

## Context

The assignment requires that the solution "can be run and demonstrated by someone else using our instructions" (see the requirements table in [team.md](../team.md)). Setup steps exist in the [README](../../README.md) ("Requirements", "Getting started", "Troubleshooting" and "Commands"), but there was no walkthrough of what to show, nothing said how a demo is prepared, and nothing said how we check that the instructions work for someone who did not write them.

Two problems this week showed that instructions drift from the code:

- On 2026-11-10 the Tickets page crashed on a machine where `data/dev.db` existed but had never been migrated (see [decision 08](08-ticket-persistence.md)).
- The README said the dev server did not need a restart after `npm run db:reset`, which was wrong (PR #12, Copilot review comment).

## Decision

1. **Developer setup lives in the README, and a step-by-step guide for people with no software background lives in [docs/demo.md](../demo.md).** This decision only records where the guide is and how it is checked, so the guide can change without a new decision. The README links to the guide. A pull request that adds a setup step (a new migration, an environment variable, a new tool) updates the README and the guide in the same pull request, and so does a pull request that changes something the guide's demo script shows.
2. **The app runs locally with no accounts, secrets or external services, and needs no developer tools.** A person only needs Node.js 24 or later, installed from nodejs.org, and downloads the app as a ZIP file from GitHub. Git is only needed for developers, and Google Chrome only for the end-to-end tests. The defaults work without `.env.local`.
3. **A demo starts from the seeded fake data.** Before a demo, stop the dev server, run `npm run db:reset` and start the server again, so everyone sees the same three tickets, notes and comments. Only fake data is used ([team.md](../team.md), "Fake data only").
4. **After pulling changes, run `npm run db:migrate`.** New migrations in `drizzle/` are not applied automatically ([decision 08](08-ticket-persistence.md), item 4).
5. **The instructions are checked in two ways.**
   - Automatically: CI ([.github/workflows/ci.yml](../../.github/workflows/ci.yml)) starts from a fresh checkout on every pull request and runs `npm ci`, lint, typecheck, the unit tests and the end-to-end tests, which reset, build and start the app.
   - By hand: before the final hand-in, a team member who did not write the guide follows [docs/demo.md](../demo.md) on a fresh ZIP download, on Windows, and records the result in the manual checks in [verification.md](../verification.md). The guide has also been followed on macOS.

## Where the guide is

The step-by-step guide is in [docs/demo.md](../demo.md). It covers installing Node.js, downloading the app as a ZIP file, opening a terminal on a Mac or on Windows, setting up and starting the app, a demo script with what you should see after each step, stopping the app, starting over, and what to do when something goes wrong.

## Alternatives considered

- **The guide inside this decision:** one file for the decision and the steps, but the [decision rules](README.md) say an accepted decision is never rewritten, so the guide would freeze once the decision is accepted.
- **Only the README, no separate guide:** one place for everything, but the README would grow long, and a person running a demo would still not know what to show or what to expect.
- **A hosted demo (for example Vercel with Turso):** nothing to install for the viewer, but it adds an external service and accounts, which is out of scope, and a public URL could invite real customer data.
- **A Docker image:** the same environment everywhere, but every viewer must install Docker, and the team would maintain a second way of running the app.
- **A recorded video only:** easy to share, but it does not let someone else run the app, which the requirement asks for.

## Consequences

- Pull requests that change setup or what the demo script shows must update the README and [docs/demo.md](../demo.md). Reviewers check both.
- The guide can be updated in any pull request without a new decision, because this decision only says where it is and how it is checked.
- CI shows that a fresh checkout installs, builds, starts and passes the tests on Linux. It does not show that a person can follow these steps; the manual fresh-clone check does.
- Windows is not covered by CI. Jessica Swahn followed the guide on Windows on 2026-11-13 (Node.js 24.22.2). Typing `powershell` in the File Explorer address bar did nothing for her, so Part 3 now uses **Open in Terminal** and says to follow only the steps for your own computer. The changed Part 3 has not been followed again on Windows. The persistence test failed on Windows in its cleanup; a fix is applied but not yet run on Windows (see [limitations.md](../limitations.md)).
- The guide was followed on a Mac with Node.js 24.21.0 (npm 11.19.0) and 26.13.1 (npm 11.20.0), the version the LTS button on nodejs.org gives on 2026-11-12.
- `npm run db:reset` deletes local tickets, so preparing a demo removes anything created earlier on that machine.
- This decision builds on [08](08-ticket-persistence.md) and does not supersede it.
