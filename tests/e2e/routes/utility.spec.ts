import { test, expect } from "@playwright/test";
import { routesOfKind } from "../route-manifest";

/*
 * Utility pages (/now, /uses, /bookshelf, /changelog): each has a PageHeader
 * h1, at least one content section, and a "Where next" exit to the main work.
 */
const UTILITY = routesOfKind("utility").map((r) => r.path);

test.describe("Utility pages", () => {
  test("manifest lists the four utility pages", () => {
    expect([...UTILITY].sort()).toEqual(["/bookshelf", "/changelog", "/now", "/uses"]);
  });

  for (const route of UTILITY) {
    test(`${route}: header, content sections and a Where next exit`, async ({ page }) => {
      const res = await page.goto(route, { waitUntil: "networkidle" });
      expect(res?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(await page.locator("main h2").count(), "content sections").toBeGreaterThan(0);
      expect((await page.locator("main").innerText()).length).toBeGreaterThan(200);

      const next = page.getByRole("navigation", { name: "Where next" });
      await expect(next).toBeVisible();
      for (const name of ["Projects", "Blog", "Contact"]) {
        await expect(next.getByRole("link", { name, exact: true }), name).toBeVisible();
      }
      await next.getByRole("link", { name: "Projects", exact: true }).click();
      await expect(page).toHaveURL(/\/projects$/);
    });
  }

  test("/now: every project it names links to its case study", async ({ page }) => {
    await page.goto("/now", { waitUntil: "networkidle" });
    const main = page.locator("main");
    for (const [name, href] of [
      ["Cohort & Retention Studio", "/projects/cohort-retention-studio"],
      ["Sawari", "/projects/sawari"],
      ["DeskTasks", "/projects/desktasks"],
      ["Aarchid", "/projects/aarchid"],
    ] as const) {
      await expect(main.getByRole("link", { name, exact: true }), name).toHaveAttribute("href", href);
    }
    // Dated role, never an undated present tense (the internship ends 9 Oct 2026).
    await expect(main).toContainText(
      "The Sleep Company (Jul–Oct 2026): most recently a product intern on the growth team"
    );
    await expect(main).not.toContainText("Product Manager Intern");
    await expect(main).not.toContainText(/Current Roles|Currently:|– Present/);
  });
});
