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
  /**
   * Case-study frontmatter title, e.g. "Aarchid — AI Botanical Intelligence".
   * The part after the dash becomes the second half of the eyebrow so nothing
   * from the title is lost when the hero gives up its h1.
   */
  title?: string;
}

/**
 * Splits "Name — Descriptor" (em/en dash or spaced hyphen) into its halves.
 * A title with no dash has no descriptor.
 */
export function splitCaseStudyTitle(title: string): { name: string; descriptor: string | null } {
  const [name = "", ...rest] = title.split(/\s+[\u2014\u2013-]\s+/);
  const descriptor = rest.join(" ").trim();
  return { name: name.trim(), descriptor: descriptor.length > 0 ? descriptor : null };
}

/**
 * Product identity above the dossier header: what it is called, what it is,
 * who it is for, whether it is live, how it makes (or does not make) money,
 * and where to try it. A visitor who reads nothing else still leaves with
 * the product in hand.
 *
 * The product name here is the page's h1. The hero below renders no title
 * of its own when a masthead is present; the descriptor half of the
 * frontmatter title ("AI Botanical Intelligence") joins the eyebrow instead.
 */
export function ProductMasthead({ project, title }: ProductMastheadProps) {
  const name = project.productName ?? project.name;
  const descriptor = title ? splitCaseStudyTitle(title).descriptor : null;
  const eyebrow = [project.audience ? `For ${project.audience}` : null, descriptor]
    .filter(Boolean)
    .join(" \u00b7 ");
  const style = project.accent
    ? ({ "--product-accent": project.accent } as CSSProperties)
    : undefined;

  const hasActions = Boolean(project.liveUrl || project.githubUrl);

  return (
    <section className={styles.masthead} aria-label="Product" style={style}>
      <div className={styles.inner}>
        <div className={styles.identity}>
          {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}

          <div className={styles.nameRow}>
            <span className={styles.mark} aria-hidden="true" />
            {project.wordmark ? (
              <h1 className={styles.wordmarkTitle}>
                <Image
                  src={project.wordmark}
                  alt={name}
                  width={320}
                  height={64}
                  className={styles.wordmark}
                  priority
                />
              </h1>
            ) : (
              <h1 className={styles.name}>{name}</h1>
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
