import { test, expect } from "@playwright/test";

/**
 * Filter and disclosure semantics that axe cannot judge: that the pressed
 * state follows the keyboard, that the live count changes, and that a
 * collapsed FAQ answer is really out of the accessibility tree.
 */

test.describe("Filter toggles and FAQ disclosure", () => {
  test("project filters are Tab-reachable toggle buttons with a live count", async ({
    page,
  }) => {
    await page.goto("/projects", { waitUntil: "networkidle" });

    const group = page.getByRole("group", { name: "Filter projects" });
    await expect(group).toBeVisible();
    await expect(page.getByRole("tablist")).toHaveCount(0);

    const buttons = group.getByRole("button");
    const names = ["All", "Product", "Data", "AI", "Technical"];
    await expect(buttons).toHaveCount(names.length);

    const status = page.getByRole("status").filter({ hasText: /projects? shown$/ });
    const totalText = await status.textContent();
    expect(totalText).toMatch(/^\d+ projects? shown$/);

    // Each chip is its own Tab stop (no roving tabindex), and Space presses it.
    await buttons.first().focus();
    await expect(buttons.first()).toBeFocused();
    await expect(buttons.first()).toHaveAttribute("aria-pressed", "true");

    for (let i = 1; i < names.length; i++) {
      await page.keyboard.press("Tab");
      const chip = group.getByRole("button", { name: names[i], exact: true });
      await expect(chip).toBeFocused();
      await page.keyboard.press("Space");
      await expect(chip).toHaveAttribute("aria-pressed", "true");
      await expect(group.locator('button[aria-pressed="true"]')).toHaveCount(1);
      await expect(status).toHaveText(/^\d+ projects? shown$/);
    }

    // Back to All restores the full count.
    const all = group.getByRole("button", { name: "All", exact: true });
    await all.focus();
    await page.keyboard.press("Space");
    await expect(all).toHaveAttribute("aria-pressed", "true");
    await expect(status).toHaveText(totalText!);
  });

  test("project filter count matches what is shown after a change", async ({ page }) => {
    await page.goto("/projects", { waitUntil: "networkidle" });
    const group = page.getByRole("group", { name: "Filter projects" });
    const status = page.getByRole("status").filter({ hasText: /projects? shown$/ });
    const all = await status.textContent();

    // Find a category that narrows the list, then check the count changed.
    for (const name of ["Product", "Data", "AI", "Technical"]) {
      await group.getByRole("button", { name, exact: true }).click();
      const now = await status.textContent();
      if (now !== all) {
        expect(Number(now!.split(" ")[0])).toBeLessThan(Number(all!.split(" ")[0]));
        return;
      }
    }
    throw new Error("no category narrowed the project list; the count never changed");
  });

  test("blog categories expose aria-pressed and announce the article count", async ({
    page,
  }) => {
    await page.goto("/blog", { waitUntil: "networkidle" });
    const group = page.getByRole("group", { name: "Filter articles by category" });
    const all = group.getByRole("button", { name: "All", exact: true });
    await expect(all).toHaveAttribute("aria-pressed", "true");

    const status = page.getByRole("status").filter({ hasText: /articles? shown$/ });
    await expect(status).toHaveText(/^\d+ articles? shown$/);
    const before = await status.textContent();

    const product = group.getByRole("button", { name: "Product", exact: true });
    await product.click();
    await expect(product).toHaveAttribute("aria-pressed", "true");
    await expect(all).toHaveAttribute("aria-pressed", "false");
    await expect(status).toHaveText(/^\d+ articles? shown$/);

    // A search that matches nothing: count reads 0 and the empty state is a status.
    await all.click();
    await page.getByRole("searchbox", { name: "Search blog articles" }).fill("zzzz-no-such-article");
    await expect(status).toHaveText("0 articles shown");
    await expect(page.getByRole("status").filter({ hasText: "No articles match" })).toBeVisible();
    await page.getByRole("button", { name: "Clear search" }).click();
    await expect(status).toHaveText(before!);
  });

  test("FAQ answers are hidden disclosures under one named region", async ({ page }) => {
    await page.goto("/contact", { waitUntil: "networkidle" });

    const faq = page.getByRole("region", { name: "Common Questions" });
    await expect(faq).toBeVisible();
    // No nested per-answer regions and no complementary landmark on /contact.
    await expect(faq.getByRole("region")).toHaveCount(0);
    await expect(page.getByRole("complementary")).toHaveCount(0);

    const questions = faq.getByRole("button", { expanded: false });
    await expect(questions).toHaveCount(4);

    const first = faq.getByRole("button").first();
    const answerId = await first.getAttribute("aria-controls");
    const answer = page.locator(`#${answerId}`);
    await expect(answer).toBeHidden();

    await first.focus();
    await page.keyboard.press("Enter");
    await expect(first).toHaveAttribute("aria-expanded", "true");
    await expect(answer).toBeVisible();

    await page.keyboard.press("Space");
    await expect(first).toHaveAttribute("aria-expanded", "false");
    await expect(answer).toBeHidden();
  });
});
