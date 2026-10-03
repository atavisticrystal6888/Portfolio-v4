import { test, expect, type APIRequestContext, type TestInfo } from "@playwright/test";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { ROUTES as MANIFEST_ROUTES, WITHDRAWN_ROUTES, NOT_FOUND_PATH } from "./route-manifest";

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

// Private drafts live in the gitignored content/private-drafts/. Their slugs
// are read from disk so the public repo never names them; in CI the folder
// does not exist and only the withdrawn routes are probed.
const PRIVATE_DRAFTS_DIR = path.join(process.cwd(), "content", "private-drafts");
const PRIVATE_DRAFT_SLUGS = fs.existsSync(PRIVATE_DRAFTS_DIR)
  ? fs.readdirSync(PRIVATE_DRAFTS_DIR).filter((f) => f.endsWith(".mdx")).map((f) => f.replace(/\.mdx$/, ""))
  : [];
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

  test("titles are unique across routes", async ({ context }) => {
    // One test visits every route in turn; the default 30 s budget is too
    // tight for WebKit when the rest of the suite runs in parallel.
    test.setTimeout(120_000);
    const seen = new Map<string, string>();
    for (const path of TITLE_ROUTES) {
      // A fresh tab per route: Playwright's Windows WebKit build often never
      // fires `load` for a 404 document reached late in a long single-tab
      // walk (reproduced with JavaScript disabled, so it is not site code).
      const page = await context.newPage();
      await page.goto(path);
      const title = await page.title();
      expect(seen.has(title), `${path} shares its title with ${seen.get(title)}`).toBe(false);
      seen.set(title, path);
      await page.close();
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

/* -------------------------------------------------------------------------- */
/* SEO baseline (docs/audits/2026-10-02-seo-checklist.md). Assertions run     */
/* against server output for all 35 public routes in the route manifest.      */
/* -------------------------------------------------------------------------- */

// Literals on purpose (see the note above SITE_NAME): keep in sync with src/lib/site.ts.
const SITE_URL = "https://dhruvsinghal.codes";
const LINKEDIN_URL = "https://linkedin.com/in/dhruvsinghal6888";
const GITHUB_URL = "https://github.com/atavisticrystal6888";

const PUBLIC_ROUTES = MANIFEST_ROUTES.filter((r) => r.expectStatus === 200);
const ARTICLES = PUBLIC_ROUTES.filter((r) => r.kind === "article");
const CONTENT_DIR = path.join(process.cwd(), "content");

/** Slugs that live only in content/private-drafts or content/withdrawn. */
const HIDDEN_SLUGS = ["private-drafts", "withdrawn"].flatMap((dir) => {
  const full = path.join(CONTENT_DIR, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => /\.(mdx?|json)$/.test(f) && !/^readme\.md$/i.test(f))
    .map((f) => f.replace(/\.(mdx?|json)$/, ""));
});

/**
 * Titles allowed past 60 chars, each named with its reason. A ceiling still
 * applies (70): these are full headlines where cutting further would change
 * the claim. This is a named list, not a blanket opt-out.
 */
const TITLE_MAX = 60;
const TITLE_CEILING = 70;
const LONG_TITLE_EXCEPTIONS: Record<string, string> = {
  "/projects/better-half": "product name plus the one-line positioning that defines it (61)",
  "/projects/experiment-hub": "product name plus 'Self-Hosted A/B Testing Platform' (64)",
  "/blog/metrics-that-matter-for-pms": "full headline; the 'three metrics' is the argument (62)",
  "/blog/one-year-of-pm-internships": "full headline; 'internships' must stay to avoid overclaiming (64)",
  "/blog/privacy-contract-regression-suite": "full headline names both halves of the method (66)",
  "/blog/designing-self-hosted-experimentation-platform": "full headline (64)",
};

const urlFor = (p: string) => (p === "/" ? SITE_URL : `${SITE_URL}${p}`);
const stripSlash = (u: string) => u.replace(/\/$/, "");

/** gray-matter yields a Date for unquoted YAML dates and a string for quoted ones. */
function contentDate(value: unknown): string | undefined {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value.toISOString().slice(0, 10);
  if (typeof value === "string" && value.trim() !== "") return value.trim();
  return undefined;
}

function frontmatter(dir: "blog" | "case-studies", slug: string): Record<string, unknown> {
  return matter(fs.readFileSync(path.join(CONTENT_DIR, dir, `${slug}.mdx`), "utf-8")).data;
}

const decode = (s: string) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");

/** Normalises whitespace and typographic quotes for text comparisons. */
const norm = (s: string) =>
  s
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, " ")
    .trim();

interface ParsedPage {
  status: number;
  headers: Record<string, string>;
  html: string;
  titles: string[];
  metas: { name?: string; property?: string; content?: string }[];
  canonicals: string[];
  jsonLd: Record<string, unknown>[];
}

function attr(tag: string, name: string): string | undefined {
  const m = tag.match(new RegExp(`\\s${name}=(?:"([^"]*)"|'([^']*)')`, "i"));
  return m ? decode(m[1] ?? m[2] ?? "") : undefined;
}

function parse(status: number, headers: Record<string, string>, html: string): ParsedPage {
  const jsonLd = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map(
    (m) => JSON.parse(m[1]!) as Record<string, unknown>
  );
  // Drop scripts (the RSC payload) so only real tags are read.
  const markup = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  return {
    status,
    headers,
    html,
    titles: [...markup.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi)].map((m) => decode(m[1]!)),
    metas: [...markup.matchAll(/<meta\b[^>]*>/gi)].map((m) => ({
      name: attr(m[0], "name"),
      property: attr(m[0], "property"),
      content: attr(m[0], "content"),
    })),
    canonicals: [...markup.matchAll(/<link\b[^>]*>/gi)]
      .map((m) => m[0])
      .filter((t) => attr(t, "rel") === "canonical")
      .map((t) => attr(t, "href") ?? ""),
    jsonLd,
  };
}

const pageCache = new Map<string, Promise<ParsedPage>>();
function fetchPage(request: APIRequestContext, p: string): Promise<ParsedPage> {
  if (!pageCache.has(p)) {
    pageCache.set(
      p,
      request.get(p, { maxRedirects: 0 }).then(async (res) => parse(res.status(), res.headers(), await res.text()))
    );
  }
  return pageCache.get(p)!;
}

const metaContent = (page: ParsedPage, name: string) =>
  page.metas.filter((m) => m.name === name).map((m) => m.content ?? "");

/** HTTP-level checks are browser-independent: run them once, on chromium. */
function httpOnly(testInfo: TestInfo) {
  test.skip(testInfo.project.name !== "chromium", "HTTP-level check; browser-independent, runs on chromium only");
}

test.describe("SEO baseline: sitemap, robots, rss", () => {
  test("sitemap.xml lists exactly the public manifest routes, nothing withdrawn or private", async ({ request }, testInfo) => {
    httpOnly(testInfo);
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const xml = await res.text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);
    expect(locs.map((l) => (l === SITE_URL ? "/" : l.replace(SITE_URL, ""))).sort()).toEqual(
      PUBLIC_ROUTES.map((r) => r.path).sort()
    );
    for (const loc of locs) {
      expect(loc.startsWith(SITE_URL), `${loc} is not on the preferred host`).toBe(true);
    }
    for (const withdrawn of WITHDRAWN_ROUTES) expect(xml).not.toContain(withdrawn);
    expect(HIDDEN_SLUGS).toContain("churn-analysis");
    for (const slug of HIDDEN_SLUGS) expect(xml, `sitemap mentions hidden slug ${slug}`).not.toContain(`/${slug}<`);
  });

  test("sitemap lastmod: absent on static pages, equal to content dates elsewhere", async ({ request }, testInfo) => {
    httpOnly(testInfo);
    const xml = await (await request.get("/sitemap.xml")).text();
    const entries = new Map(
      [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => {
        const loc = m[1]!.match(/<loc>([^<]+)<\/loc>/)![1]!;
        const lastmod = m[1]!.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
        return [loc === SITE_URL ? "/" : loc.replace(SITE_URL, ""), lastmod] as const;
      })
    );
    const projects: { slug: string; lastVerified?: string }[] = JSON.parse(
      fs.readFileSync(path.join(CONTENT_DIR, "projects.json"), "utf-8")
    );
    for (const route of PUBLIC_ROUTES) {
      const lastmod = entries.get(route.path);
      if (route.kind === "index" || route.kind === "utility") {
        expect(lastmod, `${route.path} must not claim a build-time lastmod`).toBeUndefined();
      } else if (route.kind === "case-study") {
        const slug = route.path.replace("/projects/", "");
        const expected = contentDate(projects.find((p) => p.slug === slug)?.lastVerified);
        expect(expected, `${slug} has no lastVerified in projects.json`).toBeTruthy();
        expect(lastmod, route.path).toBe(expected);
      } else if (route.kind === "article") {
        const fm = frontmatter("blog", route.path.replace("/blog/", ""));
        expect(lastmod, route.path).toBe(contentDate(fm.updatedDate) ?? contentDate(fm.date));
      }
    }
  });

  test("robots.txt references the absolute sitemap and blocks no public path", async ({ request }, testInfo) => {
    httpOnly(testInfo);
    const body = await (await request.get("/robots.txt")).text();
    expect(body).toMatch(new RegExp(`^Sitemap: ${SITE_URL.replace(/\./g, "\\.")}/sitemap\\.xml$`, "m"));
    expect(body, "Host is a non-standard directive").not.toMatch(/^Host:/im);
    const disallows = [...body.matchAll(/^Disallow:\s*(\S*)\s*$/gim)].map((m) => m[1]!).filter(Boolean);
    for (const route of PUBLIC_ROUTES) {
      for (const rule of disallows) {
        expect(route.path.startsWith(rule), `robots.txt Disallow ${rule} blocks ${route.path}`).toBe(false);
      }
    }
  });

  test("rss.xml lists every article with its frontmatter date and nothing hidden", async ({ request }, testInfo) => {
    httpOnly(testInfo);
    const res = await request.get("/rss.xml");
    expect(res.status()).toBe(200);
    const xml = await res.text();
    const links = [...xml.matchAll(/<item>[\s\S]*?<link>([^<]+)<\/link>/g)].map((m) => m[1]!.replace(SITE_URL, ""));
    expect(links.sort()).toEqual(ARTICLES.map((r) => r.path).sort());
    for (const slug of HIDDEN_SLUGS) expect(xml).not.toContain(`/${slug}<`);
    for (const route of ARTICLES) {
      const fm = frontmatter("blog", route.path.replace("/blog/", ""));
      const item = xml.split("<item>").find((c) => c.includes(`${route.path}</link>`))!;
      expect(item, route.path).toContain(`<pubDate>${new Date(contentDate(fm.date)!).toUTCString()}</pubDate>`);
    }
  });
});

