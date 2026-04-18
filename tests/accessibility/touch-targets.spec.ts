import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const MOBILE_VIEWPORTS = [
  { width: 320, height: 568, name: "iPhone SE (320px)" },
  { width: 375, height: 667, name: "iPhone 6/7/8 (375px)" },
];

const ROUTES = ["/", "/about", "/projects", "/blog", "/contact"];

test.describe("Touch target sizing (WCAG 2.5.8)", () => {
  for (const viewport of MOBILE_VIEWPORTS) {
    for (const route of ROUTES) {
      test(`${route} @ ${viewport.name} — target-size rule`, async ({
        page,
      }) => {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });
        await page.goto(route);

        const results = await new AxeBuilder({ page })
          .withRules(["target-size"])
          .analyze();

        const violations = results.violations.filter(
          (v) => v.id === "target-size"
        );

        if (violations.length > 0) {
          const summary = violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            nodes: v.nodes.length,
            examples: v.nodes.slice(0, 3).map((n) => n.target),
          }));
          console.log(
            `Touch-target violations on ${route} @ ${viewport.width}px:`,
            JSON.stringify(summary, null, 2)
          );
        }

        expect(violations).toEqual([]);
      });
    }
  }
});
