# 10: Someone else can run and demonstrate the app from our instructions

- **Status:** Proposed
- **Date:** 2026-11-11
- **Deciders:** Ariadna Villar (owner of the requirement "Can be run and demonstrated by someone else using our instructions")

## Context

The assignment requires that the solution "can be run and demonstrated by someone else using our instructions" (see the requirements table in [team.md](../team.md)). Setup steps exist in the [README](../../README.md) ("Requirements", "Getting started", "Troubleshooting" and "Commands"), but there was no walkthrough of what to show, nothing said how a demo is prepared, and nothing said how we check that the instructions work for someone who did not write them.

Two problems this week showed that instructions drift from the code:

- On 2026-11-10 the Tickets page crashed on a machine where `data/dev.db` existed but had never been migrated (see [decision 08](08-ticket-persistence.md)).
- The README said the dev server did not need a restart after `npm run db:reset`, which was wrong (PR #12, Copilot review comment).

## Decision

1. **Developer setup lives in the README, and a step-by-step guide for people with no software background lives in this decision.** The README links here. A pull request that adds a setup step (a new migration, an environment variable, a new tool) updates the README in the same pull request. A pull request that adds or changes something the walkthrough shows updates the walkthrough below.
2. **The app runs locally with no accounts, secrets or external services, and needs no developer tools.** A person only needs Node.js 24 or later, installed from nodejs.org, and downloads the app as a ZIP file from GitHub. Git is only needed for developers, and Google Chrome only for the end-to-end tests. The defaults work without `.env.local`.
3. **A demo starts from the seeded fake data.** Before a demo, stop the dev server, run `npm run db:reset` and start the server again, so everyone sees the same three tickets, notes and comments. Only fake data is used ([team.md](../team.md), "Fake data only").
4. **After pulling changes, run `npm run db:migrate`.** New migrations in `drizzle/` are not applied automatically ([decision 08](08-ticket-persistence.md), item 4).
5. **The instructions are checked in two ways.**
   - Automatically: CI ([.github/workflows/ci.yml](../../.github/workflows/ci.yml)) starts from a fresh checkout on every pull request and runs `npm ci`, lint, typecheck, the unit tests and the end-to-end tests, which reset, build and start the app.
   - By hand: before the final hand-in, a team member who did not write these instructions follows them on a fresh clone, runs the walkthrough and records the result in the manual checks in [verification.md](../verification.md).

## Walkthrough

This guide is written for someone who has never written code. You type a few commands into a text window, called a **terminal**, and then use the app in your web browser. Copy each command exactly, paste it into the terminal and press **Enter**.

It takes about 15 minutes the first time and 1 minute after that. It works on a Mac and on Windows. The app runs only on your own computer: nothing is sent to the internet, and all customers in it are made up.

### Part 1: Install Node.js (one time, about 5 minutes)

Node.js is the free program that runs the app.

1. Go to https://nodejs.org.
2. Click the download button marked **LTS**. Any version from 24 upwards works.
3. Open the file you downloaded and click **Continue** or **Next** on every screen until it says the installation is complete. The default choices are fine.

### Part 2: Download the app (about 2 minutes)

1. Go to https://github.com/marie-flem-honningdalnes/kundportal-ai-native-grupp-5.
2. Click the green **Code** button, then **Download ZIP**.
3. Unpack the file:
   - **Mac:** double-click the ZIP file in your Downloads folder.
   - **Windows:** right-click the ZIP file, click **Extract All…**, then **Extract**.
4. You now have a folder called **kundportal-ai-native-grupp-5-main**. You can move it, for example to your Desktop.

### Part 3: Open a terminal in the app's folder (about 1 minute)

**Mac:**

1. Press **Command (⌘) + Space**, type `Terminal` and press **Enter**. A window with text opens.
2. Type `cd` followed by a space. Do not press Enter yet.
3. Drag the **kundportal-ai-native-grupp-5-main** folder from Finder into the Terminal window. Its location appears after `cd `.
4. Press **Enter**.

**Windows:**

1. Open the **kundportal-ai-native-grupp-5-main** folder in File Explorer. If you see a folder with the same name inside it, open that one.
2. Click once in the address bar at the top of the window, where the folder's location is shown.
3. Type `powershell` and press **Enter**. A blue or black window with text opens.

**Check that it worked:** type this and press Enter:

```
node --version
```

You should see a version number such as `v24.21.0`. If you see "not found" or "not recognized", close the terminal, open it again as above, and try once more. If it still fails, restart the computer.

### Part 4: Set up the app (one time, about 2 minutes)

In the terminal, run these two commands, one at a time.

```
npm install
```

This downloads what the app needs. It takes 1–2 minutes. Wait until you can type again. Yellow `warn` lines and a message about "vulnerabilities" are normal and can be ignored. Do **not** run `npm audit fix`.

```
npm run db:reset
```

This creates the app's database with made-up example customers. It is done when you see:

```
Migrations applied.
Seeded 3 tickets, 3 notes and 3 comments.
```

### Part 5: Start the app

```
npm run dev
```

Wait until the terminal shows `✓ Ready`. This takes a few seconds. **Leave this window open** while you use the app: closing it stops the app.

Open your web browser (Chrome, Edge, Safari or Firefox) and go to:

```
http://localhost:3000
```

If the terminal shows a different address after `Local:`, use that one instead.

On Windows, a security window may ask whether Node.js may use the network. You can click **Cancel**: the app still works on your own computer.

There is no sign-in. Whoever opens the app is treated as a customer service case handler and can see every ticket.

### Part 6: Try the app (about 10 minutes)

A **ticket** is a customer's support case. Follow the steps in order. Each step says what to do and what you should see.

| # | Do this | You should see |
|---|---|---|
| 1 | Open http://localhost:3000 | The **Dashboard** page. The menu has **Dashboard** and **Tickets**. |
| 2 | Click **Tickets** | A table of three tickets, newest first: "Invoice shows the wrong VAT rate" from Anna Berg (Open, High), "Change delivery address" from Erik Lindqvist (In progress) and "Add a second user to our account" from Maja Ek (Closed, Low). |
| 3 | Click **Invoice shows the wrong VAT rate** | The ticket's details: who contacted us (Anna Berg, anna.berg@example.com), the status, the priority, the date and the description "Invoice 2026-0912 uses 25% instead of 12%." |
| 4 | Scroll down to **Internal notes** | Two notes written by case handlers, newest first. The older one, "Checked the invoice: …", has a button **Comments (2)**. |
| 5 | Click **Comments (2)** | Two comments under that note: "Finance confirms the fix goes out on Monday." and "Told the customer. They are fine with waiting." |
| 6 | In the **Note** box at the top, type `Demo note` and click **Add note** | Your note appears at the top of the notes with today's date and time. The box is empty again. |
| 7 | On your new note, click **Comments (0)**, type a comment in the **Comment** box and click **Add comment** | Your comment appears under the note, and the button now says **Comments (1)**. |
| 8 | On your new note, click **Delete** | A warning: "This also deletes 1 comment." Click **Cancel** and the note stays. Click **Delete** again, then **Confirm delete**, and the note and its comment are gone. |
| 9 | Click **Back to tickets**, then **New ticket** | A form for registering a new ticket. |
| 10 | Type only `Hi` in **Subject** and click **Register ticket** | Red messages next to the boxes you must fill in, for example "Please enter who contacted us." and "Subject must be at least 3 characters." What you typed is still there, and nothing is saved. |
| 11 | Type `ada@` in **Requester email (optional)** and click **Register ticket** | "Please enter a valid email address." next to the email box. |
| 12 | Fill in the form properly: **Requester name** `Ada Lovelace`, **Requester email** `ada@example.com`, **Subject** `Package arrived damaged`, **Description** `The box was crushed.`, **Category** `Delivery`, **Priority** High. Click **Register ticket** | You are back on the list, and "Package arrived damaged" is at the top with status Open and priority High. |
| 13 | In the browser's address bar, go to http://localhost:3000/tickets/99999 | Ticket 99999 does not exist, so you are taken to the list with the message "This ticket does not exist." |
| 14 | Stop the app (see Part 7), start it again with `npm run dev`, reload the page in the browser and click **Tickets** | "Package arrived damaged" is still there. Tickets are saved on your computer and are kept when the app restarts. |

Not in this guide yet: changing a ticket's status and its status history (section 5 in [project-brief.md](../project-brief.md)) are not on `main`. When they are, add a step after step 3.

### Part 7: Stop the app

Click the terminal window and press **Control + C**. On a Mac, this is the **Control** key, not Command. If Windows asks `Terminate batch job (Y/N)?`, type `Y` and press **Enter**.

You can now close the terminal and the browser tab. The tickets you created are kept for next time.

### Next time

1. Open a terminal in the app's folder (Part 3).
2. Run `npm run dev` and open http://localhost:3000 (Part 5).

You do not need to install anything again.

**To start over with only the three example tickets**, for example before showing the app to someone: stop the app (Part 7), run `npm run db:reset`, then start it again with `npm run dev`. This deletes every ticket you created.

### If something goes wrong

| What you see | What to do |
|---|---|
| `command not found: node`, or `node is not recognized` | Node.js is not installed, or the terminal was opened before it was installed. Close the terminal and open a new one. If that does not help, restart the computer, or install Node.js again (Part 1). |
| `npm error code ENOENT`, and a line that ends with `package.json` | The terminal is not in the app's folder. Open the terminal again as in Part 3. |
| The browser says "This site can't be reached" | The app is not running. Check that the terminal window is open and shows `✓ Ready`. If not, run `npm run dev`. |
| The Tickets page shows an error that starts with `Failed query` or contains `no such table` | The database is missing or out of date. Stop the app (Part 7), run `npm run db:reset`, and start the app again. This also deletes tickets you created. |
| The terminal shows `Another next dev server is already running` | The app is already running in another terminal window. Use that window, or stop it there with Control + C. |
| Something else | Copy all the text in the terminal and send it to the team. |

### For developers

The [README](../../README.md) has every command. In short:

```bash
git clone https://github.com/marie-flem-honningdalnes/kundportal-ai-native-grupp-5.git
cd kundportal-ai-native-grupp-5
npm install
npm run db:reset
npm run dev
npm test          # unit and component tests (Vitest)
npm run test:e2e  # end-to-end tests in Chrome; uses its own data/e2e.db, not your demo data
```

After pulling changes, run `npm run db:migrate`. What each test covers is in [verification.md](../verification.md).

## Alternatives considered

- **Only the README, no walkthrough:** one place for everything, but the README would grow long, and a person running a demo would still not know what to show or what to expect.
- **A hosted demo (for example Vercel with Turso):** nothing to install for the viewer, but it adds an external service and accounts, which is out of scope, and a public URL could invite real customer data.
- **A Docker image:** the same environment everywhere, but every viewer must install Docker, and the team would maintain a second way of running the app.
- **A recorded video only:** easy to share, but it does not let someone else run the app, which the requirement asks for.

## Consequences

- Pull requests that change setup must update the README, and pull requests that change what the walkthrough shows must update the walkthrough. Reviewers check both.
- [The decision rules](README.md) say an accepted decision is never rewritten. Once this decision is accepted, a change to the walkthrough needs a new decision that supersedes this one, or the walkthrough moves to its own document.
- CI shows that a fresh checkout installs, builds, starts and passes the tests on Linux. It does not show that a person can follow these steps; the manual fresh-clone check does.
- Windows is not covered by CI, and the Windows steps in the guide (PowerShell from the address bar, the security window, `Terminate batch job`) were written from how Windows normally behaves, not tried by us. A team member on Windows should follow the guide once. The persistence test has not been run on Windows either (see [limitations.md](../limitations.md)).
- The guide was tried on a Mac with Node.js 24.21.0 and npm 11.19.0. Newer Node.js versions are expected to work, but were not tried.
- `npm run db:reset` deletes local tickets, so preparing a demo removes anything created earlier on that machine.
- This decision builds on [08](08-ticket-persistence.md) and does not supersede it.
