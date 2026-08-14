export const TIME_ZONE_COOKIE_NAME = "app_time_zone";
const DEFAULT_TIME_ZONE = "UTC";
export const TIME_ZONE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

type CalendarDate = {
  year: number;
  month: number;
  day: number;
};

type ZonedDateTimeParts = CalendarDate & {
  hour: number;
  minute: number;
  second: number;
};

export type TimeRange = {
  startedAtFrom: string;
  startedAtTo: string;
};

export type WeekTimeRange = TimeRange & {
  days: Date[];
};

function parseNumber(value: string): number {
  return Number.parseInt(value, 10);
}

function getMatchPart(match: RegExpExecArray, index: number): string {
  const value = match[index];

  if (value === undefined) {
    throw new Error("Unexpected date/time match");
  }

  return value;
}

function readDatePart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): number {
  const value = parts.find((part) => part.type === type)?.value;

  if (value === undefined) {
    throw new Error(`Missing ${type} in formatted timezone parts`);
  }

  return parseNumber(value);
}

function getZonedParts(date: Date, timeZone: string): ZonedDateTimeParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  return {
    year: readDatePart(parts, "year"),
    month: readDatePart(parts, "month"),
    day: readDatePart(parts, "day"),
    hour: readDatePart(parts, "hour"),
    minute: readDatePart(parts, "minute"),
    second: readDatePart(parts, "second"),
  };
}

function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const parts = getZonedParts(date, timeZone);
  const localAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );

  return localAsUtc - date.getTime();
}

