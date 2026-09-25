"use client";

import type { ReactNode } from "react";

import { EventItemsDisplay } from "@/components/dashboard/event-items/event-items-display";
import { formatEventCategoryLabel, formatEventIntensityLabel } from "@/lib/enum-labels";
import { eventShortLabel, eventTitle } from "@/lib/event-display";
import { formatDurationSeconds, formatEventMetricValue } from "@/lib/event-metric-display";
import type { AppLocale } from "@/lib/locale";
import { useAppLocale } from "@/lib/locale-context";
import { getMessages } from "@/lib/messages";
import { eventIconClassName } from "@/lib/event-tone";
import { roundedTileClassName } from "@/lib/rounded-tile";
import { formatZonedTimeRange } from "@/lib/time-zone";
import type { Event } from "@/lib/types";

function formatTimeRange(event: Event, timeZone: string, locale: AppLocale): string {
  return formatZonedTimeRange(
    timeZone,
    new Date(event.startedAt),
    event.endedAt ? new Date(event.endedAt) : null,
    locale,
  );
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
  timeZone: string;
  editAction?: ReactNode;
  afterBasicInfo?: ReactNode;
};

export function EventDetailCard({
  event,
  timeZone,
  editAction,
  afterBasicInfo,
}: EventDetailCardProps) {
  const locale = useAppLocale();
  const messages = getMessages(locale);
  const title = eventTitle(event);
  const shortLabel = eventShortLabel(event.eventType.name);
  const metrics = event.metrics ?? [];

  return (
    <article className="rounded-2xl bg-[#12161d] p-4">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center text-xs font-semibold ${roundedTileClassName} ${eventIconClassName(event)}`}
        >
          {shortLabel}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h4 className="text-[15px] font-semibold text-white">{title}</h4>
              <p className="mt-0.5 text-sm text-zinc-400">{event.eventType.name}</p>
            </div>
            {editAction}
          </div>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
        <DetailField
          label={messages.events.time}
          value={formatTimeRange(event, timeZone, locale)}
        />
        {event.durationSeconds ? (
          <DetailField
            label={messages.common.duration}
            value={formatDurationSeconds(event.durationSeconds)}
          />
        ) : null}
        {event.intensity ? (
          <DetailField
            label={messages.events.intensity}
            value={formatEventIntensityLabel(event.intensity, locale)}
          />
        ) : null}
        <DetailField
          label={messages.events.category}
          value={formatEventCategoryLabel(event.category, locale)}
        />
      </dl>

      {event.description ? (
        <div className="mt-4 border-t border-white/5 pt-4">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
            {messages.events.description}
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-200">
            {event.description}
          </p>
        </div>
      ) : null}

      {afterBasicInfo}

      {metrics.length > 0 ? (
        <div className="mt-4 border-t border-white/5 pt-4">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
            {messages.common.metrics}
          </p>
          <dl className="mt-3 space-y-3">
            {metrics.map((metric) => (
              <div
                key={metric.id}
                className="flex items-start justify-between gap-4 rounded-xl bg-[#171b22] px-3 py-2.5"
              >
                <dt className="min-w-0 text-sm text-zinc-400">{metric.metricDefinition.name}</dt>
                <dd className="shrink-0 text-sm font-medium text-white">
                  {formatEventMetricValue(metric, locale)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      <EventItemsDisplay items={event.items ?? []} timeZone={timeZone} />

      {event.originalInput ? (
        <div className="mt-4 border-t border-white/5 pt-4">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
            {messages.events.originalInput}
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
            {event.originalInput}
          </p>
        </div>
      ) : null}
    </article>
  );
}
