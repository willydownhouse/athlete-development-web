import { ApiError, fetchEventAggregate, fetchEvents } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import {
  eventsListDateRange,
  isEventsListAggregateShow,
  isEventsListMetricShow,
  type EventsListSearchParams,
} from "@/lib/events-list-params";
import { getRequestTimeZone } from "@/lib/time-zone-server";
import type { EventAggregate, EventListResponse } from "@/lib/types";

type EventsListResult =
  { data: EventListResponse; error?: undefined } | { data?: undefined; error: string };

type EventsAggregateResult =
  { data: EventAggregate; error?: undefined } | { data?: undefined; error: string };

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.apiError ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export async function fetchAthleteEventsList(
  athleteId: string,
  params: EventsListSearchParams,
): Promise<EventsListResult> {
  const token = await getAuthBearerToken();

  if (!token) {
    return { error: "You need to sign in again" };
  }

  const timeZone = await getRequestTimeZone();
  const dateRange = eventsListDateRange(timeZone, params.from, params.to);

  try {
    const data = await fetchEvents(token, athleteId, {
      limit: params.limit,
      offset: params.offset,
      ...dateRange,
      ...(params.eventTypeIds.length > 0 ? { eventTypeIds: params.eventTypeIds } : {}),
      ...(params.categories.length > 0 ? { categories: params.categories } : {}),
    });

    return { data };
  } catch (error) {
    return { error: errorMessage(error, "Unable to load events") };
  }
}

export async function fetchAthleteEventsAggregate(
  athleteId: string,
  params: EventsListSearchParams,
): Promise<EventsAggregateResult> {
  if (!isEventsListAggregateShow(params.show)) {
    return { error: "Choose a total to show" };
  }

  if (isEventsListMetricShow(params.show) && !params.metricDefinitionId) {
    return { error: "Select a metric" };
  }

  const token = await getAuthBearerToken();

  if (!token) {
    return { error: "You need to sign in again" };
  }

  const timeZone = await getRequestTimeZone();
  const dateRange = eventsListDateRange(timeZone, params.from, params.to);

  if (!dateRange.startedAtFrom || !dateRange.startedAtTo) {
    return { error: "Choose a from date and a to date" };
  }

  try {
    const data = await fetchEventAggregate(token, athleteId, {
      startedAtFrom: dateRange.startedAtFrom,
      startedAtTo: dateRange.startedAtTo,
      aggregation: params.show,
      ...(params.eventTypeIds.length > 0 ? { eventTypeIds: params.eventTypeIds } : {}),
      ...(params.categories.length > 0 ? { categories: params.categories } : {}),
      ...(isEventsListMetricShow(params.show) && params.metricDefinitionId
        ? { metricDefinitionId: params.metricDefinitionId }
        : {}),
    });

    return { data };
  } catch (error) {
    return { error: errorMessage(error, "Unable to load total") };
  }
}
