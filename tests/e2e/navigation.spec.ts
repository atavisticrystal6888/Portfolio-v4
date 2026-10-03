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

    // On mobile the navbar links collapse into the drawer, so an unscoped
    // /about/i link lookup lands on body copy instead of the nav. Drive the
    // affordance the viewport actually exposes.
    const burger = page.locator('button[aria-label="Toggle navigation"]');
    if (await burger.isVisible()) {
      await burger.click();
      const drawer = page.locator('[aria-label="Mobile navigation"]');
      await drawer.getByRole("link", { name: /^about$/i }).click();
    } else {
      const nav = page.locator('nav[aria-label="Main navigation"]');
      await nav.getByRole("link", { name: /^about$/i }).click();
    }

    await expect(page).toHaveURL(/\/about$/);
  });

  // Lab (unbuilt ideas) was demoted from the primary nav to the footer's
  // "More" group on 2026-09-30; the route itself still exists.
  test("Lab is in the footer More group, not the primary nav", async ({ page }) => {
    await page.goto("/");
    const primary = page.locator('nav[aria-label="Main navigation"]');
    // DOM-level so it also holds on mobile, where the bar links are hidden
    // behind the drawer toggle (role queries skip display:none links).
    await expect(primary.locator('a[href="/projects"]')).not.toHaveCount(0);
    await expect(primary.locator('a[href="/lab"]')).toHaveCount(0);

    const more = page.getByRole("navigation", { name: "Footer navigation: More" });
    await expect(more.getByRole("link", { name: /^lab$/i })).toHaveAttribute("href", "/lab");
  });

  test("404 page renders for unknown route", async ({ page }) => {
    const response = await page.goto("/nonexistent-page-xyz");
    expect(response?.status()).toBe(404);
  });

  test("case study pages load", async ({ page }) => {
    const response = await page.goto("/projects/aarchid");
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("blog article pages load", async ({ page }) => {
    const response = await page.goto("/blog/why-pms-should-code");
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator("h1").first()).toBeVisible();
  });
});
