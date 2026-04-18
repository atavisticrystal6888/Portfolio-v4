import { MetricCounter } from "@/components/ui/MetricCounter";
import { getHomeMetrics } from "@/lib/stats";
import styles from "./MetricsGrid.module.css";

export function MetricsGrid() {
  const metrics = getHomeMetrics();
  return (
    <div className={styles.grid}>
      {metrics.map((m) => (
        <MetricCounter key={m.label} value={m.value} label={m.label} />
      ))}
    </div>
  );
}
