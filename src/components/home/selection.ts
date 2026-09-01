import type { Project } from "@/types/project";

/**
 * One place decides what the home page shows under "Selected work", so the
 * sections beneath it can exclude the same projects instead of repeating
 * them. Flagships take the product carousel; compact-tier projects with a
 * case-study page take the "Also built" index rows.
 */
export function splitSelectedWork(projects: Project[]): {
  flagships: Project[];
  rest: Project[];
} {
  const flagships = carouselProjects(projects);
  const rest = projects.filter(
    (p) => p.tier !== "flagship" && p.hasCaseStudy !== false
  );
  return { flagships, rest };
}

/**
 * The flagship products in carousel order. `order` is the editorial sequence
 * (content/projects.json), so the rail follows it rather than the array order
 * the caller happened to pass. Compact-tier work never enters the rail.
 */
export function carouselProjects(projects: Project[]): Project[] {
  return projects
    .filter((p) => p.tier === "flagship")
    .slice()
    .sort((a, b) => a.order - b.order);
}

/** Slugs of every project already on the home page above the suggestions. */
export function shownOnHome(projects: Project[]): Set<string> {
  const { flagships, rest } = splitSelectedWork(projects);
  return new Set([...flagships, ...rest].map((p) => p.slug));
}
