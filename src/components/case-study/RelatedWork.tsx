import Link from "next/link";
import type { Project } from "@/types/project";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import styles from "./RelatedWork.module.css";

interface RelatedWorkProps {
  currentSlug: string;
  currentCategory: string;
  allProjects: Project[];
}

export function RelatedWork({
  currentSlug,
  currentCategory,
  allProjects,
}: RelatedWorkProps) {
  const related = allProjects
    .filter((p) => p.slug !== currentSlug)
    .map((p) => {
      const catMatch = p.category === currentCategory ? 2 : 0;
      const featured = p.featured ? 1 : 0;
      return { project: p, score: catMatch + featured };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section className={styles.wrapper} aria-label="Related work">
      <h3 className={styles.heading}>Related Work</h3>
      <div className={styles.grid}>
        {related.map(({ project }) => (
          <GlassCard
            key={project.slug}
            as="article"
            hover
            className={styles.card}
          >
            <Badge variant="accent">{project.category}</Badge>
            <h4 className={styles.title}>
              <Link href={`/projects/${project.slug}`}>{project.name}</Link>
            </h4>
            <p className={styles.desc}>{project.description}</p>
            <div className={styles.metric}>
              <span className={styles.metricValue}>{project.metricValue}</span>
              <span className={styles.metricLabel}>{project.metricLabel}</span>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
