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
  | "local-build"
  | "pilot-ready"
  | "open-source"
  | "private"
  | "internal"
  | "archived";

/**
 * How strong the headline evidence is. "measured" = a number from a defined
 * evaluation or instrument; "tested" = automated test runs; "built" = the
 * artefact exists and runs; "self-reported" = my account, no artefact to cite.
 */
export type EvidenceTier = "measured" | "tested" | "built" | "self-reported";

/** "flagship" = full product page + home; "compact" = index entry. */
export type ProjectTier = "flagship" | "compact";

export interface Project {
  slug: string;
  name: string;
  /** Short product name for mastheads and cards, e.g. "Aarchid". */
  productName?: string;
  /** One line, ≤12 words: what it is. */
  tagline?: string;
  /**
   * The PM call the case study rests on, one sentence of at most 140
   * characters, faithful to the study's own "Decision" section. Leads the
   * masthead and stands in for a missing screenshot on cards.
   */
  decision?: string;
  /** Who it is for; rendered as the masthead eyebrow. */
  audience?: string | null;
  status?: ProjectStatus;
  /** Small qualifier printed beside the status pill, e.g. two release lines. */
  statusNote?: string;
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
  /** Visible caption under the case-study hero shot (e.g. "synthetic seed data"). */
  imageCaption?: string;
  /**
   * Case-study hero only: a crop of `imageUrl` sized for the hero frame.
   * Cards keep `imageUrl`; the hero's zoom opens the full `imageUrl`.
   */
  heroImageUrl?: string;
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
  /** Exact contribution line, e.g. "Co-built with Dilpreet Grover · product, eval, orchestration". */
  ownership: string;
  /** Strength of the headline evidence on this entry. */
  evidenceTier: EvidenceTier;
  /**
   * Visible limit printed under the evidence tier in the case-study masthead,
   * e.g. where a "measured" number came from and what it does not cover.
   */
  evidenceNote?: string;
  /** Team line shown instead of "Solo" when there are no linked co-creators. */
  team?: string;
  /** ISO date the facts on this entry were last checked. */
  lastVerified?: string;
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
  /**
   * One muted line under an imageless masthead saying why there is no
   * screenshot (e.g. "the app runs locally only; capture pending").
   */
  heroNote?: string;
  /**
   * Meta description for search results, 120 to 160 characters, unique per
   * study, caveats kept. Falls back to the TL;DR (truncated) when absent.
   */
  metaDescription?: string;
  /**
   * Shorter <title> when `title` would run past 60 characters with the
   * " | Dhruv Singhal" suffix. Product name first.
   */
  seoTitle?: string;
  /**
   * What the masthead decision beat, from the study's own Options or
   * Trade-offs text. Rendered after "Instead of" under the Decision.
   */
  alternative?: string;
  /** What the decision cost, from the study's own Trade-offs text. Rendered after "Cost:". */
  tradeoff?: string;
  prevSlug: string;
  nextSlug: string;
}

export interface CaseStudy extends CaseStudyFrontmatter {
  content: string;
}
