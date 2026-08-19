import { MetricCounter } from "@/components/ui/MetricCounter";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { getHomeMetrics } from "@/lib/stats";
import styles from "./MetricsGrid.module.css";

export function MetricsGrid() {
  const metrics = getHomeMetrics();
  return (
    <div className={styles.strip}>
      {metrics.map((m, i) => (
        <ScrollReveal
          key={m.label}
          className={styles.item}
          distance={14}
          duration={0.5}
          stagger={0.09}
          index={i}
        >
          <MetricCounter value={m.value} label={m.label} />
        </ScrollReveal>
      ))}
    </div>
  );
}
