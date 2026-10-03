"use client";

import Image from "next/image";
import { useLightbox, type LightboxItem } from "./Lightbox";
import styles from "./blocks.module.css";

export interface ZoomImageButtonProps {
  src: string;
  alt: string;
  /** Shown under the image in the lightbox. Defaults to alt. */
  caption?: string;
  className?: string;
  loading?: "lazy" | "eager";
  /** Intrinsic pixel size, so the lazy image reserves its box before it loads. */
  width?: number;
  height?: number;
}

/**
 * An image that opens the case-study lightbox. If the image sits inside an
 * element with `data-lightbox-group`, every ZoomImage in that group becomes a
 * navigable set; otherwise it opens alone. Rendered through the server
 * `ZoomImage`, which fills in the intrinsic width/height.
 */
export function ZoomImageButton({
  src,
  alt,
  caption,
  className,
  loading = "lazy",
  width,
  height,
}: ZoomImageButtonProps) {
  const lightbox = useLightbox();
  const resolvedCaption = caption ?? alt;
  const optimized =
    typeof width === "number" &&
    typeof height === "number" &&
    src.startsWith("/") &&
    !/\.svg($|\?)/i.test(src)
      ? { width, height }
      : null;

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
      {optimized ? (
        // Raster screenshots go through next/image so the browser gets WebP
        // at the rendered size; width/height still reserve the box (CLS 0).
        // The lightbox loads the original file on open.
        <Image
          src={src}
          alt={alt}
          width={optimized.width}
          height={optimized.height}
          loading={loading}
          sizes="(max-width: 768px) 100vw, 720px"
        />
      ) : (
        // SVGs, and files whose size could not be read, stay plain images.
        // eslint-disable-next-line @next/next/no-img-element -- vector or unsized MDX image
        <img src={src} alt={alt} loading={loading} decoding="async" width={width} height={height} />
      )}
    </button>
  );
}
