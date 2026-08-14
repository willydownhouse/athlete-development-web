import Link from "next/link";
import { format } from "date-fns";

import { athleteEventHref } from "@/components/dashboard/dashboard-nav";
import { CalendarDayEventsSkeleton } from "@/components/dashboard/dashboard-skeletons";
import { EventDetailCard } from "@/components/dashboard/event-detail-card";
import type { Event } from "@/lib/types";

type CalendarDayEventsProps = {
  athleteId: string;
  timeZone: string;
  selectedDate: Date;
  events: Event[];
  loading?: boolean;
  loadError?: string | null;
  onAddClick?: () => void;
};

export function CalendarDayEvents({
  athleteId,
  timeZone,
  selectedDate,
  events,
  loading = false,
  loadError,
  onAddClick,
}: CalendarDayEventsProps) {
  const dayLabel = format(selectedDate, "EEE d MMM");

  return (
    <div className="border-t border-white/5 pt-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-white">{dayLabel}</h3>
        {onAddClick ? (
          <button
            type="button"
            onClick={onAddClick}
            className="rounded-lg bg-[#9ec9e8] px-3 py-1.5 text-sm font-medium text-[#111827] transition hover:bg-[#b7d7ec]"
          >
            Add
          </button>
        ) : null}
      </div>

      {loadError ? (
        <p className="mt-4 text-sm text-red-300">{loadError}</p>
      ) : loading ? (
        <CalendarDayEventsSkeleton />
      ) : events.length > 0 ? (
        <div className="mt-4 space-y-3">
          {events.map((event) => (
            <Link
              key={event.id}
              href={athleteEventHref(athleteId, event.id)}
              className="block rounded-2xl transition hover:bg-white/[0.02]"
            >
              <EventDetailCard event={event} timeZone={timeZone} />
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">No events logged for this day.</p>
      )}
    </div>
  );
}
