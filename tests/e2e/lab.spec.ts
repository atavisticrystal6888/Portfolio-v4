import { test, expect } from "@playwright/test";

test.describe("Lab domain filter", () => {
  test("domain chips filter the matrix", async ({ page }) => {
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
    // Chip label is "<domain> <count>"; split the trailing count off both.
    const chipText = (await domain.textContent())!.trim();
    const match = chipText.match(/^(.*?)\s*(\d+)$/);
    expect(match, `chip text "${chipText}" should end in a count`).not.toBeNull();
    const domainLabel = match![1]!.trim();
    const domainCount = Number(match![2]);
    expect(domainCount).toBeGreaterThan(0);

    await domain.click();

    await expect(domain).toHaveAttribute("aria-pressed", "true");
    await expect(all).toHaveAttribute("aria-pressed", "false");
    await expect(status).toContainText(`in ${domainLabel}.`);

    // The matrix narrows to exactly the number the chip advertises.
    await expect(status).toContainText(
      `Showing ${domainCount} of `
    );
    const cards = page.locator("main h3");
    await expect(cards).toHaveCount(domainCount);

    await all.click();
    await expect(status).toHaveText(unfiltered!);
  });

  test("filter chips are keyboard operable", async ({ page }) => {
    await page.goto("/lab");

    const group = page.getByRole("group", { name: "Filter ideas by domain" });
    const domain = group.getByRole("button").nth(1);

    await domain.focus();
    await expect(domain).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(domain).toHaveAttribute("aria-pressed", "true");
  });
});
