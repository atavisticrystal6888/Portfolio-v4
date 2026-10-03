"use client";

import { useEffect, useRef } from "react";
import styles from "./ScrollProgress.module.css";

/**
 * Page scroll progress bar. No React state: it used to call setState on every
 * scroll event (a re-render per event) and animate `width` (layout + paint).
 *
 * - Browsers with CSS scroll-driven animations (Chromium, Safari 26+) run it
 *   entirely in CSS on the compositor: see `animation-timeline` in the module.
 * - Everywhere else (Firefox today) a passive scroll listener schedules at most
 *   one requestAnimationFrame per frame and writes `transform: scaleX()`
 *   straight to the element through a ref.
 */
export function ScrollProgress() {
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = fillRef.current;
    if (!el) return;
    if (typeof CSS !== "undefined" && CSS.supports?.("animation-timeline: scroll()")) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const p = docHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / docHeight)) : 0;
      el.style.transform = `scaleX(${p})`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    // Decorative: the native scrollbar already reports position, and as a
    // role="progressbar" it sat outside every landmark on every route (axe
    // "region"). Hidden from assistive tech, so no role or value attributes.
    <div className={styles.bar} aria-hidden="true">
      <div ref={fillRef} className={styles.fill} />
    </div>
  );
}
