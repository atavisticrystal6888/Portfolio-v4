"use client";

import { useState, useCallback } from "react";
import type { UserBehavior } from "@/types/theme";

const STORAGE_KEY = "ds-portfolio-behavior";

const DEFAULT_BEHAVIOR: UserBehavior = {
  pagesVisited: [],
  categoryAffinities: {},
  sectionScrollDepths: {},
  sessionCount: 0,
  firstVisit: 0,
  lastVisit: 0,
};

// Module-level initialization (runs once on import, outside of render)
const initialBehavior: UserBehavior = (() => {
  if (typeof window === "undefined") return DEFAULT_BEHAVIOR;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as UserBehavior;
      parsed.sessionCount += 1;
      parsed.lastVisit = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      return parsed;
    }
    const initial: UserBehavior = {
      ...DEFAULT_BEHAVIOR,
      firstVisit: Date.now(),
      lastVisit: Date.now(),
      sessionCount: 1,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  } catch {
    return DEFAULT_BEHAVIOR;
  }
})();

export function useBehavior() {
  const [behavior, setBehavior] = useState<UserBehavior>(initialBehavior);

  const trackPageVisit = useCallback((slug: string, category?: string) => {
    setBehavior((prev) => {
      const next: UserBehavior = {
        ...prev,
        pagesVisited: [...prev.pagesVisited.slice(-50), { slug, timestamp: Date.now() }],
        lastVisit: Date.now(),
      };
      if (category) {
        next.categoryAffinities = {
          ...prev.categoryAffinities,
          [category]: (prev.categoryAffinities[category] || 0) + 1,
        };
      }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  return { behavior, trackPageVisit };
}
