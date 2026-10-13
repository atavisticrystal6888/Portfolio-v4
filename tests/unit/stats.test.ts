import { describe, it, expect } from "vitest";
import {
  getHomeMetrics,
  COVERAGE_CASE_STUDIES,
  COVERAGE_ARTICLES,
} from "@/lib/stats";
import { bindSeparators, isProseCaption } from "@/lib/utils";

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

  it("the case-study count names the flagship count the grid shows", () => {
    // The hero says "Four case studies below"; the coverage label must agree
    // with the number of flagship evidence tiles, or the two read as a clash.
    const flagships = Number(COVERAGE_CASE_STUDIES.match(/\((\d+) flagship\)/)?.[1]);
    expect(flagships).toBe(evidence.length);
  });
});

describe("isProseCaption (evidence grid captions)", () => {
  it("keeps labels of one to four words as mono field labels", () => {
    expect(isProseCaption(COVERAGE_ARTICLES)).toBe(false);
    expect(isProseCaption("Practice questions (repo README)")).toBe(false);
  });

  it("sets longer captions as sentence-case body text", () => {
    expect(isProseCaption("Tests passing · local build, not deployed")).toBe(true);
    expect(isProseCaption(COVERAGE_CASE_STUDIES)).toBe(true);
  });

  it("does not count separators as words", () => {
    expect(isProseCaption("Failures · gate · run · today")).toBe(false);
  });
});

describe("bindSeparators (metric captions)", () => {
  it("keeps each middot on the line of the word before it", () => {
    expect(bindSeparators("A source link required \u00b7 offline eval withheld")).toBe(
      "A source link required\u00a0\u00b7 offline eval withheld",
    );
    expect(bindSeparators("Articles \u00b7 coverage \u00b7 local")).toBe(
      "Articles\u00a0\u00b7 coverage\u00a0\u00b7 local",
    );
  });

  it("leaves text without a spaced separator alone", () => {
    expect(bindSeparators("Practice questions (repo README)")).toBe(
      "Practice questions (repo README)",
    );
  });
});