test.describe("SEO baseline: per-page head", () => {
  test("every public page: one absolute self-referencing canonical, indexable, no X-Robots-Tag", async ({ request }, testInfo) => {
    httpOnly(testInfo);
    for (const route of PUBLIC_ROUTES) {
      const page = await fetchPage(request, route.path);
      expect(page.status, route.path).toBe(200);
      expect(page.canonicals, `${route.path} canonical count`).toHaveLength(1);
      expect(page.canonicals[0], `${route.path} canonical`).toBe(urlFor(route.path));
      expect(page.headers["x-robots-tag"], `${route.path} X-Robots-Tag`).toBeUndefined();
      for (const name of ["robots", "googlebot"]) {
        for (const content of metaContent(page, name)) {
          expect(content, `${route.path} <meta name=${name}>`).not.toMatch(/noindex|none/i);
        }
      }
    }
  });

  test("404 page has a single robots meta with noindex and no contradicting googlebot meta", async ({ request }, testInfo) => {
    httpOnly(testInfo);
    for (const p of [NOT_FOUND_PATH, ...WITHDRAWN_ROUTES]) {
      const page = await fetchPage(request, p);
      expect(page.status, p).toBe(404);
      const robots = metaContent(page, "robots");
      expect(robots, `${p} robots metas: ${JSON.stringify(robots)}`).toHaveLength(1);
      expect(robots[0]).toMatch(/noindex/i);
      for (const g of metaContent(page, "googlebot")) {
        expect(g, `${p} googlebot meta contradicts noindex`).toMatch(/noindex/i);
      }
    }
  });

  test("descriptions are 120-160 chars, complete and unique across all public pages", async ({ request }, testInfo) => {
    httpOnly(testInfo);
    const seen = new Map<string, string>();
    for (const route of PUBLIC_ROUTES) {
      const page = await fetchPage(request, route.path);
      const descriptions = metaContent(page, "description");
      expect(descriptions, `${route.path} description count`).toHaveLength(1);
      const d = descriptions[0]!;
      expect(d.length, `${route.path} (${d.length}): ${d}`).toBeGreaterThanOrEqual(120);
      expect(d.length, `${route.path} (${d.length}): ${d}`).toBeLessThanOrEqual(160);
      expect(d.endsWith("…"), `${route.path} description is cut mid-sentence: ${d}`).toBe(false);
      expect(seen.has(d), `${route.path} shares its description with ${seen.get(d)}`).toBe(false);
      seen.set(d, route.path);
    }
  });

  test("titles are unique and at most 60 chars, except the named exceptions", async ({ request }, testInfo) => {
    httpOnly(testInfo);
    const seen = new Map<string, string>();
    for (const route of PUBLIC_ROUTES) {
      const page = await fetchPage(request, route.path);
      expect(page.titles, `${route.path} <title> count`).toHaveLength(1);
      const t = page.titles[0]!;
      const max = LONG_TITLE_EXCEPTIONS[route.path] ? TITLE_CEILING : TITLE_MAX;
      expect(t.length, `${route.path} title (${t.length}): ${t}`).toBeLessThanOrEqual(max);
      expect(seen.has(t), `${route.path} shares its title with ${seen.get(t)}`).toBe(false);
      seen.set(t, route.path);
    }
  });

  test("Contact FAQPage JSON-LD matches the visible FAQ text", async ({ page }) => {
    await page.goto("/contact");
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faqs = blocks.map((b) => JSON.parse(b)).filter((d) => d["@type"] === "FAQPage");
    expect(faqs, "exactly one FAQPage block").toHaveLength(1);
    const entities = faqs[0].mainEntity as { name: string; acceptedAnswer: { text: string } }[];
    expect(entities.length).toBeGreaterThan(0);
    // Text of the rendered page only: the JSON-LD <script> sits inside <main>,
    // so plain textContent would let the schema "match" itself.
    const mainText = norm(
      await page.locator("main").evaluate((el) => {
        const clone = el.cloneNode(true) as HTMLElement;
        clone.querySelectorAll("script, style, template").forEach((n) => n.remove());
        return clone.textContent ?? "";
      })
    );
    for (const q of entities) {
      expect(mainText, `question not visible: ${q.name}`).toContain(norm(q.name));
      expect(mainText, `answer differs from visible text: ${q.acceptedAnswer.text}`).toContain(norm(q.acceptedAnswer.text));
    }
  });

  test("articles: BlogPosting with a full Person author and truthful dates", async ({ request }, testInfo) => {
    httpOnly(testInfo);
    for (const route of ARTICLES) {
      const page = await fetchPage(request, route.path);
      const posts = page.jsonLd.filter((d) => d["@type"] === "BlogPosting");
      expect(posts, `${route.path} BlogPosting count`).toHaveLength(1);
      const post = posts[0] as {
        author: { "@type": string; name: string; url: string; sameAs: string[] };
        datePublished: string;
        dateModified: string;
      };
      expect(post.author["@type"]).toBe("Person");
      expect(post.author.name).toBe(SITE_NAME);
      expect(post.author.url).toBe(`${SITE_URL}/about`);
      expect(post.author.sameAs).toEqual(expect.arrayContaining([LINKEDIN_URL, GITHUB_URL]));
      expect(post.dateModified >= post.datePublished, `${route.path} dateModified < datePublished`).toBe(true);
      const fm = frontmatter("blog", route.path.replace("/blog/", ""));
      expect(post.datePublished, route.path).toBe(contentDate(fm.date));
      expect(post.dateModified, route.path).toBe(contentDate(fm.updatedDate) ?? contentDate(fm.date));
    }
  });

  test("Aarchid CreativeWork credits co-builder Dilpreet Grover", async ({ request }, testInfo) => {
    httpOnly(testInfo);
    const page = await fetchPage(request, "/projects/aarchid");
    const works = page.jsonLd.filter((d) => d["@type"] === "CreativeWork");
    expect(works).toHaveLength(1);
    const people = ["author", "contributor", "creator"].flatMap((k) => {
      const v = works[0]![k];
      return v === undefined ? [] : Array.isArray(v) ? v : [v];
    }) as { name?: string }[];
    expect(people.map((p) => p.name)).toContain("Dilpreet Grover");
  });
});

