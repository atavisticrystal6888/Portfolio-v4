import { MetricStrip } from "@/components/ui/MetricStrip";
import { getHomeMetrics } from "@/lib/stats";

export function MetricsGrid() {
  return <MetricStrip metrics={getHomeMetrics()} reveal />;
}
