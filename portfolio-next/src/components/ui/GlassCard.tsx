import styles from "./GlassCard.module.css";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  as?: "div" | "article" | "section";
}

export function GlassCard({
  children,
  className,
  hover = false,
  as: Tag = "div",
}: GlassCardProps) {
  return (
    <Tag className={cn(styles.card, hover && styles.hoverable, className)}>
      {children}
    </Tag>
  );
}
