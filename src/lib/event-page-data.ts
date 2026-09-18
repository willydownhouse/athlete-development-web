import { ApiError, fetchEvent, fetchEventTypes } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import type { Event, EventType } from "@/lib/types";

export type EventPageDataResult =
  | { event: Event; error?: undefined; notFound?: undefined }
  | { event?: undefined; error: string; notFound?: undefined }
  | { event?: undefined; error?: undefined; notFound: true };

export type EventPageFormDataResult =
  | { eventTypes: EventType[]; eventTypesError?: undefined }
  | { eventTypes: EventType[]; eventTypesError: string };

export async function fetchEventPageData(
  athleteId: string,
  eventId: string,
): Promise<EventPageDataResult> {
  const token = await getAuthBearerToken();

  if (!token) {
    return { error: "You need to sign in again" };
  }

  try {
    const event = await fetchEvent(token, athleteId, eventId, {
      include: "metrics,items",
    });

    return { event };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { notFound: true };
    }

    if (error instanceof ApiError) {
      return { error: error.apiError ?? error.message };
    }

    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: "Unable to load event" };
  }
}

export async function fetchEventPageFormData(
  focusSportId: string,
): Promise<EventPageFormDataResult> {
  try {
    const eventTypes = await fetchEventTypes(focusSportId);
    return { eventTypes };
  } catch (error) {
    return {
      eventTypes: [],
      eventTypesError: error instanceof Error ? error.message : "Unable to load event types",
    };
  }
}
