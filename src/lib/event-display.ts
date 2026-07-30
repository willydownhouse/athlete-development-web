import { format } from "date-fns";

import type { Event, EventIntensity } from "@/lib/types";

const EVENT_LIST_DESCRIPTION_PREVIEW_LENGTH = 200;

function formatIntensity(intensity: EventIntensity): string {
  return intensity.charAt(0).toUpperCase() + intensity.slice(1);
}

function formatDuration(durationSeconds: number): string {
  const minutes = Math.round(durationSeconds / 60);
  return `${minutes} min`;
}

function formatTime(startedAt: string): string {
  return format(new Date(startedAt), "HH:mm");
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

export function eventDetail(event: Event): string {
  const parts: string[] = [formatTime(event.startedAt)];

  if (event.durationSeconds) {
    parts.push(formatDuration(event.durationSeconds));
  }

  if (event.intensity) {
    parts.push(formatIntensity(event.intensity));
  }

  if (event.description) {
    parts.push(truncateText(event.description, EVENT_LIST_NOTE_MAX_LENGTH));
  }

  return parts.join(" · ");
}
