import Link from "next/link";
import { generatePageMetadata, generateBreadcrumbJsonLd } from "@/lib/metadata";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PageHeader } from "@/components/ui/PageHeader";
import { JsonLd } from "@/components/ui/JsonLd";
import { EvalHarnessDemo } from "@/components/ai-pm/EvalHarnessDemo";
import { CostModelDemo } from "@/components/ai-pm/CostModelDemo";
import { getAllBlogPosts } from "@/lib/content";
import styles from "./ai-pm.module.css";

export const metadata = generatePageMetadata({
  title: "AI PM",
  description:
    "Playbooks, experiments, and shipped work at the intersection of product management and AI. Evaluation frameworks, cost modelling, and the Aarchid case study.",
  path: "/ai-pm",
});

const PLAYBOOKS = [
  {
    title: "Scoping an LLM feature",
    body: "How to write a PRD when the model is the product. Success criteria, eval harness, guardrails, and cost envelope — before a single prompt is written.",
    meta: "Framework",
  },
  {
    title: "Eval-driven development",
    body: "Treat your golden set like a test suite. Offline evals → shadow traffic → A/B. How we validated 92% diagnosis accuracy on Aarchid.",
    meta: "Method",
  },
  {
    title: "Cost modelling at the edge",
    body: "Per-request math for multi-model pipelines (vision + retrieval + research). Caching, batching, and the $0.25/user/mo envelope.",
    meta: "Economics",
  },
  {
    title: "Citations or it didn't happen",
    body: "Why user trust collapses without grounded sources, and the architectural pattern for research-augmented LLM responses.",
    meta: "Trust",
  },
];

export default function AIPMPage() {
  const posts = getAllBlogPosts();
  const aiPmPosts = posts.filter((p) =>
    p.tags?.some((t) => /ai|llm|ml|pm/i.test(t))
  );

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "AI PM", url: "/ai-pm" },
  ]);

  return (
    <div className={styles.page}>
      <JsonLd id="ai-pm-breadcrumb-jsonld" data={breadcrumbJsonLd} />

      <PageHeader
        title="AI PM — where product thinking meets the model"
        subtitle={
          <>
            I build LLM products the way a PM ships any other product: with a
            crisp problem, an eval rubric, a cost envelope, and a way to roll
            back. This page collects the playbooks, artefacts, and shipped work
            behind that stance — most of it learned building{" "}
            <Link href="/projects/aarchid">Aarchid</Link> with{" "}
            <a
              href="https://github.com/dfordp"
              target="_blank"
              rel="noopener noreferrer"
            >
              Dilpreet Grover
            </a>
            .
          </>
        }
      />

      <section className={styles.section} aria-label="Playbooks">
        <div className={styles.inner}>
          <header className={styles.sectionHeader}>
            <SectionLabel index="01">Playbooks</SectionLabel>
            <h2 className={styles.sectionTitle}>How I work on AI products</h2>
          </header>
          <div className={styles.cardGrid}>
            {PLAYBOOKS.map((p) => (
              <div key={p.title} className={styles.card}>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
                <span className={styles.meta}>{p.meta}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The demo component provides its own "Eval harness demo" region;
          this wrapper takes the heading's name to avoid a duplicate. */}
      <section
        className={styles.section}
        aria-label="An eval harness, in your browser"
      >
        <div className={styles.inner}>
          <header className={styles.sectionHeader}>
            <SectionLabel index="02">Live Demo</SectionLabel>
            <h2 className={styles.sectionTitle}>
              An eval harness, in your browser
            </h2>
            <p className={styles.sectionLede}>
              Six plant-diagnosis cases. Two model versions. One confidence
              gate. Toggle the controls and watch the same golden set re-score
              in real time — this is how I validate an LLM feature before it
              ships.
            </p>
          </header>
          <div className={styles.demo}>
            <EvalHarnessDemo />
          </div>
        </div>
      </section>

      <section
        className={styles.section}
        aria-label="Cost modelling, in real time"
      >
        <div className={styles.inner}>
          <header className={styles.sectionHeader}>
            <SectionLabel index="03">Live Demo</SectionLabel>
            <h2 className={styles.sectionTitle}>Cost modelling, in real time</h2>
            <p className={styles.sectionLede}>
              Same harness mindset, applied to economics. Move the sliders to
              see how batch size, cache hit rate, and request volume reshape
              the per-user-per-month bill — and whether you stay inside the
              $0.25 envelope.
            </p>
          </header>
          <div className={styles.demo}>
            <CostModelDemo />
          </div>
        </div>
      </section>

      <section className={styles.section} aria-label="Case study">
        <div className={styles.inner}>
          <header className={styles.sectionHeader}>
            <SectionLabel index="04">Case Study</SectionLabel>
            <h2 className={styles.sectionTitle}>Aarchid — shipped proof</h2>
          </header>
          <div className={`${styles.card} ${styles.cardWide}`}>
            <h3>AI Botanical Intelligence · 92% diagnosis accuracy</h3>
            <p>
              Co-created with Dilpreet Grover. Multimodal vision (Gemini 1.5
              Pro) grounded by research-augmented reasoning (Exa AI API),
              running on Cloudflare Workers. Sub-10s P95, $0.25 per active user
              per month at scale.
            </p>
            <span className={styles.meta}>
              <Link href="/projects/aarchid">Read the case study →</Link>
            </span>
          </div>
        </div>
      </section>

      {aiPmPosts.length > 0 && (
        <section className={styles.section} aria-label="Writing">
          <div className={styles.inner}>
            <header className={styles.sectionHeader}>
              <SectionLabel index="05">Writing</SectionLabel>
              <h2 className={styles.sectionTitle}>Essays on AI + product</h2>
            </header>
            <div className={styles.cardGrid}>
              {aiPmPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className={styles.card}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <span className={styles.meta}>{post.readingTime}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className={styles.section} aria-label="What's next">
        <div className={styles.inner}>
          <header className={styles.sectionHeader}>
            <SectionLabel index="06">What&apos;s Next</SectionLabel>
            <h2 className={styles.sectionTitle}>On the bench</h2>
          </header>
          <ul className={styles.list}>
            <li>
              <strong>AI PM interview prep kit</strong> — deconstructed case
              questions, eval-harness design, and model economics cheatsheets.
            </li>
            <li>
              <strong>Second Aarchid-scale build</strong> — applying the same
              Edge Stack pattern to a different problem domain.
            </li>
            <li>
              <strong>Essay series: &ldquo;The PRD is dead, long live the eval
              set&rdquo;</strong> — in progress.
            </li>
          </ul>
        </div>
      </section>

      <section className={styles.section} aria-label="Contact prompt">
        <div className={styles.inner}>
          <p className={styles.note}>
            Looking for an AI PM who can spec, eval, and ship?{" "}
            <Link href="/contact">Get in touch</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
