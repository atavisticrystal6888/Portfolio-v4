"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import styles from "./HeroSection.module.css";

const ROLES = [
  "Product Analyst",
  "Data-Driven Builder",
  "Technical PM",
  "Analytics Engineer",
];

export function HeroSection() {
  return (
    <section className={styles.hero} aria-label="Hero">
      <div className={styles.content}>
        <Badge variant="accent">Open to Opportunities</Badge>
        <h1 className={styles.name}>
          Dhruv <span className="text-gradient">Singhal</span>
        </h1>
        <p className={styles.role}>{ROLES[0]}</p>
        <p className={styles.statement}>
          I turn ambiguous problems into structured execution — blending
          product thinking with data-driven decision-making.
        </p>
        <div className={styles.ctas}>
          <Button href="/projects" data-magnetic>Explore Work</Button>
          <Button href="/contact" variant="secondary" data-magnetic>Get in Touch</Button>
        </div>
        <div className={styles.scroll} aria-hidden="true">
          <div className={styles.scrollMouse}>
            <div className={styles.scrollDot} />
          </div>
        </div>
      </div>
    </section>
  );
}
