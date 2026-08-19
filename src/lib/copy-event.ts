import type { EventItemInput, EventMetricInput } from "@/lib/api";
import { eventItemsToInputs } from "@/lib/event-item-form";
import { eventMetricsToInputs } from "@/lib/event-metric-form";
import { getZonedTimeString, zonedDateTimeToUtcIso } from "@/lib/time-zone";
import type { Event, EventIntensity } from "@/lib/types";

/** Keep in sync with athlete-development-service EVENT_BATCH_CREATE_MAX_ITEMS. */
export const EVENT_BATCH_CREATE_MAX_ITEMS = 20;

export type EventCopySource = {
  eventTypeId: string;
  startedAt: string;
  title: string | null;
  description: string | null;
  durationSeconds: number | null;
  intensity: Event["intensity"];
  metrics: EventMetricInput[];
  items: EventItemInput[];
};

export type EventCopyCreateBody = {
  eventTypeId: string;
  startedAt: string;
  source: "form";
  title?: string;
  description?: string;
  durationSeconds?: number;
  intensity?: EventIntensity;
  metrics?: EventMetricInput[];
  items?: EventItemInput[];
};

export function eventToCopySource(event: Event): EventCopySource {
  return {
    eventTypeId: event.eventTypeId,
    startedAt: event.startedAt,
    title: event.title,
    description: event.description,
    durationSeconds: event.durationSeconds,
    intensity: event.intensity,
    metrics: eventMetricsToInputs(event.metrics ?? []),
    items: eventItemsToInputs(event.items ?? []),
  };
}

function buildEventCopyCreateBody(
  source: Pick<
    EventCopySource,
    "eventTypeId" | "title" | "description" | "durationSeconds" | "intensity" | "metrics" | "items"
  >,
  timeZone: string,
  targetDate: string,
  timeReference: Date,
): EventCopyCreateBody | null {
  const eventTime = getZonedTimeString(timeZone, timeReference);
  const startedAt = zonedDateTimeToUtcIso(targetDate, eventTime, timeZone);

  if (!startedAt) {
    return null;
  }

  return {
    eventTypeId: source.eventTypeId,
    startedAt,
    source: "form",
    title: source.title ?? undefined,
    description: source.description ?? undefined,
    durationSeconds: source.durationSeconds ?? undefined,
    intensity: source.intensity ?? undefined,
    ...(source.metrics.length > 0 ? { metrics: source.metrics } : {}),
    ...(source.items.length > 0 ? { items: source.items } : {}),
  };
}

export function buildCopyForDatePreservingTime(
  source: EventCopySource,
  timeZone: string,
  targetDate: string,
): EventCopyCreateBody | null {
  return buildEventCopyCreateBody(source, timeZone, targetDate, new Date(source.startedAt));
}

export function buildDayCopyForDate(
  sources: EventCopySource[],
  timeZone: string,
  targetDate: string,
): { events: EventCopyCreateBody[] } | { error: string } {
  if (sources.length === 0) {
    return { error: "No events to copy" };
  }

  if (sources.length > EVENT_BATCH_CREATE_MAX_ITEMS) {
    return {
      error: `You can copy up to ${EVENT_BATCH_CREATE_MAX_ITEMS} events at a time`,
    };
  }

  const events: EventCopyCreateBody[] = [];

  for (const source of sources) {
    const body = buildCopyForDatePreservingTime(source, timeZone, targetDate);

    if (!body) {
      return { error: "Unable to build event time" };
    }

    events.push(body);
  }

  return { events };
}
