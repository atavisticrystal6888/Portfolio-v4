"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const THRESHOLDS = [25, 50, 75, 100] as const;
const SESSION_PREFIX = "ds-scroll-depth-";

export function useScrollDepth() {
  const pathname = usePathname();
  const sentinelsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const key = `${SESSION_PREFIX}${pathname}`;
    const fired: Set<number> = new Set(
      JSON.parse(sessionStorage.getItem(key) || "[]")
    );

    // Create sentinel elements at 25/50/75/100% positions
    const sentinels: HTMLDivElement[] = [];
    const docHeight = document.documentElement.scrollHeight;

    for (const t of THRESHOLDS) {
      const el = document.createElement("div");
      el.style.position = "absolute";
      el.style.top = `${(t / 100) * docHeight}px`;
      el.style.width = "1px";
      el.style.height = "1px";
      el.style.pointerEvents = "none";
      el.setAttribute("aria-hidden", "true");
      document.body.appendChild(el);
      sentinels.push(el);
    }
    sentinelsRef.current = sentinels;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const idx = sentinels.indexOf(entry.target as HTMLDivElement);
          if (idx === -1 || idx >= THRESHOLDS.length) continue;
          const depth = THRESHOLDS[idx]!;
          if (fired.has(depth)) continue;

          fired.add(depth);
          sessionStorage.setItem(key, JSON.stringify([...fired]));

          // Fire Vercel Analytics event
          if (typeof window !== "undefined" && window.va?.track) {
            window.va.track("scroll_depth", { page: pathname, depth });
          }
        }
      },
      { threshold: 0 }
    );

    for (const el of sentinels) {
      observer.observe(el);
    }

    return () => {
      observer.disconnect();
      for (const el of sentinels) {
        el.remove();
      }
    };
  }, [pathname]);
}
