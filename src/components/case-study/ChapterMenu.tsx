"use client";

import { useRef, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { jumpToHeading, useChapters } from "./ChapterRail";
import styles from "./ChapterMenu.module.css";

interface ChapterMenuProps {
  className?: string;
  /** Summary text; matches the wide-screen rail's heading. */
  label?: string;
}

/**
 * Narrow-screen counterpart of ChapterRail: a native disclosure at the top of
 * the article listing the same chapters. <details> gives keyboard and screen
 * reader behaviour for free; picking a chapter closes it and moves focus to
 * that heading. Hidden from 1200px, where the rail takes over.
 *
 * The shell renders on the server so the summary never pops in; the list
 * fills in once the article's headings (and their ids) exist.
 */
export function ChapterMenu({ className, label = "Chapters" }: ChapterMenuProps) {
  const { chapters, activeId, setActiveId, ready } = useChapters();
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const details = detailsRef.current;
    if (details) details.open = false;
    if (!jumpToHeading(id)) return;
    event.preventDefault();
    setActiveId(id);
  };

  return (
    <details
      ref={detailsRef}
      className={cn(styles.menu, className)}
      data-testid="chapters-menu"
      hidden={ready && chapters.length < 2 ? true : undefined}
    >
      <summary className={styles.summary}>
        <span className={styles.label}>{label}</span>
        {chapters.length > 0 && (
          <span className={styles.count}>{chapters.length}</span>
        )}
        <span className={styles.chevron} aria-hidden="true" />
      </summary>
      <nav aria-label={label} className={styles.panel}>
        <ol className={styles.list}>
          {chapters.map((chapter, i) => {
            const active = chapter.id === activeId;
            return (
              <li key={chapter.id}>
                <a
                  href={`#${chapter.id}`}
                  className={cn(styles.link, active && styles.active)}
                  aria-current={active ? "location" : undefined}
                  onClick={(event) => handleClick(event, chapter.id)}
                >
                  <span className={styles.index} aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.text}>{chapter.text}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </details>
  );
}
