"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import styles from "../MdxContent.module.css";

export interface LightboxItem {
  src: string;
  alt: string;
  caption: string;
}

interface LightboxState {
  items: LightboxItem[];
  index: number;
}

interface LightboxApi {
  open: (items: LightboxItem[], index: number) => void;
}

const LightboxContext = createContext<LightboxApi | null>(null);

export function useLightbox(): LightboxApi | null {
  return useContext(LightboxContext);
}

/**
 * One lightbox per case study. Images opened through <ZoomImage> register the
 * group they belong to (a Gallery or Compare) so the dialog can step through
 * siblings with the arrow keys; a lone Figure opens as a single item.
 */
export function LightboxProvider({ children }: { children: ReactNode }) {
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const open = useCallback((items: LightboxItem[], index: number) => {
    if (items.length === 0) return;
    openerRef.current = document.activeElement as HTMLElement | null;
    setLightbox({ items, index: Math.min(Math.max(index, 0), items.length - 1) });
  }, []);

  const close = useCallback(() => setLightbox(null), []);

  const move = useCallback((direction: -1 | 1) => {
    setLightbox((current) => {
      if (!current) return current;
      return {
        ...current,
        index: (current.index + direction + current.items.length) % current.items.length,
      };
    });
  }, []);

  useEffect(() => {
    if (!lightbox) {
      // Return focus to whatever opened the dialog.
      openerRef.current?.focus?.();
      openerRef.current = null;
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setLightbox(null);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        move(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        move(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightbox, move]);

  const api = useMemo<LightboxApi>(() => ({ open }), [open]);
  const activeItem = lightbox?.items[lightbox.index] ?? null;

  return (
    <LightboxContext.Provider value={api}>
      {children}

      {lightbox && activeItem && (
        <div
          className={styles.lightboxBackdrop}
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div
            className={styles.lightboxDialog}
            role="dialog"
            aria-modal="true"
            aria-label="Case study image viewer"
          >
            <div className={styles.lightboxToolbar}>
              <div className={styles.lightboxCounter} aria-live="polite">
                {lightbox.index + 1} / {lightbox.items.length}
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                className={styles.lightboxClose}
                onClick={close}
                aria-label="Close image viewer"
              >
                Close
              </button>
            </div>

            <div className={styles.lightboxStage}>
              {lightbox.items.length > 1 && (
                <button
                  type="button"
                  className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
                  onClick={() => move(-1)}
                  aria-label="Previous image"
                >
                  ‹
                </button>
              )}

              <figure className={styles.lightboxFigure}>
                {/* eslint-disable-next-line @next/next/no-img-element -- lightbox shows arbitrary-size MDX images */}
                <img src={activeItem.src} alt={activeItem.alt} className={styles.lightboxImage} />
                {activeItem.caption && (
                  <figcaption className={styles.lightboxCaption}>{activeItem.caption}</figcaption>
                )}
              </figure>

              {lightbox.items.length > 1 && (
                <button
                  type="button"
                  className={`${styles.lightboxNav} ${styles.lightboxNext}`}
                  onClick={() => move(1)}
                  aria-label="Next image"
                >
                  ›
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </LightboxContext.Provider>
  );
}
