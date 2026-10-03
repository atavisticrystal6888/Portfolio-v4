"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { jumpToHeading } from "@/components/case-study/ChapterRail";
import { cn } from "@/lib/utils";
import styles from "./TableOfContents.module.css";

export interface TOCItem {
  id: string;
  text: string;
  level: 2 | 3;
}

interface TableOfContentsProps {
  /**
   * Headings computed on the server from the rendered article (ids included),
   * so the list is in the first paint and nothing mutates the DOM on mount.
   */
  items: TOCItem[];
  /**
   * "aside" = sticky list beside the article from 1200px (hidden below);
   * "inline" = an "On this page" disclosure above the article below 1200px.
   */
  variant?: "aside" | "inline";
  className?: string;
}

/** Follows the reader: the last heading to enter the top 40% is current. */
function useActiveHeading(ids: string[]) {
  const [activeId, setActiveId] = useState("");
  const key = ids.join("|");

  useEffect(() => {
    const els = key
      .split("|")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [key]);

  return [activeId, setActiveId] as const;
}

export function TableOfContents({ items, variant = "aside", className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useActiveHeading(items.map((i) => i.id));
  const detailsRef = useRef<HTMLDetailsElement>(null);

  if (items.length === 0) return null;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (detailsRef.current) detailsRef.current.open = false;
    if (!jumpToHeading(id)) return;
    event.preventDefault();
    setActiveId(id);
  };

  const list = (
    <ol className={styles.list}>
      {items.map((h) => {
        const active = activeId === h.id;
        return (
          <li key={h.id} className={cn(styles.item, h.level === 3 && styles.nested)}>
            <a
              href={`#${h.id}`}
              className={cn(styles.link, active && styles.active)}
              aria-current={active ? "location" : undefined}
              onClick={(event) => handleClick(event, h.id)}
            >
              {h.text}
            </a>
          </li>
        );
      })}
    </ol>
  );

  if (variant === "inline") {
    return (
      <details ref={detailsRef} className={cn(styles.inline, className)} data-testid="toc-menu">
        <summary className={styles.summary}>
          <span className={styles.summaryLabel}>On this page</span>
          {/* Counts the sections (h2). The hidden words keep the accessible
              name readable: "On this page, 7 sections", not "On this page7". */}
          <span className={styles.count}>
            <span className={styles.srOnly}>, </span>
            {items.filter((i) => i.level === 2).length}
            <span className={styles.srOnly}> sections</span>
          </span>
          <span className={styles.chevron} aria-hidden="true" />
        </summary>
        <nav aria-label="On this page" className={styles.panel}>
          {list}
        </nav>
      </details>
    );
  }

  return (
    <nav className={cn(styles.toc, className)} aria-label="Table of contents" data-testid="toc-aside">
      <p className={styles.title}>On this page</p>
      {list}
    </nav>
  );
}
