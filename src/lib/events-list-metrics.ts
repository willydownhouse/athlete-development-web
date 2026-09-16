import type { EventTypeMetricDefinition, MetricDefinition } from "@/lib/types";

export function numericMetricsForSelectedEventTypes(
  mappings: EventTypeMetricDefinition[],
  eventTypeIds: string[],
): MetricDefinition[] {
  const scoped =
    eventTypeIds.length === 0
      ? mappings
      : mappings.filter((mapping) => eventTypeIds.includes(mapping.eventTypeId));
  const byId = new Map<string, MetricDefinition>();

  for (const mapping of scoped) {
    if (mapping.metricDefinition.valueType === "number") {
      byId.set(mapping.metricDefinition.id, mapping.metricDefinition);
    }
  }

  return [...byId.values()].sort((left, right) => left.name.localeCompare(right.name));
}
