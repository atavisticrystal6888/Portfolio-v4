import Image from "next/image";
import type { CaseStudyFrontmatter } from "@/types/project";
import { CoCreatorChips } from "@/components/ui/CoCreatorChips";
import { SignatureScene } from "@/components/interactive/SignatureScene";
import { cn } from "@/lib/utils";
import styles from "./CaseStudyHero.module.css";

interface CaseStudyHeroProps {
  caseStudy: CaseStudyFrontmatter;
  /** Project screenshot, when the project has one. */
  imageUrl?: string | null;
  imageAlt?: string;
}

/**
 * Dossier header: the title and subtitle over a mono spec table reading
 * role / timeline / team / outcome / stack — the same instrument-readout
 * language as the home metrics strip.
 *
 * Where the project has a screenshot, it sits beside the spec table so the
 * header shows the thing as well as describing it; where it does not, the
 * table keeps the full measure and only the signature scene sits behind.
 */
export function CaseStudyHero({ caseStudy, imageUrl, imageAlt }: CaseStudyHeroProps) {
  const headline = caseStudy.metrics?.[0];
  const hasTeam = (caseStudy.coCreators?.length ?? 0) > 0;

  return (
    <section className={styles.hero} aria-label="Case study header">
      <SignatureScene variant="dossier" />
      <div className={cn(styles.inner, imageUrl && styles.innerSplit)}>
        <h1 className={styles.title}>{caseStudy.title}</h1>
        <p className={styles.subtitle}>{caseStudy.subtitle}</p>

        <dl className={styles.spec}>
          <div className={styles.specRow}>
            <dt className={styles.specKey}>Role</dt>
            <dd className={styles.specValue}>{caseStudy.role}</dd>
          </div>

          <div className={styles.specRow}>
            <dt className={styles.specKey}>Timeline</dt>
            <dd className={styles.specValue}>{caseStudy.duration}</dd>
          </div>

          <div className={styles.specRow}>
            <dt className={styles.specKey}>Team</dt>
            <dd className={styles.specValue}>
              {hasTeam ? (
                <CoCreatorChips coCreators={caseStudy.coCreators} label="" />
              ) : (
                "Solo"
              )}
            </dd>
          </div>

          {headline && (
            <div className={styles.specRow}>
              <dt className={styles.specKey}>Outcome</dt>
              <dd className={styles.specValue}>
                <span className={styles.outcomeValue}>{headline.displayValue}</span>
                <span className={styles.outcomeLabel}>{headline.label}</span>
              </dd>
            </div>
          )}

          <div className={styles.specRow}>
            <dt className={styles.specKey}>Stack</dt>
            <dd className={`${styles.specValue} ${styles.stack}`}>
              {caseStudy.stack.join(" · ")}
            </dd>
          </div>
        </dl>

        {imageUrl && (
          <figure className={styles.shot}>
            <Image
              src={imageUrl}
              alt={imageAlt ?? ""}
              width={1600}
              height={1000}
              sizes="(max-width: 900px) 100vw, 44vw"
              className={styles.shotImage}
              priority
            />
          </figure>
        )}
      </div>
    </section>
  );
}
