import styles from "./blocks.module.css";
import { ZoomImage } from "./ZoomImage";
import { MotionVideo } from "./MotionVideo";

export interface FigureProps {
  src: string;
  alt: string;
  caption?: string;
  /** inline = prose width (default); wide = breaks out of the measure; full = viewport width. */
  size?: "wide" | "full" | "inline";
  /** Poster frame for .webm/.mp4 sources. */
  poster?: string;
}

const VIDEO_RE = /\.(webm|mp4)(\?.*)?$/i;

export function Figure({ src, alt, caption, size = "inline", poster }: FigureProps) {
  const isVideo = VIDEO_RE.test(src);
  return (
    <figure className={styles.figure} data-size={size}>
      <div className={styles.matte}>
        {isVideo ? (
          <MotionVideo src={src} poster={poster} label={alt} className={styles.media} />
        ) : (
          <ZoomImage src={src} alt={alt} caption={caption} className={styles.media} />
        )}
      </div>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}
