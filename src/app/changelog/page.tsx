import { generatePageMetadata, generateBreadcrumbJsonLd } from "@/lib/metadata";
import { JsonLd } from "@/components/ui/JsonLd";
import { SectionLabel } from "@/components/ui/SectionLabel";
import styles from "@/styles/content-page.module.css";
import { RELEASES, type Release } from "@/lib/changelog";

export const metadata = generatePageMetadata({
  title: "Changelog",
  description:
    "Build log of this portfolio — versions, phases, and the product thinking behind every release.",
  path: "/changelog",
});

// Phase 3 used to sit at the top of this list while v4.3 · Phase 3 sat in the
// timeline above marked Shipped. The page was arguing with itself.
const UPCOMING = [
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
      <JsonLd id="changelog-breadcrumb-jsonld" data={breadcrumbJsonLd} />

      <p className={styles.kicker}>Build log</p>
      <h1 className={styles.title}>Changelog</h1>
      <p className={styles.lede}>
        Every PM should eat their own dog food. This is the release log for
        this portfolio — what shipped, when, and why. Each release is treated
        like a real product increment.
      </p>

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

      <div className={styles.section}>
        <SectionLabel>On the Roadmap</SectionLabel>
        <h2 className={styles.sectionTitle}>What&apos;s next</h2>
        <ul className={styles.list}>
          {UPCOMING.map((u) => (
            <li key={u}>{u}</li>
          ))}
        </ul>
      </div>

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
