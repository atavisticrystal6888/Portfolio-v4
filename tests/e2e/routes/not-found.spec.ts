import { test, expect } from "@playwright/test";
import { NOT_FOUND_PATH } from "../route-manifest";

/* 404: say what happened and give a way back to the work. */
test.describe("Not found", () => {
  test("returns 404 with suggested pages and a working recovery link", async ({ page }) => {
    const res = await page.goto(NOT_FOUND_PATH, { waitUntil: "networkidle" });
    expect(res?.status()).toBe(404);
    // The h1 names the problem; "404" is supporting text.
    await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
    const suggested = page.getByRole("navigation", { name: "Suggested pages" });
    await expect(suggested).toBeVisible();
    const hrefs = await suggested.getByRole("link").evaluateAll((els) =>
      els.map((e) => e.getAttribute("href"))
    );
    expect(hrefs).toEqual(expect.arrayContaining(["/projects", "/blog", "/contact"]));

    await suggested.getByRole("link", { name: /^Projects/ }).click();
    await expect(page).toHaveURL(/\/projects$/);

    await page.goto(NOT_FOUND_PATH, { waitUntil: "networkidle" });
    await page.getByRole("link", { name: /back to home/i }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("link", { name: "See the work" })).toBeVisible();
  });
});
