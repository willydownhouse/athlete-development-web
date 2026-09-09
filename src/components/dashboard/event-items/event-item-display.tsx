import {
  eventItemIsCollapsible,
  eventItemSameTypeIndex,
  eventItemTitle,
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

  if (!timeRange && item.durationSeconds == null && !notes) {
    return null;
  }

  return (
    <div className="mt-2 space-y-2">
      {timeRange ? (
        <p className="text-sm text-zinc-300">
          <span className="mr-2 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
            Time
          </span>
          {timeRange}
        </p>
      ) : null}
      {item.durationSeconds != null ? (
        <p className="text-sm text-zinc-300">
          <span className="mr-2 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
            Duration
          </span>
          {formatDurationSeconds(item.durationSeconds)}
        </p>
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

function ItemBody({
  item,
  timeZone,
  compactSummary,
}: {
  item: EventItem;
  timeZone: string;
  compactSummary: string | null;
}) {
  return (
    <>
      <ItemScalars item={item} timeZone={timeZone} />
      {compactSummary ? (
        <p className="mt-2 text-sm text-zinc-200">{compactSummary}</p>
      ) : (
        <ItemMetricRows metrics={item.metrics} />
      )}
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
  const title = eventItemTitle(item, sameTypeIndex);
  const titleClassName = nested
    ? "text-xs font-medium uppercase tracking-[0.12em] text-zinc-500"
    : "text-sm font-medium text-white";
  const compact = shouldUseCompactItemMetrics(item);
  const compactSummary = compact ? formatEventItemMetricSummary(item.metrics) : null;
  const collapsible = eventItemIsCollapsible(item);
  const collapsedCounts = formatEventItemCollapsedCounts(item);

  if (!collapsible) {
    if (compactSummary) {
      return (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <p className={titleClassName}>{title}</p>
          <p className="text-sm text-zinc-200 sm:text-right">{compactSummary}</p>
        </div>
      );
    }

    return <p className={titleClassName}>{title}</p>;
  }

  return (
    <details
      className="open:[&>summary_[data-item-chevron]]:rotate-180 open:[&>summary_[data-item-collapsed-counts]]:hidden"
      open
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden">
        <ItemChevron />
        <span className={`min-w-0 flex-1 ${titleClassName}`}>{title}</span>
        {collapsedCounts ? (
          <span data-item-collapsed-counts className="shrink-0 text-sm text-zinc-500">
            {collapsedCounts}
          </span>
        ) : null}
      </summary>
      <ItemBody
        item={item}
        timeZone={timeZone}
        compactSummary={compact && compactSummary ? compactSummary : null}
      />
    </details>
  );
}
