import { describe, it, expect } from "vitest";
import { getHomeMetrics } from "@/lib/stats";

describe("getHomeMetrics", () => {
  const metrics = getHomeMetrics();

  it("returns at least four metrics", () => {
    expect(metrics.length).toBeGreaterThanOrEqual(4);
  });

  it("every metric has a non-empty value and label", () => {
    for (const m of metrics) {
      expect(m.value).toBeTruthy();
      expect(m.label).toBeTruthy();
      expect(typeof m.value).toBe("string");
      expect(typeof m.label).toBe("string");
    }
  });

  it("the last two are derived counts (Case Studies, Articles Published)", () => {
    const labels = metrics.map((m) => m.label);
    expect(labels).toContain("Case Studies");
    expect(labels).toContain("Articles Published");
  });

  it("derived count values are numeric strings", () => {
    const caseStudies = metrics.find((m) => m.label === "Case Studies")!;
    const articles = metrics.find((m) => m.label === "Articles Published")!;
    expect(caseStudies.value).toMatch(/^\d+$/);
    expect(articles.value).toMatch(/^\d+$/);
  });

  it("featured outcomes appear before derived counts", () => {
    const csIndex = metrics.findIndex((m) => m.label === "Case Studies");
    // Featured outcomes are inserted at the front.
    expect(csIndex).toBeGreaterThanOrEqual(0);
    // At least one outcome metric precedes the count tiles.
    expect(csIndex).toBeGreaterThan(0);
  });
});
