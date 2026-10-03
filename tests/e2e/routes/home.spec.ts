import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";

interface RosterEntry {
  slug: string;
  hasCaseStudy?: boolean;
  productName?: string;
  decision?: string;
  imageUrl?: string | null;
  tier?: string;
}
const ROSTER: RosterEntry[] = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "content", "projects.json"), "utf-8")
);

/*
 * Home: the page's job is to get a reviewer from the thesis to the four
 * flagship stories and their evidence in one move. The References section is
 * deliberately not rendered until the owner confirms both quotes.
 */
const FLAGSHIP_ORDER = ["Aarchid", "DeskTasks", "Cohort & Retention Studio", "Sawari"];

test.describe("Home (/)", () => {
  test.beforeEach(async ({ page }) => {
    const res = await page.goto("/", { waitUntil: "networkidle" });
    expect(res?.status()).toBe(200);
  });

  test("hero CTA 'See the work' lands on the #work section", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const cta = page.getByRole("link", { name: "See the work" });
    await expect(cta).toHaveAttribute("href", "#work");
    await cta.click();
    await expect(page).toHaveURL(/#work$/);
    await expect(page.locator("#work")).toBeInViewport({ ratio: 0.1 });
    await expect(
      page.getByRole("heading", { level: 2, name: "Four stories, one PM decision each" })
    ).toBeVisible();
  });

  test("four flagship stories in order, each with status, evidence and ownership", async ({ page }) => {
    const carousel = page.getByRole("group", { name: "Flagship products", exact: true });
    const slides = carousel.locator('[aria-roledescription="slide"]');
    await expect(slides).toHaveCount(4);
    const names = await slides.locator("h3").allInnerTexts();
    expect(names.map((n) => n.trim())).toEqual(FLAGSHIP_ORDER);
    for (let i = 0; i < 4; i++) {
      const slide = slides.nth(i);
      await expect(slide.getByTestId("status-pill"), `${FLAGSHIP_ORDER[i]} status`).toHaveCount(1);
      await expect(slide.getByTestId("evidence-chip"), `${FLAGSHIP_ORDER[i]} evidence`).toHaveCount(1);
      await expect(slide.getByTestId("ownership-line"), `${FLAGSHIP_ORDER[i]} ownership`).toHaveCount(1);
    }
    await expect(slides.nth(0).getByTestId("ownership-line")).toContainText("Co-built with Dilpreet Grover");
    await expect(slides.nth(2).getByTestId("status-pill")).toContainText(/local pilot/i);
    await expect(slides.nth(3).getByTestId("status-pill")).toContainText(/not deployed/i);
  });

  test("imageless flagship plates carry the PM decision, not an empty-slot note", async ({ page }) => {
    const carousel = page.getByRole("group", { name: "Flagship products", exact: true });
    const plates = carousel.getByTestId("card-plate");
    const imageless = ROSTER.filter((p) => p.tier === "flagship" && !p.imageUrl);
    expect(imageless.length, "imageless flagships").toBeGreaterThan(0);
    await expect(plates).toHaveCount(imageless.length);
    for (let i = 0; i < imageless.length; i++) {
      const entry = imageless[i]!;
      const plate = plates.filter({ hasText: entry.productName ?? entry.slug });
      await expect(plate, entry.slug).toHaveCount(1);
      await expect(plate).toContainText(entry.decision!);
      await expect(plate).not.toContainText(/screenshot not published/i);
    }
    await expect(carousel).not.toContainText(/screenshot not published/i);
  });

  test("hero states the most recent role with its dates, not an undated 'Currently'", async ({ page }) => {
    const hero = page.getByRole("region", { name: "Introduction" });
    await expect(hero).toContainText("Product Intern, Growth · The Sleep Company (Jul–Oct 2026)");
    await expect(hero).not.toContainText(/Currently/i);
  });

  test("hero states what every case study below contains", async ({ page }) => {
    await expect(page.getByTestId("hero-guide")).toHaveText(
      "Four case studies below. Each states the decision, the trade-off, what was tested, and what is still unproven."
    );
  });

  test("carousel next/previous changes the active slide", async ({ page }) => {
    const carousel = page.getByRole("group", { name: "Flagship products", exact: true });
    const status = carousel.getByRole("status");
    await expect(status).toHaveText("Slide 1 of 4: Aarchid");
    const next = carousel.getByRole("button", { name: "Next product" });
    const prev = carousel.getByRole("button", { name: "Previous product" });
    await expect(prev).toBeDisabled();
    await expect(async () => {
      await next.click();
      await expect(status).toHaveText("Slide 2 of 4: DeskTasks", { timeout: 1500 });
    }).toPass({ timeout: 10_000 });
    await expect(
      carousel.getByRole("button", { name: "Go to DeskTasks, 2 of 4" })
    ).toHaveAttribute("aria-current", "true");
    await prev.click();
    await expect(status).toHaveText("Slide 1 of 4: Aarchid");
  });

  test("evidence section, no unconfirmed references, and no 'myself' or withdrawn work", async ({ page }) => {
    await expect(
      page.getByRole("heading", { level: 2, name: "What the evidence supports" })
    ).toBeVisible();
    // The quotes have no source in the claim ledger: the section stays off
    // until the owner confirms them, and no metric badge may sit beside one.
    await expect(page.getByRole("region", { name: "References", exact: true })).toHaveCount(0);
    await expect(page.getByRole("region", { name: "Testimonials" })).toHaveCount(0);
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toMatch(/Workflow Scenarios Scoped|Retention Improvement/i);
    expect(bodyText).not.toMatch(/\bmyself\b/i);
    expect(await page.content()).not.toContain("churn-analysis");
  });

  test("contents index numbers match the section labels they point to", async ({ page, isMobile }) => {
    test.skip(isMobile, "the contents index is shown from 1000px");
    const contents = page.getByRole("navigation", { name: "Page contents" });
    const links = contents.getByRole("link");
    await expect(links).toHaveCount(5);
    for (let i = 0; i < 5; i++) {
      const link = links.nth(i);
      const href = (await link.getAttribute("href"))!;
      const index = String(i + 1).padStart(2, "0");
      await expect(link, href).toContainText(index);
      const target = page.locator(href);
      await expect(target, href).toHaveCount(1);
      // The section's own SectionLabel carries the same number.
      await expect(target.getByText(index, { exact: true }).first(), href).toBeAttached();
    }
  });

  test("Also built rows state the contribution, including the TCS NQT credit", async ({ page }) => {
    const rows = page.getByTestId("also-built-ownership");
    const expected = ROSTER.filter((p) => p.tier !== "flagship" && p.hasCaseStudy !== false);
    await expect(rows).toHaveCount(expected.length);
    await expect(rows.filter({ hasText: /three other contributors/i })).toHaveCount(1);
  });

  test("the PM decision on image cards is shown in full, not clamped", async ({ page }) => {
    const decisions = page
      .getByRole("group", { name: "Flagship products", exact: true })
      .getByTestId("card-decision");
    const n = await decisions.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      const clipped = await decisions.nth(i).evaluate((el) => {
        // sr-only copies (imageless plates) are visually hidden, not clipped text.
        if (getComputedStyle(el).position === "absolute") return false;
        return el.scrollHeight > el.clientHeight + 1;
      });
      expect(clipped, `decision ${i}`).toBe(false);
    }
  });
});

/* The primary CTA and the guide line must be inside the first screen. */
for (const viewport of [
  { width: 1440, height: 900 },
  { width: 320, height: 700 },
]) {
  test(`first screen at ${viewport.width}x${viewport.height} shows the CTA and the guide line`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.getByRole("link", { name: "See the work" })).toBeInViewport({ ratio: 1 });
    const box = await page.getByTestId("hero-guide").boundingBox();
    expect(box, "guide line box").not.toBeNull();
    expect(box!.y + box!.height, "guide line bottom").toBeLessThanOrEqual(viewport.height);
  });
}
