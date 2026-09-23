import { ApiError, fetchEvent, fetchEventTypes } from "@/lib/api";
import { getActionMessages, passthroughOrGeneric } from "@/lib/action-messages";
import { getAuthBearerToken } from "@/lib/auth-token";
import { getRequestLocale } from "@/lib/locale-server";
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
  const [token, actions] = await Promise.all([getAuthBearerToken(), getActionMessages()]);

  if (!token) {
    return { error: actions.signInAgain };
  }

  try {
    const locale = await getRequestLocale();
    const event = await fetchEvent(token, athleteId, eventId, {
      include: "metrics,items",
      locale,
    });

    return { event };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { notFound: true };
    }

    return { error: passthroughOrGeneric(error, actions.loadEvent) };
  }
}

export async function fetchEventPageFormData(
  focusSportId: string,
): Promise<EventPageFormDataResult> {
  try {
    const locale = await getRequestLocale();
    const eventTypes = await fetchEventTypes(locale, focusSportId);
    return { eventTypes };
  } catch (error) {
    return {
      eventTypes: [],
      eventTypesError: passthroughOrGeneric(error, (await getActionMessages()).loadEventTypes),
    };
  }
}
