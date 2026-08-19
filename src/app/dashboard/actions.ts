"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import {
  ApiError,
  createEvent,
  createEventsBatch,
  deleteEvent,
  updateEvent,
  type EventMetricInput,
} from "@/lib/api";
import { CALENDAR_EVENTS_INCLUDE } from "@/lib/calendar-event-data";
import { fetchDashboardEventsInRange } from "@/lib/dashboard-event-data";
import { athleteEventsCacheTag, eventCacheTag } from "@/lib/cache-tags";
import { getAuthBearerToken } from "@/lib/auth-token";
import { athleteEventHref } from "@/components/dashboard/dashboard-nav";
import {
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
import {
  STRENGTH_TRAINING_EVENT_TYPE_SLUG,
  parseEventItemsFromFormData,
} from "@/lib/event-item-form";
import { parseEventMetricsFromFormData } from "@/lib/event-metric-form";
import { getRequestTimeZoneCookie } from "@/lib/time-zone-server";
import { zonedDateTimeToUtcIso } from "@/lib/time-zone";
import type { Event } from "@/lib/types";

export type DashboardActionState = {
  error?: string;
  success?: string;
};

function actionError(error: unknown): DashboardActionState {
  if (error instanceof ApiError) {
    return { error: error.apiError ?? error.message };
  }

  if (error instanceof Error) {
    return { error: error.message };
  }

  return { error: "Something went wrong" };
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readSafeRedirectTo(formData: FormData): string | null {
  const value = readString(formData, "redirectTo");

  if (!value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
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
  const token = await getAuthBearerToken();

  if (!token) {
    return { error: "You need to sign in again" };
  }

  const fields = await readEventFormFields(formData);
  const durationSeconds = readEventDurationSecondsForCreate(formData);
  const title = readEventTitleForCreate(formData);
  const description = readEventDescriptionForCreate(formData);
  const intensity = readEventIntensityForCreate(formData);
  const metricsLoaded = readString(formData, "metricsLoaded") === "1";
  const eventTypeSlug = readString(formData, "eventTypeSlug");
  const isStrengthTraining = eventTypeSlug === STRENGTH_TRAINING_EVENT_TYPE_SLUG;
  const itemsLoaded = readString(formData, "itemsLoaded") === "1";

  if (!fields.athleteId) {
    return { error: "Athlete is required" };
  }

  if (!fields.eventTypeId) {
    return { error: "Event type is required" };
  }

  if (!fields.timeZone) {
    return { error: "Time zone is not ready. Refresh the page and try again." };
  }

  if (!fields.eventDate || !fields.startedAt) {
    return { error: "Date is required" };
  }

  if (!metricsLoaded) {
    return { error: "Metric fields are not ready. Refresh the page and try again." };
  }

  if (isStrengthTraining && !itemsLoaded) {
    return { error: "Exercise fields are not ready. Refresh the page and try again." };
  }

  const metrics = parseEventMetricsFromFormData(formData);
  const items = isStrengthTraining ? parseEventItemsFromFormData(formData) : undefined;

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
      ...(isStrengthTraining ? { items } : {}),
    });

    updateTag(athleteEventsCacheTag(fields.athleteId));

    return { success: "Event added" };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateEventAction(
  _prevState: DashboardActionState,
  formData: FormData,
): Promise<DashboardActionState> {
  const token = await getAuthBearerToken();

  if (!token) {
    return { error: "You need to sign in again" };
  }

  const eventId = readString(formData, "eventId");
  const fields = await readEventFormFields(formData);
  const durationSeconds = readEventDurationSecondsForUpdate(formData);
  const title = readEventTitleForUpdate(formData);
  const description = readEventDescriptionForUpdate(formData);
  const intensity = readEventIntensityForUpdate(formData);
  const metricsLoaded = readString(formData, "metricsLoaded") === "1";
  const eventTypeSlug = readString(formData, "eventTypeSlug");
  const isStrengthTraining = eventTypeSlug === STRENGTH_TRAINING_EVENT_TYPE_SLUG;
  const itemsLoaded = readString(formData, "itemsLoaded") === "1";

  if (!fields.athleteId) {
    return { error: "Athlete is required" };
  }

  if (!eventId) {
    return { error: "Event is required" };
  }

  if (!fields.eventTypeId) {
    return { error: "Event type is required" };
  }

  if (!fields.timeZone) {
    return { error: "Time zone is not ready. Refresh the page and try again." };
  }

  if (!fields.eventDate || !fields.startedAt) {
    return { error: "Date is required" };
  }

  if (!metricsLoaded) {
    return { error: "Metric fields are not ready. Refresh the page and try again." };
  }

  if (isStrengthTraining && !itemsLoaded) {
    return { error: "Exercise fields are not ready. Refresh the page and try again." };
  }

  const metrics = parseEventMetricsFromFormData(formData);
  const items = isStrengthTraining ? parseEventItemsFromFormData(formData) : undefined;

  try {
    await updateEvent(token, fields.athleteId, eventId, {
      eventTypeId: fields.eventTypeId,
      startedAt: fields.startedAt,
      title,
      description,
      durationSeconds,
      intensity,
      metrics,
      ...(isStrengthTraining ? { items } : {}),
    });

    updateTag(athleteEventsCacheTag(fields.athleteId));
    updateTag(eventCacheTag(eventId));

    return { success: "Event updated" };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteEventAction(
  _prevState: DashboardActionState,
  formData: FormData,
): Promise<DashboardActionState> {
  const token = await getAuthBearerToken();

  if (!token) {
    return { error: "You need to sign in again" };
  }

  const athleteId = readString(formData, "athleteId");
  const eventId = readString(formData, "eventId");

  if (!athleteId) {
    return { error: "Athlete is required" };
  }

  if (!eventId) {
    return { error: "Event is required" };
  }

  const redirectTo = readSafeRedirectTo(formData);

  try {
    await deleteEvent(token, athleteId, eventId);
    updateTag(athleteEventsCacheTag(athleteId));
    updateTag(eventCacheTag(eventId));
  } catch (error) {
    return actionError(error);
  }

  if (redirectTo) {
    redirect(redirectTo);
  }

  return { success: "Event deleted" };
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

export type CopyEventForTodaySource = {
  eventTypeId: string;
  startedAt: string;
  title: string | null;
  description: string | null;
  durationSeconds: number | null;
  intensity: Event["intensity"];
  metrics: EventMetricInput[];
};

export async function copyEventAction(
  athleteId: string,
  source: CopyEventForTodaySource,
  targetDate: string,
): Promise<{ error: string } | { redirectTo: string }> {
  const token = await getAuthBearerToken();

  if (!token) {
    return { error: "You need to sign in again" };
  }

  const normalizedAthleteId = athleteId.trim();
  const eventTypeId = source.eventTypeId.trim();
  const normalizedTargetDate = targetDate.trim();

  if (!normalizedAthleteId || !eventTypeId) {
    return { error: "Event is required" };
  }

  if (!isLocalDateString(normalizedTargetDate)) {
    return { error: "Invalid date" };
  }

  const timeZone = await getRequestTimeZoneCookie();

  if (!timeZone) {
    return { error: "Time zone is not ready. Refresh the page and try again." };
  }

  const body = buildCopyForDatePreservingTime(source, timeZone, normalizedTargetDate);

  if (!body) {
    return { error: "Unable to build event time" };
  }

  try {
    const newEvent = await createEvent(token, normalizedAthleteId, body);

    return { redirectTo: athleteEventHref(normalizedAthleteId, newEvent.id) };
  } catch (error) {
    const result = actionError(error);
    return { error: result.error ?? "Something went wrong" };
  }
}

export async function copyDayEventsAction(
  athleteId: string,
  sources: EventCopySource[],
  targetDate: string,
): Promise<{ error: string } | { success: true; count: number }> {
  const token = await getAuthBearerToken();

  if (!token) {
    return { error: "You need to sign in again" };
  }

  const normalizedAthleteId = athleteId.trim();
  const normalizedTargetDate = targetDate.trim();

  if (!normalizedAthleteId) {
    return { error: "Athlete is required" };
  }

  if (!isLocalDateString(normalizedTargetDate)) {
    return { error: "Invalid date" };
  }

  const timeZone = await getRequestTimeZoneCookie();

  if (!timeZone) {
    return { error: "Time zone is not ready. Refresh the page and try again." };
  }

  const prepared = buildDayCopyForDate(sources, timeZone, normalizedTargetDate);

  if ("error" in prepared) {
    return { error: prepared.error };
  }

  try {
    const result = await createEventsBatch(token, normalizedAthleteId, prepared);

    updateTag(athleteEventsCacheTag(normalizedAthleteId));

    return { success: true, count: result.items.length };
  } catch (error) {
    const result = actionError(error);
    return { error: result.error ?? "Something went wrong" };
  }
}
