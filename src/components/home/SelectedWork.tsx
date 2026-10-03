import Link from "next/link";
import type { Project } from "@/types/project";
import { ListRow, ListRows } from "@/components/ui/ListRow";
import { EvidenceChip, StatusPill } from "@/components/case-study/ProjectFacts";
import { ProductCarousel } from "./ProductCarousel";
import { splitSelectedWork } from "./selection";
import styles from "./SelectedWork.module.css";

interface SelectedWorkProps {
  projects: Project[];
}

/**
 * The flagship products ride a horizontal rail so more of the work is in
 * view sooner; the compact-tier work compresses to index rows underneath.
 * Nothing appears in both lists.
 */
export function SelectedWork({ projects }: SelectedWorkProps) {
  const { flagships, rest } = splitSelectedWork(projects);

  return (
    <div className={styles.wrap}>
      <ProductCarousel projects={flagships} label="Flagship products" />

      {rest.length > 0 && (
        <div className={styles.also}>
          <h3 className={styles.alsoHeading}>Also built</h3>
          <ListRows>
            {rest.map((project) => (
              <ListRow
                key={project.slug}
                href={`/projects/${project.slug}`}
                title={project.name}
                dek={project.description}
                trailing={
                  (project.ownership || project.status || project.evidenceTier) && (
                    <span className={styles.facts}>
                      {/* Contribution first: on TCS NQT the question bank is
                          other people's work, and the row must say so. */}
                      {project.ownership && (
                        <span className={styles.ownership} data-testid="also-built-ownership">
                          {project.ownership}
                        </span>
                      )}
                      {project.status && <StatusPill status={project.status} />}
                      {project.evidenceTier && <EvidenceChip tier={project.evidenceTier} />}
                    </span>
                  )
                }
                rail={
                  <>
                    <span>{project.metricValue}</span>
                    <span>{project.metricLabel}</span>
                  </>
                }
              />
            ))}
          </ListRows>
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
