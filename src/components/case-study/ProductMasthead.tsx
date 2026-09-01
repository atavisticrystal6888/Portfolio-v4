import type { CSSProperties } from "react";
import Image from "next/image";
import type { Project, ProjectStatus } from "@/types/project";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import styles from "./ProductMasthead.module.css";

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  live: "Live",
  "private-beta": "Private beta",
  archived: "Archived",
  internal: "Internal",
  "open-source": "Open source",
};

interface StatusPillProps {
  status: ProjectStatus;
  className?: string;
}

/** Exact product status. Live gets the one green dot on the page. */
export function StatusPill({ status, className }: StatusPillProps) {
  return (
    <span className={cn(styles.status, styles[`status_${status}`], className)}>
      {status === "live" && <span className={styles.statusDot} aria-hidden="true" />}
      {STATUS_LABEL[status]}
    </span>
  );
}

interface ProductMastheadProps {
  project: Project;
}

/**
 * Product identity above the dossier header: what it is called, what it is,
 * who it is for, whether it is live, how it makes (or does not make) money,
 * and where to try it. A visitor who reads nothing else still leaves with
 * the product in hand.
 *
 * The case-study title below stays the page's h1; the name here is a `p`.
 */
export function ProductMasthead({ project }: ProductMastheadProps) {
  const name = project.productName ?? project.name;
  const style = project.accent
    ? ({ "--product-accent": project.accent } as CSSProperties)
    : undefined;

  const hasActions = Boolean(project.liveUrl || project.githubUrl);

  return (
    <section className={styles.masthead} aria-label="Product" style={style}>
      <div className={styles.inner}>
        <div className={styles.identity}>
          {project.audience && (
            <p className={styles.eyebrow}>For {project.audience}</p>
          )}

          <div className={styles.nameRow}>
            <span className={styles.mark} aria-hidden="true" />
            {project.wordmark ? (
              <Image
                src={project.wordmark}
                alt={name}
                width={320}
                height={64}
                className={styles.wordmark}
                priority
              />
            ) : (
              <p className={styles.name}>{name}</p>
            )}
          </div>

          {project.tagline && <p className={styles.tagline}>{project.tagline}</p>}
        </div>

        <div className={styles.side}>
          <div className={styles.chips}>
            {project.status && <StatusPill status={project.status} />}
            {project.businessModel && (
              <Badge variant="outline">{project.businessModel}</Badge>
            )}
          </div>

          {hasActions && (
            <div className={styles.actions}>
              {project.liveUrl && (
                <Button href={project.liveUrl} external>
                  Try it &#8599;
                </Button>
              )}
              {project.githubUrl && (
                <Button href={project.githubUrl} variant="secondary" external>
                  Source &#8599;
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
