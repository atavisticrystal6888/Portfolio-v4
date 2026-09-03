import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import styles from "./EmptyState.module.css";

type EmptyStateAction =
  | { label: string; onClick: () => void; href?: never }
  | { label: string; href: string; onClick?: never };

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: EmptyStateAction;
  icon?: ReactNode;
  className?: string;
}

/**
 * Shared "nothing to show" panel. Always offers a way back: a filtered list
 * with no results is a dead end unless the reset is one click away.
 * role="status" so screen readers hear the change when a filter empties a list.
 */
export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div role="status" className={cn(styles.wrapper, className)}>
      {icon && (
        <div className={styles.icon} aria-hidden="true">
          {icon}
        </div>
      )}
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {action && (
        <div className={styles.action}>
          {action.href ? (
            <Button href={action.href} variant="secondary">
              {action.label}
            </Button>
          ) : (
            <Button onClick={action.onClick} variant="secondary">
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