test.describe("SEO baseline: rendered page structure", () => {
  for (const route of PUBLIC_ROUTES) {
    const checks = [
      "one visible h1",
      ...(route.path === "/" ? [] : ["visible breadcrumb matching its JSON-LD"]),
      ...(route.kind === "article" ? ["author bio with profile links"] : []),
    ];
    test(`${route.path}: ${checks.join(", ")}`, async ({ page }) => {
      await page.goto(route.path);

      const h1 = page.locator("h1");
      await expect(h1, `${route.path} h1 count`).toHaveCount(1);
      await expect(h1).toBeVisible();
      expect(((await h1.textContent()) ?? "").trim().length).toBeGreaterThan(0);

      if (route.path !== "/") {
        const nav = page.locator('nav[aria-label="Breadcrumb"]');
        await expect(nav, `${route.path} visible breadcrumb`).toHaveCount(1);
        await expect(nav).toBeVisible();
        const crumbs = await nav.locator('a, [aria-current="page"]').evaluateAll((els) =>
          els.map((el) => ({
            name: (el.textContent ?? "").trim(),
            href: el.tagName === "A" ? el.getAttribute("href") : null,
          }))
        );
        const visible = crumbs.map((c) => {
          const resolved = new URL(c.href ?? route.path, `${SITE_URL}/`);
          return { name: c.name, url: stripSlash(`${SITE_URL}${resolved.pathname}`) };
        });

        const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
        const lists = blocks.map((b) => JSON.parse(b)).filter((d) => d["@type"] === "BreadcrumbList");
        expect(lists, `${route.path} BreadcrumbList count`).toHaveLength(1);
        const ld = (lists[0].itemListElement as { name: string; item: string }[]).map((i) => ({
          name: i.name,
          url: stripSlash(i.item),
        }));
        expect(visible, `${route.path} visible trail vs JSON-LD`).toEqual(ld);
        expect(ld.at(-1)?.url).toBe(stripSlash(urlFor(route.path)));
      }

      if (route.kind === "article") {
        const bio = page.locator('[data-testid="author-bio"]');
        await expect(bio, `${route.path} author bio`).toBeVisible();
        await expect(bio.locator(`a[href="/about"], a[href="${SITE_URL}/about"]`).first()).toBeVisible();
        await expect(bio.locator(`a[href^="${LINKEDIN_URL}"]`).first()).toBeVisible();
        await expect(bio.locator(`a[href^="${GITHUB_URL}"]`).first()).toBeVisible();
      }
    });
  }
});

