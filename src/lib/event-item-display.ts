import { formatEventMetricValue } from "@/lib/event-metric-display";
import { formatMetricUnit, isSecondsMetric } from "@/lib/event-metric-form";
import { DEFAULT_APP_LOCALE, type AppLocale } from "@/lib/locale";
import { getMessages } from "@/lib/messages";
import { formatZonedTime, formatZonedTimeRange } from "@/lib/time-zone";
import type { EventItem, EventItemMetric } from "@/lib/types";

const COMPACT_ITEM_METRIC_LIMIT = 3;

export function pluralizeItemTypeName(
  name: string,
  locale: AppLocale = DEFAULT_APP_LOCALE,
): string {
  const trimmed = name.trim();

  if (!trimmed) {
    return getMessages(locale).common.details;
  }

  if (locale === "fi") {
    return trimmed;
  }

  if (/s$/i.test(trimmed)) {
    return trimmed;
  }

  return `${trimmed}s`;
}

export function eventItemsSectionTitle(
  items: EventItem[],
  locale: AppLocale = DEFAULT_APP_LOCALE,
): string {
  const firstItem = items[0];

  if (!firstItem) {
    return getMessages(locale).common.details;
  }

  const firstTypeId = firstItem.eventItemTypeId;

  if (items.some((item) => item.eventItemTypeId !== firstTypeId)) {
    return getMessages(locale).common.details;
  }

  return pluralizeItemTypeName(firstItem.eventItemType.name, locale);
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

export function eventItemLabel(item: { label: string | null }): string | null {
  const label = item.label?.trim();

  return label ? label : null;
}

export function eventItemListTitle(item: {
  label: string | null;
  eventItemType: { name: string };
}): string {
  return eventItemLabel(item) ?? item.eventItemType.name;
}

export function eventItemTypeHeading(item: EventItem, sameTypeIndex: number): string {
  if (eventItemLabel(item) || !eventItemTypeIsNumbered(item)) {
    return item.eventItemType.name;
  }

  return `${item.eventItemType.name} ${sameTypeIndex}`;
}

function eventItemTypeIsNumbered(item: EventItem): boolean {
  const slug = item.eventItemType.slug;

  return slug !== "warm_up" && slug !== "cool_down";
}

export function eventItemUsesLabelAsHeading(item: EventItem): boolean {
  return item.eventItemType.slug === "exercise" && eventItemLabel(item) != null;
}

export function eventItemShowsDurationOnHeading(item: EventItem): boolean {
  return eventItemUsesLabelAsHeading(item) || eventItemLabel(item) == null;
}

export function eventItemHeading(item: EventItem, sameTypeIndex: number): string {
  if (eventItemUsesLabelAsHeading(item)) {
    return eventItemLabel(item) ?? item.eventItemType.name;
  }

  return eventItemTypeHeading(item, sameTypeIndex);
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
    item.children.length > 0 || (item.metrics.length > 0 && !shouldUseCompactItemMetrics(item))
  );
}

export function formatEventItemMetricSummary(
  metrics: EventItemMetric[],
  locale: AppLocale = DEFAULT_APP_LOCALE,
): string {
  const parts = metrics.map((metric) => {
    const value = formatEventMetricValue(metric, locale);
    const unit = formatMetricUnit(metric.unit ?? metric.metricDefinition.canonicalUnit);

    if (unit) {
      return `${value} ${unit}`;
    }

    return `${metric.metricDefinition.name} ${value}`;
  });

  return parts.join(" · ");
}

export function formatEventItemCollapsedCounts(
  item: EventItem,
  locale: AppLocale = DEFAULT_APP_LOCALE,
): string {
  const messages = getMessages(locale);
  const parts: string[] = [];

  if (item.metrics.length > 0) {
    const { singular, plural } = messages.events.aggregateNouns.metric;
    parts.push(messages.events.aggregateCount(item.metrics.length, singular, plural));
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
        : pluralizeItemTypeName(group.name, locale).toLowerCase();
    parts.push(`${group.count} ${label}`);
  }

  return parts.join(" · ");
}

export function formatEventItemTimeRange(
  item: EventItem,
  timeZone: string,
  locale: AppLocale = DEFAULT_APP_LOCALE,
): string | null {
  if (item.startedAt && item.endedAt) {
    return formatZonedTimeRange(timeZone, new Date(item.startedAt), new Date(item.endedAt), locale);
  }

  if (item.startedAt) {
    return formatZonedTime(timeZone, new Date(item.startedAt));
  }

  if (item.endedAt) {
    return formatZonedTime(timeZone, new Date(item.endedAt));
  }

  return null;
}
