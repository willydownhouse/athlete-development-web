import { formatDurationSeconds } from "@/lib/event-metric-display";
import { formatMetricUnit, isSecondsMetric } from "@/lib/event-metric-form";
import type { EventAggregate, EventAggregateKind, EventItemAggregate } from "@/lib/types";

export type EventsAggregateSubject = "event" | "item" | "exercise";

const COVERAGE_NOUNS: Record<EventsAggregateSubject, { singular: string; plural: string }> = {
  event: { singular: "event", plural: "events" },
  item: { singular: "item", plural: "items" },
  exercise: { singular: "exercise", plural: "exercises" },
};

export function eventsAggregateHeading(
  aggregation: EventAggregateKind,
  subject: EventsAggregateSubject = "event",
): string {
  if (aggregation === "count") {
    if (subject === "exercise") {
      return "Exercise count";
    }

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

export function formatEventsAggregateCoverage(
  result: EventAggregate | EventItemAggregate,
  subject?: EventsAggregateSubject,
  descendantNoun?: string,
): string {
  const resolvedSubject = subject ?? (isEventItemAggregate(result) ? "item" : "event");
  const matchingCount = isEventItemAggregate(result)
    ? result.matchingItemCount
    : result.matchingEventCount;
  const withValue = isEventItemAggregate(result) ? result.itemsWithValue : result.eventsWithValue;
  const { singular: noun, plural: nouns } = COVERAGE_NOUNS[resolvedSubject];

  const valueLabel = result.aggregation === "durationSeconds" ? "a duration" : "a value";
  const coverage =
    result.aggregation === "count" || withValue === matchingCount
      ? matchingCount === 1
        ? `1 ${noun}`
        : `${matchingCount} ${nouns}`
      : `${withValue} of ${matchingCount} ${nouns} had ${valueLabel}`;

  if (!isEventItemAggregate(result) || !descendantNoun || result.descendantItemsWithValue === 0) {
    return coverage;
  }

  const descendantLabel =
    result.descendantItemsWithValue === 1
      ? descendantNoun
      : descendantNoun.endsWith("s")
        ? descendantNoun
        : `${descendantNoun}s`;

  return `${coverage}, ${result.descendantItemsWithValue} ${descendantLabel}`;
}
