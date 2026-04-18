import Link from "next/link";
import type { Project } from "@/types/project";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import styles from "./FeaturedProjects.module.css";

interface FeaturedProjectsProps {
  projects: Project[];
}

export function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  return (
    <div className={styles.grid}>
      {projects.map((p) => (
        <GlassCard key={p.slug} as="article" hover className={styles.card}>
          <Badge variant="accent">{p.category}</Badge>
          <h3 className={styles.title}>
            <Link href={`/projects/${p.slug}`}>{p.name}</Link>
          </h3>
          <p className={styles.desc}>{p.description}</p>
          <div className={styles.metric}>
            <strong>{p.metricValue}</strong> {p.metricLabel}
          </div>
          <div className={styles.stack}>
            {p.stack.slice(0, 4).map((t) => (
              <Badge key={t} variant="outline">{t}</Badge>
            ))}
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
