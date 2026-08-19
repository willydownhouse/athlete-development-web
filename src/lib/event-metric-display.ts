import { isSecondsMetric } from "./event-metric-form";
import type { EventItemMetric, EventMetric, MetricDefinition } from "./types";

type MetricDisplayValue = {
  numericValue: string | null;
  textValue: string | null;
  booleanValue: boolean | null;
  metricDefinition: MetricDefinition;
};

export function formatDurationSeconds(seconds: number): string {
  const normalized = Math.max(0, Math.round(seconds));

  if (normalized >= 3600) {
    const hours = Math.floor(normalized / 3600);
    const minutes = Math.floor((normalized % 3600) / 60);

    if (minutes > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${hours}h`;
  }

  if (normalized >= 60) {
    const minutes = Math.floor(normalized / 60);
    const remainingSeconds = normalized % 60;

    if (remainingSeconds > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }

    return `${minutes} min`;
  }

  return `${normalized}s`;
}

export function formatEventMetricValue(
  metric: EventMetric | EventItemMetric | MetricDisplayValue,
): string {
  const { metricDefinition } = metric;

  if (metricDefinition.valueType === "boolean") {
    if (metric.booleanValue === null) {
      return "Not set";
    }

    return metric.booleanValue ? "Yes" : "No";
  }

  if (metricDefinition.valueType === "text") {
    return metric.textValue?.trim() || "Not set";
  }

  if (metric.numericValue === null) {
    return "Not set";
  }

  const numericValue = Number(metric.numericValue);

  if (isSecondsMetric(metricDefinition.canonicalUnit)) {
    return formatDurationSeconds(numericValue);
  }

  return metric.numericValue;
}
