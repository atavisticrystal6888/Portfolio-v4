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
    version: "v7 · Trust pass",
    date: "30 September 2026",
    title: "Claims re-verified against their sources",
    badge: "in-progress",
    body: "Claims re-verified and one case study withdrawn; Cohort & Retention Studio and Sawari added; utility pages aligned. The home page now tells four stories, one PM decision each, and every number on it says where it stops.",
    highlights: [
      "Withdrew one case study whose claims I could not support from its source",
      "TCS NQT Prep Hub credit corrected: I built the web app; the question bank it serves was started by three other contributors",
      "Every roster entry shows its status, ownership and evidence tier; each case study adds a last-verified date",
      "Cohort & Retention Studio (local pilot ready) and Sawari (local build, not deployed) join Aarchid and DeskTasks as the four flagships",
      "Home evidence tiles replace outcome tiles; case-study and article counts are labelled as coverage",
      "About, Now, Uses, Bookshelf, Contact and AI PM copy aligned to what the evidence supports",
    ],
  },
  {
    version: "v6 · Product pages",
    date: "September 2026",
    title: "Case studies as product pages, site hardened",
    badge: "shipped",
    body: "The five flagship case studies of that release (Aarchid, KiteEdge, ExperimentHub, DeskTasks and TCS NQT Prep Hub) were rewritten product-first on a real MDX pipeline, each with a product masthead and chapter rail, and the home page now leads with a flagship carousel. A polish pass then hardened the rest of the site: accessibility fixes, error boundaries, tighter mobile layouts, and honest contact handling. Two leftovers went with it: the background-music toggle and testimonial autoplay.",
    highlights: [
      "The v6 roster's five flagship case studies restructured as standalone product pages on a real MDX block library",
      "Home leads with a flagship product carousel; /projects gained product cards and compact rows",
      "Accessibility and mobile hardening: focusable options tables, mobile nav coverage, route and global error boundaries, single-column demos on small screens",
      "Contact page: tel: link with copy buttons, spam honeypot, honest 503 when mail is unconfigured",
      "Six new blog posts, branded favicon, per-page meta descriptions",
      "Removed the background-music toggle and its audio dependency; testimonials no longer auto-advance",
    ],
  },
  {
    // Scope and date from the v5 commits of 19-22 Aug 2026 (WS-0 to WS-F).
    version: "v5 · Working paper",
    date: "August 2026",
    title: "Editorial redesign: the work leads",
    badge: "shipped",
    body: "A redesign around one idea: the work comes first and the page reads like a working paper. The home page became a title block with a contents index and Selected Work directly under it, case studies gained a dossier layout with a \"My part\" row, and the decorative extras went.",
    highlights: [
      "Home: title-block hero with a contents index; Selected Work leads the page",
      "Case studies: dossier header with a spec table, an explicit \"My part\" row and decision and artifact sections",
      "Light-first working-paper theme; index rows replace the uniform card grids",
      "Generated artifacts for KiteEdge and ExperimentHub; live-app links on project rows",
      "Parked interactives, dead components and unused fonts deleted",
    ],
  },
  {
    version: "v4.3 · Phase 3",
    date: "August 2026",
    title: "Built-and-tested roster",
    badge: "shipped",
    body: "The portfolio caught up with the building. Three new case studies (ExperimentHub and DeskTasks featured, Better-Half in the library) shift the roster's weight toward products that were built and tested (deployment status is on each entry), KiteEdge's study now reflects its August state, and /projects gained a Featured / More split with card-only entries for smaller builds.",
    highlights: [
      "ExperimentHub — self-hosted A/B testing platform (Rust assignment core, sequential statistics)",
      "DeskTasks: desktop task widget, 540+ test assertions (August 2026 count)",
      "Better-Half: private two-user PWA, 575 RLS policy checks (August 2026 count)",
      "KiteEdge refreshed (August 2026 state): 50 endpoints, 13 services, NIFTY 500 screener, trade journal",
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
      "/lab: product ideas from the original matrix, now queryable (12 as of September 2026)",
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
      "Aarchid case study rewritten with the real Edge Stack (Gemini + a web research API + Cloudflare Workers)",
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
    body: "Moved v1 → v3, legacy HTMLs, and the portfolio-next experiment into /archive. Promoted v4 to the single source of truth and split it into its own repository.",
    highlights: [
      "Split into its own repository; the archive keeps the full history of v1–v3",
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
