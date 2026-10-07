import { describe, it, expect, afterAll } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";
import { spawnSync } from "child_process";
import allowlist from "../../content/approved-case-studies.json";
import sitemap from "@/app/sitemap";
import { getAllCaseStudySlugs } from "@/lib/content";
import { ROUTES, WITHDRAWN_ROUTES } from "../e2e/route-manifest";

/*
 * content/approved-case-studies.json is the publication boundary: any .mdx in
 * content/case-studies/ becomes a public route and a sitemap entry, so every
 * one must be on the reviewed allowlist (and the allowlist must not go stale).
 */
const ROOT = process.cwd();
const GUARD = path.join(ROOT, "scripts", "check-case-study-allowlist.mjs");
const SYNTHETIC = "zz-synthetic-unapproved";
const approved: string[] = allowlist.approved;
const approvedSet = new Set(approved);
const slugOf = (p: string) => p.replace(/^\/projects\//, "");

describe("approved case-study allowlist", () => {
  it("is a non-empty, sorted list of unique kebab-case slugs", () => {
    expect(approved.length).toBeGreaterThan(0);
    for (const s of approved) expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    expect(approvedSet.size).toBe(approved.length);
    expect(approved).toEqual([...approved].sort());
  });

  it("equals the set of published case-study files", () => {
    expect(new Set(getAllCaseStudySlugs())).toEqual(approvedSet);
  });

  it("every case-study route in the generated manifest is approved, and none is missing", () => {
    const manifest = ROUTES.filter((r) => r.kind === "case-study").map((r) => slugOf(r.path));
    for (const s of manifest) expect(approvedSet.has(s), s).toBe(true);
    expect(new Set(manifest)).toEqual(approvedSet);
  });

  it("every /projects/ URL in the sitemap is approved", () => {
    const urls = sitemap()
      .map((e) => new URL(e.url).pathname)
      .filter((p) => p.startsWith("/projects/"));
    expect(urls.length).toBe(approved.length);
    for (const p of urls) expect(approvedSet.has(slugOf(p)), p).toBe(true);
  });

  it("no withdrawn route is approved", () => {
    for (const w of WITHDRAWN_ROUTES) expect(approvedSet.has(slugOf(w)), w).toBe(false);
  });
});

describe("check-case-study-allowlist.mjs (synthetic fixtures)", () => {
  const fixtures: string[] = [];

  function fixture(opts: { extraMdx?: boolean; injectManifest?: boolean }): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cs-allowlist-"));
    fixtures.push(dir);
    const copy = (rel: string, transform?: (s: string) => string) => {
      const dest = path.join(dir, rel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      const src = fs.readFileSync(path.join(ROOT, rel), "utf8");
      fs.writeFileSync(dest, transform ? transform(src) : src);
    };
    copy("content/approved-case-studies.json");
    copy("scripts/route-manifest.mjs");
    copy("tests/e2e/route-manifest.ts", (src) =>
      opts.injectManifest
        ? src.replace(
            "export const ROUTES: RouteEntry[] = [",
            `export const ROUTES: RouteEntry[] = [\n  {\n    "path": "/projects/${SYNTHETIC}",\n    "kind": "case-study",\n    "expectStatus": 200\n  },`
          )
        : src
    );
    for (const f of fs.readdirSync(path.join(ROOT, "content/case-studies"))) {
      if (f.endsWith(".mdx")) copy(`content/case-studies/${f}`);
    }
    if (opts.extraMdx) {
      fs.copyFileSync(
        path.join(dir, "content/case-studies/aarchid.mdx"),
        path.join(dir, `content/case-studies/${SYNTHETIC}.mdx`)
      );
    }
    return dir;
  }

  const run = (dir: string) => {
    const r = spawnSync(process.execPath, [GUARD, "--root", dir], { encoding: "utf8" });
    return { status: r.status, out: `${r.stdout}${r.stderr}` };
  };

  afterAll(() => {
    for (const d of fixtures) fs.rmSync(d, { recursive: true, force: true });
  });

  it("passes on an unchanged copy of the repo (control)", () => {
    const r = run(fixture({}));
    expect(r.out).toMatch(/^OK: \d+ approved case studies/m);
    expect(r.status).toBe(0);
  });

  it("fails when an unapproved case-study .mdx is added", () => {
    const r = run(fixture({ extraMdx: true }));
    expect(r.status).toBe(1);
    expect(r.out).toContain(SYNTHETIC);
  });

  it("still fails when the manifest was regenerated to include it", () => {
    const r = run(fixture({ extraMdx: true, injectManifest: true }));
    expect(r.status).toBe(1);
    expect(r.out).toContain(`content/case-studies/${SYNTHETIC}.mdx is not in`);
    expect(r.out).toContain(`unapproved case study /projects/${SYNTHETIC}`);
  });
});
