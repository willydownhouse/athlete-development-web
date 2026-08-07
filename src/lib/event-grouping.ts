import type { Event } from "@/lib/types";

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

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function eventsForLocalDate(events: Event[], date: Date): Event[] {
  const key = localDateKey(date);
  return events.filter((event) => localDateKey(new Date(event.startedAt)) === key);
}

export function datesWithEvents(events: Event[]): Date[] {
  const keys = new Set<string>();

  for (const event of events) {
    keys.add(localDateKey(new Date(event.startedAt)));
  }

  return [...keys].map((key) => {
    const [yearText, monthText, dayText] = key.split("-");
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    return new Date(year, month - 1, day);
  });
}
