import { test, expect } from "@playwright/test";

/* About: who Dhruv is, with exact contribution verbs (Aarchid is co-built). */
test.describe("About (/about)", () => {
  test("story, experience and principles render with the co-built Aarchid credit", async ({ page }) => {
    const res = await page.goto("/about", { waitUntil: "networkidle" });
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: "Dhruv Singhal" })).toBeVisible();
    for (const name of ["Philosophy", "Biography", "Skills", "Experience", "How I work"]) {
      await expect(page.getByRole("region", { name, exact: true }), name).toBeVisible();
    }
    const bio = page.getByRole("region", { name: "Biography" });
    await expect(bio).toContainText(/co-built with/i);
    await expect(bio.getByRole("link", { name: "Dilpreet Grover" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Experience" })).toContainText("The Sleep Company");

    const text = await page.locator("main").innerText();
    expect(text).not.toMatch(/\bmyself\b/i);
    // Title backed by the evidence ledger; no unbacked "Product Manager Intern".
    await expect(page.getByRole("region", { name: "Experience" })).toContainText("Product Intern, Growth");
    // Dated tenure, never "Present" (the internship ends 9 Oct 2026).
    await expect(page.getByRole("region", { name: "Experience" })).toContainText("Jul 2026 – Oct 2026");
    await expect(page.getByRole("region", { name: "Experience" })).not.toContainText("Present");
    expect(text).not.toMatch(/Product Manager Intern/);
    // Internal Wipro platform names stay off the page (owner gate).
    expect(text).not.toMatch(/Auriga|Crew Mobile|Non-Crew Records/);
    // Achievements match the resume exactly (3rd, Top 5, Top 10), never the
    // old unbacked "1st Place" / "Winner" / "National Finalist".
    const achievements = page.getByRole("region", { name: "Achievements" });
    await expect(achievements).toContainText("3rd Place");
    await expect(achievements).toContainText("Top 5.");
    await expect(achievements).toContainText("Code Clash (VIT Vellore)");
    await expect(achievements).toContainText("Top 10.");
    expect(text).not.toMatch(/1st Place|National Finalist|\bWinner\b/);
    // Aarchid must never be described as solo work.
    for (const sentence of text.split(/(?<=[.!?\n])\s+/)) {
      if (/Aarchid/.test(sentence)) expect(sentence, sentence).not.toMatch(/\bsolo\b/i);
    }
  });

  test("experience comes before skills, and skills carry no scores or chart", async ({ page }) => {
    await page.goto("/about", { waitUntil: "networkidle" });
    const order = await page
      .locator("main section[aria-label]")
      .evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")));
    expect(order.indexOf("Experience")).toBeGreaterThan(-1);
    expect(order.indexOf("Experience"), order.join(", ")).toBeLessThan(order.indexOf("Skills"));
    const skills = page.getByRole("region", { name: "Skills", exact: true });
    await expect(skills.locator("canvas")).toHaveCount(0);
    await expect(skills).not.toContainText(/\d+%/);
    await expect(skills.getByRole("listitem").first()).toBeVisible();
  });

  test("links onward to /now, /bookshelf, /uses and /changelog from the copy", async ({ page }) => {
    await page.goto("/about", { waitUntil: "networkidle" });
    const main = page.locator("main");
    for (const href of ["/now", "/bookshelf", "/uses", "/changelog"]) {
      await expect(main.locator(`a[href="${href}"]`).first(), href).toBeVisible();
    }
  });
});
