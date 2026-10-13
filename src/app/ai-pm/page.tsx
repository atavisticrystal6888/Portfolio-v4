import Link from "next/link";
import { generatePageMetadata } from "@/lib/metadata";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PageHeader } from "@/components/ui/PageHeader";
import { WhereNext } from "@/components/ui/WhereNext";
import { Surface, SurfaceText, SurfaceTitle } from "@/components/ui/Surface";
import { EvalHarnessDemo } from "@/components/ai-pm/EvalHarnessDemo";
import { CostModelDemo } from "@/components/ai-pm/CostModelDemo";
import { getAllBlogPosts } from "@/lib/content";
import { ListRow, ListRows } from "@/components/ui/ListRow";
import { ArticleRail } from "@/components/blog/ArticleRail";
import styles from "./ai-pm.module.css";
import section from "@/styles/section.module.css";

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
    body: "How to write a PRD when the model is the product. Success criteria, eval harness, guardrails, and cost envelope. All before a single prompt is written.",
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
        title="AI PM: where product thinking meets the model"
        subtitle={
          <>
            I build LLM products the way a PM ships any other product: with a
            crisp problem, an eval rubric, a cost envelope, and a way to roll
            back. This page collects the playbooks, artefacts, and built work
            behind that stance, most of it learned building{" "}
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

      <section className={section.section} aria-label="Playbooks">
        <div className={section.inner}>
          <header className={section.header}>
            <SectionLabel index="01">Playbooks</SectionLabel>
            <h2 className={section.title}>How I work on AI products</h2>
          </header>
          <div className={styles.cardGrid}>
            {PLAYBOOKS.map((p) => (
              <Surface key={p.title} href={p.href} data-testid="playbook-card">
                <SurfaceTitle>{p.title}</SurfaceTitle>
                <SurfaceText>{p.body}</SurfaceText>
                <span className={styles.meta}>
                  {p.meta} · {p.cta} <span aria-hidden="true">&rarr;</span>
                </span>
              </Surface>
            ))}
          </div>
        </div>
      </section>

      {/* The demo component provides its own "Eval harness demo" region;
          this wrapper takes the heading's name to avoid a duplicate. */}
      <section
        className={section.section}
        aria-label="An eval harness, in your browser"
      >
        <div className={section.inner}>
          <header className={section.header}>
            <SectionLabel index="02">Live demo: eval harness</SectionLabel>
            <h2 className={section.title}>
              An eval harness, in your browser
            </h2>
            <p className={section.lede}>
              Six illustrative, fixed plant-diagnosis cases. Two model versions. One confidence
              gate. Toggle the controls and watch the same golden set re-score
              in real time. This is how I validate an LLM feature before it
              ships.
            </p>
          </header>
          <EvalHarnessDemo />
        </div>
      </section>

      <section
        id="cost-model"
        className={section.section}
        aria-label="Cost modelling, in real time"
      >
        <div className={section.inner}>
          <header className={section.header}>
            <SectionLabel index="03">Live demo: cost model</SectionLabel>
            <h2 className={section.title}>Cost modelling, in real time</h2>
            <p className={section.lede}>
              Illustrative model with fixed example inputs: unit prices are
              list-price estimates, not a contract or a bill. Same harness
              mindset, applied to economics. Move the sliders to
              see how batch size, cache hit rate, and request volume reshape
              the per-user-per-month bill, and whether you stay inside the
              $0.25 target envelope (an estimate, not a measured bill).
            </p>
          </header>
          <CostModelDemo />
        </div>
      </section>

      <section className={section.section} aria-label="Case study">
        <div className={section.inner}>
          <header className={section.header}>
            <SectionLabel index="04">Case study</SectionLabel>
            <h2 className={section.title}>Aarchid: the worked example</h2>
          </header>
          <Surface>
            <SurfaceTitle>AI Botanical Intelligence · offline eval, result withheld</SurfaceTitle>
            <SurfaceText>
              Co-built with Dilpreet Grover. Multimodal vision (Gemini 1.5
              Pro) grounded by research-augmented reasoning (a web research API),
              running on Cloudflare Workers. Self-reported: the team ran an
              offline eval on a golden set (about 200 samples, as reported by
              the team); the result is withheld until the eval artefact or the
              co-builder&apos;s confirmation is available.
            </SurfaceText>
            <span className={styles.meta}>
              <Link href="/projects/aarchid">Read the case study →</Link>
            </span>
          </Surface>
        </div>
      </section>

      {aiPmPosts.length > 0 && (
        <section className={section.section} aria-label="Writing">
          <div className={section.inner}>
            <header className={section.header}>
              <SectionLabel index="05">Writing</SectionLabel>
              <h2 className={section.title}>Essays on AI + product</h2>
            </header>
            {/* The same index row as /blog: date, category and read time. */}
            <ListRows>
              {aiPmPosts.map((post) => (
                <ListRow
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  title={post.title}
                  dek={post.excerpt}
                  rail={
                    <ArticleRail
                      date={post.date}
                      category={post.category}
                      readingTime={post.readingTime}
                    />
                  }
                />
              ))}
            </ListRows>
          </div>
        </section>
      )}

      <section className={section.section} aria-label="What's next">
        <div className={section.inner}>
          <header className={section.header}>
            <SectionLabel index="06">What&apos;s next</SectionLabel>
            <h2 className={section.title}>On the bench</h2>
          </header>
          <ul className={styles.list}>
            <li>
              <strong>AI PM interview prep kit</strong>: deconstructed case
              questions, eval-harness design, and model economics cheatsheets.
            </li>
            <li>
              <strong>A second edge-stack build</strong>: applying the same
              pattern to a different problem domain.
            </li>
            <li>
              <strong>More on eval sets as specs</strong>: a follow-up to{" "}
              <Link href="/blog/the-prd-is-dead-long-live-the-eval-set">The
              PRD Is Dead, Long Live the Eval Set</Link>.
            </li>
          </ul>
        </div>
      </section>

      <section className={section.section} aria-label="Contact prompt">
        <div className={section.inner}>
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
