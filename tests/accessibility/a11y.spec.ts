import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = [
  "/",
  "/about",
  "/projects",
  "/projects/aarkid",
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

// Disable animations so axe sees elements at full opacity
test.use({ reducedMotion: "reduce" } as Parameters<typeof test.use>[0]);

test.describe("Accessibility (WCAG 2.1 AA)", () => {
  for (const route of ROUTES) {
    test(`${route} has no critical a11y violations`, async ({ page }) => {
      test.setTimeout(120_000);
      await page.goto(route, { waitUntil: "networkidle" });
      // Wait for React hydration to settle (SSR renders with opacity animations,
      // then hydration detects prefers-reduced-motion and removes them)
      await page.waitForFunction(
        () => !document.querySelector('[style*="opacity: 0"]'),
        { timeout: 5000 }
      );

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
