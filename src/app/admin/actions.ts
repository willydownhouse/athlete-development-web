"use server";

import { revalidatePath, updateTag } from "next/cache";

import {
  AdminApiError,
  createAdminEventType,
  createAdminEventTypeMetricDefinition,
  createAdminMetricDefinition,
  createAdminSport,
  deleteAdminEventTypeMetricDefinition,
  updateAdminEventType,
  updateAdminEventTypeMetricDefinition,
  updateAdminMetricDefinition,
  updateAdminSport,
} from "@/lib/admin-api";
import { requireAdmin } from "@/lib/admin-auth";
import { EVENT_TYPES_CACHE_TAG } from "@/lib/cache-tags";

export type ActionState = {
  error?: string;
  success?: string;
};

function actionError(error: unknown): ActionState {
  if (error instanceof AdminApiError) {
    return { error: error.apiError ?? error.message };
  }

  if (error instanceof Error) {
    return { error: error.message };
  }

  return { error: "Something went wrong" };
}

function revalidateEventTypesCache() {
  updateTag(EVENT_TYPES_CACHE_TAG);
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalString(formData: FormData, key: string): string | undefined {
  const value = readString(formData, key);
  return value === "" ? undefined : value;
}

function readBoolean(formData: FormData, key: string): boolean {
  const values = formData.getAll(key);
  return values.includes("true") || values.includes("on");
}

function readOptionalInt(formData: FormData, key: string): number | undefined {
  const value = readString(formData, key);
  if (value === "") {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function readSportId(formData: FormData): string | null | undefined {
  const value = readString(formData, "sportId");

  if (value === "") {
    return undefined;
  }

  if (value === "general") {
    return null;
  }

  return value;
}

// Sports

export async function createSportAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { token } = await requireAdmin();

    await createAdminSport(token, {
      slug: readString(formData, "slug"),
      name: readString(formData, "name"),
      active: readBoolean(formData, "active"),
    });

    revalidatePath("/admin");
    revalidatePath("/admin/sports");
    return { success: "Sport created" };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateSportAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { token } = await requireAdmin();
    const sportId = readString(formData, "sportId");

    await updateAdminSport(token, sportId, {
      slug: readOptionalString(formData, "slug"),
      name: readOptionalString(formData, "name"),
      active: readBoolean(formData, "active"),
    });

    revalidatePath("/admin");
    revalidatePath("/admin/sports");
    return { success: "Sport updated" };
  } catch (error) {
    return actionError(error);
  }
}

// Event types

export async function createEventTypeAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { token } = await requireAdmin();
    const sportId = readSportId(formData);

    await createAdminEventType(token, {
      sportId,
      category: readString(formData, "category"),
      slug: readString(formData, "slug"),
      name: readString(formData, "name"),
      active: readBoolean(formData, "active"),
    });

    revalidatePath("/admin");
    revalidatePath("/admin/event-types");
    revalidateEventTypesCache();
    return { success: "Event type created" };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateEventTypeAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { token } = await requireAdmin();
    const eventTypeId = readString(formData, "eventTypeId");
    const sportId = readSportId(formData);

    await updateAdminEventType(token, eventTypeId, {
      sportId,
      category: readOptionalString(formData, "category"),
      slug: readOptionalString(formData, "slug"),
      name: readOptionalString(formData, "name"),
      active: readBoolean(formData, "active"),
    });

    revalidatePath("/admin");
    revalidatePath("/admin/event-types");
    revalidatePath(`/admin/event-types/${eventTypeId}`);
    revalidateEventTypesCache();
    return { success: "Event type updated" };
  } catch (error) {
    return actionError(error);
  }
}

// Metric definitions

export async function createMetricDefinitionAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { token } = await requireAdmin();
    const sportId = readSportId(formData);
    const description = readOptionalString(formData, "description");
    const canonicalUnit = readOptionalString(formData, "canonicalUnit");

    await createAdminMetricDefinition(token, {
      sportId,
      key: readString(formData, "key"),
      name: readString(formData, "name"),
      description,
      valueType: readString(formData, "valueType"),
      canonicalUnit,
      active: readBoolean(formData, "active"),
    });

    revalidatePath("/admin");
    revalidatePath("/admin/metric-definitions");
    return { success: "Metric definition created" };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateMetricDefinitionAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { token } = await requireAdmin();
    const metricDefinitionId = readString(formData, "metricDefinitionId");
    const sportId = readSportId(formData);
    const description = formData.has("description")
      ? readString(formData, "description") || null
      : undefined;
    const canonicalUnit = formData.has("canonicalUnit")
      ? readString(formData, "canonicalUnit") || null
      : undefined;

    await updateAdminMetricDefinition(token, metricDefinitionId, {
      sportId,
      key: readOptionalString(formData, "key"),
      name: readOptionalString(formData, "name"),
      description,
      valueType: readOptionalString(formData, "valueType"),
      canonicalUnit,
      active: readBoolean(formData, "active"),
    });

    revalidatePath("/admin");
    revalidatePath("/admin/metric-definitions");
    return { success: "Metric definition updated" };
  } catch (error) {
    return actionError(error);
  }
}

// Event type metric mappings

export async function createEventTypeMetricAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { token } = await requireAdmin();
    const eventTypeId = readString(formData, "eventTypeId");

    await createAdminEventTypeMetricDefinition(token, eventTypeId, {
      metricDefinitionId: readString(formData, "metricDefinitionId"),
      required: readBoolean(formData, "required"),
      sortOrder: readOptionalInt(formData, "sortOrder"),
    });

    revalidatePath(`/admin/event-types/${eventTypeId}`);
    return { success: "Metric allowed for event type" };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateEventTypeMetricAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { token } = await requireAdmin();
    const eventTypeId = readString(formData, "eventTypeId");
    const mappingId = readString(formData, "eventTypeMetricDefinitionId");
    const sortOrder = readOptionalInt(formData, "sortOrder");

    await updateAdminEventTypeMetricDefinition(token, eventTypeId, mappingId, {
      required: formData.has("required") ? readBoolean(formData, "required") : undefined,
      sortOrder,
    });

    revalidatePath(`/admin/event-types/${eventTypeId}`);
    return { success: "Metric mapping updated" };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteEventTypeMetricAction(formData: FormData): Promise<void> {
  const { token } = await requireAdmin();
  const eventTypeId = readString(formData, "eventTypeId");
  const mappingId = readString(formData, "eventTypeMetricDefinitionId");

  await deleteAdminEventTypeMetricDefinition(token, eventTypeId, mappingId);
  revalidatePath(`/admin/event-types/${eventTypeId}`);
}
