import type { EventItemInput } from "@/lib/api";
import {
  fetchEventItemTypeChildTypes,
  fetchEventItemTypeMetricDefinitions,
  fetchEventTypeItemTypes,
} from "@/lib/api";
import { pluralizeItemTypeName } from "@/lib/event-item-display";
import {
  booleanMetricSavedFieldName,
  eventMetricsToFormValues,
  eventMetricsToInputs,
  parseMetricInputsWithPrefix,
  readDurationPartsSecondsFromFormData,
  secondsToDurationParts,
  validateDurationPartsForm,
  validateMetricForm,
} from "@/lib/event-metric-form";
import type {
  EventItem,
  EventItemTypeMetricDefinition,
  EventTypeMetricDefinition,
  MetricValueType,
} from "@/lib/types";

/** Keep in sync with athlete-development-service EVENT_ITEMS_MAX_ROOT_ITEMS. */
export const EVENT_ITEMS_MAX_ROOT_ITEMS = 20;

/** Keep in sync with athlete-development-service EVENT_ITEMS_MAX_TOTAL. */
export const EVENT_ITEMS_MAX_TOTAL = 100;

/** Keep in sync with athlete-development-service EVENT_ITEMS_MAX_DEPTH. */
const EVENT_ITEMS_MAX_DEPTH = 10;

/** Keep in sync with athlete-development-service EVENT_ITEM_LABEL_MAX_LENGTH. */
export const EVENT_ITEM_LABEL_MAX_LENGTH = 100;

const COMPACT_ITEM_METRIC_LIMIT = 3;

export type EventItemFormPath = number[];

export type EventItemFormTypeNode = {
  eventItemTypeId: string;
  name: string;
  slug: string;
  required: boolean;
  sortOrder: number;
  metrics: EventItemTypeMetricDefinition[];
  children: EventItemFormTypeNode[];
};

export type EventItemFormCatalog = {
  roots: EventItemFormTypeNode[];
};

export type EventItemFormDraft = {
  key: string;
  id?: string;
  eventItemTypeId: string;
  label: string;
  durationHours: string;
  durationMinutes: string;
  durationSeconds: string;
  metricValues: Record<string, string>;
  notes: string;
  startedAt: string;
  endedAt: string;
  structuredData: string;
  children: EventItemFormDraft[];
};

function itemFieldPath(path: EventItemFormPath): string {
  const [rootIndex, ...childIndexes] = path;

  if (rootIndex === undefined) {
    return "items";
  }

  return childIndexes.reduce(
    (current, childIndex) => `${current}.children[${childIndex}]`,
    `items[${rootIndex}]`,
  );
}

export function itemFieldName(path: EventItemFormPath, field: string): string {
  return `${itemFieldPath(path)}.${field}`;
}

export function itemMetricFieldName(path: EventItemFormPath, metricDefinitionId: string): string {
  return itemFieldName(path, `metric.${metricDefinitionId}`);
}

export function itemMetricValueTypeFieldName(
  path: EventItemFormPath,
  metricDefinitionId: string,
): string {
  return itemFieldName(path, `metricType.${metricDefinitionId}`);
}

function itemMetricFieldPrefix(path: EventItemFormPath): string {
  return `${itemFieldPath(path)}.metric.`;
}

function itemMetricValueTypeFieldPrefix(path: EventItemFormPath): string {
  return `${itemFieldPath(path)}.metricType.`;
}

