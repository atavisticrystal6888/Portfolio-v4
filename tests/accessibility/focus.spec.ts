import { test, expect } from "@playwright/test";

/**
 * Focus and announcement behaviour that axe cannot see: axe checks that a skip
 * link and form errors exist, not that focus moves or that anything is spoken.
 * Every case here was a real defect found by walking the built site.
 */

test.describe("Focus management", () => {
  test("the skip link moves focus into main, not just the scroll position", async ({
    page,
    browserName,
  }) => {
    await page.goto("/");
    const skip = page.locator("a.skip-link");
    if (browserName === "webkit") {
      // Safari leaves links out of the tab sequence unless the user turns on
      // "Press Tab to highlight each item on a webpage", so tabbing to it is
      // not something this site controls. What the site owes is the focus move.
      await skip.focus();
    } else {
      await page.keyboard.press("Tab");
      await expect(skip).toBeFocused();
    }
    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();
  });

  test("the command palette returns focus to the control that opened it", async ({ page }) => {
    // The trigger only exists from 768px up; below that the palette is
    // keyboard-only by design.
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    const trigger = page.locator('button[aria-label="Open command palette"]');
    await trigger.click();
    await expect(page.locator('[role=dialog][aria-modal="true"]')).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("[role=dialog]")).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test("the mobile drawer takes focus and hands it back", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 720 });
    await page.goto("/");
    const burger = page.locator('button[aria-label="Toggle navigation"]');
    await burger.click();
    const drawer = page.locator('[aria-label="Mobile navigation"]');
    await expect(drawer).toHaveAttribute("aria-modal", "true");
    await expect(drawer.locator("a").first()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(drawer).toHaveCount(0);
    await expect(burger).toBeFocused();
  });
});

test.describe("Contact form announcements", () => {
  test("validation errors are announced and take focus", async ({ page }) => {
    await page.goto("/contact");
    await page.locator("form button[type=submit]").click();
    const alerts = page.locator("form [role=alert]");
    await expect(alerts).toHaveCount(4);
    await expect(page.locator("#name")).toBeFocused();
    await page.locator("#subject").click();
    await expect(page.locator("#subject")).toHaveAttribute("aria-describedby", "subject-error");
  });
});

test.describe("Current page is exposed to assistive tech", () => {
  test("the active nav link carries aria-current", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.locator('nav a[aria-current="page"]')).toHaveText("Projects");
  });
});

test.describe("Heading outline", () => {
  const routes = ["/", "/about", "/blog", "/ai-pm", "/projects", "/contact"];
  for (const route of routes) {
    test(`no heading level is skipped on ${route}`, async ({ page }) => {
      await page.goto(route, { waitUntil: "networkidle" });
      const skips = await page.evaluate(() => {
        const levels = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) =>
          Number(h.tagName[1])
        );
        const bad: string[] = [];
        for (let i = 1; i < levels.length; i++) {
          if (levels[i]! - levels[i - 1]! > 1) bad.push(`h${levels[i - 1]}->h${levels[i]}`);
        }
        return bad;
      });
      expect(skips).toEqual([]);
    });
  }
});
