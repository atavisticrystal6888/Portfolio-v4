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

    // Always dismiss quickly — the loading screen is a brief brand impression,
    // not a dependency gate. Use a short fixed delay so it works reliably
    // regardless of readyState or hot-reload timing.
    const timer = setTimeout(hide, 600);
    return () => clearTimeout(timer);
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
