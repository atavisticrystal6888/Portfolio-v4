import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";
import path from "path";

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
    slug: "aarkid",
    name: "Aarkid",
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
    expect(projects[1]!.slug).toBe("aarkid"); // order 2
  });
});

describe("getProjectBySlug", () => {
  it("returns matching project", async () => {
    const { getProjectBySlug } = await import("@/lib/content");
    const project = getProjectBySlug("aarkid");
    expect(project).toBeDefined();
    expect(project!.name).toBe("Aarkid");
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

  it("returns empty array if directory missing", async () => {
    vi.mocked(fs).existsSync.mockReturnValue(false);
    const { getAllCaseStudySlugs } = await import("@/lib/content");
    const slugs = getAllCaseStudySlugs();
    expect(slugs).toEqual([]);
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
    vi.mocked(fs).existsSync.mockReturnValue(false);
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
