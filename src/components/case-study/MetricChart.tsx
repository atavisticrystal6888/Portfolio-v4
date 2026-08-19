import type { CaseStudyMetric } from "@/types/project";
import { MetricStrip } from "@/components/ui/MetricStrip";

interface MetricChartProps {
  metrics: CaseStudyMetric[];
}

// Plain readouts, not charts. The previous mini bar/doughnut charts assumed
// every value was a percentage (hardcoded 0-100 scale), which rendered counts
// like "540 assertions" as a clipped bar and "2 platforms" as a sliver -
// noise, not information. A single number needs typography, not a chart.
export function MetricChart({ metrics }: MetricChartProps) {
  return (
    <MetricStrip
      metrics={metrics.map((m) => ({ value: m.displayValue, label: m.label }))}
    />
  );
}
