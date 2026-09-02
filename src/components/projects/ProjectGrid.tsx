"use client";

import { useState, useSyncExternalStore } from "react";
import type { Project } from "@/types/project";
import { FilterBar } from "@/components/projects/FilterBar";
import { ProductCard } from "@/components/projects/ProductCard";
import { CompactRow } from "@/components/projects/CompactRow";
import { cn } from "@/lib/utils";
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

/** Flagships get the product card; everything else is a compact index row. */
function isFlagship(p: Project): boolean {
  return p.tier ? p.tier === "flagship" : p.featured;
}

interface ProjectGridProps {
  projects: Project[];
}

/**
 * Featured = the flagship product cards in a grid (two across from 960px,
 * three in the dense view). More work = compact rows, no imagery. The
 * category filter applies to both; headings appear only when both groups
 * have something to show.
 */
export function ProjectGrid({ projects }: ProjectGridProps) {
  const [filtered, setFiltered] = useState(projects);
  const layout = useSyncExternalStore(subscribe, readLayout, serverLayout);

  const flagships = filtered.filter(isFlagship);
  const compact = filtered.filter((p) => !isFlagship(p));
  const showHeadings = flagships.length > 0 && compact.length > 0;
  const dense = layout === "dense";

  return (
    <div>
      <div className={styles.controls}>
        <FilterBar projects={projects} onFilter={setFiltered} />
        <div className={styles.layoutToggle} role="group" aria-label="Layout view">
          <button
            className={cn(styles.layoutBtn, !dense && styles.layoutActive)}
            onClick={() => writeLayout("rows")}
            aria-pressed={!dense}
            title="Row view"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="2" y="3" width="20" height="5" />
              <rect x="2" y="12" width="20" height="5" />
              <line x1="2" y1="21" x2="22" y2="21" />
            </svg>
          </button>
          <button
            className={cn(styles.layoutBtn, dense && styles.layoutActive)}
            onClick={() => writeLayout("dense")}
            aria-pressed={dense}
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

      {flagships.length > 0 && (
        <>
          {showHeadings && <h2 className={styles.sectionHeading}>Featured</h2>}
          <div className={cn(styles.featured, dense && styles.featuredDense)}>
            {flagships.map((p, i) => (
              <ProductCard
                key={p.slug}
                project={p}
                priority={i < 2}
                sizes={
                  dense
                    ? "(max-width: 960px) 100vw, 360px"
                    : "(max-width: 960px) 100vw, 540px"
                }
              />
            ))}
          </div>
        </>
      )}

      {compact.length > 0 && (
        <>
          {showHeadings && <h2 className={styles.sectionHeading}>More work</h2>}
          <div className={cn(styles.rows, dense && styles.rowsDense)}>
            {compact.map((p) => (
              <CompactRow key={p.slug} project={p} />
            ))}
          </div>
        </>
      )}

      {filtered.length === 0 && (
        <p className={styles.empty}>No projects match this filter.</p>
      )}
    </div>
  );
}
