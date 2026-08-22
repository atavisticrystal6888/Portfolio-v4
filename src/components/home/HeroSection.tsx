import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { CONTACT_EMAIL_HREF } from "@/lib/site";
import styles from "./HeroSection.module.css";

/* The contents mirror the section order on the page; the numbers must match
   the SectionLabel indices below or the index lies. */
const CONTENTS = [
  { index: "01", label: "Selected work", href: "#work" },
  { index: "02", label: "Measured outcomes", href: "#outcomes" },
  { index: "03", label: "How I think", href: "#thinking" },
  { index: "04", label: "References", href: "#references" },
  { index: "05", label: "Contact", href: "#contact" },
];

/**
 * The title block of a working paper: thesis first, author line under it,
 * and a contents index in the right column doing real navigation. The name
 * lives in the byline (and the navbar) — the claim leads.
 */
export function HeroSection() {
  return (
    <section className={styles.hero} aria-label="Introduction">
      <div className={styles.inner}>
        <div className={styles.titleBlock}>
          <p className={styles.eyebrow}>
            Dhruv Singhal &middot; Product Manager &amp; Builder
          </p>
          <h1 className={styles.thesis}>
            I scope, spec, and ship the V1 myself.
          </h1>
          <p className={styles.status}>
            Currently: Product Manager Intern, Growth &middot; The Sleep Company
          </p>
          <p className={styles.statement}>
            E-commerce and AI products &mdash; stakeholder input, user research,
            and product specs turned into decisions teams can build.
          </p>
          <div className={styles.ctas}>
            <Button href="#work">See the work</Button>
            <Button href={CONTACT_EMAIL_HREF} variant="secondary" external>
              Email me
            </Button>
          </div>
        </div>

        <nav className={styles.contents} aria-label="Page contents">
          <p className={styles.contentsHeading}>Contents</p>
          <ol className={styles.contentsList}>
            {CONTENTS.map(({ index, label, href }) => (
              <li key={href}>
                {/* ToC grammar: label, dotted leader, folio number — the
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
