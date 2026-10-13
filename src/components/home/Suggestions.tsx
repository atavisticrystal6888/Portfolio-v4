"use client";

import { useMemo } from "react";
import { useBehavior } from "@/hooks/useBehavior";
import { scoreSuggestions } from "@/lib/suggestions";
import { formatCategoryLabel } from "@/lib/utils";
import { ListRow, ListRows } from "@/components/ui/ListRow";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { Project } from "@/types/project";
import type { BlogSummary } from "@/lib/blog-summary";
import { shownOnHome } from "./selection";
import section from "@/styles/section.module.css";

interface SuggestionsProps {
  projects: Project[];
  posts: BlogSummary[];
}

export function Suggestions({ projects, posts }: SuggestionsProps) {
  const { behavior } = useBehavior();

  // Everything already listed under Selected work stays out of "Where to go
  // next", as do card-only projects with no page to go to.
  const candidates = useMemo(() => {
    const shown = shownOnHome(projects);
    return projects.filter(
      (p) => !shown.has(p.slug) && p.hasCaseStudy !== false
    );
  }, [projects]);

  const suggestions = useMemo(
    () => scoreSuggestions(candidates, posts, behavior),
    [candidates, posts, behavior]
  );

  if (suggestions.length === 0) return null;

  return (
    <section
      id="next"
      aria-label="Where to go next"
      data-section="suggestions"
      className={section.section}
    >
      <div className={section.inner}>
        <header className={section.header}>
          <SectionLabel index="04">Where next</SectionLabel>
          <h2 className={section.title}>Where to go next</h2>
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
