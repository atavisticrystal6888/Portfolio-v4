import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const MOBILE_VIEWPORTS = [
  { width: 320, height: 568, name: "iPhone SE (320px)" },
  { width: 375, height: 667, name: "iPhone 6/7/8 (375px)" },
];

const ROUTES = ["/", "/about", "/projects", "/blog", "/contact", "/lab"];

test.describe("Touch target sizing (WCAG 2.5.8)", () => {
  for (const viewport of MOBILE_VIEWPORTS) {
    for (const route of ROUTES) {
      test(`${route} @ ${viewport.name} - target-size rule`, async ({
        page,
      }) => {
        test.setTimeout(60_000);
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });
        await page.goto(route, { waitUntil: "networkidle" });

        // Scroll through the page so scroll-revealed content becomes visible
        // (axe skips hidden elements), then return to the top and settle.
        const pageHeight = await page.evaluate(
          () => document.body.scrollHeight
        );
        for (let y = 0; y < pageHeight; y += viewport.height) {
          await page.evaluate((top) => window.scrollTo(0, top), y);
          await page.waitForTimeout(150);
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(800);

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

/*
 * Explicit WCAG 2.5.8 (Target Size, Minimum) checks for the controls the
 * a11y lane owns or depends on, at a 390px phone width. A target passes when
 * its box is at least 24x24 CSS px, or under the spacing exception: a 24px
 * circle centred on it does not intersect any other target or the 24px circle
 * of another undersized target.
 */
type TargetReport = {
  name: string;
  width: number;
  height: number;
  ok: boolean;
  reason: string;
};

async function measureTargets(
  page: import("@playwright/test").Page,
  selector: string
): Promise<TargetReport[]> {
  return page.evaluate((sel) => {
    const MIN = 24;
    const interactive = Array.from(
      document.querySelectorAll<HTMLElement>(
        'a[href], button, input:not([type="hidden"]), select, textarea, [role="button"], [role="link"], [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    const rectOf = (el: Element) => el.getBoundingClientRect();
    const centre = (r: DOMRect) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    const small = (r: DOMRect) => r.width < MIN || r.height < MIN;
    const distToRect = (p: { x: number; y: number }, r: DOMRect) => {
      const dx = Math.max(r.left - p.x, 0, p.x - r.right);
      const dy = Math.max(r.top - p.y, 0, p.y - r.bottom);
      return Math.hypot(dx, dy);
    };

    return Array.from(document.querySelectorAll<HTMLElement>(sel))
      .filter((el) => {
        const r = rectOf(el);
        return r.width > 0 && r.height > 0;
      })
      .map((el) => {
        const r = rectOf(el);
        const name =
          el.getAttribute("aria-label") || el.textContent?.trim().slice(0, 40) || el.tagName;
        if (!small(r)) {
          return { name, width: r.width, height: r.height, ok: true, reason: "size" };
        }
        const c = centre(r);
        const clash = interactive.find((other) => {
          if (other === el || other.contains(el) || el.contains(other)) return false;
          const o = rectOf(other);
          return small(o)
            ? Math.hypot(centre(o).x - c.x, centre(o).y - c.y) < MIN
            : distToRect(c, o) < MIN / 2;
        });
        return {
          name,
          width: r.width,
          height: r.height,
          ok: !clash,
          reason: clash ? `too close to ${clash.tagName.toLowerCase()}` : "spacing",
        };
      });
  }, selector);
}

/**
 * `width` is the viewport the control is measured at (default 390). The
 * project view switch only exists from 960px, where the dense layout does;
 * below that it is hidden by design (asserted separately), so it is measured
 * at the narrowest width where it is shown, 960px.
 */
const CONTROL_CHECKS: { label: string; route: string; selector: string; min: number; width?: number }[] = [
  { label: "project filter chips", route: "/projects", selector: '[role="group"][aria-label="Filter projects"] button', min: 5 },
  { label: "project view switch", route: "/projects", selector: '[role="group"][aria-label="Layout view"] button', min: 2, width: 960 },
  { label: "blog category chips", route: "/blog", selector: '[role="group"][aria-label="Filter articles by category"] button', min: 5 },
  { label: "FAQ buttons", route: "/contact", selector: "button[aria-controls^='faq-answer-']", min: 4 },
  {
    label: "carousel controls",
    route: "/",
    selector:
      'button[aria-label="Previous product"], button[aria-label="Next product"], [role="group"][aria-label="Choose a product"] button, button[aria-label="Previous testimonial"], button[aria-label="Next testimonial"], button[aria-label^="Go to testimonial"]',
    min: 2,
  },
  { label: "share buttons", route: "/blog/why-pms-should-code", selector: 'button[aria-label="Share article"]', min: 1 },
];

test.describe("Target size at 390px (WCAG 2.5.8, explicit controls)", () => {
  test("project view switch is not offered below 960px, where it would do nothing", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/projects", { waitUntil: "networkidle" });
    await expect(page.getByRole("group", { name: "Layout view" })).toBeHidden();
    await expect(page.locator('[role="group"][aria-label="Layout view"] button:visible')).toHaveCount(0);
  });

  for (const check of CONTROL_CHECKS) {
    const width = check.width ?? 390;
    test(`${check.label} on ${check.route} meet 24x24 or spacing${width === 390 ? "" : ` (at ${width}px)`}`, async ({ page }) => {
      test.setTimeout(60_000);
      await page.setViewportSize({ width, height: 844 });
      await page.goto(check.route, { waitUntil: "networkidle" });
      const first = page.locator(check.selector).first();
      await first.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);

      const targets = await measureTargets(page, check.selector);
      expect(
        targets.length,
        `expected at least ${check.min} visible ${check.label}`
      ).toBeGreaterThanOrEqual(check.min);

      const failing = targets.filter((t) => !t.ok);
      expect(failing, JSON.stringify(failing, null, 2)).toEqual([]);
    });
  }
});
