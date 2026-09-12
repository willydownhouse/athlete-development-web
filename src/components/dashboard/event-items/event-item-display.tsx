import {
  eventItemHeading,
  eventItemIsCollapsible,
  eventItemLabel,
  eventItemSameTypeIndex,
  eventItemShowsDurationOnHeading,
  eventItemUsesLabelAsHeading,
  formatEventItemCollapsedCounts,
  formatEventItemMetricSummary,
  formatEventItemTimeRange,
  shouldUseCompactItemMetrics,
} from "@/lib/event-item-display";
import { formatDurationSeconds, formatEventMetricValue } from "@/lib/event-metric-display";
import type { EventItem, EventItemMetric } from "@/lib/types";

type EventItemDisplayProps = {
  item: EventItem;
  sameTypeIndex: number;
  timeZone: string;
  nested?: boolean;
};

function ItemChevron() {
  return (
    <svg
      aria-hidden="true"
      data-item-chevron
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-4 shrink-0 text-zinc-500 transition"
    >
      <path d="M5 7.5 10 12.5 15 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ItemScalarField({ caption, value }: { caption: string; value: string }) {
  return (
    <p className="text-sm text-zinc-300">
      <span className="mr-2 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
        {caption}
      </span>
      {value}
    </p>
  );
}

function ItemMetricRows({ metrics }: { metrics: EventItemMetric[] }) {
  if (metrics.length === 0) {
    return null;
  }

  return (
    <dl className="mt-2 space-y-2">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className="flex items-start justify-between gap-4 rounded-xl bg-[#12161d] px-3 py-2.5"
        >
          <dt className="min-w-0 text-sm text-zinc-400">{metric.metricDefinition.name}</dt>
          <dd className="shrink-0 text-sm font-medium text-white">
            {formatEventMetricValue(metric)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ItemLabelAndDuration({ item }: { item: EventItem }) {
  const label = eventItemLabel(item);
  const duration =
    item.durationSeconds != null ? formatDurationSeconds(item.durationSeconds) : null;

  if (!label || eventItemUsesLabelAsHeading(item)) {
    return null;
  }

  return (
    <p className="mt-2 flex items-start justify-between gap-4 text-sm text-zinc-300">
      <span className="min-w-0">{label}</span>
      {duration ? <span className="shrink-0 font-medium text-zinc-200">{duration}</span> : null}
    </p>
  );
}

function ItemScalars({ item, timeZone }: { item: EventItem; timeZone: string }) {
  const timeRange = formatEventItemTimeRange(item, timeZone);
  const notes = item.notes?.trim();

  if (!timeRange && !notes) {
    return null;
  }

  return (
    <div className="mt-2 space-y-2">
      {timeRange ? <ItemScalarField caption="Time" value={timeRange} /> : null}
      {notes ? (
        <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-200">{notes}</p>
      ) : null}
    </div>
  );
}

function ItemChildren({ items, timeZone }: { items: EventItem[]; timeZone: string }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 divide-y divide-white/5 border-t border-white/5">
      {items.map((child, index) => (
        <div key={child.id} className="py-2">
          <EventItemDisplay
            item={child}
            sameTypeIndex={eventItemSameTypeIndex(items, index)}
            timeZone={timeZone}
            nested
          />
        </div>
      ))}
    </div>
  );
}

function ItemBody({ item, timeZone }: { item: EventItem; timeZone: string }) {
  return (
    <>
      <ItemLabelAndDuration item={item} />
      <ItemScalars item={item} timeZone={timeZone} />
      <ItemMetricRows metrics={item.metrics} />
      <ItemChildren items={item.children} timeZone={timeZone} />
    </>
  );
}

export function EventItemDisplay({
  item,
  sameTypeIndex,
  timeZone,
  nested = false,
}: EventItemDisplayProps) {
  const heading = eventItemHeading(item, sameTypeIndex);
  const label = eventItemLabel(item);
  const usesLabelAsHeading = eventItemUsesLabelAsHeading(item);
  const duration =
    item.durationSeconds != null ? formatDurationSeconds(item.durationSeconds) : null;
  const headingDuration = eventItemShowsDurationOnHeading(item) ? duration : null;
  const typeClassName = nested
    ? "text-xs font-medium uppercase tracking-[0.12em] text-zinc-500"
    : "text-sm font-medium text-white";
  const labelClassName = "shrink-0 text-sm font-medium text-zinc-200";
  const headingDurationClassName = "shrink-0 text-sm text-zinc-200";
  const compact = shouldUseCompactItemMetrics(item);
  const compactSummary = compact ? formatEventItemMetricSummary(item.metrics) : null;
  const collapsible = eventItemIsCollapsible(item);
  const collapsedCounts = formatEventItemCollapsedCounts(item);
  const summaryLabel = usesLabelAsHeading ? null : label;

  if (!collapsible) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-4">
          <span className={`min-w-0 flex-1 ${typeClassName}`}>{heading}</span>
          {headingDuration ? (
            <span className={headingDurationClassName}>{headingDuration}</span>
          ) : null}
          {!label && compactSummary ? (
            <p className="shrink-0 text-sm text-zinc-200 sm:text-right">{compactSummary}</p>
          ) : null}
        </div>
        <ItemLabelAndDuration item={item} />
        {label && compactSummary ? (
          <p className="text-sm text-zinc-200 sm:text-right">{compactSummary}</p>
        ) : null}
        <ItemScalars item={item} timeZone={timeZone} />
      </div>
    );
  }

  return (
    <details
      className="open:[&>summary_[data-item-chevron]]:rotate-180 open:[&>summary_[data-item-collapsed-counts]]:hidden open:[&>summary_[data-item-summary-label]]:hidden [&:not([open])>summary_[data-item-open-duration]]:hidden"
      open
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden">
        <ItemChevron />
        <span className={`min-w-0 flex-1 ${typeClassName}`}>{heading}</span>
        {summaryLabel ? (
          <span data-item-summary-label className={labelClassName}>
            {summaryLabel}
          </span>
        ) : null}
        {headingDuration ? (
          <span data-item-open-duration className={headingDurationClassName}>
            {headingDuration}
          </span>
        ) : null}
        {collapsedCounts ? (
          <span data-item-collapsed-counts className="shrink-0 text-sm text-zinc-500">
            {collapsedCounts}
          </span>
        ) : null}
      </summary>
      <ItemBody item={item} timeZone={timeZone} />
    </details>
  );
}
