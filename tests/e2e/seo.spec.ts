import { test, expect } from "@playwright/test";

const ROUTES = [
  { path: "/", title: "Dhruv Singhal" },
  { path: "/about", title: "About" },
  { path: "/projects", title: "Projects" },
  { path: "/blog", title: "Blog" },
  { path: "/contact", title: "Contact" },
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

  test("sitemap.xml is accessible", async ({ page }) => {
    const response = await page.goto("/sitemap.xml");
    expect(response?.status()).toBe(200);
    const content = await page.content();
    expect(content).toContain("<urlset");
  });

  test("robots.txt is accessible", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("Sitemap:");
  });
});
