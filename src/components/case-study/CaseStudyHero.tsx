import type { CaseStudyFrontmatter } from "@/types/project";
import { CoCreatorChips } from "@/components/ui/CoCreatorChips";
import { SignatureScene } from "@/components/interactive/SignatureScene";
import { FramedShot } from "@/components/case-study/FramedShot";
import { cn } from "@/lib/utils";
import styles from "./CaseStudyHero.module.css";

interface CaseStudyHeroProps {
  caseStudy: CaseStudyFrontmatter;
  /** Project screenshot, when the project has one. */
  imageUrl?: string | null;
  imageAlt?: string;
  /** Deployed URL from projects.json — rendered as a spec row, not a footnote. */
  liveUrl?: string | null;
  /** Product accent (hex) for the framed shot's ground. */
  accent?: string | null;
  /** Muted demo loop; replaces the screenshot inside the frame when present. */
  demoVideo?: string | null;
  /**
   * True when a ProductMasthead sits above: the header drops its nav clearance
   * and its h1, since the masthead's product name is the page heading and the
   * title's descriptor half lives in the masthead eyebrow.
   */
  belowMasthead?: boolean;
}

/**
 * Dossier header: the title and subtitle over a mono spec table reading
 * role / timeline / team / outcome / stack — the same instrument-readout
 * language as the home metrics strip.
 *
 * Where the project has a screenshot, it sits beside the spec table inside a
 * browser frame on the product's tinted ground, never cropped; where it does
 * not, the table keeps the full measure and only the signature scene sits
 * behind.
 */
export function CaseStudyHero({
  caseStudy,
  imageUrl,
  imageAlt,
  liveUrl,
  accent,
  demoVideo,
  belowMasthead = false,
}: CaseStudyHeroProps) {
  const headline = caseStudy.metrics?.[0];
  const hasTeam = (caseStudy.coCreators?.length ?? 0) > 0;
  const liveHost = liveUrl
    ? new URL(liveUrl).host.replace(/^www\./, "")
    : null;

  return (
    <section
      className={cn(styles.hero, belowMasthead && styles.heroBelowMasthead)}
      aria-label="Case study header"
    >
      {/* The scene and the screenshot both want the right half of the header.
          Where there is a screenshot it wins - the page already has its visual
          anchor, and the lattice behind it only read as a stray arc clipped by
          the top of the page. Dossiers without a shot still get the motif. */}
      {!imageUrl && <SignatureScene variant="dossier" />}
      <div className={cn(styles.inner, imageUrl && styles.innerSplit)}>
        {!belowMasthead && <h1 className={styles.title}>{caseStudy.title}</h1>}
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
          <FramedShot
            src={imageUrl}
            alt={imageAlt ?? ""}
            accent={accent}
            video={demoVideo}
            variant="hero"
            priority
            className={styles.shot}
          />
        )}
      </div>
    </section>
  );
}
