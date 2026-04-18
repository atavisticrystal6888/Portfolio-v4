import { getAllBlogPosts, getAllCaseStudies, getAllProjects } from "./content";

/**
 * Home metrics derived from actual content — not hardcoded.
 * Used by {@link MetricsGrid}.
 *
 * Single source of truth: content in `/content/**`.
 */
export interface HomeMetric {
  value: string;
  label: string;
}

/**
 * Compute the headline metrics shown on the home page.
 *
 * Currently blends real outcomes from the projects (e.g. "92% accuracy",
 * "~15% churn reduction") with derived counts (pages, articles). This keeps
 * the grid honest: if you ship a new case study or article, the numbers
 * update on the next build.
 */
export function getHomeMetrics(): HomeMetric[] {
  const projects = getAllProjects();
  const caseStudies = getAllCaseStudies();
  const posts = getAllBlogPosts();

  // Surface the two strongest quantitative outcomes (featured first, Aarkid is a known win).
  const featuredOutcomes = projects
    .filter((p) => p.featured)
    .slice(0, 2)
    .map<HomeMetric>((p) => ({ value: p.metricValue, label: p.metricLabel }));

  return [
    ...featuredOutcomes,
    { value: `${caseStudies.length}`, label: "Case Studies" },
    { value: `${posts.length}`, label: "Articles Published" },
  ];
}
