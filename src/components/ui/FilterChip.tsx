import { cn } from "@/lib/utils";
import styles from "./FilterChip.module.css";

interface FilterChipGroupProps {
  /** Accessible name of the chip row, e.g. "Filter projects". */
  label: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Row of single-select filter chips. A group of toggle buttons
 * (aria-pressed), not tabs: there is no tabpanel and no roving focus, so
 * each chip is its own Tab stop. Used by /projects, /blog and /lab.
 */
export function FilterChipGroup({ label, children, className }: FilterChipGroupProps) {
  return (
    <div className={cn(styles.group, className)} role="group" aria-label={label}>
      {children}
    </div>
  );
}

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  /** Optional count suffix (the /lab domain chips show how many ideas). */
  count?: number;
}

/** One filter chip: accent border and text on hover, accent fill when active. */
export function FilterChip({ active, onClick, children, count }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(styles.chip, active && styles.active)}
    >
      {children}
      {count !== undefined && <span className={styles.count}>{count}</span>}
    </button>
  );
}
