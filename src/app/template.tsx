import styles from "./template.module.css";

// Server component on purpose: the previous framer-motion version SSR'd the
// whole page with inline opacity 0, leaving the site invisible until React
// hydrated (seconds on slow devices, forever without JS). The CSS animation
// in template.module.css provides the entrance without that cost; it moves
// content but never fades it, so the first frame is fully visible.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className={styles.pageEnter}>{children}</div>;
}
