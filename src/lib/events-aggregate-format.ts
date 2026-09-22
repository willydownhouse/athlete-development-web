import { formatDurationSeconds } from "@/lib/event-metric-display";
import { formatMetricUnit, isSecondsMetric } from "@/lib/event-metric-form";
import { DEFAULT_APP_LOCALE, type AppLocale } from "@/lib/locale";
import { getMessages } from "@/lib/messages";
import type { EventAggregate, EventAggregateKind, EventItemAggregate } from "@/lib/types";

export type EventsAggregateSubject = "event" | "item" | "exercise";

export function eventsAggregateHeading(
  aggregation: EventAggregateKind,
  subject: EventsAggregateSubject = "event",
  locale: AppLocale = DEFAULT_APP_LOCALE,
): string {
  const messages = getMessages(locale);

  if (aggregation === "count") {
    if (subject === "exercise") {
      return messages.events.showExerciseCount;
    }

    return subject === "item" ? messages.events.showItemCount : messages.events.showEventCount;
  }

  if (aggregation === "durationSeconds") {
    return messages.events.showTotalDuration;
  }

  if (aggregation === "metricAverage") {
    return messages.events.showMetricAverage;
  }

  return messages.events.showMetricTotal;
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
  locale: AppLocale = DEFAULT_APP_LOCALE,
): string {
  const messages = getMessages(locale);
  const resolvedSubject = subject ?? (isEventItemAggregate(result) ? "item" : "event");
  const matchingCount = isEventItemAggregate(result)
    ? result.matchingItemCount
    : result.matchingEventCount;
  const withValue = isEventItemAggregate(result) ? result.itemsWithValue : result.eventsWithValue;
  const { singular: noun, plural: nouns } = messages.events.aggregateNouns[resolvedSubject];

  const valueLabel =
    result.aggregation === "durationSeconds"
      ? messages.events.aggregateADuration
      : messages.events.aggregateAValue;
  const coverage =
    result.aggregation === "count" || withValue === matchingCount
      ? messages.events.aggregateCount(matchingCount, noun, nouns)
      : messages.events.aggregatePartial(withValue, matchingCount, nouns, valueLabel);

  if (!isEventItemAggregate(result) || !descendantNoun || result.descendantItemsWithValue === 0) {
    return coverage;
  }

  const descendantLabel =
    result.descendantItemsWithValue === 1 || locale === "fi" || descendantNoun.endsWith("s")
      ? descendantNoun
      : `${descendantNoun}s`;

  return `${coverage}, ${result.descendantItemsWithValue} ${descendantLabel}`;
}
