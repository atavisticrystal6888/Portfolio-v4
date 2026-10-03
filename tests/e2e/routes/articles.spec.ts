import fs from "node:fs";
import nodePath from "node:path";
import { test, expect, type Page } from "@playwright/test";
import { routesOfKind } from "../route-manifest";

/*
 * Every article: readable title, reachable sections, a working table of
 * contents where the post is long enough, a way back to the blog, and list
 * markup that renders as real lists.
 */
const ARTICLES = routesOfKind("article").map((r) => r.path);
const TOC_MIN_H2 = 4;
const LIST_FIXED = new Set(["building-portfolio-as-product", "metrics-that-matter-for-pms"]);

const wide = (page: Page) => (page.viewportSize()?.width ?? 1280) >= 1200;

// Literals rather than imports from @/lib/site (Playwright does not resolve
// the app's aliases). Keep in sync with LINKEDIN_URL / GITHUB_URL there.
const LINKEDIN_URL = "https://linkedin.com/in/dhruvsinghal6888";
const GITHUB_URL = "https://github.com/atavisticrystal6888";

/** Frontmatter `date` / `updatedDate`, read straight from the MDX source. */
function frontmatterDates(slug: string): { date: string; updated: string | null } {
  const raw = fs.readFileSync(nodePath.join(process.cwd(), "content", "blog", `${slug}.mdx`), "utf-8");
  const fm = raw.split(/^---$/m)[1] ?? "";
  const pick = (key: string) => fm.match(new RegExp(`^${key}:\\s*"([^"]+)"`, "m"))?.[1] ?? null;
  const date = pick("date");
  if (!date) throw new Error(`${slug}: no date in frontmatter`);
  return { date, updated: pick("updatedDate") };
}

/** Every JSON-LD object of one @type on the page. */
async function jsonLdOfType(page: Page, type: string) {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  return blocks
    .flatMap((b) => {
      const parsed = JSON.parse(b);
      return Array.isArray(parsed) ? parsed : [parsed];
    })
    .filter((d) => d && d["@type"] === type);
}

