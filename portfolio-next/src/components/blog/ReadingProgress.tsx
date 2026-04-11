"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import styles from "./ReadingProgress.module.css";

const STORAGE_KEY = "ds-reading-progress";
const SAVE_DEBOUNCE_MS = 1000;
const MAX_AGE_DAYS = 30;

interface ProgressEntry {
  slug: string;
  progress: number;
  timestamp: number;
}

function loadEntries(): ProgressEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const entries: ProgressEntry[] = JSON.parse(raw);
    const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
    return entries.filter((e) => e.timestamp > cutoff);
  } catch {
    return [];
  }
}

function saveEntry(slug: string, progress: number) {
  const entries = loadEntries().filter((e) => e.slug !== slug);
  entries.push({ slug, progress, timestamp: Date.now() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getProgressForSlug(slug: string): number | null {
  const entries = loadEntries();
  const entry = entries.find((e) => e.slug === slug);
  return entry ? entry.progress : null;
}

export function clearProgressForSlug(slug: string) {
  const entries = loadEntries().filter((e) => e.slug !== slug);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

interface ReadingProgressProps {
  slug?: string;
}

export function ReadingProgress({ slug }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const onScroll = useCallback(() => {
    const el = document.documentElement;
    const scrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight - el.clientHeight;
    if (scrollHeight > 0) {
      setProgress((scrollTop / scrollHeight) * 100);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  // Debounced save to localStorage
  useEffect(() => {
    if (!slug || progress < 5) return;
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveEntry(slug, progress);
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(saveTimerRef.current);
  }, [slug, progress]);

  return (
    <div className={styles.bar} role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Reading progress">
      <div className={styles.fill} style={{ width: `${progress}%` }} />
    </div>
  );
}
