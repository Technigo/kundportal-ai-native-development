import { expect, test, type Page } from "@playwright/test";

// Tests share one database and run in order, so every test makes its own data with a unique text.
// The seeded notes are only read. The ticket without seeded notes is used for adding.
const emptyTicket = "Add a second user to our account";

const notes = (page: Page) => page.getByRole("region", { name: "Internal notes" });
// exact: the delete buttons have aria-labels that contain "note" and "comment".
const noteField = (page: Page) => notes(page).getByLabel("Note", { exact: true });
const noteItem = (page: Page, text: string) => notes(page).getByRole("listitem").filter({ hasText: text });

async function openTicket(page: Page, subject = emptyTicket) {
  await page.goto("/tickets");
  await page.getByRole("link", { name: subject }).click();
  await expect(page).toHaveURL(/\/tickets\/\d+$/);
  await expect(notes(page)).toBeVisible();
}

async function addNote(page: Page, text: string) {
  await noteField(page).fill(text);
  await notes(page).getByRole("button", { name: "Add note" }).click();
  await expect(noteItem(page, text)).toBeVisible();
}

async function addComment(page: Page, noteText: string, text: string) {
  const note = noteItem(page, noteText);
  await note.getByLabel("Comment", { exact: true }).fill(text);
  await note.getByRole("button", { name: "Add comment" }).click();
  await expect(note.getByText(text)).toBeVisible();
}

test("adds a note and a comment, and keeps them after a reload", async ({ page }) => {
  const stamp = Date.now();
  const text = `Called the customer ${stamp}`;
  const reply = `Waiting for an answer ${stamp}`;
  await openTicket(page);

  await addNote(page, text);
  const note = noteItem(page, text);
  await expect(note).toContainText(/[A-Z][a-z]{2} \d{1,2}, \d{4}, \d{1,2}:\d{2}\s[AP]M/);
  await expect(noteField(page)).toHaveValue("");
  await expect(note.getByRole("button", { name: "Comments (0)" })).toHaveAttribute("aria-expanded", "false");

  await note.getByRole("button", { name: "Comments (0)" }).click();
  await addComment(page, text, reply);
  await expect(note.getByRole("button", { name: "Comments (1)" })).toHaveAttribute("aria-expanded", "true");
  await expect(note.getByLabel("Comment", { exact: true })).toHaveValue("");

  await page.reload();
  await expect(notes(page)).toBeVisible();
  const reloaded = noteItem(page, text);
  await expect(reloaded.getByRole("button", { name: "Comments (1)" })).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByText(reply)).toHaveCount(0);
  await reloaded.getByRole("button", { name: "Comments (1)" }).click();
  await expect(reloaded.getByText(reply)).toBeVisible();
});

test("shows a newer note above an older one", async ({ page }) => {
  const stamp = Date.now();
  const first = `First note ${stamp}`;
  const second = `Second note ${stamp}`;
  await openTicket(page);

  await addNote(page, first);
  await addNote(page, second);

  await expect(notes(page).getByRole("listitem").first()).toContainText(second);
});

test("shows the seeded notes and comments in order", async ({ page }) => {
  await openTicket(page, "Invoice shows the wrong VAT rate");
  const items = notes(page).getByRole("listitem");

  await expect(items.nth(0)).toContainText("Customer called to ask for a status update.");
  await expect(items.nth(1)).toContainText("Checked the invoice");

  const older = noteItem(page, "Checked the invoice");
  await expect(older.getByRole("button", { name: "Comments (2)" })).toHaveAttribute("aria-expanded", "false");
  await expect(older.locator("p").first()).toHaveCSS("white-space", "pre-wrap");
  await older.getByRole("button", { name: "Comments (2)" }).click();
  const replies = older.getByRole("listitem");
  await expect(replies.nth(0)).toContainText("Finance confirms the fix goes out on Monday.");
  await expect(replies.nth(1)).toContainText("Told the customer.");
});

