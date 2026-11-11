import { expect, test } from "@playwright/test";
import { statusLabels } from "../src/tickets/statusLabels";
import { ticketStatuses } from "../src/tickets/ticketSchema";

test("lists all tickets with their requester, newest first", async ({ page }) => {
  await page.goto("/tickets");
  const rows = page.getByRole("table").getByRole("row");

  await expect(rows.nth(1)).toContainText("Invoice shows the wrong VAT rate");
  await expect(rows.nth(1)).toContainText("Anna Berg");
  await expect(rows.nth(2)).toContainText("Change delivery address");
  await expect(rows.nth(3)).toContainText("Add a second user to our account");
});

test("opens a ticket from the list, shows its details and goes back", async ({ page }) => {
  await page.goto("/tickets");
  await page.getByRole("link", { name: "Invoice shows the wrong VAT rate" }).click();

  await expect(page).toHaveURL(/\/tickets\/\d+$/);
  const details = page.getByRole("article");
  await expect(details.getByRole("heading", { level: 1, name: "Invoice shows the wrong VAT rate" })).toBeVisible();
  await expect(details.getByText("Anna Berg")).toBeVisible();
  await expect(details.getByText("anna.berg@example.com")).toBeVisible();
  await expect(details.getByText("Invoice 2026-0912 uses 25% instead of 12%.")).toBeVisible();

  await page.getByRole("link", { name: "Back to tickets" }).click();
  await expect(page).toHaveURL("/tickets");
});

test("sets the page title from the ticket subject", async ({ page }) => {
  await page.goto("/tickets");
  await page.getByRole("link", { name: "Invoice shows the wrong VAT rate" }).click();

  await expect(page).toHaveTitle("Invoice shows the wrong VAT rate · Kundserviceportalen");
});

for (const id of ["99999", "abc", "01", "1e0", "0x1"]) {
  test(`redirects from /tickets/${id} to the list with a message`, async ({ page }) => {
    await page.goto(`/tickets/${id}`);

    await expect(page).toHaveURL("/tickets?notice=ticket-not-found");
    await expect(page.getByRole("status")).toHaveText("This ticket does not exist.");
    await expect(page.getByRole("table")).toBeVisible();
  });
}

test("shows no message for an unknown notice code", async ({ page }) => {
  await page.goto("/tickets?notice=something-else");

  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByRole("status")).toHaveCount(0);
});

test("shows a validation error and keeps the input when the subject is too short", async ({ page }) => {
  await page.goto("/tickets/new");
  await page.getByLabel("Requester name").fill("Ada Lovelace");
  await page.getByLabel("Subject").fill("Hi");
  await page.getByLabel("Description").fill("Something is wrong.");
  await page.getByRole("button", { name: "Register ticket" }).click();

  await expect(page.getByText("Subject must be at least 3 characters.")).toBeVisible();
  await expect(page).toHaveURL("/tickets/new");
  await expect(page.getByLabel("Description")).toHaveValue("Something is wrong.");
});

test("submitting a valid ticket shows it at the top of the list", async ({ page }) => {
  const subject = `Package arrived damaged ${Date.now()}`;

  await page.goto("/tickets");
  await page.getByRole("link", { name: "New ticket" }).click();
  await page.getByLabel("Requester name").fill("Ada Lovelace");
  await page.getByLabel("Requester email (optional)").fill("ada@example.com");
  await page.getByLabel("Subject").fill(subject);
  await page.getByLabel("Description").fill("The box was crushed and two items are broken.");
  await page.getByLabel("Category").fill("Delivery");
  await page.getByLabel("Priority").selectOption("high");
  await page.getByRole("button", { name: "Register ticket" }).click();

  await expect(page).toHaveURL("/tickets");
  const firstRow = page.getByRole("table").getByRole("row").nth(1);
  await expect(firstRow).toContainText(subject);
  await expect(firstRow).toContainText("Ada Lovelace");
  await expect(firstRow).toContainText("Open");
  await expect(firstRow).toContainText("High");
});

