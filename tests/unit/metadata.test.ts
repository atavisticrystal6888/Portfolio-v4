import { describe, it, expect } from "vitest";
import {
  generatePageMetadata,
  generatePersonJsonLd,
  generateWebSiteJsonLd,
  generateBreadcrumbJsonLd,
  generateArticleJsonLd,
  contentDate,
} from "@/lib/metadata";
import { SITE_DESCRIPTION } from "@/lib/site";

describe("generatePageMetadata", () => {
  it("generates metadata with plain title for non-root pages (template applied by layout)", () => {
    const meta = generatePageMetadata({
      title: "About",
      path: "/about",
    });
    expect(meta.title).toBe("About");
  });

  it("uses absolute title for the root page", () => {
    const meta = generatePageMetadata({ title: "Dhruv Singhal", path: "" });
    expect(meta.title).toEqual({ absolute: "Dhruv Singhal" });
  });

  it("sets canonical URL", () => {
    const meta = generatePageMetadata({ title: "Projects", path: "/projects" });
    expect(meta.alternates?.canonical).toContain("/projects");
  });

  it("includes OpenGraph fields", () => {
    const meta = generatePageMetadata({
      title: "About",
      description: "Test desc",
      path: "/about",
    });
    const og = meta.openGraph as Record<string, unknown>;
    expect(og.title).toBe("About | Dhruv Singhal");
    expect(og.description).toBe("Test desc");
    expect(og.siteName).toBe("Dhruv Singhal");
  });

  it("includes Twitter card", () => {
    const meta = generatePageMetadata({ title: "Test", path: "/test" });
    const tw = meta.twitter as Record<string, unknown>;
    expect(tw.card).toBe("summary_large_image");
  });

  it("supports article metadata", () => {
    const meta = generatePageMetadata({
      title: "Blog Post",
      path: "/blog/post",
      ogType: "article",
      article: { publishedTime: "2024-01-01", author: "Dhruv" },
    });
    const og = meta.openGraph as Record<string, unknown>;
    expect(og.type).toBe("article");
    expect(og.publishedTime).toBe("2024-01-01");
  });

  it("uses default description when omitted", () => {
    const meta = generatePageMetadata({ title: "X", path: "/x" });
    expect(meta.description).toContain("Dhruv Singhal");
  });
});

describe("generatePersonJsonLd", () => {
  it("returns Person schema", () => {
    const ld = generatePersonJsonLd();
    expect(ld["@type"]).toBe("Person");
    expect(ld.name).toBe("Dhruv Singhal");
  });
});

describe("generateWebSiteJsonLd", () => {
  it("returns WebSite schema", () => {
    const ld = generateWebSiteJsonLd();
    expect(ld["@type"]).toBe("WebSite");
  });
});

describe("generateBreadcrumbJsonLd", () => {
  it("generates ordered list items", () => {
    const ld = generateBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "About", url: "/about" },
    ]);
    expect(ld["@type"]).toBe("BreadcrumbList");
    expect(ld.itemListElement).toHaveLength(2);
    expect(ld.itemListElement[0]!.position).toBe(1);
    expect(ld.itemListElement[1]!.position).toBe(2);
  });
});

describe("generateArticleJsonLd", () => {
  it("returns Article schema", () => {
    const ld = generateArticleJsonLd({
      title: "Test",
      description: "Desc",
      datePublished: "2024-01-01",
      url: "/blog/test",
    });
    // BlogPosting is a schema.org Article subtype: still an Article to Google.
    expect(ld["@type"]).toBe("BlogPosting");
    expect(ld.headline).toBe("Test");
    expect(ld.author["@type"]).toBe("Person");
  });

  it("author is a full Person: absolute /about url, sameAs profiles, no present-tense role", () => {
    const ld = generateArticleJsonLd({
      title: "T",
      description: "D",
      datePublished: "2026-09-03",
      url: "/blog/t",
    });
    expect(ld.author.name).toBe("Dhruv Singhal");
    expect(ld.author.url).toBe("https://dhruvsinghal.codes/about");
    // Owner decision (3 Oct 2026): a schema jobTitle is an undated present-tense claim.
    expect(ld.author).not.toHaveProperty("jobTitle");
    expect(ld.author.sameAs).toEqual([
      "https://linkedin.com/in/dhruvsinghal6888",
      "https://github.com/atavisticrystal6888",
    ]);
    // Employer naming is an open owner question: never emitted.
    expect(ld.author).not.toHaveProperty("worksFor");
  });

  it("uses an explicit dateModified when it is on or after datePublished", () => {
    const ld = generateArticleJsonLd({
      title: "T",
      description: "D",
      datePublished: "2026-09-03",
      dateModified: "2026-10-02",
      url: "/blog/t",
    });
    expect(ld.dateModified).toBe("2026-10-02");
  });

  it("never reports a dateModified earlier than datePublished, and accepts null", () => {
    const earlier = generateArticleJsonLd({
      title: "T",
      description: "D",
      datePublished: "2026-09-03",
      dateModified: "2026-01-01",
      url: "/blog/t",
    });
    expect(earlier.dateModified).toBe("2026-09-03");
    const none = generateArticleJsonLd({
      title: "T",
      description: "D",
      datePublished: "2026-09-03",
      dateModified: null,
      url: "/blog/t",
    });
    expect(none.dateModified).toBe("2026-09-03");
  });

  it("publisher and author images are raster, not the SVG monogram", () => {
    const ld = generateArticleJsonLd({
      title: "T",
      description: "D",
      datePublished: "2026-09-03",
      url: "/blog/t",
    });
    expect(ld.publisher.image).toMatch(/^https:\/\/dhruvsinghal\.codes\/.+\.(jpe?g|png|webp)$/i);
    expect(ld.author.image).toBe(ld.publisher.image);
  });
});

