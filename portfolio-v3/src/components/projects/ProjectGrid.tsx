"use client";

import { useState } from "react";
import type { Project } from "@/types/project";
import { FilterBar } from "@/components/projects/FilterBar";
import { ProjectCard } from "@/components/projects/ProjectCard";
import styles from "./ProjectGrid.module.css";

interface ProjectGridProps {
  projects: Project[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  const [filtered, setFiltered] = useState(projects);

  return (
    <div>
      <FilterBar projects={projects} onFilter={setFiltered} />
      <div className={styles.grid}>
        {filtered.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className={styles.empty}>No projects match this filter.</p>
      )}
    </div>
  );
}