test("shows an error for an invalid requester email and keeps the input", async ({ page }) => {
  await page.goto("/tickets/new");
  await page.getByLabel("Requester name").fill("Ada Lovelace");
  await page.getByLabel("Requester email (optional)").fill("ada@");
  await page.getByLabel("Subject").fill("Valid subject");
  await page.getByLabel("Description").fill("Something is wrong.");
  await page.getByRole("button", { name: "Register ticket" }).click();

  await expect(page.getByText("Please enter a valid email address.")).toBeVisible();
  await expect(page).toHaveURL("/tickets/new");
  await expect(page.getByLabel("Requester name")).toHaveValue("Ada Lovelace");
});

test("shows an error when the category is missing and keeps the input", async ({ page }) => {
  await page.goto("/tickets/new");
  await page.getByLabel("Requester name").fill("Ada Lovelace");
  await page.getByLabel("Subject").fill("Valid subject");
  await page.getByLabel("Description").fill("Something is wrong.");
  await page.getByRole("button", { name: "Register ticket" }).click();

  await expect(page.getByText("Please enter a category.")).toBeVisible();
  await expect(page).toHaveURL("/tickets/new");
  await expect(page.getByLabel("Subject")).toHaveValue("Valid subject");
});

test("shows an error when the requester name is missing and saves nothing", async ({ page }) => {
  const subject = `No requester ${Date.now()}`;

  await page.goto("/tickets/new");
  await page.getByLabel("Subject").fill(subject);
  await page.getByLabel("Description").fill("Something is wrong.");
  await page.getByLabel("Category").fill("Billing");
  await page.getByRole("button", { name: "Register ticket" }).click();

  await expect(page.getByText("Please enter who contacted us.")).toBeVisible();
  await expect(page).toHaveURL("/tickets/new");
  await expect(page.getByLabel("Subject")).toHaveValue(subject);

  await page.goto("/tickets");
  await expect(page.getByText(subject)).toHaveCount(0);
});

test("long words in subject and description do not overflow the page", async ({ page }) => {
  const subject = `${"S".repeat(100)}${Date.now()}`;
  const description = `https://example.com/${"a".repeat(300)}`;

  await page.goto("/tickets/new");
  await page.getByLabel("Requester name").fill("Ada Lovelace");
  await page.getByLabel("Subject").fill(subject);
  await page.getByLabel("Description").fill(description);
  await page.getByLabel("Category").fill("Other");
  await page.getByRole("button", { name: "Register ticket" }).click();
  await expect(page).toHaveURL("/tickets");

  const overflows = () => page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(await overflows()).toBe(false);

  await page.getByRole("link", { name: subject }).click();
  await expect(page.getByRole("article")).toBeVisible();
  expect(await overflows()).toBe(false);
});

test("changing the status on the detail page shows it there, in the history and in the list", async ({ page }) => {
  // A new ticket starts on the first status; AC-S1 changes it to the next one.
  const [from, to] = ticketStatuses;
  const subject = `Status change ${Date.now()}`;

  await page.goto("/tickets/new");
  await page.getByLabel("Requester name").fill("Ada Lovelace");
  await page.getByLabel("Subject").fill(subject);
  await page.getByLabel("Description").fill("Please update the status of this ticket.");
  await page.getByLabel("Category").fill("General");
  await page.getByRole("button", { name: "Register ticket" }).click();
  await expect(page).toHaveURL("/tickets");

  await page.getByRole("link", { name: subject }).click();
  const section = page.getByRole("region", { name: "Status and history" });
  await expect(section.getByLabel("Status")).toHaveValue(from);
  await expect(section.getByText("No status changes yet.")).toBeVisible();

  await section.getByLabel("Status").selectOption(to);
  await section.getByRole("button", { name: "Save" }).click();

  await expect(section.getByRole("listitem")).toHaveText(
    new RegExp(`^${statusLabels[from]} → ${statusLabels[to]} · [A-Z][a-z]{2} \\d{1,2}, \\d{4}$`),
  );
  await expect(section.getByLabel("Status")).toHaveValue(to);
  // The value next to the "Status" term, wherever that row is in the list.
  const statusValue = page.locator("dt", { hasText: /^Status$/ }).locator("xpath=following-sibling::dd[1]");
  await expect(statusValue).toHaveText(statusLabels[to]);

  await page.getByRole("link", { name: "Back to tickets" }).click();
  await expect(page).toHaveURL("/tickets");
  await expect(page.getByRole("row").filter({ hasText: subject })).toContainText(statusLabels[to]);
});
