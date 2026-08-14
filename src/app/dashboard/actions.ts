"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import {
  ApiError,
  createEvent,
  deleteEvent,
  fetchEventTypeMetricDefinitions,
  updateEvent,
} from "@/lib/api";
import { fetchDashboardEventsInRange } from "@/lib/dashboard-event-data";
import { athleteEventsCacheTag, eventCacheTag } from "@/lib/cache-tags";
import { getAuthBearerToken } from "@/lib/auth-token";
import {
  getEventFormValidationError,
  readEventDescriptionForCreate,
  readEventDescriptionForUpdate,
  readEventDurationSecondsForCreate,
  readEventDurationSecondsForUpdate,
  readEventIntensityForCreate,
  readEventIntensityForUpdate,
  readEventTitleForCreate,
  readEventTitleForUpdate,
} from "@/lib/event-form-schema";
import { parseMetricsFromFormData } from "@/lib/event-metric-form";
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

function validateEventTextFields(
  formData: FormData,
  metricMappings: Awaited<ReturnType<typeof fetchEventTypeMetricDefinitions>> = [],
): DashboardActionState | null {
  const error = getEventFormValidationError(formData, metricMappings);

  if (error) {
    return { error };
  }

  return null;
}

async function loadMetricMappingsForEventType(eventTypeId: string) {
  if (!eventTypeId) {
    return [];
  }

  try {
    return await fetchEventTypeMetricDefinitions(eventTypeId);
  } catch {
    return [];
  }
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

  const metricMappings = await loadMetricMappingsForEventType(fields.eventTypeId);
  const textError = validateEventTextFields(formData, metricMappings);
  if (textError) {
    return textError;
  }

  const metrics = parseMetricsFromFormData(formData, metricMappings);

  try {
    await createEvent(token, fields.athleteId, {
      eventTypeId: fields.eventTypeId,
      startedAt: fields.startedAt,
      source: "form",
      title,
      description,
      durationSeconds,
      intensity,
      ...(metrics.length > 0 || metricMappings.length > 0 ? { metrics } : {}),
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

  const metricMappings = await loadMetricMappingsForEventType(fields.eventTypeId);
  const textError = validateEventTextFields(formData, metricMappings);
  if (textError) {
    return textError;
  }

  const metrics = parseMetricsFromFormData(formData, metricMappings);

  try {
    await updateEvent(token, fields.athleteId, eventId, {
      eventTypeId: fields.eventTypeId,
      startedAt: fields.startedAt,
      title,
      description,
      durationSeconds,
      intensity,
      metrics,
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
  return fetchDashboardEventsInRange(athleteId, startedAtFrom, startedAtTo);
}
