"use client";

import { useState } from "react";
import styles from "./DirectLinks.module.css";

const EMAIL = "dhruvsinghal04@gmail.com";

const LINKS = [
  { label: "Email", handle: EMAIL, href: `mailto:${EMAIL}`, icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6" },
  { label: "LinkedIn", handle: "dhruvsinghal04", href: "https://linkedin.com/in/dhruvsinghal04", icon: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" },
  { label: "GitHub", handle: "atavisticrystal6888", href: "https://github.com/atavisticrystal6888", icon: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" },
  { label: "Resume", handle: "Download PDF", href: "/resume/dhruv-singhal-resume.pdf", icon: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3" },
];

export function DirectLinks() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — user can still use the Email link */
    }
  };

  return (
    <div className={styles.grid}>
      {LINKS.map((link) => {
        const isEmail = link.label === "Email";
        const isExternal = link.href.startsWith("http");
        const isDownload = link.label === "Resume";
        return (
          <a
            key={link.label}
            href={link.href}
            className={styles.link}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            download={isDownload ? "dhruv-singhal-resume.pdf" : undefined}
            onClick={isEmail ? (e) => {
              // Left-click copies to clipboard; user can still cmd/ctrl-click to open mail client.
              if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
                e.preventDefault();
                handleCopyEmail();
              }
            } : undefined}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={styles.icon}>
              <path d={link.icon} />
            </svg>
            <span className={styles.label}>{link.label}</span>
            <span className={styles.handle}>
              {isEmail && copied ? "Copied!" : link.handle}
            </span>
          </a>
        );
      })}
    </div>
  );
}
