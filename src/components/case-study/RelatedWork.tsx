import type { Project } from "@/types/project";
import { ListRow, ListRows } from "@/components/ui/ListRow";
import { formatCategoryLabel } from "@/lib/utils";
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
      <h2 className={styles.heading}>Related work</h2>
      <ListRows>
        {related.map(({ project }) => (
          <ListRow
            key={project.slug}
            href={`/projects/${project.slug}`}
            title={project.name}
            dek={project.description}
            rail={formatCategoryLabel(project.category)}
            trailing={
              <p className={styles.metric}>
                <span className={styles.metricValue}>{project.metricValue}</span>
                <span className={styles.metricLabel}>{project.metricLabel}</span>
              </p>
            }
          />
        ))}
      </ListRows>
    </section>
  );
}
