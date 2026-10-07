#!/usr/bin/env node
/**
 * Case-study publication guard, CLI (npm run guard:case-studies; runs in CI).
 *
 * A thin wrapper over scripts/lib/case-study-allowlist.mjs, the single source
 * of the rules. Using committed files only, it checks:
 *   1. content/approved-case-studies.json is well formed (an `approved` array
 *      of unique, sorted, kebab-case slugs);
 *   2. every content/case-studies/*.mdx is approved, every approved slug has
 *      an .mdx, and no withdrawn route (WITHDRAWN_ROUTES in the library) is
 *      approved or has an .mdx;
 *   3. the generated tests/e2e/route-manifest.ts exists, lists approved case
 *      studies only and every one of them, and carries the library's
 *      WITHDRAWN_ROUTES.
 * It does not inspect built output. The gate that stops an unapproved .mdx from
 * shipping is the build itself: src/lib/content.ts getAllCaseStudySlugs() calls
 * assertApprovedCaseStudies(), so `next build` fails (generateStaticParams,
 * sitemap.ts and the OG route all go through it).
 *
 * Usage: node scripts/check-case-study-allowlist.mjs [--root <dir>]
 * Exits 1 with one "FAIL: ..." line per problem, else prints "OK: ..." and exits 0.
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
  WITHDRAWN_ROUTES,
  caseStudyPublicationFailures,
  listCaseStudyMdxSlugs,
  manifestCaseStudyFailures,
  readApprovedCaseStudies,
} from "./lib/case-study-allowlist.mjs";

function parseRoot(argv) {
  const i = argv.indexOf("--root");
  if (i === -1) return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const value = argv[i + 1];
  if (!value) {
    console.error("FAIL: --root needs a directory");
    process.exit(1);
  }
  return path.resolve(value);
}

const root = parseRoot(process.argv.slice(2));
const failures = [];

let approved = null;
try {
  approved = readApprovedCaseStudies(root);
} catch (err) {
  failures.push(err instanceof Error ? err.message : String(err));
}

if (approved) {
  failures.push(
    ...caseStudyPublicationFailures({
      approved,
      mdxSlugs: listCaseStudyMdxSlugs(root),
      withdrawnRoutes: WITHDRAWN_ROUTES,
    })
  );
}

const manifestPath = path.join(root, "tests", "e2e", "route-manifest.ts");
if (!fs.existsSync(manifestPath)) {
  failures.push("tests/e2e/route-manifest.ts is missing (run npm run routes:manifest and commit it)");
} else if (approved) {
  failures.push(...manifestCaseStudyFailures(fs.readFileSync(manifestPath, "utf8"), approved));
}

if (failures.length || !approved) {
  for (const f of failures) console.error(`FAIL: ${f}`);
  process.exit(1);
}
console.log(`OK: ${approved.length} approved case studies, ${WITHDRAWN_ROUTES.length} withdrawn routes`);
