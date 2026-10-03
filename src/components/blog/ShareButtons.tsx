"use client";

import { useEffect, useRef, useState } from "react";
import { absoluteUrl } from "@/lib/site";
import styles from "./ShareButtons.module.css";

interface ShareButtonsProps {
  title: string;
  /** Site-relative path; it is shared and copied as an absolute URL. */
  url: string;
}

const STATUS_MS = 2500;

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [status, setStatus] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const announce = (message: string) => {
    setStatus(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus(""), STATUS_MS);
  };

  const handleShare = async () => {
    // A relative path pasted anywhere else is not a link.
    const link = absoluteUrl(url);
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url: link });
        return;
      } catch (error) {
        // Closing the share sheet is a choice, not a failure.
        if (error instanceof DOMException && error.name === "AbortError") return;
        // Anything else (no share target, permission): fall back to copying.
      }
    }
    try {
      await navigator.clipboard.writeText(link);
      announce("Link copied");
    } catch {
      announce(`Copy failed. The link is ${link}`);
    }
  };

  return (
    <div className={styles.wrapper}>
      <button type="button" className={styles.btn} onClick={handleShare} aria-label="Share article">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" x2="12" y1="2" y2="15" />
        </svg>
        Share
      </button>
      {/* Always in the DOM so screen readers pick up the change. */}
      <span className={styles.status} role="status" aria-live="polite" data-testid="share-status">
        {status}
      </span>
    </div>
  );
}
