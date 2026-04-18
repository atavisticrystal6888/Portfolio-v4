"use client";

import { useState, useEffect } from "react";
import styles from "./LoadingScreen.module.css";

export function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const hide = () => {
      setFading(true);
      setTimeout(() => setVisible(false), 400);
    };

    if (document.readyState === 'complete') {
      // Already loaded — still show briefly for smooth appearance
      const timer = setTimeout(hide, 200);
      return () => clearTimeout(timer);
    }

    window.addEventListener('load', hide, { once: true });
    // Fallback: never stay longer than 3s
    const fallback = setTimeout(hide, 3000);
    return () => {
      window.removeEventListener('load', hide);
      clearTimeout(fallback);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`${styles.screen} ${fading ? styles.fading : ''}`} aria-hidden="true">
      <div className={styles.content}>
        <div className={styles.logo}>DS</div>
        <div className={styles.barTrack}>
          <div className={styles.barFill} />
        </div>
      </div>
    </div>
  );
}
