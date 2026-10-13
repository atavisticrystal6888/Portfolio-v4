import Link from "next/link";
import styles from "./Surface.module.css";
import { cn } from "@/lib/utils";

interface SurfaceProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  as?: "div" | "article" | "section" | "li";
  /** Makes the whole surface a link (always with the hover state). */
  href?: string;
  id?: string;
  "data-testid"?: string;
}

export function Surface({
  children,
  className,
  hover = false,
  as: Tag = "div",
  href,
  id,
  "data-testid": testId,
}: SurfaceProps) {
  if (href) {
    return (
      <Link
        href={href}
        id={id}
        data-testid={testId}
        className={cn(styles.card, styles.hoverable, styles.link, className)}
      >
        {children}
      </Link>
    );
  }
  return (
    <Tag
      id={id}
      data-testid={testId}
      className={cn(styles.card, hover && styles.hoverable, className)}
    >
      {children}
    </Tag>
  );
}

/** Card heading inside a Surface: one size for every card grid. */
export function SurfaceTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <h3 className={cn(styles.title, className)}>{children}</h3>;
}

/** Card body copy inside a Surface. */
export function SurfaceText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn(styles.text, className)}>{children}</p>;
}
