export interface CaseStudyMetric {
  label: string;
  /**
   * "product" = an outcome a user would feel (accuracy, latency, cost, users);
   * "build" = an engineering fact (routes, workers, assertions). The outcome
   * strip shows product metrics first; untagged metrics all show.
   */
  kind?: "product" | "build";
  /** @deprecated No longer rendered (tiles show displayValue); kept so existing frontmatter parses. */
  value?: number;
  displayValue: string;
  /** @deprecated No longer rendered; kept so existing frontmatter parses. */
  chartType?: "bar" | "doughnut" | "line";
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

/** Where the product stands today. Every pill on the site must be exact. */
export type ProjectStatus =
  | "live"
  | "private-beta"
  | "archived"
  | "internal"
  | "open-source";

/** "flagship" = full product page + home; "compact" = index entry. */
export type ProjectTier = "flagship" | "compact";

export interface Project {
  slug: string;
  name: string;
  /** Short product name for mastheads and cards, e.g. "Aarchid". */
  productName?: string;
  /** One line, ≤12 words: what it is. */
  tagline?: string;
  /** Who it is for; rendered as the masthead eyebrow. */
  audience?: string | null;
  status?: ProjectStatus;
  /** Short chip text ("Per-plant pricing", "Free, open source") or null when unknown. */
  businessModel?: string | null;
  /**
   * Product accent as a hex colour, or null to fall back to the site accent.
   * Drives the tinted ground behind framed screenshots.
   */
  accent?: string | null;
  /** Where the accent came from — a product screenshot or the site default. */
  accentSource?: "screenshot" | "default";
  /** Wordmark image path, or null to set the product name in type. */
  wordmark?: string | null;
  /** Muted demo loop (webm/mp4) shown in place of the hero screenshot. */
  demoVideo?: string | null;
  category: "product" | "data" | "ai" | "technical";
  description: string;
  /** Optional screenshot used in project cards. */
  imageUrl?: string | null;
  imageAlt?: string;
  stack: string[];
  metricValue: string;
  metricLabel: string;
  featured: boolean;
  /** Flagships get the full product page and the home carousel; the rest are compact index rows. */
  tier?: ProjectTier;
  /** False for card-only entries with no case-study page (defaults to true). */
  hasCaseStudy?: boolean;
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
  /** One line of exact ownership — what was mine on this project. */
  myPart?: string;
  metrics: CaseStudyMetric[];
  /** Collaborators rendered in the case-study hero */
  coCreators?: CoCreator[];
  prevSlug: string;
  nextSlug: string;
}

export interface CaseStudy extends CaseStudyFrontmatter {
  content: string;
}
