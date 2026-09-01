import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import type { Project } from "@/types/project";
import { selectStripMetrics } from "@/components/case-study/MetricChart";
import { splitSelectedWork, shownOnHome } from "@/components/home/selection";

// The real roster, not a mock: this test is the schema check for
// content/projects.json (there is no zod layer).
const projects: Project[] = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "content", "projects.json"), "utf-8")
);

const FLAGSHIPS = ["aarchid", "experiment-hub", "kite-edge", "desktasks", "tcs-nqt-prep-hub"];
const STATUSES = ["live", "private-beta", "archived", "internal", "open-source"];

describe("content/projects.json product fields", () => {
  it("every entry carries the product identity fields", () => {
    for (const p of projects) {
      expect(p.productName, p.slug).toBeTruthy();
      expect(p.tagline, p.slug).toBeTruthy();
      expect(p.tagline!.split(/\s+/).length, `${p.slug} tagline > 12 words`).toBeLessThanOrEqual(12);
      expect(STATUSES, p.slug).toContain(p.status);
      expect(["flagship", "compact"], p.slug).toContain(p.tier);
      expect(p).toHaveProperty("businessModel");
      expect(p).toHaveProperty("accent");
      expect(p).toHaveProperty("wordmark");
      expect(p).toHaveProperty("demoVideo");
    }
  });

  it("accent is a hex colour when set, and its source is recorded", () => {
    for (const p of projects) {
      if (p.accent) {
        expect(p.accent, p.slug).toMatch(/^#[0-9a-f]{6}$/i);
        expect(p.accentSource, p.slug).toBe("screenshot");
      } else {
        expect(p.accentSource, p.slug).toBe("default");
      }
    }
  });

  it("exactly the five flagships are flagship-tier and featured", () => {
    const flagships = projects.filter((p) => p.tier === "flagship").map((p) => p.slug).sort();
    expect(flagships).toEqual([...FLAGSHIPS].sort());
    for (const p of projects) {
      expect(p.featured, p.slug).toBe(p.tier === "flagship");
    }
  });

  it("home lists do not repeat a project", () => {
    const { flagships, rest } = splitSelectedWork(projects);
    const overlap = flagships.filter((f) => rest.some((r) => r.slug === f.slug));
    expect(overlap).toEqual([]);
    const shown = shownOnHome(projects);
    for (const p of rest) expect(shown.has(p.slug)).toBe(true);
  });
});

describe("selectStripMetrics", () => {
  const metrics = [
    { label: "Accuracy", displayValue: "92%", kind: "product" as const },
    { label: "Routes", displayValue: "50+", kind: "build" as const },
    { label: "Latency", displayValue: "<10s", kind: "product" as const },
  ];

  it("shows only product metrics when any are tagged", () => {
    expect(selectStripMetrics(metrics).map((m) => m.label)).toEqual(["Accuracy", "Latency"]);
  });

  it("shows everything when nothing is tagged", () => {
    const untagged = metrics.map(({ label, displayValue }) => ({ label, displayValue }));
    expect(selectStripMetrics(untagged)).toHaveLength(3);
  });
});
