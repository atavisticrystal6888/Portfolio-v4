import { test, expect, type Page } from "@playwright/test";

// Unknown paths of different lengths. Every one is answered with the same
// prerendered /_not-found document, so anything the 404 derives from the
// browser's pathname can differ from the server HTML and break hydration.
// "/xy" is the control that passed by coincidence under the old
// pathname.length % 4 quote; the rest emitted React error #418.
const UNKNOWN_PATHS = [
  "/x",
  "/xy",
  "/xyz",
  "/this-route-does-not-exist",
  "/projects/no-such-case-study",
];

const HYDRATION_TEXT = /hydrat|#418|did not match|server rendered/i;

function watchErrors(page: Page) {
  const pageErrors: string[] = [];
  const hydrationLogs: string[] = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() !== "error" && msg.type() !== "warning") return;
    // The 404 document itself is logged as a failed resource; only hydration
    // complaints count here.
    if (HYDRATION_TEXT.test(msg.text())) hydrationLogs.push(msg.text());
  });
  return { pageErrors, hydrationLogs };
}

// React attaches a fiber to each hydrated node; once the h1 carries one, the
// recoverable-error report for a mismatch has had its chance to fire.
async function waitForHydration(page: Page) {
  await page.waitForFunction(() => {
    const h1 = document.querySelector("h1");
    return !!h1 && Object.keys(h1).some((k) => k.startsWith("__reactFiber"));
  });
  await page.waitForTimeout(300);
}

test.describe("404 hydrates cleanly on any unknown path", () => {
  for (const path of UNKNOWN_PATHS) {
    test(`${path} (length ${path.length})`, async ({ page }) => {
      const errors = watchErrors(page);

      const response = await page.goto(path, { waitUntil: "networkidle" });
      expect(response?.status()).toBe(404);
      await waitForHydration(page);

      const section = page.locator('[data-section="404"]');
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
      await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);

      expect(errors.pageErrors, `page errors on ${path}`).toEqual([]);
      expect(errors.hydrationLogs, `hydration warnings on ${path}`).toEqual([]);

      // Recovery: the primary CTA reaches the home page.
      await section.getByRole("link", { name: "Back to Home" }).click();
      await expect(page).toHaveURL(/\/$/);
      await expect(page.locator("h1")).toHaveCount(1);
      expect(errors.pageErrors, `page errors after recovering from ${path}`).toEqual([]);
    });
  }

  test("suggested pages recover to live routes", async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto("/xyz", { waitUntil: "networkidle" });
    await waitForHydration(page);

    const nav = page.getByRole("navigation", { name: "Suggested pages" });
    const hrefs = await nav.locator("a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
    expect(hrefs).toEqual(["/projects", "/ai-pm", "/blog", "/contact"]);

    await nav.getByRole("link", { name: /^Projects/ }).click();
    await expect(page).toHaveURL(/\/projects$/);
    await expect(page.locator("h1")).toHaveCount(1);
    expect(errors.pageErrors).toEqual([]);
    expect(errors.hydrationLogs).toEqual([]);
  });
});
