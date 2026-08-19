"use client";

import { useMemo, useState } from "react";
import type { LabIdea } from "@/types/lab";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { cn } from "@/lib/utils";
import page from "@/styles/content-page.module.css";
import styles from "./LabMatrix.module.css";

const ALL = "All";

function difficultyWeight(d: string): number {
  if (d === "Expert") return 3;
  if (d === "Hard") return 2;
  return 1;
}

interface LabMatrixProps {
  ideas: LabIdea[];
}

export function LabMatrix({ ideas }: LabMatrixProps) {
  const [active, setActive] = useState(ALL);

  const categories = useMemo(
    () => Array.from(new Set(ideas.map((i) => i.category))).sort(),
    [ideas]
  );

  const sorted = useMemo(
    () =>
      [...ideas].sort(
        (a, b) => difficultyWeight(b.difficulty) - difficultyWeight(a.difficulty)
      ),
    [ideas]
  );

  const visible =
    active === ALL ? sorted : sorted.filter((i) => i.category === active);

  const filters = [
    { label: ALL, count: ideas.length },
    ...categories.map((cat) => ({
      label: cat,
      count: ideas.filter((i) => i.category === cat).length,
    })),
  ];

  return (
    <>
      <div className={page.section}>
        <SectionLabel>Categories</SectionLabel>
        <h2 className={cn(page.sectionTitle, styles.tightHeading)}>By domain</h2>
        <p className={styles.hint}>
          Pick a domain to filter the matrix below.
        </p>
        <div
          className={page.cardGrid}
          role="group"
          aria-label="Filter ideas by domain"
        >
          {filters.map((f) => {
            const isActive = active === f.label;
            return (
              <button
                key={f.label}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActive(f.label)}
                className={cn(page.card, styles.filter, isActive && styles.filterActive)}
              >
                <h3>{f.label}</h3>
                <p>
                  {f.count} idea{f.count === 1 ? "" : "s"}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className={page.section}>
        <SectionLabel>
          {active === ALL ? "All ideas" : `${active} ideas`}
        </SectionLabel>
        <h2 className={cn(page.sectionTitle, styles.tightHeading)}>
          The matrix - sorted by difficulty
        </h2>
        <p
          className={styles.count}
          role="status"
          aria-live="polite"
          aria-label="Matrix filter result count"
        >
          Showing {visible.length} of {ideas.length} ideas
          {active === ALL ? "" : ` in ${active}`}.
        </p>
        <div className={page.cardGrid}>
          {visible.map((idea) => (
            <div key={idea.id} className={page.card}>
              <h3>
                {idea.name}
                <span className={page.badge}>{idea.difficulty}</span>
              </h3>
              <p>{idea.problem}</p>
              <span className={page.meta}>
                {idea.category} · {idea.pmSkill}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
