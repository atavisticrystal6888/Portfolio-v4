import type { ReactNode } from "react";
import Link from "next/link";
import styles from "./ListRow.module.css";

interface ListRowsProps {
  children: ReactNode;
}

/** Ruled container for ListRow items. */
export function ListRows({ children }: ListRowsProps) {
  return <ul className={styles.list}>{children}</ul>;
}

interface ListRowProps {
  href: string;
  title: string;
  /** Mono rail content — date, category, reading time. */
  rail: ReactNode;
  dek?: ReactNode;
  /** Rendered under the dek, e.g. an outcome readout. */
  trailing?: ReactNode;
  /** Match the surrounding document outline. */
  headingLevel?: 2 | 3;
}

/**
 * Index row: mono rail, Fraunces title, optional dek. The whole row is the
 * link, so the hit area is the full band rather than just the title text.
 */
export function ListRow({
  href,
  title,
  rail,
  dek,
  trailing,
  headingLevel = 3,
}: ListRowProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <li className={styles.item}>
      <Link href={href} className={styles.row}>
        <div className={styles.rail}>{rail}</div>
        <div className={styles.body}>
          <Heading className={styles.title}>{title}</Heading>
          {dek && <p className={styles.dek}>{dek}</p>}
          {trailing}
        </div>
      </Link>
    </li>
  );
}
