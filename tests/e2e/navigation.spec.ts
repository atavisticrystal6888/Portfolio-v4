import { test, expect } from "@playwright/test";

const ROUTES = [
  "/",
  "/about",
  "/projects",
  "/blog",
  "/contact",
  "/now",
];

test.describe("Navigation", () => {
  for (const route of ROUTES) {
    test(`loads ${route} with 200 and has h1`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBeLessThan(400);
      const h1 = page.locator("h1").first();
      await expect(h1).toBeVisible();
    });
  }

  test("navigates from home to about via navbar link", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /about/i }).first().click();
    await expect(page).toHaveURL(/\/about$/);
  });

  test("404 page renders for unknown route", async ({ page }) => {
    const response = await page.goto("/nonexistent-page-xyz");
    expect(response?.status()).toBe(404);
  });

  test("case study pages load", async ({ page }) => {
    const response = await page.goto("/projects/aarkid");
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("blog article pages load", async ({ page }) => {
    const response = await page.goto("/blog/why-pms-should-code");
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator("h1").first()).toBeVisible();
  });
});
