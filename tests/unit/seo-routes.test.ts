import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { GET as rssGet } from "@/app/rss.xml/route";
import { contentDate } from "@/lib/metadata";

const SITE = "https://dhruvsinghal.codes";
const contentDir = path.join(process.cwd(), "content");

const STATIC_PATHS = [
  "/",
  "/about",
  "/projects",
  "/ai-pm",
  "/blog",
  "/contact",
  "/now",
  "/lab",
  "/uses",
  "/bookshelf",
  "/changelog",
];

const mdxSlugs = (dir: string) =>
  fs
    .readdirSync(path.join(contentDir, dir))
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));

/** Slugs that exist only in private-drafts/ or withdrawn/: must never surface. */
const hiddenSlugs = ["private-drafts", "withdrawn"].flatMap((dir) => {
  const full = path.join(contentDir, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => /\.(mdx?|json)$/.test(f) && !/^readme\.md$/i.test(f))
    .map((f) => f.replace(/\.(mdx?|json)$/, ""));
});

const toPath = (url: string) => url.replace(SITE, "") || "/";

describe("sitemap()", () => {
  const entries = sitemap();
  const byPath = new Map(entries.map((e) => [toPath(e.url), e]));

  it("lists exactly the static pages, case studies and articles, on the preferred host", () => {
    const expected = [
      ...STATIC_PATHS,
      ...mdxSlugs("case-studies").map((s) => `/projects/${s}`),
      ...mdxSlugs("blog").map((s) => `/blog/${s}`),
    ].sort();
    expect([...byPath.keys()].sort()).toEqual(expected);
    for (const e of entries) {
      expect(e.url.startsWith(SITE)).toBe(true);
      expect(e.url).not.toMatch(/\/$/);
    }
  });

  it("never includes withdrawn or private slugs", () => {
    expect(hiddenSlugs).toContain("churn-analysis");
    for (const slug of hiddenSlugs) {
      for (const e of entries) expect(e.url).not.toContain(`/${slug}`);
    }
  });

  it("emits no lastmod on static pages (no recorded edit date)", () => {
    for (const p of STATIC_PATHS) {
      expect(byPath.get(p)?.lastModified, p).toBeUndefined();
    }
  });

  it("dates case studies by projects.json lastVerified", () => {
    const projects: { slug: string; lastVerified?: string }[] = JSON.parse(
      fs.readFileSync(path.join(contentDir, "projects.json"), "utf-8")
    );
    for (const slug of mdxSlugs("case-studies")) {
      const verified = projects.find((p) => p.slug === slug)?.lastVerified;
      expect(byPath.get(`/projects/${slug}`)?.lastModified, slug).toBe(contentDate(verified));
    }
  });

  it("dates articles by updatedDate, else date (never the build clock)", () => {
    for (const slug of mdxSlugs("blog")) {
      const { data } = matter(fs.readFileSync(path.join(contentDir, "blog", `${slug}.mdx`), "utf-8"));
      const expected = contentDate(data.updatedDate) ?? contentDate(data.date);
      expect(expected, `${slug} has no date`).toBeTruthy();
      expect(byPath.get(`/blog/${slug}`)?.lastModified, slug).toBe(expected);
    }
  });
});

describe("robots()", () => {
  const r = robots();

  it("references the absolute sitemap on the preferred host and drops `host`", () => {
    expect(r.sitemap).toBe(`${SITE}/sitemap.xml`);
    expect(r).not.toHaveProperty("host");
  });

  it("disallows only /api/", () => {
    const rules = Array.isArray(r.rules) ? r.rules : [r.rules];
    const disallow = rules.flatMap((rule) =>
      rule.disallow === undefined ? [] : Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow]
    );
    expect(disallow).toEqual(["/api/"]);
  });
});

describe("rss.xml", () => {
  it("lists every article once, with pubDate from frontmatter and no hidden slugs", async () => {
    const xml = await (await rssGet()).text();
    const links = [...xml.matchAll(/<item>[\s\S]*?<link>([^<]+)<\/link>/g)].map((m) => m[1]);
    expect(links.map((l) => l!.replace(`${SITE}/blog/`, "")).sort()).toEqual(mdxSlugs("blog").sort());
    for (const slug of hiddenSlugs) expect(xml).not.toContain(`/${slug}`);

    for (const slug of mdxSlugs("blog")) {
      const { data } = matter(fs.readFileSync(path.join(contentDir, "blog", `${slug}.mdx`), "utf-8"));
      const item = xml.split("<item>").find((chunk) => chunk.includes(`/blog/${slug}</link>`));
      const expected = new Date(contentDate(data.date)!).toUTCString();
      expect(item, slug).toContain(`<pubDate>${expected}</pubDate>`);
    }
  });

  it("lastBuildDate is the newest real publish or edit date", async () => {
    const xml = await (await rssGet()).text();
    const newest = mdxSlugs("blog")
      .map((slug) => {
        const { data } = matter(fs.readFileSync(path.join(contentDir, "blog", `${slug}.mdx`), "utf-8"));
        return [contentDate(data.date), contentDate(data.updatedDate)].filter(Boolean) as string[];
      })
      .flat()
      .sort()
      .at(-1)!;
    expect(xml).toContain(`<lastBuildDate>${new Date(newest).toUTCString()}</lastBuildDate>`);
  });
});
