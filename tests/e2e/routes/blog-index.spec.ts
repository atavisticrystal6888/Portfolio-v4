import { test, expect, type Page } from "@playwright/test";

/* /blog: find an article by category or search, and recover from an empty result. */
const TOTAL = 14;

function countStatus(page: Page) {
  return page.getByRole("status").filter({ hasText: /articles? shown|No articles match/ }).first();
}

async function shown(page: Page): Promise<number> {
  const m = (await countStatus(page).innerText()).match(/(\d+) articles? shown/);
  return m ? Number(m[1]) : 0;
}

test.describe("Blog index (/blog)", () => {
  test.beforeEach(async ({ page }) => {
    const res = await page.goto("/blog", { waitUntil: "networkidle" });
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("lists every article and category filters toggle aria-pressed + count", async ({ page }) => {
    await expect(countStatus(page)).toHaveText(`${TOTAL} articles shown`);
    await expect(page.locator('main a[href^="/blog/"]')).toHaveCount(TOTAL);
    const group = page.getByRole("group", { name: "Filter articles by category" });
    const names = (await group.getByRole("button").allTextContents()).map((s) => s.trim()); // CSS-uppercased
    expect(names).toEqual(["All", "Product", "Data", "AI", "Career"]);
    const all = group.getByRole("button", { name: "All", exact: true });
    for (const name of ["Product", "Data", "AI", "Career"]) {
      const btn = group.getByRole("button", { name, exact: true });
      await expect(async () => {
        await btn.click();
        await expect(btn).toHaveAttribute("aria-pressed", "true", { timeout: 1000 });
      }).toPass({ timeout: 10_000 });
      await expect(all).toHaveAttribute("aria-pressed", "false");
      const n = await shown(page);
      expect(n, name).toBeGreaterThan(0);
      expect(n, name).toBeLessThan(TOTAL);
      await expect(page.locator('main a[href^="/blog/"]:visible')).toHaveCount(n);
    }
    await all.click();
    await expect.poll(() => shown(page)).toBe(TOTAL);
  });

  test("search narrows results; an empty search offers Clear search that restores the list", async ({ page }) => {
    const search = page.getByRole("searchbox", { name: "Search blog articles" });
    await expect(async () => {
      await search.fill("cohort");
      await expect.poll(() => shown(page), { timeout: 1500 }).toBeLessThan(TOTAL);
    }).toPass({ timeout: 10_000 });
    await expect(page.getByRole("heading", { name: "Cohorts Before Dashboards" })).toBeVisible();

    await search.fill("zzqqxx-no-such-article");
    const empty = page.getByRole("status").filter({ hasText: "No articles match" });
    await expect(empty).toBeVisible();
    await page.getByRole("button", { name: "Clear search" }).click();
    await expect(search).toHaveValue("");
    // The button unmounts with the empty state; focus must land in the
    // search box, not fall to <body>.
    await expect(search).toBeFocused();
    await expect.poll(() => shown(page)).toBe(TOTAL);
  });

  test("an article card opens the article", async ({ page }) => {
    const first = page.locator('main a[href^="/blog/"]').first();
    const href = await first.getAttribute("href");
    await first.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
