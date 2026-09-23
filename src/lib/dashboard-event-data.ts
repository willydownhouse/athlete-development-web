import { cache } from "react";

import { fetchAllEvents } from "@/lib/api";
import { getActionMessages, passthroughOrGeneric } from "@/lib/action-messages";
import { getAuthBearerToken } from "@/lib/auth-token";
import { getRequestLocale } from "@/lib/locale-server";
import { eventsInHalfOpenRange } from "@/lib/event-grouping";
import { getZonedDayRange, getZonedWeekRange } from "@/lib/time-zone";
import type { Event } from "@/lib/types";

export type DashboardEventsResult =
  { events: Event[]; error?: undefined } | { events: []; error: string };

export type DashboardEventsInclude = "metrics" | "items" | "metrics,items";

export async function fetchDashboardEventsInRange(
  athleteId: string,
  startedAtFrom: string,
  startedAtTo: string,
  include: DashboardEventsInclude = "metrics",
): Promise<DashboardEventsResult> {
  const [token, actions] = await Promise.all([getAuthBearerToken(), getActionMessages()]);

  if (!token) {
    return { events: [], error: actions.signInAgain };
  }

  try {
    const locale = await getRequestLocale();
    const events = await fetchAllEvents(token, athleteId, {
      startedAtFrom,
      startedAtTo,
      include,
      locale,
    });

    return { events };
  } catch (error) {
    return { events: [], error: passthroughOrGeneric(error, actions.loadEvents) };
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
