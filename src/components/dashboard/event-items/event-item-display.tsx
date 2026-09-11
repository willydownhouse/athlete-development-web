import {
  eventItemIsCollapsible,
  eventItemLabel,
  eventItemSameTypeIndex,
  eventItemShowsLabelWithDuration,
  eventItemTypeHeading,
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

function ItemScalars({ item, timeZone }: { item: EventItem; timeZone: string }) {
  const timeRange = formatEventItemTimeRange(item, timeZone);
  const notes = item.notes?.trim();
  const label = eventItemShowsLabelWithDuration(item) ? eventItemLabel(item) : null;
  const duration =
    item.durationSeconds != null ? formatDurationSeconds(item.durationSeconds) : null;
  const labelWithDuration = eventItemShowsLabelWithDuration(item);

  if (!timeRange && !duration && !notes && !label) {
    return null;
  }

  return (
    <div className="mt-2 space-y-2">
      {timeRange ? <ItemScalarField caption="Time" value={timeRange} /> : null}
      {labelWithDuration && (label || duration) ? (
        <p className="flex items-start justify-between gap-4 text-sm text-zinc-300">
          <span className="min-w-0">{label}</span>
          {duration ? <span className="shrink-0 font-medium text-zinc-200">{duration}</span> : null}
        </p>
      ) : null}
      {!labelWithDuration && duration ? (
        <ItemScalarField caption="Duration" value={duration} />
      ) : null}
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
      <ItemScalars item={item} timeZone={timeZone} />
      <ItemMetricRows metrics={item.metrics} />
      <ItemChildren items={item.children} timeZone={timeZone} />
    </>
  );
}

function ItemTypeAndLabel({
  typeHeading,
  label,
  typeClassName,
  labelClassName,
}: {
  typeHeading: string;
  label: string | null;
  typeClassName: string;
  labelClassName: string;
}) {
  return (
    <>
      <span className={`min-w-0 flex-1 ${typeClassName}`}>{typeHeading}</span>
      {label ? <span className={labelClassName}>{label}</span> : null}
    </>
  );
}

export function EventItemDisplay({
  item,
  sameTypeIndex,
  timeZone,
  nested = false,
}: EventItemDisplayProps) {
  const typeHeading = eventItemTypeHeading(item, sameTypeIndex);
  const label = eventItemShowsLabelWithDuration(item) ? null : eventItemLabel(item);
  const typeClassName = nested
    ? "text-xs font-medium uppercase tracking-[0.12em] text-zinc-500"
    : "text-sm font-medium text-white";
  const labelClassName = "shrink-0 text-sm font-medium text-zinc-200";
  const compact = shouldUseCompactItemMetrics(item);
  const compactSummary = compact ? formatEventItemMetricSummary(item.metrics) : null;
  const collapsible = eventItemIsCollapsible(item);
  const collapsedCounts = formatEventItemCollapsedCounts(item);

  if (!collapsible) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-4">
          <ItemTypeAndLabel
            typeHeading={typeHeading}
            label={label}
            typeClassName={typeClassName}
            labelClassName={labelClassName}
          />
          {!label && compactSummary ? (
            <p className="shrink-0 text-sm text-zinc-200 sm:text-right">{compactSummary}</p>
          ) : null}
        </div>
        {label && compactSummary ? (
          <p className="text-sm text-zinc-200 sm:text-right">{compactSummary}</p>
        ) : null}
      </div>
    );
  }

  return (
    <details
      className="open:[&>summary_[data-item-chevron]]:rotate-180 open:[&>summary_[data-item-collapsed-counts]]:hidden [&:not([open])>summary_[data-item-expanded-label]]:hidden"
      open
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden">
        <ItemChevron />
        <span className={`min-w-0 flex-1 ${typeClassName}`}>{typeHeading}</span>
        {label ? (
          <span data-item-expanded-label className={labelClassName}>
            {label}
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
