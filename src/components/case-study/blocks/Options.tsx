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
  return (
    <div className={styles.optionsWrap}>
      <table className={styles.options}>
        {caption && <caption className={styles.optionsCaption}>{caption}</caption>}
        <thead>
          <tr>
            <th scope="col" className={styles.optionsHead}>Option</th>
            <th scope="col" className={styles.optionsHead}>Status</th>
            <th scope="col" className={styles.optionsHead}>Why</th>
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
    <tr className={styles.optionRow}>
      <th scope="row" className={styles.optionName}>{name}</th>
      <td className={styles.optionCell}>
        <span className={styles.status} data-status={status}>
          {STATUS_LABEL[status] ?? status}
        </span>
      </td>
      <td className={styles.optionCell}>{why ?? children}</td>
    </tr>
  );
}
