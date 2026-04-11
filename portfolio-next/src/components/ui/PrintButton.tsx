"use client";

import styles from "./PrintButton.module.css";

interface PrintButtonProps {
  label?: string;
}

export function PrintButton({ label = "Download as PDF" }: PrintButtonProps) {
  return (
    <button
      className={styles.button}
      onClick={() => window.print()}
      type="button"
      aria-label={label}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
      <span>{label}</span>
    </button>
  );
}
