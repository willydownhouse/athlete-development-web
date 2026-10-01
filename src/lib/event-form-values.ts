import { secondsToDurationParts } from "@/lib/event-metric-form";
import { getSystemTimeZone, getZonedDateString, getZonedTimeString } from "@/lib/time-zone";
import type { Event } from "@/lib/types";

export type EventFormValues = {
  eventTypeId: string;
  eventDate: string;
  eventTime: string;
  endDate: string;
  endTime: string;
  durationHours: string;
  durationMinutes: string;
  durationSeconds: string;
  intensity: string;
  title: string;
  description: string;
};

export function eventToFormValues(event: Event, timeZone = getSystemTimeZone()): EventFormValues {
  const startedAt = new Date(event.startedAt);
  const endedAt = event.endedAt ? new Date(event.endedAt) : null;
  const durationParts = event.durationSeconds
    ? secondsToDurationParts(event.durationSeconds)
    : { hours: "", minutes: "", seconds: "" };

  return {
    eventTypeId: event.eventTypeId,
    eventDate: getZonedDateString(timeZone, startedAt),
    eventTime: getZonedTimeString(timeZone, startedAt),
    endDate: endedAt ? getZonedDateString(timeZone, endedAt) : "",
    endTime: endedAt ? getZonedTimeString(timeZone, endedAt) : "",
    durationHours: durationParts.hours,
    durationMinutes: durationParts.minutes,
    durationSeconds: durationParts.seconds,
    intensity: event.intensity ?? "",
    title: event.title ?? "",
    description: event.description ?? "",
  };
}

export function defaultCreateFormValues(
  defaultEventTypeId?: string,
  today = getZonedDateString(getSystemTimeZone()),
  eventTime = getZonedTimeString(getSystemTimeZone()),
): EventFormValues {
  return {
    eventTypeId: defaultEventTypeId ?? "",
    eventDate: today,
    eventTime,
    endDate: "",
    endTime: "",
    durationHours: "",
    durationMinutes: "",
    durationSeconds: "",
    intensity: "",
    title: "",
    description: "",
  };
}
