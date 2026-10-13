import Link from "next/link";
import type { Project } from "@/types/project";
import { CompactRow } from "@/components/projects/CompactRow";
import { ProductCarousel } from "./ProductCarousel";
import { splitSelectedWork } from "./selection";
import styles from "./SelectedWork.module.css";
import { SectionLabel } from "@/components/ui/SectionLabel";

interface SelectedWorkProps {
  projects: Project[];
}

/**
 * The flagship products ride a horizontal rail so more of the work is in
 * view sooner; the compact-tier work compresses to index rows underneath.
 * Nothing appears in both lists. The rows are the /projects "More work"
 * rows (CompactRow) under the same label, so a project reads the same on
 * both pages.
 */
export function SelectedWork({ projects }: SelectedWorkProps) {
  const { flagships, rest } = splitSelectedWork(projects);

  return (
    <div className={styles.wrap}>
      <ProductCarousel projects={flagships} label="Flagship products" />

      {rest.length > 0 && (
        <div className={styles.also} data-testid="home-more-work">
          <div className={styles.alsoHeading}>
            <SectionLabel as="h3">More work</SectionLabel>
          </div>
          <div className={styles.rows}>
            {rest.map((project) => (
              <CompactRow key={project.slug} project={project} headingLevel={4} />
            ))}
          </div>
          <div className={styles.viewAll}>
            <Link href="/projects" className={styles.viewAllLink}>
              All projects &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
