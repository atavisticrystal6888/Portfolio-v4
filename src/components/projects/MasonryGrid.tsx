'use client';

import type { Project } from '@/types/project';
import { MasonryProjectCard } from './MasonryProjectCard';
import styles from './MasonryGrid.module.css';

interface MasonryGridProps {
  projects: Project[];
}

export function MasonryGrid({ projects }: MasonryGridProps) {
  if (projects.length === 0) {
    return <p className={styles.empty}>No projects match this filter.</p>;
  }

  return (
    <div className={styles.masonry}>
      {projects.map((p) => (
        <div key={p.slug} className={styles.item}>
          <MasonryProjectCard project={p} />
        </div>
      ))}
    </div>
  );
}
