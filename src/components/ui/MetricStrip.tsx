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
  /**
   * "row" puts every readout on one ruled line from tablet up (case-study
   * strips). "grid" wraps them into three columns from 1024px and two from
   * 480px, so each cell has room for its value and a sentence-long caption
   * (home evidence grid); every caption in the grid is set as body text,
   * so one short label never switches style mid-grid.
   */
  layout?: "row" | "grid";
}

/**
 * Typographic data strip: ruled readouts, no boxes. Shared by the home
 * metrics and the case-study metrics so both read as the same instrument.
 */
export function MetricStrip({
  metrics,
  reveal = false,
  size = "lg",
  layout = "row",
}: MetricStripProps) {
  if (metrics.length === 0) return null;

  const grid = layout === "grid";
  const itemClass = grid ? styles.cell : styles.item;
  const caption = grid ? "prose" : "label";

  return (
    <div
      className={grid ? styles.grid : styles.strip}
      style={grid ? undefined : ({ "--strip-cols": metrics.length } as CSSProperties)}
      data-testid={grid ? "metric-grid" : undefined}
    >
      {metrics.map((m, i) =>
        reveal ? (
          <ScrollReveal
            key={m.label}
            className={itemClass}
            distance={14}
            duration={0.5}
            stagger={0.09}
            index={i}
          >
            <MetricCounter value={m.value} label={m.label} size={size} caption={caption} />
          </ScrollReveal>
        ) : (
          <div key={m.label} className={itemClass}>
            <MetricCounter value={m.value} label={m.label} size={size} caption={caption} />
          </div>
        )
      )}
    </div>
  );
}
