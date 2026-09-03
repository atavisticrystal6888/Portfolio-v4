import { test, expect } from "@playwright/test";

const ROUTES = [
  { path: "/", title: "Dhruv Singhal" },
  { path: "/about", title: "About" },
  { path: "/projects", title: "Projects" },
  { path: "/blog", title: "Blog" },
  { path: "/contact", title: "Contact" },
];

// Duplicated rather than imported from @/lib/site: Playwright's loader does not
// share the app's module aliasing, and a literal here is also a second pair of
// eyes on the value that actually reaches the browser tab.
// Keep in sync with SITE_NAME / SITE_TITLE in src/lib/site.ts.
const SITE_NAME = "Dhruv Singhal";
const SITE_TITLE = "Dhruv Singhal — Product Manager & Builder";
const TITLE_SUFFIX = ` | ${SITE_NAME}`;

/** Google truncates past ~160; under 50 is too thin to be worth indexing. */
const DESCRIPTION_MIN = 50;
const DESCRIPTION_MAX = 160;

/**
 * Every route a visitor (or a crawler) can reach, plus a URL that cannot
 * resolve so the 404 is held to the same standard as a real page.
 * The blog slug is pinned: if the post is renamed this test should fail loudly
 * rather than quietly stop covering article metadata.
 */
const TITLE_ROUTES = [
  "/",
  "/about",
  "/projects",
  "/projects/aarchid",
  "/blog",
  "/blog/why-pms-should-code",
  "/ai-pm",
  "/lab",
  "/contact",
  "/now",
  "/uses",
  "/bookshelf",
  "/changelog",
  "/no-such-page-here-404",
];

test.describe("SEO metadata", () => {
  for (const { path, title } of ROUTES) {
    test(`${path} has correct title and description`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveTitle(new RegExp(title, "i"));

      const description = await page
        .locator('meta[name="description"]')
        .getAttribute("content");
      expect(description).toBeTruthy();
      expect(description!.length).toBeGreaterThan(20);
    });

    test(`${path} has canonical URL`, async ({ page }) => {
      await page.goto(path);
      const canonical = await page
        .locator('link[rel="canonical"]')
        .getAttribute("href");
      expect(canonical).toBeTruthy();
    });

    test(`${path} has OpenGraph tags`, async ({ page }) => {
      await page.goto(path);
      const ogTitle = await page
        .locator('meta[property="og:title"]')
        .getAttribute("content");
      const ogDescription = await page
        .locator('meta[property="og:description"]')
        .getAttribute("content");
      expect(ogTitle).toBeTruthy();
      expect(ogDescription).toBeTruthy();
    });
  }

  for (const path of TITLE_ROUTES) {
    test(`${path} has a well-formed title and a 50-160 char description`, async ({
      page,
    }) => {
      await page.goto(path);

      const title = await page.title();
      expect(title.trim().length, `${path} has an empty <title>`).toBeGreaterThan(0);

      if (path === "/") {
        // Home opts out of the `%s | Dhruv Singhal` template via `absolute`,
        // so its tab reads as the site's own name, not a section of it.
        expect(title, "home title should be the absolute site title").toBe(SITE_TITLE);
      } else {
        expect(
          title.endsWith(TITLE_SUFFIX),
          `${path} title "${title}" should end with "${TITLE_SUFFIX}"`
        ).toBe(true);
      }

      // A page that hard-codes the suffix AND inherits the template ends up
      // saying the name twice. Cheap to check, easy to regress.
      expect(title, `${path} repeats the site name`).not.toContain(
        `${TITLE_SUFFIX}${TITLE_SUFFIX}`
      );

      const description = await page
        .locator('meta[name="description"]')
        .getAttribute("content");
      expect(description, `${path} has no meta description`).toBeTruthy();
      expect(
        description!.length,
        `${path} description is ${description!.length} chars: ${description}`
      ).toBeGreaterThanOrEqual(DESCRIPTION_MIN);
      expect(
        description!.length,
        `${path} description is ${description!.length} chars: ${description}`
      ).toBeLessThanOrEqual(DESCRIPTION_MAX);
    });
  }

  test("titles are unique across routes", async ({ page }) => {
    const seen = new Map<string, string>();
    for (const path of TITLE_ROUTES) {
      await page.goto(path);
      const title = await page.title();
      expect(seen.has(title), `${path} shares its title with ${seen.get(title)}`).toBe(false);
      seen.set(title, path);
    }
  });

  test("home page has Person JSON-LD", async ({ page }) => {
    await page.goto("/");
    const jsonLdScripts = await page
      .locator('script[type="application/ld+json"]')
      .all();
    expect(jsonLdScripts.length).toBeGreaterThan(0);

    const contents = await Promise.all(
      jsonLdScripts.map((s) => s.textContent())
    );
    const hasPersonSchema = contents.some((c) => c?.includes('"@type":"Person"'));
    expect(hasPersonSchema).toBe(true);
  });

  test("sitemap.xml is accessible", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("<urlset");
  });

  test("robots.txt is accessible", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("Sitemap:");
  });
});
