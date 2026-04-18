export interface CaseStudyMetric {
  label: string;
  value: number;
  displayValue: string;
  chartType: "bar" | "doughnut" | "line";
}

export interface CoCreator {
  /** Display name */
  name: string;
  /** Their role on the project (e.g. "Engineer", "Designer") */
  role: string;
  /** Public profile URL (GitHub, LinkedIn, site) */
  url: string;
  /** Short handle shown inline (e.g. "@dfordp") */
  handle?: string;
}

export interface Project {
  slug: string;
  name: string;
  category: "product" | "data" | "ai" | "technical";
  description: string;
  stack: string[];
  metricValue: string;
  metricLabel: string;
  featured: boolean;
  githubUrl: string | null;
  /** Optional live/deployed URL */
  liveUrl?: string | null;
  /** Collaborators on this project. Omit for solo work. */
  coCreators?: CoCreator[];
  duration: string;
  role: string;
  order: number;
}

export interface CaseStudyFrontmatter {
  slug: string;
  title: string;
  subtitle: string;
  role: string;
  duration: string;
  stack: string[];
  tldr: string;
  metrics: CaseStudyMetric[];
  /** Collaborators rendered in the case-study hero */
  coCreators?: CoCreator[];
  prevSlug: string;
  nextSlug: string;
}

export interface CaseStudy extends CaseStudyFrontmatter {
  content: string;
}
