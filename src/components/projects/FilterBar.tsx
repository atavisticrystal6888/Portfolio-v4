"use client";

import { useState } from "react";
import type { Project } from "@/types/project";
import { cn } from "@/lib/utils";
import styles from "./FilterBar.module.css";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "product", label: "Product" },
  { value: "data", label: "Data" },
  { value: "ai", label: "AI" },
  { value: "technical", label: "Technical" },
];

interface FilterBarProps {
  projects: Project[];
  onFilter: (filtered: Project[]) => void;
}

function filterProjects(projects: Project[], value: string): Project[] {
  return value === "all" ? projects : projects.filter((p) => p.category === value);
}

/**
 * Single-select category filter built from toggle buttons (aria-pressed), not
 * tabs: there is no tabpanel and no arrow-key roving focus, so each chip is a
 * plain Tab stop. The visually hidden status line tells screen-reader users
 * how many projects the list now shows after each change.
 */
export function FilterBar({ projects, onFilter }: FilterBarProps) {
  const [active, setActive] = useState("all");
  const count = filterProjects(projects, active).length;

  function handleFilter(value: string) {
    setActive(value);
    onFilter(filterProjects(projects, value));
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.bar} role="group" aria-label="Filter projects">
        {CATEGORIES.map((cat) => {
          const isActive = active === cat.value;
          return (
            <button
              key={cat.value}
              type="button"
              aria-pressed={isActive}
              className={cn(styles.pill, isActive && styles.active)}
              onClick={() => handleFilter(cat.value)}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
      <p className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">
        {count === 1 ? "1 project shown" : `${count} projects shown`}
      </p>
    </div>
  );
}
