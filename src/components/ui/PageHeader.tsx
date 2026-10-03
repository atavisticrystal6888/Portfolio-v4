import styles from "./PageHeader.module.css";
import { Badge } from "@/components/ui/Badge";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";

interface PageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  /** Visible trail plus the page's single BreadcrumbList JSON-LD. Pages that
   *  pass this must not emit another BreadcrumbList. */
  breadcrumbs?: Crumb[];
  /** Kept for compatibility; index and utility pages now use the breadcrumb
   *  trail as their only top line, with facts in `meta`. */
  badge?: string;
  /** Mono section-label eyebrow above the title (e.g. "Build log"). */
  eyebrow?: string;
  /** Small mono line under the subtitle, e.g. a last-updated date or count. */
  meta?: React.ReactNode;
  /** Optional decoration rendered behind the text column (e.g. /lab's scene). */
  decoration?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * One header for every index and utility page, so the h1 scale, top
 * clearance, left edge and top line (the breadcrumb trail) are identical
 * across /about, /projects, /ai-pm, /blog, /lab, /contact, /now, /uses,
 * /bookshelf and /changelog.
 */
export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  badge,
  eyebrow,
  meta,
  decoration,
  children,
}: PageHeaderProps) {
  return (
    <section className={styles.header}>
      <div className={styles.inner}>
        {decoration}
        {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}
        {badge && <Badge variant="accent">{badge}</Badge>}
        {eyebrow && (
          <div className={styles.eyebrow}>
            <SectionLabel>{eyebrow}</SectionLabel>
          </div>
        )}
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {meta && <p className={styles.meta}>{meta}</p>}
        {children}
      </div>
    </section>
  );
}
