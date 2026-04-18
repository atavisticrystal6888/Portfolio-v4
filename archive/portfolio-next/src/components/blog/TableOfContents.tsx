"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./TableOfContents.module.css";
import { cn } from "@/lib/utils";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const els = document.querySelectorAll("article h2, article h3");
    const items: TOCItem[] = Array.from(els).map((el) => {
      if (!el.id) {
        el.id = el.textContent?.toLowerCase().replace(/[^\w]+/g, "-") || "";
      }
      return {
        id: el.id,
        text: el.textContent || "",
        level: el.tagName === "H2" ? 2 : 3,
      };
    });
    requestAnimationFrame(() => setHeadings(items));

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );

    els.forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav className={styles.toc} aria-label="Table of contents">
      <h4 className={styles.title}>On this page</h4>
      <ul className={styles.list}>
        {headings.map((h) => (
          <li key={h.id} className={cn(styles.item, h.level === 3 && styles.nested)}>
            <a
              href={`#${h.id}`}
              className={cn(styles.link, activeId === h.id && styles.active)}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
