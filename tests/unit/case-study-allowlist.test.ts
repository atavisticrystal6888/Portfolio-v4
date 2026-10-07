import { describe, it, expect, afterAll, vi } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";
import { spawnSync } from "child_process";
import sitemap from "@/app/sitemap";
import { getAllCaseStudySlugs } from "@/lib/content";
import {
  WITHDRAWN_ROUTES,
  caseStudyPublicationFailures,
  listCaseStudyMdxSlugs,
  manifestCaseStudyFailures,
  readApprovedCaseStudies,
} from "../../scripts/lib/case-study-allowlist.mjs";

// content/approved-case-studies.json is the publication boundary; the rules live in
// scripts/lib/case-study-allowlist.mjs, enforced by the build (src/lib/content.ts), CI and the manifest.
const ROOT = process.cwd();
const GUARD = path.join(ROOT, "scripts", "check-case-study-allowlist.mjs");
const MANIFEST = path.join(ROOT, "tests", "e2e", "route-manifest.ts");
const SYNTHETIC = "zz-synthetic-unapproved";

const fixtures: string[] = [];
afterAll(() => {
  for (const d of fixtures) fs.rmSync(d, { recursive: true, force: true });
});

/** A temp root holding `files` (relative path -> contents). */
function fixture(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cs-allowlist-"));
  fixtures.push(dir);
  for (const [rel, body] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), body);
  }
  return dir;
}
const allowlistFile = (value: unknown) => ({ "content/approved-case-studies.json": JSON.stringify(value) });

describe("caseStudyPublicationFailures (synthetic arrays)", () => {
  const withdrawnRoutes = ["/projects/gone"];

  it("names an unapproved .mdx", () => {
    const f = caseStudyPublicationFailures({ approved: ["a"], mdxSlugs: ["a", SYNTHETIC], withdrawnRoutes });
    expect(f).toHaveLength(1);
    expect(f[0]).toContain(`unapproved publication: ${SYNTHETIC}`);
  });

  it("flags a stale approved entry with no .mdx", () => {
    const f = caseStudyPublicationFailures({ approved: ["a", "b"], mdxSlugs: ["a"], withdrawnRoutes });
    expect(f).toEqual([expect.stringContaining("approved slug b has no content/case-studies/b.mdx")]);
  });

  it("flags a withdrawn slug that is approved", () => {
    const f = caseStudyPublicationFailures({ approved: ["a", "gone"], mdxSlugs: ["a", "gone"], withdrawnRoutes });
    expect(f.some((m) => m.includes("withdrawn route /projects/gone is approved"))).toBe(true);
  });

  it("flags a withdrawn slug that has an .mdx", () => {
    const f = caseStudyPublicationFailures({ approved: ["a"], mdxSlugs: ["a", "gone"], withdrawnRoutes });
    expect(f.some((m) => m.includes("withdrawn route /projects/gone has content/case-studies/gone.mdx"))).toBe(true);
  });

  it("returns [] for clean input", () => {
    expect(caseStudyPublicationFailures({ approved: ["a", "b"], mdxSlugs: ["a", "b"], withdrawnRoutes })).toEqual([]);
  });
});

describe("readApprovedCaseStudies (fixtures)", () => {
  it("throws on a misspelled `approved` key instead of reading an empty list", () => {
    const root = fixture(allowlistFile({ approve: ["a"] }));
    expect(() => readApprovedCaseStudies(root)).toThrow(/^content\/approved-case-studies\.json.*`approved`/);
  });

  it("throws on an unsorted list", () => {
    expect(() => readApprovedCaseStudies(fixture(allowlistFile({ approved: ["b", "a"] })))).toThrow(/not sorted/);
  });

  it("throws on a non-kebab-case entry", () => {
    expect(() => readApprovedCaseStudies(fixture(allowlistFile({ approved: ["Bad_Slug"] })))).toThrow(/kebab-case.*Bad_Slug/);
  });

  it("returns a valid list", () => {
    expect(readApprovedCaseStudies(fixture(allowlistFile({ approved: ["a", "b-c"] })))).toEqual(["a", "b-c"]);
  });
});

