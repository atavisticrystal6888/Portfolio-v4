import Link from "next/link";
import { generatePageMetadata, generateBreadcrumbJsonLd } from "@/lib/metadata";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { getAllBlogPosts } from "@/lib/content";
import styles from "@/styles/content-page.module.css";

export const metadata = generatePageMetadata({
  title: "AI PM",
  description:
    "Playbooks, experiments, and shipped work at the intersection of product management and AI. Evaluation frameworks, cost modelling, and the Aarkid case study.",
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
    body: "Treat your golden set like a test suite. Offline evals → shadow traffic → A/B. How we validated 92% diagnosis accuracy on Aarkid.",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <p className={styles.kicker}>Specialization</p>
      <h1 className={styles.title}>AI PM — where product thinking meets the model</h1>
      <p className={styles.lede}>
        I build LLM products the way a PM ships any other product: with a crisp
        problem, an eval rubric, a cost envelope, and a way to roll back. This
        page collects the playbooks, artefacts, and shipped work behind that
        stance — most of it learned building{" "}
        <Link href="/projects/aarkid">Aarkid</Link> with{" "}
        <a
          href="https://github.com/dfordp"
          target="_blank"
          rel="noopener noreferrer"
        >
          Dilpreet Grover
        </a>
        .
      </p>

      <ScrollReveal>
        <div className={styles.section}>
          <SectionLabel>Playbooks</SectionLabel>
          <h2 className={styles.sectionTitle}>How I work on AI products</h2>
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
      </ScrollReveal>

      <ScrollReveal delay={0.05}>
        <div className={styles.section}>
          <SectionLabel>Case Study</SectionLabel>
          <h2 className={styles.sectionTitle}>Aarkid — shipped proof</h2>
          <div className={styles.card}>
            <h3>AI Botanical Intelligence · 92% diagnosis accuracy</h3>
            <p>
              Co-created with Dilpreet Grover. Multimodal vision (Gemini 1.5
              Pro) grounded by research-augmented reasoning (Perplexity Sonar),
              running on Cloudflare Workers. Sub-10s P95, $0.25 per active user
              per month at scale.
            </p>
            <span className={styles.meta}>
              <Link href="/projects/aarkid">Read the case study →</Link>
            </span>
          </div>
        </div>
      </ScrollReveal>

      {aiPmPosts.length > 0 && (
        <ScrollReveal delay={0.1}>
          <div className={styles.section}>
            <SectionLabel>Writing</SectionLabel>
            <h2 className={styles.sectionTitle}>Essays on AI + product</h2>
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
        </ScrollReveal>
      )}

      <ScrollReveal delay={0.15}>
        <div className={styles.section}>
          <SectionLabel>What's Next</SectionLabel>
          <h2 className={styles.sectionTitle}>On the bench</h2>
          <ul className={styles.list}>
            <li>
              <strong>AI PM interview prep kit</strong> — deconstructed case
              questions, eval-harness design, and model economics cheatsheets.
            </li>
            <li>
              <strong>Second Aarkid-scale build</strong> — applying the same
              Edge Stack pattern to a different problem domain.
            </li>
            <li>
              <strong>Essay series: &ldquo;The PRD is dead, long live the eval
              set&rdquo;</strong> — in progress.
            </li>
          </ul>
        </div>
      </ScrollReveal>

      <p className={styles.note}>
        Looking for an AI PM who can spec, eval, and ship?{" "}
        <Link href="/contact">Get in touch</Link>.
      </p>
    </div>
  );
}
