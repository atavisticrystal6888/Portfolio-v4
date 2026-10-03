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
import { createPortal } from "react-dom";
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
  const backdropRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

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

  const isOpen = lightbox !== null;

  // Modal behaviour, set up once per open (not per image step): the rest of
  // the page goes inert and aria-hidden, scroll locks, focus moves to Close,
  // and Tab / Shift+Tab cycle inside the dialog. Closing undoes all of it
  // before focus returns to the opener.
  useEffect(() => {
    if (!isOpen) {
      // Return focus to whatever opened the dialog.
      openerRef.current?.focus?.();
      openerRef.current = null;
      return;
    }

    const backdrop = backdropRef.current;
    const silenced: { el: HTMLElement; hadAriaHidden: string | null }[] = [];
    if (backdrop) {
      for (const child of Array.from(document.body.children)) {
        if (!(child instanceof HTMLElement) || child === backdrop || child.contains(backdrop)) continue;
        if (child.tagName === "SCRIPT" || child.inert) continue;
        silenced.push({ el: child, hadAriaHidden: child.getAttribute("aria-hidden") });
        child.inert = true;
        child.setAttribute("aria-hidden", "true");
      }
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
      } else if (event.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusables = Array.from(
          dialog.querySelectorAll<HTMLElement>("button:not([disabled]), [href], [tabindex]:not([tabindex='-1'])")
        );
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (!first || !last) return;
        const active = document.activeElement;
        const inside = active instanceof Node && dialog.contains(active);
        if (event.shiftKey && (active === first || !inside)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (active === last || !inside)) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      for (const { el, hadAriaHidden } of silenced) {
        el.inert = false;
        if (hadAriaHidden === null) el.removeAttribute("aria-hidden");
        else el.setAttribute("aria-hidden", hadAriaHidden);
      }
    };
  }, [isOpen, move]);

  const api = useMemo<LightboxApi>(() => ({ open }), [open]);
  const activeItem = lightbox?.items[lightbox.index] ?? null;

  return (
    <LightboxContext.Provider value={api}>
      {children}

      {lightbox &&
        activeItem &&
        createPortal(
        <div
          ref={backdropRef}
          className={styles.lightboxBackdrop}
          data-testid="lightbox"
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div
            ref={dialogRef}
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
                {/* Eager on purpose: this is the image the reader just opened. */}
                {/* eslint-disable-next-line @next/next/no-img-element -- lightbox shows arbitrary-size MDX images */}
                <img
                  src={activeItem.src}
                  alt={activeItem.alt}
                  className={styles.lightboxImage}
                  loading="eager"
                  decoding="async"
                />
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
        </div>,
          document.body
        )}
    </LightboxContext.Provider>
  );
}
