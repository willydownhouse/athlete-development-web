import { formatZonedShortDate, formatZonedTime, getZonedDateString } from "@/lib/time-zone";

export function formatChatTimestamp(
  timeZone: string,
  createdAt: string,
  referenceDate = new Date(),
): string {
  const date = new Date(createdAt);
  const time = formatZonedTime(timeZone, date);

  if (getZonedDateString(timeZone, date) === getZonedDateString(timeZone, referenceDate)) {
    return time;
  }

  return `${formatZonedShortDate(timeZone, date, referenceDate)} ${time}`;
}
