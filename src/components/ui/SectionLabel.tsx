import { cn } from "@/lib/utils";
import styles from "./SectionLabel.module.css";

interface SectionLabelProps {
  children: React.ReactNode;
  /** Dossier index for ordered page sections, e.g. "01". */
  index?: string;
  /** Render the label itself as a heading where it names a section with no
   *  other title ("Related reading", "TL;DR", "Featured"). */
  as?: "span" | "h2" | "h3";
  id?: string;
  className?: string;
}

export function SectionLabel({
  children,
  index,
  as: Tag = "span",
  id,
  className,
}: SectionLabelProps) {
  return (
    <Tag id={id} className={cn(styles.label, Tag !== "span" && styles.heading, className)}>
      {index && <span className={styles.index}>{index}</span>}
      <span
        className={cn(styles.rule, !index && styles.ruleAccent)}
        aria-hidden="true"
      />
      <span>{children}</span>
    </Tag>
  );
}