// The local server and the test runner share a machine, so the runner's
// platform tells us whether the server's filesystem folds case.
const CASE_INSENSITIVE_FS = process.platform === "win32" || process.platform === "darwin";

test.describe("SEO baseline: status codes and images", () => {
  test("mixed-case slugs are real 404s, not duplicates", async ({ request }, testInfo) => {
    httpOnly(testInfo);
    // On a case-insensitive filesystem (Windows, default macOS) `next start`
    // writes the 404 render for /projects/Aarchid to the same cache file as
    // the /projects/aarchid prerender, which breaks the real page until the
    // next build. The probe is only safe against a case-sensitive host
    // (Linux, i.e. production and CI), where the answer is a plain 404.
    test.skip(
      CASE_INSENSITIVE_FS,
      "mixed-case probe corrupts the local prerender cache on a case-insensitive filesystem; run on Linux",
    );
    for (const p of ["/projects/Aarchid", "/blog/Why-PMs-Should-Code"]) {
      const res = await request.get(p, { maxRedirects: 0 });
      expect(res.status(), p).toBe(404);
    }
  });

  test("OG images exist only for public routes", async ({ request }, testInfo) => {
    httpOnly(testInfo);
    const ok = await request.get("/og/projects/aarchid");
    expect(ok.status()).toBe(200);
    expect(ok.headers()["content-type"]).toContain("image/png");
    for (const p of [
      ...PRIVATE_DRAFT_SLUGS.flatMap((s) => [`/og/projects/${s}`, `/og/blog/${s}`]),
      "/og/projects/churn-analysis",
      "/og/blog/churn-analysis",
      // Mixed case is left out on case-insensitive filesystems for the same
      // reason as the slug test above.
      ...(CASE_INSENSITIVE_FS ? [] : ["/og/projects/Aarchid"]),
      "/og/not-a-page",
      "/og/projects/aarchid/extra",
    ]) {
      const res = await request.get(p, { maxRedirects: 0 });
      expect(res.status(), p).toBe(404);
    }
  });

  test("/_next/image serves AVIF or WebP when the browser accepts them", async ({ request }, testInfo) => {
    httpOnly(testInfo);
    test.setTimeout(240_000);
    // One request per distinct source image (the srcset candidate nearest
    // 1080w): covers every optimised image on the site without asking the
    // server to encode ~40 widths of each.
    const sources = new Map<string, string>();
    for (const route of PUBLIC_ROUTES) {
      const { html } = await fetchPage(request, route.path);
      for (const m of html.matchAll(/(?:srcSet|srcset)="([^"]+)"/g)) {
        const candidates = decode(m[1]!)
          .split(",")
          .map((c) => c.trim().split(/\s+/))
          .filter(([u]) => u?.startsWith("/_next/image"))
          .map(([u, w]) => ({ u: u!, w: Number.parseInt(w ?? "0", 10) }));
        if (!candidates.length) continue;
        const src = new URL(candidates[0]!.u, SITE_URL).searchParams.get("url")!;
        if (sources.has(src)) continue;
        const best = candidates.reduce((a, b) => (Math.abs(b.w - 1080) < Math.abs(a.w - 1080) ? b : a));
        sources.set(src, best.u);
      }
    }
    expect(sources.size).toBeGreaterThan(0);
    for (const [src, u] of sources) {
      const res = await request.get(u, { headers: { Accept: "image/avif,image/webp,*/*" }, timeout: 90_000 });
      expect(res.status(), src).toBe(200);
      expect(res.headers()["content-type"], src).toMatch(/^image\/(avif|webp)/);
    }
  });
});

