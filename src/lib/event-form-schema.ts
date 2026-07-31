import { validateMetricForm } from "./event-metric-form";
import type { EventTypeMetricDefinition } from "./types";
import { getDefaultValidationMessages, type ValidationMessages } from "./validation-messages";

export const EVENT_TITLE_MAX_LENGTH = 100;
export const EVENT_DESCRIPTION_MAX_LENGTH = 5000;

function readField(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export function getEventFormTextError(
  title: string,
  description: string,
  messages: ValidationMessages = getDefaultValidationMessages(),
): string | null {
  if (title.length > EVENT_TITLE_MAX_LENGTH) {
    return messages.titleMaxLength(EVENT_TITLE_MAX_LENGTH);
  }

  if (description.length > EVENT_DESCRIPTION_MAX_LENGTH) {
    return messages.notesMaxLength(EVENT_DESCRIPTION_MAX_LENGTH);
  }

  return null;
}

export function getEventFormValidationError(
  formData: FormData,
  metricMappings: EventTypeMetricDefinition[] = [],
  messages: ValidationMessages = getDefaultValidationMessages(),
): string | null {
  const textError = getEventFormTextErrorFromFormData(formData, messages);
  if (textError) {
    return textError;
  }

  return validateMetricForm(formData, metricMappings, messages);
}

function getEventFormTextErrorFromFormData(
  formData: FormData,
  messages: ValidationMessages,
): string | null {
  return getEventFormTextError(
    readField(formData.get("title")),
    readField(formData.get("description")),
    messages,
  );
}
