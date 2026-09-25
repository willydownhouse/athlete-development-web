import { EVENT_TONE_ORDER, getEventTone, type EventTone } from "@/lib/event-tone";
import type { Event } from "@/lib/types";
import { getZonedDateString } from "@/lib/time-zone";

export function eventsInHalfOpenRange(
  events: Event[],
  startedAtFrom: string,
  startedAtTo: string,
): Event[] {
  const fromMs = Date.parse(startedAtFrom);
  const toMs = Date.parse(startedAtTo);

  return events.filter((event) => {
    const startedAtMs = Date.parse(event.startedAt);
    return startedAtMs >= fromMs && startedAtMs < toMs;
  });
}

function zonedDateKey(date: Date, timeZone: string): string {
  return getZonedDateString(timeZone, date);
}

export function eventsForLocalDate(events: Event[], date: Date, timeZone: string): Event[] {
  const key = zonedDateKey(date, timeZone);
  return events.filter((event) => zonedDateKey(new Date(event.startedAt), timeZone) === key);
}

export function localDateKey(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateFromLocalKey(key: string): Date {
  const [yearText = "0", monthText = "0", dayText = "0"] = key.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  return new Date(year, month - 1, day);
}

export function eventTonesByLocalDate(events: Event[], timeZone: string): Map<string, EventTone[]> {
  const tonesByDate = new Map<string, Set<EventTone>>();

  for (const event of events) {
    const key = zonedDateKey(new Date(event.startedAt), timeZone);
    const tones = tonesByDate.get(key) ?? new Set<EventTone>();
    tones.add(getEventTone(event));
    tonesByDate.set(key, tones);
  }

  return new Map(
    [...tonesByDate].map(([key, tones]) => [
      key,
      EVENT_TONE_ORDER.filter((tone) => tones.has(tone)),
    ]),
  );
}

export function datesWithEvents(events: Event[], timeZone: string): Date[] {
  return [...eventTonesByLocalDate(events, timeZone).keys()].map(dateFromLocalKey);
}
