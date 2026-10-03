import type { CSSProperties } from "react";
import Image from "next/image";
import type { Project } from "@/types/project";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { EvidenceLedger } from "./ProjectFacts";
import styles from "./ProductMasthead.module.css";

// Re-exported so existing imports from the masthead keep working.
export { STATUS_LABEL, StatusPill } from "./ProjectFacts";

interface ProductMastheadProps {
  project: Project;
  /**
   * Case-study frontmatter title, e.g. "Aarchid — AI Botanical Intelligence".
   * The part after the dash becomes the second half of the eyebrow so nothing
   * from the title is lost when the hero gives up its h1.
   */
  title?: string;
  /** Why there is no screenshot; shown under an imageless masthead. */
  heroNote?: string;
  /** What the decision beat (case-study frontmatter `alternative`). */
  alternative?: string;
  /** What the decision cost (case-study frontmatter `tradeoff`). */
  tradeoff?: string;
  /**
   * Breadcrumb trail shown above the eyebrow, e.g. Home / Projects / Aarchid.
   * Also emits the page's only BreadcrumbList JSON-LD.
   */
  breadcrumbs?: Crumb[];
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
export function ProductMasthead({
  project,
  title,
  heroNote,
  alternative,
  tradeoff,
  breadcrumbs,
}: ProductMastheadProps) {
  const name = project.productName ?? project.name;
  const descriptor = title ? splitCaseStudyTitle(title).descriptor : null;
  const eyebrow = [project.audience ? `For ${project.audience}` : null, descriptor]
    .filter(Boolean)
    .join(" \u00b7 ");
  const style = project.accent
    ? ({ "--product-accent": project.accent } as CSSProperties)
    : undefined;

  const hasActions = Boolean(project.liveUrl || project.githubUrl);
  // No screenshot: the masthead itself becomes the visual, a set title plate
  // on a ruled band instead of an empty frame.
  const plate = !project.imageUrl;

  return (
    <section
      className={cn(styles.masthead, plate && styles.plate)}
      aria-label="Product"
      style={style}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className={styles.top}>
          <Breadcrumbs items={breadcrumbs} />
        </div>
      )}
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
                  preload
                />
              </h1>
            ) : (
              <h1 className={styles.name}>{name}</h1>
            )}
          </div>

          {project.tagline && <p className={styles.tagline}>{project.tagline}</p>}
          {/* The PM call leads: it sits under the tagline, above the evidence
              row, so it is inside the first screen at 390 and 1440. */}
          {project.decision && (
            <p className={styles.decision} data-testid="masthead-decision">
              <span className={styles.decisionKey}>Decision</span>
              <span className={styles.decisionText}>{project.decision}</span>
            </p>
          )}
          {/* What the call beat and what it cost, from the study's own
              Options and Trade-offs, so neither waits for chapter four. */}
          {project.decision && (alternative || tradeoff) && (
            <p className={styles.decisionContext} data-testid="masthead-decision-context">
              {alternative && (
                <span className={styles.contextPart}>
                  <span className={styles.contextKey}>Instead of</span> {alternative}
                </span>
              )}
              {tradeoff && (
                <span className={styles.contextPart}>
                  <span className={styles.contextKey}>Cost:</span> {tradeoff}
                </span>
              )}
            </p>
          )}
          {plate && heroNote && (
            <p className={styles.heroNote} data-testid="hero-note">
              {heroNote}
            </p>
          )}
        </div>

        {(project.businessModel || hasActions) && (
        <div className={styles.side}>
          {project.businessModel && (
            <div className={styles.chips}>
              <Badge variant="outline">{project.businessModel}</Badge>
            </div>
          )}

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
        )}
      </div>

      <EvidenceLedger
        className={styles.ledger}
        status={project.status}
        statusNote={project.statusNote}
        ownership={project.ownership}
        evidenceTier={project.evidenceTier}
        evidenceNote={project.evidenceNote}
        lastVerified={project.lastVerified}
      />
    </section>
  );
}
