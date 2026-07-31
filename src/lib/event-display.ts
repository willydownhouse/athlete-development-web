import { format } from "date-fns";

import messages from "../../messages/en.json";
import { getDefaultDisplayMessages, type DisplayMessages } from "@/lib/display-messages";
import type { Event, EventIntensity } from "@/lib/types";

const EVENT_LIST_DESCRIPTION_PREVIEW_LENGTH = 200;

export type EventDisplayLabels = {
  intensity: Record<EventIntensity, string>;
  display: DisplayMessages;
};

function getDefaultEventDisplayLabels(): EventDisplayLabels {
  const intensity = messages.events.form.intensity;

  return {
    intensity: {
      light: intensity.light,
      moderate: intensity.moderate,
      hard: intensity.hard,
    },
    display: getDefaultDisplayMessages(),
  };
}

function formatDuration(
  durationSeconds: number,
  display: DisplayMessages = getDefaultDisplayMessages(),
): string {
  const minutes = Math.round(durationSeconds / 60);
  return display.durationMinutesShort(minutes);
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

export function eventDetail(
  event: Event,
  labels: EventDisplayLabels = getDefaultEventDisplayLabels(),
): string {
  const parts: string[] = [formatTime(event.startedAt)];

  if (event.durationSeconds) {
    parts.push(formatDuration(event.durationSeconds, labels.display));
  }

  if (event.intensity) {
    parts.push(labels.intensity[event.intensity]);
  }

  if (event.description) {
    parts.push(truncateText(event.description, EVENT_LIST_NOTE_MAX_LENGTH));
  }

  return parts.join(" · ");
}
