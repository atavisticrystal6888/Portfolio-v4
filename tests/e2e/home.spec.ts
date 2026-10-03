import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

/**
 * Home page regressions for the September 2026 fix batch:
 *  - testimonials must not auto-advance (no timer in the component) and,
 *    while the owner confirms the quotes, are not rendered at all;
 *  - the writing section must always link to the full archive with the real
 *    article count, even though only a curated subset is rendered on home.
 */

/** Every article in the archive, the same way getAllBlogPosts() counts them. */
function publishedArticleCount(): number {
  const dir = path.join(process.cwd(), "content", "blog");
  return fs.readdirSync(dir).filter((f) => /\.mdx?$/.test(f)).length;
}

test.describe("Home page", () => {
  // Was: "testimonials stay put over time and only move on manual controls".
  // The References section is no longer rendered (the two quotes have no
  // source in the claim ledger; owner decision pending), so the runtime check
  // cannot run on /. It is replaced by checks that hold whether or not the
  // section returns: nothing renders today, the component has no timer that
  // could auto-advance, and the data carries no metric badge.
  test("references stay off home; the carousel has no autoplay timer and no metric badges", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("region", { name: "Testimonials" })).toHaveCount(0);
    await expect(page.getByRole("region", { name: "References", exact: true })).toHaveCount(0);

    const source = fs.readFileSync(
      path.join(process.cwd(), "src", "components", "home", "TestimonialCarousel.tsx"),
      "utf-8"
    );
    expect(source, "no autoplay timer").not.toMatch(/setInterval|setTimeout/);
    expect(source, "no metric badge").not.toMatch(/outcomeMetric|MetricCounter/);

    const data = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "content", "testimonials.json"), "utf-8")
    ) as Array<Record<string, unknown>>;
    for (const t of data) expect(t, String(t.id)).not.toHaveProperty("outcomeMetric");
  });

  test("writing section links to the whole archive with the real article count", async ({
    page,
  }) => {
    const total = publishedArticleCount();
    expect(total).toBeGreaterThan(0);

    await page.goto("/");
    const writing = page.getByRole("region", { name: "Writing" });
    await expect(writing).toBeVisible();

    // Home shows a curated subset; the archive link must still count them all.
    const articleLinks = writing.getByRole("link").filter({
      has: page.locator("time"),
    });
    const shown = await articleLinks.count();
    expect(shown).toBeGreaterThan(0);
    expect(shown).toBeLessThanOrEqual(total);

    const archiveLink = writing.getByRole("link", {
      name: new RegExp(`^All ${total} articles`),
    });
    await expect(archiveLink).toBeVisible();
    await expect(archiveLink).toHaveText(`All ${total} articles →`);
    await expect(archiveLink).toHaveAttribute("href", "/blog");
  });
});
