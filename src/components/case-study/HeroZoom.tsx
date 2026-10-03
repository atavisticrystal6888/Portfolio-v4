"use client";

import type { ReactNode } from "react";
import { useLightbox } from "./blocks/Lightbox";
import styles from "./HeroZoom.module.css";

interface HeroZoomProps {
  src: string;
  alt: string;
  caption?: string;
  children: ReactNode;
}

/**
 * Makes the framed hero shot open full-size in the case-study lightbox. The
 * frame stays as rendered; a transparent button sits over it, so the markup
 * inside the frame never has to live inside a <button>.
 */
export function HeroZoom({ src, alt, caption, children }: HeroZoomProps) {
  const lightbox = useLightbox();

  return (
    <div className={styles.wrap}>
      {children}
      {lightbox && (
        <button
          type="button"
          className={styles.button}
          data-testid="hero-zoom"
          aria-label={`Open full-size image: ${alt}`}
          onClick={() => lightbox.open([{ src, alt, caption: caption ?? alt }], 0)}
        />
      )}
    </div>
  );
}
