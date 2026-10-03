import Link from "next/link";
import { SectionLabel } from "@/components/ui/SectionLabel";
import styles from "./WhereNext.module.css";

/* Same three destinations and descriptions the 404 page offers, so the
   handoff reads identically wherever a reader runs out of page. */
export interface Destination {
  href: string;
  label: string;
  desc: string;
}

export const DESTINATIONS = {
  projects: { href: "/projects", label: "Projects", desc: "Case studies with their evidence and limits." },
  aiPm: { href: "/ai-pm", label: "AI PM", desc: "How I scope, evaluate and cost AI features." },
  blog: { href: "/blog", label: "Blog", desc: "Essays on product, data & building." },
  contact: { href: "/contact", label: "Contact", desc: "Talk product, roles, and opportunities." },
} satisfies Record<string, Destination>;

const DEFAULT: Destination[] = [DESTINATIONS.projects, DESTINATIONS.blog, DESTINATIONS.contact];

/**
 * Closing band before the footer on the index and utility pages. The default
 * destinations are Projects, Blog and Contact; a page that is itself one of
 * those passes its own list.
 * Link names are just the destination ("Projects", "Blog", "Contact"); the
 * description sits outside the link so it is not read as part of the name.
 */
export function WhereNext({ destinations = DEFAULT }: { destinations?: Destination[] } = {}) {
  return (
    <nav className={styles.band} aria-label="Where next">
      <div className={styles.inner}>
        <SectionLabel>Where next</SectionLabel>
        <ul className={styles.list}>
          {destinations.map((d) => (
            <li key={d.href} className={styles.item}>
              <Link href={d.href} className={styles.link}>
                {d.label}
                <span className={styles.arrow} aria-hidden="true">
                  →
                </span>
              </Link>
              <p className={styles.desc}>{d.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
