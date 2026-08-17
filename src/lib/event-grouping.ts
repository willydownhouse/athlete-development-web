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

export function datesWithEvents(events: Event[], timeZone: string): Date[] {
  const keys = new Set<string>();

  for (const event of events) {
    keys.add(zonedDateKey(new Date(event.startedAt), timeZone));
  }

  return [...keys].map((key) => {
    const [yearText = "0", monthText = "0", dayText = "0"] = key.split("-");
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    return new Date(year, month - 1, day);
  });
}
