import type { CaseStudyFrontmatter } from "@/types/project";
import { Badge } from "@/components/ui/Badge";
import { CoCreatorChips } from "@/components/ui/CoCreatorChips";
import { AarkidHeroScene } from "./AarkidHeroScene";
import styles from "./CaseStudyHero.module.css";

interface CaseStudyHeroProps {
  caseStudy: CaseStudyFrontmatter;
}

export function CaseStudyHero({ caseStudy }: CaseStudyHeroProps) {
  const isAarkid = caseStudy.slug === "aarkid";

  return (
    <section
      className={isAarkid ? styles.heroAarkid : styles.hero}
      aria-label="Case study header"
    >
      {isAarkid && <AarkidHeroScene />}
      <div className={styles.inner}>
        <h1 className={styles.title}>{caseStudy.title}</h1>
        <p className={styles.subtitle}>{caseStudy.subtitle}</p>
        <div className={styles.meta}>
          <span className={styles.role}>{caseStudy.role}</span>
          <span className={styles.sep}>·</span>
          <span className={styles.duration}>{caseStudy.duration}</span>
        </div>
        <CoCreatorChips coCreators={caseStudy.coCreators} variant="byline" />
        <div className={styles.stack}>
          {caseStudy.stack.map((tech) => (
            <Badge key={tech} variant="outline">{tech}</Badge>
          ))}
        </div>
      </div>
    </section>
  );
}
