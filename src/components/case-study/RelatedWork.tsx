import Link from "next/link";
import type { Project } from "@/types/project";
import { ListRow, ListRows } from "@/components/ui/ListRow";
import { formatCategoryLabel } from "@/lib/utils";
import { FramedShot } from "./FramedShot";
import { StatusPill } from "./ProductMasthead";
import styles from "./RelatedWork.module.css";

interface RelatedWorkProps {
  currentSlug: string;
  currentCategory: string;
  allProjects: Project[];
}

/**
 * Three related products. Same category scores highest, then flagships, then
 * anything with a screenshot (so the card row is usually full). Projects with
 * an image become framed cards; any without fall back to index rows beneath.
 * Card-only entries with no case-study page are never offered.
 */
export function pickRelated(
  allProjects: Project[],
  currentSlug: string,
  currentCategory: string
): Project[] {
  return allProjects
    .filter((p) => p.slug !== currentSlug && p.hasCaseStudy !== false)
    .map((p) => {
      const catMatch = p.category === currentCategory ? 2 : 0;
      const flagship = p.tier === "flagship" ? 1 : 0;
      const shot = p.imageUrl ? 0.5 : 0;
      return { project: p, score: catMatch + flagship + shot };
    })
    .sort((a, b) => b.score - a.score || a.project.order - b.project.order)
    .slice(0, 3)
    .map(({ project }) => project);
}

export function RelatedWork({
  currentSlug,
  currentCategory,
  allProjects,
}: RelatedWorkProps) {
  const related = pickRelated(allProjects, currentSlug, currentCategory);
  if (related.length === 0) return null;

  const cards = related.filter((p) => Boolean(p.imageUrl));
  const rows = related.filter((p) => !p.imageUrl);

  return (
    <section className={styles.wrapper} aria-label="Related products">
      <h2 className={styles.heading}>Related products</h2>

      {cards.length > 0 && (
        <ul className={styles.cards}>
          {cards.map((project) => (
            <li key={project.slug} className={styles.cardItem}>
              <Link href={`/projects/${project.slug}`} className={styles.card}>
                <FramedShot
                  src={project.imageUrl as string}
                  alt={project.imageAlt ?? `${project.name} screenshot`}
                  accent={project.accent}
                  variant="small"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <div className={styles.cardBody}>
                  <h3 className={styles.cardName}>
                    {project.productName ?? project.name}
                  </h3>
                  <p className={styles.cardTagline}>
                    {project.tagline ?? project.description}
                  </p>
                  {project.status && (
                    <StatusPill status={project.status} className={styles.cardStatus} />
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {rows.length > 0 && (
        <ListRows>
          {rows.map((project) => (
            <ListRow
              key={project.slug}
              href={`/projects/${project.slug}`}
              title={project.productName ?? project.name}
              dek={project.tagline ?? project.description}
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
      )}
    </section>
  );
}
