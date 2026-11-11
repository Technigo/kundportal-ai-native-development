# Manual check: clear message when a ticket cannot be saved (AC1.8)

- **Date:** 2026-11-11
- **Tester:** Alexandra Petersson (macOS), Jessica Swahn (Windows)
- **Environment:** macOS, Firefox, VoiceOver, `npm run dev` (Next.js 16.4.2). Windows, `npm run dev`, no screen reader (see [Windows check](#windows-check))
- **Branch:** `Alexandra/save-failure-message`
- **Database:** `data/dev.db`
- **Spec:** [save-failure-message.md](../specs/save-failure-message.md#manual-check) · **Decision:** [07](../decisions/07-save-failure-handling.md)
- **Result:** Passed

## Why this check is manual

The automated tests cover the logic (T1–T8 and mutation M4). Three things need a real browser and a person: that the message is red, that a screen reader announces it, and that focus stays where it is (R4, R7, R9). An e2e test was not used, because the e2e tests share one database and the server must be restarted around the change (decision 07).

## Steps and results

| # | Step | Expected | Result |
|---|---|---|---|
| 1 | `ls -l data/dev.db` | Note the permissions | `-rw-r--r--` (644) |
| 2 | Stop the server, then `chmod 444 data/dev.db` | The file is read-only | Done |
| 3 | `npm run dev`, open `/tickets/new`, fill in a valid ticket and click **Register ticket** | See steps 4–9 | Done |
| 4 | Look at the page | "Could not save the ticket to the database. Please try again." in red directly above **Register ticket** | Passed (figure 1) |
| 5 | Look at the address and the fields | Still `/tickets/new`, no Next.js error page, all values kept, no field marked invalid | Passed (figure 1) |
| 6 | Look at the button and focus | The button says **Register ticket** and is enabled, focus is not on the message | Passed (observed, no screenshot) |
| 7 | Look at the server log | `Failed to save ticket { name: 'Error', cause: 'LibsqlError', code: 'SQLITE_READONLY' }`, without the entered values | Passed (figure 2) |
| 8 | Turn on VoiceOver and click **Register ticket** again | The message is hidden while the attempt is pending and announced again when it fails | Passed (observed, no screenshot) |
| 9 | Stop the server, `chmod 644 data/dev.db`, start it again and register the ticket | The ticket is saved and the ticket list is shown | Passed (observed, no screenshot) |

## Screenshots

### Figure 1: the message in the browser

![The New ticket form in Firefox with the red message above the Register ticket button](../images/ac1-8-save-failure-browser.png)

The form on `http://localhost:3000/tickets/new` after a failed save. The handler's input is kept: name "Alexandra", email "alex@hej.se", subject "Betalning", description "Har betalningen kommit fram?", category "Konto" and priority Normal. The red message "Could not save the ticket to the database. Please try again." is shown directly above **Register ticket**. No field has a red border, and the button is enabled. The data is fake.

### Figure 2: the server log

![The terminal with chmod 444, npm run dev and the log line Failed to save ticket](../images/ac1-8-save-failure-terminal.png)

`ls -l` shows that `data/dev.db` was writable (`-rw-r--r--`) before the test. `chmod 444` makes it read-only, and `npm run dev` starts the server. When `POST /tickets/new` runs, the server logs `Failed to save ticket { name: 'Error', cause: 'LibsqlError', code: 'SQLITE_READONLY' }`, and the request answers `200`, not an error page. Next.js prints each request line after the request is done, so the log line comes before the `POST` line. The log line has no name, email or SQL (R12).

## Windows check

On 2026-11-11 Jessica Swahn did steps 2–9 on Windows with `npm run dev`, using `attrib +R data\dev.db` and `attrib -R data\dev.db` instead of `chmod 444` and `chmod 644`. The message was shown in red directly above **Register ticket**, the page stayed on `/tickets/new`, all values were kept and no field was marked invalid. The server logged `Failed to save ticket { name: 'Error', cause: 'LibsqlError', code: 'SQLITE_READONLY' }` without the entered values. After `attrib -R` and a restart the ticket was saved and shown first in the ticket list. `attrib` works the same way as `chmod`. Step 8 (screen reader) was not part of the Windows check.

### Figure 3: the message in the browser on Windows

![The New ticket form on Windows with the red message above the Register ticket button](../images/ac1-8-save-failure-browser-windows.png)

The form after a failed save on Windows. The input is kept: name "Lisa Andersson", an empty email, subject "Change Email", description "Can you change my email?", category "urgent" and priority High. The red message is shown directly above **Register ticket**, and no field has a red border. The data is fake.

### Figure 4: the server log on Windows

![The terminal on Windows with the log line Failed to save ticket](../images/ac1-8-save-failure-terminal-windows.png)

The server logs `Failed to save ticket { name: 'Error', cause: 'LibsqlError', code: 'SQLITE_READONLY' }`, and `POST /tickets/new` answers `200`. The log line has no name, subject or other entered values (R12).

## Not covered

- A screen reader on Windows.
- Other browsers than Firefox, and other screen readers than VoiceOver.
- Other database errors than `SQLITE_READONLY` in a real browser. The automated tests cover `SQLITE_ERROR`, a missing database directory and values that are not an `Error`.
