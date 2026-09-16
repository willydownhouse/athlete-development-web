import { formatDurationSeconds } from "@/lib/event-metric-display";
import { formatMetricUnit, isSecondsMetric } from "@/lib/event-metric-form";
import type { EventAggregate, EventAggregateKind } from "@/lib/types";

export function eventsAggregateHeading(aggregation: EventAggregateKind): string {
  if (aggregation === "count") {
    return "Event count";
  }

  if (aggregation === "durationSeconds") {
    return "Total duration";
  }

  if (aggregation === "metricAverage") {
    return "Metric average";
  }

  return "Metric total";
}

export function formatEventsAggregateTotal(result: EventAggregate): string {
  if (result.aggregation === "durationSeconds" || isSecondsMetric(result.canonicalUnit)) {
    return formatDurationSeconds(result.total);
  }

  const formattedTotal = Number.isInteger(result.total)
    ? String(result.total)
    : result.total.toFixed(1);
  const unit = formatMetricUnit(result.canonicalUnit);

  return unit ? `${formattedTotal} ${unit}` : formattedTotal;
}

export function formatEventsAggregateCoverage(result: EventAggregate): string {
  if (result.aggregation === "count") {
    return result.matchingEventCount === 1 ? "1 event" : `${result.matchingEventCount} events`;
  }

  if (result.eventsWithValue === result.matchingEventCount) {
    return result.matchingEventCount === 1 ? "1 event" : `${result.matchingEventCount} events`;
  }

  const valueLabel = result.aggregation === "durationSeconds" ? "a duration" : "a value";
  return `${result.eventsWithValue} of ${result.matchingEventCount} events had ${valueLabel}`;
}
