/**
 * Case-study publication boundary: the single source of truth.
 *
 * Every content/case-studies/<slug>.mdx becomes a public route, a sitemap entry
 * and an OG card, so content/approved-case-studies.json (a reviewed allowlist)
 * decides what may ship. These rules are enforced in three places, all of which
 * import this module rather than restating it:
 *   - build time: src/lib/content.ts getAllCaseStudySlugs() calls
 *     assertApprovedCaseStudies(), so `next build` (generateStaticParams,
 *     sitemap.ts, the OG route) fails on an unapproved .mdx;
 *   - CI: scripts/check-case-study-allowlist.mjs (npm run guard:case-studies);
 *   - manifest: scripts/route-manifest.mjs refuses to write on any failure.
 *
 * Node built-ins only: this file is loaded by Next.js, vitest and plain node.
 */
import fs from "node:fs";
import path from "node:path";

/** Routes that were withdrawn: they must 404, never be approved, never have an .mdx. */
export const WITHDRAWN_ROUTES = Object.freeze(["/projects/churn-analysis"]);

/** Lowercase kebab-case slug. */
export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const ALLOWLIST_FILE = "content/approved-case-studies.json";

/**
 * "/projects/<slug>" -> "<slug>".
 * @param {string} route
 * @returns {string}
 */
const slugOfRoute = (route) => route.replace(/^\/projects\//, "");

/** @param {unknown} err */
const messageOf = (err) => (err instanceof Error ? err.message : String(err));

/**
 * Read and validate content/approved-case-studies.json under `root`.
 * @param {string} root repository root
 * @returns {string[]} the approved slugs (sorted, unique, kebab-case)
 * @throws {Error} whose message starts with "content/approved-case-studies.json"
 */
export function readApprovedCaseStudies(root) {
  const file = path.join(root, "content", "approved-case-studies.json");
  let raw;
  try {
    raw = fs.readFileSync(file, "utf8");
  } catch (err) {
    throw new Error(`${ALLOWLIST_FILE} cannot be read: ${messageOf(err)}`);
  }
  /** @type {unknown} */
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`${ALLOWLIST_FILE} is not valid JSON: ${messageOf(err)}`);
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${ALLOWLIST_FILE} must be a JSON object with an \`approved\` array`);
  }
  if (!Object.prototype.hasOwnProperty.call(parsed, "approved")) {
    const keys = Object.keys(parsed).join(", ") || "none";
    throw new Error(`${ALLOWLIST_FILE} has no \`approved\` key (found: ${keys})`);
  }
  /** @type {unknown} */
  const approved = /** @type {Record<string, unknown>} */ (parsed).approved;
  if (!Array.isArray(approved)) {
    throw new Error(`${ALLOWLIST_FILE}: \`approved\` must be an array, got ${typeof approved}`);
  }
  const problems = [];
  const notString = approved.filter((s) => typeof s !== "string");
  if (notString.length) problems.push(`non-string entries: ${notString.map((s) => JSON.stringify(s)).join(", ")}`);
  /** @type {string[]} */
  const slugs = approved.filter((s) => typeof s === "string");
  const notKebab = slugs.filter((s) => !SLUG_RE.test(s));
  if (notKebab.length) problems.push(`entries that are not kebab-case slugs: ${notKebab.join(", ")}`);
  const dupes = [...new Set(slugs.filter((s, i) => slugs.indexOf(s) !== i))];
  if (dupes.length) problems.push(`duplicate entries: ${dupes.join(", ")}`);
  if ([...slugs].sort().some((s, i) => s !== slugs[i])) problems.push("entries that are not sorted");
  if (problems.length) throw new Error(`${ALLOWLIST_FILE}: \`approved\` has ${problems.join("; ")}`);
  return slugs;
}

/**
 * Slugs of the case-study files that would be published.
 * @param {string} root repository root
 * @returns {string[]} sorted basenames of content/case-studies/*.mdx; [] if the directory is missing
 */
export function listCaseStudyMdxSlugs(root) {
  const dir = path.join(root, "content", "case-studies");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""))
    .sort();
}

/**
 * Compare the allowlist with the files on disk and the withdrawn routes.
 * @param {{ approved: readonly string[], mdxSlugs: readonly string[], withdrawnRoutes: readonly string[] }} input
 * @returns {string[]} human-readable failures; empty when clean
 */
