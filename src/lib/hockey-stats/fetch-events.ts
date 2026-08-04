import { ApiError, fetchEvents } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import type { Event } from "@/lib/types";

const EVENTS_PAGE_SIZE = 100;

export type HockeyEventsResult =
  { events: Event[]; error?: undefined } | { events: []; error: string };

export async function fetchHockeyEventsInRange(
  athleteId: string,
  sportId: string,
  startedAtFrom: string,
  startedAtTo: string,
): Promise<HockeyEventsResult> {
  const token = await getAuthBearerToken();

  if (!token) {
    return { events: [], error: "You need to sign in again" };
  }

  try {
    const events: Event[] = [];
    let offset = 0;
    let total = Number.POSITIVE_INFINITY;

    while (events.length < total) {
      const result = await fetchEvents(token, athleteId, {
        startedAtFrom,
        startedAtTo,
        sportId,
        include: "metrics",
        limit: EVENTS_PAGE_SIZE,
        offset,
      });

      events.push(...result.items);
      total = result.pagination.total;
      offset += EVENTS_PAGE_SIZE;
    }

    return { events };
  } catch (error) {
    if (error instanceof ApiError) {
      return { events: [], error: error.apiError ?? error.message };
    }

    if (error instanceof Error) {
      return { events: [], error: error.message };
    }

    return { events: [], error: "Unable to load hockey events" };
  }
}
