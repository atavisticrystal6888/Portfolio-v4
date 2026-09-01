import type { ReactNode } from "react";
import styles from "./blocks.module.css";

/**
 * Decision callout: the trade-off trail set apart from narrative prose so the
 * reasoning reads as structure rather than an anonymous quote.
 */
export function Decision({ children, label = "Decision" }: { children: ReactNode; label?: string }) {
  return (
    <aside className={styles.decision} role="note" aria-label={label}>
      <p className={styles.decisionEyebrow} aria-hidden="true">
        {label}
      </p>
      <div className={styles.decisionBody}>{children}</div>
    </aside>
  );
}
