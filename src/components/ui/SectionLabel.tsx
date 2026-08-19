import { cn } from "@/lib/utils";
import styles from "./SectionLabel.module.css";

interface SectionLabelProps {
  children: React.ReactNode;
  /** Dossier index for ordered page sections, e.g. "01". */
  index?: string;
}

export function SectionLabel({ children, index }: SectionLabelProps) {
  return (
    <span className={styles.label}>
      {index && <span className={styles.index}>{index}</span>}
      <span
        className={cn(styles.rule, !index && styles.ruleAccent)}
        aria-hidden="true"
      />
      <span>{children}</span>
    </span>
  );
}
