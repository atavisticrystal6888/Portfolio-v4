import type { CaseStudyFrontmatter } from "@/types/project";
import { CoCreatorChips } from "@/components/ui/CoCreatorChips";
import { SignatureScene } from "@/components/interactive/SignatureScene";
import { FramedShot } from "@/components/case-study/FramedShot";
import { cn } from "@/lib/utils";
import { HeroZoom } from "./HeroZoom";
import { LightboxProvider } from "./blocks/Lightbox";
import styles from "./CaseStudyHero.module.css";
import layout from "./CaseStudyHeroLayout.module.css";

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
  /** Visible caption under the shot, e.g. "Demo readout uses synthetic seed data." */
  imageCaption?: string;
  /** Full-size file the hero opens in the lightbox (defaults to imageUrl). */
  zoomSrc?: string;
  /** Team line from projects.json, shown when there are no linked co-creators. */
  team?: string;
  /**
   * True when a ProductMasthead sits above: the header drops its nav clearance
   * and its h1, since the masthead's product name is the page heading and the
   * title's descriptor half lives in the masthead eyebrow.
   */
  belowMasthead?: boolean;
}

/**
 * Dossier header under the masthead: the subtitle, then one ruled row of
 * facts (role, timeline, team) and the exact "my part" line. Stack sits in a
 * collapsed disclosure so the first screen stays about the product, not the
 * tools; the headline number lives in the metric strip below the TL;DR.
 *
 * Where the project has a screenshot, it sits beside the facts inside a
 * browser frame on the product's tinted ground, never cropped. Where it does
 * not, the masthead above already carries the title plate, so nothing else
 * competes for the eye; a standalone header (no masthead) keeps the scene.
 */
export function CaseStudyHero({
  caseStudy,
  imageUrl,
  imageAlt,
  liveUrl,
  accent,
  demoVideo,
  imageCaption,
  zoomSrc,
  team,
  belowMasthead = false,
}: CaseStudyHeroProps) {
  const hasTeam = (caseStudy.coCreators?.length ?? 0) > 0;
  const liveHost =
    liveUrl && !belowMasthead ? new URL(liveUrl).host.replace(/^www\./, "") : null;
  const stack = caseStudy.stack ?? [];

  return (
    <LightboxProvider>
    <section
      className={cn(styles.hero, belowMasthead && styles.heroBelowMasthead)}
      aria-label="Case study header"
    >
      {!imageUrl && !belowMasthead && <SignatureScene variant="dossier" />}
      <div
        className={cn(
          styles.inner,
          imageUrl && styles.innerSplit,
          // Imageless studies under a masthead: keep the masthead's left edge
          // instead of indenting into a narrower centred column.
          !imageUrl && belowMasthead && layout.alignWithMasthead
        )}
      >
        {!belowMasthead && <h1 className={styles.title}>{caseStudy.title}</h1>}
        <p className={styles.subtitle}>{caseStudy.subtitle}</p>
        {!belowMasthead && !imageUrl && caseStudy.heroNote && (
          <p className={styles.heroNote}>{caseStudy.heroNote}</p>
        )}

        <div className={styles.factsCol}>
          <dl className={styles.facts} data-testid="case-study-facts">
            <div className={styles.fact}>
              <dt className={styles.specKey}>Role</dt>
              <dd className={styles.specValue}>{caseStudy.role}</dd>
            </div>

            <div className={styles.fact}>
              <dt className={styles.specKey}>Timeline</dt>
              <dd className={styles.specValue}>{caseStudy.duration}</dd>
            </div>

            <div className={styles.fact}>
              <dt className={styles.specKey}>Team</dt>
              <dd className={styles.specValue}>
                {hasTeam ? (
                  <CoCreatorChips coCreators={caseStudy.coCreators} label="" />
                ) : (
                  team ?? "Solo"
                )}
              </dd>
            </div>

            {caseStudy.myPart && (
              <div className={cn(styles.fact, styles.factWide)}>
                <dt className={styles.specKey}>My part</dt>
                <dd className={styles.specValue}>{caseStudy.myPart}</dd>
              </div>
            )}

            {liveUrl && liveHost && (
              <div className={cn(styles.fact, styles.factWide)}>
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
          </dl>

          {stack.length > 0 && (
            <details className={styles.stackDetails}>
              <summary className={styles.stackSummary}>
                <span>Stack and tools</span>
                <span className={styles.stackCount}>{stack.length}</span>
                <span className={styles.chevron} aria-hidden="true" />
              </summary>
              <p className={styles.stack}>{stack.join(" · ")}</p>
            </details>
          )}
        </div>

        {imageUrl && (
          <div className={styles.shot}>
            {demoVideo ? (
              <FramedShot
                src={imageUrl}
                alt={imageAlt ?? ""}
                accent={accent}
                video={demoVideo}
                variant="hero"
                priority
                className={styles.shotFrame}
              />
            ) : (
              <HeroZoom src={zoomSrc ?? imageUrl} alt={imageAlt ?? ""} caption={imageCaption}>
                <FramedShot
                  src={imageUrl}
                  alt={imageAlt ?? ""}
                  accent={accent}
                  variant="hero"
                  priority
                  className={styles.shotFrame}
                />
              </HeroZoom>
            )}
            {imageCaption && (
              <p className={styles.shotCaption} data-testid="hero-caption">
                {imageCaption}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
    </LightboxProvider>
  );
}
