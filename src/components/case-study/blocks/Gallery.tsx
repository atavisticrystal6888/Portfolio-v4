import type { ReactNode } from "react";
import styles from "./blocks.module.css";
import { ZoomImage } from "./ZoomImage";

export function Gallery({ children, label = "Screenshots" }: { children: ReactNode; label?: string }) {
  return (
    <div className={styles.gallery} role="group" aria-label={label} data-lightbox-group="">
      {children}
    </div>
  );
}

export interface ShotProps {
  src: string;
  alt: string;
  caption?: string;
}

export function Shot({ src, alt, caption }: ShotProps) {
  return (
    <figure className={styles.shot}>
      <div className={styles.shotFrame}>
        <ZoomImage src={src} alt={alt} caption={caption} className={styles.shotMedia} />
      </div>
      {caption && <figcaption className={styles.shotCaption}>{caption}</figcaption>}
    </figure>
  );
}
