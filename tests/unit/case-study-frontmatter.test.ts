import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/*
 * Case-study frontmatter contract (2 Oct 2026 route review): every study has
 * a written meta description, an early "Instead of … · Cost: …" pair for the
 * masthead, and a <title> that fits 60 characters with the site suffix.
 */
const DIR = path.join(process.cwd(), "content", "case-studies");
const SUFFIX = " | Dhruv Singhal";
const studies = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith(".mdx"))
  .map((f) => ({ file: f, ...matter(fs.readFileSync(path.join(DIR, f), "utf8")) }));

describe("case-study frontmatter", () => {
  it("covers the ten studies", () => {
    expect(studies).toHaveLength(10);
  });

  for (const { file, data, content } of studies) {
    describe(file, () => {
      it("has a unique 120-160 character meta description that is a full sentence", () => {
        expect(typeof data.metaDescription).toBe("string");
        expect(data.metaDescription.length).toBeGreaterThanOrEqual(120);
        expect(data.metaDescription.length).toBeLessThanOrEqual(160);
        expect(data.metaDescription).toMatch(/\.$/);
        expect(data.metaDescription).not.toMatch(/…$/);
        const others = studies.filter((s) => s.file !== file).map((s) => s.data.metaDescription);
        expect(others).not.toContain(data.metaDescription);
      });

      it("keeps the rendered title within 60 characters", () => {
        const title = `${data.seoTitle ?? data.title}${SUFFIX}`;
        expect(title.length, title).toBeLessThanOrEqual(60);
      });

      it("states what the decision beat and what it cost", () => {
        expect(typeof data.alternative).toBe("string");
        expect(typeof data.tradeoff).toBe("string");
        expect(data.alternative.length).toBeGreaterThan(10);
        expect(data.tradeoff.length).toBeGreaterThan(10);
      });

      it("never names the unverified search provider", () => {
        expect(JSON.stringify(data) + content).not.toMatch(/\bExa\b/);
      });
    });
  }

  it("keeps the status caveats in the descriptions", () => {
    const desc = (slug: string): string =>
      String(studies.find((s) => s.file === `${slug}.mdx`)?.data.metaDescription ?? "");
    expect(desc("sawari")).toMatch(/not deployed/i);
    expect(desc("cohort-retention-studio")).toMatch(/local pilot/i);
    expect(desc("aarchid")).toMatch(/offline eval result withheld/i);
    expect(desc("aarchid")).toMatch(/Dilpreet Grover/);
    expect(desc("experiment-hub")).toMatch(/demo data/i);
  });

  it("Aarchid publishes no eval result figure (owner decision, 3 Oct 2026)", () => {
    const aarchid = studies.find((s) => s.file === "aarchid.mdx")!;
    const all = JSON.stringify(aarchid.data) + aarchid.content;
    expect(all).not.toMatch(/92%|90%|200-sample|200 labelled|\$0\.25/);
    expect(aarchid.data.metrics).toEqual([]);
    const portfolio = studies.find((s) => s.file === "portfolio-site.mdx")!;
    expect(portfolio.content).not.toMatch(/92%/);
  });

  it("portfolio performance rows carry the 2 Oct 2026 owner-approved figures", () => {
    const portfolio = studies.find((s) => s.file === "portfolio-site.mdx")!.content;
    expect(portfolio).toContain("Lighthouse 13.5.0");
    expect(portfolio).toContain("from 4.30 s to 3.23 s");
    expect(portfolio).toContain("from 79 to 93");
    expect(portfolio).toContain("3.12–3.34 s");
    expect(portfolio).toContain("The under-2-second target was not met.");
    expect(portfolio).not.toMatch(/\b85 performance\b|LCP 4\.0 s|95\+|\bINP\b/);
  });

  it("projects.json carries no withdrawn claim wording", () => {
    const raw = fs.readFileSync(path.join(process.cwd(), "content", "projects.json"), "utf8");
    expect(raw).not.toMatch(/\bExa\b/);
    expect(raw).not.toMatch(/zero backend/i);
    expect(raw).not.toMatch(/25 (pinned )?reference cases/i);
    expect(raw).not.toMatch(/\$0\/month infra/);
  });
});
