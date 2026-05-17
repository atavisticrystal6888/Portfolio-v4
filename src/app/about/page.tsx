import { generatePageMetadata, generatePersonJsonLd, generateBreadcrumbJsonLd } from "@/lib/metadata";
import { getGitHubProfile } from "@/lib/github";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Philosophy } from "@/components/about/Philosophy";
import { SkillsRadar } from "@/components/about/SkillsRadar";
import { Timeline } from "@/components/about/Timeline";
import { Achievements } from "@/components/about/Achievements";
import { GitHubStats } from "@/components/about/GitHubStats";
import { DiagonalDivider } from "@/components/ui/DiagonalDivider";
import { JsonLd } from "@/components/ui/JsonLd";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import Link from "next/link";
import styles from "./about.module.css";

export const metadata = generatePageMetadata({
  title: "About",
  description:
    "Learn about Dhruv Singhal - a Product Analyst & Builder with experience in product management, data analytics, and technical execution.",
  path: "/about",
});

export default async function AboutPage() {
  const personJsonLd = generatePersonJsonLd();
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "About", url: "/about" },
  ]);
  const github = await getGitHubProfile();

  return (
    <div className={styles.page}>
      <JsonLd id="about-person-jsonld" data={personJsonLd} />
      <JsonLd id="about-breadcrumb-jsonld" data={breadcrumbJsonLd} />

      {/* Header */}
      <PageHeader
        title="Dhruv Singhal"
        subtitle="Product Analyst & Builder - turning ambiguous problems into structured execution through data-driven product thinking."
      />

      {/* Philosophy */}
      <section aria-label="Philosophy" data-section="philosophy" className={styles.section} style={{ position: 'relative' }}>
        <DiagonalDivider side="left" />
        <ScrollReveal>
          <div className={styles.sectionHeader}>
            <SectionLabel>Philosophy</SectionLabel>
            <h2 className={styles.sectionTitle}>How I Think</h2>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <Philosophy />
        </ScrollReveal>
        <DiagonalDivider side="right" />
      </section>

      {/* Bio */}
      <section aria-label="Biography" data-section="bio" className={styles.sectionNarrow}>
        <ScrollReveal>
          <div className={styles.sectionHeader}>
            <SectionLabel>Background</SectionLabel>
            <h2 className={styles.sectionTitle}>My Story</h2>
          </div>
          <div className={styles.bioRow}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/headshot.svg"
              alt="Dhruv Singhal"
              className={styles.headshot}
              width={160}
              height={160}
            />
            <div>
              <p className={styles.bio}>
                B.Tech student in my final year, with two years of operating
                experience across product management, aviation ops, and technical
                execution. I&apos;ve worked the product layer at Wipro on aviation
                ground ops, owned growth end-to-end from the founder&apos;s office at
                Read Riches, and scoped features at Omniful.ai - and on the side,
                I co-built{" "}
                <Link href="/projects/aarchid">Aarchid</Link> with{" "}
                <a href="https://github.com/dfordp" target="_blank" rel="noopener noreferrer">
                  Dilpreet Grover
                </a>: a multimodal plant-diagnosis app that reaches 92% accuracy on
                our golden set and runs at the edge for under a quarter per active
                user per month.
              </p>
              <p className={styles.bio}>
                I&apos;m most useful where product thinking, domain expertise, and
                engineering overlap - the kind of work that needs someone who can
                write a PRD, instrument the eval set, and ship the first version
                themselves.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Education */}
      <div className={styles.education}>
        <SectionLabel>Education</SectionLabel>
        <h3 className={styles.eduTitle}>B.Tech Electronics &amp; Computer Engineering</h3>
        <p className={styles.eduSub}>J.C. Bose University, 2022–2026</p>
      </div>

      {/* Skills */}
      <section aria-label="Skills" data-section="skills" className={styles.section} style={{ position: 'relative' }}>
        <DiagonalDivider side="left" />
        <ScrollReveal>
          <div className={styles.sectionHeader}>
            <SectionLabel>Skills Dashboard</SectionLabel>
            <h2 className={styles.sectionTitle}>What I Bring</h2>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.15}>
          <SkillsRadar />
        </ScrollReveal>
        <DiagonalDivider side="right" />
      </section>

      {/* Experience Timeline */}
      <section aria-label="Experience" data-section="experience" className={styles.sectionNarrow}>
        <ScrollReveal>
          <div className={styles.sectionHeader}>
            <SectionLabel>Experience</SectionLabel>
            <h2 className={styles.sectionTitle}>Where I&apos;ve Been</h2>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <Timeline />
        </ScrollReveal>
      </section>

      {/* Achievements */}
      <section aria-label="Achievements" data-section="achievements" className={styles.section}>
        <div className={styles.sectionHeader}>
          <SectionLabel>Achievements</SectionLabel>
          <h2 className={styles.sectionTitle}>Highlights</h2>
        </div>
        <Achievements />
      </section>

      {/* GitHub Stats */}
      <section aria-label="GitHub activity" data-section="github" className={styles.section}>
        <ScrollReveal>
          <div className={styles.sectionHeader}>
            <SectionLabel>Open Source</SectionLabel>
            <h2 className={styles.sectionTitle}>GitHub Activity</h2>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <GitHubStats profile={github} />
        </ScrollReveal>
      </section>

      {/* How I Work */}
      <section aria-label="How I work" data-section="how-i-work" className={styles.sectionNarrow}>
        <div className={styles.sectionHeader}>
          <SectionLabel>How I Work</SectionLabel>
        </div>
        <div className={styles.values}>
          {[
            { label: "High-Ownership", detail: "Killed 37 low-signal dashboard charts at Wipro — kept the 3 that drove decisions" },
            { label: "Low-Dependency", detail: "Wrote the PRD, built the eval harness, and shipped v1 of Aarchid myself" },
            { label: "Data-First", detail: "Every feature proposal comes with a success metric and a kill criteria" },
            { label: "Fast Execution", detail: "Portfolio went v1→v5 in 3 months — each version shipped in under a week" },
          ].map((v) => (
            <GlassCard key={v.label} className={styles.valueCard}>
              <span className={styles.valueName}>{v.label}</span>
              <span className={styles.valueDetail}>{v.detail}</span>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Resume CTA */}
      <div className={styles.resumeCta}>
        <Button href="/resume/dhruv-singhal-resume.pdf">
          Download Resume
        </Button>
      </div>
    </div>
  );
}
