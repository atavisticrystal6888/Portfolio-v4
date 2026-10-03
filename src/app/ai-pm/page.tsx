import Link from "next/link";
import { generatePageMetadata } from "@/lib/metadata";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PageHeader } from "@/components/ui/PageHeader";
import { WhereNext } from "@/components/ui/WhereNext";
import { EvalHarnessDemo } from "@/components/ai-pm/EvalHarnessDemo";
import { CostModelDemo } from "@/components/ai-pm/CostModelDemo";
import { getAllBlogPosts } from "@/lib/content";
import styles from "./ai-pm.module.css";

export const metadata = generatePageMetadata({
  title: "AI PM",
  description:
    "Playbooks, experiments and worked examples at the intersection of product management and AI: evaluation, cost modelling and the Aarchid case study.",
  path: "/ai-pm",
});

/* Each playbook card opens the place where that playbook is actually
   written up: an essay, a case-study chapter, or the demo on this page. */
const PLAYBOOKS = [
  {
    title: "Scoping an LLM feature",
    body: "How to write a PRD when the model is the product. Success criteria, eval harness, guardrails, and cost envelope — before a single prompt is written.",
    meta: "Framework",
    href: "/blog/shipping-llm-products-eval-harness",
    cta: "Read the essay",
  },
  {
    title: "Eval-driven development",
    body: "Treat your golden set like a test suite. Offline evals first. How an offline golden-set eval is run, and what its number cannot prove.",
    meta: "Method",
    href: "/projects/aarchid#validation",
    cta: "Aarchid: validation",
  },
  {
    title: "Cost modelling at the edge",
    body: "Per-request math for multi-model pipelines (vision + retrieval + research). Caching, batching, and the $0.25/user/mo target envelope, an estimate.",
    meta: "Economics",
    href: "#cost-model",
    cta: "Try the cost model",
  },
  {
    title: "Citations or it didn't happen",
    body: "Why user trust collapses without grounded sources, and the architectural pattern for research-augmented LLM responses.",
    meta: "Trust",
    href: "/projects/aarchid#decision",
    cta: "Aarchid: the decision",
  },
];

export default function AIPMPage() {
  const posts = getAllBlogPosts();
  const aiPmPosts = posts.filter((p) =>
    p.tags?.some((t) => /ai|llm|ml|pm/i.test(t))
  );

  return (
    <div className={styles.page}>
      <PageHeader
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "AI PM", href: "/ai-pm" },
        ]}
        title="AI PM — where product thinking meets the model"
        subtitle={
          <>
            I build LLM products the way a PM ships any other product: with a
            crisp problem, an eval rubric, a cost envelope, and a way to roll
            back. This page collects the playbooks, artefacts, and built work
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
              <Link
                key={p.title}
                href={p.href}
                className={`${styles.card} ${styles.cardLink}`}
                data-testid="playbook-card"
              >
                <h3>{p.title}</h3>
                <p>{p.body}</p>
                <span className={styles.meta}>
                  {p.meta} · {p.cta} <span aria-hidden="true">&rarr;</span>
                </span>
              </Link>
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
              Six illustrative, fixed plant-diagnosis cases. Two model versions. One confidence
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
        id="cost-model"
        className={`${styles.section} ${styles.anchored}`}
        aria-label="Cost modelling, in real time"
      >
        <div className={styles.inner}>
          <header className={styles.sectionHeader}>
            <SectionLabel index="03">Live Demo</SectionLabel>
            <h2 className={styles.sectionTitle}>Cost modelling, in real time</h2>
            <p className={styles.sectionLede}>
              Illustrative model with fixed example inputs: unit prices are
              list-price estimates, not a contract or a bill. Same harness
              mindset, applied to economics. Move the sliders to
              see how batch size, cache hit rate, and request volume reshape
              the per-user-per-month bill — and whether you stay inside the
              $0.25 target envelope (an estimate, not a measured bill).
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
            <h2 className={styles.sectionTitle}>Aarchid — the worked example</h2>
          </header>
          <div className={`${styles.card} ${styles.cardWide}`}>
            <h3>AI Botanical Intelligence · offline eval, result withheld</h3>
            <p>
              Co-built with Dilpreet Grover. Multimodal vision (Gemini 1.5
              Pro) grounded by research-augmented reasoning (a web research API),
              running on Cloudflare Workers. Self-reported: the team ran an
              offline eval on a golden set (about 200 samples, as reported by
              the team); the result is withheld until the eval artefact or the
              co-builder&apos;s confirmation is available.
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
              <strong>A second edge-stack build</strong> — applying the same
              pattern to a different problem domain.
            </li>
            <li>
              <strong>More on eval sets as specs</strong> — a follow-up to{" "}
              <Link href="/blog/the-prd-is-dead-long-live-the-eval-set">The
              PRD Is Dead, Long Live the Eval Set</Link>.
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

      <WhereNext />
    </div>
  );
}
