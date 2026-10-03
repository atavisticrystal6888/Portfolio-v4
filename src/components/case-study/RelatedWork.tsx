import type { Project } from "@/types/project";
import { ProductCard } from "@/components/projects/ProductCard";
import styles from "./RelatedWork.module.css";

interface RelatedWorkProps {
  currentSlug: string;
  currentCategory: string;
  allProjects: Project[];
}

/**
 * Three related products. Same category scores highest, then flagships, then
 * anything with a screenshot. Imageless products get the card's title plate,
 * so the row stays three even cards. Card-only entries with no case-study page are never offered.
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

  // Same card as the /projects index and the home carousel: status, evidence
  // and ownership travel with the product wherever it is listed.
  return (
    <section className={styles.wrapper} aria-labelledby="related-products-heading">
      <h2 id="related-products-heading" className={styles.heading}>
        Related products
      </h2>
      <ul className={styles.cards}>
        {related.map((project) => (
          <li key={project.slug} className={styles.cardItem}>
            <ProductCard project={project} sizes="(max-width: 640px) 100vw, 33vw" />
          </li>
        ))}
      </ul>
    </section>
  );
}
