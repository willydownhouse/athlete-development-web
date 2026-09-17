import { zonedDateTimeToUtcIso, getZonedWeekRange } from "@/lib/time-zone";
import { EVENT_CATEGORIES, type EventCategory } from "@/lib/types";

export const EVENTS_LIST_DEFAULT_LIMIT = 10;
export const EVENTS_LIST_DEFAULT_PAGE = 1;
export const EVENTS_LIST_PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const EVENTS_LIST_MAX_LIMIT = 100;

const EVENTS_LIST_SHOW_VALUES = [
  "events",
  "count",
  "durationSeconds",
  "metric",
  "metricAverage",
] as const;
export type EventsListShow = (typeof EVENTS_LIST_SHOW_VALUES)[number];
export const EVENTS_LIST_DEFAULT_SHOW: EventsListShow = "events";
export const EVENTS_LIST_SHOW_OPTIONS: { value: EventsListShow; label: string }[] = [
  { value: "events", label: "Events" },
  { value: "count", label: "Event count" },
  { value: "durationSeconds", label: "Total duration" },
  { value: "metric", label: "Metric total" },
  { value: "metricAverage", label: "Metric average" },
];

const EVENTS_LIST_MEASURE_VALUES = ["events", "warm_up", "cool_down", "exercise"] as const;
export type EventsListMeasure = (typeof EVENTS_LIST_MEASURE_VALUES)[number];
export const EVENTS_LIST_DEFAULT_MEASURE: EventsListMeasure = "events";
export const EVENTS_LIST_MEASURE_OPTIONS: { value: EventsListMeasure; label: string }[] = [
  { value: "events", label: "Events" },
  { value: "warm_up", label: "Warm up" },
  { value: "cool_down", label: "Cool down" },
  { value: "exercise", label: "Exercise" },
];
export const EVENTS_LIST_DEFAULT_ITEM_SHOW: EventsListShow = "count";
export const EVENTS_LIST_ITEM_SHOW_OPTIONS: { value: EventsListShow; label: string }[] = [
  { value: "count", label: "Item count" },
  { value: "durationSeconds", label: "Total duration" },
  { value: "metric", label: "Metric total" },
  { value: "metricAverage", label: "Metric average" },
];

/** Keep in sync with athlete-development-service EVENT_ITEM_LABEL_MAX_LENGTH. */
const EVENTS_LIST_LABEL_MAX_LENGTH = 100;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type EventsListSearchParams = {
  limit: number;
  page: number;
  offset: number;
  from?: string;
  to?: string;
  eventTypeIds: string[];
  categories: EventCategory[];
  measure: EventsListMeasure;
  show: EventsListShow;
  metricDefinitionId?: string;
  label?: string;
  explicitDateRange: boolean;
};

export function isEventsListItemMeasure(
  measure: EventsListMeasure,
): measure is Exclude<EventsListMeasure, "events"> {
  return measure !== "events";
}

export function isEventsListExerciseMeasure(measure: EventsListMeasure): measure is "exercise" {
  return measure === "exercise";
}

export function eventsListMeasureLabel(measure: EventsListMeasure): string {
  return EVENTS_LIST_MEASURE_OPTIONS.find((option) => option.value === measure)?.label ?? measure;
}

export function normalizeEventsListLabel(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized || normalized.length > EVENTS_LIST_LABEL_MAX_LENGTH) {
    return undefined;
  }

  return normalized;
}

export function isEventsListItemShow(
  show: EventsListShow,
): show is "count" | "durationSeconds" | "metric" | "metricAverage" {
  return show !== "events";
}

export function isEventsListAggregateShow(
  show: EventsListShow,
): show is Exclude<EventsListShow, "events"> {
  return show !== "events";
}

export function isEventsListMetricShow(show: EventsListShow): show is "metric" | "metricAverage" {
  return show === "metric" || show === "metricAverage";
}

export function resolveEventsListItemTypeId(
  itemTypes: { id: string; slug: string; sportId: string | null }[],
  measure: Exclude<EventsListMeasure, "events">,
  focusSportId?: string,
): string | undefined {
  const matches = itemTypes.filter((itemType) => itemType.slug === measure);

  return (
    matches.find((itemType) => itemType.sportId === null)?.id ??
    matches.find((itemType) => itemType.sportId === focusSportId)?.id ??
    matches[0]?.id
  );
}

type RawSearchParams = Record<string, string | string[] | undefined>;

function readSingleValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0]?.trim() || undefined;
  }

  const trimmed = value?.trim();
  return trimmed || undefined;
}

