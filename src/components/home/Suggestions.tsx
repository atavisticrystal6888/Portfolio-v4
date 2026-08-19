"use client";

import { useMemo } from "react";
import { useBehavior } from "@/hooks/useBehavior";
import { scoreSuggestions } from "@/lib/suggestions";
import { formatCategoryLabel } from "@/lib/utils";
import { ListRow, ListRows } from "@/components/ui/ListRow";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { Project } from "@/types/project";
import type { BlogArticle } from "@/types/blog";
import styles from "./Suggestions.module.css";

interface SuggestionsProps {
  projects: Project[];
  posts: BlogArticle[];
}

export function Suggestions({ projects, posts }: SuggestionsProps) {
  const { behavior } = useBehavior();

  const suggestions = useMemo(
    () => scoreSuggestions(projects, posts, behavior),
    [projects, posts, behavior]
  );

  if (suggestions.length === 0) return null;

  return (
    <section
      aria-label="Recommended for you"
      data-section="suggestions"
      className={styles.section}
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <SectionLabel index="05">Recommended for you</SectionLabel>
          <h2 className={styles.heading}>Where to go next</h2>
        </header>
        <ListRows>
          {suggestions.map((item) => (
            <ListRow
              key={item.slug}
              href={item.href}
              title={item.title}
              dek={item.description}
              rail={formatCategoryLabel(item.category)}
            />
          ))}
        </ListRows>
      </div>
    </section>
  );
}
