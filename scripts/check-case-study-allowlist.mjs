#!/usr/bin/env node
/**
 * Case-study publication guard (npm run guard:case-studies).
 *
 * Every content/case-studies/<slug>.mdx becomes a public route and a sitemap
 * entry, so the reviewed allowlist in content/approved-case-studies.json is the
 * publication boundary. This script checks, using committed files only:
 *   1. the allowlist is well formed (unique, kebab-case, sorted, non-empty);
 *   2. every case-study .mdx is approved, and every approved slug has an .mdx;
 *   3. withdrawn routes agree between scripts/route-manifest.mjs and the
 *      generated tests/e2e/route-manifest.ts, and none is approved or present;
 *   4. the generated manifest's case-study routes equal the allowlist;
 *   5. any built sitemap.xml (public/ or out/) lists approved case studies only.
 *
 * Usage: node scripts/check-case-study-allowlist.mjs [--root <dir>]
 * Exits 1 with one "FAIL: ..." line per problem. Reads nothing gitignored.
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function parseRoot(argv) {
  const i = argv.indexOf("--root");
  if (i !== -1) {
    const value = argv[i + 1];
    if (!value) {
      console.error("FAIL: --root needs a directory");
      process.exit(1);
    }
    return path.resolve(value);
  }
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
}

const root = parseRoot(process.argv.slice(2));
const failures = [];
const fail = (msg) => failures.push(msg);
const rel = (...p) => path.join(root, ...p);
const slugOf = (routePath) => routePath.replace(/^\/projects\//, "");

// 1. Allowlist shape.
let approved = [];
const allowlistPath = rel("content", "approved-case-studies.json");
try {
  const parsed = JSON.parse(fs.readFileSync(allowlistPath, "utf8"));
  if (!Array.isArray(parsed.approved) || parsed.approved.length === 0) {
    fail("content/approved-case-studies.json: `approved` must be a non-empty array");
  } else {
    approved = parsed.approved;
    const bad = approved.filter((s) => typeof s !== "string" || !SLUG_RE.test(s));
    if (bad.length) fail(`allowlist has invalid slug(s): ${bad.map(String).join(", ")}`);
    const dupes = approved.filter((s, i) => approved.indexOf(s) !== i);
    if (dupes.length) fail(`allowlist has duplicate slug(s): ${[...new Set(dupes)].join(", ")}`);
    const sorted = [...approved].sort();
    if (sorted.some((s, i) => s !== approved[i])) fail("allowlist `approved` is not sorted");
  }
} catch (err) {
  fail(`cannot read content/approved-case-studies.json: ${err.message}`);
}
const approvedSet = new Set(approved);

// 2. Publication boundary: the .mdx files on disk.
const caseDir = rel("content", "case-studies");
const mdxSlugs = fs.existsSync(caseDir)
  ? fs
      .readdirSync(caseDir)
      .filter((f) => f.endsWith(".mdx"))
      .map((f) => f.replace(/\.mdx$/, ""))
      .sort()
  : [];
for (const s of mdxSlugs) {
  if (!approvedSet.has(s)) {
    fail(`content/case-studies/${s}.mdx is not in content/approved-case-studies.json (unapproved publication: ${s})`);
  }
}
for (const s of approved) {
  if (!mdxSlugs.includes(s)) fail(`approved slug ${s} has no content/case-studies/${s}.mdx (stale allowlist entry)`);
}

// 3. Withdrawn routes, from both sources.
function stringArray(src, re, label) {
  const m = src.match(re);
  if (!m) {
    fail(`cannot find ${label}`);
    return null;
  }
  return [...m[1].matchAll(/["'`]([^"'`]+)["'`]/g)].map((x) => x[1]);
}

const manifestPath = rel("tests", "e2e", "route-manifest.ts");
const generatorPath = rel("scripts", "route-manifest.mjs");
const manifestSrc = fs.existsSync(manifestPath) ? fs.readFileSync(manifestPath, "utf8") : null;
if (manifestSrc === null) fail("tests/e2e/route-manifest.ts is missing (run npm run routes:manifest and commit it)");
const generatorSrc = fs.existsSync(generatorPath) ? fs.readFileSync(generatorPath, "utf8") : null;
if (generatorSrc === null) fail("scripts/route-manifest.mjs is missing");

const withdrawnManifest = manifestSrc
  ? stringArray(manifestSrc, /export const WITHDRAWN_ROUTES[^=]*=\s*\[([^\]]*)\]/, "WITHDRAWN_ROUTES in tests/e2e/route-manifest.ts")
  : null;
const withdrawnGenerator = generatorSrc
  ? stringArray(generatorSrc, /const WITHDRAWN\s*=\s*\[([^\]]*)\]/, "WITHDRAWN in scripts/route-manifest.mjs")
  : null;
let withdrawn = [];
if (withdrawnManifest && withdrawnGenerator) {
  const a = [...new Set(withdrawnManifest)].sort().join(",");
  const b = [...new Set(withdrawnGenerator)].sort().join(",");
  if (a !== b) fail(`withdrawn routes differ: manifest [${a}] vs generator [${b}] (regenerate the manifest)`);
  withdrawn = [...new Set([...withdrawnManifest, ...withdrawnGenerator])];
}
for (const w of withdrawn) {
  const s = slugOf(w);
  if (approvedSet.has(s)) fail(`withdrawn route ${w} is in the allowlist`);
  if (mdxSlugs.includes(s)) fail(`withdrawn route ${w} has content/case-studies/${s}.mdx`);
}

// 4. Generated manifest case-study routes must equal the allowlist.
if (manifestSrc) {
  const entryRe = /\{\s*"?path"?\s*:\s*"(\/projects\/[^"]+)"\s*,\s*"?kind"?\s*:\s*"case-study"/g;
  const manifestSlugs = [...manifestSrc.matchAll(entryRe)].map((m) => slugOf(m[1]));
  for (const s of manifestSlugs) {
    if (!approvedSet.has(s)) fail(`tests/e2e/route-manifest.ts lists unapproved case study /projects/${s}`);
  }
  for (const s of approved) {
    if (!manifestSlugs.includes(s)) fail(`approved slug ${s} is missing from tests/e2e/route-manifest.ts (regenerate it)`);
  }
}

// 5. Built sitemaps, when present.
for (const file of [["public", "sitemap.xml"], ["out", "sitemap.xml"]]) {
  const p = rel(...file);
  if (!fs.existsSync(p)) continue;
  const xml = fs.readFileSync(p, "utf8");
  for (const m of xml.matchAll(/\/projects\/([^<"'\s/?#]+)/g)) {
    if (!approvedSet.has(m[1])) fail(`${file.join("/")} lists unapproved case study /projects/${m[1]}`);
  }
}

if (failures.length) {
  for (const f of failures) console.error(`FAIL: ${f}`);
  process.exit(1);
}
console.log(`OK: ${approved.length} approved case studies, ${withdrawn.length} withdrawn routes`);
