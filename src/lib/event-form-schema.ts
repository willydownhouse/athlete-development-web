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

export function getEventFormTextErrorFromFormData(formData: FormData): string | null {
  return getEventFormTextError(
    readField(formData.get("title")),
    readField(formData.get("description")),
  );
}
