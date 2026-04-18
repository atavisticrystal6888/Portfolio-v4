import type { CoCreator } from "@/types/project";
import styles from "./CoCreatorChips.module.css";

interface CoCreatorChipsProps {
  coCreators: CoCreator[] | undefined;
  /** Visual variant. `compact` is used inside cards; `byline` is the case-study hero. */
  variant?: "compact" | "byline";
  /** Prefix text, e.g. "With" (compact) or "Built with" (byline). */
  label?: string;
}

/**
 * Renders a small, accessible credit for project/case-study co-creators.
 *
 * - Links each creator to their public profile (new tab, noopener).
 * - Degrades gracefully when `coCreators` is undefined or empty.
 */
export function CoCreatorChips({
  coCreators,
  variant = "compact",
  label,
}: CoCreatorChipsProps) {
  if (!coCreators || coCreators.length === 0) return null;

  const defaultLabel = variant === "byline" ? "Built with" : "With";
  const effectiveLabel = label ?? defaultLabel;

  return (
    <div className={styles.wrap} data-variant={variant}>
      <span className={styles.label}>{effectiveLabel}</span>
      <ul className={styles.list}>
        {coCreators.map((c) => (
          <li key={c.url} className={styles.chip}>
            <a
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
              aria-label={`${c.name} (${c.role}) — opens in new tab`}
            >
              <span className={styles.name}>{c.name}</span>
              {c.handle && <span className={styles.handle}>{c.handle}</span>}
              <span className={styles.role}>· {c.role}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
