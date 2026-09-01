import styles from "./blocks.module.css";
import { ZoomImage } from "./ZoomImage";

export interface CompareSide {
  src: string;
  label: string;
  /** Defaults to the label. */
  alt?: string;
}

export interface CompareProps {
  before: CompareSide;
  after: CompareSide;
  caption?: string;
}

function Pane({ side }: { side: CompareSide }) {
  const alt = side.alt ?? side.label;
  return (
    <div className={styles.comparePane}>
      <span className={styles.eyebrow}>{side.label}</span>
      <div className={styles.matte}>
        <ZoomImage src={side.src} alt={alt} caption={side.label} className={styles.media} />
      </div>
    </div>
  );
}

export function Compare({ before, after, caption }: CompareProps) {
  return (
    <figure className={styles.compare} data-lightbox-group="">
      <div className={styles.compareGrid}>
        <Pane side={before} />
        <Pane side={after} />
      </div>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}
