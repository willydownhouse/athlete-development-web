import {
  isEventsListItemMeasure,
  resolveEventsListItemTypeId,
  type EventsListMeasure,
} from "@/lib/events-list-params";
import { compareCatalogNames, type AppLocale } from "@/lib/locale";
import type {
  EventItemTypeChildType,
  EventItemTypeMetricDefinition,
  EventTypeMetricDefinition,
  MetricDefinition,
} from "@/lib/types";

export type ItemMeasureNumericMetrics = Record<
  Exclude<EventsListMeasure, "events">,
  MetricDefinition[]
>;

const EMPTY_ITEM_MEASURE_METRICS: ItemMeasureNumericMetrics = {
  warm_up: [],
  cool_down: [],
  exercise: [],
};

function uniqueNumericMetrics(metrics: MetricDefinition[], locale: AppLocale): MetricDefinition[] {
  const byId = new Map<string, MetricDefinition>();

  for (const metric of metrics) {
    if (metric.valueType === "number") {
      byId.set(metric.id, metric);
    }
  }

  return [...byId.values()].sort((left, right) =>
    compareCatalogNames(left.name, right.name, locale),
  );
}

export function numericMetricsForSelectedEventTypes(
  mappings: EventTypeMetricDefinition[],
  eventTypeIds: string[],
  locale: AppLocale,
): MetricDefinition[] {
  const scoped =
    eventTypeIds.length === 0
      ? mappings
      : mappings.filter((mapping) => eventTypeIds.includes(mapping.eventTypeId));

  return uniqueNumericMetrics(
    scoped.map((mapping) => mapping.metricDefinition),
    locale,
  );
}

export function numericMetricsForEventsListMeasure(
  measure: EventsListMeasure,
  itemMeasureMetrics: ItemMeasureNumericMetrics,
  eventTypeMetrics: EventTypeMetricDefinition[],
  eventTypeIds: string[],
  locale: AppLocale,
): MetricDefinition[] {
  if (isEventsListItemMeasure(measure)) {
    return itemMeasureMetrics[measure];
  }

  return numericMetricsForSelectedEventTypes(eventTypeMetrics, eventTypeIds, locale);
}

export function numericMetricsFromItemTypeMappings(
  mappings: EventItemTypeMetricDefinition[],
  locale: AppLocale,
): MetricDefinition[] {
  return uniqueNumericMetrics(
    mappings.map((mapping) => mapping.metricDefinition),
    locale,
  );
}

function numericMetricsForItemTypeTree(
  rootTypeId: string,
  mappingsByTypeId: Map<string, EventItemTypeMetricDefinition[]>,
  childrenByParentId: Map<string, string[]>,
  locale: AppLocale,
): MetricDefinition[] {
  const seenTypeIds = new Set<string>();
  const queue = [rootTypeId];
  const metrics: MetricDefinition[] = [];

  while (queue.length > 0) {
    const typeId = queue.shift();
    if (!typeId || seenTypeIds.has(typeId)) {
      continue;
    }

    seenTypeIds.add(typeId);
    metrics.push(...numericMetricsFromItemTypeMappings(mappingsByTypeId.get(typeId) ?? [], locale));

    for (const childId of childrenByParentId.get(typeId) ?? []) {
      queue.push(childId);
    }
  }

  return uniqueNumericMetrics(metrics, locale);
}

export function itemMeasureNumericMetricsFromCatalog(
  itemTypes: { id: string; slug: string; sportId: string | null }[],
  mappings: EventItemTypeMetricDefinition[],
  childTypes: Pick<EventItemTypeChildType, "parentEventItemTypeId" | "childEventItemTypeId">[],
  locale: AppLocale,
  focusSportId?: string,
): ItemMeasureNumericMetrics {
  const mappingsByTypeId = new Map<string, EventItemTypeMetricDefinition[]>();
  for (const mapping of mappings) {
    const typeMappings = mappingsByTypeId.get(mapping.eventItemTypeId) ?? [];
    typeMappings.push(mapping);
    mappingsByTypeId.set(mapping.eventItemTypeId, typeMappings);
  }

  const childrenByParentId = new Map<string, string[]>();
  for (const child of childTypes) {
    const childIds = childrenByParentId.get(child.parentEventItemTypeId) ?? [];
    childIds.push(child.childEventItemTypeId);
    childrenByParentId.set(child.parentEventItemTypeId, childIds);
  }

  const measures = ["warm_up", "cool_down", "exercise"] as const;
  const entries = measures.map((measure) => {
    const typeId = resolveEventsListItemTypeId(itemTypes, measure, focusSportId);
    if (!typeId) {
      return [measure, []] as const;
    }

    return [
      measure,
      numericMetricsForItemTypeTree(typeId, mappingsByTypeId, childrenByParentId, locale),
    ] as const;
  });

  return {
    ...EMPTY_ITEM_MEASURE_METRICS,
    ...Object.fromEntries(entries),
  };
}

export function itemMeasureChildNoun(
  measure: Exclude<EventsListMeasure, "events">,
  itemTypes: { id: string; slug: string; sportId: string | null }[],
  childTypes: EventItemTypeChildType[],
  focusSportId?: string,
): string | undefined {
  const typeId = resolveEventsListItemTypeId(itemTypes, measure, focusSportId);
  if (!typeId) {
    return undefined;
  }

  const children = childTypes.filter((child) => child.parentEventItemTypeId === typeId);
  if (children.length !== 1) {
    return undefined;
  }

  const name = children[0]?.childEventItemType.name.trim().toLowerCase();
  return name || undefined;
}
