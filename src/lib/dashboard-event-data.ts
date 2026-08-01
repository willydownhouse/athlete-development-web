import { ApiError, fetchEvents } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import type { Event } from "@/lib/types";

export type DashboardEventsResult =
  | { events: Event[]; error?: undefined }
  | { events: []; error: string };

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
    const result = await fetchEvents(token, athleteId, {
      startedAtFrom,
      startedAtTo,
      limit: 100,
      include: "metrics",
    });

    return { events: result.items };
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
