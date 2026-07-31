"use server";

import { revalidateTag } from "next/cache";
import { getTranslations } from "next-intl/server";

import {
  ApiError,
  createEvent,
  deleteEvent,
  fetchEvents,
  fetchEventTypeMetricDefinitions,
  updateEvent,
} from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import { getEventFormValidationError } from "@/lib/event-form-schema";
import { parseMetricsFromFormData } from "@/lib/event-metric-form";
import type { Event, EventIntensity } from "@/lib/types";
import { createValidationMessages } from "@/lib/validation-messages";

export type DashboardActionState = {
  error?: string;
  success?: string;
};

async function actionError(error: unknown): Promise<DashboardActionState> {
  const t = await getTranslations("errors");

  if (error instanceof ApiError) {
    return { error: error.apiError ?? error.message };
  }

  if (error instanceof Error) {
    return { error: error.message };
  }

  return { error: t("generic") };
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalInt(formData: FormData, key: string): number | undefined {
  const value = readString(formData, key);
  if (value === "") {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function readOptionalIntensity(formData: FormData): EventIntensity | undefined {
  const value = readString(formData, "intensity");

  if (value === "light" || value === "moderate" || value === "hard") {
    return value;
  }

  return undefined;
}

function buildStartedAt(eventDate: string, eventTime: string): string | null {
  const [year, month, day] = eventDate.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const [hours, minutes] = eventTime ? eventTime.split(":").map(Number) : [12, 0];
  const startedAt = new Date(year, month - 1, day, hours ?? 12, minutes ?? 0, 0, 0);

  if (Number.isNaN(startedAt.getTime())) {
    return null;
  }

  return startedAt.toISOString();
}

function readEventFormFields(formData: FormData) {
  const athleteId = readString(formData, "athleteId");
  const eventTypeId = readString(formData, "eventTypeId");
  const eventDate = readString(formData, "eventDate");
  const startedAt = buildStartedAt(eventDate, readString(formData, "eventTime"));
  const durationMinutes = readOptionalInt(formData, "durationMinutes");
  const durationSeconds =
    durationMinutes !== undefined && durationMinutes > 0 ? durationMinutes * 60 : undefined;

  return {
    athleteId,
    eventTypeId,
    eventDate,
    startedAt,
    durationSeconds,
    title: readString(formData, "title") || undefined,
    description: readString(formData, "description") || undefined,
    intensity: readOptionalIntensity(formData),
  };
}

async function validateEventTextFields(
  formData: FormData,
  metricMappings: Awaited<ReturnType<typeof fetchEventTypeMetricDefinitions>> = [],
): Promise<DashboardActionState | null> {
  const validationMessages = createValidationMessages(await getTranslations("validation"));
  const error = getEventFormValidationError(formData, metricMappings, validationMessages);

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
  const tErrors = await getTranslations("errors");
  const tValidation = await getTranslations("dashboard.events.validation");
  const tSuccess = await getTranslations("dashboard.events.success");
  const token = await getAuthBearerToken();

  if (!token) {
    return { error: tErrors("signInRequired") };
  }

  const fields = readEventFormFields(formData);

  if (!fields.athleteId) {
    return { error: tValidation("athleteRequired") };
  }

  if (!fields.eventTypeId) {
    return { error: tValidation("eventTypeRequired") };
  }

  if (!fields.eventDate || !fields.startedAt) {
    return { error: tValidation("dateRequired") };
  }

  const metricMappings = await loadMetricMappingsForEventType(fields.eventTypeId);
  const textError = await validateEventTextFields(formData, metricMappings);
  if (textError) {
    return textError;
  }

  const metrics = parseMetricsFromFormData(formData, metricMappings);

  try {
    await createEvent(token, fields.athleteId, {
      eventTypeId: fields.eventTypeId,
      startedAt: fields.startedAt,
      source: "form",
      title: fields.title,
      description: fields.description,
      durationSeconds: fields.durationSeconds,
      intensity: fields.intensity,
      ...(metrics.length > 0 || metricMappings.length > 0 ? { metrics } : {}),
    });
    revalidateTag(`events-${fields.athleteId}`, "max");

    return { success: tSuccess("added") };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateEventAction(
  _prevState: DashboardActionState,
  formData: FormData,
): Promise<DashboardActionState> {
  const tErrors = await getTranslations("errors");
  const tValidation = await getTranslations("dashboard.events.validation");
  const tSuccess = await getTranslations("dashboard.events.success");
  const token = await getAuthBearerToken();

  if (!token) {
    return { error: tErrors("signInRequired") };
  }

  const eventId = readString(formData, "eventId");
  const fields = readEventFormFields(formData);

  if (!fields.athleteId) {
    return { error: tValidation("athleteRequired") };
  }

  if (!eventId) {
    return { error: tValidation("eventRequired") };
  }

  if (!fields.eventTypeId) {
    return { error: tValidation("eventTypeRequired") };
  }

  if (!fields.eventDate || !fields.startedAt) {
    return { error: tValidation("dateRequired") };
  }

  const metricMappings = await loadMetricMappingsForEventType(fields.eventTypeId);
  const textError = await validateEventTextFields(formData, metricMappings);
  if (textError) {
    return textError;
  }

  const metrics = parseMetricsFromFormData(formData, metricMappings);

  try {
    await updateEvent(token, fields.athleteId, eventId, {
      eventTypeId: fields.eventTypeId,
      startedAt: fields.startedAt,
      title: fields.title,
      description: fields.description,
      durationSeconds: fields.durationSeconds,
      intensity: fields.intensity,
      metrics,
    });

    revalidateTag(`events-${fields.athleteId}`, "max");

    return { success: tSuccess("updated") };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteEventAction(
  _prevState: DashboardActionState,
  formData: FormData,
): Promise<DashboardActionState> {
  const tErrors = await getTranslations("errors");
  const tValidation = await getTranslations("dashboard.events.validation");
  const tSuccess = await getTranslations("dashboard.events.success");
  const token = await getAuthBearerToken();

  if (!token) {
    return { error: tErrors("signInRequired") };
  }

  const athleteId = readString(formData, "athleteId");
  const eventId = readString(formData, "eventId");

  if (!athleteId) {
    return { error: tValidation("athleteRequired") };
  }

  if (!eventId) {
    return { error: tValidation("eventRequired") };
  }

  try {
    await deleteEvent(token, athleteId, eventId);
    revalidateTag(`events-${athleteId}`, "max");

    return { success: tSuccess("deleted") };
  } catch (error) {
    return actionError(error);
  }
}

export async function fetchEventsInRangeAction(
  athleteId: string,
  startedAtFrom: string,
  startedAtTo: string,
): Promise<{ events: Event[]; error?: undefined } | { events: []; error: string }> {
  const tErrors = await getTranslations("errors");
  const tLoadErrors = await getTranslations("dashboard.loadErrors");
  const token = await getAuthBearerToken();

  if (!token) {
    return { events: [], error: tErrors("signInRequired") };
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

    return { events: [], error: tLoadErrors("events") };
  }
}