export function itemDurationFieldNames(path: EventItemFormPath) {
  return {
    hours: itemFieldName(path, "durationHours"),
    minutes: itemFieldName(path, "durationMinutes"),
    seconds: itemFieldName(path, "durationSeconds"),
  };
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

export function shouldUseCompactItemMetricFields(
  mappings: EventItemTypeMetricDefinition[],
): boolean {
  return (
    mappings.length > 0 &&
    mappings.length <= COMPACT_ITEM_METRIC_LIMIT &&
    mappings.every(
      (mapping) =>
        mapping.metricDefinition.valueType === "number" &&
        mapping.metricDefinition.canonicalUnit !== "s",
    )
  );
}

export function eventItemFormSectionTitle(roots: EventItemFormTypeNode[]): string {
  const firstRoot = roots[0];

  if (!firstRoot) {
    return "Details";
  }

  if (roots.some((root) => root.eventItemTypeId !== firstRoot.eventItemTypeId)) {
    return "Details";
  }

  return pluralizeItemTypeName(firstRoot.name);
}

export function eventItemTypeAllowsMultiple(slug: string): boolean {
  return slug !== "warm_up" && slug !== "cool_down";
}

export function filterAddableItemTypes(
  types: EventItemFormTypeNode[],
  siblings: Array<{ eventItemTypeId: string }>,
): EventItemFormTypeNode[] {
  return types.filter((typeNode) => {
    if (eventItemTypeAllowsMultiple(typeNode.slug)) {
      return true;
    }

    return !siblings.some((item) => item.eventItemTypeId === typeNode.eventItemTypeId);
  });
}

export function findItemFormTypeNode(
  nodes: EventItemFormTypeNode[],
  eventItemTypeId: string,
): EventItemFormTypeNode | undefined {
  for (const node of nodes) {
    if (node.eventItemTypeId === eventItemTypeId) {
      return node;
    }

    const nested = findItemFormTypeNode(node.children, eventItemTypeId);
    if (nested) {
      return nested;
    }
  }

  return undefined;
}

function readField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalId(formData: FormData, key: string): string | undefined {
  const value = readField(formData, key);
  return value || undefined;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function listChildIndices(formData: FormData, parentPath: EventItemFormPath): number[] {
  const indices = new Set<number>();
  const pattern =
    parentPath.length === 0
      ? /^items\[(\d+)\]\./
      : new RegExp(`^${escapeRegExp(itemFieldPath(parentPath))}\\.children\\[(\\d+)\\]\\.`);

  for (const key of formData.keys()) {
    const match = pattern.exec(key);
    if (match?.[1]) {
      indices.add(Number.parseInt(match[1], 10));
    }
  }

  return [...indices].sort((left, right) => left - right);
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

function parseStructuredData(value: string): Record<string, unknown> | undefined {
  if (!value) {
    return undefined;
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function parseItemsAt(formData: FormData, parentPath: EventItemFormPath): EventItemInput[] {
  const items: EventItemInput[] = [];

  for (const index of listChildIndices(formData, parentPath)) {
    const parsed = parseItemAt(formData, [...parentPath, index]);
    if (parsed) {
      items.push(parsed);
    }
  }

  return items;
}

function parseItemAt(formData: FormData, path: EventItemFormPath): EventItemInput | null {
  const eventItemTypeId = readField(formData, itemFieldName(path, "eventItemTypeId"));
  if (!eventItemTypeId) {
    return null;
  }

  const children = parseItemsAt(formData, path);
  const label = readField(formData, itemFieldName(path, "label"));
  const durationSeconds = readDurationPartsSecondsFromFormData(
    formData,
    itemDurationFieldNames(path),
  );
  const metrics = parseMetricInputsWithPrefix(
    formData,
    itemMetricFieldPrefix(path),
    readMetricValueTypes(formData, itemMetricValueTypeFieldPrefix(path)),
  );
  const id = readOptionalId(formData, itemFieldName(path, "id"));
  const notes = readField(formData, itemFieldName(path, "notes"));
  const startedAt = readField(formData, itemFieldName(path, "startedAt"));
  const endedAt = readField(formData, itemFieldName(path, "endedAt"));
  const structuredData = parseStructuredData(
    readField(formData, itemFieldName(path, "structuredData")),
  );

  const isEmpty =
    !id &&
    !label &&
    durationSeconds === 0 &&
    metrics.length === 0 &&
    children.length === 0 &&
    !notes &&
    !startedAt &&
    !endedAt &&
    !structuredData;

  if (isEmpty) {
    return null;
  }

  return {
    ...(id ? { id } : {}),
    eventItemTypeId,
    ...(label ? { label } : {}),
    ...(durationSeconds > 0 ? { durationSeconds } : {}),
    ...(notes ? { notes } : {}),
    ...(startedAt ? { startedAt } : {}),
    ...(endedAt ? { endedAt } : {}),
    ...(structuredData ? { structuredData } : {}),
    ...(metrics.length > 0 ? { metrics } : {}),
    ...(children.length > 0 ? { children } : {}),
  };
}

/** Parse nested event items from form fields without a catalog fetch (API validates values). */
export function parseEventItemsFromFormData(formData: FormData): EventItemInput[] {
  return parseItemsAt(formData, []);
}

function countFormItems(formData: FormData, parentPath: EventItemFormPath): number {
  let total = 0;

  for (const index of listChildIndices(formData, parentPath)) {
    const path = [...parentPath, index];
    if (!readField(formData, itemFieldName(path, "eventItemTypeId"))) {
      continue;
    }

    total += 1 + countFormItems(formData, path);
  }

  return total;
}

function remapItemMetricsFormData(
  formData: FormData,
  path: EventItemFormPath,
  mappings: EventItemTypeMetricDefinition[],
): FormData {
  const remapped = new FormData();

  for (const mapping of mappings) {
    const metricDefinitionId = mapping.metricDefinitionId;
    const value = formData.get(itemMetricFieldName(path, metricDefinitionId));
    if (value !== null) {
      remapped.set(`metric.${metricDefinitionId}`, value);
    }

    for (const part of ["hours", "minutes", "seconds"] as const) {
      const partValue = formData.get(`${itemMetricFieldName(path, metricDefinitionId)}.${part}`);
      if (partValue !== null) {
        remapped.set(`metric.${metricDefinitionId}.${part}`, partValue);
      }
    }

    const savedValue = formData.get(
      booleanMetricSavedFieldName(itemMetricFieldName(path, metricDefinitionId)),
    );
    if (savedValue !== null) {
      remapped.set(booleanMetricSavedFieldName(`metric.${metricDefinitionId}`), savedValue);
    }
  }

  return remapped;
}

function validateItemsAt(
  formData: FormData,
  parentPath: EventItemFormPath,
  allowedTypes: EventItemFormTypeNode[],
  titlePrefix: string,
): string | null {
  for (const [position, index] of listChildIndices(formData, parentPath).entries()) {
    const path = [...parentPath, index];
    const eventItemTypeId = readField(formData, itemFieldName(path, "eventItemTypeId"));
    if (!eventItemTypeId) {
      continue;
    }

    const typeNode =
      allowedTypes.find((node) => node.eventItemTypeId === eventItemTypeId) ??
      findItemFormTypeNode(allowedTypes, eventItemTypeId);
    const typeName = typeNode?.name ?? "Item";
    const itemTitle = `${titlePrefix}${typeName} ${position + 1}`;
    const label = readField(formData, itemFieldName(path, "label"));

    if (label.length > EVENT_ITEM_LABEL_MAX_LENGTH) {
      return `${itemTitle} · Name must be ${EVENT_ITEM_LABEL_MAX_LENGTH} characters or less`;
    }

    const durationError = validateDurationPartsForm(
      formData,
      itemDurationFieldNames(path),
      `${itemTitle} · Duration`,
    );
    if (durationError) {
      return durationError;
    }

    if (typeNode) {
      const metricError = validateMetricForm(
        remapItemMetricsFormData(formData, path, typeNode.metrics),
        toEventTypeMetricMappings(typeNode.metrics),
      );
      if (metricError) {
        return `${itemTitle} · ${metricError}`;
      }

      const childError = validateItemsAt(formData, path, typeNode.children, `${itemTitle}, `);
      if (childError) {
        return childError;
      }
    }
  }

  return null;
}

export function validateEventItemsForm(
  formData: FormData,
  catalog: EventItemFormCatalog,
): string | null {
  const rootCount = listChildIndices(formData, []).filter((index) =>
    Boolean(readField(formData, itemFieldName([index], "eventItemTypeId"))),
  ).length;

  if (rootCount > EVENT_ITEMS_MAX_ROOT_ITEMS) {
    return `Events can include at most ${EVENT_ITEMS_MAX_ROOT_ITEMS} top-level items`;
  }

  if (countFormItems(formData, []) > EVENT_ITEMS_MAX_TOTAL) {
    return `Events can include at most ${EVENT_ITEMS_MAX_TOTAL} items`;
  }

  return validateItemsAt(formData, [], catalog.roots, "");
}

function metricValuesFromItem(
  mappings: EventItemTypeMetricDefinition[],
  metrics: EventItem["metrics"],
): Record<string, string> {
  const values = eventMetricsToFormValues(toEventTypeMetricMappings(mappings), metrics);
  const metricValues: Record<string, string> = {};

  for (const [key, value] of Object.entries(values)) {
    metricValues[key.startsWith("metric.") ? key.slice("metric.".length) : key] = value;
  }

  return metricValues;
}

function stringifyStructuredData(value: unknown): string {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return JSON.stringify(value);
  }

  return "";
}

function eventItemToFormDraft(item: EventItem, catalog: EventItemFormCatalog): EventItemFormDraft {
  const typeNode = findItemFormTypeNode(catalog.roots, item.eventItemTypeId);
  const durationParts = item.durationSeconds
    ? secondsToDurationParts(item.durationSeconds)
    : { hours: "", minutes: "", seconds: "" };

  return {
    key: item.id,
    id: item.id,
    eventItemTypeId: item.eventItemTypeId,
    label: item.label ?? "",
    durationHours: durationParts.hours,
    durationMinutes: durationParts.minutes,
    durationSeconds: durationParts.seconds,
    metricValues: metricValuesFromItem(typeNode?.metrics ?? [], item.metrics),
    notes: item.notes ?? "",
    startedAt: item.startedAt ?? "",
    endedAt: item.endedAt ?? "",
    structuredData: stringifyStructuredData(item.structuredData),
    children: item.children.map((child) => eventItemToFormDraft(child, catalog)),
  };
}

export function eventItemsToFormDrafts(
  items: EventItem[] | undefined,
  catalog: EventItemFormCatalog,
): EventItemFormDraft[] {
  return (items ?? []).map((item) => eventItemToFormDraft(item, catalog));
}

async function loadItemFormTypeNode(
  eventItemTypeId: string,
  eventItemType: { name: string; slug: string },
  required: boolean,
  sortOrder: number,
  depth: number,
  cache: Map<string, EventItemFormTypeNode>,
): Promise<EventItemFormTypeNode> {
  const cached = cache.get(eventItemTypeId);
  if (cached) {
    return {
      ...cached,
      required,
      sortOrder,
    };
  }

  const [childMappings, metrics] = await Promise.all([
    depth < EVENT_ITEMS_MAX_DEPTH
      ? fetchEventItemTypeChildTypes(eventItemTypeId)
      : Promise.resolve([]),
    fetchEventItemTypeMetricDefinitions(eventItemTypeId),
  ]);

  const children = await Promise.all(
    [...childMappings]
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((mapping) =>
        loadItemFormTypeNode(
          mapping.childEventItemTypeId,
          mapping.childEventItemType,
          false,
          mapping.sortOrder,
          depth + 1,
          cache,
        ),
      ),
  );

  const node: EventItemFormTypeNode = {
    eventItemTypeId,
    name: eventItemType.name,
    slug: eventItemType.slug,
    required,
    sortOrder,
    metrics: [...metrics].sort((left, right) => left.sortOrder - right.sortOrder),
    children,
  };

  cache.set(eventItemTypeId, node);
  return node;
}

export async function loadEventItemFormCatalog(eventTypeId: string): Promise<EventItemFormCatalog> {
  const rootMappings = await fetchEventTypeItemTypes(eventTypeId);
  const cache = new Map<string, EventItemFormTypeNode>();
  const roots = await Promise.all(
    [...rootMappings]
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((mapping) =>
        loadItemFormTypeNode(
          mapping.eventItemTypeId,
          mapping.eventItemType,
          mapping.required,
          mapping.sortOrder,
          1,
          cache,
        ),
      ),
  );

  return { roots };
}

/** Copy/create payload: omit item ids so the API creates new rows. */
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
