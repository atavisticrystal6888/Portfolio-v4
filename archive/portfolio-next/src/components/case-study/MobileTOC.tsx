"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TableOfContents } from "@/components/blog/TableOfContents";
import styles from "./MobileTOC.module.css";

export function MobileTOC() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className={styles.fab}
        onClick={() => setOpen(true)}
        aria-label="Jump to section"
        type="button"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className={styles.backdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              className={styles.sheet}
              role="dialog"
              aria-modal="true"
              aria-label="Table of contents"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => {
                // Close on link click
                if ((e.target as HTMLElement).tagName === "A") {
                  setOpen(false);
                }
              }}
            >
              <div className={styles.handle} aria-hidden="true" />
              <TableOfContents />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
