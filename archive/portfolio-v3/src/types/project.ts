export interface CaseStudyMetric {
  label: string;
  value: number;
  displayValue: string;
  chartType: "bar" | "doughnut" | "line";
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
  prevSlug: string;
  nextSlug: string;
}

export interface CaseStudy extends CaseStudyFrontmatter {
  content: string;
}
