import { format } from "date-fns";

import type { Event } from "@/lib/types";

export type EventFormValues = {
  eventTypeId: string;
  eventDate: string;
  eventTime: string;
  durationMinutes: string;
  intensity: string;
  title: string;
  description: string;
};

export function eventToFormValues(event: Event): EventFormValues {
  const startedAt = new Date(event.startedAt);

  return {
    eventTypeId: event.eventTypeId,
    eventDate: format(startedAt, "yyyy-MM-dd"),
    eventTime: format(startedAt, "HH:mm"),
    durationMinutes: event.durationSeconds ? String(Math.round(event.durationSeconds / 60)) : "",
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
    durationMinutes: "",
    intensity: "",
    title: "",
    description: "",
  };
}
