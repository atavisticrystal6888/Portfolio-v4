import { describe, it, expect } from "vitest";
import {
  generatePageMetadata,
  generatePersonJsonLd,
  generateWebSiteJsonLd,
  generateBreadcrumbJsonLd,
  generateArticleJsonLd,
} from "@/lib/metadata";

describe("generatePageMetadata", () => {
  it("generates metadata with full title for non-root pages", () => {
    const meta = generatePageMetadata({
      title: "About",
      path: "/about",
    });
    expect(meta.title).toBe("About | Dhruv Singhal");
  });

  it("uses plain title for the root page", () => {
    const meta = generatePageMetadata({ title: "Dhruv Singhal", path: "" });
    expect(meta.title).toBe("Dhruv Singhal");
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
    expect(ld["@type"]).toBe("Article");
    expect(ld.headline).toBe("Test");
    expect(ld.author["@type"]).toBe("Person");
  });

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
