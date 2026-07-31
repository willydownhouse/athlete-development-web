"use client";

import { format } from "date-fns";
import { useTranslations } from "next-intl";

import { EventDetailCard } from "@/components/dashboard/event-detail-card";
import type { Event } from "@/lib/types";

type CalendarDayEventsProps = {
  selectedDate: Date;
  events: Event[];
  loading?: boolean;
  loadError?: string | null;
  onAddClick?: () => void;
  onEventClick?: (event: Event) => void;
};

export function CalendarDayEvents({
  selectedDate,
  events,
  loading = false,
  loadError,
  onAddClick,
  onEventClick,
}: CalendarDayEventsProps) {
  const t = useTranslations("dashboard.calendar");
  const tCommon = useTranslations("common");
  const dayLabel = format(selectedDate, "EEE d MMM");

  return (
    <div className="border-t border-white/5 pt-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-white">{dayLabel}</h3>
        <button
          type="button"
          onClick={onAddClick}
          className="rounded-lg px-2 py-1 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-zinc-200"
        >
          {tCommon("add")}
        </button>
      </div>

      {loadError ? (
        <p className="mt-4 text-sm text-red-300">{loadError}</p>
      ) : loading ? (
        <p className="mt-4 text-sm text-zinc-500">{t("loadingEvents")}</p>
      ) : events.length > 0 ? (
        <div className="mt-4 space-y-3">
          {events.map((event) => (
            <EventDetailCard
              key={event.id}
              event={event}
              onEditClick={() => onEventClick?.(event)}
            />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">{t("noEventsForDay")}</p>
      )}
    </div>
  );
}
