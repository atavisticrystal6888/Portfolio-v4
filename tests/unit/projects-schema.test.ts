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

// Carousel order is editorial: four stories, one PM decision each.
const FLAGSHIPS = ["aarchid", "desktasks", "cohort-retention-studio", "sawari"];
const STATUSES = [
  "live",
  "local-build",
  "pilot-ready",
  "open-source",
  "private",
  "internal",
  "archived",
];
const EVIDENCE_TIERS = ["measured", "tested", "built", "self-reported"];
// Withdrawn or never-public entries must not come back through the roster.
const WITHDRAWN = ["churn-analysis", "sku-pipeline"];

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

  it("every public entry states ownership, evidence tier, status and a verified date", () => {
    for (const p of projects) {
      expect(p.ownership, `${p.slug} ownership`).toBeTruthy();
      expect(EVIDENCE_TIERS, `${p.slug} evidenceTier`).toContain(p.evidenceTier);
      expect(STATUSES, `${p.slug} status`).toContain(p.status);
      expect(p.lastVerified, `${p.slug} lastVerified`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("every entry with a case study leads with a one-sentence decision of at most 140 characters", () => {
    for (const p of projects) {
      if (p.hasCaseStudy === false) continue;
      expect(p.decision, `${p.slug} decision`).toBeTruthy();
      expect(p.decision!.length, `${p.slug} decision > 140 chars`).toBeLessThanOrEqual(140);
      expect(p.decision, `${p.slug} decision em-dash`).not.toContain("—");
    }
  });

  it("Sawari is described as rider-to-rider sharing, not a two-sided ride marketplace", () => {
    const sawari = projects.find((p) => p.slug === "sawari")!;
    const text = [sawari.name, sawari.tagline, sawari.audience, sawari.description].join(" ");
    expect(text).not.toMatch(/marketplace built|ride marketplace|riders and drivers/i);
    expect(sawari.audience).not.toMatch(/driver/i);
  });

  it("withdrawn entries stay out and order stays contiguous", () => {
    const slugs = projects.map((p) => p.slug);
    for (const s of WITHDRAWN) expect(slugs, s).not.toContain(s);
    const orders = projects.map((p) => p.order).sort((a, b) => a - b);
    expect(orders).toEqual(orders.map((_, i) => i + 1));
  });

  it("Aarchid is credited as co-built, never solo", () => {
    const aarchid = projects.find((p) => p.slug === "aarchid")!;
    expect(aarchid.ownership).toMatch(/Co-built with Dilpreet Grover/);
    expect(aarchid.coCreators?.length ?? 0).toBeGreaterThan(0);
    const text = JSON.stringify(aarchid).toLowerCase();
    expect(text).not.toMatch(/\bsolo\b|myself/);
  });

  it("Aarchid's eval result is withheld: self-reported tier, visible note, no result figure", () => {
    const aarchid = projects.find((p) => p.slug === "aarchid")!;
    expect(aarchid.evidenceTier).toBe("self-reported");
    expect(aarchid.evidenceNote).toBe(
      "Self-reported: the team ran an offline eval on a golden set. The result is withheld here until the eval artefact or the co-builder's confirmation is available."
    );
    const text = JSON.stringify(aarchid);
    expect(text).not.toMatch(/92%|90%|200-sample|\$0\.25/);
  });

  it("exactly the four flagships are flagship-tier and featured, in carousel order", () => {
    const flagships = projects
      .filter((p) => p.tier === "flagship")
      .sort((a, b) => a.order - b.order)
      .map((p) => p.slug);
    expect(flagships).toEqual(FLAGSHIPS);
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
    { label: "Accuracy", displayValue: "80%", kind: "product" as const },
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
