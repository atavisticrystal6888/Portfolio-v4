"use client";

import { useState, useEffect, useRef } from "react";
import { useIntersection } from "@/hooks/useIntersection";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./MetricCounter.module.css";

interface MetricCounterProps {
  value: string;
  label: string;
  duration?: number;
}

export function MetricCounter({ value, label, duration = 2000 }: MetricCounterProps) {
  const { ref, isIntersecting } = useIntersection<HTMLDivElement>({ threshold: 0.3 });
  const prefersReduced = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(prefersReduced ? value : "0");
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isIntersecting || hasAnimated.current) return;
    hasAnimated.current = true;

    if (prefersReduced) {
      requestAnimationFrame(() => setDisplayValue(value));
      return;
    }

    const numericMatch = value.match(/[\d.]+/);
    if (!numericMatch) {
      requestAnimationFrame(() => setDisplayValue(value));
      return;
    }

    const target = parseFloat(numericMatch[0]!);
    const prefix = value.slice(0, value.indexOf(numericMatch[0]!));
    const suffix = value.slice(value.indexOf(numericMatch[0]!) + numericMatch[0]!.length);
    const isFloat = numericMatch[0]!.includes(".");
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      setDisplayValue(
        `${prefix}${isFloat ? current.toFixed(1) : Math.round(current)}${suffix}`
      );
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [isIntersecting, prefersReduced, value, duration]);

  return (
    <div ref={ref} className={styles.metric}>
      <span className={styles.value}>{displayValue}</span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
