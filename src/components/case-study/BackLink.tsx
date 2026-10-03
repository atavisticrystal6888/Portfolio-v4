import Link from "next/link";
import { cn } from "@/lib/utils";
import styles from "./BackLink.module.css";

interface BackLinkProps {
  href: string;
  /** Visible text after the arrow; also the link's accessible name. */
  children: string;
  className?: string;
}

/**
 * Quiet return route ("← All projects", "← Back to Blog"). The arrow is
 * decorative so the accessible name is the words alone.
 */
export function BackLink({ href, children, className }: BackLinkProps) {
  return (
    <Link href={href} className={cn(styles.back, className)}>
      <span className={styles.arrow} aria-hidden="true">
        &larr;
      </span>
      {children}
    </Link>
  );
}
