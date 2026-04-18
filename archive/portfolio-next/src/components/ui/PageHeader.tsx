import styles from "./PageHeader.module.css";
import { Badge } from "@/components/ui/Badge";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
}

export function PageHeader({ title, subtitle, badge }: PageHeaderProps) {
  return (
    <section className={styles.header}>
      <div className={styles.inner}>
        {badge && <Badge variant="accent">{badge}</Badge>}
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
    </section>
  );
}
