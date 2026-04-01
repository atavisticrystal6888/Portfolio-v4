import type { CaseStudyFrontmatter } from "@/types/project";
import { Badge } from "@/components/ui/Badge";
import styles from "./CaseStudyHero.module.css";

interface CaseStudyHeroProps {
  caseStudy: CaseStudyFrontmatter;
}

export function CaseStudyHero({ caseStudy }: CaseStudyHeroProps) {
  return (
    <section className={styles.hero} aria-label="Case study header">
      <div className={styles.inner}>
        <h1 className={styles.title}>{caseStudy.title}</h1>
        <p className={styles.subtitle}>{caseStudy.subtitle}</p>
        <div className={styles.meta}>
          <span className={styles.role}>{caseStudy.role}</span>
          <span className={styles.sep}>·</span>
          <span className={styles.duration}>{caseStudy.duration}</span>
        </div>
        <div className={styles.stack}>
          {caseStudy.stack.map((tech) => (
            <Badge key={tech} variant="outline">{tech}</Badge>
          ))}
        </div>
      </div>
    </section>
  );
}
