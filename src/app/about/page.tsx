import { generatePageMetadata, generatePersonJsonLd, generateBreadcrumbJsonLd } from "@/lib/metadata";
import { getGitHubProfile } from "@/lib/github";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Philosophy } from "@/components/about/Philosophy";
import { SkillsRadar } from "@/components/about/SkillsRadar";
import { Timeline } from "@/components/about/Timeline";
import { Achievements } from "@/components/about/Achievements";
import { GitHubStats } from "@/components/about/GitHubStats";
import { JsonLd } from "@/components/ui/JsonLd";
import Image from "next/image";
import Link from "next/link";
import dhruvImage from "@/assets/Dhruv_Image.jpg";
import styles from "./about.module.css";

export const metadata = generatePageMetadata({
  title: "About",
  description:
    "Learn about Dhruv Singhal - a Product Manager & Builder with experience across D2C e-commerce, enterprise AI workflows, analytics, and technical execution.",
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
        subtitle="Product Manager & Builder - turning ambiguous domain problems into product decisions, specs, and shipped systems."
      />

      {/* Philosophy */}
      <section aria-label="Philosophy" data-section="philosophy" className={styles.section}>
        <div className={styles.inner}>
          <header className={styles.sectionHeader}>
            <SectionLabel index="01">Philosophy</SectionLabel>
            <h2 className={styles.sectionTitle}>How I think</h2>
          </header>
          <Philosophy />
        </div>
      </section>

      {/* Bio */}
      <section aria-label="Biography" data-section="bio" className={styles.section}>
        <div className={styles.innerNarrow}>
          <header className={styles.sectionHeader}>
            <SectionLabel index="02">Background</SectionLabel>
            <h2 className={styles.sectionTitle}>My story</h2>
          </header>
          <div className={styles.bioRow}>
            <Image
              src={dhruvImage}
              alt="Portrait of Dhruv Singhal"
              className={styles.headshot}
              sizes="(max-width: 640px) 220px, 280px"
              priority
            />
            <div>
              <p className={styles.bio}>
                Final-year B.Tech student with operating experience across
                product management, D2C e-commerce, and enterprise AI workflows.
                I currently drive growth product initiatives at The Sleep
                Company as a Product Manager Intern, scoped AI-powered
                enterprise workflows at Wipro TOPS, owned growth from the
                founder&apos;s office at Read Riches, and helped define
                prospecting systems at Omniful.ai. On the side, I co-built{" "}
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

          <dl className={styles.education}>
            <dt className={styles.eduKey}>Education</dt>
            <dd className={styles.eduValue}>
              <span className={styles.eduTitle}>
                B.Tech Electronics &amp; Computer Engineering
              </span>
              <span className={styles.eduSub}>J.C. Bose University, 2022&ndash;2026</span>
            </dd>
          </dl>
        </div>
      </section>

      {/* Skills */}
      <section aria-label="Skills" data-section="skills" className={styles.section}>
        <div className={styles.inner}>
          <header className={styles.sectionHeader}>
            <SectionLabel index="03">Skills</SectionLabel>
            <h2 className={styles.sectionTitle}>What I bring</h2>
          </header>
          <SkillsRadar />
        </div>
      </section>

      {/* Experience Timeline */}
      <section aria-label="Experience" data-section="experience" className={styles.section}>
        <div className={styles.innerNarrow}>
          <header className={styles.sectionHeader}>
            <SectionLabel index="04">Experience</SectionLabel>
            <h2 className={styles.sectionTitle}>Where I&apos;ve been</h2>
          </header>
          <Timeline />
        </div>
      </section>

      {/* Achievements */}
      <section aria-label="Achievements" data-section="achievements" className={styles.section}>
        <div className={styles.inner}>
          <header className={styles.sectionHeader}>
            <SectionLabel index="05">Achievements</SectionLabel>
            <h2 className={styles.sectionTitle}>Highlights</h2>
          </header>
          <Achievements />
        </div>
      </section>

      {/* GitHub Stats */}
      <section aria-label="GitHub activity" data-section="github" className={styles.section}>
        <div className={styles.inner}>
          <header className={styles.sectionHeader}>
            <SectionLabel index="06">Open source</SectionLabel>
            <h2 className={styles.sectionTitle}>GitHub activity</h2>
          </header>
          <GitHubStats profile={github} />
        </div>
      </section>

      {/* How I Work */}
      <section aria-label="How I work" data-section="how-i-work" className={styles.section}>
        <div className={styles.innerNarrow}>
          <header className={styles.sectionHeader}>
            <SectionLabel index="07">How I work</SectionLabel>
            <h2 className={styles.sectionTitle}>Operating principles</h2>
          </header>
          <dl className={styles.values}>
            {[
              { label: "High-Ownership", detail: "Killed 37 low-signal dashboard charts at Wipro — kept the 3 that drove decisions" },
              { label: "Low-Dependency", detail: "Wrote the PRD, built the eval harness, and shipped v1 of Aarchid myself" },
              { label: "Data-First", detail: "Every feature proposal comes with a success metric and a kill criteria" },
              { label: "Fast Execution", detail: "Portfolio shipped through 5 iterations in 3 months, using feedback to sharpen positioning, content, and navigation." },
            ].map((v) => (
              <div key={v.label} className={styles.valueRow}>
                <dt className={styles.valueName}>{v.label}</dt>
                <dd className={styles.valueDetail}>{v.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Resume CTA */}
      <div className={styles.resumeCta}>
        <div className={styles.inner}>
          <Button href="/resume/dhruv-singhal-resume.pdf">
            Download resume
          </Button>
        </div>
      </div>
    </div>
  );
}
