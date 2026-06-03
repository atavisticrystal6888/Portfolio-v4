import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/types/project";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { CoCreatorChips } from "@/components/ui/CoCreatorChips";
import { formatCategoryLabel } from "@/lib/utils";
import styles from "./ProjectCard.module.css";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <GlassCard as="article" hover className={styles.card}>
      {project.imageUrl && (
        <div className={styles.media}>
          <Image
            src={project.imageUrl}
            alt={project.imageAlt ?? `${project.name} screenshot`}
            fill
            className={styles.mediaImage}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      <div className={styles.header}>
        <Badge variant="accent">{formatCategoryLabel(project.category)}</Badge>
        <span className={styles.duration}>{project.duration}</span>
      </div>
      <h2 className={styles.title}>
        <Link href={`/projects/${project.slug}`}>{project.name}</Link>
      </h2>
      <p className={styles.role}>{project.role}</p>
      <p className={styles.desc}>{project.description}</p>
      <CoCreatorChips coCreators={project.coCreators} variant="compact" />
      <div className={styles.metric}>
        <strong>{project.metricValue}</strong> {project.metricLabel}
      </div>
      <div className={styles.stack}>
        {project.stack.map((tech) => (
          <Badge key={tech} variant="outline">{tech}</Badge>
        ))}
      </div>
    </GlassCard>
  );
}
