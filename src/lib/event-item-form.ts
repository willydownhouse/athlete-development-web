import type { EventItemInput } from "@/lib/api";
import {
  fetchEventItemTypeChildTypes,
  fetchEventItemTypeMetricDefinitions,
  fetchEventTypeItemTypes,
} from "@/lib/api";
import {
  eventMetricsToFormValues,
  eventMetricsToInputs,
  parseMetricInputsWithPrefix,
  parseMetricsFromFormData,
  validateMetricForm,
} from "@/lib/event-metric-form";
import type {
  EventItem,
  EventItemTypeMetricDefinition,
  EventType,
  EventTypeMetricDefinition,
  MetricValueType,
} from "@/lib/types";

/** Keep in sync with athlete-development-service EVENT_ITEMS_MAX_ROOT_ITEMS. */
export const STRENGTH_TRAINING_MAX_EXERCISES = 20;

/** Keep in sync with athlete-development-service EVENT_ITEM_LABEL_MAX_LENGTH. */
export const EVENT_ITEM_LABEL_MAX_LENGTH = 100;

export const STRENGTH_TRAINING_EVENT_TYPE_SLUG = "strength_training";
const EXERCISE_ITEM_TYPE_SLUG = "exercise";
const SET_ITEM_TYPE_SLUG = "set";

export type StrengthTrainingItemFormConfig = {
  exerciseItemTypeId: string;
  setItemTypeId: string;
  setMetricMappings: EventItemTypeMetricDefinition[];
};

export type StrengthTrainingExerciseFormValues = {
  label: string;
  sets: Record<string, string>[];
};

export function isStrengthTrainingEventType(
  eventType: Pick<EventType, "slug"> | undefined,
): boolean {
  return eventType?.slug === STRENGTH_TRAINING_EVENT_TYPE_SLUG;
}

export function exerciseItemTypeIdFieldName(exerciseIndex: number): string {
  return `items[${exerciseIndex}].eventItemTypeId`;
}

export function exerciseLabelFieldName(exerciseIndex: number): string {
  return `items[${exerciseIndex}].label`;
}

export function setItemTypeIdFieldName(exerciseIndex: number, setIndex: number): string {
  return `items[${exerciseIndex}].children[${setIndex}].eventItemTypeId`;
}

export function setMetricFieldName(
  exerciseIndex: number,
  setIndex: number,
  metricDefinitionId: string,
): string {
  return `items[${exerciseIndex}].children[${setIndex}].metric.${metricDefinitionId}`;
}

export function setMetricValueTypeFieldName(
  exerciseIndex: number,
  setIndex: number,
  metricDefinitionId: string,
): string {
  return `items[${exerciseIndex}].children[${setIndex}].metricType.${metricDefinitionId}`;
}

function readField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function listExerciseIndices(formData: FormData): number[] {
  const indices = new Set<number>();

  for (const key of formData.keys()) {
    const match = /^items\[(\d+)\]\./.exec(key);
    if (match?.[1]) {
      indices.add(Number.parseInt(match[1], 10));
    }
  }

  return [...indices].sort((left, right) => left - right);
}

function listSetIndices(formData: FormData, exerciseIndex: number): number[] {
  const indices = new Set<number>();

  for (const key of formData.keys()) {
    const match = new RegExp(`^items\\[${exerciseIndex}\\]\\.children\\[(\\d+)\\]\\.`).exec(key);
    if (match?.[1]) {
      indices.add(Number.parseInt(match[1], 10));
    }
  }

  return [...indices].sort((left, right) => left - right);
}

function toEventTypeMetricMappings(
  mappings: EventItemTypeMetricDefinition[],
): EventTypeMetricDefinition[] {
  return mappings.map((mapping) => ({
    id: mapping.id,
    eventTypeId: mapping.eventItemTypeId,
    metricDefinitionId: mapping.metricDefinitionId,
    required: mapping.required,
    sortOrder: mapping.sortOrder,
    metricDefinition: mapping.metricDefinition,
  }));
}

function prefixSetMetricsFormData(
  formData: FormData,
  exerciseIndex: number,
  setIndex: number,
  mappings: EventItemTypeMetricDefinition[],
): FormData {
  const prefixedFormData = new FormData();

  for (const mapping of mappings) {
    const fieldName = setMetricFieldName(exerciseIndex, setIndex, mapping.metricDefinitionId);
    const value = formData.get(fieldName);

    if (value !== null) {
      prefixedFormData.set(`metric.${mapping.metricDefinitionId}`, value);
    }
  }

  return prefixedFormData;
}

function parseSetMetricsFromFormData(
  formData: FormData,
  exerciseIndex: number,
  setIndex: number,
  mappings: EventItemTypeMetricDefinition[],
) {
  return parseMetricsFromFormData(
    prefixSetMetricsFormData(formData, exerciseIndex, setIndex, mappings),
    toEventTypeMetricMappings(mappings),
  );
}

