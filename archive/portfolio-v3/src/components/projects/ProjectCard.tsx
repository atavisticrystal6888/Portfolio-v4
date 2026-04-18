import Link from "next/link";
import type { Project } from "@/types/project";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import styles from "./ProjectCard.module.css";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <GlassCard as="article" hover className={styles.card}>
      <div className={styles.header}>
        <Badge variant="accent">{project.category}</Badge>
        <span className={styles.duration}>{project.duration}</span>
      </div>
      <h2 className={styles.title}>
        <Link href={`/projects/${project.slug}`}>{project.name}</Link>
      </h2>
      <p className={styles.role}>{project.role}</p>
      <p className={styles.desc}>{project.description}</p>
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
