"use client";

import { useState, useSyncExternalStore } from "react";
import type { Project } from "@/types/project";
import { FilterBar } from "@/components/projects/FilterBar";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { MasonryGrid } from "@/components/projects/MasonryGrid";
import styles from "./ProjectGrid.module.css";

type LayoutMode = "rows" | "dense";

const LAYOUT_KEY = "project-layout";

// localStorage read through useSyncExternalStore rather than a state
// initialiser: the initialiser runs during hydration, so a stored non-default
// made the first client render disagree with the server's.
const listeners = new Set<() => void>();

function readLayout(): LayoutMode {
  const saved = localStorage.getItem(LAYOUT_KEY);
  // "masonry" is the pre-revamp value for the dense view.
  return saved === "dense" || saved === "masonry" ? "dense" : "rows";
}

function serverLayout(): LayoutMode {
  return "rows";
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function writeLayout(mode: LayoutMode) {
  localStorage.setItem(LAYOUT_KEY, mode);
  listeners.forEach((l) => l());
}

interface ProjectGridProps {
  projects: Project[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  const [filtered, setFiltered] = useState(projects);
  const layout = useSyncExternalStore(subscribe, readLayout, serverLayout);

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
            onClick={() => writeLayout("rows")}
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
            onClick={() => writeLayout("dense")}
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
