import Link from "next/link";
import styles from "./CaseStudyNav.module.css";

interface CaseStudyNavProps {
  /** Omitted at either end of a list that does not wrap (articles). */
  prevSlug?: string;
  nextSlug?: string;
  /** Display names (product name, article title); the de-slugged slug is only a fallback. */
  prevName?: string;
  nextName?: string;
  /** Route the slugs live under. */
  basePath?: string;
  /** The way back to the index between the two neighbours. */
  indexHref?: string;
  indexLabel?: string;
  /** Accessible name of the nav landmark. */
  label?: string;
}

const fromSlug = (slug: string) => slug.replace(/-/g, " ");

/**
 * Previous and next item, with the way back to the index between them.
 * Case studies use the defaults ("All projects"); articles pass /blog and
 * "All articles", so both kinds of long read end the same way.
 */
export function CaseStudyNav({
  prevSlug,
  nextSlug,
  prevName,
  nextName,
  basePath = "/projects",
  indexHref = "/projects",
  indexLabel = "All projects",
  label = "Case study navigation",
}: CaseStudyNavProps) {
  return (
    <nav className={styles.nav} aria-label={label}>
      {prevSlug && (
        <Link href={`${basePath}/${prevSlug}`} className={`${styles.link} ${styles.prev}`}>
          <span className={styles.dir}>← Previous</span>
          <span className={prevName ? styles.name : styles.slug}>{prevName ?? fromSlug(prevSlug)}</span>
        </Link>
      )}
      <Link href={indexHref} className={styles.index}>
        <span aria-hidden="true">&larr;</span> {indexLabel}
      </Link>
      {nextSlug && (
        <Link href={`${basePath}/${nextSlug}`} className={`${styles.link} ${styles.next}`}>
          <span className={styles.dir}>Next →</span>
          <span className={nextName ? styles.name : styles.slug}>{nextName ?? fromSlug(nextSlug)}</span>
        </Link>
      )}
    </nav>
  );
}
