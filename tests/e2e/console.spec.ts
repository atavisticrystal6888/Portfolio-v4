import { test, expect } from "@playwright/test";

const routes = [
  "/",
  "/about",
  "/projects",
  "/projects/aarkid",
  "/blog",
  "/blog/why-pms-should-code",
  "/contact",
  "/now",
];

for (const route of routes) {
  test(`no console errors on ${route}`, async ({ page }) => {
    const errors: string[] = [];
    const pageErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        // Ignore known benign errors (e.g. 404 on optional resources).
        if (text.includes("favicon")) return;
        errors.push(text);
      }
    });

    page.on("pageerror", (err) => {
      pageErrors.push(err.message);
    });

    await page.goto(route, { waitUntil: "networkidle" });
    // Give any lazy imports time to settle.
    await page.waitForTimeout(500);

    expect(pageErrors, `Uncaught errors on ${route}`).toEqual([]);
    expect(errors, `Console errors on ${route}`).toEqual([]);
  });
}
