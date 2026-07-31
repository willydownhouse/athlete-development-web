"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";

import {
  AdminApiError,
  createAdminEventType,
  createAdminEventTypeMetricDefinition,
  createAdminMetricDefinition,
  createAdminOnboardingQuestion,
  createAdminSport,
  deleteAdminEventTypeMetricDefinition,
  updateAdminEventType,
  updateAdminEventTypeMetricDefinition,
  updateAdminMetricDefinition,
  updateAdminOnboardingQuestion,
  updateAdminSport,
} from "@/lib/admin-api";
import { requireAdmin } from "@/lib/admin-auth";

export type ActionState = {
  error?: string;
  success?: string;
};

async function actionError(error: unknown): Promise<ActionState> {
  const t = await getTranslations("errors");

  if (error instanceof AdminApiError) {
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

function parseOptionalJson(
  formData: FormData,
  key: string,
  invalidJsonMessage: string,
): { ok: true; value: unknown | undefined } | { ok: false; error: string } {
  const raw = readString(formData, key);

  if (raw === "") {
    return { ok: true, value: undefined };
  }

  try {
    return { ok: true, value: JSON.parse(raw) as unknown };
  } catch {
    return { ok: false, error: invalidJsonMessage };
  }
}

function parseNullableJson(
  formData: FormData,
  key: string,
  invalidJsonMessage: string,
): { ok: true; value: unknown | null | undefined } | { ok: false; error: string } {
  if (!formData.has(key)) {
    return { ok: true, value: undefined };
  }

  const raw = readString(formData, key);

  if (raw === "") {
    return { ok: true, value: null };
  }

  try {
    return { ok: true, value: JSON.parse(raw) as unknown };
  } catch {
    return { ok: false, error: invalidJsonMessage };
  }
}

export async function createSportAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { token } = await requireAdmin();
    const tSuccess = await getTranslations("admin.sports");

    await createAdminSport(token, {
      slug: readString(formData, "slug"),
      name: readString(formData, "name"),
      active: readBoolean(formData, "active"),
    });

    revalidatePath("/admin");
    revalidatePath("/admin/sports");
    return { success: tSuccess("successCreated") };
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
    const tSuccess = await getTranslations("admin.sports");
    const sportId = readString(formData, "sportId");

    await updateAdminSport(token, sportId, {
      slug: readOptionalString(formData, "slug"),
      name: readOptionalString(formData, "name"),
      active: readBoolean(formData, "active"),
    });

    revalidatePath("/admin");
    revalidatePath("/admin/sports");
    return { success: tSuccess("successUpdated") };
  } catch (error) {
    return actionError(error);
  }
}

export async function createEventTypeAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { token } = await requireAdmin();
    const tSuccess = await getTranslations("admin.eventTypes");
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
    return { success: tSuccess("successCreated") };
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
    const tSuccess = await getTranslations("admin.eventTypes");
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
    return { success: tSuccess("successUpdated") };
  } catch (error) {
    return actionError(error);
  }
}

export async function createMetricDefinitionAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { token } = await requireAdmin();
    const tSuccess = await getTranslations("admin.metricDefinitions");
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
    return { success: tSuccess("successCreated") };
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
    const tSuccess = await getTranslations("admin.metricDefinitions");
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
    return { success: tSuccess("successUpdated") };
  } catch (error) {
    return actionError(error);
  }
}

export async function createEventTypeMetricAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { token } = await requireAdmin();
    const tSuccess = await getTranslations("admin.eventTypes");
    const eventTypeId = readString(formData, "eventTypeId");

    await createAdminEventTypeMetricDefinition(token, eventTypeId, {
      metricDefinitionId: readString(formData, "metricDefinitionId"),
      required: readBoolean(formData, "required"),
      sortOrder: readOptionalInt(formData, "sortOrder"),
    });

    revalidatePath(`/admin/event-types/${eventTypeId}`);
    return { success: tSuccess("successMetricAllowed") };
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
    const tSuccess = await getTranslations("admin.eventTypes");
    const eventTypeId = readString(formData, "eventTypeId");
    const mappingId = readString(formData, "eventTypeMetricDefinitionId");
    const sortOrder = readOptionalInt(formData, "sortOrder");

    await updateAdminEventTypeMetricDefinition(token, eventTypeId, mappingId, {
      required: formData.has("required") ? readBoolean(formData, "required") : undefined,
      sortOrder,
    });

    revalidatePath(`/admin/event-types/${eventTypeId}`);
    return { success: tSuccess("successMetricMappingUpdated") };
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

export async function createOnboardingQuestionAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { token } = await requireAdmin();
    const tErrors = await getTranslations("errors");
    const tSuccess = await getTranslations("admin.onboardingQuestions");
    const sportId = readSportId(formData);
    const optionsResult = parseOptionalJson(
      formData,
      "options",
      tErrors("invalidJson", { field: "options" }),
    );

    if (!optionsResult.ok) {
      return { error: optionsResult.error };
    }

    await createAdminOnboardingQuestion(token, {
      sportId,
      key: readString(formData, "key"),
      prompt: readString(formData, "prompt"),
      helpText: readOptionalString(formData, "helpText"),
      sortOrder: readOptionalInt(formData, "sortOrder"),
      answerType: readString(formData, "answerType"),
      options: optionsResult.value,
      mapsToField: readOptionalString(formData, "mapsToField"),
      required: readBoolean(formData, "required"),
      active: readBoolean(formData, "active"),
    });

    revalidatePath("/admin");
    revalidatePath("/admin/onboarding-questions");
    return { success: tSuccess("successCreated") };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateOnboardingQuestionAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { token } = await requireAdmin();
    const tErrors = await getTranslations("errors");
    const tSuccess = await getTranslations("admin.onboardingQuestions");
    const onboardingQuestionId = readString(formData, "onboardingQuestionId");
    const sportId = readSportId(formData);
    const helpText = formData.has("helpText")
      ? readString(formData, "helpText") || null
      : undefined;
    const mapsToField = formData.has("mapsToField")
      ? readString(formData, "mapsToField") || null
      : undefined;
    const optionsResult = parseNullableJson(
      formData,
      "options",
      tErrors("invalidJson", { field: "options" }),
    );

    if (!optionsResult.ok) {
      return { error: optionsResult.error };
    }

    await updateAdminOnboardingQuestion(token, onboardingQuestionId, {
      sportId,
      key: readOptionalString(formData, "key"),
      prompt: readOptionalString(formData, "prompt"),
      helpText,
      sortOrder: readOptionalInt(formData, "sortOrder"),
      answerType: readOptionalString(formData, "answerType"),
      options: optionsResult.value,
      mapsToField,
      required: formData.has("required") ? readBoolean(formData, "required") : undefined,
      active: readBoolean(formData, "active"),
    });

    revalidatePath("/admin");
    revalidatePath("/admin/onboarding-questions");
    revalidatePath(`/admin/onboarding-questions/${onboardingQuestionId}`);
    return { success: tSuccess("successUpdated") };
  } catch (error) {
    return actionError(error);
  }
}
