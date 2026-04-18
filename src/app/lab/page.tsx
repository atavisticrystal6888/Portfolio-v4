import { generatePageMetadata, generateBreadcrumbJsonLd } from "@/lib/metadata";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { getAllLabIdeas } from "@/lib/content";
import styles from "@/styles/content-page.module.css";

export const metadata = generatePageMetadata({
  title: "Lab",
  description:
    "19 product ideas at the intersection of PM and engineering — mapped by category, difficulty, and the PM skill they exercise. Some I'll ship. Most won't. Thinking in public.",
  path: "/lab",
});

function difficultyWeight(d: string): number {
  if (d === "Expert") return 3;
  if (d === "Hard") return 2;
  return 1;
}

export default function LabPage() {
  const ideas = getAllLabIdeas();
  const categories = Array.from(new Set(ideas.map((i) => i.category))).sort();
  const sorted = [...ideas].sort(
    (a, b) => difficultyWeight(b.difficulty) - difficultyWeight(a.difficulty)
  );

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Lab", url: "/lab" },
  ]);

  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <p className={styles.kicker}>Ideas in motion</p>
      <h1 className={styles.title}>Lab</h1>
      <p className={styles.lede}>
        A working matrix of {ideas.length} product ideas I've scoped — each
        one a hypothetical build that maps a real PM skill to a real technical
        challenge. Most will stay ideas. A few will become projects. All of
        them are me thinking in public about what&apos;s worth making.
      </p>

      <ScrollReveal>
        <div className={styles.section}>
          <SectionLabel>Categories</SectionLabel>
          <h2 className={styles.sectionTitle}>By domain</h2>
          <div className={styles.cardGrid}>
            {categories.map((cat) => {
              const count = ideas.filter((i) => i.category === cat).length;
              return (
                <div key={cat} className={styles.card}>
                  <h3>{cat}</h3>
                  <p>{count} idea{count === 1 ? "" : "s"}</p>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.05}>
        <div className={styles.section}>
          <SectionLabel>All Ideas</SectionLabel>
          <h2 className={styles.sectionTitle}>
            The matrix — sorted by difficulty
          </h2>
          <div className={styles.cardGrid}>
            {sorted.map((idea) => (
              <div key={idea.id} className={styles.card}>
                <h3>
                  {idea.name}
                  <span className={styles.badge}>{idea.difficulty}</span>
                </h3>
                <p>{idea.problem}</p>
                <span className={styles.meta}>
                  {idea.category} · {idea.pmSkill}
                </span>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      <p className={styles.note}>
        Source data:{" "}
        <a
          href="https://github.com/atavisticrystal6888/Portfolio-v4/blob/main/content/lab/ideas.json"
          target="_blank"
          rel="noopener noreferrer"
        >
          ideas.json
        </a>
        . Want to build one of these together? Let&apos;s talk.
      </p>
    </div>
  );
}
