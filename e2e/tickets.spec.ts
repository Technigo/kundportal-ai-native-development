import { expect, test } from "@playwright/test";

test("lists all tickets with their requester, newest first", async ({ page }) => {
  await page.goto("/tickets");
  const rows = page.getByRole("table").getByRole("row");

  await expect(rows.nth(1)).toContainText("Invoice shows the wrong VAT rate");
  await expect(rows.nth(1)).toContainText("Anna Berg");
  await expect(rows.nth(2)).toContainText("Change delivery address");
  await expect(rows.nth(3)).toContainText("Add a second user to our account");
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
