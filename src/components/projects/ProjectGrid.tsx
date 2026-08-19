"use client";

import { useEffect, useState } from "react";
import type { Project } from "@/types/project";
import { FilterBar } from "@/components/projects/FilterBar";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { MasonryGrid } from "@/components/projects/MasonryGrid";
import styles from "./ProjectGrid.module.css";

type LayoutMode = "rows" | "dense";

const LAYOUT_KEY = "project-layout";

interface ProjectGridProps {
  projects: Project[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  const [filtered, setFiltered] = useState(projects);
  // Read after mount: reading localStorage in the initialiser makes the first
  // client render disagree with the server one.
  const [layout, setLayout] = useState<LayoutMode>("rows");

  useEffect(() => {
    const saved = localStorage.getItem(LAYOUT_KEY);
    // "masonry" is the pre-revamp value for the dense view.
    if (saved === "dense" || saved === "masonry") setLayout("dense");
  }, []);

  const handleLayout = (mode: LayoutMode) => {
    setLayout(mode);
    localStorage.setItem(LAYOUT_KEY, mode);
  };

  const featured = filtered.filter((p) => p.featured);
  const more = filtered.filter((p) => !p.featured);
  const showSections = featured.length > 0 && more.length > 0;

  const renderGroup = (list: Project[], compact = false) =>
    layout === "dense" ? (
      <MasonryGrid projects={list} compact={compact} />
    ) : (
      <div className={styles.rows}>
        {list.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
    );

  return (
    <div>
      <div className={styles.controls}>
        <FilterBar projects={projects} onFilter={setFiltered} />
        <div className={styles.layoutToggle} role="group" aria-label="Layout view">
          <button
            className={`${styles.layoutBtn} ${layout === "rows" ? styles.layoutActive : ""}`}
            onClick={() => handleLayout("rows")}
            aria-pressed={layout === "rows"}
            title="Row view"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="2" y="3" width="20" height="5" />
              <rect x="2" y="12" width="20" height="5" />
              <line x1="2" y1="21" x2="22" y2="21" />
            </svg>
          </button>
          <button
            className={`${styles.layoutBtn} ${layout === "dense" ? styles.layoutActive : ""}`}
            onClick={() => handleLayout("dense")}
            aria-pressed={layout === "dense"}
            title="Dense view"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="2" y="2" width="8" height="12" rx="1" />
              <rect x="14" y="2" width="8" height="8" rx="1" />
              <rect x="2" y="18" width="8" height="4" rx="1" />
              <rect x="14" y="14" width="8" height="8" rx="1" />
            </svg>
          </button>
        </div>
      </div>

      {showSections ? (
        <>
          <h2 className={styles.sectionHeading}>Featured</h2>
          {renderGroup(featured)}
          <h2 className={styles.sectionHeading}>More work</h2>
          {renderGroup(more, true)}
        </>
      ) : (
        renderGroup(filtered)
      )}
      {filtered.length === 0 && (
        <p className={styles.empty}>No projects match this filter.</p>
      )}
    </div>
  );
}