function readManyValues(value: string | string[] | undefined): string[] {
  const items = Array.isArray(value) ? value : value ? [value] : [];
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
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

function parseEventTypeIds(raw: RawSearchParams): string[] {
  const fromQuery = readManyValues(raw["eventTypeIds"]).flatMap((value) =>
    value.split(",").flatMap((part) => {
      const parsed = parseUuid(part.trim());
      return parsed ? [parsed] : [];
    }),
  );
  const fromLegacy = parseUuid(readSingleValue(raw["eventTypeId"]));

  return [...new Set([...fromQuery, ...(fromLegacy ? [fromLegacy] : [])])];
}

function parseCategories(raw: RawSearchParams): EventCategory[] {
  const fromQuery = readManyValues(raw["categories"]).flatMap((value) =>
    value.split(",").flatMap((part) => {
      const trimmed = part.trim();
      return EVENT_CATEGORIES.includes(trimmed as EventCategory) ? [trimmed as EventCategory] : [];
    }),
  );

  return [...new Set(fromQuery)];
}

function parseShow(value: string | undefined): EventsListShow {
  if (value && (EVENTS_LIST_SHOW_VALUES as readonly string[]).includes(value)) {
    return value as EventsListShow;
  }

  return EVENTS_LIST_DEFAULT_SHOW;
}

function parseMeasure(value: string | undefined): EventsListMeasure {
  if (value && (EVENTS_LIST_MEASURE_VALUES as readonly string[]).includes(value)) {
    return value as EventsListMeasure;
  }

  return EVENTS_LIST_DEFAULT_MEASURE;
}

function resolveShowForMeasure(measure: EventsListMeasure, show: EventsListShow): EventsListShow {
  if (isEventsListItemMeasure(measure) && !isEventsListItemShow(show)) {
    return EVENTS_LIST_DEFAULT_ITEM_SHOW;
  }

  return show;
}

export function parseEventsListSearchParams(raw: RawSearchParams): EventsListSearchParams {
  const limit = parseLimit(readSingleValue(raw["limit"]));
  const page = parsePositiveInt(readSingleValue(raw["page"]), EVENTS_LIST_DEFAULT_PAGE);
  const from = parseDate(readSingleValue(raw["from"]));
  const to = parseDate(readSingleValue(raw["to"]));
  const measure = parseMeasure(readSingleValue(raw["measure"]));
  const show = resolveShowForMeasure(measure, parseShow(readSingleValue(raw["show"])));
  const label = isEventsListExerciseMeasure(measure)
    ? normalizeEventsListLabel(readSingleValue(raw["label"]))
    : undefined;

  return {
    limit,
    page,
    offset: (page - 1) * limit,
    from,
    to,
    eventTypeIds: parseEventTypeIds(raw),
    categories: parseCategories(raw),
    measure,
    show,
    metricDefinitionId: parseUuid(readSingleValue(raw["metricDefinitionId"])),
    label,
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

export function getEventsListDayDates(
  timeZone: string,
  date = new Date(),
): { from: string; to: string } {
  const day = formatDateInTimeZone(date, timeZone);

  return {
    from: day,
    to: day,
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
  const itemMeasure = isEventsListItemMeasure(params.measure);
  const show = resolveShowForMeasure(params.measure, params.show);

  if (!itemMeasure && show === EVENTS_LIST_DEFAULT_SHOW) {
    if (params.limit !== EVENTS_LIST_DEFAULT_LIMIT) {
      search.set("limit", String(params.limit));
    }

    if (params.page !== EVENTS_LIST_DEFAULT_PAGE) {
      search.set("page", String(params.page));
    }
  }

  if (params.explicitDateRange) {
    if (params.from) {
      search.set("from", params.from);
    }

    if (params.to) {
      search.set("to", params.to);
    }
  }

  if (params.eventTypeIds.length > 0) {
    search.set("eventTypeIds", params.eventTypeIds.join(","));
  }

  if (params.categories.length > 0) {
    search.set("categories", params.categories.join(","));
  }

  if (itemMeasure) {
    search.set("measure", params.measure);
  }

  const defaultShow = itemMeasure ? EVENTS_LIST_DEFAULT_ITEM_SHOW : EVENTS_LIST_DEFAULT_SHOW;
  if (show !== defaultShow) {
    search.set("show", show);
  }

  if (isEventsListMetricShow(show) && params.metricDefinitionId) {
    search.set("metricDefinitionId", params.metricDefinitionId);
  }

  if (isEventsListExerciseMeasure(params.measure) && params.label) {
    search.set("label", params.label);
  }

  return search.toString().replaceAll("%2C", ",");
}

export function eventsListFilterKey(params: EventsListSearchParams): string {
  return [
    params.from ?? "",
    params.to ?? "",
    params.eventTypeIds.join(","),
    params.categories.join(","),
    params.measure,
    params.show,
    params.metricDefinitionId ?? "",
    params.label ?? "",
    params.limit,
  ].join(":");
}

export function eventsListSuspenseKey(params: EventsListSearchParams): string {
  return [
    params.limit,
    params.page,
    params.from ?? "",
    params.to ?? "",
    params.eventTypeIds.join(","),
    params.categories.join(","),
    params.measure,
    params.show,
    params.metricDefinitionId ?? "",
    params.label ?? "",
  ].join(":");
}

export function eventsListPageCount(total: number, limit: number): number {
  if (total <= 0) {
    return 1;
  }

  return Math.max(1, Math.ceil(total / limit));
}
