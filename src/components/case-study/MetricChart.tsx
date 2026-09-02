import type { CaseStudyMetric } from "@/types/project";
import { MetricStrip } from "@/components/ui/MetricStrip";

interface MetricChartProps {
  metrics: CaseStudyMetric[];
}

/**
 * Which metrics the outcome strip shows. Product outcomes (what a user would
 * feel) lead; build facts (routes, workers, assertions) belong under the hood
 * later on the page. Frontmatter that tags nothing shows everything, so
 * untouched case studies keep their strip.
 */
export function selectStripMetrics(metrics: CaseStudyMetric[]): CaseStudyMetric[] {
  const product = metrics.filter((m) => m.kind === "product");
  return product.length > 0 ? product : metrics;
}

// Plain readouts, not charts. The previous mini bar/doughnut charts assumed
// every value was a percentage (hardcoded 0-100 scale), which rendered counts
// like "540 assertions" as a clipped bar and "2 platforms" as a sliver -
// noise, not information. A single number needs typography, not a chart.
export function MetricChart({ metrics }: MetricChartProps) {
  return (
    <MetricStrip
      metrics={selectStripMetrics(metrics).map((m) => ({
        value: m.displayValue,
        label: m.label,
      }))}
    />
  );
}
