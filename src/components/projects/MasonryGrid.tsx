'use client';

import type { Project } from '@/types/project';
import { MasonryProjectCard } from './MasonryProjectCard';
import styles from './MasonryGrid.module.css';

interface MasonryGridProps {
  projects: Project[];
  /** Compact cards (smaller visual area on mobile) - used for the secondary tier. */
  compact?: boolean;
}

export function MasonryGrid({ projects, compact = false }: MasonryGridProps) {
  if (projects.length === 0) {
    return <p className={styles.empty}>No projects match this filter.</p>;
  }

  return (
    <div className={styles.masonry}>
      {projects.map((p) => (
        <div key={p.slug} className={styles.item}>
          <MasonryProjectCard project={p} compact={compact} />
        </div>
      ))}
    </div>
  );
}
