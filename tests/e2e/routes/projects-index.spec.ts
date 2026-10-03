import { test, expect, type Page } from "@playwright/test";

/*
 * /projects: the page's job is to let a reviewer narrow the work by kind and
 * see, per card, the status and the evidence tier behind each claim.
 */
const FILTERS = ["All", "Product", "Data", "AI", "Technical"];
const TOTAL = 11;

async function shownCount(page: Page): Promise<number> {
  const text = await page.getByRole("status").filter({ hasText: /projects? shown/ }).innerText();
  const m = text.match(/(\d+) projects? shown/);
  return m ? Number(m[1]) : NaN;
}

test.describe("Projects index (/projects)", () => {
  test.beforeEach(async ({ page }) => {
    const res = await page.goto("/projects", { waitUntil: "networkidle" });
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: "Projects" })).toBeVisible();
  });

  test("every card carries a status pill and an evidence chip", async ({ page }) => {
    const cards = page.locator("main article");
    await expect(cards).toHaveCount(TOTAL);
    await expect(page.getByRole("status").filter({ hasText: /projects? shown/ })).toHaveText(`${TOTAL} projects shown`);
    for (let i = 0; i < TOTAL; i++) {
      await expect(cards.nth(i).getByTestId("status-pill")).toHaveCount(1);
      await expect(cards.nth(i).getByTestId("evidence-chip")).toHaveCount(1);
    }
    expect(await page.content()).not.toContain("churn-analysis");
  });

  test("category filter toggles aria-pressed and updates the announced count", async ({ page }) => {
    const group = page.getByRole("group", { name: "Filter projects" });
    const names = await group.getByRole("button").allTextContents(); // CSS-uppercased; read the DOM text
    expect(names.map((n) => n.trim())).toEqual(FILTERS);
    const all = group.getByRole("button", { name: "All", exact: true });
    await expect(all).toHaveAttribute("aria-pressed", "true");

    for (const name of ["Product", "Data", "AI", "Technical"]) {
      const btn = group.getByRole("button", { name, exact: true });
      await expect(async () => {
        await btn.click();
        await expect(btn).toHaveAttribute("aria-pressed", "true", { timeout: 1000 });
      }).toPass({ timeout: 10_000 });
      await expect(all).toHaveAttribute("aria-pressed", "false");
      const n = await shownCount(page);
      expect(n, `${name} count`).toBeGreaterThan(0);
      expect(n, `${name} count`).toBeLessThan(TOTAL);
      await expect(page.locator("main article:visible")).toHaveCount(n);
    }
    await all.click();
    await expect(all).toHaveAttribute("aria-pressed", "true");
    await expect.poll(() => shownCount(page)).toBe(TOTAL);
  });

  test("layout view switch toggles between row and dense", async ({ page }) => {
    const view = page.getByRole("group", { name: "Layout view" });
    // The dense layout only exists from 960px; below that the switch would do
    // nothing, so it is hidden.
    if (page.viewportSize()!.width < 960) {
      await expect(view).toBeHidden();
      return;
    }
    const row = view.getByRole("button", { name: "Row view" });
    const dense = view.getByRole("button", { name: "Dense view" });
    await expect(row).toHaveAttribute("aria-pressed", "true");
    await expect(async () => {
      await dense.click();
      await expect(dense).toHaveAttribute("aria-pressed", "true", { timeout: 1000 });
    }).toPass({ timeout: 10_000 });
    await expect(row).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("main article")).toHaveCount(TOTAL);
    await row.click();
    await expect(row).toHaveAttribute("aria-pressed", "true");
  });

  test("a card opens its case study; the Lab backlog link goes to /lab", async ({ page }) => {
    await page.locator("main article").first().getByRole("link", { name: /case study/i }).click();
    await expect(page).toHaveURL(/\/projects\/[a-z0-9-]+$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.goto("/projects", { waitUntil: "networkidle" });
    await page.getByRole("link", { name: "See the Lab backlog" }).click();
    await expect(page).toHaveURL(/\/lab$/);
  });
});
