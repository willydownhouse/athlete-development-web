import Link from "next/link";
import { format } from "date-fns";

import { athleteEventHref } from "@/components/dashboard/dashboard-nav";
import { CalendarDayActionsMenu } from "@/components/dashboard/calendar-day-actions-menu";
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
        <CalendarDayActionsMenu
          onAddClick={onAddClick}
          onCopyClick={onCopyClick}
          copyDisabled={copyDisabled}
        />
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
