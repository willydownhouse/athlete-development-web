import { athleteEventHref } from "@/components/dashboard/dashboard-nav";
import { EventListRow } from "@/components/dashboard/event-list-row";
import type { Event } from "@/lib/types";

type TodaysEventsCardProps = {
  athleteId: string;
  events: Event[];
  loadError?: string | null;
};

export function TodaysEventsCard({ athleteId, events, loadError }: TodaysEventsCardProps) {
  return (
    <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4">
      <h2 className="text-base font-semibold text-white">Today&apos;s events</h2>

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
