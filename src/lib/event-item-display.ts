import { formatEventMetricValue } from "@/lib/event-metric-display";
import { formatMetricUnit, isSecondsMetric } from "@/lib/event-metric-form";
import { formatZonedTime } from "@/lib/time-zone";
import type { EventItem, EventItemMetric } from "@/lib/types";

const COMPACT_ITEM_METRIC_LIMIT = 3;

export function pluralizeItemTypeName(name: string): string {
  const trimmed = name.trim();

  if (!trimmed) {
    return "Details";
  }

  if (/s$/i.test(trimmed)) {
    return trimmed;
  }

  return `${trimmed}s`;
}

export function eventItemsSectionTitle(items: EventItem[]): string {
  const firstItem = items[0];

  if (!firstItem) {
    return "Details";
  }

  const firstTypeId = firstItem.eventItemTypeId;

  if (items.some((item) => item.eventItemTypeId !== firstTypeId)) {
    return "Details";
  }

  return pluralizeItemTypeName(firstItem.eventItemType.name);
}

export function eventItemSameTypeIndex(siblings: EventItem[], index: number): number {
  const typeId = siblings[index]?.eventItemTypeId;

  if (!typeId) {
    return 1;
  }

  let count = 0;

  for (let siblingIndex = 0; siblingIndex <= index; siblingIndex += 1) {
    if (siblings[siblingIndex]?.eventItemTypeId === typeId) {
      count += 1;
    }
  }

  return count;
}

export function eventItemTitle(item: EventItem, sameTypeIndex: number): string {
  const label = item.label?.trim();

  if (label) {
    return label;
  }

  return `${item.eventItemType.name} ${sameTypeIndex}`;
}

function itemMetricIsCompactFriendly(metric: EventItemMetric): boolean {
  const unit = metric.unit ?? metric.metricDefinition.canonicalUnit;

  return metric.metricDefinition.valueType === "number" && !isSecondsMetric(unit);
}

export function shouldUseCompactItemMetrics(item: EventItem): boolean {
  return (
    item.children.length === 0 &&
    item.metrics.length > 0 &&
    item.metrics.length <= COMPACT_ITEM_METRIC_LIMIT &&
    item.metrics.every(itemMetricIsCompactFriendly)
  );
}

export function eventItemIsCollapsible(item: EventItem): boolean {
  return (
    item.children.length > 0 ||
    Boolean(item.notes?.trim()) ||
    Boolean(item.startedAt) ||
    Boolean(item.endedAt) ||
    item.durationSeconds != null ||
    (item.metrics.length > 0 && !shouldUseCompactItemMetrics(item))
  );
}

export function formatEventItemMetricSummary(metrics: EventItemMetric[]): string {
  const parts = metrics.map((metric) => {
    const value = formatEventMetricValue(metric);
    const unit = formatMetricUnit(metric.unit ?? metric.metricDefinition.canonicalUnit);

    if (unit) {
      return `${value} ${unit}`;
    }

    return `${metric.metricDefinition.name} ${value}`;
  });

  return parts.join(" · ");
}

export function formatEventItemCollapsedCounts(item: EventItem): string {
  const parts: string[] = [];

  if (item.metrics.length === 1) {
    parts.push("1 metric");
  } else if (item.metrics.length > 1) {
    parts.push(`${item.metrics.length} metrics`);
  }

  const groups = new Map<string, { name: string; count: number }>();
  const order: string[] = [];

  for (const child of item.children) {
    const existing = groups.get(child.eventItemTypeId);

    if (existing) {
      existing.count += 1;
      continue;
    }

    groups.set(child.eventItemTypeId, { name: child.eventItemType.name, count: 1 });
    order.push(child.eventItemTypeId);
  }

  for (const typeId of order) {
    const group = groups.get(typeId);

    if (!group) {
      continue;
    }

    const label =
      group.count === 1
        ? group.name.toLowerCase()
        : pluralizeItemTypeName(group.name).toLowerCase();
    parts.push(`${group.count} ${label}`);
  }

  return parts.join(" · ");
}

export function formatEventItemTimeRange(item: EventItem, timeZone: string): string | null {
  if (item.startedAt && item.endedAt) {
    return `${formatZonedTime(timeZone, new Date(item.startedAt))} – ${formatZonedTime(timeZone, new Date(item.endedAt))}`;
  }

  if (item.startedAt) {
    return formatZonedTime(timeZone, new Date(item.startedAt));
  }

  if (item.endedAt) {
    return formatZonedTime(timeZone, new Date(item.endedAt));
  }

  return null;
}
