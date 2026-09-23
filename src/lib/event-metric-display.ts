import { isSecondsMetric } from "./event-metric-form";
import { DEFAULT_APP_LOCALE, type AppLocale } from "./locale";
import { getMessages } from "./messages";
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
  locale: AppLocale = DEFAULT_APP_LOCALE,
): string {
  const { metricDefinition } = metric;
  const messages = getMessages(locale);

  if (metricDefinition.valueType === "boolean") {
    if (metric.booleanValue === null) {
      return messages.common.notSet;
    }

    return metric.booleanValue ? messages.common.yes : messages.common.no;
  }

  if (metricDefinition.valueType === "text") {
    return metric.textValue?.trim() || messages.common.notSet;
  }

  if (metric.numericValue === null) {
    return messages.common.notSet;
  }

  const numericValue = Number(metric.numericValue);

  if (isSecondsMetric(metricDefinition.canonicalUnit)) {
    return formatDurationSeconds(numericValue);
  }

  return metric.numericValue;
}
