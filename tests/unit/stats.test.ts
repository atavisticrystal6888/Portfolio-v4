import { describe, it, expect } from "vitest";
import {
  getHomeMetrics,
  COVERAGE_CASE_STUDIES,
  COVERAGE_ARTICLES,
} from "@/lib/stats";

describe("getHomeMetrics", () => {
  const metrics = getHomeMetrics();
  const coverage = [COVERAGE_CASE_STUDIES, COVERAGE_ARTICLES];
  const evidence = metrics.filter((m) => !coverage.includes(m.label));

  it("every metric has a non-empty value and label", () => {
    for (const m of metrics) {
      expect(m.value).toBeTruthy();
      expect(m.label).toBeTruthy();
      expect(typeof m.value).toBe("string");
      expect(typeof m.label).toBe("string");
    }
  });

  it("shows one evidence tile per featured flagship, four in all", () => {
    expect(evidence).toHaveLength(4);
  });

  it("the Aarchid tile shows no eval result figure (owner decision, 3 Oct 2026)", () => {
    // The result is withheld until the eval artefact or the co-builder's
    // confirmation is available: no percentage in the value or the label.
    expect(evidence[0]!.value).not.toMatch(/\d+\s*%/);
    expect(evidence[0]!.label).not.toMatch(/\b92\b/);
  });

  it("no feature-count tile stands in for an outcome", () => {
    for (const m of evidence) expect(m.value).not.toMatch(/^43\+$/);
  });

  it("coverage counts come last and are numeric", () => {
    const labels = metrics.map((m) => m.label);
    expect(labels.slice(-2)).toEqual(coverage);
    for (const m of metrics.slice(-2)) expect(m.value).toMatch(/^\d+$/);
  });
});
