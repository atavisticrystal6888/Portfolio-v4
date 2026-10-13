import Link from "next/link";
import type { Project } from "@/types/project";
import { formatCategoryLabel } from "@/lib/utils";
import {
  EvidenceChip,
  OwnershipLine,
  StatusPill,
} from "@/components/case-study/ProjectFacts";
import { MetricCounter } from "@/components/ui/MetricCounter";
import styles from "./CompactRow.module.css";

interface CompactRowProps {
  project: Project;
  /** h3 under a page-level group label (/projects); h4 where the group label
   *  is itself an h3 (home "More work"). */
  headingLevel?: 3 | 4;
}

/**
 * Index row for compact-tier work: no image by design, just the facts. The
 * left rail carries category, status and evidence tier (the two chips); the
 * body carries name, one sentence, the exact ownership line and where to go;
 * the right column carries one outcome. Entries without a
 * case-study page keep their name unlinked and still offer Live / Source.
 * The same row renders home "More work" and /projects "More work", so the
 * two lists show the same names and the same facts in the same places.
 */
export function CompactRow({ project, headingLevel = 3 }: CompactRowProps) {
  const Heading = headingLevel === 4 ? "h4" : "h3";
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
        <Heading className={styles.name}>
          {hasCaseStudy ? <Link href={href}>{name}</Link> : name}
        </Heading>
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

      {/* Same readout as the carousel and the home evidence grid: serif
          value, caption beneath; a caption over four words is set as
          sentence-case body text. */}
      <div className={styles.outcome}>
        <MetricCounter
          value={project.metricValue}
          label={project.metricLabel}
          size="sm"
          caption="auto"
        />
      </div>
    </article>
  );
}
