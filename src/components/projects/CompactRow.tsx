import Link from "next/link";
import type { Project } from "@/types/project";
import { formatCategoryLabel } from "@/lib/utils";
import {
  EvidenceChip,
  OwnershipLine,
  StatusPill,
} from "@/components/case-study/ProjectFacts";
import styles from "./CompactRow.module.css";

interface CompactRowProps {
  project: Project;
}

/**
 * Index row for compact-tier work: no image by design, just the facts. The
 * left rail carries category, status and evidence tier (the two chips); the
 * body carries name, one sentence, the exact ownership line and where to go;
 * the right column carries one outcome. Entries without a
 * case-study page keep their name unlinked and still offer Live / Source.
 */
export function CompactRow({ project }: CompactRowProps) {
  const hasCaseStudy = project.hasCaseStudy !== false;
  const href = `/projects/${project.slug}`;
  const name = project.productName ?? project.name;

  return (
    <article className={styles.row}>
      <div className={styles.rail}>
        <p className={styles.eyebrow}>{formatCategoryLabel(project.category)}</p>
        {(project.status || project.evidenceTier) && (
          <div className={styles.chips}>
            {project.status && <StatusPill status={project.status} />}
            {project.evidenceTier && <EvidenceChip tier={project.evidenceTier} />}
          </div>
        )}
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>
          {hasCaseStudy ? <Link href={href}>{name}</Link> : name}
        </h3>
        <p className={styles.desc}>{project.description}</p>
        {project.ownership ? (
          <OwnershipLine ownership={project.ownership} className={styles.ownership} />
        ) : (
          <p className={styles.role}>{project.role}</p>
        )}

        {(hasCaseStudy || project.liveUrl || project.githubUrl) && (
          <div className={styles.links}>
            {hasCaseStudy && (
              <Link href={href} className={styles.link}>
                Case study &rarr;
              </Link>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                className={styles.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Live app &#8599;
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                className={styles.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Source &#8599;
              </a>
            )}
          </div>
        )}
      </div>

      <p className={styles.outcome}>
        <span className={styles.outcomeValue}>{project.metricValue}</span>
        <span className={styles.outcomeLabel}>{project.metricLabel}</span>
      </p>
    </article>
  );
}