test("deletes only the chosen comment, after a cancel", async ({ page }) => {
  const stamp = Date.now();
  const text = `Note with two comments ${stamp}`;
  const first = `First comment ${stamp}`;
  const second = `Second comment ${stamp}`;
  await openTicket(page);
  await addNote(page, text);
  const note = noteItem(page, text);
  await note.getByRole("button", { name: "Comments (0)" }).click();
  await addComment(page, text, first);
  await addComment(page, text, second);
  const target = note.getByRole("listitem").filter({ hasText: first });

  await target.getByRole("button", { name: "Delete comment" }).click();
  await target.getByRole("button", { name: "Cancel" }).click();
  await expect(note.getByText(first)).toBeVisible();
  await expect(note.getByRole("button", { name: "Comments (2)" })).toBeVisible();

  await target.getByRole("button", { name: "Delete comment" }).click();
  await target.getByRole("button", { name: "Confirm delete" }).click();

  await expect(note.getByText(first)).toHaveCount(0);
  await expect(note.getByText(second)).toBeVisible();
  await expect(note.getByRole("button", { name: "Comments (1)" })).toBeVisible();
  await expect(note.getByText(text)).toBeVisible();
});

test("deletes a note with its comment, after a cancel, and keeps it gone after a reload", async ({ page }) => {
  const stamp = Date.now();
  const text = `Note to delete ${stamp}`;
  const reply = `Comment to delete ${stamp}`;
  await openTicket(page);
  await addNote(page, text);
  const note = noteItem(page, text);
  await note.getByRole("button", { name: "Comments (0)" }).click();
  await addComment(page, text, reply);

  await note.getByRole("button", { name: "Delete note" }).click();
  await expect(note.getByText("This also deletes 1 comment.")).toBeVisible();
  await note.getByRole("button", { name: "Cancel" }).click();
  await expect(note).toBeVisible();

  await note.getByRole("button", { name: "Delete note" }).click();
  await note.getByRole("button", { name: "Confirm delete" }).click();
  await expect(page.getByText(text)).toHaveCount(0);

  await page.reload();
  await expect(notes(page)).toBeVisible();
  await expect(page.getByText(text)).toHaveCount(0);
  await expect(page.getByText(reply)).toHaveCount(0);
});

test("shows HTML in a note as text", async ({ page }) => {
  const text = `<b>x</b> ${Date.now()}`;
  await openTicket(page);

  await addNote(page, text);

  await expect(notes(page).getByText(text)).toBeVisible();
  await expect(notes(page).locator("b")).toHaveCount(0);
});

test("shows no notes in the ticket list", async ({ page }) => {
  await page.goto("/tickets");

  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByText("Customer called to ask for a status update.")).toHaveCount(0);
  await expect(page.getByText("Internal notes")).toHaveCount(0);
  await expect(page.getByText(/Comments \(/)).toHaveCount(0);
});

test("rejects an empty note, keeps the typed spaces and saves nothing", async ({ page }) => {
  await openTicket(page);
  const count = () => notes(page).getByRole("button", { name: /^Comments \(/ }).count();
  const before = await count();

  await noteField(page).fill("   ");
  await notes(page).getByRole("button", { name: "Add note" }).click();

  await expect(notes(page).getByText("Please write a note.")).toBeVisible();
  await expect(noteField(page)).toHaveValue("   ");
  expect(await count()).toBe(before);
});

test("shows that a note is gone when another tab deleted it", async ({ page, context }) => {
  const text = `Deleted in another tab ${Date.now()}`;
  await openTicket(page);
  await addNote(page, text);

  const other = await context.newPage();
  await other.goto(page.url());
  const otherNote = noteItem(other, text);
  await otherNote.getByRole("button", { name: "Delete note" }).click();
  await otherNote.getByRole("button", { name: "Confirm delete" }).click();
  await expect(other.getByText(text)).toHaveCount(0);

  const note = noteItem(page, text);
  await expect(note).toBeVisible();
  await note.getByRole("button", { name: "Delete note" }).click();
  await note.getByRole("button", { name: "Confirm delete" }).click();

  await expect(notes(page).getByRole("alert")).toHaveText("This note no longer exists.");
  await expect(page.getByText(text)).toHaveCount(0);
});
