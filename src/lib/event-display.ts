import { formatDurationSeconds } from "@/lib/event-metric-display";
import { formatZonedShortDate, formatZonedTime } from "@/lib/time-zone";
import type { Event, EventIntensity } from "@/lib/types";

const EVENT_LIST_DESCRIPTION_PREVIEW_LENGTH = 200;

function formatIntensity(intensity: EventIntensity): string {
  return intensity.charAt(0).toUpperCase() + intensity.slice(1);
}

function formatTime(startedAt: string, timeZone: string): string {
  return formatZonedTime(timeZone, new Date(startedAt));
}

function formatEventListDate(startedAt: string, timeZone: string): string {
  return formatZonedShortDate(timeZone, new Date(startedAt));
}

export function eventShortLabel(name: string): string {
  const words = name.trim().split(/\s+/);

  if (words.length === 1) {
    return (words[0] ?? "").slice(0, 3);
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

export function eventTitle(event: Event): string {
  return event.title ?? event.eventType.name;
}

const EVENT_LIST_NOTE_MAX_LENGTH = EVENT_LIST_DESCRIPTION_PREVIEW_LENGTH;

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}…`;
}

type EventDetailOptions = {
  showDate?: boolean;
  timeZone: string;
};

export function eventDetail(event: Event, options: EventDetailOptions): string {
  const parts: string[] = [];

  if (options.showDate) {
    parts.push(formatEventListDate(event.startedAt, options.timeZone));
  }

  parts.push(formatTime(event.startedAt, options.timeZone));

  if (event.durationSeconds) {
    parts.push(formatDurationSeconds(event.durationSeconds));
  }

  if (event.intensity) {
    parts.push(formatIntensity(event.intensity));
  }

  if (event.description) {
    parts.push(truncateText(event.description, EVENT_LIST_NOTE_MAX_LENGTH));
  }

  return parts.join(" · ");
}
