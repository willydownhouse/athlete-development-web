import { cache } from "react";

import { ApiError, fetchAllEvents } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import { eventsInHalfOpenRange } from "@/lib/event-grouping";
import { getZonedDayRange, getZonedWeekRange } from "@/lib/time-zone";
import type { Event } from "@/lib/types";

export type DashboardEventsResult =
  { events: Event[]; error?: undefined } | { events: []; error: string };

export async function fetchDashboardEventsInRange(
  athleteId: string,
  startedAtFrom: string,
  startedAtTo: string,
): Promise<DashboardEventsResult> {
  const token = await getAuthBearerToken();

  if (!token) {
    return { events: [], error: "You need to sign in again" };
  }

  try {
    const events = await fetchAllEvents(token, athleteId, {
      startedAtFrom,
      startedAtTo,
      include: "metrics",
    });

    return { events };
  } catch (error) {
    if (error instanceof ApiError) {
      return { events: [], error: error.apiError ?? error.message };
    }

    if (error instanceof Error) {
      return { events: [], error: error.message };
    }

    return { events: [], error: "Unable to load events" };
  }
}

export type DashboardEventsBundle = {
  weekEvents: Event[];
  todayEvents: Event[];
  error: string | null;
};

export const loadDashboardEventsBundle = cache(
  async (athleteId: string, timeZone: string): Promise<DashboardEventsBundle> => {
    const weekRange = getZonedWeekRange(timeZone);
    const todayRange = getZonedDayRange(timeZone);
    const result = await fetchDashboardEventsInRange(
      athleteId,
      weekRange.startedAtFrom,
      weekRange.startedAtTo,
    );

    const weekEvents = result.events;

    return {
      weekEvents: eventsInHalfOpenRange(weekEvents, weekRange.startedAtFrom, weekRange.startedAtTo),
      todayEvents: eventsInHalfOpenRange(
        weekEvents,
        todayRange.startedAtFrom,
        todayRange.startedAtTo,
      ),
      error: result.error ?? null,
    };
  },
);
