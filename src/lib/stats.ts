import { getAllBlogPosts, getAllCaseStudies, getAllProjects } from "./content";

/**
 * Home metrics derived from actual content - not hardcoded.
 * Used by {@link MetricsGrid}.
 *
 * Single source of truth: content in `/content/**`.
 */
/** Coverage counts: how much is written up, not an outcome. */
export const COVERAGE_CASE_STUDIES = "Case studies · coverage";
export const COVERAGE_ARTICLES = "Articles · coverage";

export interface HomeMetric {
  value: string;
  label: string;
}

/**
 * Compute the headline metrics shown on the home page.
 *
 * One tile per featured flagship, each stating what the evidence supports and
 * where it stops (offline eval, gate run, test counts), followed by coverage
 * counts derived from content (case studies, articles).
 */
export function getHomeMetrics(): HomeMetric[] {
  const projects = getAllProjects();
  const caseStudies = getAllCaseStudies();
  const posts = getAllBlogPosts();

  // One evidence tile per featured flagship, in editorial order. The label
  // carries the limit (offline eval, gate date, not deployed) with the number.
  const evidence = projects
    .filter((p) => p.featured && p.tier === "flagship")
    .sort((a, b) => a.order - b.order)
    .map<HomeMetric>((p) => ({ value: p.metricValue, label: p.metricLabel }));

  return [
    ...evidence,
    { value: `${caseStudies.length}`, label: COVERAGE_CASE_STUDIES },
    { value: `${posts.length}`, label: COVERAGE_ARTICLES },
  ];
}
