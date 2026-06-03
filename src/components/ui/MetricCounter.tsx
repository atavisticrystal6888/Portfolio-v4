"use client";

import styles from "./MetricCounter.module.css";

interface MetricCounterProps {
  value: string;
  label: string;
}

export function MetricCounter({ value, label }: MetricCounterProps) {
  return (
    <div className={styles.metric}>
      <span className={styles.value}>{value}</span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