function parseDateOnly(value: string): CalendarDate | null {
  const match = datePattern.exec(value);

  if (!match) {
    return null;
  }

  const year = parseNumber(getMatchPart(match, 1));
  const month = parseNumber(getMatchPart(match, 2));
  const day = parseNumber(getMatchPart(match, 3));
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

function parseTime(value: string): { hour: number; minute: number } | null {
  if (value === "") {
    return { hour: 12, minute: 0 };
  }

  const match = timePattern.exec(value);

  if (!match) {
    return null;
  }

  return {
    hour: parseNumber(getMatchPart(match, 1)),
    minute: parseNumber(getMatchPart(match, 2)),
  };
}

function addCalendarDays(date: CalendarDate, days: number): CalendarDate {
  const next = new Date(Date.UTC(date.year, date.month - 1, date.day + days));

  return {
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: next.getUTCDate(),
  };
}

function addCalendarMonths(date: CalendarDate, months: number): CalendarDate {
  const next = new Date(Date.UTC(date.year, date.month - 1 + months, 1));

  return {
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: next.getUTCDate(),
  };
}

function formatDateOnly(date: CalendarDate): string {
  const month = String(date.month).padStart(2, "0");
  const day = String(date.day).padStart(2, "0");

  return `${date.year}-${month}-${day}`;
}

export function getZonedDateString(timeZone: string, date = new Date()): string {
  const zonedDate = getZonedParts(date, normalizeTimeZone(timeZone));

  return formatDateOnly(zonedDate);
}

export function getZonedTimeString(timeZone: string, date = new Date()): string {
  const zonedDate = getZonedParts(date, normalizeTimeZone(timeZone));
  const hour = String(zonedDate.hour).padStart(2, "0");
  const minute = String(zonedDate.minute).padStart(2, "0");

  return `${hour}:${minute}`;
}

export function getZonedMonthStartDateString(timeZone: string, date = new Date()): string {
  const zonedDate = getZonedParts(date, normalizeTimeZone(timeZone));

  return formatDateOnly({
    year: zonedDate.year,
    month: zonedDate.month,
    day: 1,
  });
}

function localMidnightDate(date: CalendarDate, timeZone: string): Date {
  const iso = zonedDateTimeToUtcIso(formatDateOnly(date), "00:00", timeZone);

  if (!iso) {
    throw new Error("Unable to build local midnight for timezone");
  }

  return new Date(iso);
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

export function normalizeTimeZone(timeZone: string | null | undefined): string {
  return timeZone && isValidTimeZone(timeZone) ? timeZone : DEFAULT_TIME_ZONE;
}

export function getSystemTimeZone(): string {
  return normalizeTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
}

export function zonedDateTimeToUtcIso(
  eventDate: string,
  eventTime: string,
  timeZone: string,
): string | null {
  const date = parseDateOnly(eventDate);
  const time = parseTime(eventTime);

  if (!date || !time || !isValidTimeZone(timeZone)) {
    return null;
  }

  const localAsUtc = Date.UTC(date.year, date.month - 1, date.day, time.hour, time.minute, 0, 0);
  let utcDate = new Date(localAsUtc - getTimeZoneOffsetMs(new Date(localAsUtc), timeZone));
  utcDate = new Date(localAsUtc - getTimeZoneOffsetMs(utcDate, timeZone));

  const roundTrip = getZonedParts(utcDate, timeZone);

  if (
    roundTrip.year !== date.year ||
    roundTrip.month !== date.month ||
    roundTrip.day !== date.day ||
    roundTrip.hour !== time.hour ||
    roundTrip.minute !== time.minute
  ) {
    return null;
  }

  return utcDate.toISOString();
}

export function getZonedDayRange(timeZone: string, date = new Date()): TimeRange {
  const normalizedTimeZone = normalizeTimeZone(timeZone);
  const zonedDate = getZonedParts(date, normalizedTimeZone);
  const start = {
    year: zonedDate.year,
    month: zonedDate.month,
    day: zonedDate.day,
  };
  const end = addCalendarDays(start, 1);

  return {
    startedAtFrom: localMidnightDate(start, normalizedTimeZone).toISOString(),
    startedAtTo: localMidnightDate(end, normalizedTimeZone).toISOString(),
  };
}

export function getZonedMonthRange(timeZone: string, date = new Date()): TimeRange {
  const normalizedTimeZone = normalizeTimeZone(timeZone);
  const zonedDate = getZonedParts(date, normalizedTimeZone);
  const start = {
    year: zonedDate.year,
    month: zonedDate.month,
    day: 1,
  };
  const end = addCalendarMonths(start, 1);

  return {
    startedAtFrom: localMidnightDate(start, normalizedTimeZone).toISOString(),
    startedAtTo: localMidnightDate(end, normalizedTimeZone).toISOString(),
  };
}

export function mergeTimeRanges(...ranges: TimeRange[]): TimeRange {
  const first = ranges[0];

  if (!first) {
    throw new Error("mergeTimeRanges requires at least one range");
  }

  let earliestFrom = Date.parse(first.startedAtFrom);
  let latestTo = Date.parse(first.startedAtTo);

  for (const range of ranges.slice(1)) {
    earliestFrom = Math.min(earliestFrom, Date.parse(range.startedAtFrom));
    latestTo = Math.max(latestTo, Date.parse(range.startedAtTo));
  }

  return {
    startedAtFrom: new Date(earliestFrom).toISOString(),
    startedAtTo: new Date(latestTo).toISOString(),
  };
}

export function isTimeRangeWithin(inner: TimeRange, outer: TimeRange): boolean {
  return (
    Date.parse(inner.startedAtFrom) >= Date.parse(outer.startedAtFrom) &&
    Date.parse(inner.startedAtTo) <= Date.parse(outer.startedAtTo)
  );
}

export function getZonedWeekRange(timeZone: string, date = new Date()): WeekTimeRange {
  const normalizedTimeZone = normalizeTimeZone(timeZone);
  const zonedDate = getZonedParts(date, normalizedTimeZone);
  const today = {
    year: zonedDate.year,
    month: zonedDate.month,
    day: zonedDate.day,
  };
  const day = new Date(Date.UTC(today.year, today.month - 1, today.day)).getUTCDay();
  const daysFromMonday = (day + 6) % 7;
  const monday = addCalendarDays(today, -daysFromMonday);
  const nextMonday = addCalendarDays(monday, 7);

  return {
    startedAtFrom: localMidnightDate(monday, normalizedTimeZone).toISOString(),
    startedAtTo: localMidnightDate(nextMonday, normalizedTimeZone).toISOString(),
    days: Array.from({ length: 7 }, (_, index) =>
      localMidnightDate(addCalendarDays(monday, index), normalizedTimeZone),
    ),
  };
}
