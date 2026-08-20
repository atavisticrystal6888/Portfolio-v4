/**
 * The portfolio’s release log. Lives here rather than in the page so the
 * footer can show the real date of the last release instead of a hardcoded
 * one - the site claims to be maintained by a person, so the date should be
 * true.
 */
export interface Release {
  version: string;
  date: string;
  title: string;
  body: string;
  highlights: string[];
  badge?: "shipped" | "in-progress" | "planned";
}

export const RELEASES: Release[] = [
  {
    version: "v4.3 · Phase 3",
    date: "August 2026",
    title: "Shipped-product roster",
    badge: "shipped",
    body: "The portfolio caught up with the building. Three new featured case studies — ExperimentHub, DeskTasks, and Better-Half — shift the roster's weight toward shipped, tested products, KiteEdge's study now reflects its August state, and /projects gained a Featured / More split with card-only entries for smaller builds.",
    highlights: [
      "ExperimentHub — self-hosted A/B testing platform (Rust assignment core, sequential statistics)",
      "DeskTasks — desktop task widget shipped for Windows + macOS, 540+ test assertions",
      "Better-Half — two-user privacy-first PWA, 575 live RLS policy checks",
      "KiteEdge refreshed: 50 endpoints, 13 services, NIFTY 500 screener, trade journal",
      "Tiered /projects grid + three card-only entries; repo root decluttered",
    ],
  },
  {
    version: "v4.2 · Phase 2",
    date: "April 2026",
    title: "Depth pages & AI PM landing",
    badge: "shipped",
    body: "The specialization layer. Shipped /ai-pm as the single place to route AI-PM conversations, plus /lab, /uses, /bookshelf — the pages that make this feel like a person, not a résumé.",
    highlights: [
      "/ai-pm — playbooks, Aarchid case study link, AI-focused writing index",
      "/lab — 19 product ideas from the original matrix, now queryable",
      "/uses and /bookshelf — the signals behind how I work and think",
      "Second AI-PM essay in the writing queue",
    ],
  },
  {
    version: "v4.1 · Phase 1",
    date: "April 2026",
    title: "Identity, truth, and UX depth",
    badge: "shipped",
    body: "Closed the gap between what the site claimed and what's actually true. Every Aarchid surface now credits Dilpreet Grover as co-creator, stacks reflect reality, and the command palette gained the actions a power user expects.",
    highlights: [
      "Aarchid case study rewritten with the real Edge Stack (Gemini + Exa AI API + Cloudflare Workers)",
      "Home metrics derive from content — no more hardcoded numbers",
      "Command palette: copy-email, download-resume, socials, keyword search",
      "Navbar resume download, richer 404, testimonial avatars wired up",
    ],
  },
  {
    version: "v4.0 · Phase 0",
    date: "April 2026",
    title: "Consolidation",
    badge: "shipped",
    body: "Moved v1 → v3, legacy HTMLs, and the portfolio-next experiment into /archive. Promoted v4 to the single source of truth, split it into its own repo, and drafted the GitHub profile README.",
    highlights: [
      "archive/ preserves full history of v1–v3",
      "Parent repo .gitignore excludes portfolio-v4 (now a standalone repo)",
      "atavisticrystal6888/atavisticrystal6888 profile README drafted",
    ],
  },
  {
    version: "v3 · archived",
    date: "March 2026",
    title: "Next.js experiment",
    badge: "shipped",
    body: "First Next.js rewrite — validated the App Router + MDX pattern that v4 is built on. Shipped, learned, archived.",
    highlights: [
      "Proved App Router + MDX for long-form case studies",
      "Surfaced the conditional-loading architecture v2 used",
    ],
  },
  {
    version: "v2 · archived",
    date: "February 2026",
    title: "Static multipage portfolio",
    badge: "shipped",
    body: "14-page static site with CDN-only dependencies. The constitution-driven design system behind v4 was authored here.",
    highlights: [
      "Shared tokens/base/components CSS architecture",
      "GSAP ScrollTrigger + command palette pattern",
      "Case study and blog article templates",
    ],
  },
  {
    version: "v1 · archived",
    date: "January 2026",
    title: "First public portfolio",
    badge: "shipped",
    body: "Single-page HTML resume. Proof that shipping beats perfect.",
    highlights: ["Lit a fire under the rest"],
  },
];


/** Newest first, so the head of the list is the current state of the site. */
export const LATEST_RELEASE = RELEASES[0]!;
