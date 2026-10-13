"use client";

import { cn, isProseCaption } from "@/lib/utils";
import styles from "./MetricCounter.module.css";

interface MetricCounterProps {
  value: string;
  label: string;
  /** "sm" keeps the readout under a nearby title instead of leading it. */
  size?: "lg" | "sm";
  /**
   * "label" sets every caption as a mono field label. "auto" keeps that only
   * for short labels (four words or fewer) and sets a longer caption as a
   * sentence-case line of body text, which reads as a sentence instead of a
   * block of letter-spaced capitals. "prose" sets every caption as body
   * text, for a strip whose captions must all match (home evidence grid).
   */
  caption?: "label" | "auto" | "prose";
}

export function MetricCounter({
  value,
  label,
  size = "lg",
  caption = "label",
}: MetricCounterProps) {
  const prose = caption === "prose" || (caption === "auto" && isProseCaption(label));
  // A word in the value slot ("Sourced", "Continue") is set a step smaller
  // than a numeral so it fits its cell whole instead of breaking mid-word.
  const word = !/\d/.test(value);

  return (
    <div className={cn(styles.metric, size === "sm" && styles.sm)}>
      <span className={cn(styles.value, word && styles.word)} data-testid="metric-value">
        {value}
      </span>
      <span className={prose ? styles.prose : styles.label} data-testid="metric-caption">
        {label}
      </span>
    </div>
  );
}
