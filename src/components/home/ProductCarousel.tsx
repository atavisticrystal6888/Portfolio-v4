"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
} from "react";
import type { Project } from "@/types/project";
import { ProductCard } from "@/components/projects/ProductCard";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import styles from "./ProductCarousel.module.css";

// "Has this rendered on the client?" as an external store: false during SSR
// and hydration, true afterwards, with no effect-driven re-render.
const noopSubscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

interface ProductCarouselProps {
  /** Flagship products, already in carousel order. */
  projects: Project[];
  /** Names the carousel for assistive tech. */
  label?: string;
}

/**
 * Horizontal scroll-snap rail of product cards (WAI-ARIA carousel pattern,
 * no auto-rotation). The browser owns the scrolling — wheel, trackpad, touch
 * and the scrollbar all work with JavaScript off — and hydration adds the
 * prev/next buttons, dot indicators, arrow keys and slide announcements.
 * The next card always peeks in from the right edge so the rail never looks
 * like a static row of two.
 */
export function ProductCarousel({
  projects,
  label = "Flagship products",
}: ProductCarouselProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ratios = useRef<Map<number, number>>(new Map());
  const [active, setActive] = useState(0);
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    clientSnapshot,
    serverSnapshot
  );
  const reducedMotion = useReducedMotion();
  const baseId = useId();

  const count = projects.length;
  const last = count - 1;

  // Bind the active slide to the real scroll position: the lowest-index slide
  // that is at least half visible is the one "in hand". Reading the rail
  // rather than a counter means touch, wheel and keyboard all agree.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number((entry.target as HTMLElement).dataset.index);
          ratios.current.set(index, entry.intersectionRatio);
        }
        let next = -1;
        let best = -1;
        let bestRatio = -1;
        for (let i = 0; i < count; i++) {
          const r = ratios.current.get(i) ?? 0;
          if (next === -1 && r >= 0.5) next = i;
          if (r > bestRatio) {
            bestRatio = r;
            best = i;
          }
        }
        setActive(next === -1 ? Math.max(best, 0) : next);
      },
      { root: rail, threshold: [0, 0.5, 1] }
    );

    slideRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [count]);

  const scrollTo = useCallback(
    (index: number) => {
      const rail = railRef.current;
      const clamped = Math.max(0, Math.min(last, index));
      const target = slideRefs.current[clamped];
      if (!rail || !target) return;
      rail.scrollTo({
        left: target.offsetLeft - rail.offsetLeft,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    },
    [last, reducedMotion]
  );

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // Only when the rail itself is focused; links inside keep their keys.
    if (e.target !== e.currentTarget) return;
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        scrollTo(active + 1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        scrollTo(active - 1);
        break;
      case "Home":
        e.preventDefault();
        scrollTo(0);
        break;
      case "End":
        e.preventDefault();
        scrollTo(last);
        break;
    }
  };

  if (count === 0) return null;

  const activeName =
    projects[active]?.productName ?? projects[active]?.name ?? "";

  return (
    <div
      className={cn(styles.carousel, hydrated && styles.hydrated)}
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div
        ref={railRef}
        className={styles.rail}
        role="group"
        aria-label={`${label}. Use the left and right arrow keys to move between them.`}
        aria-live="polite"
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        {projects.map((project, i) => (
          <div
            key={project.slug}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            data-index={i}
            id={`${baseId}-slide-${i}`}
            className={styles.slide}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
          >
            <ProductCard project={project} priority={i === 0} />
          </div>
        ))}
        {/* Lets the last card snap to the start edge like every other. */}
        <div className={styles.tail} aria-hidden="true" />
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.arrow}
          onClick={() => scrollTo(active - 1)}
          disabled={active <= 0}
          aria-label="Previous product"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className={styles.dots} role="group" aria-label="Choose a product">
          {projects.map((project, i) => (
            <button
              key={project.slug}
              type="button"
              className={cn(styles.dot, i === active && styles.dotActive)}
              onClick={() => scrollTo(i)}
              aria-label={`Go to ${project.productName ?? project.name}, ${i + 1} of ${count}`}
              aria-current={i === active ? "true" : undefined}
            />
          ))}
        </div>

        <button
          type="button"
          className={styles.arrow}
          onClick={() => scrollTo(active + 1)}
          disabled={active >= last}
          aria-label="Next product"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>

        <span className={styles.counter} aria-hidden="true">
          {String(active + 1).padStart(2, "0")} /{" "}
          {String(count).padStart(2, "0")}
        </span>
      </div>

      {/* Announced only after hydration, when the index can actually change. */}
      <div className={styles.srOnly} role="status">
        {hydrated ? `Slide ${active + 1} of ${count}: ${activeName}` : ""}
      </div>
    </div>
  );
}
