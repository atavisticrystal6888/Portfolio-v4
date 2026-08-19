"use client";

import { cn } from "@/lib/utils";
import styles from "./MetricCounter.module.css";

interface MetricCounterProps {
  value: string;
  label: string;
  /** "sm" keeps the readout under a nearby title instead of leading it. */
  size?: "lg" | "sm";
}

export function MetricCounter({ value, label, size = "lg" }: MetricCounterProps) {
  return (
    <div className={cn(styles.metric, size === "sm" && styles.sm)}>
      <span className={styles.value}>{value}</span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
