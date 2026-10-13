"use client";

import { useMemo, useState } from "react";
import type { LabIdea } from "@/types/lab";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { cn } from "@/lib/utils";
import page from "@/app/lab/lab.module.css";
import section from "@/styles/section.module.css";
import { Surface, SurfaceText, SurfaceTitle } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { FilterChip, FilterChipGroup } from "@/components/ui/FilterChip";
import styles from "./LabMatrix.module.css";

const ALL = "All";

/* Easy < Medium < Hard < Expert. Easy and Medium used to share a weight, so
   the "sorted by difficulty" heading was false: Easy ideas sat between
   Medium ones. */
const DIFFICULTY_WEIGHT: Record<string, number> = { Easy: 0, Medium: 1, Hard: 2, Expert: 3 };

function difficultyWeight(d: string): number {
  return DIFFICULTY_WEIGHT[d] ?? 1;
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
      {/* The ruled section wrapper lives in page.tsx; this renders the
          section's header, chip filters, and the matrix itself. */}
      <div>
        <SectionLabel index="01">
          {active === ALL ? "All ideas" : `${active} ideas`}
        </SectionLabel>
        <h2 className={cn(section.title, styles.tightHeading)}>
          The matrix, sorted by difficulty (hardest first)
        </h2>

        {/* A chip row, not a grid of count tiles. With twelve categories for
            twelve ideas the grid was eleven cards reading "1 idea". */}
        <FilterChipGroup label="Filter ideas by domain" className={styles.filters}>
          {filters.map((f) => (
            <FilterChip
              key={f.label}
              active={active === f.label}
              onClick={() => setActive(f.label)}
              count={f.count}
            >
              {f.label}
            </FilterChip>
          ))}
        </FilterChipGroup>

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
            <Surface key={idea.id} hover>
              {/* Title and difficulty each get a fixed home: the chip used to
                  sit inline after the title and wrapped mid-name on long ones. */}
              <SurfaceTitle className={styles.cardHead}>
                <span className={styles.cardName}>{idea.name}</span>
                <Badge data-testid="lab-difficulty">{idea.difficulty}</Badge>
              </SurfaceTitle>
              <SurfaceText>{idea.problem}</SurfaceText>
              {/* One quiet line, in sentence case. The all-caps mono rail used
                  to carry the category plus a comma list of PM skills, which
                  read as five tags per card. */}
              <span className={styles.skill}>{idea.pmSkill}</span>
            </Surface>
          ))}
        </div>
      </div>
    </>
  );
}
