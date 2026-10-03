
      <WhereNext />
import { generatePageMetadata } from "@/lib/metadata";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PageHeader } from "@/components/ui/PageHeader";
import { WhereNext } from "@/components/ui/WhereNext";
import styles from "@/styles/content-page.module.css";

export const metadata = generatePageMetadata({
  title: "Uses",
  description:
    "The hardware, software and analytics stack Dhruv Singhal uses to research, spec, build and ship products, including what runs this site. No affiliate links.",
  path: "/uses",
});

const GROUPS = [
  // PM work first: this is a PM portfolio, so the thinking and
  // analytics tools lead and hardware comes after.
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
      { name: "Python (Pandas, scikit-learn)", detail: "Cohort analysis, feature engineering, notebooks" },
      { name: "Power BI + Excel", detail: "Dashboards and scenario models" },
      { name: "SQL (Postgres, SQL Server)", detail: "Every project starts with a query" },
      { name: "Gemini + a web research API", detail: "Multimodal and research-augmented LLM work on Aarchid (co-built)" },
    ],
  },
  {
    label: "Editor",
    title: "Writing code",
    items: [
      { name: "VS Code + GitHub Copilot", detail: "Agent mode for scaffolding; inline for refactors" },
      { name: "Claude + ChatGPT", detail: "Longer reasoning loops and architectural sparring" },
      { name: "JetBrains Mono", detail: "Editor font — ligatures on" },
      { name: "Night Owl and Vercel themes", detail: "Editor colour themes, rotated" },
    ],
  },
  {
    label: "Hardware",
    title: "What I build on",
    items: [
      { name: "Work laptop", detail: "Day-to-day work machine" },
      { name: "Lenovo ThinkPad (personal)", detail: "Side-project machine — Linux for experiments" },
      { name: "Samsung 27\" 1440p", detail: "Primary external monitor; VS Code + browser split" },
      { name: "Logitech MX Master 3S", detail: "Scroll wheel worth every rupee" },
    ],
  },
  {
    label: "Ship Stack",
    title: "This portfolio runs on",
    items: [
      { name: "Next.js 16 (App Router)", detail: "React 19 · Turbopack · MDX for long-form content" },
      { name: "TypeScript strict", detail: "noUncheckedIndexedAccess for safety" },
      { name: "Framer Motion + Three.js", detail: "Scroll reveals, and the wireframe scene on the Lab page and some case-study headers" },
      { name: "Vercel", detail: "Hosting, analytics, edge OG generation" },
    ],
  },
];

export default function UsesPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Uses", href: "/uses" },
        ]}
        title="Uses"
        subtitle="An honest inventory of the tools behind the work on this site. No affiliate links, no aspirational gear. This is my current set, checked September 2026."
      />

      {GROUPS.map((group, i) => (
        <section key={group.label} className={styles.section}>
          <div className={styles.inner}>
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

            {i === GROUPS.length - 1 && (
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
            )}
          </div>
        </section>
      ))}

      <WhereNext />
    </div>
  );
}
