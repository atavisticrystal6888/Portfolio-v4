import Link from "next/link";
import styles from "./CaseStudyNav.module.css";

interface CaseStudyNavProps {
  prevSlug: string;
  nextSlug: string;
  /** Product names from content/projects.json; the de-slugged slug is only a fallback. */
  prevName?: string;
  nextName?: string;
}

const fromSlug = (slug: string) => slug.replace(/-/g, " ");

/** Previous and next case study, with the way back to the index between them. */
export function CaseStudyNav({ prevSlug, nextSlug, prevName, nextName }: CaseStudyNavProps) {
  return (
    <nav className={styles.nav} aria-label="Case study navigation">
      <Link href={`/projects/${prevSlug}`} className={styles.link}>
        <span className={styles.dir}>← Previous</span>
        <span className={prevName ? styles.name : styles.slug}>{prevName ?? fromSlug(prevSlug)}</span>
      </Link>
      <Link href="/projects" className={styles.index}>
        <span aria-hidden="true">&larr;</span> All projects
      </Link>
      <Link href={`/projects/${nextSlug}`} className={styles.link}>
        <span className={styles.dir}>Next →</span>
        <span className={nextName ? styles.name : styles.slug}>{nextName ?? fromSlug(nextSlug)}</span>
      </Link>
    </nav>
  );
}
