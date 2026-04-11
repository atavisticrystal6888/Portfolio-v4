"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./MetricDetail.module.css";

interface MetricDetailProps {
  value: string;
  label: string;
  methodology?: string;
  baseline?: string;
  timeframe?: string;
  children?: React.ReactNode;
}

export function MetricDetail({
  value,
  label,
  methodology,
  baseline,
  timeframe,
  children,
}: MetricDetailProps) {
  const hasDetails = methodology || baseline || timeframe;
  const [expanded, setExpanded] = useState(false);
  const reduced = useReducedMotion();

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.header}
        onClick={() => hasDetails && setExpanded((v) => !v)}
        aria-expanded={hasDetails ? expanded : undefined}
        type="button"
        disabled={!hasDetails}
      >
        <span className={styles.value}>{value}</span>
        <span className={styles.label}>{label}</span>
        {hasDetails && (
          <span className={`${styles.chevron} ${expanded ? styles.chevronOpen : ""}`} aria-hidden="true">
            ▾
          </span>
        )}
      </button>

      {children}

      <AnimatePresence initial={false}>
        {expanded && hasDetails && (
          <motion.div
            className={styles.details}
            initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.25, ease: "easeInOut" }}
          >
            <dl className={styles.detailList}>
              {methodology && (
                <>
                  <dt>Methodology</dt>
                  <dd>{methodology}</dd>
                </>
              )}
              {baseline && (
                <>
                  <dt>Baseline</dt>
                  <dd>{baseline}</dd>
                </>
              )}
              {timeframe && (
                <>
                  <dt>Timeframe</dt>
                  <dd>{timeframe}</dd>
                </>
              )}
            </dl>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
