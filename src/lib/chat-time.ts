import { formatZonedShortDate, formatZonedTime, getZonedDateString } from "@/lib/time-zone";

function previousZonedDateString(timeZone: string, date: Date): string {
  const current = getZonedDateString(timeZone, date);
  const year = Number.parseInt(current.slice(0, 4), 10);
  const month = Number.parseInt(current.slice(5, 7), 10);
  const day = Number.parseInt(current.slice(8, 10), 10);
  const previous = new Date(Date.UTC(year, month - 1, day - 1));
  const previousYear = String(previous.getUTCFullYear());
  const previousMonth = String(previous.getUTCMonth() + 1).padStart(2, "0");
  const previousDay = String(previous.getUTCDate()).padStart(2, "0");

  return `${previousYear}-${previousMonth}-${previousDay}`;
}

export function formatChatTimestamp(
  timeZone: string,
  createdAt: string,
  referenceDate = new Date(),
): string {
  const date = new Date(createdAt);
  const time = formatZonedTime(timeZone, date);
  const messageDay = getZonedDateString(timeZone, date);
  const today = getZonedDateString(timeZone, referenceDate);

  if (messageDay === today) {
    return time;
  }

  if (messageDay === previousZonedDateString(timeZone, referenceDate)) {
    return `Yesterday ${time}`;
  }

  return `${formatZonedShortDate(timeZone, date, referenceDate)} ${time}`;
}