test.describe("Articles", () => {
  test("manifest has the fourteen articles", () => {
    expect(ARTICLES).toHaveLength(14);
  });

  for (const path of ARTICLES) {
    const slug = path.split("/").pop()!;

    test(`${slug}: sections, table of contents and back to blog`, async ({ page }) => {
      const res = await page.goto(path, { waitUntil: "networkidle" });
      expect(res?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      const bodyH2 = page.locator("main article h2");
      const h2Count = await bodyH2.count();
      expect(h2Count, "article has sections").toBeGreaterThan(0);
      await bodyH2.first().scrollIntoViewIfNeeded();
      await expect(bodyH2.first()).toBeInViewport();

      const tocMenu = page.getByTestId("toc-menu");
      const tocAside = page.getByTestId("toc-aside");
      if (h2Count >= TOC_MIN_H2) {
        await page.evaluate(() => window.scrollTo(0, 0));
        // Jump to the last h2 chapter so the move is unmistakable.
        const lastId = await bodyH2.last().getAttribute("id");
        expect(lastId, "h2 has an id for the TOC").toBeTruthy();
        if (wide(page)) {
          await expect(tocAside).toBeVisible();
          await expect(tocMenu).toBeHidden();
          await tocAside.locator(`a[href="#${lastId}"]`).click();
        } else {
          await expect(tocMenu).toBeVisible();
          await expect(tocAside).toBeHidden();
          await expect(tocMenu.locator("summary")).toContainText("On this page");
          await expect(async () => {
            await tocMenu.locator("summary").click();
            await expect(tocMenu).toHaveAttribute("open", "", { timeout: 1000 });
          }).toPass({ timeout: 10_000 });
          await tocMenu.locator(`a[href="#${lastId}"]`).click();
          await expect(tocMenu).not.toHaveAttribute("open", "");
        }
        const target = page.locator(`[id="${lastId}"]`);
        await expect(target).toBeInViewport();
        await expect(target).toBeFocused();
        // Focus moves at once but the smooth scroll is still animating. In
        // Firefox a click's own scroll-into-view is overridden by that
        // animation, so wait until the page is still before the next click.
        await expect
          .poll(async () => {
            const before = await page.evaluate(() => window.scrollY);
            await page.waitForTimeout(120);
            return (await page.evaluate(() => window.scrollY)) === before;
          }, { message: "the chapter jump has finished scrolling" })
          .toBe(true);
      } else {
        await expect(tocMenu).toHaveCount(0);
        await expect(tocAside).toHaveCount(0);
      }

      // The top "Back to Blog" link became the breadcrumb's "Blog" step (held
      // to the same click-through below); the bottom button stays.
      const back = page.getByRole("link", { name: "Back to Blog" });
      await expect(back).toHaveCount(1);
      await back.click();
      await expect(page).toHaveURL(/\/blog$/);
      await expect(page.getByRole("searchbox", { name: "Search blog articles" })).toBeVisible();
    });

    test(`${slug}: breadcrumb trail and one BreadcrumbList`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      const h1 = (await page.getByRole("heading", { level: 1 }).textContent())?.trim() ?? "";
      const crumbs = page.getByRole("navigation", { name: "Breadcrumb" });
      await expect(crumbs).toHaveCount(1);
      await expect(crumbs).toBeVisible();
      await expect(crumbs.getByRole("link", { name: "Home", exact: true })).toHaveAttribute("href", "/");
      const blogCrumb = crumbs.getByRole("link", { name: "Blog", exact: true });
      await expect(blogCrumb).toHaveAttribute("href", "/blog");
      await expect(crumbs.locator('[aria-current="page"]')).toHaveText(h1);
      if ((page.viewportSize()?.width ?? 1280) < 768) {
        const box = await blogCrumb.boundingBox();
        expect(box?.height ?? 0, "Blog crumb is a 44px touch target").toBeGreaterThanOrEqual(44);
      }

      const lists = await jsonLdOfType(page, "BreadcrumbList");
      expect(lists, "exactly one BreadcrumbList").toHaveLength(1);
      const items = lists[0].itemListElement as { name: string; item: string }[];
      expect(items.map((i) => i.name)).toEqual(["Home", "Blog", h1]);
      for (const i of items) expect(i.item, "absolute breadcrumb URL").toMatch(/^https?:\/\//);
      expect(items[2]!.item.endsWith(path)).toBe(true);

      await blogCrumb.click();
      await expect(page).toHaveURL(/\/blog$/);
    });

    test(`${slug}: dates, author bio and BlogPosting author`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      const { date, updated } = frontmatterDates(slug);
      const header = page.locator("main header").first();
      await expect(header.locator(`time[datetime="${date}"]`).first()).toBeVisible();
      const updatedLine = page.getByTestId("article-updated");
      if (updated && updated !== date) {
        await expect(updatedLine).toBeVisible();
        await expect(updatedLine).toContainText("Updated");
        await expect(updatedLine.locator("time")).toHaveAttribute("datetime", updated);
      } else {
        await expect(updatedLine).toHaveCount(0);
      }

      const [article] = await jsonLdOfType(page, "BlogPosting");
      expect(article, "BlogPosting JSON-LD").toBeTruthy();
      expect(article.datePublished).toBe(date);
      expect(article.dateModified).toBe(updated ?? date);
      expect(article.author["@type"]).toBe("Person");
      expect(article.author.url).toMatch(/^https?:\/\/[^/]+\/about$/);
      expect(article.author.sameAs).toEqual(expect.arrayContaining([LINKEDIN_URL, GITHUB_URL]));

      const bio = page.getByTestId("author-bio");
      await expect(bio).toBeVisible();
      await expect(bio.getByRole("heading", { name: "About the author" })).toBeVisible();
      await expect(bio).toContainText("Dhruv Singhal");
      await expect(bio).toContainText(
        "Dhruv Singhal has about a year of product experience across internships, most recently as a product intern on the growth team at The Sleep Company (Jul–Oct 2026). He builds small, tested products and writes about AI evaluation, retention analytics and product judgment."
      );
      expect(await bio.textContent(), "no undated present-tense employment").not.toMatch(/\bis a product intern\b/);
      await expect(bio.getByRole("link", { name: "About Dhruv" })).toHaveAttribute("href", "/about");
      await expect(bio.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", LINKEDIN_URL);
      await expect(bio.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", GITHUB_URL);
      // The bio sits outside <article>, so it never becomes a body section.
      expect(await page.locator('main article [data-testid="author-bio"]').count()).toBe(0);
    });

    test(`${slug}: share copies an absolute link and says so`, async ({ page }) => {
      await page.addInitScript(() => {
        const w = window as unknown as { __copied: string[] };
        w.__copied = [];
        Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: { writeText: async (t: string) => void w.__copied.push(t) },
        });
      });
      let dialogs = 0;
      page.on("dialog", async (d) => {
        dialogs += 1;
        await d.dismiss();
      });
      await page.goto(path, { waitUntil: "networkidle" });
      await page.getByRole("button", { name: "Share article" }).click();
      await expect(page.getByTestId("share-status")).toHaveText("Link copied");
      const copied = await page.evaluate(() => (window as unknown as { __copied: string[] }).__copied);
      expect(copied).toHaveLength(1);
      expect(copied[0]).toMatch(new RegExp(`^https?://[^/]+${path}$`));
      expect(dialogs, "no alert() dialog").toBe(0);
    });

    test(`${slug}: tag line and section count read cleanly`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      const texts = await page.getByRole("list", { name: "Tags" }).getByRole("listitem").allTextContents();
      expect(texts.length).toBeGreaterThan(0);
      for (const t of texts) expect(t.trim(), "no separator inside a tag").not.toMatch(/^·|·$/);
      const summary = page.getByTestId("toc-menu").locator("summary");
      if (await summary.count()) {
        const name = ((await summary.textContent()) ?? "").replace(/\s+/g, " ");
        expect(name).toMatch(/On this page, \d+ sections/);
      }
    });

    test(`${slug}: inline-led paragraphs are wrapped and emphasis renders`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      const report = await page.evaluate(() => {
        const article = document.querySelector("main article");
        if (!article) return { found: false, bare: [] as string[], asterisks: [] as string[] };
        // The prose root is the element holding the most <p> children.
        let root: Element = article;
        let best = -1;
        for (const el of [article, ...Array.from(article.querySelectorAll("*"))]) {
          const n = Array.from(el.children).filter((c) => c.tagName === "P").length;
          if (n > best) {
            best = n;
            root = el;
          }
        }
        // Inline markup must never sit directly in the prose root: it means a
        // paragraph lost its <p>.
        const bare = Array.from(root.children)
          .filter((c) => ["STRONG", "EM", "A", "CODE"].includes(c.tagName))
          .map((c) => (c.textContent ?? "").slice(0, 60));
        // Prose text sitting directly in the root, outside any block.
        for (const n of Array.from(root.childNodes)) {
          if (n.nodeType === Node.TEXT_NODE && (n.textContent ?? "").trim()) {
            bare.push((n.textContent ?? "").trim().slice(0, 60));
          }
        }
        // Literal emphasis markers left in prose (outside code).
        const asterisks: string[] = [];
        for (const p of Array.from(root.querySelectorAll("p, li"))) {
          if (p.closest("pre, code")) continue;
          const clone = p.cloneNode(true) as Element;
          clone.querySelectorAll("code").forEach((c) => c.remove());
          const t = clone.textContent ?? "";
          if (/(^|\s)\*{1,2}[A-Za-z][^*]*\*{1,2}(\s|[.,;:]|$)/.test(t)) asterisks.push(t.slice(0, 80));
        }
        return { found: true, bare, asterisks };
      });
      expect(report.found).toBe(true);
      expect(report.bare, "inline markup outside a <p>").toEqual([]);
      expect(report.asterisks, "literal emphasis markers").toEqual([]);
    });

    test(`${slug}: list markup is valid`, async ({ page, request }) => {
      const html = await (await request.get(path)).text();
      expect(html, "<p> wrapping a list").not.toMatch(/<p[^>]*>\s*<(ul|ol)[\s>]/);
      expect(html, "<br> directly inside a list").not.toMatch(/<(ul|ol)[^>]*>\s*<br/);
      expect(html, "<br> between list items").not.toMatch(/<\/li>\s*<br\s*\/?>/);
      await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(await page.locator("main article ul > br, main article ol > br").count()).toBe(0);
      expect(await page.locator("main article ul > :not(li), main article ol > :not(li)").count()).toBe(0);
      if (LIST_FIXED.has(slug)) {
        expect(await page.locator("main article li").count(), "lists render as items").toBeGreaterThan(2);
      }
    });
  }
});