test.describe("Owner decisions (3 Oct 2026): no retired claims in public output", () => {
  test('the withdrawn Aarchid eval figure "92%" appears on no public page and not in rss.xml', async ({ request }, testInfo) => {
    httpOnly(testInfo);
    const offenders: string[] = [];
    for (const route of PUBLIC_ROUTES) {
      const { html } = await fetchPage(request, route.path);
      if (html.includes("92%")) offenders.push(route.path);
    }
    const rss = await (await request.get("/rss.xml")).text();
    if (rss.includes("92%")) offenders.push("/rss.xml");
    expect(offenders, `"92%" found in: ${offenders.join(", ")}`).toEqual([]);
  });

  test("no JSON-LD Person on any public page carries a jobTitle (undated present-tense role)", async ({ request }, testInfo) => {
    httpOnly(testInfo);
    const offenders: string[] = [];
    const visit = (node: unknown, where: string) => {
      if (Array.isArray(node)) return node.forEach((n) => visit(n, where));
      if (!node || typeof node !== "object") return;
      const obj = node as Record<string, unknown>;
      const type = obj["@type"];
      const isPerson = type === "Person" || (Array.isArray(type) && type.includes("Person"));
      if (isPerson && "jobTitle" in obj) offenders.push(`${where}: ${String(obj.name)} jobTitle=${String(obj.jobTitle)}`);
      Object.values(obj).forEach((v) => visit(v, where));
    };
    for (const route of PUBLIC_ROUTES) {
      const { jsonLd } = await fetchPage(request, route.path);
      visit(jsonLd, route.path);
    }
    expect(offenders).toEqual([]);
  });
});
