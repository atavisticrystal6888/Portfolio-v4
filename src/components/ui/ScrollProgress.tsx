"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./ScrollProgress.module.css";

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  const onScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0) {
      setProgress((scrollTop / docHeight) * 100);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  return (
    <div className={styles.bar} role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
      <div className={styles.fill} style={{ width: `${progress}%` }} />
    </div>
  );
}
