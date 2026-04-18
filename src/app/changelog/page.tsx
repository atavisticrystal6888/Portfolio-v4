import { generatePageMetadata, generateBreadcrumbJsonLd } from "@/lib/metadata";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import styles from "@/styles/content-page.module.css";

export const metadata = generatePageMetadata({
  title: "Changelog",
  description:
    "Build log of this portfolio — versions, phases, and the product thinking behind every release.",
  path: "/changelog",
});

interface Release {
  version: string;
  date: string;
  title: string;
  body: string;
  highlights: string[];
  badge?: "shipped" | "in-progress" | "planned";
}

const RELEASES: Release[] = [
  {
    version: "v4.2 — Phase 2",
    date: "April 2026",
    title: "Depth pages & AI PM landing",
    badge: "in-progress",
    body: "The specialization layer. Shipped /ai-pm as the single place to route AI-PM conversations, plus /lab, /uses, /bookshelf — the pages that make this feel like a person, not a résumé.",
    highlights: [
      "/ai-pm — playbooks, Aarkid case study link, AI-focused writing index",
      "/lab — 19 product ideas from the original matrix, now queryable",
      "/uses and /bookshelf — the signals behind how I work and think",
      "Second AI-PM essay in the writing queue",
    ],
  },
  {
    version: "v4.1 — Phase 1",
    date: "April 2026",
    title: "Identity, truth, and UX depth",
    badge: "shipped",
    body: "Closed the gap between what the site claimed and what's actually true. Every Aarkid surface now credits Dilpreet Grover as co-creator, stacks reflect reality, and the command palette gained the actions a power user expects.",
    highlights: [
      "Aarkid case study rewritten with the real Edge Stack (Gemini + Perplexity Sonar + Cloudflare Workers)",
      "Home metrics derive from content — no more hardcoded numbers",
      "Command palette: copy-email, download-resume, socials, keyword search",
      "Navbar resume download, richer 404, testimonial avatars wired up",
    ],
  },
  {
    version: "v4.0 — Phase 0",
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
    version: "v3 — archived",
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
    version: "v2 — archived",
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
    version: "v1 — archived",
    date: "January 2026",
    title: "First public portfolio",
    badge: "shipped",
    body: "Single-page HTML resume. Proof that shipping beats perfect.",
    highlights: ["Lit a fire under the rest"],
  },
];

const UPCOMING = [
  "Phase 3 — Signature: 3D Aarkid hero, eval-harness micro-demo, case-study animated charts",
  "Phase 4 — Proof: Lighthouse 95+ everywhere, axe-core CI, Playwright smoke suite",
  "Phase 5 — Hardening: OG review, sitemap integrity, deploy preview automation",
];

function badgeLabel(b?: Release["badge"]): string {
  if (b === "shipped") return "Shipped";
  if (b === "in-progress") return "In progress";
  if (b === "planned") return "Planned";
  return "";
}

export default function ChangelogPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Changelog", url: "/changelog" },
  ]);

  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <p className={styles.kicker}>Build log</p>
      <h1 className={styles.title}>Changelog</h1>
      <p className={styles.lede}>
        Every PM should eat their own dog food. This is the release log for
        this portfolio — what shipped, when, and why. Each release is treated
        like a real product increment.
      </p>

      <ScrollReveal>
        <div className={styles.section}>
          <SectionLabel>Releases</SectionLabel>
          <h2 className={styles.sectionTitle}>Timeline</h2>
          <div className={styles.timeline}>
            {RELEASES.map((r) => (
              <div key={r.version} className={styles.timelineItem}>
                <span className={styles.timelineDate}>{r.date}</span>
                <h3 className={styles.timelineTitle}>
                  {r.version} — {r.title}
                  {r.badge && (
                    <span className={styles.badge}>{badgeLabel(r.badge)}</span>
                  )}
                </h3>
                <p className={styles.timelineBody}>{r.body}</p>
                <ul className={styles.list} style={{ marginTop: "12px" }}>
                  {r.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <div className={styles.section}>
          <SectionLabel>On the Roadmap</SectionLabel>
          <h2 className={styles.sectionTitle}>What&apos;s next</h2>
          <ul className={styles.list}>
            {UPCOMING.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </div>
      </ScrollReveal>

      <p className={styles.note}>
        Source on{" "}
        <a
          href="https://github.com/atavisticrystal6888/Portfolio-v4"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        . Issues and suggestions welcome.
      </p>
    </div>
  );
}
