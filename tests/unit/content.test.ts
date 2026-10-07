import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";

// Mock fs so tests don't depend on actual content files
vi.mock("fs");
vi.mock("gray-matter", () => ({
  default: (raw: string) => {
    // Simple mock: parse YAML-like front matter
    const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return { data: {}, content: raw };
    const data: Record<string, string> = {};
    for (const line of match[1]!.split("\n")) {
      const [key, ...rest] = line.split(": ");
      if (key) data[key.trim()] = rest.join(": ").trim();
    }
    return { data, content: match[2] };
  },
}));

const PROJECTS_JSON = JSON.stringify([
  {
    slug: "aarchid",
    name: "Aarchid",
    category: "product",
    description: "EdTech",
    stack: ["React"],
    metricValue: "40%",
    metricLabel: "Growth",
    featured: true,
    githubUrl: null,
    duration: "6 mo",
    role: "PM",
    order: 2,
  },
  {
    slug: "churn",
    name: "Churn",
    category: "data",
    description: "Analysis",
    stack: ["Python"],
    metricValue: "25%",
    metricLabel: "Reduction",
    featured: false,
    githubUrl: null,
    duration: "3 mo",
    role: "Analyst",
    order: 1,
  },
]);

const TESTIMONIALS_JSON = JSON.stringify([
  { name: "Alice", role: "CEO", company: "Acme", quote: "Great work" },
]);

beforeEach(() => {
  vi.resetAllMocks();

  const mockedFs = vi.mocked(fs);
  mockedFs.readFileSync.mockImplementation((filePath: fs.PathOrFileDescriptor) => {
    const p = String(filePath);
    if (p.includes("projects.json")) return PROJECTS_JSON;
    if (p.includes("testimonials.json")) return TESTIMONIALS_JSON;
    if (p.includes("approved-case-studies.json")) return JSON.stringify({ approved: ["test"] });
    if (p.endsWith(".mdx")) {
      return `---\nslug: test\ntitle: Test\n---\n# Content`;
    }
    throw new Error(`Unexpected read: ${p}`);
  });

  mockedFs.existsSync.mockReturnValue(true);
  mockedFs.readdirSync.mockImplementation(() => ["test.mdx"] as unknown as ReturnType<typeof fs.readdirSync>);
});

describe("getAllProjects", () => {
  it("returns projects sorted by order", async () => {
    const { getAllProjects } = await import("@/lib/content");
    const projects = getAllProjects();
    expect(projects).toHaveLength(2);
    expect(projects[0]!.slug).toBe("churn"); // order 1
    expect(projects[1]!.slug).toBe("aarchid"); // order 2
  });
});

describe("getProjectBySlug", () => {
  it("returns matching project", async () => {
    const { getProjectBySlug } = await import("@/lib/content");
    const project = getProjectBySlug("aarchid");
    expect(project).toBeDefined();
    expect(project!.name).toBe("Aarchid");
  });

  it("returns undefined for missing slug", async () => {
    const { getProjectBySlug } = await import("@/lib/content");
    expect(getProjectBySlug("nonexistent")).toBeUndefined();
  });
});

describe("getAllCaseStudySlugs", () => {
  it("returns slug list from directory", async () => {
    const { getAllCaseStudySlugs } = await import("@/lib/content");
    const slugs = getAllCaseStudySlugs();
    expect(slugs).toEqual(["test"]);
  });

  it("throws (failing the build) if the directory is missing but a slug is approved", async () => {
    vi.mocked(fs).existsSync.mockReturnValue(false);
    const { getAllCaseStudySlugs } = await import("@/lib/content");
    expect(() => getAllCaseStudySlugs()).toThrow(/stale allowlist entry/);
  });
});

describe("getCaseStudyBySlug", () => {
  it("parses frontmatter and content", async () => {
    const { getCaseStudyBySlug } = await import("@/lib/content");
    const cs = getCaseStudyBySlug("test");
    expect(cs).not.toBeNull();
    expect(cs!.content).toContain("# Content");
  });

  it("returns null for missing file", async () => {
    vi.mocked(fs).existsSync.mockImplementation((p) => !String(p).endsWith("missing.mdx"));
    const { getCaseStudyBySlug } = await import("@/lib/content");
    expect(getCaseStudyBySlug("missing")).toBeNull();
  });
});

