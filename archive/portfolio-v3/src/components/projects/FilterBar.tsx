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

export function FilterBar({ projects, onFilter }: FilterBarProps) {
  const [active, setActive] = useState("all");

  function handleFilter(value: string) {
    setActive(value);
    if (value === "all") {
      onFilter(projects);
    } else {
      onFilter(projects.filter((p) => p.category === value));
    }
  }

  return (
    <div className={styles.bar} role="tablist" aria-label="Filter projects by category">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          role="tab"
          aria-selected={active === cat.value}
          className={cn(styles.pill, active === cat.value && styles.active)}
          onClick={() => handleFilter(cat.value)}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
