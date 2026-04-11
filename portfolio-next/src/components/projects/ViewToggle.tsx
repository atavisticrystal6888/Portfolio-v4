"use client";

import { useState, useEffect } from "react";
import type { Project } from "@/types/project";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { ComparisonTable } from "@/components/projects/ComparisonTable";
import styles from "./ViewToggle.module.css";

const STORAGE_KEY = "ds-projects-view";

type ViewMode = "grid" | "table";

interface ProjectsViewProps {
  projects: Project[];
}

export function ProjectsView({ projects }: ProjectsViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ViewMode | null;
    if (saved === "grid" || saved === "table") setViewMode(saved);
  }, []);

  const toggle = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  };

  return (
    <>
      <div className={styles.toggleBar}>
        <button
          className={`${styles.toggleBtn} ${viewMode === "grid" ? styles.active : ""}`}
          onClick={() => toggle("grid")}
          aria-pressed={viewMode === "grid"}
          aria-label="Grid view"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
          </svg>
        </button>
        <button
          className={`${styles.toggleBtn} ${viewMode === "table" ? styles.active : ""}`}
          onClick={() => toggle("table")}
          aria-pressed={viewMode === "table"}
          aria-label="Table view"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </button>
      </div>

      {viewMode === "grid" ? (
        <ProjectGrid projects={projects} />
      ) : (
        <ComparisonTable projects={projects} />
      )}
    </>
  );
}