function setHasMetricInput(
  formData: FormData,
  exerciseIndex: number,
  setIndex: number,
  mappings: EventItemTypeMetricDefinition[],
): boolean {
  return mappings.some((mapping) => {
    const value = readField(
      formData,
      setMetricFieldName(exerciseIndex, setIndex, mapping.metricDefinitionId),
    );
    return value !== "";
  });
}

function exerciseHasInput(
  formData: FormData,
  exerciseIndex: number,
  mappings: EventItemTypeMetricDefinition[],
): boolean {
  if (readField(formData, exerciseLabelFieldName(exerciseIndex)) !== "") {
    return true;
  }

  return listSetIndices(formData, exerciseIndex).some((setIndex) =>
    setHasMetricInput(formData, exerciseIndex, setIndex, mappings),
  );
}

function setMetricFieldPrefix(exerciseIndex: number, setIndex: number): string {
  return `items[${exerciseIndex}].children[${setIndex}].metric.`;
}

function setMetricValueTypeFieldPrefix(exerciseIndex: number, setIndex: number): string {
  return `items[${exerciseIndex}].children[${setIndex}].metricType.`;
}

function isMetricValueType(value: FormDataEntryValue | null): value is MetricValueType {
  return value === "number" || value === "text" || value === "boolean";
}

function readMetricValueTypes(formData: FormData, prefix: string): Record<string, MetricValueType> {
  const valueTypes: Record<string, MetricValueType> = {};

  for (const key of formData.keys()) {
    if (!key.startsWith(prefix)) {
      continue;
    }

    const metricDefinitionId = key.slice(prefix.length);
    const valueType = formData.get(key);
    if (metricDefinitionId && isMetricValueType(valueType)) {
      valueTypes[metricDefinitionId] = valueType;
    }
  }

  return valueTypes;
}

function setHasAnyMetricInput(
  formData: FormData,
  exerciseIndex: number,
  setIndex: number,
): boolean {
  const prefix = setMetricFieldPrefix(exerciseIndex, setIndex);

  for (const key of formData.keys()) {
    if (!key.startsWith(prefix)) {
      continue;
    }

    const raw = formData.get(key);
    if (raw === "on") {
      return true;
    }

    if (typeof raw === "string" && raw.trim() !== "") {
      return true;
    }
  }

  return false;
}

function exerciseHasAnyInput(formData: FormData, exerciseIndex: number): boolean {
  if (readField(formData, exerciseLabelFieldName(exerciseIndex)) !== "") {
    return true;
  }

  return listSetIndices(formData, exerciseIndex).some((setIndex) =>
    setHasAnyMetricInput(formData, exerciseIndex, setIndex),
  );
}

/** Parse nested event items from form fields without a catalog fetch (API validates values). */
export function parseEventItemsFromFormData(formData: FormData): EventItemInput[] {
  const items: EventItemInput[] = [];

  for (const exerciseIndex of listExerciseIndices(formData)) {
    if (!exerciseHasAnyInput(formData, exerciseIndex)) {
      continue;
    }

    const eventItemTypeId = readField(formData, exerciseItemTypeIdFieldName(exerciseIndex));
    if (!eventItemTypeId) {
      continue;
    }

    const label = readField(formData, exerciseLabelFieldName(exerciseIndex));
    const children: EventItemInput[] = [];

    for (const setIndex of listSetIndices(formData, exerciseIndex)) {
      if (!setHasAnyMetricInput(formData, exerciseIndex, setIndex)) {
        continue;
      }

      const setItemTypeId = readField(formData, setItemTypeIdFieldName(exerciseIndex, setIndex));
      if (!setItemTypeId) {
        continue;
      }

      const metrics = parseMetricInputsWithPrefix(
        formData,
        setMetricFieldPrefix(exerciseIndex, setIndex),
        readMetricValueTypes(formData, setMetricValueTypeFieldPrefix(exerciseIndex, setIndex)),
      );

      children.push({
        eventItemTypeId: setItemTypeId,
        metrics: metrics.length > 0 ? metrics : undefined,
      });
    }

    items.push({
      eventItemTypeId,
      label: label || undefined,
      children: children.length > 0 ? children : undefined,
    });
  }

  return items;
}

export function parseStrengthTrainingItemsFromFormData(
  formData: FormData,
  config: StrengthTrainingItemFormConfig,
): EventItemInput[] {
  const items: EventItemInput[] = [];

  for (const exerciseIndex of listExerciseIndices(formData)) {
    if (!exerciseHasInput(formData, exerciseIndex, config.setMetricMappings)) {
      continue;
    }

    const label = readField(formData, exerciseLabelFieldName(exerciseIndex));
    const children: EventItemInput[] = [];

    for (const setIndex of listSetIndices(formData, exerciseIndex)) {
      if (!setHasMetricInput(formData, exerciseIndex, setIndex, config.setMetricMappings)) {
        continue;
      }

      const metrics = parseSetMetricsFromFormData(
        formData,
        exerciseIndex,
        setIndex,
        config.setMetricMappings,
      );

      children.push({
        eventItemTypeId: config.setItemTypeId,
        metrics: metrics.length > 0 ? metrics : undefined,
      });
    }

    items.push({
      eventItemTypeId: config.exerciseItemTypeId,
      label: label || undefined,
      children: children.length > 0 ? children : undefined,
    });
  }

  return items;
}

