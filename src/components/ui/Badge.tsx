import styles from "./Badge.module.css";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  /**
   * "accent" = a status (Reading, Shipped, In progress); "default" = a
   * category or attribute tag (skills, role type, difficulty); "outline" =
   * a quieter tag on a busy surface; "metric" = a figure.
   */
  variant?: "default" | "accent" | "metric" | "outline";
  className?: string;
}

/** The one chip on the site: every status and tag renders through it. */
export function Badge({ children, variant = "default", className, ...rest }: BadgeProps) {
  return (
    <span className={cn(styles.badge, styles[variant], className)} {...rest}>
      {children}
    </span>
  );
}
