'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Project } from '@/types/project';
import { Badge } from '@/components/ui/Badge';
import { formatCategoryLabel } from '@/lib/utils';
import styles from './MasonryProjectCard.module.css';

interface MasonryProjectCardProps {
  project: Project;
  /** Trims the visual area on mobile so the secondary tier scans faster. */
  compact?: boolean;
}

export function MasonryProjectCard({ project, compact = false }: MasonryProjectCardProps) {
  const hasCaseStudy = project.hasCaseStudy !== false;
  const card = (
    <article className={`${styles.card} ${compact ? styles.compact : ''}`}>
      {project.imageUrl && (
        <div className={styles.visual}>
          <Image
            src={project.imageUrl}
            alt={project.imageAlt ?? `${project.name} screenshot`}
            fill
            className={styles.coverImage}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.meta}>
          <Badge variant="accent">{formatCategoryLabel(project.category)}</Badge>
          <span className={styles.duration}>{project.duration}</span>
        </div>
        <h3 className={styles.title}>{project.name}</h3>
        <p className={styles.role}>{project.role}</p>
        <p className={styles.desc}>{project.description}</p>
        <p className={styles.metric}>
          <span className={styles.metricValue}>{project.metricValue}</span>
          <span className={styles.metricLabel}>{project.metricLabel}</span>
        </p>
        <p className={styles.stack}>
          {project.stack.slice(0, 4).join(' · ')}
          {project.stack.length > 4 && ` · +${project.stack.length - 4}`}
        </p>
      </div>

      {hasCaseStudy && <div className={styles.action}>Read the case study &rarr;</div>}
    </article>
  );

  if (!hasCaseStudy) {
    return <div className={styles.link}>{card}</div>;
  }

  return (
    <Link href={`/projects/${project.slug}`} className={styles.link}>
      {card}
    </Link>
  );
}
