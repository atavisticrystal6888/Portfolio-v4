import { generatePageMetadata } from "@/lib/metadata";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PageHeader } from "@/components/ui/PageHeader";
import { WhereNext } from "@/components/ui/WhereNext";
import styles from "@/styles/content-page.module.css";
import { RELEASES, type Release } from "@/lib/changelog";

export const metadata = generatePageMetadata({
  title: "Changelog",
  description:
    "Version history of this portfolio from v1 to the current build: what changed in each release, and the product decisions behind each change.",
  path: "/changelog",
});

// Phase 3 used to sit at the top of this list while v4.3 · Phase 3 sat in the
// timeline above marked Shipped. The page was arguing with itself.
const UPCOMING = [
  "Phase 4 — Proof: measured on 30 Sep 2026 with a local Lighthouse run on the home page and an axe scan across 36 routes. Still open: real-device and screen-reader passes",
  "Phase 5 — Hardening: OG review, sitemap integrity, deploy preview automation",
];

function badgeLabel(b?: Release["badge"]): string {
  if (b === "shipped") return "Shipped";
  if (b === "in-progress") return "In progress";
  if (b === "planned") return "Planned";
  return "";
}

export default function ChangelogPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Changelog", href: "/changelog" },
        ]}
        title="Changelog"
        subtitle="Every PM should eat their own dog food. This is the release log for this portfolio — what shipped, when, and why. Each release is treated like a real product increment."
      />

      <section className={styles.section}>
        <div className={styles.inner}>
          <SectionLabel>Releases</SectionLabel>
          <h2 className={styles.sectionTitle}>Timeline</h2>
          <div className={styles.timeline}>
            {RELEASES.map((r) => (
              <div key={r.version} className={styles.timelineItem}>
                {/* Status rides on the date line: inside the h3 it wrapped
                    onto an orphan line under long titles. */}
                <span className={styles.timelineDate}>
                  {r.date}
                  {r.badge && (
                    <span className={styles.badge}>{badgeLabel(r.badge)}</span>
                  )}
                </span>
                <h3 className={styles.timelineTitle}>
                  {r.version} — {r.title}
                </h3>
                <p className={styles.timelineBody}>{r.body}</p>
                <ul className={`${styles.list} ${styles.timelineList}`}>
                  {r.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <SectionLabel>On the Roadmap</SectionLabel>
          <h2 className={styles.sectionTitle}>What&apos;s next</h2>
          <ul className={styles.list}>
            {UPCOMING.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>

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
      </section>

      <WhereNext />
    </div>
  );
}
