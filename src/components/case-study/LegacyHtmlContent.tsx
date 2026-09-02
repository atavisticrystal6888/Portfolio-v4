"use client";

import { useEffect, useState } from "react";

// Blog posts still render through the regex converter in src/lib/markdown.ts
// and this component. Case studies moved to real MDX (see MdxContent.tsx).
import styles from "./MdxContent.module.css";

interface GalleryItem {
  src: string;
  alt: string;
  caption: string;
}

interface LightboxState {
  items: GalleryItem[];
  index: number;
}

interface LegacyHtmlContentProps {
  html: string;
}

export function LegacyHtmlContent({ html }: LegacyHtmlContentProps) {
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  useEffect(() => {
    if (!lightbox) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightbox(null);
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setLightbox((current) => {
          if (!current) return current;
          return {
            ...current,
            index:
              (current.index - 1 + current.items.length) % current.items.length,
          };
        });
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setLightbox((current) => {
          if (!current) return current;
          return {
            ...current,
            index: (current.index + 1) % current.items.length,
          };
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightbox]);

  const moveLightbox = (direction: -1 | 1) => {
    setLightbox((current) => {
      if (!current) return current;
      return {
        ...current,
        index:
          (current.index + direction + current.items.length) % current.items.length,
      };
    });
  };

  const handleContentClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const galleryLink = target.closest(".case-gallery__link") as HTMLAnchorElement | null;

    if (!galleryLink) {
      return;
    }

    const figure = galleryLink.closest(".case-gallery__figure") as HTMLElement | null;
    const gallery = galleryLink.closest(".case-gallery");

    if (!figure || !gallery) {
      return;
    }

    const figures = Array.from(
      gallery.querySelectorAll<HTMLElement>(".case-gallery__figure")
    );

    const items = figures
      .map((galleryFigure) => {
        const image = galleryFigure.querySelector("img");
        if (!(image instanceof HTMLImageElement)) {
          return null;
        }

        const caption =
          galleryFigure.querySelector("figcaption")?.textContent?.trim() ?? image.alt;

        return {
          src: image.getAttribute("src") ?? image.src,
          alt: image.alt,
          caption,
        } satisfies GalleryItem;
      })
      .filter((item): item is GalleryItem => item !== null);

    const index = figures.indexOf(figure);

    if (items.length === 0 || index < 0) {
      return;
    }

    event.preventDefault();
    setLightbox({ items, index });
  };

  const activeItem = lightbox?.items[lightbox.index] ?? null;

  return (
    <>
      <div
        className={styles.prose}
        onClick={handleContentClick}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {lightbox && activeItem && (
        <div
          className={styles.lightboxBackdrop}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setLightbox(null);
            }
          }}
        >
          <div
            className={styles.lightboxDialog}
            role="dialog"
            aria-modal="true"
            aria-label="Case study image gallery"
          >
            <div className={styles.lightboxToolbar}>
              <div className={styles.lightboxCounter}>
                {lightbox.index + 1} / {lightbox.items.length}
              </div>
              <button
                type="button"
                className={styles.lightboxClose}
                onClick={() => setLightbox(null)}
                aria-label="Close image gallery"
              >
                Close
              </button>
            </div>

            <div className={styles.lightboxStage}>
              {lightbox.items.length > 1 && (
                <button
                  type="button"
                  className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
                  onClick={() => moveLightbox(-1)}
                  aria-label="Previous image"
                >
                  ‹
                </button>
              )}

              <figure className={styles.lightboxFigure}>
                {/* eslint-disable-next-line @next/next/no-img-element -- lightbox shows arbitrary-size MDX images */}
                <img
                  src={activeItem.src}
                  alt={activeItem.alt}
                  className={styles.lightboxImage}
                />
                {activeItem.caption && (
                  <figcaption className={styles.lightboxCaption}>
                    {activeItem.caption}
                  </figcaption>
                )}
              </figure>

              {lightbox.items.length > 1 && (
                <button
                  type="button"
                  className={`${styles.lightboxNav} ${styles.lightboxNext}`}
                  onClick={() => moveLightbox(1)}
                  aria-label="Next image"
                >
                  ›
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
