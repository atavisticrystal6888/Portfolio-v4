import { test, expect } from "@playwright/test";

test.describe("404 identity", () => {
  test("the not-found page has its own title and no canonical to the home page", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page).toHaveTitle(/Page not found/);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(1);
  });
});

test.describe("Theme before hydration", () => {
  test("a stored theme is applied by the inline script, with the JS bundle blocked", async ({
    page,
    context,
  }) => {
    await context.addInitScript(() =>
      localStorage.setItem(
        "ds-portfolio-theme",
        JSON.stringify({ mode: "light", palette: "amber" })
      )
    );
    // First load only to seed localStorage for this origin.
    await page.goto("/", { waitUntil: "domcontentloaded" });
    // Then block hydration entirely: whatever the html carries now is what a
    // visitor sees on first paint.
    await context.route("**/_next/static/chunks/**", (route) => route.abort());
    await page.goto("/about", { waitUntil: "domcontentloaded" });

    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.locator("html")).toHaveAttribute("data-palette", "amber");
  });
});

test.describe("In-body content links", () => {
  test("links to this site stay in the same tab", async ({ page }) => {
    await page.goto("/blog/shipping-llm-products-eval-harness", { waitUntil: "networkidle" });
    const internalWithTarget = await page.locator('main a[href^="/"][target]').count();
    expect(internalWithTarget).toBe(0);
    // Off-site links keep the new tab and the rel guard.
    const external = page.locator('main a[href^="http"][target="_blank"]').first();
    await expect(external).toHaveAttribute("rel", /noopener/);
  });
});
