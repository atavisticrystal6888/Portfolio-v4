import { test, expect } from "@playwright/test";

const viewports = [
  { name: "mobile-xs", width: 320, height: 568 },
  { name: "mobile-sm", width: 360, height: 740 },
  { name: "mobile", width: 375, height: 667 },
  { name: "mobile-lg", width: 414, height: 896 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "laptop", width: 1024, height: 768 },
  { name: "desktop", width: 1440, height: 900 },
  { name: "wide", width: 1920, height: 1080 },
];

const routes = [
  "/",
  "/about",
  "/projects",
  "/projects/aarchid",
  "/blog",
  "/blog/why-pms-should-code",
  "/ai-pm",
  "/lab",
  "/contact",
  "/uses",
];

for (const route of routes) {
  for (const vp of viewports) {
    test(`no horizontal overflow on ${route} @ ${vp.name} (${vp.width}px)`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(route, { waitUntil: "networkidle" });

      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));

      // Allow 1px tolerance for sub-pixel rendering
      expect(
        overflow.scrollWidth,
        `Horizontal overflow: scrollWidth=${overflow.scrollWidth} clientWidth=${overflow.clientWidth}`
      ).toBeLessThanOrEqual(overflow.clientWidth + 1);
    });
  }
}
