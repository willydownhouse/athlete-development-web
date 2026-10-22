import type { AthleteProfileField, AthleteProfileFieldUpdate } from "@/lib/types";

const CONTROL_PREFIX = "profileField:";
const SAVED_PREFIX = "profileFieldSaved:";

export function profileFieldInputValue(field: AthleteProfileField): string {
  if (!field.value) {
    return "";
  }

  if (field.valueType === "number") {
    if (field.value.numericValue == null) {
      return "";
    }

    const parsed = Number(field.value.numericValue);
    return Number.isFinite(parsed) ? String(parsed) : field.value.numericValue;
  }

  if (field.valueType === "boolean") {
    if (field.value.booleanValue == null) {
      return "";
    }

    return field.value.booleanValue ? "true" : "false";
  }

  return field.value.textValue ?? "";
}

export function profileFieldControlName(field: {
  id: string;
  valueType: AthleteProfileField["valueType"];
}): string {
  return `${CONTROL_PREFIX}${field.valueType}:${field.id}`;
}

export function profileFieldSavedName(field: {
  id: string;
  valueType: AthleteProfileField["valueType"];
}): string {
  return `${SAVED_PREFIX}${field.valueType}:${field.id}`;
}

export function readChangedProfileFieldValues(
  formData: FormData,
): { ok: true; values: AthleteProfileFieldUpdate[] } | { ok: false; error: "invalidNumber" } {
  const values: AthleteProfileFieldUpdate[] = [];

  for (const [key, raw] of formData.entries()) {
    if (
      !key.startsWith(CONTROL_PREFIX) ||
      key.startsWith(SAVED_PREFIX) ||
      typeof raw !== "string"
    ) {
      continue;
    }

    const rest = key.slice(CONTROL_PREFIX.length);
    const separator = rest.indexOf(":");

    if (separator <= 0) {
      continue;
    }

    const valueType = rest.slice(0, separator);
    const profileFieldId = rest.slice(separator + 1);
    const current = raw.trim();
    const saved = formData.get(`${SAVED_PREFIX}${valueType}:${profileFieldId}`);
    const savedValue = typeof saved === "string" ? saved : "";

    if (current === savedValue) {
      continue;
    }

    if (valueType === "text") {
      values.push({ profileFieldId, textValue: current.length > 0 ? current : null });
      continue;
    }

    if (valueType === "number") {
      if (current.length === 0) {
        values.push({ profileFieldId, numericValue: null });
        continue;
      }

      const parsed = Number(current);

      if (!Number.isFinite(parsed)) {
        return { ok: false, error: "invalidNumber" };
      }

      values.push({ profileFieldId, numericValue: parsed });
      continue;
    }

    if (valueType === "boolean") {
      if (current.length === 0) {
        values.push({ profileFieldId, booleanValue: null });
        continue;
      }

      if (current !== "true" && current !== "false") {
        return { ok: false, error: "invalidNumber" };
      }

      values.push({ profileFieldId, booleanValue: current === "true" });
    }
  }

  return { ok: true, values };
}
