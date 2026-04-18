import { describe, it, expect } from "vitest";
import { scoreSuggestions } from "@/lib/suggestions";
import type { Project } from "@/types/project";
import type { BlogArticle } from "@/types/blog";
import type { UserBehavior } from "@/types/theme";

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    slug: "test-project",
    name: "Test Project",
    category: "product",
    description: "A test project",
    stack: ["React"],
    metricValue: "10%",
    metricLabel: "Improvement",
    featured: false,
    githubUrl: null,
    duration: "3 months",
    role: "PM",
    order: 1,
    ...overrides,
  };
}

function makeBlogPost(overrides: Partial<BlogArticle> = {}): BlogArticle {
  return {
    slug: "test-post",
    title: "Test Post",
    date: "2024-01-01",
    updatedDate: null,
    category: "Product",
    tags: ["testing"],
    readingTime: "5 min",
    excerpt: "A test post excerpt",
    socialImage: null,
    content: "# Test",
    ...overrides,
  };
}

function makeBehavior(overrides: Partial<UserBehavior> = {}): UserBehavior {
  return {
    pagesVisited: [],
    categoryAffinities: {},
    sectionScrollDepths: {},
    sessionCount: 1,
    firstVisit: Date.now(),
    lastVisit: Date.now(),
    ...overrides,
  };
}

describe("scoreSuggestions", () => {
  it("returns at most 4 items", () => {
    const projects = Array.from({ length: 6 }, (_, i) =>
      makeProject({ slug: `p${i}`, name: `Project ${i}` })
    );
    const result = scoreSuggestions(projects, [], makeBehavior());
    expect(result.length).toBeLessThanOrEqual(4);
  });

  it("returns items sorted by score descending", () => {
    const projects = [
      makeProject({ slug: "featured", featured: true }),
      makeProject({ slug: "normal", featured: false }),
    ];
    const result = scoreSuggestions(projects, [], makeBehavior());
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1]!.score).toBeGreaterThanOrEqual(result[i]!.score);
    }
  });

  it("boosts featured projects", () => {
    const projects = [
      makeProject({ slug: "featured", featured: true }),
      makeProject({ slug: "normal", featured: false }),
    ];
    const result = scoreSuggestions(projects, [], makeBehavior());
    const featured = result.find((r) => r.slug === "featured");
    const normal = result.find((r) => r.slug === "normal");
    expect(featured!.score).toBeGreaterThan(normal!.score);
  });

  it("includes both projects and blog posts", () => {
    const projects = [makeProject()];
    const posts = [makeBlogPost()];
    const result = scoreSuggestions(projects, posts, makeBehavior());
    const types = new Set(result.map((r) => r.type));
    expect(types.has("project")).toBe(true);
    expect(types.has("blog")).toBe(true);
  });

  it("boosts items with matching category affinity", () => {
    const projects = [
      makeProject({ slug: "product-p", category: "product" }),
      makeProject({ slug: "data-p", category: "data" }),
    ];
    const behavior = makeBehavior({
      categoryAffinities: { product: 10, data: 0 },
    });
    const result = scoreSuggestions(projects, [], behavior);
    const productItem = result.find((r) => r.slug === "product-p");
    const dataItem = result.find((r) => r.slug === "data-p");
    expect(productItem!.score).toBeGreaterThan(dataItem!.score);
  });

  it("boosts unvisited items", () => {
    const projects = [
      makeProject({ slug: "visited" }),
      makeProject({ slug: "unvisited" }),
    ];
    const behavior = makeBehavior({
      pagesVisited: [{ slug: "visited", timestamp: Date.now() }],
    });
    const result = scoreSuggestions(projects, [], behavior);
    const visited = result.find((r) => r.slug === "visited");
    const unvisited = result.find((r) => r.slug === "unvisited");
    expect(unvisited!.score).toBeGreaterThan(visited!.score);
  });

  it("returns empty array when no items", () => {
    const result = scoreSuggestions([], [], makeBehavior());
    expect(result).toEqual([]);
  });

  it("generates correct href", () => {
    const result = scoreSuggestions(
      [makeProject({ slug: "my-proj" })],
      [makeBlogPost({ slug: "my-post" })],
      makeBehavior()
    );
    const proj = result.find((r) => r.type === "project");
    const blog = result.find((r) => r.type === "blog");
    expect(proj!.href).toBe("/projects/my-proj");
    expect(blog!.href).toBe("/blog/my-post");
  });
});
