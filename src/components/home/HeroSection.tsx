import { Button } from "@/components/ui/Button";
import { CONTACT_EMAIL_HREF } from "@/lib/site";
import styles from "./HeroSection.module.css";

export function HeroSection() {
  return (
    <section className={styles.hero} aria-label="Hero">
      <div className={styles.content}>
        <h1 className={styles.name}>Dhruv Singhal</h1>
        {/* Where he actually is, not an availability chip. */}
        <p className={styles.role}>
          Product Manager Intern, Growth &middot; The Sleep Company
        </p>
        <p className={styles.statement}>
          I scope and ship e-commerce and AI products &mdash; turning stakeholder
          input, user research, and product specs into decisions teams can build.
        </p>
        <div className={styles.ctas}>
          <Button href="/projects">See the work</Button>
          <Button href={CONTACT_EMAIL_HREF} variant="secondary" external>
            Email me
          </Button>
        </div>
      </div>
    </section>
  );
}
