import { Children, isValidElement, type ReactNode } from "react";
import styles from "./blocks.module.css";

export type OptionStatus = "chosen" | "rejected" | "deferred";

const STATUS_LABEL: Record<OptionStatus, string> = {
  chosen: "Chosen",
  rejected: "Rejected",
  deferred: "Deferred",
};

export function Options({ children, caption }: { children: ReactNode; caption?: string }) {
  const rows = Children.toArray(children).filter(isValidElement);
  // The wrapper scrolls horizontally on narrow viewports, so it must be
  // reachable by keyboard (axe: scrollable-region-focusable / WCAG 2.1.1).
  // role="region" needs an accessible name, hence the caption fallback.
  return (
    <div
      className={styles.optionsWrap}
      tabIndex={0}
      role="region"
      aria-label={caption ?? "Alternatives considered"}
    >
      {/* Explicit roles: below 480px the table is re-laid out as stacked
          cards (display:block), which strips native table semantics in
          some engines. */}
      <table className={styles.options} role="table">
        {caption && <caption className={styles.optionsCaption}>{caption}</caption>}
        <thead>
          <tr role="row">
            <th scope="col" role="columnheader" className={styles.optionsHead}>Option</th>
            <th scope="col" role="columnheader" className={styles.optionsHead}>Status</th>
            <th scope="col" role="columnheader" className={styles.optionsHead}>Why</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

export interface OptionProps {
  name: string;
  status: OptionStatus;
  why?: string;
  children?: ReactNode;
}

export function Option({ name, status, why, children }: OptionProps) {
  return (
    <tr className={styles.optionRow} role="row">
      <th scope="row" role="rowheader" className={styles.optionName}>{name}</th>
      <td className={styles.optionCell} role="cell">
        <span className={styles.status} data-status={status}>
          {STATUS_LABEL[status] ?? status}
        </span>
      </td>
      <td className={styles.optionCell} role="cell">{why ?? children}</td>
    </tr>
  );
}
