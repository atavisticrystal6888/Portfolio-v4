import { test, expect } from "@playwright/test";

const routes = ["/", "/about", "/projects", "/blog", "/contact", "/now"];

test.describe("Broken link detection", () => {
  for (const route of routes) {
    test(`internal links resolve on ${route}`, async ({ page, request }) => {
      await page.goto(route, { waitUntil: "networkidle" });

      const hrefs = await page.$$eval("a[href]", (anchors) =>
        anchors
          .map((a) => (a as HTMLAnchorElement).getAttribute("href") || "")
          .filter(
            (href) =>
              href.startsWith("/") &&
              !href.startsWith("//") &&
              !href.startsWith("/api/") &&
              !href.startsWith("#")
          )
      );

      const unique = Array.from(new Set(hrefs));
      const broken: Array<{ href: string; status: number }> = [];

      for (const href of unique) {
        const url = new URL(href, page.url()).toString();
        const response = await request.get(url, { failOnStatusCode: false });
        if (response.status() >= 400) {
          broken.push({ href, status: response.status() });
        }
      }

      expect(broken, `Broken links on ${route}: ${JSON.stringify(broken)}`).toEqual([]);
    });
  }
});
