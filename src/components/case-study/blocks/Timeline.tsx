import { Children, isValidElement, type ReactNode } from "react";
import styles from "./blocks.module.css";

export function Timeline({ children, label = "Timeline" }: { children: ReactNode; label?: string }) {
  const items = Children.toArray(children).filter(isValidElement);
  return (
    <ol className={styles.timeline} aria-label={label}>
      {items}
    </ol>
  );
}

export interface MilestoneProps {
  date: string;
  title: string;
  children?: ReactNode;
}

export function Milestone({ date, title, children }: MilestoneProps) {
  return (
    <li className={styles.milestone}>
      <span className={styles.eyebrow}>{date}</span>
      <strong className={styles.milestoneTitle}>{title}</strong>
      {children && <div className={styles.milestoneBody}>{children}</div>}
    </li>
  );
}
