"use client";

import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import styles from "./HeroSection.module.css";

const ROLES = [
  "Product Analyst",
  "Data-Driven Builder",
  "Technical PM",
  "Analytics Engineer",
];

const REFERRER_SUBTITLES: Record<string, string> = {
  linkedin: "Welcome from LinkedIn — see my product impact",
  github: "Welcome, fellow builder — explore the code behind the portfolio",
  twitter: "Welcome from X — here's what I've been shipping",
  x: "Welcome from X — here's what I've been shipping",
};

function getPersonalizedSubtitle(): string | null {
  if (typeof window === "undefined") return null;

  // Check UTM param first
  try {
    const params = new URLSearchParams(window.location.search);
    const source = params.get("utm_source")?.toLowerCase();
    if (source && REFERRER_SUBTITLES[source]) return REFERRER_SUBTITLES[source]!;
  } catch { /* ignore */ }

  // Fallback to document.referrer
  try {
    const ref = document.referrer.toLowerCase();
    for (const [key, value] of Object.entries(REFERRER_SUBTITLES)) {
      if (ref.includes(key)) return value;
    }
  } catch { /* ignore */ }

  return null;
}

export function HeroSection() {
  // useSearchParams triggers Suspense boundary for SSG compatibility
  useSearchParams();
  const personalized = getPersonalizedSubtitle();

  return (
    <section className={styles.hero} aria-label="Hero">
      <div className={styles.content}>
        <Badge variant="accent">Open to Opportunities</Badge>
        <h1 className={styles.name}>
          Dhruv <span className="text-gradient">Singhal</span>
        </h1>
        <p className={styles.role}>{ROLES[0]}</p>
        <p className={styles.statement}>
          {personalized ||
            "I turn ambiguous problems into structured execution — blending product thinking with data-driven decision-making."}
        </p>
        <div className={styles.ctas}>
          <Button href="/projects">Explore Work</Button>
          <Button href="/contact" variant="secondary">Get in Touch</Button>
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
