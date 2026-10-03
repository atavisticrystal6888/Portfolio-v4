import { test, expect } from "@playwright/test";

/* /lab: an honest backlog of unbuilt ideas, clearly separated from shipped work. */
test.describe("Lab (/lab)", () => {
  test.beforeEach(async ({ page }) => {
    const res = await page.goto("/lab", { waitUntil: "networkidle" });
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: "Lab" })).toBeVisible();
  });

  test("callout says these are unbuilt and links to Projects", async ({ page }) => {
    const note = page.getByRole("note");
    await expect(note).toContainText(/unbuilt/i);
    await note.getByRole("link", { name: "Projects" }).click();
    await expect(page).toHaveURL(/\/projects$/);
  });

  test("the matrix really is sorted by difficulty, hardest first", async ({ page }) => {
    const weight: Record<string, number> = { Easy: 0, Medium: 1, Hard: 2, Expert: 3 };
    const levels = (await page.getByTestId("lab-difficulty").allTextContents()).map((t) => t.trim());
    expect(levels.length).toBeGreaterThan(0);
    const weights = levels.map((l) => weight[l] ?? -1);
    expect(weights).not.toContain(-1);
    expect(weights).toEqual([...weights].sort((a, b) => b - a));
  });

  test("domain filter toggles aria-pressed and the result count", async ({ page }) => {
    const group = page.getByRole("group", { name: "Filter ideas by domain" });
    const all = group.getByRole("button", { name: /^All/ });
    await expect(all).toHaveAttribute("aria-pressed", "true");
    const status = page.getByRole("status", { name: "Matrix filter result count" });
    const total = Number((await status.innerText()).match(/of (\d+)/)?.[1]);
    expect(total).toBeGreaterThan(0);
    const btn = group.getByRole("button").nth(1);
    const expected = Number((await btn.innerText()).match(/(\d+)\s*$/)?.[1]);
    await expect(async () => {
      await btn.click();
      await expect(btn).toHaveAttribute("aria-pressed", "true", { timeout: 1000 });
    }).toPass({ timeout: 10_000 });
    await expect(all).toHaveAttribute("aria-pressed", "false");
    await expect(status).toContainText(`Showing ${expected} of ${total}`);
    await all.click();
    await expect(status).toContainText(`Showing ${total} of ${total}`);
  });

  test("the closing invitation is a real link to /contact", async ({ page }) => {
    const link = page.locator("main").getByRole("link", { name: "Let's talk" });
    await expect(link).toHaveAttribute("href", "/contact");
  });

  test("Lab is in the footer, not the primary navigation", async ({ page }) => {
    const main = page.getByRole("navigation", { name: "Main navigation" });
    await expect(main.getByRole("link", { name: "Lab", exact: true })).toHaveCount(0);
    const footer = page.getByRole("navigation", { name: "Footer navigation: More" });
    await expect(footer.getByRole("link", { name: "Lab", exact: true })).toHaveAttribute("href", "/lab");
  });
});