describe("generatePersonJsonLd (identity and claims)", () => {
  it("has its own factual description, not the site description", () => {
    const ld = generatePersonJsonLd();
    expect(ld.description).not.toBe(SITE_DESCRIPTION);
    expect(ld.description).toMatch(/about one year/i);
    // Never imply three or more years of experience.
    expect(ld.description).not.toMatch(/\b([3-9]|\d{2,})\+?\s*years?\b/i);
    expect(ld.description).not.toMatch(/\b(three|four|five|several|many)\s+years?\b/i);
  });

  it("dates the internship and makes no present-tense role claim", () => {
    const ld = generatePersonJsonLd();
    expect(ld.description).toBe(
      "About one year of product experience across internships, most recently product intern (growth) at The Sleep Company, Jul–Oct 2026. Writes about AI evaluation, retention and product scope."
    );
    expect(ld.description).not.toMatch(/\b(currently|working on|works at|is a product intern)\b/i);
    expect(ld).not.toHaveProperty("jobTitle");
    expect(ld).not.toHaveProperty("worksFor");
  });

  it("the site description makes no current-employment claim", () => {
    expect(SITE_DESCRIPTION).not.toMatch(/Sleep Company|currently|intern/i);
  });

  it("uses a raster image and shares its @id with the article author", () => {
    const person = generatePersonJsonLd();
    const article = generateArticleJsonLd({
      title: "T",
      description: "D",
      datePublished: "2026-09-03",
      url: "/blog/t",
    });
    expect(person.image).toMatch(/\.(jpe?g|png|webp)$/i);
    expect(person["@id"]).toBe(article.author["@id"]);
    expect(person).not.toHaveProperty("jobTitle");
  });
});

describe("generatePageMetadata (article OG)", () => {
  it("points article:author at the absolute /about profile and passes modifiedTime", () => {
    const meta = generatePageMetadata({
      title: "Post",
      path: "/blog/post",
      ogType: "article",
      article: { publishedTime: "2026-09-03", modifiedTime: "2026-10-02", author: "Dhruv Singhal" },
    });
    const og = meta.openGraph as Record<string, unknown>;
    expect(og.authors).toEqual(["https://dhruvsinghal.codes/about"]);
    expect(og.modifiedTime).toBe("2026-10-02");
  });
});

describe("contentDate", () => {
  it("normalises gray-matter Dates and strings, and treats empty as absent", () => {
    expect(contentDate(new Date("2026-09-03T00:00:00Z"))).toBe("2026-09-03");
    expect(contentDate("2026-10-02")).toBe("2026-10-02");
    expect(contentDate(null)).toBeUndefined();
    expect(contentDate(undefined)).toBeUndefined();
    expect(contentDate("  ")).toBeUndefined();
    expect(contentDate(new Date("not a date"))).toBeUndefined();
  });
});

describe("SITE_DESCRIPTION", () => {
  it("is 120-160 chars and makes no 'measurable outcomes' claim", () => {
    expect(SITE_DESCRIPTION.length).toBeGreaterThanOrEqual(120);
    expect(SITE_DESCRIPTION.length).toBeLessThanOrEqual(160);
    expect(SITE_DESCRIPTION).not.toMatch(/measurable outcomes/i);
  });
});

describe("generateArticleJsonLd (dateModified fallback)", () => {
  it("uses datePublished as fallback for dateModified", () => {
    const ld = generateArticleJsonLd({
      title: "T",
      description: "D",
      datePublished: "2024-06-01",
      url: "/blog/t",
    });
    expect(ld.dateModified).toBe("2024-06-01");
  });
});
