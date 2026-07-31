"use client";

import { format } from "date-fns";
import { useTranslations } from "next-intl";

import { eventShortLabel, eventTitle } from "@/lib/event-display";
import { createDisplayMessages } from "@/lib/display-messages";
import {
  formatDurationSeconds,
  formatEventMetricValue,
  sortEventMetrics,
} from "@/lib/event-metric-display";
import { createCategoryLabel } from "@/lib/i18n-labels";
import { eventIconClassName } from "@/lib/event-tone";
import type { Event, EventIntensity } from "@/lib/types";

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

function formatTimeRange(event: Event): string {
  const start = format(new Date(event.startedAt), "HH:mm");

  if (event.endedAt) {
    const end = format(new Date(event.endedAt), "HH:mm");
    return `${start} – ${end}`;
  }

  return start;
}

type EventDetailCardProps = {
  event: Event;
  onEditClick?: () => void;
};

export function EventDetailCard({ event, onEditClick }: EventDetailCardProps) {
  const t = useTranslations("events.detail");
  const tIntensity = useTranslations("events.form.intensity");
  const tAdmin = useTranslations("admin");
  const tCommon = useTranslations("common");
  const categoryLabel = createCategoryLabel(tAdmin);
  const display = createDisplayMessages(tCommon);

  const title = eventTitle(event);
  const shortLabel = eventShortLabel(event.eventType.name);
  const metrics = sortEventMetrics(event.metrics ?? []);

  function formatIntensity(intensity: EventIntensity): string {
    return tIntensity(intensity);
  }

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
            {onEditClick ? (
              <button
                type="button"
                onClick={onEditClick}
                className="shrink-0 rounded-lg px-2 py-1 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-zinc-200"
              >
                {tCommon("edit")}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
        <DetailField label={t("time")} value={formatTimeRange(event)} />
        {event.durationSeconds ? (
          <DetailField
            label={t("duration")}
            value={formatDurationSeconds(event.durationSeconds, display)}
          />
        ) : null}
        {event.intensity ? (
          <DetailField label={t("intensity")} value={formatIntensity(event.intensity)} />
        ) : null}
        <DetailField label={t("category")} value={categoryLabel(event.category)} />
      </dl>

      {event.description ? (
        <div className="mt-4 border-t border-white/5 pt-4">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
            {t("description")}
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-200">
            {event.description}
          </p>
        </div>
      ) : null}

      {metrics.length > 0 ? (
        <div className="mt-4 border-t border-white/5 pt-4">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
            {t("metrics")}
          </p>
          <dl className="mt-3 space-y-3">
            {metrics.map((metric) => (
              <div
                key={metric.id}
                className="flex items-start justify-between gap-4 rounded-xl bg-[#171b22] px-3 py-2.5"
              >
                <dt className="min-w-0 text-sm text-zinc-400">{metric.metricDefinition.name}</dt>
                <dd className="shrink-0 text-sm font-medium text-white">
                  {formatEventMetricValue(metric, display)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      {event.originalInput ? (
        <div className="mt-4 border-t border-white/5 pt-4">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
            {t("originalInput")}
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
            {event.originalInput}
          </p>
        </div>
      ) : null}
    </article>
  );
}