export function caseStudyPublicationFailures({ approved, mdxSlugs, withdrawnRoutes }) {
  const approvedSet = new Set(approved);
  const mdxSet = new Set(mdxSlugs);
  const failures = [];
  for (const s of mdxSlugs) {
    if (!approvedSet.has(s)) {
      failures.push(
        `content/case-studies/${s}.mdx is not in ${ALLOWLIST_FILE} (unapproved publication: ${s}); approving it is a publication decision, otherwise remove the file`
      );
    }
  }
  for (const s of approved) {
    if (!mdxSet.has(s)) failures.push(`approved slug ${s} has no content/case-studies/${s}.mdx (stale allowlist entry)`);
  }
  for (const w of withdrawnRoutes) {
    const s = slugOfRoute(w);
    if (approvedSet.has(s)) failures.push(`withdrawn route ${w} is approved in ${ALLOWLIST_FILE}`);
    if (mdxSet.has(s)) failures.push(`withdrawn route ${w} has content/case-studies/${s}.mdx`);
  }
  return failures;
}

/**
 * The build-time gate. Returns the approved slugs, which on success equal the
 * sorted .mdx set; otherwise throws listing every failure.
 * @param {string} root repository root
 * @returns {string[]}
 * @throws {Error} "Case-study publication guard failed:\n - ..."
 */
export function assertApprovedCaseStudies(root) {
  /** @type {string[]} */
  let approved = [];
  /** @type {string[]} */
  let failures;
  try {
    approved = readApprovedCaseStudies(root);
    failures = caseStudyPublicationFailures({
      approved,
      mdxSlugs: listCaseStudyMdxSlugs(root),
      withdrawnRoutes: WITHDRAWN_ROUTES,
    });
  } catch (err) {
    failures = [messageOf(err)];
  }
  if (failures.length) {
    throw new Error(`Case-study publication guard failed:\n - ${failures.join("\n - ")}`);
  }
  return approved;
}

/**
 * Check the generated tests/e2e/route-manifest.ts text against the allowlist.
 * @param {string} manifestSource text of tests/e2e/route-manifest.ts
 * @param {readonly string[]} approved approved slugs
 * @returns {string[]} failures; empty when clean
 */
export function manifestCaseStudyFailures(manifestSource, approved) {
  const failures = [];
  const approvedSet = new Set(approved);
  if (!/export const ROUTES\b/.test(manifestSource)) {
    failures.push("tests/e2e/route-manifest.ts has no ROUTES export (regenerate it: npm run routes:manifest)");
  }
  const entryRe = /\{\s*"?path"?\s*:\s*"([^"]+)"\s*,\s*"?kind"?\s*:\s*"case-study"/g;
  const manifestSlugs = new Set([...manifestSource.matchAll(entryRe)].map((m) => slugOfRoute(m[1] ?? "")));
  for (const s of manifestSlugs) {
    if (!approvedSet.has(s)) failures.push(`tests/e2e/route-manifest.ts lists unapproved case study /projects/${s}`);
  }
  for (const s of approved) {
    if (!manifestSlugs.has(s)) {
      failures.push(`approved slug ${s} is missing from tests/e2e/route-manifest.ts (stale manifest: npm run routes:manifest)`);
    }
  }
  const withdrawn = manifestSource.match(/export const WITHDRAWN_ROUTES[^=]*=\s*\[([^\]]*)\]/);
  if (!withdrawn) {
    failures.push("tests/e2e/route-manifest.ts has no WITHDRAWN_ROUTES array (regenerate it: npm run routes:manifest)");
  } else {
    const listed = [...(withdrawn[1] ?? "").matchAll(/["'`]([^"'`]+)["'`]/g)].map((m) => m[1] ?? "");
    const inManifest = [...new Set(listed)].sort().join(", ");
    const inLibrary = [...new Set(WITHDRAWN_ROUTES)].sort().join(", ");
    if (inManifest !== inLibrary) {
      failures.push(
        `tests/e2e/route-manifest.ts WITHDRAWN_ROUTES [${inManifest}] differs from scripts/lib/case-study-allowlist.mjs [${inLibrary}] (regenerate it: npm run routes:manifest)`
      );
    }
  }
  return failures;
}
