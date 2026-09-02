"use client";

import { useLightbox, type LightboxItem } from "./Lightbox";
import styles from "./blocks.module.css";

interface ZoomImageProps {
  src: string;
  alt: string;
  /** Shown under the image in the lightbox. Defaults to alt. */
  caption?: string;
  className?: string;
  loading?: "lazy" | "eager";
}

/**
 * An image that opens the case-study lightbox. If the image sits inside an
 * element with `data-lightbox-group`, every ZoomImage in that group becomes a
 * navigable set; otherwise it opens alone.
 */
export function ZoomImage({ src, alt, caption, className, loading = "lazy" }: ZoomImageProps) {
  const lightbox = useLightbox();
  const resolvedCaption = caption ?? alt;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!lightbox) return;
    const self = event.currentTarget;
    const group = self.closest<HTMLElement>("[data-lightbox-group]");
    const nodes = group
      ? Array.from(group.querySelectorAll<HTMLButtonElement>("[data-zoom-image]"))
      : [self];
    const items: LightboxItem[] = nodes.map((node) => ({
      src: node.dataset.src ?? "",
      alt: node.dataset.alt ?? "",
      caption: node.dataset.caption ?? "",
    }));
    lightbox.open(items, Math.max(nodes.indexOf(self), 0));
  };

  return (
    <button
      type="button"
      className={className ? `${styles.zoom} ${className}` : styles.zoom}
      onClick={handleClick}
      data-zoom-image=""
      data-src={src}
      data-alt={alt}
      data-caption={resolvedCaption}
      aria-label={`Open full-size image: ${alt}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- MDX images are arbitrary-size screenshots */}
      <img src={src} alt={alt} loading={loading} decoding="async" />
    </button>
  );
}
