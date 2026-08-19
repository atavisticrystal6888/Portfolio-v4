"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useBehavior } from "@/hooks/useBehavior";
import { scoreSuggestions } from "@/lib/suggestions";
import { formatCategoryLabel } from "@/lib/utils";
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
        <ul className={styles.list}>
          {suggestions.map((item) => (
            <li key={item.slug} className={styles.item}>
              <Link href={item.href} className={styles.row}>
                <div className={styles.rail}>{formatCategoryLabel(item.category)}</div>
                <div className={styles.body}>
                  <h3 className={styles.title}>{item.title}</h3>
                  <p className={styles.desc}>{item.description}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
