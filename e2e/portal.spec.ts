import { expect, test } from "@playwright/test";

test("the home page redirects to the dashboard", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL("/dashboard");
  await expect(page.getByRole("heading", { level: 1, name: "Dashboard" })).toBeVisible();
});

test("the main navigation is keyboard reachable and marks the current page", async ({ page }) => {
  await page.goto("/dashboard");
  const nav = page.getByRole("navigation", { name: "Main" });
  await expect(nav.getByRole("link", { name: "Dashboard" })).toHaveAttribute("aria-current", "page");

  await page.keyboard.press("Tab");
  await expect(nav.getByRole("link", { name: "Dashboard" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(nav.getByRole("link", { name: "Tickets" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL("/tickets");
  await expect(nav.getByRole("link", { name: "Tickets" })).toHaveAttribute("aria-current", "page");
});