function validateSetMetricsForm(
  formData: FormData,
  exerciseIndex: number,
  setIndex: number,
  mappings: EventItemTypeMetricDefinition[],
): string | null {
  return validateMetricForm(
    prefixSetMetricsFormData(formData, exerciseIndex, setIndex, mappings),
    toEventTypeMetricMappings(mappings),
  );
}

export function validateStrengthTrainingItemsForm(
  formData: FormData,
  config: StrengthTrainingItemFormConfig,
): string | null {
  const exerciseIndices = listExerciseIndices(formData);

  if (exerciseIndices.length > STRENGTH_TRAINING_MAX_EXERCISES) {
    return `Strength training can include at most ${STRENGTH_TRAINING_MAX_EXERCISES} exercises`;
  }

  for (const exerciseIndex of exerciseIndices) {
    const label = readField(formData, exerciseLabelFieldName(exerciseIndex));

    if (label.length > EVENT_ITEM_LABEL_MAX_LENGTH) {
      return `Exercise ${exerciseIndex + 1} · Exercise name must be ${EVENT_ITEM_LABEL_MAX_LENGTH} characters or less`;
    }

    for (const setIndex of listSetIndices(formData, exerciseIndex)) {
      const metricError = validateSetMetricsForm(
        formData,
        exerciseIndex,
        setIndex,
        config.setMetricMappings,
      );

      if (metricError) {
        return `Exercise ${exerciseIndex + 1}, Set ${setIndex + 1} · ${metricError}`;
      }
    }
  }

  return null;
}

export function eventItemsToStrengthFormValues(
  items: EventItem[] | undefined,
  exerciseItemTypeId: string,
  setItemTypeId: string,
  setMetricMappings: EventItemTypeMetricDefinition[],
): StrengthTrainingExerciseFormValues[] {
  const metricMappings = toEventTypeMetricMappings(setMetricMappings);

  return (items ?? [])
    .filter((item) => item.eventItemTypeId === exerciseItemTypeId)
    .map((exercise) => ({
      label: exercise.label ?? "",
      sets: exercise.children
        .filter((child) => child.eventItemTypeId === setItemTypeId)
        .map((setItem) => {
          const values = eventMetricsToFormValues(metricMappings, setItem.metrics);

          const setValues: Record<string, string> = {};

          for (const mapping of setMetricMappings) {
            const value = values[mapping.metricDefinitionId];
            if (value !== undefined) {
              setValues[mapping.metricDefinitionId] = value;
            }
          }

          return setValues;
        }),
    }));
}

export async function loadStrengthTrainingItemFormConfig(
  eventTypeId: string,
): Promise<StrengthTrainingItemFormConfig | null> {
  const rootMappings = await fetchEventTypeItemTypes(eventTypeId);
  const exerciseMapping = rootMappings.find(
    (mapping) => mapping.eventItemType.slug === EXERCISE_ITEM_TYPE_SLUG,
  );

  if (!exerciseMapping) {
    return null;
  }

  const childMappings = await fetchEventItemTypeChildTypes(exerciseMapping.eventItemTypeId);
  const setMapping = childMappings.find(
    (mapping) => mapping.childEventItemType.slug === SET_ITEM_TYPE_SLUG,
  );

  if (!setMapping) {
    return null;
  }

  const setMetricMappings = await fetchEventItemTypeMetricDefinitions(
    setMapping.childEventItemTypeId,
  );

  return {
    exerciseItemTypeId: exerciseMapping.eventItemTypeId,
    setItemTypeId: setMapping.childEventItemTypeId,
    setMetricMappings,
  };
}

export function eventItemsToInputs(items: EventItem[]): EventItemInput[] {
  return items.map((item) => eventItemToInput(item));
}

function eventItemToInput(item: EventItem): EventItemInput {
  const metrics = eventMetricsToInputs(item.metrics);
  const children = item.children.length > 0 ? eventItemsToInputs(item.children) : undefined;
  const label = item.label?.trim();
  const notes = item.notes?.trim();
  const structuredData =
    typeof item.structuredData === "object" &&
    item.structuredData !== null &&
    !Array.isArray(item.structuredData)
      ? (item.structuredData as Record<string, unknown>)
      : undefined;

  return {
    eventItemTypeId: item.eventItemTypeId,
    sortOrder: item.sortOrder,
    ...(label ? { label } : {}),
    ...(item.startedAt ? { startedAt: item.startedAt } : {}),
    ...(item.endedAt ? { endedAt: item.endedAt } : {}),
    ...(item.durationSeconds != null && item.durationSeconds > 0
      ? { durationSeconds: item.durationSeconds }
      : {}),
    ...(notes ? { notes } : {}),
    ...(structuredData ? { structuredData } : {}),
    ...(metrics.length > 0 ? { metrics } : {}),
    ...(children ? { children } : {}),
  };
}
