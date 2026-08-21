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
  /** Deployed URL from projects.json — rendered as a spec row, not a footnote. */
  liveUrl?: string | null;
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
export function CaseStudyHero({ caseStudy, imageUrl, imageAlt, liveUrl }: CaseStudyHeroProps) {
  const headline = caseStudy.metrics?.[0];
  const hasTeam = (caseStudy.coCreators?.length ?? 0) > 0;
  const liveHost = liveUrl
    ? new URL(liveUrl).host.replace(/^www\./, "")
    : null;

  return (
    <section className={styles.hero} aria-label="Case study header">
      {/* The scene and the screenshot both want the right half of the header.
          Where there is a screenshot it wins - the page already has its visual
          anchor, and the lattice behind it only read as a stray arc clipped by
          the top of the page. Dossiers without a shot still get the motif. */}
      {!imageUrl && <SignatureScene variant="dossier" />}
      <div className={cn(styles.inner, imageUrl && styles.innerSplit)}>
        <h1 className={styles.title}>{caseStudy.title}</h1>
        <p className={styles.subtitle}>{caseStudy.subtitle}</p>

        <dl className={styles.spec}>
          <div className={styles.specRow}>
            <dt className={styles.specKey}>Role</dt>
            <dd className={styles.specValue}>{caseStudy.role}</dd>
          </div>

          {caseStudy.myPart && (
            <div className={styles.specRow}>
              <dt className={styles.specKey}>My part</dt>
              <dd className={styles.specValue}>{caseStudy.myPart}</dd>
            </div>
          )}

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

          {liveUrl && liveHost && (
            <div className={styles.specRow}>
              <dt className={styles.specKey}>Live</dt>
              <dd className={styles.specValue}>
                <a
                  href={liveUrl}
                  className={styles.liveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {liveHost} &#8599;
                </a>
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
