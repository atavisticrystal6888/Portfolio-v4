import { test, expect } from "@playwright/test";
import { ROUTES } from "../route-manifest";

/* Shared chrome: primary nav, mobile drawer, command palette, theme, resume. */
const RESUME = "/resume/dhruv-singhal-resume.pdf";

test.describe("Shared chrome", () => {
  test("primary navigation carries the work pages and not the Lab", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop navigation bar");
    await page.goto("/", { waitUntil: "networkidle" });
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    for (const name of ["Projects", "Blog", "Contact"]) {
      await expect(nav.getByRole("link", { name, exact: true }), name).toBeVisible();
    }
    await expect(nav.getByRole("link", { name: "Lab", exact: true })).toHaveCount(0);
    await nav.getByRole("link", { name: "Projects", exact: true }).click();
    await expect(page).toHaveURL(/\/projects$/);
  });

  test("mobile drawer traps focus and returns it to the toggle", async ({ page, isMobile }) => {
    test.skip(!isMobile, "drawer is the narrow-screen navigation");
    await page.goto("/", { waitUntil: "networkidle" });
    const toggle = page.getByRole("button", { name: "Toggle navigation" });
    const drawer = page.getByRole("dialog", { name: "Mobile navigation" });
    await expect(async () => {
      await toggle.click();
      await expect(drawer).toBeVisible({ timeout: 1000 });
    }).toPass({ timeout: 10_000 });
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect
      .poll(() => drawer.evaluate((d) => d.contains(document.activeElement)))
      .toBe(true);
    await expect(drawer.getByRole("link", { name: "Lab", exact: true })).toHaveCount(0);
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press("Tab");
      expect(await drawer.evaluate((d) => d.contains(document.activeElement)), `tab ${i + 1}`).toBe(true);
    }
    await page.keyboard.press("Shift+Tab");
    expect(await drawer.evaluate((d) => d.contains(document.activeElement))).toBe(true);
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
    await expect(toggle).toBeFocused();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  test("command palette opens with Ctrl/Cmd+K and Escape returns focus", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const logo = page.getByRole("link", { name: "Dhruv Singhal — Home" });
    await logo.focus();
    await expect(logo).toBeFocused();
    const dialog = page.getByRole("dialog", { name: "Command palette" });
    await expect(async () => {
      await page.keyboard.press("ControlOrMeta+k");
      await expect(dialog).toBeVisible({ timeout: 1000 });
    }).toPass({ timeout: 10_000 });
    await expect(dialog.getByRole("combobox", { name: "Search commands" }).or(dialog.getByLabel("Search commands"))).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(logo).toBeFocused();
  });

  test("command palette lists exactly the published articles, from content", async ({ page }) => {
    await page.goto("/blog", { waitUntil: "networkidle" });
    const indexTitles = (
      await page.locator('main a[href^="/blog/"] h2').allInnerTexts()
    ).map((t) => t.trim());
    expect(indexTitles.length).toBeGreaterThan(0);

    const dialog = page.getByRole("dialog", { name: "Command palette" });
    await expect(async () => {
      await page.keyboard.press("ControlOrMeta+k");
      await expect(dialog).toBeVisible({ timeout: 1000 });
    }).toPass({ timeout: 10_000 });
    const paletteTitles = (
      await dialog
        .locator('[data-palette-group="Blog Articles"] [data-palette-item]')
        .allInnerTexts()
    ).map((t) => t.trim());
    expect([...paletteTitles].sort()).toEqual([...indexTitles].sort());

    // Case studies come from content too: never withdrawn or private work.
    // Counted against the public manifest rather than matched against names,
    // so this file never names the private drafts it guards against.
    const caseStudyItems = await dialog
      .locator('[data-palette-group="Case Studies"] [data-palette-item]')
      .allInnerTexts();
    expect(caseStudyItems).toHaveLength(ROUTES.filter((r) => r.kind === "case-study").length);
    expect(caseStudyItems.join(" | ")).not.toMatch(/churn/i);
    await page.keyboard.press("Escape");
  });

  test("the withheld Aarchid eval figure appears on none of the main pages", async ({ page }) => {
    // Owner decision (3 Oct 2026): no 92% anywhere until the eval artefact or
    // the co-builder's confirmation is available.
    for (const route of ["/", "/about", "/now", "/ai-pm", "/projects"]) {
      await page.goto(route, { waitUntil: "networkidle" });
      const text = await page.locator("body").innerText();
      expect(text, route).not.toMatch(/\b92\s*%/);
    }
  });

  test("theme choice persists across client and full navigation", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const html = page.locator("html");
    const initial = await html.getAttribute("data-theme");
    const target = initial === "dark" ? "light" : "dark";
    const toggle = page.getByRole("button", { name: /toggle theme|theme/i }).first();
    await expect(async () => {
      if ((await html.getAttribute("data-theme")) !== target) await toggle.click();
      expect(await html.getAttribute("data-theme")).toBe(target);
    }).toPass({ timeout: 15_000 });
    const stored = await page.evaluate(() => localStorage.getItem("ds-portfolio-theme"));
    expect(JSON.parse(stored ?? "{}").mode).toBe(target);

    // Client-side navigation through an in-page link.
    await page.locator('main a[href="/projects"]').first().click();
    await expect(page).toHaveURL(/\/projects$/);
    await expect(html).toHaveAttribute("data-theme", target);
    await page.goto("/blog", { waitUntil: "domcontentloaded" });
    await expect(html).toHaveAttribute("data-theme", target);
  });

  test("resume link resolves to a PDF", async ({ page, request }) => {
    await page.goto("/contact", { waitUntil: "domcontentloaded" });
    const hrefs = await page.locator('a[href*="/resume/"]').evaluateAll((els) =>
      els.map((e) => e.getAttribute("href"))
    );
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of new Set(hrefs)) expect(href).toBe(RESUME);
    const res = await request.get(RESUME);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("application/pdf");
    expect((await res.body()).subarray(0, 5).toString()).toBe("%PDF-");
  });
});
