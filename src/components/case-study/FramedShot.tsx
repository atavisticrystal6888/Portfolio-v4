import type { CSSProperties } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { FramedShotVideo } from "./FramedShotVideo";
import styles from "./FramedShot.module.css";

interface FramedShotProps {
  /** Screenshot path. Doubles as the poster when a video is present. */
  src: string;
  alt: string;
  /** Product accent (hex) for the tinted ground; null falls back to the site accent. */
  accent?: string | null;
  /** Muted demo loop (webm/mp4). Rendered in place of the screenshot. */
  video?: string | null;
  /**
   * "hero" lets the frame take the screenshot's own height and lets the ground
   * absorb any column-height difference, so nothing is ever cropped.
   * "small" fixes a 16:10 stage and letterboxes on the paper surface, so
   * a grid of cards stays level.
   */
  variant?: "hero" | "small";
  priority?: boolean;
  sizes?: string;
  className?: string;
}

/**
 * A screenshot inside a minimal browser frame - hairline border, three dots,
 * paper surface - sitting on a ground tinted with the product's own accent.
 * The frame is what stops pale UI glaring on the dark theme: the matte dims
 * the shot a touch and the chrome gives its edges somewhere to end.
 */
export function FramedShot({
  src,
  alt,
  accent,
  video,
  variant = "hero",
  priority = false,
  sizes = "(max-width: 900px) 100vw, 44vw",
  className,
}: FramedShotProps) {
  const style = accent
    ? ({ "--shot-accent": accent } as CSSProperties)
    : undefined;

  return (
    <figure
      className={cn(styles.ground, styles[variant], className)}
      style={style}
    >
      <div className={styles.frame}>
        <div className={styles.chrome} aria-hidden="true">
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
        <div className={styles.stage}>
          {video ? (
            <FramedShotVideo src={video} poster={src} className={styles.media} />
          ) : (
            <Image
              src={src}
              alt={alt}
              width={1600}
              height={1000}
              sizes={sizes}
              className={styles.media}
              priority={priority}
            />
          )}
        </div>
      </div>
    </figure>
  );
}
