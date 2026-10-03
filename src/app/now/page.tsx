import Link from "next/link";
import { generatePageMetadata } from "@/lib/metadata";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PageHeader } from "@/components/ui/PageHeader";
import { WhereNext } from "@/components/ui/WhereNext";
import styles from "@/styles/content-page.module.css";

export const metadata = generatePageMetadata({
  title: "Now",
  description:
    "What Dhruv Singhal is focused on right now: side projects in progress, his most recent product internship, what he is learning and the books on his desk.",
  path: "/now",
});

export default function NowPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Now", href: "/now" },
        ]}
        title="What I'm Doing Now"
        meta={
          <>
            Last updated: <time dateTime="2026-10-02">2 October 2026</time>
          </>
        }
      />

      <section className={styles.section}>
        <div className={styles.inner}>
          <SectionLabel>Work</SectionLabel>
          <h2 className={styles.sectionTitle}>Most Recent Role</h2>
          <ul className={styles.list}>
            <li>
              <strong>The Sleep Company</strong> (Jul–Oct 2026): most recently a
              product intern on the growth team, on pre-launch work. The
              internal detail stays internal.
            </li>
          </ul>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <SectionLabel>Learning</SectionLabel>
          <h2 className={styles.sectionTitle}>Growing In</h2>
          <ul className={styles.list}>
            <li>LLM evaluation harnesses (golden sets, shadow traffic, A/B)</li>
            <li>Edge-runtime cost modelling for multimodal pipelines</li>
            <li>Going deeper on system design for the products I build</li>
          </ul>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <SectionLabel>Reading</SectionLabel>
          <h2 className={styles.sectionTitle}>On My Shelf</h2>
          <ul className={styles.list}>
            {/* Same two books as "On my desk right now" on /bookshelf. */}
            <li><em>Inspired</em> — Marty Cagan</li>
            <li><em>Thinking in Systems</em> — Donella Meadows</li>
            <li>Lenny&apos;s Newsletter, Latent Space, Stratechery</li>
          </ul>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <SectionLabel>Building</SectionLabel>
          <h2 className={styles.sectionTitle}>Side Projects</h2>
          <ul className={styles.list}>
            <li>
              <strong>
                <Link href="/projects/cohort-retention-studio">Cohort &amp; Retention Studio</Link>
              </strong>: browser-only
              cohort and retention analysis for D2C order exports. Ready for a
              facilitated local pilot; the hosted product is not verified yet.
            </li>
            <li>
              <strong>
                <Link href="/projects/sawari">Sawari</Link>
              </strong>: rider-to-rider auto-rickshaw sharing with a
              kilometre-weighted fare split; drivers are not users. Built on Elixir,
              Phoenix LiveView and Ash. Locally
              built with 897 tests passing; not deployed.
            </li>
            <li>
              <strong>
                <Link href="/projects/desktasks">DeskTasks</Link>
              </strong>: the desktop task widget. The hosted
              v1.3.x line (Supabase sync) is frozen; the v2.0.0-alpha line with
              local hub sync is where the work is.
            </li>
            <li>
              <strong>
                <Link href="/projects/aarchid">Aarchid</Link>
              </strong>, co-built with{" "}
              <a href="https://github.com/dfordp" target="_blank" rel="noopener noreferrer">
                Dilpreet Grover
              </a>
: multimodal plant diagnosis. Self-reported: the team ran an
              offline eval on a golden set; the result is withheld until the
              eval artefact or the co-builder&apos;s confirmation is available.
            </li>
            <li>
              <strong>
                <Link href="/projects/portfolio-site">This site</Link>
              </strong>: a trust pass on every claim, plus standalone product
              pages and illustrative AI PM demos.
            </li>
          </ul>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <SectionLabel>Looking For</SectionLabel>
          <h2 className={styles.sectionTitle}>Next Step</h2>
          <p className={styles.prose}>
            {/* Explicit space: JSX drops a leading one when the text node
                wraps onto the next line. */}
            Full-time <strong>Product Manager / APM</strong>{" "}
            roles. Bias toward AI-native products, D2C e-commerce, and
            teams where product, data, and engineering aren&apos;t separate jobs.{" "}
            <Link href="/contact">Get in touch</Link>.
          </p>

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
      </section>

      <WhereNext />
    </div>
  );
}
