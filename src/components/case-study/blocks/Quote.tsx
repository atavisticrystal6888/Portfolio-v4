import type { ReactNode } from "react";
import styles from "./blocks.module.css";

export interface QuoteProps {
  children: ReactNode;
  /** Who said it. */
  by?: string;
  /** Their role or relationship to the product. */
  role?: string;
}

export function Quote({ children, by, role }: QuoteProps) {
  return (
    <figure className={styles.quote}>
      <blockquote className={styles.quoteText}>{children}</blockquote>
      {(by || role) && (
        <figcaption className={styles.quoteBy}>
          {by && <span className={styles.quoteName}>{by}</span>}
          {by && role && <span aria-hidden="true"> · </span>}
          {role && <span className={styles.quoteRole}>{role}</span>}
        </figcaption>
      )}
    </figure>
  );
}
