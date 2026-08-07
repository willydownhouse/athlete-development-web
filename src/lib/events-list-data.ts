import { ApiError, fetchEvents } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import { eventsListDateRange, type EventsListSearchParams } from "@/lib/events-list-params";
import { getRequestTimeZone } from "@/lib/time-zone-server";
import type { EventListResponse } from "@/lib/types";

export type EventsListResult =
  { data: EventListResponse; error?: undefined } | { data?: undefined; error: string };

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
      ...(params.eventTypeId ? { eventTypeId: params.eventTypeId } : {}),
    });

    return { data };
  } catch (error) {
    if (error instanceof ApiError) {
      return { error: error.apiError ?? error.message };
    }

    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: "Unable to load events" };
  }
}
