import { generatePageMetadata, generateBreadcrumbJsonLd } from "@/lib/metadata";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { getGitHubData } from "@/lib/github";
import styles from "./now.module.css";

const LAST_UPDATED = "2026-04-05";

export const metadata = generatePageMetadata({
  title: "Now",
  description:
    "What Dhruv Singhal is doing now — current work, learning, reading, and building.",
  path: "/now",
});

function formatNowDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function NowPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Now", url: "/now" },
  ]);
  const githubData = await getGitHubData();

  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <header className={styles.header}>
        <h1 className={styles.title}>What I&apos;m Doing Now</h1>
        <p className={styles.intro}>
          This page is a snapshot of what I&apos;m focused on right now —
          work, learning, side projects, and what&apos;s next. It changes
          as my priorities shift.
        </p>
        <p className={styles.updated}>
          Last updated: <time dateTime={LAST_UPDATED}>{formatNowDate(LAST_UPDATED)}</time>
        </p>
      </header>

      <div className={styles.timeline}>
        <div className={styles.section}>
          <SectionLabel>Working On</SectionLabel>
          <h2 className={styles.sectionTitle}>Current Roles</h2>
          <ul className={styles.list}>
            <li><strong>Wipro</strong> — Aviation OS: building analytics dashboards and operational tooling for airline operations</li>
            <li><strong>Odena</strong> — Analytics Consultant: data strategy, funnel optimization, and growth experiments</li>
          </ul>
        </div>

        <div className={styles.section}>
          <SectionLabel>Learning</SectionLabel>
          <h2 className={styles.sectionTitle}>Growing In</h2>
          <ul className={styles.list}>
            <li>Advanced product analytics &amp; experimentation design</li>
            <li>System design for data-intensive applications</li>
            <li>Growth frameworks (AARRR, North Star, retention loops)</li>
            <li>Next.js App Router &amp; React Server Components</li>
          </ul>
        </div>

        <div className={styles.section}>
          <SectionLabel>Reading</SectionLabel>
          <h2 className={styles.sectionTitle}>On My Shelf</h2>
          <ul className={styles.list}>
            <li><em>Inspired</em> — Marty Cagan</li>
            <li><em>Thinking in Systems</em> — Donella Meadows</li>
            <li><em>The Lean Product Playbook</em> — Dan Olsen</li>
            <li>Lenny&apos;s Newsletter &amp; Reforge essays</li>
          </ul>
        </div>

        <div className={styles.section}>
          <SectionLabel>Building</SectionLabel>
          <h2 className={styles.sectionTitle}>Side Projects</h2>
          <ul className={styles.list}>
            <li><strong>Portfolio v3</strong> — this site, rebuilt with Next.js, React Three Fiber, and MDX</li>
            <li><strong>Project Ideas Dashboard</strong> — prioritization matrix for evaluating side project ideas</li>
          </ul>
        </div>

        {/* Live from GitHub */}
        {githubData.repos.length > 0 && (
          <div className={styles.section}>
            <SectionLabel>Currently Building</SectionLabel>
            <h2 className={styles.sectionTitle}>Recent Repos</h2>
            <ul className={styles.list}>
              {githubData.repos.slice(0, 3).map((repo) => (
                <li key={repo.name}>
                  <a href={repo.url} target="_blank" rel="noopener noreferrer">
                    <strong>{repo.name}</strong>
                  </a>{" "}
                  — {repo.description || repo.language}
                  <span className={styles.repoDate}>
                    {" · "}Updated {Math.floor((Date.now() - new Date(repo.updatedAt).getTime()) / 86400000)}d ago
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.section}>
          <SectionLabel>Looking For</SectionLabel>
          <h2 className={styles.sectionTitle}>Next Step</h2>
          <p className={styles.lookingFor}>
            Full-time Product Analyst or Associate Product Manager roles,
            targeting mid-2026. Open to remote, hybrid, or relocation.
            Especially interested in teams building data products, developer tools,
            or B2B SaaS.
          </p>
        </div>
      </div>

      <footer className={styles.note}>
        This is a{" "}
        <a
          href="https://nownownow.com/about"
          target="_blank"
          rel="noopener noreferrer"
        >
          /now page
        </a>
        , inspired by Derek Sivers. If you have your own, I&apos;d love to see it.
      </footer>
    </div>
  );
}
