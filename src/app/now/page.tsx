import { generatePageMetadata, generateBreadcrumbJsonLd } from "@/lib/metadata";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import styles from "./now.module.css";

export const metadata = generatePageMetadata({
  title: "Now",
  description:
    "What Dhruv Singhal is doing now — current work, learning, reading, and building.",
  path: "/now",
});

export default function NowPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Now", url: "/now" },
  ]);

  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <h1 className={styles.title}>What I&apos;m Doing Now</h1>
      <p className={styles.updated}>
        Last updated: <time dateTime="2026-03">March 2026</time>
      </p>

      <ScrollReveal>
        <div className={styles.section}>
          <SectionLabel>Working On</SectionLabel>
          <h2 className={styles.sectionTitle}>Current Roles</h2>
          <ul className={styles.list}>
            <li><strong>Wipro</strong> — Aviation OS</li>
            <li><strong>Odena</strong> — Analytics Consultant</li>
          </ul>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.05}>
        <div className={styles.section}>
          <SectionLabel>Learning</SectionLabel>
          <h2 className={styles.sectionTitle}>Growing In</h2>
          <ul className={styles.list}>
            <li>Advanced product analytics</li>
            <li>System design</li>
            <li>Growth frameworks</li>
          </ul>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <div className={styles.section}>
          <SectionLabel>Reading</SectionLabel>
          <h2 className={styles.sectionTitle}>On My Shelf</h2>
          <ul className={styles.list}>
            <li><em>Inspired</em> — Marty Cagan</li>
            <li><em>Thinking in Systems</em> — Donella Meadows</li>
            <li>Lenny&apos;s Newsletter</li>
          </ul>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.15}>
        <div className={styles.section}>
          <SectionLabel>Building</SectionLabel>
          <h2 className={styles.sectionTitle}>Side Projects</h2>
          <ul className={styles.list}>
            <li>Portfolio site v3 (this site)</li>
            <li>Project Ideas Dashboard</li>
          </ul>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <div className={styles.section}>
          <SectionLabel>Looking For</SectionLabel>
          <h2 className={styles.sectionTitle}>Next Step</h2>
          <p style={{ color: "var(--text-body)", lineHeight: 1.7 }}>
            Full-time Product Analyst / APM roles (mid-2026).
          </p>
        </div>
      </ScrollReveal>

      <p className={styles.note}>
        This is a{" "}
        <a
          href="https://nownownow.com/about"
          target="_blank"
          rel="noopener noreferrer"
        >
          /now page
        </a>
        , inspired by Derek Sivers.
      </p>
    </div>
  );
}
