import { test, expect } from "@playwright/test";
import { ROUTES, WITHDRAWN_ROUTES } from "../route-manifest";
import allowlist from "../../../content/approved-case-studies.json";

/*
 * Withdrawn work (/projects/churn-analysis) must 404 and must not be linked
 * or listed anywhere: sitemap, RSS, or any rendered page.
 */
test.describe("Withdrawn routes", () => {
  // Pure HTTP checks: browser-independent, run once.
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "HTTP-only checks run on chromium");
  });

  test("withdrawn routes are absent from the manifest and return 404", async ({ request }) => {
    for (const path of WITHDRAWN_ROUTES) {
      expect(ROUTES.map((r) => r.path)).not.toContain(path);
      const res = await request.get(path);
      expect(res.status(), path).toBe(404);
    }
  });

  test("absent from sitemap.xml and rss.xml", async ({ request }) => {
    for (const feed of ["/sitemap.xml", "/rss.xml"]) {
      const res = await request.get(feed);
      expect(res.status(), feed).toBe(200);
      const body = await res.text();
      for (const path of WITHDRAWN_ROUTES) {
        const slug = path.split("/").pop()!;
        expect(body, `${feed} mentions ${slug}`).not.toContain(slug);
      }
    }
  });

  test("sitemap.xml lists only approved case studies", async ({ request }) => {
    // content/approved-case-studies.json is the publication boundary.
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();
    const approved = new Set<string>(allowlist.approved);
    const slugs = [...body.matchAll(/\/projects\/([^<"'\s/?#]+)/g)].map((m) => m[1] ?? "");
    expect(slugs.length).toBeGreaterThan(0);
    const unapproved = slugs.filter((s) => !approved.has(s));
    expect(unapproved, `unapproved case studies in sitemap.xml: ${unapproved.join(", ")}`).toEqual([]);
  });

  test("absent from every rendered page in the manifest", async ({ request }) => {
    test.setTimeout(120_000);
    const offenders: string[] = [];
    for (const route of ROUTES) {
      const res = await request.get(route.path);
      expect(res.status(), route.path).toBe(route.expectStatus);
      const html = await res.text();
      for (const path of WITHDRAWN_ROUTES) {
        const slug = path.split("/").pop()!;
        if (html.includes(slug)) offenders.push(`${route.path} -> ${slug}`);
      }
      // The withdrawn study's name must not survive in prose either (the
      // changelog used to announce "Churn Analysis withdrawn").
      if (/Churn Analysis/i.test(html)) offenders.push(`${route.path} -> "Churn Analysis"`);
    }
    expect(offenders).toEqual([]);
  });
});
