import { eventsListDateRange } from "@/lib/events-list-params";
import {
  getZonedMonthRange,
  getZonedWeekRange,
  getZonedYearRange,
  type TimeRange,
} from "@/lib/time-zone";

const STATS_PERIODS = ["week", "month", "year"] as const;
export type StatsPeriod = (typeof STATS_PERIODS)[number];

export type StatsSearchParams = {
  period: StatsPeriod;
  from?: string;
  to?: string;
  explicitDateRange: boolean;
};

type RawSearchParams = Record<string, string | string[] | undefined>;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function readSingleValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0]?.trim() || undefined;
  }

  const trimmed = value?.trim();
  return trimmed || undefined;
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

function parsePeriod(value: string | undefined): StatsPeriod {
  if (value && STATS_PERIODS.includes(value as StatsPeriod)) {
    return value as StatsPeriod;
  }

  return "week";
}

export function parseStatsSearchParams(raw: RawSearchParams): StatsSearchParams {
  const from = parseDate(readSingleValue(raw["from"]));
  const to = parseDate(readSingleValue(raw["to"]));
  const explicitDateRange = from !== undefined || to !== undefined;
  const start = from ?? to;
  const end = to ?? from;
  const ordered = start && end && start > end ? { from: end, to: start } : { from: start, to: end };

  return {
    period: parsePeriod(readSingleValue(raw["statsPeriod"])),
    from: ordered.from,
    to: ordered.to,
    explicitDateRange,
  };
}

export function getStatsTimeRange(
  params: StatsSearchParams,
  timeZone: string,
  date = new Date(),
): TimeRange {
  if (params.explicitDateRange) {
    const range = eventsListDateRange(timeZone, params.from, params.to);

    if (range.startedAtFrom && range.startedAtTo) {
      return {
        startedAtFrom: range.startedAtFrom,
        startedAtTo: range.startedAtTo,
      };
    }
  }

  switch (params.period) {
    case "month":
      return getZonedMonthRange(timeZone, date);
    case "year":
      return getZonedYearRange(timeZone, date);
    case "week": {
      const week = getZonedWeekRange(timeZone, date);
      return {
        startedAtFrom: week.startedAtFrom,
        startedAtTo: week.startedAtTo,
      };
    }
  }
}

function formatDateInTimeZone(value: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export function statsRangeLocalDates(
  range: TimeRange,
  timeZone: string,
): { from: string; to: string } {
  return {
    from: formatDateInTimeZone(range.startedAtFrom, timeZone),
    to: formatDateInTimeZone(new Date(Date.parse(range.startedAtTo) - 1).toISOString(), timeZone),
  };
}

export function statsSuspenseKey(range: TimeRange): string {
  return `${range.startedAtFrom}:${range.startedAtTo}`;
}
