"use client";

import { useRef, useEffect } from "react";
import {
  Chart,
  BarController,
  BarElement,
  DoughnutController,
  ArcElement,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import type { CaseStudyMetric } from "@/types/project";
import { useTheme } from "@/hooks/useTheme";
import { GlassCard } from "@/components/ui/GlassCard";
import styles from "./MetricChart.module.css";

Chart.register(
  BarController, BarElement,
  DoughnutController, ArcElement,
  LineController, LineElement, PointElement,
  CategoryScale, LinearScale,
  Tooltip, Legend
);

interface MetricChartProps {
  metrics: CaseStudyMetric[];
}

export function MetricChart({ metrics }: MetricChartProps) {
  return (
    <div className={styles.grid}>
      {metrics.map((m) => (
        <GlassCard key={m.label} className={styles.card}>
          <span className={styles.value}>{m.displayValue}</span>
          <span className={styles.label}>{m.label}</span>
          <MiniChart metric={m} />
        </GlassCard>
      ))}
    </div>
  );
}

function MiniChart({ metric }: { metric: CaseStudyMetric }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const { mode } = useTheme();

  useEffect(() => {
    if (!canvasRef.current) return;
    chartRef.current?.destroy();

    const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#6366f1";
    const remaining = 100 - metric.value;

    if (metric.chartType === "doughnut") {
      chartRef.current = new Chart(canvasRef.current, {
        type: "doughnut",
        data: {
          labels: [metric.label, "Remaining"],
          datasets: [{ data: [metric.value, remaining], backgroundColor: [accent, mode === "dark" ? "#1e1e2e" : "#e5e7eb"], borderWidth: 0 }],
        },
        options: { responsive: true, maintainAspectRatio: true, cutout: "70%", plugins: { legend: { display: false }, tooltip: { enabled: false } } },
      });
    } else {
      chartRef.current = new Chart(canvasRef.current, {
        type: "bar",
        data: {
          labels: [metric.label],
          datasets: [{ data: [metric.value], backgroundColor: accent, borderRadius: 4, barPercentage: 0.5 }],
        },
        options: {
          responsive: true, maintainAspectRatio: true,
          scales: { x: { display: false }, y: { display: false, max: 100 } },
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
        },
      });
    }

    return () => { chartRef.current?.destroy(); };
  }, [metric, mode]);

  return (
    <div className={styles.chartWrap}>
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
}
