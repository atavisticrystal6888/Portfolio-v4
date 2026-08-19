import type { CSSProperties } from "react";
import { MetricCounter } from "@/components/ui/MetricCounter";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import styles from "./MetricStrip.module.css";

export interface StripMetric {
  value: string;
  label: string;
}

interface MetricStripProps {
  metrics: StripMetric[];
  /** Stagger the readouts in as the strip enters the viewport. */
  reveal?: boolean;
  size?: "lg" | "sm";
}

/**
 * Typographic data strip: one ruled row of readouts, no boxes. Shared by the
 * home metrics and the case-study metrics so both read as the same instrument.
 */
export function MetricStrip({ metrics, reveal = false, size = "lg" }: MetricStripProps) {
  if (metrics.length === 0) return null;

  return (
    <div
      className={styles.strip}
      style={{ "--strip-cols": metrics.length } as CSSProperties}
    >
      {metrics.map((m, i) =>
        reveal ? (
          <ScrollReveal
            key={m.label}
            className={styles.item}
            distance={14}
            duration={0.5}
            stagger={0.09}
            index={i}
          >
            <MetricCounter value={m.value} label={m.label} size={size} />
          </ScrollReveal>
        ) : (
          <div key={m.label} className={styles.item}>
            <MetricCounter value={m.value} label={m.label} size={size} />
          </div>
        )
      )}
    </div>
  );
}
