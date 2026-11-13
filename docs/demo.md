# Run and demo guide

How to install, start and try Kundserviceportalen on your own computer. Why the guide looks like this, and how we check it, is in [decision 10](decisions/10-run-and-demo-instructions.md). Developers can also use the [README](../README.md).

This guide is written for someone who has never written code. You type a few commands into a text window, called a **terminal**, and then use the app in your web browser. Copy each command exactly, paste it into the terminal and press **Enter**.

It takes about 15 minutes the first time and 1 minute after that. It works on a Mac and on Windows. The app runs only on your own computer: nothing is sent to the internet, and all customers in it are made up.

## Part 1: Install Node.js (one time, about 5 minutes)

Node.js is the free program that runs the app.

1. Go to https://nodejs.org.
2. Click the download button marked **LTS**. Any version from 24 upwards works. The guide was tried with 24.21.0 and 26.13.1 on a Mac, and 24.22.2 on Windows.
3. Open the file you downloaded and click **Continue** or **Next** on every screen until it says the installation is complete. The default choices are fine.

## Part 2: Download the app (about 2 minutes)

1. Go to https://github.com/marie-flem-honningdalnes/kundportal-ai-native-grupp-5.
2. Click the green **Code** button, then **Download ZIP**.
3. Unpack the file:
   - **Mac:** double-click the ZIP file in your Downloads folder.
   - **Windows:** right-click the ZIP file, click **Extract All…**, then **Extract**.
4. You now have a folder called **kundportal-ai-native-grupp-5-main**. You can move it, for example to your Desktop.

## Part 3: Open a terminal in the app's folder (about 1 minute)

Follow only the steps for your computer: **Mac** or **Windows**. The Mac steps do not work on Windows.

**Mac:**

1. Press **Command (⌘) + Space**, type `Terminal` and press **Enter**. A window with text opens.
2. Type `cd` followed by a space. Do not press Enter yet.
3. Drag the **kundportal-ai-native-grupp-5-main** folder from Finder into the Terminal window. Its location appears after `cd `.
4. Press **Enter**.

**Windows:**

1. Open the **kundportal-ai-native-grupp-5-main** folder in File Explorer. If you see a folder with the same name inside it, open that one.
2. Right-click an empty space inside the folder (not on a file) and click **Open in Terminal**. A window with text opens.
   - On Windows 10, or if you do not see **Open in Terminal**: hold **Shift**, right-click an empty space inside the folder, and click **Open PowerShell window here**.

**Check that it worked:** type this and press Enter:

```
node --version
```

You should see a version number such as `v26.13.1`, `v24.22.2` or `v24.21.0`. If you see "not found" or "not recognized", close the terminal, open it again as above, and try once more. If it still fails, restart the computer.

## Part 4: Set up the app (one time, about 2 minutes)

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

## Part 5: Start the app

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

## Part 6: Try the app (about 10 minutes)

A **ticket** is a customer's support case. Follow the steps in order. Each step says what to do and what you should see.

