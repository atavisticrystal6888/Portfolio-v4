import type { CaseStudyMetric } from "@/types/project";
import { GlassCard } from "@/components/ui/GlassCard";
import styles from "./MetricChart.module.css";

interface MetricChartProps {
  metrics: CaseStudyMetric[];
}

// Plain stat tiles. The previous mini bar/doughnut charts assumed every
// value was a percentage (hardcoded 0-100 scale), which rendered counts
// like "540 assertions" as a clipped bar and "2 platforms" as a sliver -
// noise, not information. A single number needs typography, not a chart.
export function MetricChart({ metrics }: MetricChartProps) {
  return (
    <div className={styles.grid}>
      {metrics.map((m) => (
        <GlassCard key={m.label} className={styles.card}>
          <span className={styles.value}>{m.displayValue}</span>
          <span className={styles.label}>{m.label}</span>
        </GlassCard>
      ))}
    </div>
  );
}
