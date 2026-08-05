import { format } from "date-fns";

import { secondsToDurationParts } from "@/lib/event-metric-form";
import type { Event } from "@/lib/types";

export type EventFormValues = {
  eventTypeId: string;
  eventDate: string;
  eventTime: string;
  durationHours: string;
  durationMinutes: string;
  durationSeconds: string;
  intensity: string;
  title: string;
  description: string;
};

export function eventToFormValues(event: Event): EventFormValues {
  const startedAt = new Date(event.startedAt);
  const durationParts = event.durationSeconds
    ? secondsToDurationParts(event.durationSeconds)
    : { hours: "", minutes: "", seconds: "" };

  return {
    eventTypeId: event.eventTypeId,
    eventDate: format(startedAt, "yyyy-MM-dd"),
    eventTime: format(startedAt, "HH:mm"),
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
  today = format(new Date(), "yyyy-MM-dd"),
  eventTime = format(new Date(), "HH:mm"),
): EventFormValues {
  return {
    eventTypeId: defaultEventTypeId ?? "",
    eventDate: today,
    eventTime,
    durationHours: "",
    durationMinutes: "",
    durationSeconds: "",
    intensity: "",
    title: "",
    description: "",
  };
}
