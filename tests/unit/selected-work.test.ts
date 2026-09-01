import { describe, it, expect } from "vitest";
import {
  carouselProjects,
  splitSelectedWork,
  shownOnHome,
} from "@/components/home/selection";
import type { Project } from "@/types/project";

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    slug: "p",
    name: "P",
    category: "product",
    description: "d",
    stack: [],
    metricValue: "1",
    metricLabel: "thing",
    featured: false,
    githubUrl: null,
    duration: "2026",
    role: "PM",
    order: 1,
    ...overrides,
  };
}

const roster: Project[] = [
  makeProject({ slug: "c-first", tier: "compact", order: 2 }),
  makeProject({ slug: "f-third", tier: "flagship", order: 8 }),
  makeProject({ slug: "f-first", tier: "flagship", order: 1 }),
  makeProject({ slug: "c-nopage", tier: "compact", order: 10, hasCaseStudy: false }),
  makeProject({ slug: "f-second", tier: "flagship", order: 4 }),
  makeProject({ slug: "untiered", order: 3 }),
];

describe("carouselProjects", () => {
  it("keeps only flagship-tier projects, sorted by order", () => {
    expect(carouselProjects(roster).map((p) => p.slug)).toEqual([
      "f-first",
      "f-second",
      "f-third",
    ]);
  });

  it("does not mutate the input array", () => {
    const before = roster.map((p) => p.slug);
    carouselProjects(roster);
    expect(roster.map((p) => p.slug)).toEqual(before);
  });

  it("returns an empty rail when nothing is flagship", () => {
    expect(carouselProjects([makeProject({ tier: "compact" })])).toEqual([]);
  });
});

describe("splitSelectedWork", () => {
  it("sends flagships to the rail and compact work with a page to Also built", () => {
    const { flagships, rest } = splitSelectedWork(roster);
    expect(flagships.map((p) => p.slug)).toEqual(["f-first", "f-second", "f-third"]);
    expect(rest.map((p) => p.slug)).toEqual(["c-first", "untiered"]);
  });

  it("never lists a project in both groups", () => {
    const { flagships, rest } = splitSelectedWork(roster);
    const overlap = flagships.filter((f) => rest.some((r) => r.slug === f.slug));
    expect(overlap).toEqual([]);
  });
});

describe("shownOnHome", () => {
  it("covers everything above the suggestions and nothing card-only", () => {
    const shown = shownOnHome(roster);
    expect([...shown].sort()).toEqual(
      ["c-first", "f-first", "f-second", "f-third", "untiered"].sort()
    );
    expect(shown.has("c-nopage")).toBe(false);
  });
});
