import type { ReactNode } from "react";
import styles from "./blocks.module.css";

export interface UnderTheHoodProps {
  title?: string;
  children: ReactNode;
  /** Render expanded on load. */
  open?: boolean;
}

/**
 * Collapsible technical section. Headings inside stay out of the chapter rail:
 * the rail reads `data-rail="skip"` on the <details> and ignores its subtree.
 */
export function UnderTheHood({ title = "Architecture and implementation", children, open }: UnderTheHoodProps) {
  return (
    <details className={styles.hood} data-rail="skip" open={open}>
      <summary className={styles.hoodSummary}>
        <span className={styles.eyebrow}>Under the hood</span>
        <span className={styles.hoodTitle}>{title}</span>
        <span className={styles.hoodChevron} aria-hidden="true" />
      </summary>
      <div className={styles.hoodBody}>{children}</div>
    </details>
  );
}
