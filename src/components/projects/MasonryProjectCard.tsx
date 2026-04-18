'use client';

import Link from 'next/link';
import type { Project } from '@/types/project';
import { Badge } from '@/components/ui/Badge';
import styles from './MasonryProjectCard.module.css';

interface MasonryProjectCardProps {
  project: Project;
}

export function MasonryProjectCard({ project }: MasonryProjectCardProps) {
  return (
    <Link href={`/projects/${project.slug}`} className={styles.link}>
      <article className={styles.card}>
        {/* Visual area */}
        <div className={styles.visual}>
          <div className={styles.gradient} />
          <div className={styles.overlay}>
            <h3 className={styles.title}>{project.name}</h3>
          </div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.meta}>
            <Badge variant="accent">{project.category}</Badge>
            <span className={styles.role}>{project.role}</span>
          </div>
          <p className={styles.desc}>{project.description}</p>
          <div className={styles.metric}>
            <strong>{project.metricValue}</strong> {project.metricLabel}
          </div>
          <div className={styles.stack}>
            {project.stack.slice(0, 4).map((tech) => (
              <Badge key={tech} variant="outline">{tech}</Badge>
            ))}
            {project.stack.length > 4 && (
              <Badge variant="outline">+{project.stack.length - 4}</Badge>
            )}
          </div>
        </div>

        {/* Action */}
        <div className={styles.action}>
          Read Case Study →
        </div>
      </article>
    </Link>
  );
}
