import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/types/project";
import { MetricCounter } from "@/components/ui/MetricCounter";
import { CoCreatorChips } from "@/components/ui/CoCreatorChips";
import { formatCategoryLabel } from "@/lib/utils";
import styles from "./ProjectCard.module.css";

interface ProjectCardProps {
  project: Project;
}

/**
 * Large editorial row. Rows with a screenshot alternate the image side; rows
 * without one run the text full width, which keeps the rhythm from settling
 * into a grid.
 */
export function ProjectCard({ project }: ProjectCardProps) {
  const hasCaseStudy = project.hasCaseStudy !== false;
  const href = `/projects/${project.slug}`;

  return (
    <article className={project.imageUrl ? styles.row : styles.rowTextOnly}>
      {project.imageUrl && (
        <div className={styles.media}>
          <Image
            src={project.imageUrl}
            alt={project.imageAlt ?? `${project.name} screenshot`}
            fill
            className={styles.mediaImage}
            sizes="(max-width: 900px) 100vw, 45vw"
          />
        </div>
      )}

      <div className={styles.body}>
        <p className={styles.rail}>
          <span>{project.duration}</span>
          <span className={styles.railSep} aria-hidden="true">
            &middot;
          </span>
          <span>{formatCategoryLabel(project.category)}</span>
        </p>

        <h3 className={styles.title}>
          {hasCaseStudy ? <Link href={href}>{project.name}</Link> : project.name}
        </h3>

        <p className={styles.role}>{project.role}</p>
        <p className={styles.desc}>{project.description}</p>

        <CoCreatorChips coCreators={project.coCreators} variant="compact" />

        <div className={styles.metric}>
          <MetricCounter
            value={project.metricValue}
            label={project.metricLabel}
            size="sm"
          />
        </div>

        <p className={styles.stack}>
          {project.stack.map((tech, i) => (
            <span key={tech}>
              {i > 0 && (
                <span className={styles.railSep} aria-hidden="true">
                  &middot;
                </span>
              )}
              {tech}
            </span>
          ))}
        </p>

        {hasCaseStudy && (
          <Link href={href} className={styles.cta}>
            Case study &rarr;
          </Link>
        )}
      </div>
    </article>
  );
}
