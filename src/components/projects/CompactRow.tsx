import Link from "next/link";
import type { Project } from "@/types/project";
import { formatCategoryLabel } from "@/lib/utils";
import styles from "./CompactRow.module.css";

interface CompactRowProps {
  project: Project;
}

/**
 * Index row for compact-tier work: no image, just the facts — eyebrow, name,
 * one sentence, one outcome, my role, and where to go. Entries without a
 * case-study page keep their name unlinked and still offer Live / Source.
 */
export function CompactRow({ project }: CompactRowProps) {
  const hasCaseStudy = project.hasCaseStudy !== false;
  const href = `/projects/${project.slug}`;
  const name = project.productName ?? project.name;

  return (
    <article className={styles.row}>
      <p className={styles.eyebrow}>
        <span>{project.duration}</span>
        <span className={styles.sep} aria-hidden="true">
          &middot;
        </span>
        <span>{formatCategoryLabel(project.category)}</span>
      </p>

      <div className={styles.body}>
        <h3 className={styles.name}>
          {hasCaseStudy ? <Link href={href}>{name}</Link> : name}
        </h3>
        <p className={styles.desc}>{project.description}</p>
        <p className={styles.role}>{project.role}</p>

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
