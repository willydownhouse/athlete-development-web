import Link from "next/link";

import { athleteEventHref } from "@/components/dashboard/dashboard-nav";
import { EventListRow } from "@/components/dashboard/event-list-row";
import type { Event } from "@/lib/types";

type TodaysEventsCardProps = {
  athleteId: string;
  events: Event[];
  loadError?: string | null;
  eventsHref: string;
};

export function TodaysEventsCard({
  athleteId,
  events,
  loadError,
  eventsHref,
}: TodaysEventsCardProps) {
  return (
    <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-white">Today&apos;s events</h2>
        <Link
          href={eventsHref}
          className="shrink-0 text-sm font-medium text-zinc-400 transition hover:text-zinc-200"
        >
          View all
        </Link>
      </div>

      {loadError ? (
        <p className="mt-4 text-sm text-red-300">{loadError}</p>
      ) : events.length > 0 ? (
        <div className="mt-4 space-y-2">
          {events.map((event) => (
            <EventListRow
              key={event.id}
              event={event}
              href={athleteEventHref(athleteId, event.id)}
            />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">No events logged for today.</p>
      )}
    </section>
  );
}