| # | Do this | You should see |
|---|---|---|
| 1 | Open http://localhost:3000 | The **Dashboard** page. The menu has **Dashboard** and **Tickets**. |
| 2 | Click **Tickets** | A table of three tickets, newest first: "Invoice shows the wrong VAT rate" from Anna Berg (Open, High), "Change delivery address" from Erik Lindqvist (In progress) and "Add a second user to our account" from Maja Ek (Closed, Low). |
| 3 | Click **Invoice shows the wrong VAT rate** | The ticket's details: who contacted us (Anna Berg, anna.berg@example.com), the status, the priority, the date and the description "Invoice 2026-0912 uses 25% instead of 12%." |
| 4 | Under **Status history**, see "No status changes yet.". Then, in the **Status** list just above it, choose **In progress** and click **Save** | The status at the top of the page changes from Open to **In progress**, and a line appears under **Status history**: "Open → In progress" followed by today's date. The ticket list also shows In progress for this ticket. |
| 5 | Scroll down to **Internal notes** | Two notes written by case handlers, newest first. The older one, "Checked the invoice: …", has a button **Comments (2)**. |
| 6 | Click **Comments (2)** | Two comments under that note: "Finance confirms the fix goes out on Monday." and "Told the customer. They are fine with waiting." |
| 7 | In the **Note** box at the top, type `Demo note` and click **Add note** | Your note appears at the top of the notes with today's date and time. The box is empty again. |
| 8 | On your new note, click **Comments (0)**, type a comment in the **Comment** box and click **Add comment** | Your comment appears under the note, and the button now says **Comments (1)**. |
| 9 | On your new note, click **Delete** | A warning: "This also deletes 1 comment." Click **Cancel** and the note stays. Click **Delete** again, then **Confirm delete**, and the note and its comment are gone. |
| 10 | Click **Back to tickets**, then **New ticket** | A form for registering a new ticket. |
| 11 | Type only `Hi` in **Subject** and click **Register ticket** | Red messages next to the boxes you must fill in, for example "Please enter who contacted us." and "Subject must be at least 3 characters." What you typed is still there, and nothing is saved. |
| 12 | Type `ada@` in **Requester email (optional)** and click **Register ticket** | "Please enter a valid email address." next to the email box. |
| 13 | Fill in the form properly: **Requester name** `Ada Lovelace`, **Requester email** `ada@example.com`, **Subject** `Package arrived damaged`, **Description** `The box was crushed.`, **Category** `Delivery`, **Priority** High. Click **Register ticket** | You are back on the list, and "Package arrived damaged" is at the top with status Open and priority High. |
| 14 | In the browser's address bar, go to http://localhost:3000/tickets/99999 | Ticket 99999 does not exist, so you are taken to the list with the message "This ticket does not exist." |
| 15 | Stop the app (see Part 7), start it again with `npm run dev`, reload the page in the browser and click **Tickets** | "Package arrived damaged" is still there, and "Invoice shows the wrong VAT rate" still has the status In progress from step 4. Everything is saved on your computer and kept when the app restarts. |

## Part 7: Stop the app

Click the terminal window and press **Control + C**. On a Mac, this is the **Control** key, not Command. If Windows asks `Terminate batch job (Y/N)?`, type `Y` and press **Enter**.

You can now close the terminal and the browser tab. The tickets you created are kept for next time.

## Next time

1. Open a terminal in the app's folder (Part 3).
2. Run `npm run dev` and open http://localhost:3000 (Part 5).

You do not need to install anything again.

**To start over with only the three example tickets**, for example before showing the app to someone: stop the app (Part 7), run `npm run db:reset`, then start it again with `npm run dev`. This deletes every ticket, note and status change you created.

## If something goes wrong

| What you see | What to do |
|---|---|
| `command not found: node`, or `node is not recognized` | Node.js is not installed, or the terminal was opened before it was installed. Close the terminal and open a new one. If that does not help, restart the computer, or install Node.js again (Part 1). |
| `npm error code ENOENT`, and a line that ends with `package.json` | The terminal is not in the app's folder. Open the terminal again as in Part 3. |
| The browser says "This site can't be reached" | The app is not running. Check that the terminal window is open and shows `✓ Ready`. If not, run `npm run dev`. |
| The Tickets page shows an error that starts with `Failed query` or contains `no such table` | The database is missing or out of date. Stop the app (Part 7), run `npm run db:migrate` and start the app again. This keeps the tickets you created. If the error is still there, stop the app, run `npm run db:reset` and start it again. This deletes the tickets you created. |
| The terminal shows `Another next dev server is already running` | The app is already running in another terminal window. Use that window, or stop it there with Control + C. |
| Something else | Copy all the text in the terminal and send it to the team. |

## For developers

The [README](../README.md) has every command. In short:

```bash
git clone https://github.com/marie-flem-honningdalnes/kundportal-ai-native-grupp-5.git
cd kundportal-ai-native-grupp-5
npm install
npm run db:reset
npm run dev
npm test          # unit and component tests (Vitest)
npm run test:e2e  # end-to-end tests in Chrome; uses its own data/e2e.db, not your demo data
```

After pulling changes, run `npm run db:migrate`. Run the tests from a `git clone`: in a ZIP download, the three tests in `src/db/gitignore.test.ts` fail because the folder is not a git repository. What each test covers is in [verification.md](verification.md).
