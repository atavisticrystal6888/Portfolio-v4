import styles from "./PageHeader.module.css";
import { Badge } from "@/components/ui/Badge";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { cn } from "@/lib/utils";

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
  /** Optional decoration rendered behind the text column (e.g. /lab's scene).
   *  From 900px the text column stops short of it; below 900px it is hidden. */
  decoration?: React.ReactNode;
  /** "narrow" sets the text column to the 760px reading column, for article
   *  pages whose body below uses that column. */
  width?: "default" | "narrow";
  /** Root element: "header" where the page has no other banner-like header
   *  (articles), "section" otherwise. */
  as?: "section" | "header";
  /** Extra class on the inner column, for page-specific child rules. */
  innerClassName?: string;
  children?: React.ReactNode;
}

/**
 * One header for every index, utility and article page, so the h1 scale,
 * top clearance, left edge and top line (the breadcrumb trail) are identical
 * across /about, /projects, /ai-pm, /blog, /lab, /contact, /now, /uses,
 * /bookshelf, /changelog and every /blog/[slug].
 */
export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  badge,
  eyebrow,
  meta,
  decoration,
  width = "default",
  as: Tag = "section",
  innerClassName,
  children,
}: PageHeaderProps) {
  return (
    <Tag className={styles.header} data-page-header="">
      <div
        className={cn(
          styles.inner,
          width === "narrow" && styles.narrow,
          decoration != null && styles.decorated,
          innerClassName
        )}
      >
        {decoration != null && <div className={styles.decoration}>{decoration}</div>}
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
    </Tag>
  );
}
