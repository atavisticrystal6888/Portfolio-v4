import type { ReactNode } from "react";
import styles from "./blocks.module.css";

export type ArtifactType = "sheet" | "notebook" | "pdf" | "doc" | "repo";

const TYPE_LABEL: Record<ArtifactType, string> = {
  sheet: "Sheet",
  notebook: "Notebook",
  pdf: "PDF",
  doc: "Doc",
  repo: "Repo",
};

export function Artifacts({ children, label = "Artifacts" }: { children: ReactNode; label?: string }) {
  return (
    <ul className={styles.artifacts} aria-label={label}>
      {children}
    </ul>
  );
}

export interface ArtifactLinkProps {
  href: string;
  type: ArtifactType;
  title: string;
  note?: string;
}

const isExternal = (href: string) => /^[a-z][a-z0-9+.-]*:/i.test(href) && !href.startsWith("mailto:");

export function ArtifactLink({ href, type, title, note }: ArtifactLinkProps) {
  const external = isExternal(href);
  return (
    <li className={styles.artifactItem}>
      <a
        className={styles.artifactChip}
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        <span className={styles.artifactType}>{TYPE_LABEL[type] ?? type}</span>
        <span className={styles.artifactLinkTitle}>{title}</span>
        {note && <span className={styles.artifactNote}>{note}</span>}
        {external && <span className={styles.srOnly}> (opens in a new tab)</span>}
      </a>
    </li>
  );
}
