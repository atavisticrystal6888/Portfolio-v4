import { Children, isValidElement, type ReactNode } from "react";
import styles from "./blocks.module.css";
import { ZoomImage } from "./ZoomImage";

export interface ArtifactProps {
  title?: string;
  /** For image artifacts (an eval sheet, a tear sheet). Code artifacts put a fence in children instead. */
  src?: string;
  alt?: string;
  children?: ReactNode;
}

/**
 * The one imperfect human artifact per dossier - an eval sheet, a terminal
 * run, a notebook cell - framed and labelled. Body content (a code fence or
 * the `src` image) renders inside the frame; any trailing paragraph children
 * become the figcaption, so the caption can be written as ordinary markdown.
 */
export function Artifact({ title, src, alt, children }: ArtifactProps) {
  const body: ReactNode[] = [];
  const caption: ReactNode[] = [];

  Children.toArray(children).forEach((child) => {
    if (isValidElement(child) && child.type === "p") {
      caption.push(child);
    } else {
      body.push(child);
    }
  });

  return (
    <figure className={styles.artifact}>
      <div className={styles.artifactHead}>
        <span className={styles.eyebrowMuted}>Artifact</span>
        {title && <span className={styles.artifactTitle}>{title}</span>}
      </div>
      <div className={styles.artifactBody}>
        {src && (
          <ZoomImage src={src} alt={alt ?? title ?? "Artifact"} caption={title} className={styles.media} loading="eager" />
        )}
        {body}
      </div>
      {caption.length > 0 && <figcaption className={styles.artifactCaption}>{caption}</figcaption>}
    </figure>
  );
}
