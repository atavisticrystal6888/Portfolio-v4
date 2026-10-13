import { generatePageMetadata } from "@/lib/metadata";
import { getGitHubProfile } from "@/lib/github";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { WhereNext } from "@/components/ui/WhereNext";
import { Philosophy } from "@/components/about/Philosophy";
import { Skills } from "@/components/about/Skills";
import { Timeline } from "@/components/about/Timeline";
import { Achievements } from "@/components/about/Achievements";
import { GitHubStats } from "@/components/about/GitHubStats";
import Image from "next/image";
import Link from "next/link";
import dhruvImage from "@/assets/Dhruv_Image.jpg";
import styles from "./about.module.css";
import section from "@/styles/section.module.css";
import ledger from "@/components/about/ledger.module.css";
import { SLEEP_COMPANY_TENURE } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export const metadata = generatePageMetadata({
  title: "About",
  description:
    `About Dhruv Singhal: about a year of product management internships, most recently in growth at The Sleep Company (${SLEEP_COMPANY_TENURE}), aiming for APM/PM roles.`,
  path: "/about",
});

export default async function AboutPage() {
  const github = await getGitHubProfile();
  // GitHubStats self-hides when the API had nothing to give, which would
  // otherwise leave this page holding an empty ruled section.
  const hasGitHub =
    github.totalContributions > 0 || github.totalPublicRepos > 0;

  // Section numbers count what actually renders: with GitHub stats hidden a
  // hardcoded 07 after 05 read as a numbering error on a working paper.
  let sectionCount = 0;
  const num = () => String(++sectionCount).padStart(2, "0");

  return (
    <div className={styles.page}>
      {/* Header */}
      <PageHeader
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "About", href: "/about" },
        ]}
        title="Dhruv Singhal"
        subtitle="Product Manager & Builder: turning ambiguous domain problems into product decisions, specs, and shipped systems."
      />

      {/* Bio */}
      <section aria-label="Biography" data-section="bio" className={section.section}>
        <div className={section.inner}>
          <header className={section.header}>
            <SectionLabel index={num()}>Background</SectionLabel>
            <h2 className={section.title}>My story</h2>
          </header>
          <div className={styles.bioRow}>
            <Image
              src={dhruvImage}
              alt="Portrait of Dhruv Singhal"
              className={styles.headshot}
              sizes="(max-width: 640px) 220px, 280px"
              preload
            />
            <div>
              <p className={styles.bio}>
                I pick up a domain by building something in it. That has been
                the pattern since my first internship. I get close enough to the
                problem to write the PRD, close enough to the data to build the
                eval set, and close enough to the code to build a first version
                when that is the fastest way to learn. Where someone built it
                with me, I say so. Then whatever breaks tells me what I got
                wrong in the spec.
              </p>
              <p className={styles.bio}>
                At Omniful.ai, &ldquo;find better prospects&rdquo; turned into a
                scoring model built on firmographic and behavioural signals.
                Qualified prospects went from about 10 a day to over 200, and
                the work supported 10 client acquisitions (both self-reported;
                I have no artefact to share). At Read Riches I ran
                the founder&apos;s office side of content-led growth. I managed a
                4-person research and content team and ran publishing
                experiments that contributed to a 4x retention improvement
                (self-reported).
                Different industries, same job: find the loop, instrument it,
                then turn the handle.
              </p>
              <p className={styles.bio}>
                At Wipro TOPS I scoped an internal AI-powered enterprise
                workflow platform, along with workflows for an internal crew
                mobile micro-app and an internal records platform for non-crew
                staff, across 12+ aviation scenarios (self-reported). Most of that
                job was finding edge cases early enough that they became sprint
                tickets instead of incidents. It is also where I killed 37
                low-signal dashboard charts and kept the 3 that actually drove a
                decision (self-reported). Most recently I was a product intern
                on the growth team at The Sleep Company ({SLEEP_COMPANY_TENURE}), on
                pre-launch work; the internal detail stays internal.
              </p>
              <p className={styles.bio}>
                Outside of work there is{" "}
                <Link href="/projects/aarchid">Aarchid</Link>, which I co-built
                with{" "}
                <a href="https://github.com/dfordp" target="_blank" rel="noopener noreferrer">
                  Dilpreet Grover
                </a>
                . It diagnoses plant health from a photo. I wrote the PRD and
                built the eval harness, and we shipped V1 together.
                Self-reported: the team ran an offline eval on a golden set
                (about 200 samples, as reported by the team); the result is
                withheld until the eval artefact or the co-builder&apos;s
                confirmation is available. No offline score could say whether
                someone would trust a diagnosis enough to act on it. Holding both
                of those at once is the part of the job I actually like.
              </p>
              <p className={styles.bio}>
                What I am working on this month is on the{" "}
                <Link href="/now">now page</Link>. The books that shaped how I
                think are on the <Link href="/bookshelf">bookshelf</Link>, and
                the tools I use are listed on <Link href="/uses">uses</Link>.
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

      {/* Experience Timeline */}
      <section aria-label="Experience" data-section="experience" className={section.section}>
        <div className={section.inner}>
          <header className={section.header}>
            <SectionLabel index={num()}>Experience</SectionLabel>
            <h2 className={section.title}>Four teams, four problems</h2>
          </header>
          <div className={section.measure}>
            <Timeline />
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section aria-label="Philosophy" data-section="philosophy" className={section.section}>
        <div className={section.inner}>
          <header className={section.header}>
            <SectionLabel index={num()}>Philosophy</SectionLabel>
            <h2 className={section.title}>How I think</h2>
          </header>
          <Philosophy />
        </div>
      </section>

      {/* Skills */}
      <section aria-label="Skills" data-section="skills" className={section.section}>
        <div className={section.inner}>
          <header className={section.header}>
            <SectionLabel index={num()}>Skills</SectionLabel>
            <h2 className={section.title}>
              Product, data, and enough engineering
            </h2>
          </header>
          <Skills />
        </div>
      </section>

      {/* Achievements */}
      <section aria-label="Achievements" data-section="achievements" className={section.section}>
        <div className={section.inner}>
          <header className={section.header}>
            <SectionLabel index={num()}>Achievements</SectionLabel>
            <h2 className={section.title}>Highlights</h2>
          </header>
          <Achievements />
        </div>
      </section>

      {/* GitHub Stats */}
      {hasGitHub && (
        <section aria-label="GitHub activity" data-section="github" className={section.section}>
          <div className={section.inner}>
            <header className={section.header}>
              <SectionLabel index={num()}>Open source</SectionLabel>
              <h2 className={section.title}>GitHub activity</h2>
            </header>
            <GitHubStats profile={github} />
          </div>
        </section>
      )}

      {/* How I Work */}
      <section aria-label="How I work" data-section="how-i-work" className={section.section}>
        <div className={section.inner}>
          <header className={section.header}>
            <SectionLabel index={num()}>How I work</SectionLabel>
            <h2 className={section.title}>Operating principles</h2>
          </header>
          <dl className={ledger.list}>
            {[
              // The 37-charts story moved up into "My story", so this row
              // carries different evidence rather than repeating it.
              { label: "High ownership", detail: `Run my own release gates: the DeskTasks gate run of ${formatDate("2026-09-15")} finished with zero failures` },
              { label: "Close to the build", detail: "Wrote the Aarchid PRD and eval harness, and co-built v1 with Dilpreet Grover" },
              { label: "Data first", detail: "Every feature proposal comes with a success metric and a kill criterion" },
              {
                label: "Fast execution",
                detail: (
                  <>
                    Portfolio iterated from v1 ({formatDate("2026-01", "month")}) to v6 ({formatDate("2026-09", "month")}), each
                    version sharpening positioning, content, or navigation; the{" "}
                    <Link href="/changelog">changelog</Link> has every release.
                  </>
                ),
              },
            ].map((v) => (
              <div key={v.label} className={ledger.row}>
                <dt className={ledger.key}>{v.label}</dt>
                <dd className={ledger.value}>{v.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Resume CTA */}
      <div className={section.section}>
        <div className={section.inner}>
          <Button href="/resume/dhruv-singhal-resume.pdf">
            Download resume
          </Button>
        </div>
      </div>

      <WhereNext />
    </div>
  );
}
