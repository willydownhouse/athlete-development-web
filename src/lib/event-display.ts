import { format } from "date-fns";

import { formatDurationSeconds } from "@/lib/event-metric-display";
import type { Event, EventIntensity } from "@/lib/types";

const EVENT_LIST_DESCRIPTION_PREVIEW_LENGTH = 200;

function formatIntensity(intensity: EventIntensity): string {
  return intensity.charAt(0).toUpperCase() + intensity.slice(1);
}

function formatTime(startedAt: string): string {
  return format(new Date(startedAt), "HH:mm");
}

function formatEventListDate(startedAt: string): string {
  const date = new Date(startedAt);
  const now = new Date();
  const pattern = date.getFullYear() === now.getFullYear() ? "EEE d MMM" : "EEE d MMM yyyy";

  return format(date, pattern);
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
};

export function eventDetail(event: Event, options: EventDetailOptions = {}): string {
  const parts: string[] = [];

  if (options.showDate) {
    parts.push(formatEventListDate(event.startedAt));
  }

  parts.push(formatTime(event.startedAt));

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