describe("the real repo", () => {
  const approved = readApprovedCaseStudies(ROOT);

  it("has no publication failures", () => {
    const mdxSlugs = listCaseStudyMdxSlugs(ROOT);
    expect(caseStudyPublicationFailures({ approved, mdxSlugs, withdrawnRoutes: WITHDRAWN_ROUTES })).toEqual([]);
  });

  it("getAllCaseStudySlugs() equals the approved list", () => {
    expect(getAllCaseStudySlugs()).toEqual(approved);
  });

  it("every /projects/ URL in the sitemap is approved", () => {
    const slugs = sitemap()
      .map((e) => new URL(e.url).pathname)
      .filter((p) => p.startsWith("/projects/"))
      .map((p) => p.replace(/^\/projects\//, ""));
    expect([...slugs].sort()).toEqual(approved);
  });

  it("the generated route manifest agrees with the allowlist", () => {
    expect(manifestCaseStudyFailures(fs.readFileSync(MANIFEST, "utf8"), approved)).toEqual([]);
  });
});

describe("build-time gate (src/lib/content.ts)", () => {
  it("getAllCaseStudySlugs() throws on an unapproved .mdx, so next build fails", async () => {
    const base = { ...allowlistFile({ approved: ["alpha"] }), "content/case-studies/alpha.mdx": "---\ntitle: Alpha\n---\n" };
    const clean = fixture(base);
    const dirty = fixture({ ...base, [`content/case-studies/${SYNTHETIC}.mdx`]: "---\ntitle: Synthetic\n---\n" });
    const cwd = vi.spyOn(process, "cwd");
    try {
      cwd.mockReturnValue(clean);
      vi.resetModules();
      expect((await import("@/lib/content")).getAllCaseStudySlugs()).toEqual(["alpha"]);

      cwd.mockReturnValue(dirty);
      vi.resetModules();
      const content = await import("@/lib/content");
      expect(() => content.getAllCaseStudySlugs()).toThrow(/zz-synthetic-unapproved/);
    } finally {
      cwd.mockRestore();
      vi.resetModules();
    }
  });
});

describe("check-case-study-allowlist.mjs CLI", () => {
  function repoCopy(withSynthetic: boolean): string {
    const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");
    const files: Record<string, string> = { "content/approved-case-studies.json": read("content/approved-case-studies.json") };
    for (const slug of listCaseStudyMdxSlugs(ROOT)) {
      files[`content/case-studies/${slug}.mdx`] = read(`content/case-studies/${slug}.mdx`);
    }
    const manifest = read("tests/e2e/route-manifest.ts");
    files["tests/e2e/route-manifest.ts"] = manifest;
    if (withSynthetic) {
      files[`content/case-studies/${SYNTHETIC}.mdx`] = read("content/case-studies/aarchid.mdx");
      files["tests/e2e/route-manifest.ts"] = manifest.replace(
        "export const ROUTES: RouteEntry[] = [",
        `export const ROUTES: RouteEntry[] = [\n  {\n    "path": "/projects/${SYNTHETIC}",\n    "kind": "case-study",\n    "expectStatus": 200\n  },`
      );
    }
    return fixture(files);
  }
  const run = (dir: string) => {
    const r = spawnSync(process.execPath, [GUARD, "--root", dir], { encoding: "utf8" });
    return { status: r.status, out: `${r.stdout}${r.stderr}` };
  };

  it("passes on an unchanged copy of the repo (control)", () => {
    const r = run(repoCopy(false));
    expect(r.out).toMatch(/^OK: \d+ approved case studies, \d+ withdrawn routes/m);
    expect(r.status).toBe(0);
  });

  it("fails on an unapproved .mdx even when the manifest was regenerated to include it", () => {
    const r = run(repoCopy(true));
    expect(r.status).toBe(1);
    expect(r.out).toContain(`FAIL: content/case-studies/${SYNTHETIC}.mdx is not in`);
    expect(r.out).toContain(`lists unapproved case study /projects/${SYNTHETIC}`);
  });
});
