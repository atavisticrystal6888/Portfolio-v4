"use client";

import { useCallback, useSyncExternalStore } from "react";
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

// Read through useSyncExternalStore rather than a useState initial value.
// Stored behaviour used to be loaded at module scope, which meant the first
// client render already had it while the server-rendered HTML did not —
// Suggestions then hydrated with a different set of recommendations than the
// markup it was hydrating. useSyncExternalStore renders the server snapshot
// during hydration and swaps to the client one straight after, so the two
// never disagree.
const listeners = new Set<() => void>();

// Cached: getSnapshot must return the same reference until the data changes,
// or React re-renders forever.
let snapshot: UserBehavior | null = null;

function loadBehavior(): UserBehavior {
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
    // localStorage unavailable, disabled, or holding corrupt JSON.
    return DEFAULT_BEHAVIOR;
  }
}

function getSnapshot(): UserBehavior {
  // Runs once per page load; the session bump is part of loading the store.
  snapshot ??= loadBehavior();
  return snapshot;
}

function getServerSnapshot(): UserBehavior {
  return DEFAULT_BEHAVIOR;
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function commit(next: UserBehavior) {
  snapshot = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage full or disabled - keep the in-memory value.
  }
  listeners.forEach((l) => l());
}

export function useBehavior() {
  const behavior = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const trackPageVisit = useCallback((slug: string, category?: string) => {
    const prev = getSnapshot();
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
    commit(next);
  }, []);

  return { behavior, trackPageVisit };
}
