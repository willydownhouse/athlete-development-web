"use server";

import { revalidateTag } from "next/cache";

import { ApiError, createEvent, deleteEvent, fetchEvents, updateEvent } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import { getEventFormTextErrorFromFormData } from "@/lib/event-form-schema";
import type { Event, EventIntensity } from "@/lib/types";

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

function validateEventTextFields(formData: FormData): DashboardActionState | null {
  const error = getEventFormTextErrorFromFormData(formData);

  if (error) {
    return { error };
  }

  return null;
}

export async function createEventAction(
  _prevState: DashboardActionState,
  formData: FormData,
): Promise<DashboardActionState> {
  const token = await getAuthBearerToken();

  if (!token) {
    return { error: "You need to sign in again" };
  }

  const fields = readEventFormFields(formData);

  if (!fields.athleteId) {
    return { error: "Athlete is required" };
  }

  if (!fields.eventTypeId) {
    return { error: "Event type is required" };
  }

  if (!fields.eventDate || !fields.startedAt) {
    return { error: "Date is required" };
  }

  const textError = validateEventTextFields(formData);
  if (textError) {
    return textError;
  }

  try {
    await createEvent(token, fields.athleteId, {
      eventTypeId: fields.eventTypeId,
      startedAt: fields.startedAt,
      source: "form",
      title: fields.title,
      description: fields.description,
      durationSeconds: fields.durationSeconds,
      intensity: fields.intensity,
    });
    revalidateTag(`events-${fields.athleteId}`, "max");

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
  const fields = readEventFormFields(formData);

  if (!fields.athleteId) {
    return { error: "Athlete is required" };
  }

  if (!eventId) {
    return { error: "Event is required" };
  }

  if (!fields.eventTypeId) {
    return { error: "Event type is required" };
  }

  if (!fields.eventDate || !fields.startedAt) {
    return { error: "Date is required" };
  }

  const textError = validateEventTextFields(formData);
  if (textError) {
    return textError;
  }

  try {
    await updateEvent(token, fields.athleteId, eventId, {
      eventTypeId: fields.eventTypeId,
      startedAt: fields.startedAt,
      title: fields.title,
      description: fields.description,
      durationSeconds: fields.durationSeconds,
      intensity: fields.intensity,
    });

    revalidateTag(`events-${fields.athleteId}`, "max");

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

  try {
    await deleteEvent(token, athleteId, eventId);
    revalidateTag(`events-${athleteId}`, "max");

    return { success: "Event deleted" };
  } catch (error) {
    return actionError(error);
  }
}

export async function fetchTodaysEventsAction(
  athleteId: string,
  startedAtFrom: string,
  startedAtTo: string,
): Promise<{ events: Event[]; error?: undefined } | { events: []; error: string }> {
  const token = await getAuthBearerToken();

  if (!token) {
    return { events: [], error: "You need to sign in again" };
  }

  try {
    const result = await fetchEvents(token, athleteId, {
      startedAtFrom,
      startedAtTo,
      limit: 100,
    });

    return { events: result.items };
  } catch (error) {
    if (error instanceof ApiError) {
      return { events: [], error: error.apiError ?? error.message };
    }

    if (error instanceof Error) {
      return { events: [], error: error.message };
    }

    return { events: [], error: "Unable to load today's events" };
  }
}
