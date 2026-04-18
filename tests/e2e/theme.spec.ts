import { test, expect } from "@playwright/test";

test.describe("Theme toggle and palette persistence", () => {
  test("toggles between dark and light mode", async ({ page }) => {
    await page.goto("/");

    const initialTheme = await page
      .locator("html")
      .getAttribute("data-theme");

    const toggle = page.getByRole("button", { name: /toggle theme|theme/i }).first();
    await toggle.click();

    const newTheme = await page
      .locator("html")
      .getAttribute("data-theme");
    expect(newTheme).not.toBe(initialTheme);
  });

  test("theme persists across page navigation", async ({ page }) => {
    await page.goto("/");

    const toggle = page.getByRole("button", { name: /toggle theme|theme/i }).first();
    await toggle.click();

    const themeAfterToggle = await page
      .locator("html")
      .getAttribute("data-theme");

    await page.goto("/about");

    const themeAfterNav = await page
      .locator("html")
      .getAttribute("data-theme");
    expect(themeAfterNav).toBe(themeAfterToggle);
  });

  test("theme persists across page reload", async ({ page }) => {
    await page.goto("/");

    const toggle = page.getByRole("button", { name: /toggle theme|theme/i }).first();
    await toggle.click();

    const themeAfterToggle = await page
      .locator("html")
      .getAttribute("data-theme");

    await page.reload();

    const themeAfterReload = await page
      .locator("html")
      .getAttribute("data-theme");
    expect(themeAfterReload).toBe(themeAfterToggle);
  });

  test("data-palette attribute is present on html", async ({ page }) => {
    await page.goto("/");
    const palette = await page.locator("html").getAttribute("data-palette");
    expect(palette).toBeTruthy();
  });

  test("command palette opens with Ctrl+K", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Control+K");
    // Command palette dialog should become visible
    const dialog = page.getByRole("dialog").first();
    await expect(dialog).toBeVisible({ timeout: 3000 });
  });
});
