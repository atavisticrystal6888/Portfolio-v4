import { generatePageMetadata, generateBreadcrumbJsonLd } from "@/lib/metadata";
import { JsonLd } from "@/components/ui/JsonLd";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import styles from "./now.module.css";

export const metadata = generatePageMetadata({
  title: "Now",
  description:
    "What Dhruv Singhal is doing now - current work, learning, reading, and building.",
  path: "/now",
});

export default function NowPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Now", url: "/now" },
  ]);

  return (
    <div className={styles.page}>
      <JsonLd id="now-breadcrumb-jsonld" data={breadcrumbJsonLd} />

      <h1 className={styles.title}>What I&apos;m Doing Now</h1>
      <p className={styles.updated}>
        Last updated: <time dateTime="2026-08">August 2026</time>
      </p>

      <ScrollReveal>
        <div className={styles.section}>
          <SectionLabel>Working On</SectionLabel>
          <h2 className={styles.sectionTitle}>Current Roles</h2>
          <ul className={styles.list}>
            <li>
              <strong>The Sleep Company</strong> - Product Manager Intern,
              Growth: vendor evaluation, AI-powered operational agents, and
              Shopify catalog operations for a D2C sleep brand.
            </li>
          </ul>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.05}>
        <div className={styles.section}>
          <SectionLabel>Learning</SectionLabel>
          <h2 className={styles.sectionTitle}>Growing In</h2>
          <ul className={styles.list}>
            <li>LLM evaluation harnesses (golden sets, shadow traffic, A/B)</li>
            <li>Edge-runtime cost modelling for multimodal pipelines</li>
            <li>Going deeper on system design - reading DDIA cover-to-cover</li>
          </ul>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <div className={styles.section}>
          <SectionLabel>Reading</SectionLabel>
          <h2 className={styles.sectionTitle}>On My Shelf</h2>
          <ul className={styles.list}>
            <li><em>Inspired</em> - Marty Cagan</li>
            <li><em>Designing Data-Intensive Applications</em> - Martin Kleppmann</li>
            <li><em>Thinking in Systems</em> - Donella Meadows</li>
            <li>Lenny&apos;s Newsletter, Latent Space, Stratechery</li>
          </ul>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.15}>
        <div className={styles.section}>
          <SectionLabel>Building</SectionLabel>
          <h2 className={styles.sectionTitle}>Side Projects</h2>
          <ul className={styles.list}>
            <li>
              <strong>KiteEdge</strong> - self-hosted portfolio analytics for
              Zerodha Kite: 43+ indicators, Monte Carlo VaR, a NIFTY 500
              screener, and a FIFO trade journal across 13 services.
            </li>
            <li>
              <strong>ExperimentHub</strong> - a self-hosted A/B testing
              platform with a deterministic Rust assignment core and
              sequential statistics.
            </li>
            <li>
              <strong>DeskTasks</strong> - a local-first desktop task widget
              pinned behind every window, shipped for Windows + macOS.
            </li>
            <li>
              <strong>Aarchid</strong> with{" "}
              <a href="https://github.com/dfordp" target="_blank" rel="noopener noreferrer">
                Dilpreet Grover
              </a>{" "}
              - multimodal plant-diagnosis app, edge stack, 92% accuracy on golden set.
            </li>
            <li>
              <strong>This site</strong> - ongoing portfolio iteration in
              Next.js 16 + React 19, with interactive AI PM demos and a 3D
              Aarchid hero.
            </li>
          </ul>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <div className={styles.section}>
          <SectionLabel>Looking For</SectionLabel>
          <h2 className={styles.sectionTitle}>Next Step</h2>
          <p style={{ color: "var(--text-body)", lineHeight: 1.7 }}>
            Full-time <strong>Product Manager / APM</strong> roles starting
            mid-2026. Bias toward AI-native products, D2C e-commerce, and
            teams where product, data, and engineering aren&apos;t separate jobs.{" "}
            <a href="/contact">Get in touch</a>.
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
