import type { CSSProperties } from "react";
import Link from "next/link";
import type { Project } from "@/types/project";
import { FramedShot } from "@/components/case-study/FramedShot";
import { StatusPill } from "@/components/case-study/ProductMasthead";
import { cn, formatCategoryLabel } from "@/lib/utils";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  project: Project;
  /** Preload the screenshot when the card is the first thing in view. */
  priority?: boolean;
  /** `sizes` for the framed screenshot; depends on the grid the card sits in. */
  sizes?: string;
  className?: string;
}

/**
 * The product card: a framed, uncropped screenshot on the product's own
 * tinted ground, then the facts a visitor needs without reading a paragraph —
 * what it is called, what it is, whether it is live, what it achieved, where
 * to go next. Shared by the home carousel and the /projects featured grid so
 * the two never drift apart.
 */
export function ProductCard({
  project,
  priority = false,
  sizes = "(max-width: 640px) 85vw, (max-width: 1200px) 46vw, 520px",
  className,
}: ProductCardProps) {
  const hasCaseStudy = project.hasCaseStudy !== false;
  const href = `/projects/${project.slug}`;
  const name = project.productName ?? project.name;
  const style = project.accent
    ? ({ "--product-accent": project.accent } as CSSProperties)
    : undefined;

  const shot = project.imageUrl ? (
    <FramedShot
      src={project.imageUrl}
      alt={project.imageAlt ?? `${name} screenshot`}
      accent={project.accent}
      variant="small"
      sizes={sizes}
      priority={priority}
      className={styles.shot}
    />
  ) : null;

  return (
    <article className={cn(styles.card, className)} style={style}>
      {shot &&
        (hasCaseStudy ? (
          <Link
            href={href}
            className={styles.media}
            tabIndex={-1}
            aria-hidden="true"
          >
            {shot}
          </Link>
        ) : (
          <div className={styles.media}>{shot}</div>
        ))}

      <div className={styles.body}>
        <p className={styles.eyebrow}>
          <span>{project.duration}</span>
          <span className={styles.sep} aria-hidden="true">
            &middot;
          </span>
          <span>{formatCategoryLabel(project.category)}</span>
        </p>

        <h3 className={styles.name}>
          {hasCaseStudy ? <Link href={href}>{name}</Link> : name}
        </h3>

        {project.tagline && <p className={styles.tagline}>{project.tagline}</p>}

        {project.status && (
          <StatusPill status={project.status} className={styles.status} />
        )}

        <p className={styles.outcome}>
          <span className={styles.outcomeValue}>{project.metricValue}</span>
          <span className={styles.outcomeLabel}>{project.metricLabel}</span>
        </p>

        {(hasCaseStudy || project.liveUrl) && (
          <div className={styles.links}>
            {hasCaseStudy && (
              <Link href={href} className={styles.link}>
                Case study &rarr;
              </Link>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                className={styles.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Live app &#8599;
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
