import styles from "./Surface.module.css";
import { cn } from "@/lib/utils";

interface SurfaceProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  as?: "div" | "article" | "section";
}

export function Surface({
  children,
  className,
  hover = false,
  as: Tag = "div",
}: SurfaceProps) {
  return (
    <Tag className={cn(styles.card, hover && styles.hoverable, className)}>
      {children}
    </Tag>
  );
}
