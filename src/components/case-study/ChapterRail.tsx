"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { cn, slugify } from "@/lib/utils";
import styles from "./ChapterRail.module.css";

interface Chapter {
  id: string;
  text: string;
}

interface ChapterRailProps {
  className?: string;
  /** Rail heading; mirrors the home page's "Contents". */
  label?: string;
}

const SKIP = '[data-rail="skip"]';

function collectChapters(): { chapters: Chapter[]; elements: HTMLElement[] } {
  const nodes = Array.from(document.querySelectorAll<HTMLElement>("article h2"));
  const elements = nodes.filter((el) => !el.closest(SKIP));
  const seen = new Set<string>();

  const chapters = elements.map((el) => {
    if (!el.id) {
      const base = slugify(el.textContent ?? "") || "section";
      let id = base;
      let n = 2;
      while (seen.has(id) || document.getElementById(id)) {
        id = `${base}-${n++}`;
      }
      el.id = id;
    }
    seen.add(el.id);
    return { id: el.id, text: el.textContent?.trim() ?? "" };
  });

  return { chapters, elements };
}

/**
 * Sticky chapter list beside the article on wide screens. It reads the h2s
 * out of the rendered article after mount (so it works whatever renders the
 * body), numbers them the way the home Contents index numbers its sections,
 * and follows the reader with an IntersectionObserver.
 */
export function ChapterRail({ className, label = "Chapters" }: ChapterRailProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeId, setActiveId] = useState("");
  const railRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let mutations: MutationObserver | null = null;
    let frame = 0;

    const wire = (elements: HTMLElement[]) => {
      observer?.disconnect();
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) setActiveId(entry.target.id);
          }
        },
        // A heading counts as current when it enters the top 40% of the viewport.
        { rootMargin: "-80px 0px -60% 0px" }
      );
      elements.forEach((el) => observer?.observe(el));
    };

    const run = () => {
      const { chapters: found, elements } = collectChapters();
      setChapters(found);
      if (found.length > 0) {
        wire(elements);
        mutations?.disconnect();
        mutations = null;
      }
      return found.length > 0;
    };

    if (!run()) {
      // The body may still be streaming in; look again when the article changes.
      const article = document.querySelector("article");
      if (article) {
        mutations = new MutationObserver(() => {
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(() => {
            run();
          });
        });
        mutations.observe(article, { childList: true, subtree: true });
      }
    }

    return () => {
      observer?.disconnect();
      mutations?.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  /*
   * Sticky fallback. If body ever becomes a scroll container again (any
   * overflow other than `visible` or `clip`), `position: sticky` inside it
   * silently does nothing, so the rail follows the reader with a clamped
   * translateY along its grid row. base.css now uses `overflow-x: clip` on
   * body, which is not a scroll container, so in the normal case this effect
   * does nothing and native sticky takes over.
   */
  useEffect(() => {
    const rail = railRef.current;
    const row = rail?.parentElement;
    if (!rail || !row) return;

    const bodyStyle = getComputedStyle(document.body);
    const isScrollContainer = (v: string) => v !== "visible" && v !== "clip";
    const stickyBroken =
      isScrollContainer(bodyStyle.overflowX) ||
      isScrollContainer(bodyStyle.overflowY);
    if (!stickyBroken) return;

    const wide = window.matchMedia("(min-width: 1200px)");
    let frame = 0;

    const update = () => {
      frame = 0;
      if (!wide.matches) {
        rail.style.transform = "";
        return;
      }
      const stickyTop = parseFloat(getComputedStyle(rail).top) || 0;
      const rowRect = row.getBoundingClientRect();
      const travel = Math.max(0, rowRect.height - rail.offsetHeight);
      const shift = Math.min(Math.max(0, stickyTop - rowRect.top), travel);
      rail.style.transform = shift > 0 ? `translateY(${Math.round(shift)}px)` : "";
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
      rail.style.transform = "";
    };
  }, [chapters.length]);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
    setActiveId(id);
  };

  if (chapters.length < 2) return null;

  return (
    <nav ref={railRef} className={cn(styles.rail, className)} aria-label={label}>
      <p className={styles.heading}>{label}</p>
      <ol className={styles.list}>
        {chapters.map((chapter, i) => {
          const active = chapter.id === activeId;
          return (
            <li key={chapter.id}>
              <a
                href={`#${chapter.id}`}
                className={cn(styles.link, active && styles.active)}
                aria-current={active ? "true" : undefined}
                onClick={(event) => handleClick(event, chapter.id)}
              >
                <span className={styles.label}>{chapter.text}</span>
                <span className={styles.leader} aria-hidden="true" />
                <span className={styles.index}>
                  {String(i + 1).padStart(2, "0")}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
