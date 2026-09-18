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
  endedAt: string | null;
  title: string | null;
  description: string | null;
  durationSeconds: number | null;
  intensity: Event["intensity"];
  structuredData?: Record<string, unknown>;
  metrics: EventMetricInput[];
  items: EventItemInput[];
};

export type EventCopyCreateBody = {
  eventTypeId: string;
  startedAt: string;
  endedAt?: string;
  source: "form";
  title?: string;
  description?: string;
  durationSeconds?: number;
  intensity?: EventIntensity;
  structuredData?: Record<string, unknown>;
  metrics?: EventMetricInput[];
  items?: EventItemInput[];
};

function asStructuredData(value: unknown): Record<string, unknown> | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }

  return value as Record<string, unknown>;
}

export function eventToCopySource(event: Event): EventCopySource {
  return {
    eventTypeId: event.eventTypeId,
    startedAt: event.startedAt,
    endedAt: event.endedAt,
    title: event.title,
    description: event.description,
    durationSeconds: event.durationSeconds,
    intensity: event.intensity,
    structuredData: asStructuredData(event.structuredData),
    metrics: eventMetricsToInputs(event.metrics ?? []),
    items: eventItemsToInputs(event.items ?? []),
  };
}

function shiftTimestamp(
  timestamp: string | undefined,
  offsetMilliseconds: number,
): string | undefined {
  if (!timestamp) {
    return undefined;
  }

  const time = new Date(timestamp).getTime();
  return Number.isNaN(time) ? timestamp : new Date(time + offsetMilliseconds).toISOString();
}

function copyEventItemsForStart(
  items: EventItemInput[],
  originalStartedAt: Date,
  copiedStartedAt: string,
): EventItemInput[] {
  const copiedStartTime = new Date(copiedStartedAt).getTime();
  const offsetMilliseconds = copiedStartTime - originalStartedAt.getTime();

  return items.map((item) => {
    const copied: EventItemInput = {
      ...item,
      ...(item.startedAt ? { startedAt: shiftTimestamp(item.startedAt, offsetMilliseconds) } : {}),
      ...(item.endedAt ? { endedAt: shiftTimestamp(item.endedAt, offsetMilliseconds) } : {}),
      ...(item.children
        ? { children: copyEventItemsForStart(item.children, originalStartedAt, copiedStartedAt) }
        : {}),
    };
    delete copied.id;
    return copied;
  });
}

function buildEventCopyCreateBody(
  source: Pick<
    EventCopySource,
    | "eventTypeId"
    | "title"
    | "description"
    | "durationSeconds"
    | "intensity"
    | "structuredData"
    | "metrics"
    | "items"
    | "endedAt"
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

  const offsetMilliseconds = new Date(startedAt).getTime() - timeReference.getTime();
  const endedAt = source.endedAt ? shiftTimestamp(source.endedAt, offsetMilliseconds) : undefined;

  return {
    eventTypeId: source.eventTypeId,
    startedAt,
    ...(endedAt ? { endedAt } : {}),
    source: "form",
    title: source.title ?? undefined,
    description: source.description ?? undefined,
    durationSeconds: source.durationSeconds ?? undefined,
    intensity: source.intensity ?? undefined,
    structuredData: source.structuredData,
    ...(source.metrics.length > 0 ? { metrics: source.metrics } : {}),
    ...(source.items.length > 0
      ? { items: copyEventItemsForStart(source.items, timeReference, startedAt) }
      : {}),
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
