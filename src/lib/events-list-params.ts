import { zonedDateTimeToUtcIso, getZonedWeekRange } from "@/lib/time-zone";

export const EVENTS_LIST_DEFAULT_LIMIT = 10;
export const EVENTS_LIST_DEFAULT_PAGE = 1;
export const EVENTS_LIST_PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const EVENTS_LIST_MAX_LIMIT = 100;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type EventsListSearchParams = {
  limit: number;
  page: number;
  offset: number;
  from?: string;
  to?: string;
  eventTypeId?: string;
  explicitDateRange: boolean;
};

type RawSearchParams = Record<string, string | string[] | undefined>;

function readSingleValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0]?.trim() || undefined;
  }

  const trimmed = value?.trim();
  return trimmed || undefined;
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function parseLimit(value: string | undefined): number {
  const parsed = parsePositiveInt(value, EVENTS_LIST_DEFAULT_LIMIT);
  return Math.min(parsed, EVENTS_LIST_MAX_LIMIT);
}

function readDateParts(value: string): { year: number; month: number; day: number } | null {
  const parts = value.split("-");

  if (parts.length !== 3) {
    return null;
  }

  const yearPart = parts[0];
  const monthPart = parts[1];
  const dayPart = parts[2];

  if (yearPart === undefined || monthPart === undefined || dayPart === undefined) {
    return null;
  }

  return {
    year: Number.parseInt(yearPart, 10),
    month: Number.parseInt(monthPart, 10),
    day: Number.parseInt(dayPart, 10),
  };
}

function parseDate(value: string | undefined): string | undefined {
  if (!value || !DATE_PATTERN.test(value)) {
    return undefined;
  }

  const dateParts = readDateParts(value);

  if (!dateParts) {
    return undefined;
  }

  const { year, month, day } = dateParts;
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return undefined;
  }

  return value;
}

function parseUuid(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value
    : undefined;
}

export function parseEventsListSearchParams(raw: RawSearchParams): EventsListSearchParams {
  const limit = parseLimit(readSingleValue(raw["limit"]));
  const page = parsePositiveInt(readSingleValue(raw["page"]), EVENTS_LIST_DEFAULT_PAGE);
  const from = parseDate(readSingleValue(raw["from"]));
  const to = parseDate(readSingleValue(raw["to"]));
  const eventTypeId = parseUuid(readSingleValue(raw["eventTypeId"]));

  return {
    limit,
    page,
    offset: (page - 1) * limit,
    from,
    to,
    eventTypeId,
    explicitDateRange: from !== undefined || to !== undefined,
  };
}

function formatDateInTimeZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function getDefaultEventsListWeekDates(
  timeZone: string,
  date = new Date(),
): { from: string; to: string } {
  const week = getZonedWeekRange(timeZone, date);
  const monday = week.days[0];
  const sunday = week.days[6];

  if (!monday || !sunday) {
    throw new Error("Expected week range to include Monday and Sunday");
  }

  return {
    from: formatDateInTimeZone(monday, timeZone),
    to: formatDateInTimeZone(sunday, timeZone),
  };
}

export function resolveEventsListSearchParams(
  params: EventsListSearchParams,
  timeZone: string,
  date = new Date(),
): EventsListSearchParams {
  if (params.explicitDateRange) {
    return params;
  }

  const { from, to } = getDefaultEventsListWeekDates(timeZone, date);

  return {
    ...params,
    from,
    to,
    explicitDateRange: false,
  };
}

function addDaysToDateString(date: string, days: number): string | null {
  const dateParts = readDateParts(date);

  if (!dateParts) {
    return null;
  }

  const { year, month, day } = dateParts;
  const next = new Date(Date.UTC(year, month - 1, day + days));

  return next.toISOString().slice(0, 10);
}

export function eventsListDateRange(
  timeZone: string,
  from?: string,
  to?: string,
): {
  startedAtFrom?: string;
  startedAtTo?: string;
} {
  const startedAtFrom = from ? zonedDateTimeToUtcIso(from, "00:00", timeZone) : undefined;
  const startedAtTo = to
    ? (() => {
        const nextDay = addDaysToDateString(to, 1);
        return nextDay ? zonedDateTimeToUtcIso(nextDay, "00:00", timeZone) : undefined;
      })()
    : undefined;

  return {
    ...(startedAtFrom ? { startedAtFrom } : {}),
    ...(startedAtTo ? { startedAtTo } : {}),
  };
}

export function buildEventsListQueryString(params: EventsListSearchParams): string {
  const search = new URLSearchParams();

  if (params.limit !== EVENTS_LIST_DEFAULT_LIMIT) {
    search.set("limit", String(params.limit));
  }

  if (params.page !== EVENTS_LIST_DEFAULT_PAGE) {
    search.set("page", String(params.page));
  }

  if (params.explicitDateRange) {
    if (params.from) {
      search.set("from", params.from);
    }

    if (params.to) {
      search.set("to", params.to);
    }
  }

  if (params.eventTypeId) {
    search.set("eventTypeId", params.eventTypeId);
  }

  return search.toString();
}

export function eventsListFilterKey(params: EventsListSearchParams): string {
  return [params.from ?? "", params.to ?? "", params.eventTypeId ?? "", params.limit].join(":");
}

export function eventsListSuspenseKey(params: EventsListSearchParams): string {
  return [
    params.limit,
    params.page,
    params.from ?? "",
    params.to ?? "",
    params.eventTypeId ?? "",
  ].join(":");
}

export function eventsListPageCount(total: number, limit: number): number {
  if (total <= 0) {
    return 1;
  }

  return Math.max(1, Math.ceil(total / limit));
}
