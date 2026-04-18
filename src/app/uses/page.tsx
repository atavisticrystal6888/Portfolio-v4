import { generatePageMetadata, generateBreadcrumbJsonLd } from "@/lib/metadata";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import styles from "@/styles/content-page.module.css";

export const metadata = generatePageMetadata({
  title: "Uses",
  description:
    "The hardware, software, and daily drivers behind what I ship. Honest list, no affiliate links.",
  path: "/uses",
});

const GROUPS = [
  {
    label: "Hardware",
    title: "What I build on",
    items: [
      { name: "Dell Latitude 5550", detail: "Daily work driver — Intel Core Ultra 7 · 32 GB · 1 TB NVMe" },
      { name: "Lenovo ThinkPad (personal)", detail: "Side-project machine — Linux for experiments" },
      { name: "Samsung 27\" 1440p", detail: "Primary external monitor; VS Code + browser split" },
      { name: "Logitech MX Master 3S", detail: "Scroll wheel worth every rupee" },
    ],
  },
  {
    label: "Editor",
    title: "Writing code",
    items: [
      { name: "VS Code + GitHub Copilot", detail: "Agent mode for scaffolding; inline for refactors" },
      { name: "Claude + ChatGPT", detail: "Longer reasoning loops and architectural sparring" },
      { name: "JetBrains Mono", detail: "Editor font — ligatures on" },
      { name: "Night Owl + Satoshi Vercel", detail: "Dark theme rotation" },
    ],
  },
  {
    label: "PM Stack",
    title: "Thinking & shipping",
    items: [
      { name: "Notion", detail: "PRDs, research notes, personal wiki" },
      { name: "Linear", detail: "Issue tracking when working with a team" },
      { name: "Figma", detail: "Wireframes, flows, quick mocks" },
      { name: "Mermaid + Excalidraw", detail: "Architecture diagrams in-repo and whiteboards" },
    ],
  },
  {
    label: "Data & AI",
    title: "The analytical stack",
    items: [
      { name: "Python (Pandas, scikit-learn)", detail: "Churn models, feature engineering, notebooks" },
      { name: "Power BI + Excel", detail: "Executive dashboards and scenario modelling" },
      { name: "SQL (Postgres, SQL Server)", detail: "Every project starts with a query" },
      { name: "Gemini + Perplexity Sonar", detail: "Multimodal + research-augmented LLM work (Aarkid)" },
    ],
  },
  {
    label: "Ship Stack",
    title: "This portfolio runs on",
    items: [
      { name: "Next.js 16 (App Router)", detail: "React 19 · Turbopack · MDX for long-form content" },
      { name: "TypeScript strict", detail: "noUncheckedIndexedAccess for safety" },
      { name: "Framer Motion + Three.js", detail: "Scroll reveals and the hero scene" },
      { name: "Vercel", detail: "Hosting, analytics, edge OG generation" },
    ],
  },
];

export default function UsesPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Uses", url: "/uses" },
  ]);

  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <p className={styles.kicker}>Stack & tools</p>
      <h1 className={styles.title}>Uses</h1>
      <p className={styles.lede}>
        An honest inventory of the tools behind the work on this site. No
        affiliate links, no aspirational gear — this is what I actually open
        every day.
      </p>

      {GROUPS.map((group, i) => (
        <ScrollReveal key={group.label} delay={i * 0.03}>
          <div className={styles.section}>
            <SectionLabel>{group.label}</SectionLabel>
            <h2 className={styles.sectionTitle}>{group.title}</h2>
            <div className={styles.cardGrid}>
              {group.items.map((item) => (
                <div key={item.name} className={styles.card}>
                  <h3>{item.name}</h3>
                  <p>{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      ))}

      <p className={styles.note}>
        Inspired by{" "}
        <a
          href="https://uses.tech"
          target="_blank"
          rel="noopener noreferrer"
        >
          uses.tech
        </a>
        . If you spot something better, tell me.
      </p>
    </div>
  );
}
