/**
 * Status and category labels for projects, in plain JS so both the site
 * (re-exported by src/components/case-study/ProjectFacts.tsx and
 * src/lib/utils.ts) and scripts/render-plates.mjs, which runs in plain Node
 * and cannot import TS, read the same vocabulary. Keys mirror ProjectStatus
 * in src/types/project.ts; ProjectFacts.tsx types the map against it, so a
 * missing status fails the type check.
 */
export const STATUS_LABEL = {
  live: "Live",
  "local-build": "Local build · not deployed",
  "pilot-ready": "Ready for local pilot",
  "open-source": "Open source",
  private: "Private",
  internal: "Internal",
  archived: "Archived",
};

/** Internal category keys to user-facing labels; unknown keys pass through. */
export const CATEGORY_LABEL = {
  ai: "AI",
  product: "Product",
  data: "Data",
  technical: "Technical",
};

/**
 * Convert an internal category key into its user-facing label.
 * @param {string} category
 * @returns {string}
 */
export function formatCategoryLabel(category) {
  const key = category.toLowerCase();
  return Object.prototype.hasOwnProperty.call(CATEGORY_LABEL, key)
    ? CATEGORY_LABEL[/** @type {keyof typeof CATEGORY_LABEL} */ (key)]
    : category;
}
