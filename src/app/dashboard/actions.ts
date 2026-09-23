"use server";

import { revalidateTag, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { createEvent, createEventsBatch, deleteEvent, updateEvent } from "@/lib/api";
import { CALENDAR_EVENTS_INCLUDE } from "@/lib/calendar-event-data";
import { fetchDashboardEventsInRange } from "@/lib/dashboard-event-data";
import { athleteEventsCacheTag, eventCacheTag } from "@/lib/cache-tags";
import { getAuthBearerToken } from "@/lib/auth-token";
import { athleteEventHref } from "@/components/dashboard/dashboard-nav";
import {
  EVENT_BATCH_CREATE_MAX_ITEMS,
  buildCopyForDatePreservingTime,
  buildDayCopyForDate,
  type EventCopySource,
} from "@/lib/copy-event";
import { isLocalDateString } from "@/lib/date-range";
import {
  readEventDescriptionForCreate,
  readEventDescriptionForUpdate,
  readEventDurationSecondsForCreate,
  readEventDurationSecondsForUpdate,
  readEventIntensityForCreate,
  readEventIntensityForUpdate,
  readEventTitleForCreate,
  readEventTitleForUpdate,
} from "@/lib/event-form-schema";
import { getActionMessages, passthroughOrGeneric } from "@/lib/action-messages";
import { parseEventItemsFromFormData } from "@/lib/event-item-form";
import { parseEventMetricsFromFormData } from "@/lib/event-metric-form";
import { getRequestTimeZoneCookie } from "@/lib/time-zone-server";
import { zonedDateTimeToUtcIso } from "@/lib/time-zone";
import type { Event } from "@/lib/types";

export type DashboardActionState = {
  error?: string;
  success?: string;
};

async function actionError(error: unknown): Promise<DashboardActionState> {
  return { error: passthroughOrGeneric(error, (await getActionMessages()).generic) };
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function readEventFormFields(formData: FormData) {
  const athleteId = readString(formData, "athleteId");
  const eventTypeId = readString(formData, "eventTypeId");
  const eventDate = readString(formData, "eventDate");
  const eventTime = readString(formData, "eventTime");
  const timeZone = await getRequestTimeZoneCookie();
  const startedAt = timeZone ? zonedDateTimeToUtcIso(eventDate, eventTime, timeZone) : null;

  return {
    athleteId,
    eventTypeId,
    eventDate,
    timeZone,
    startedAt,
  };
}

export async function createEventAction(
  _prevState: DashboardActionState,
  formData: FormData,
): Promise<DashboardActionState> {
  const [token, actions] = await Promise.all([getAuthBearerToken(), getActionMessages()]);

  if (!token) {
    return { error: actions.signInAgain };
  }

  const fields = await readEventFormFields(formData);
  const durationSeconds = readEventDurationSecondsForCreate(formData);
  const title = readEventTitleForCreate(formData);
  const description = readEventDescriptionForCreate(formData);
  const intensity = readEventIntensityForCreate(formData);
  const metricsLoaded = readString(formData, "metricsLoaded") === "1";
  const itemsLoaded = readString(formData, "itemsLoaded") === "1";

  if (!fields.athleteId) {
    return { error: actions.athleteRequired };
  }

  if (!fields.eventTypeId) {
    return { error: actions.eventTypeRequired };
  }

  if (!fields.timeZone) {
    return { error: actions.timeZoneNotReady };
  }

  if (!fields.eventDate || !fields.startedAt) {
    return { error: actions.dateRequired };
  }

  if (!metricsLoaded) {
    return { error: actions.metricFieldsNotReady };
  }

  const metrics = parseEventMetricsFromFormData(formData);
  const items = itemsLoaded ? parseEventItemsFromFormData(formData) : undefined;

  try {
    await createEvent(token, fields.athleteId, {
      eventTypeId: fields.eventTypeId,
      startedAt: fields.startedAt,
      source: "form",
      title,
      description,
      durationSeconds,
      intensity,
      metrics,
      ...(itemsLoaded ? { items } : {}),
    });

    updateTag(athleteEventsCacheTag(fields.athleteId));

    return { success: actions.eventAdded };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateEventAction(
  _prevState: DashboardActionState,
  formData: FormData,
): Promise<DashboardActionState> {
  const [token, actions] = await Promise.all([getAuthBearerToken(), getActionMessages()]);

  if (!token) {
    return { error: actions.signInAgain };
  }

  const eventId = readString(formData, "eventId");
  const fields = await readEventFormFields(formData);
  const durationSeconds = readEventDurationSecondsForUpdate(formData);
  const title = readEventTitleForUpdate(formData);
  const description = readEventDescriptionForUpdate(formData);
  const intensity = readEventIntensityForUpdate(formData);
  const metricsLoaded = readString(formData, "metricsLoaded") === "1";
  const itemsLoaded = readString(formData, "itemsLoaded") === "1";

  if (!fields.athleteId) {
    return { error: actions.athleteRequired };
  }

  if (!eventId) {
    return { error: actions.eventRequired };
  }

  if (!fields.eventTypeId) {
    return { error: actions.eventTypeRequired };
  }

  if (!fields.timeZone) {
    return { error: actions.timeZoneNotReady };
  }

  if (!fields.eventDate || !fields.startedAt) {
    return { error: actions.dateRequired };
  }

  if (!metricsLoaded) {
    return { error: actions.metricFieldsNotReady };
  }

  const metrics = parseEventMetricsFromFormData(formData);
  const items = itemsLoaded ? parseEventItemsFromFormData(formData) : undefined;

  try {
    await updateEvent(token, fields.athleteId, eventId, {
      eventTypeId: fields.eventTypeId,
      startedAt: fields.startedAt,
      title,
      description,
      durationSeconds,
      intensity,
      metrics,
      ...(itemsLoaded ? { items } : {}),
    });

    updateTag(athleteEventsCacheTag(fields.athleteId));
    updateTag(eventCacheTag(eventId));

    return { success: actions.eventUpdated };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteEventMenuAction(
  athleteId: string,
  eventId: string,
  redirectTo: string,
): Promise<{ error: string }> {
  const [token, actions] = await Promise.all([getAuthBearerToken(), getActionMessages()]);

  if (!token) {
    return { error: actions.signInAgain };
  }

  const normalizedAthleteId = athleteId.trim();
  const normalizedEventId = eventId.trim();
  const normalizedRedirectTo = redirectTo.trim();

  if (!normalizedAthleteId || !normalizedEventId) {
    return { error: actions.eventRequired };
  }

  if (!normalizedRedirectTo.startsWith("/") || normalizedRedirectTo.startsWith("//")) {
    return { error: actions.invalidRedirect };
  }

  try {
    await deleteEvent(token, normalizedAthleteId, normalizedEventId);
    revalidateTag(athleteEventsCacheTag(normalizedAthleteId), "max");
  } catch (error) {
    const result = await actionError(error);
    return { error: result.error ?? actions.generic };
  }

  redirect(normalizedRedirectTo);
}

export async function fetchEventsInRangeAction(
  athleteId: string,
  startedAtFrom: string,
  startedAtTo: string,
): Promise<{ events: Event[]; error?: undefined } | { events: []; error: string }> {
  return fetchDashboardEventsInRange(
    athleteId,
    startedAtFrom,
    startedAtTo,
    CALENDAR_EVENTS_INCLUDE,
  );
}

export async function copyEventAction(
  athleteId: string,
  source: EventCopySource,
  targetDate: string,
): Promise<{ error: string } | { redirectTo: string }> {
  const [token, actions] = await Promise.all([getAuthBearerToken(), getActionMessages()]);

  if (!token) {
    return { error: actions.signInAgain };
  }

  const normalizedAthleteId = athleteId.trim();
  const eventTypeId = source.eventTypeId.trim();
  const normalizedTargetDate = targetDate.trim();

  if (!normalizedAthleteId || !eventTypeId) {
    return { error: actions.eventRequired };
  }

  if (!isLocalDateString(normalizedTargetDate)) {
    return { error: actions.invalidDate };
  }

  const timeZone = await getRequestTimeZoneCookie();

  if (!timeZone) {
    return { error: actions.timeZoneNotReady };
  }

  const body = buildCopyForDatePreservingTime(source, timeZone, normalizedTargetDate);

  if (!body) {
    return { error: actions.unableToBuildEventTime };
  }

  try {
    const newEvent = await createEvent(token, normalizedAthleteId, body);

    return { redirectTo: athleteEventHref(normalizedAthleteId, newEvent.id) };
  } catch (error) {
    const result = await actionError(error);
    return { error: result.error ?? actions.generic };
  }
}

export async function copyDayEventsAction(
  athleteId: string,
  sources: EventCopySource[],
  targetDate: string,
): Promise<{ error: string } | { success: true; count: number }> {
  const [token, actions] = await Promise.all([getAuthBearerToken(), getActionMessages()]);

  if (!token) {
    return { error: actions.signInAgain };
  }

  const normalizedAthleteId = athleteId.trim();
  const normalizedTargetDate = targetDate.trim();

  if (!normalizedAthleteId) {
    return { error: actions.athleteRequired };
  }

  if (!isLocalDateString(normalizedTargetDate)) {
    return { error: actions.invalidDate };
  }

  const timeZone = await getRequestTimeZoneCookie();

  if (!timeZone) {
    return { error: actions.timeZoneNotReady };
  }

  const prepared = buildDayCopyForDate(sources, timeZone, normalizedTargetDate);

  if ("error" in prepared) {
    if (prepared.error === "noEventsToCopy") {
      return { error: actions.noEventsToCopy };
    }

    if (prepared.error === "copyLimit") {
      return { error: actions.copyLimit(EVENT_BATCH_CREATE_MAX_ITEMS) };
    }

    return { error: actions.unableToBuildEventTime };
  }

  try {
    const result = await createEventsBatch(token, normalizedAthleteId, prepared);

    updateTag(athleteEventsCacheTag(normalizedAthleteId));

    return { success: true, count: result.items.length };
  } catch (error) {
    const result = await actionError(error);
    return { error: result.error ?? actions.generic };
  }
}
