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
    "Learn about Dhruv Singhal — a Product Manager & Builder with experience across D2C e-commerce, enterprise AI workflows, analytics, and technical execution.",
  path: "/about",
});

export default async function AboutPage() {
  const personJsonLd = generatePersonJsonLd();
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "About", url: "/about" },
  ]);
  const github = await getGitHubProfile();
  // GitHubStats self-hides when the API had nothing to give, which would
  // otherwise leave this page holding an empty ruled section.
  const hasGitHub =
    github.totalContributions > 0 || github.totalPublicRepos > 0;

  return (
    <div className={styles.page}>
      <JsonLd id="about-person-jsonld" data={personJsonLd} />
      <JsonLd id="about-breadcrumb-jsonld" data={breadcrumbJsonLd} />

      {/* Header */}
      <PageHeader
        title="Dhruv Singhal"
        subtitle="Product Manager & Builder — turning ambiguous domain problems into product decisions, specs, and shipped systems."
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
                I pick up a domain by building something in it. That has been
                the pattern since my first internship. I get close enough to the
                problem to write the PRD, close enough to the data to build the
                eval set, and close enough to the code to ship the first version
                myself. Then whatever breaks tells me what I got wrong in the
                spec.
              </p>
              <p className={styles.bio}>
                At Omniful.ai, &ldquo;find better prospects&rdquo; turned into a
                scoring model built on firmographic and behavioural signals.
                Qualified prospects went from about 10 a day to over 200, and
                the work supported 10 client acquisitions. At Read Riches I ran
                the founder&apos;s office side of content-led growth. I managed a
                4-person research and content team and ran publishing
                experiments that contributed to a 4x retention improvement.
                Different industries, same job: find the loop, instrument it,
                then turn the handle.
              </p>
              <p className={styles.bio}>
                At Wipro TOPS I scoped Auriga ReX, an AI-powered enterprise
                workflow platform, along with the Crew Mobile and Non-Crew
                Records workflows across 12+ aviation scenarios. Most of that
                job was finding edge cases early enough that they became sprint
                tickets instead of incidents. It is also where I killed 37
                low-signal dashboard charts and kept the 3 that actually drove a
                decision. At The Sleep Company I am on growth now, evaluating
                vendors across BSPs, CRMs, payment aggregators, OMS and WMS,
                standardising the Shopify Master Catalogue, mapping PDP user
                flows, and building AI operational agents on a knowledge
                repository that did not exist before.
              </p>
              <p className={styles.bio}>
                Outside of work there is{" "}
                <Link href="/projects/aarchid">Aarchid</Link>, which I co-built
                with{" "}
                <a href="https://github.com/dfordp" target="_blank" rel="noopener noreferrer">
                  Dilpreet Grover
                </a>
                . It diagnoses plant health from a photo, hits 92% accuracy on
                our 200-sample golden set, and runs at the edge for under a
                quarter per active user per month. I wrote the PRD, built the
                eval harness, and shipped v1. The harness said we were at 92%.
                The user interviews said trust was the real bottleneck. Learning
                to hold both of those at once is the part of the job I actually
                like.
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
            <h2 className={styles.sectionTitle}>
              Product, data, and enough engineering
            </h2>
          </header>
          <SkillsRadar />
        </div>
      </section>

      {/* Experience Timeline */}
      <section aria-label="Experience" data-section="experience" className={styles.section}>
        <div className={styles.innerNarrow}>
          <header className={styles.sectionHeader}>
            <SectionLabel index="04">Experience</SectionLabel>
            <h2 className={styles.sectionTitle}>Four teams, four problems</h2>
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
      {hasGitHub && (
        <section aria-label="GitHub activity" data-section="github" className={styles.section}>
          <div className={styles.inner}>
            <header className={styles.sectionHeader}>
              <SectionLabel index="06">Open source</SectionLabel>
              <h2 className={styles.sectionTitle}>GitHub activity</h2>
            </header>
            <GitHubStats profile={github} />
          </div>
        </section>
      )}

      {/* How I Work */}
      <section aria-label="How I work" data-section="how-i-work" className={styles.section}>
        <div className={styles.innerNarrow}>
          <header className={styles.sectionHeader}>
            <SectionLabel index="07">How I work</SectionLabel>
            <h2 className={styles.sectionTitle}>Operating principles</h2>
          </header>
          <dl className={styles.values}>
            {[
              // The 37-charts story moved up into "My story", so this row
              // carries different evidence rather than repeating it.
              { label: "High-Ownership", detail: "Owned vendor evaluation across BSPs, CRMs, payment aggregators, OMS and WMS at The Sleep Company" },
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
