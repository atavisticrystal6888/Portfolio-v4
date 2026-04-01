import { MetricCounter } from "@/components/ui/MetricCounter";
import styles from "./MetricsGrid.module.css";

const METRICS = [
  { value: "10×", label: "Lead Gen" },
  { value: "4×", label: "Content Reach" },
  { value: "~15%", label: "Churn Reduction" },
  { value: "3", label: "Hackathon Wins" },
  { value: "3", label: "Internships" },
];

export function MetricsGrid() {
  return (
    <div className={styles.grid}>
      {METRICS.map((m) => (
        <MetricCounter key={m.label} value={m.value} label={m.label} />
      ))}
    </div>
  );
}
