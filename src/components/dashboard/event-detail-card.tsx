import { format } from "date-fns";
import type { ReactNode } from "react";

import { eventShortLabel, eventTitle } from "@/lib/event-display";
import {
  formatDurationSeconds,
  formatEventMetricValue,
  sortEventMetrics,
} from "@/lib/event-metric-display";
import { eventIconClassName } from "@/lib/event-tone";
import type { Event, EventIntensity } from "@/lib/types";

function formatIntensity(intensity: EventIntensity): string {
  return intensity.charAt(0).toUpperCase() + intensity.slice(1);
}

function formatTimeRange(event: Event): string {
  const start = format(new Date(event.startedAt), "HH:mm");

  if (event.endedAt) {
    const end = format(new Date(event.endedAt), "HH:mm");
    return `${start} – ${end}`;
  }

  return start;
}

function formatCategory(category: Event["category"]): string {
  return category.replace(/_/g, " ");
}

type DetailFieldProps = {
  label: string;
  value: string;
};

function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">{label}</dt>
      <dd className="mt-1 text-sm text-zinc-200">{value}</dd>
    </div>
  );
}

type EventDetailCardProps = {
  event: Event;
  onEditClick?: () => void;
  editAction?: ReactNode;
};

export function EventDetailCard({ event, onEditClick, editAction }: EventDetailCardProps) {
  const title = eventTitle(event);
  const shortLabel = eventShortLabel(event.eventType.name);
  const metrics = sortEventMetrics(event.metrics ?? []);

  return (
    <article className="rounded-2xl border border-white/5 bg-[#12161d] p-4">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xs font-semibold ${eventIconClassName(event)}`}
        >
          {shortLabel}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h4 className="text-[15px] font-semibold text-white">{title}</h4>
              <p className="mt-0.5 text-sm text-zinc-400">{event.eventType.name}</p>
            </div>
            {editAction ??
              (onEditClick ? (
                <button
                  type="button"
                  onClick={onEditClick}
                  className="shrink-0 rounded-lg px-2 py-1 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-zinc-200"
                >
                  Edit
                </button>
              ) : null)}
          </div>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
        <DetailField label="Time" value={formatTimeRange(event)} />
        {event.durationSeconds ? (
          <DetailField label="Duration" value={formatDurationSeconds(event.durationSeconds)} />
        ) : null}
        {event.intensity ? (
          <DetailField label="Intensity" value={formatIntensity(event.intensity)} />
        ) : null}
        <DetailField label="Category" value={formatCategory(event.category)} />
      </dl>

      {event.description ? (
        <div className="mt-4 border-t border-white/5 pt-4">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
            Description
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-200">
            {event.description}
          </p>
        </div>
      ) : null}

      {metrics.length > 0 ? (
        <div className="mt-4 border-t border-white/5 pt-4">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Metrics</p>
          <dl className="mt-3 space-y-3">
            {metrics.map((metric) => (
              <div
                key={metric.id}
                className="flex items-start justify-between gap-4 rounded-xl bg-[#171b22] px-3 py-2.5"
              >
                <dt className="min-w-0 text-sm text-zinc-400">{metric.metricDefinition.name}</dt>
                <dd className="shrink-0 text-sm font-medium text-white">
                  {formatEventMetricValue(metric)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      {event.originalInput ? (
        <div className="mt-4 border-t border-white/5 pt-4">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
            Original input
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
            {event.originalInput}
          </p>
        </div>
      ) : null}
    </article>
  );
}
