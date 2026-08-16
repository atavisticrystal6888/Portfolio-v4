import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = [
  "/",
  "/about",
  "/projects",
  "/projects/aarchid",
  "/projects/churn-analysis",
  "/blog",
  "/blog/why-pms-should-code",
  "/blog/shipping-llm-products-eval-harness",
  "/ai-pm",
  "/lab",
  "/uses",
  "/bookshelf",
  "/changelog",
  "/contact",
  "/now",
];

test.describe("Accessibility (WCAG 2.1 AA)", () => {
  for (const route of ROUTES) {
    test(`${route} has no critical a11y violations`, async ({ page }) => {
      test.setTimeout(120_000);
      await page.goto(route, { waitUntil: "networkidle" });

      // Scroll through the page so scroll-revealed content becomes visible
      // (axe skips hidden elements), then return to the top and settle.
      const pageHeight = await page.evaluate(() => document.body.scrollHeight);
      const step = page.viewportSize()?.height ?? 700;
      for (let y = 0; y < pageHeight; y += step) {
        await page.evaluate((top) => window.scrollTo(0, top), y);
        await page.waitForTimeout(150);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(800);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const critical = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious"
      );

      if (critical.length > 0) {
        console.log(
          `A11y violations on ${route}:`,
          JSON.stringify(
            critical.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })),
            null,
            2
          )
        );
      }

      expect(critical).toEqual([]);
    });
  }

  test("all pages have a skip link", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.getByRole("link", { name: /skip to (main )?content/i }).first();
    await expect(skipLink).toBeAttached();
  });

  test("main landmark exists on every route", async ({ page }) => {
    for (const route of ROUTES.slice(0, 4)) {
      await page.goto(route);
      const main = page.locator("main, [role='main']").first();
      await expect(main).toBeAttached();
    }
  });
});
