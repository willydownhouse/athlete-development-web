import { athleteEventHref } from "@/components/dashboard/dashboard-nav";
import { EventListRow } from "@/components/dashboard/event-list-row";
import { EventsListPagination } from "@/components/dashboard/events-list-pagination";
import type { EventsListSearchParams } from "@/lib/events-list-params";
import type { Event } from "@/lib/types";

type EventsListContentProps = {
  athleteId: string;
  params: EventsListSearchParams;
  events: Event[];
  total: number;
};

function resultSummary(params: EventsListSearchParams, total: number, count: number): string {
  if (total === 0) {
    return "No events found";
  }

  const start = params.offset + 1;
  const end = params.offset + count;

  return `Showing ${start}–${end} of ${total} events`;
}

export function EventsListContent({ athleteId, params, events, total }: EventsListContentProps) {
  return (
    <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-white">Events</h2>
        <p className="text-sm text-zinc-400">{resultSummary(params, total, events.length)}</p>
      </div>

      {events.length > 0 ? (
        <div className="mt-4 space-y-2">
          {events.map((event) => (
            <EventListRow
              key={event.id}
              event={event}
              href={athleteEventHref(athleteId, event.id)}
              showDate
            />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">Try adjusting your filters.</p>
      )}

      <EventsListPagination athleteId={athleteId} params={params} total={total} />
    </section>
  );
}
