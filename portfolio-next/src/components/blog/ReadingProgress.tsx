"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./ReadingProgress.module.css";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

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

  return (
    <div className={styles.bar} role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Reading progress">
      <div className={styles.fill} style={{ width: `${progress}%` }} />
    </div>
  );
}
