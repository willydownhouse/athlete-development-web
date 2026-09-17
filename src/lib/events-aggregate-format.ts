import { formatDurationSeconds } from "@/lib/event-metric-display";
import { formatMetricUnit, isSecondsMetric } from "@/lib/event-metric-form";
import type { EventAggregate, EventAggregateKind, EventItemAggregate } from "@/lib/types";

export function eventsAggregateHeading(
  aggregation: EventAggregateKind,
  subject: "event" | "item" = "event",
): string {
  if (aggregation === "count") {
    return subject === "item" ? "Item count" : "Event count";
  }

  if (aggregation === "durationSeconds") {
    return "Total duration";
  }

  if (aggregation === "metricAverage") {
    return "Metric average";
  }

  return "Metric total";
}

export function formatEventsAggregateTotal(
  result: Pick<EventAggregate, "aggregation" | "canonicalUnit" | "total">,
): string {
  if (result.aggregation === "durationSeconds" || isSecondsMetric(result.canonicalUnit)) {
    return formatDurationSeconds(result.total);
  }

  const formattedTotal = Number.isInteger(result.total)
    ? String(result.total)
    : result.total.toFixed(1);
  const unit = formatMetricUnit(result.canonicalUnit);

  return unit ? `${formattedTotal} ${unit}` : formattedTotal;
}

function isEventItemAggregate(
  result: EventAggregate | EventItemAggregate,
): result is EventItemAggregate {
  return "matchingItemCount" in result;
}

export function formatEventsAggregateCoverage(result: EventAggregate | EventItemAggregate): string {
  const subject = isEventItemAggregate(result) ? "item" : "event";
  const matchingCount = isEventItemAggregate(result)
    ? result.matchingItemCount
    : result.matchingEventCount;
  const withValue = isEventItemAggregate(result) ? result.itemsWithValue : result.eventsWithValue;
  const noun = subject === "item" ? "item" : "event";
  const nouns = subject === "item" ? "items" : "events";

  if (result.aggregation === "count") {
    return matchingCount === 1 ? `1 ${noun}` : `${matchingCount} ${nouns}`;
  }

  if (withValue === matchingCount) {
    return matchingCount === 1 ? `1 ${noun}` : `${matchingCount} ${nouns}`;
  }

  const valueLabel = result.aggregation === "durationSeconds" ? "a duration" : "a value";
  return `${withValue} of ${matchingCount} ${nouns} had ${valueLabel}`;
}
