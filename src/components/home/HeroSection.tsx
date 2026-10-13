import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AVAILABILITY, CONTACT_EMAIL_HREF, SLEEP_COMPANY_TENURE } from "@/lib/site";
import { HeroCtaLink } from "./HeroCtaLink";
import { heroCtaCopy } from "@/lib/experiments/hero";
import styles from "./HeroSection.module.css";

/* The contents mirror the section order on the page; the numbers must match
   the SectionLabel indices below or the index lies. */
const CONTENTS = [
  { index: "01", label: "Selected work", href: "#work" },
  { index: "02", label: "What the evidence supports", href: "#outcomes" },
  { index: "03", label: "How I think", href: "#thinking" },
  { index: "04", label: "Where to go next", href: "#next" },
  { index: "05", label: "Contact", href: "#contact" },
];

/**
 * The title block of a working paper: thesis first, author line under it,
 * and a contents index in the right column doing real navigation. The name
 * lives in the byline (and the navbar). The claim leads.
 */
interface HeroSectionProps {
  /** Variant key from ExperimentHub; unknown or absent renders control copy. */
  ctaVariant?: string;
  /** True only for enrolled visitors: swaps in the click-tracking link. */
  tracked?: boolean;
}

export function HeroSection({ ctaVariant, tracked = false }: HeroSectionProps) {
  const ctaCopy = heroCtaCopy(ctaVariant);
  return (
    <section className={styles.hero} aria-label="Introduction">
      <div className={styles.inner}>
        <div className={styles.titleBlock}>
          <p className={styles.eyebrow}>
            Dhruv Singhal &middot; Product Manager &amp; Builder
          </p>
          <h1 className={styles.thesis}>
            I own the problem, the spec, the trade-offs and the evidence.
            Where I also built it, I say so.
          </h1>
          <p className={styles.status}>
            Product Intern, Growth &middot; The Sleep Company ({SLEEP_COMPANY_TENURE})
          </p>
          <p className={styles.statement}>
            E-commerce and AI products: stakeholder input, user research,
            and product specs turned into decisions teams can build.
          </p>
          <div className={styles.ctas}>
            {tracked ? (
              <HeroCtaLink href="#work">{ctaCopy}</HeroCtaLink>
            ) : (
              <Button href="#work">{ctaCopy}</Button>
            )}
            <Button href={CONTACT_EMAIL_HREF} variant="secondary" external>
              Email me
            </Button>
            {/* Availability, worded exactly as on /contact. Sits in the CTA
                row at desktop widths and wraps under the buttons on phones. */}
            <p className={styles.availability} data-testid="hero-availability">
              {AVAILABILITY}
            </p>
          </div>
          <p className={styles.guide} data-testid="hero-guide">
            Four case studies below. Each states the decision, the trade-off, what was
            tested, and what is still unproven.
          </p>
        </div>

        <nav className={styles.contents} aria-label="Page contents">
          <p className={styles.contentsHeading}>Contents</p>
          <ol className={styles.contentsList}>
            {CONTENTS.map(({ index, label, href }) => (
              <li key={href}>
                {/* ToC grammar: label, dotted leader, folio number. The
                    leader ends in the number instead of trailing into nothing. */}
                <Link href={href} className={styles.contentsLink}>
                  <span className={styles.contentsLabel}>{label}</span>
                  <span className={styles.leader} aria-hidden="true" />
                  <span className={styles.contentsIndex}>{index}</span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </section>
  );
}
