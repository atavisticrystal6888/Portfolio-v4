"use client";

import { useState } from "react";
import {
  CONTACT_EMAIL,
  CONTACT_EMAIL_HREF,
  CONTACT_PHONE,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_HREF,
  GITHUB_URL,
  LINKEDIN_URL,
  RESUME_FILE_NAME,
  RESUME_HREF,
} from "@/lib/site";
import styles from "./DirectLinks.module.css";

/**
 * `copyValue` marks a link that also gets a secondary "Copy" button. The
 * anchor itself always navigates - on a phone, tapping the tile must open the
 * dialler or the mail app, not quietly copy a string.
 */
export const LINKS: {
  label: string;
  handle: string;
  href: string;
  icon: string;
  copyValue?: string;
  copyLabel?: string;
}[] = [
  { label: "Email", handle: CONTACT_EMAIL, href: CONTACT_EMAIL_HREF, copyValue: CONTACT_EMAIL, copyLabel: "Copy email address", icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6" },
  // Copies E.164 even though the handle is grouped for reading, so a paste
  // into a dialler or CRM works without cleanup.
  { label: "Phone", handle: CONTACT_PHONE_DISPLAY, href: CONTACT_PHONE_HREF, copyValue: CONTACT_PHONE, copyLabel: "Copy phone number", icon: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" },
  { label: "LinkedIn", handle: "dhruvsinghal6888", href: LINKEDIN_URL, icon: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" },
  { label: "GitHub", handle: "atavisticrystal6888", href: GITHUB_URL, icon: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" },
  { label: "Resume", handle: "Download PDF", href: RESUME_HREF, icon: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3" },
];

export function DirectLinks() {
  // Keyed by label, not a boolean: email and phone each own their own
  // "Copied!" state, so copying one does not blank the other.
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const handleCopy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedLabel(label);
      setTimeout(
        () => setCopiedLabel((current) => (current === label ? null : current)),
        2000
      );
    } catch {
      /* clipboard unavailable - the href still works */
    }
  };

  return (
    <div className={styles.grid}>
      {LINKS.map((link) => {
        const isExternal = link.href.startsWith("http");
        const isDownload = link.label === "Resume";
        const copied = copiedLabel === link.label;
        return (
          // The copy button sits in the tile but outside the anchor: nesting a
          // button inside a link is invalid and breaks keyboard order.
          <div key={link.label} className={styles.tile}>
            <a
              href={link.href}
              className={styles.link}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              download={isDownload ? RESUME_FILE_NAME : undefined}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={styles.icon}>
                <path d={link.icon} />
              </svg>
              <span className={styles.label}>{link.label}</span>
              {/* Only the copyable handles are live regions: announcing the
                  static ones on mount would be noise. */}
              <span
                className={styles.handle}
                aria-live={link.copyValue ? "polite" : undefined}
              >
                {copied ? "Copied!" : link.handle}
              </span>
            </a>
            {link.copyValue ? (
              <button
                type="button"
                className={styles.copy}
                aria-label={link.copyLabel}
                onClick={() => handleCopy(link.label, link.copyValue!)}
              >
                {copied ? "Copied" : "Copy"}
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
