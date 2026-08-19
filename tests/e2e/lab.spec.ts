import { test, expect } from "@playwright/test";

test.describe("Lab domain filter", () => {
  test("domain tiles filter the matrix", async ({ page }) => {
    await page.goto("/lab");

    const group = page.getByRole("group", { name: "Filter ideas by domain" });
    const all = group.getByRole("button", { name: /^All/ });
    await expect(all).toHaveAttribute("aria-pressed", "true");

    const status = page.getByRole("status", {
      name: "Matrix filter result count",
    });
    const unfiltered = await status.textContent();
    expect(unfiltered).toMatch(/Showing (\d+) of \1 ideas\./);

    const domain = group.getByRole("button").nth(1);
    const domainLabel = (await domain.locator("h3").textContent())!.trim();
    await domain.click();

    await expect(domain).toHaveAttribute("aria-pressed", "true");
    await expect(all).toHaveAttribute("aria-pressed", "false");
    await expect(status).toContainText(`in ${domainLabel}.`);

    // Every remaining card belongs to the chosen domain.
    const metas = page.locator("main span", { hasText: " · " });
    const count = await metas.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(metas.nth(i)).toContainText(domainLabel);
    }

    await all.click();
    await expect(status).toHaveText(unfiltered!);
  });

  test("filter tiles are keyboard operable", async ({ page }) => {
    await page.goto("/lab");

    const group = page.getByRole("group", { name: "Filter ideas by domain" });
    const domain = group.getByRole("button").nth(1);

    await domain.focus();
    await expect(domain).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(domain).toHaveAttribute("aria-pressed", "true");
  });
});