describe("getAllBlogPosts", () => {
  it("returns parsed blog posts", async () => {
    const { getAllBlogPosts } = await import("@/lib/content");
    const posts = getAllBlogPosts();
    expect(posts.length).toBeGreaterThanOrEqual(1);
  });
});

describe("getAllTestimonials", () => {
  it("returns parsed testimonials", async () => {
    const { getAllTestimonials } = await import("@/lib/content");
    const testimonials = getAllTestimonials();
    expect(testimonials).toHaveLength(1);
    expect(testimonials[0]!.name).toBe("Alice");
  });
});

describe("slug lookups are exact-match", () => {
  it("a case variant of a real slug is not found (no NTFS case folding)", async () => {
    const { getCaseStudyBySlug, getBlogPostBySlug } = await import("@/lib/content");
    expect(getCaseStudyBySlug("test")).not.toBeNull();
    expect(getCaseStudyBySlug("Test")).toBeNull();
    expect(getBlogPostBySlug("test")).not.toBeNull();
    expect(getBlogPostBySlug("TEST")).toBeNull();
  });
});

describe("blog reading time", () => {
  it("is computed from the body at 200 words a minute, rounded up", async () => {
    const { readingTimeFor, READING_WPM } = await import("@/lib/content");
    expect(READING_WPM).toBe(200);
    const words = (n: number) => Array.from({ length: n }, () => "word").join(" ");
    expect(readingTimeFor(words(200))).toBe("1 min read");
    expect(readingTimeFor(words(201))).toBe("2 min read");
    expect(readingTimeFor("")).toBe("1 min read");
  });

  it("does not count link targets or table separator rows as words", async () => {
    const { readingTimeFor } = await import("@/lib/content");
    const url = Array.from({ length: 300 }, (_, i) => `seg${i}`).join("/");
    expect(readingTimeFor(`[one](/${url})`)).toBe("1 min read");
    const rule = Array.from({ length: 300 }, () => "---").join("|");
    expect(readingTimeFor(`|${rule}|`)).toBe("1 min read");
  });

  it("overrides any readingTime in frontmatter", async () => {
    vi.mocked(fs).readFileSync.mockImplementation(() =>
      `---\nslug: test\ntitle: Test\nreadingTime: 9 min read\n---\n${"word ".repeat(450)}`
    );
    const { getBlogPostBySlug } = await import("@/lib/content");
    expect(getBlogPostBySlug("test")!.readingTime).toBe("3 min read");
  });
});

describe("pickRelatedPosts", () => {
  type Post = import("@/types/blog").BlogArticle;
  const post = (slug: string, extra: Partial<Post> = {}): Post => ({
    slug,
    title: slug,
    date: "2026-01-01",
    updatedDate: null,
    category: "Product",
    tags: [],
    readingTime: "1 min read",
    excerpt: "",
    socialImage: null,
    content: "",
    ...extra,
  });

  it("uses the curated list first, in order, and skips unknown slugs", async () => {
    const { pickRelatedPosts } = await import("@/lib/content");
    const all = [post("a", { related: ["missing", "c", "b"] }), post("b"), post("c"), post("d")];
    expect(pickRelatedPosts(all[0]!, all).map((p) => p.slug)).toEqual(["c", "b"]);
  });

  it("fills gaps by tag overlap and never returns the current post", async () => {
    const { pickRelatedPosts } = await import("@/lib/content");
    const all = [
      post("a", { tags: ["x"], related: ["b"] }),
      post("b"),
      post("c", { tags: ["y"] }),
      post("d", { tags: ["x"] }),
    ];
    expect(pickRelatedPosts(all[0]!, all).map((p) => p.slug)).toEqual(["b", "d"]);
  });
});
