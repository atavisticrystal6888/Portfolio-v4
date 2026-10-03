import Link from "next/link";
import { absoluteUrl } from "@/lib/site";
import styles from "./Breadcrumbs.module.css";

/** One step in the trail. `href` is a site-relative path, e.g. "/projects". */
export interface Crumb {
  name: string;
  href: string;
}

function serialize(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * Visible breadcrumb trail plus the page's single BreadcrumbList JSON-LD.
 * Earlier items are links; the last item is the current page, plain text
 * with aria-current="page". Separators are decorative. Pages that render
 * this component must not emit a second BreadcrumbList.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (items.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.href),
    })),
  };

  return (
    <>
      <nav aria-label="Breadcrumb" className={styles.nav} data-testid="breadcrumbs">
        <ol className={styles.list}>
          {items.map((item, index) => {
            const last = index === items.length - 1;
            return (
              <li key={`${item.href}-${index}`} className={styles.item}>
                {last ? (
                  <span className={styles.current} aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <>
                    <Link href={item.href} className={styles.link}>
                      {item.name}
                    </Link>
                    <span className={styles.sep} aria-hidden="true">
                      /
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        data-testid="breadcrumb-jsonld"
        dangerouslySetInnerHTML={{ __html: serialize(jsonLd) }}
      />
    </>
  );
}
