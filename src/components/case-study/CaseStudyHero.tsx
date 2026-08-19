import type { CaseStudyFrontmatter } from "@/types/project";
import { CoCreatorChips } from "@/components/ui/CoCreatorChips";
import { AarchidHeroScene } from "./AarchidHeroScene";
import styles from "./CaseStudyHero.module.css";

interface CaseStudyHeroProps {
  caseStudy: CaseStudyFrontmatter;
}

/**
 * Dossier header: the title and subtitle over a mono spec table reading
 * role / timeline / team / outcome / stack — the same instrument-readout
 * language as the home metrics strip.
 */
export function CaseStudyHero({ caseStudy }: CaseStudyHeroProps) {
  const isAarchid = caseStudy.slug === "aarchid";
  const headline = caseStudy.metrics?.[0];
  const hasTeam = (caseStudy.coCreators?.length ?? 0) > 0;

  return (
    <section
      className={isAarchid ? styles.heroAarchid : styles.hero}
      aria-label="Case study header"
    >
      {isAarchid && <AarchidHeroScene />}
      <div className={styles.inner}>
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
      </div>
    </section>
  );
}
