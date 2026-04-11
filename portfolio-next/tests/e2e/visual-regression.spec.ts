import { test, expect } from "@playwright/test";

const ROUTES = ["/", "/about", "/projects", "/blog", "/contact", "/now"];
const THEMES = ["dark", "light"] as const;
const VIEWPORTS = [
  { name: "mobile", width: 375, height: 812 },
  { name: "desktop", width: 1280, height: 800 },
] as const;

for (const route of ROUTES) {
  for (const theme of THEMES) {
    for (const viewport of VIEWPORTS) {
      const name = `${route === "/" ? "home" : route.slice(1)}-${theme}-${viewport.name}`;

      test(`visual: ${name}`, async ({ page }) => {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });

        await page.goto(route, { waitUntil: "networkidle" });

        // Set theme
        await page.evaluate((t) => {
          document.documentElement.setAttribute("data-theme", t);
        }, theme);

        // Wait for theme transition
        await page.waitForTimeout(300);

        await expect(page).toHaveScreenshot(`${name}.png`, {
          maxDiffPixelRatio: 0.01,
          fullPage: true,
        });
      });
    }
  }
}
