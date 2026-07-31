import { formatMetricUnit, isSecondsMetric } from "./event-metric-form";
import type { EventMetric } from "@/lib/types";
import { getDefaultDisplayMessages, type DisplayMessages } from "./display-messages";

export function formatDurationSeconds(
  seconds: number,
  messages: DisplayMessages = getDefaultDisplayMessages(),
): string {
  const normalized = Math.max(0, Math.round(seconds));

  if (normalized >= 3600) {
    const hours = Math.floor(normalized / 3600);
    const minutes = Math.floor((normalized % 3600) / 60);

    if (minutes > 0) {
      return messages.durationHoursMinutes(hours, minutes);
    }

    return messages.durationHours(hours);
  }

  if (normalized >= 60) {
    const minutes = Math.floor(normalized / 60);
    const remainingSeconds = normalized % 60;

    if (remainingSeconds > 0) {
      return messages.durationMinutesSeconds(minutes, remainingSeconds);
    }

    return messages.durationMinutes(minutes);
  }

  return messages.durationSeconds(normalized);
}

export function formatEventMetricValue(
  metric: EventMetric,
  messages: DisplayMessages = getDefaultDisplayMessages(),
): string {
  const { metricDefinition } = metric;

  if (metricDefinition.valueType === "boolean") {
    if (metric.booleanValue === null) {
      return messages.notSet;
    }

    return metric.booleanValue ? messages.yes : messages.no;
  }

  if (metricDefinition.valueType === "text") {
    return metric.textValue?.trim() || messages.notSet;
  }

  if (metric.numericValue === null) {
    return messages.notSet;
  }

  const numericValue = Number(metric.numericValue);

  if (isSecondsMetric(metricDefinition.canonicalUnit)) {
    return formatDurationSeconds(numericValue, messages);
  }

  const unit = metric.unit ?? metricDefinition.canonicalUnit;
  const formattedUnit = unit ? formatMetricUnit(unit) : null;

  if (formattedUnit) {
    return `${metric.numericValue} ${formattedUnit}`;
  }

  return metric.numericValue;
}

export function sortEventMetrics(metrics: EventMetric[]): EventMetric[] {
  return [...metrics].sort((a, b) =>
    a.metricDefinition.name.localeCompare(b.metricDefinition.name),
  );
}
