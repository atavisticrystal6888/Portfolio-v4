"use client";

import { useState } from "react";
import type { Project } from "@/types/project";
import { FilterBar } from "@/components/projects/FilterBar";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { MasonryGrid } from "@/components/projects/MasonryGrid";
import styles from "./ProjectGrid.module.css";

type LayoutMode = "masonry" | "grid";

interface ProjectGridProps {
  projects: Project[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  const [filtered, setFiltered] = useState(projects);
  const [layout, setLayout] = useState<LayoutMode>(() => {
    if (typeof window === "undefined") return "masonry";
    const saved = localStorage.getItem("project-layout") as LayoutMode | null;
    return saved === "grid" || saved === "masonry" ? saved : "masonry";
  });

  const handleLayout = (mode: LayoutMode) => {
    setLayout(mode);
    localStorage.setItem("project-layout", mode);
  };

  const featured = filtered.filter((p) => p.featured);
  const more = filtered.filter((p) => !p.featured);
  const showSections = featured.length > 0 && more.length > 0;

  const renderGroup = (list: Project[]) =>
    layout === "masonry" ? (
      <MasonryGrid projects={list} />
    ) : (
      <div className={styles.grid}>
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
            className={`${styles.layoutBtn} ${layout === "masonry" ? styles.layoutActive : ""}`}
            onClick={() => handleLayout("masonry")}
            aria-pressed={layout === "masonry"}
            title="Masonry view"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="2" y="2" width="8" height="12" rx="1" />
              <rect x="14" y="2" width="8" height="8" rx="1" />
              <rect x="2" y="18" width="8" height="4" rx="1" />
              <rect x="14" y="14" width="8" height="8" rx="1" />
            </svg>
          </button>
          <button
            className={`${styles.layoutBtn} ${layout === "grid" ? styles.layoutActive : ""}`}
            onClick={() => handleLayout("grid")}
            aria-pressed={layout === "grid"}
            title="Grid view"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="2" y="2" width="8" height="8" rx="1" />
              <rect x="14" y="2" width="8" height="8" rx="1" />
              <rect x="2" y="14" width="8" height="8" rx="1" />
              <rect x="14" y="14" width="8" height="8" rx="1" />
            </svg>
          </button>
        </div>
      </div>

      {showSections ? (
        <>
          <h2 className={styles.sectionHeading}>Featured</h2>
          {renderGroup(featured)}
          <h2 className={styles.sectionHeading}>More Projects</h2>
          {renderGroup(more)}
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
