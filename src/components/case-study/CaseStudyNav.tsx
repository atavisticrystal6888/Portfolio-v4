import Link from "next/link";
import styles from "./CaseStudyNav.module.css";

interface CaseStudyNavProps {
  prevSlug: string;
  nextSlug: string;
}

export function CaseStudyNav({ prevSlug, nextSlug }: CaseStudyNavProps) {
  return (
    <nav className={styles.nav} aria-label="Case study navigation">
      <Link href={`/projects/${prevSlug}`} className={styles.link}>
        <span className={styles.dir}>← Previous</span>
        <span className={styles.slug}>{prevSlug.replace(/-/g, " ")}</span>
      </Link>
      <Link href={`/projects/${nextSlug}`} className={styles.link}>
        <span className={styles.dir}>Next →</span>
        <span className={styles.slug}>{nextSlug.replace(/-/g, " ")}</span>
      </Link>
    </nav>
  );
}
