"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useBehavior } from "@/hooks/useBehavior";
import { scoreSuggestions } from "@/lib/suggestions";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
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
    <section aria-label="Recommended for you" className={styles.wrapper}>
      <SectionLabel>Recommended For You</SectionLabel>
      <div className={styles.grid}>
        {suggestions.map((item) => (
          <GlassCard key={item.slug} as="article" hover className={styles.card}>
            <Badge variant="accent">{item.category}</Badge>
            <h3 className={styles.title}>
              <Link href={item.href}>{item.title}</Link>
            </h3>
            <p className={styles.desc}>{item.description}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
