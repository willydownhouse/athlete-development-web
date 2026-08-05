import {
  EVENT_DURATION_FIELDS,
  readDurationPartsSecondsFromFormData,
  validateDurationPartsForm,
  validateMetricForm,
} from "./event-metric-form";
import type { EventIntensity, EventTypeMetricDefinition } from "./types";

export const EVENT_TITLE_MAX_LENGTH = 100;
export const EVENT_DESCRIPTION_MAX_LENGTH = 5000;

function readField(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export function getEventFormTextError(title: string, description: string): string | null {
  if (title.length > EVENT_TITLE_MAX_LENGTH) {
    return `Title must be ${EVENT_TITLE_MAX_LENGTH} characters or less`;
  }

  if (description.length > EVENT_DESCRIPTION_MAX_LENGTH) {
    return `Notes must be ${EVENT_DESCRIPTION_MAX_LENGTH} characters or less`;
  }

  return null;
}

function getEventFormTextErrorFromFormData(formData: FormData): string | null {
  return getEventFormTextError(
    readField(formData.get("title")),
    readField(formData.get("description")),
  );
}

export function getEventFormValidationError(
  formData: FormData,
  metricMappings: EventTypeMetricDefinition[] = [],
): string | null {
  const textError = getEventFormTextErrorFromFormData(formData);
  if (textError) {
    return textError;
  }

  const durationError = validateDurationPartsForm(formData, EVENT_DURATION_FIELDS, "Duration");
  if (durationError) {
    return durationError;
  }

  return validateMetricForm(formData, metricMappings);
}

export function readEventDurationSecondsForCreate(formData: FormData): number | undefined {
  const totalSeconds = readDurationPartsSecondsFromFormData(formData, EVENT_DURATION_FIELDS);
  return totalSeconds > 0 ? totalSeconds : undefined;
}

export function readEventDurationSecondsForUpdate(formData: FormData): number | null {
  const totalSeconds = readDurationPartsSecondsFromFormData(formData, EVENT_DURATION_FIELDS);
  return totalSeconds > 0 ? totalSeconds : null;
}

function readTextField(formData: FormData, key: string): string {
  return readField(formData.get(key));
}

export function readEventTitleForCreate(formData: FormData): string | undefined {
  const value = readTextField(formData, "title");
  return value || undefined;
}

export function readEventDescriptionForCreate(formData: FormData): string | undefined {
  const value = readTextField(formData, "description");
  return value || undefined;
}

export function readEventTitleForUpdate(formData: FormData): string | null {
  const value = readTextField(formData, "title");
  return value || null;
}

export function readEventDescriptionForUpdate(formData: FormData): string | null {
  const value = readTextField(formData, "description");
  return value || null;
}

function parseIntensity(value: string): EventIntensity | null {
  if (value === "light" || value === "moderate" || value === "hard") {
    return value;
  }

  return null;
}

export function readEventIntensityForCreate(formData: FormData): EventIntensity | undefined {
  return parseIntensity(readTextField(formData, "intensity")) ?? undefined;
}

export function readEventIntensityForUpdate(formData: FormData): EventIntensity | null {
  return parseIntensity(readTextField(formData, "intensity"));
}
