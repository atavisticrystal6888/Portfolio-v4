'use client';

import { useMemo } from 'react';
import type { Project } from '@/types/project';
import { MasonryProjectCard } from './MasonryProjectCard';
import styles from './MasonryGrid.module.css';

interface MasonryGridProps {
  projects: Project[];
}

export function MasonryGrid({ projects }: MasonryGridProps) {
  const { col1, col2, col3 } = useMemo(() => {
    const c1: Project[] = [];
    const c2: Project[] = [];
    const c3: Project[] = [];

    projects.forEach((project, index) => {
      const colIndex = index % 3;
      if (colIndex === 0) c1.push(project);
      else if (colIndex === 1) c2.push(project);
      else c3.push(project);
    });

    return { col1: c1, col2: c2, col3: c3 };
  }, [projects]);

  if (projects.length === 0) {
    return <p className={styles.empty}>No projects match this filter.</p>;
  }

  return (
    <div className={styles.masonry}>
      <div className={styles.column}>
        {col1.map((p) => (
          <MasonryProjectCard key={p.slug} project={p} />
        ))}
      </div>
      <div className={styles.columnTablet}>
        {col2.map((p) => (
          <MasonryProjectCard key={p.slug} project={p} />
        ))}
      </div>
      <div className={styles.columnDesktop}>
        {col3.map((p) => (
          <MasonryProjectCard key={p.slug} project={p} />
        ))}
      </div>

      {/* Mobile: remaining items below the first column */}
      <div className={styles.mobileRemainder}>
        {[...col2, ...col3].map((p) => (
          <MasonryProjectCard key={p.slug} project={p} />
        ))}
      </div>
    </div>
  );
}
