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
  onCopyClick?: () => void;
  copyDisabled?: boolean;
};

export function CalendarDayEvents({
  athleteId,
  timeZone,
  selectedDate,
  events,
  loading = false,
  loadError,
  onAddClick,
  onCopyClick,
  copyDisabled = false,
}: CalendarDayEventsProps) {
  const dayLabel = format(selectedDate, "EEE d MMM");

  return (
    <div className="border-t border-white/5 pt-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-white">{dayLabel}</h3>
        <div className="flex shrink-0 items-center gap-2">
          {onCopyClick ? (
            <button
              type="button"
              onClick={onCopyClick}
              disabled={copyDisabled}
              className="rounded-lg border border-white/10 bg-[#252b36] px-3 py-1.5 text-sm font-medium text-zinc-200 transition hover:bg-[#2f3642] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Copy day
            </button>
          ) : null}
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
