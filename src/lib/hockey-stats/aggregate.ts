import { formatDurationSeconds } from "@/lib/event-metric-display";
import { formatMetricUnit, isSecondsMetric } from "@/lib/event-metric-form";

export function formatHockeyStatTotal(stat: {
  key?: string;
  name: string;
  canonicalUnit: string | null;
  total: number;
}): string {
  if (isSecondsMetric(stat.canonicalUnit)) {
    return formatDurationSeconds(stat.total);
  }

  const formattedTotal = Number.isInteger(stat.total) ? String(stat.total) : stat.total.toFixed(1);

  if (stat.key === "plus_minus") {
    return formattedTotal;
  }

  const unit = formatMetricUnit(stat.canonicalUnit);

  return unit ? `${formattedTotal} ${unit}` : formattedTotal;
}
