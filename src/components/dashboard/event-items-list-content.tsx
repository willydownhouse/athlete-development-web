import { athleteEventHref } from "@/components/dashboard/dashboard-nav";
import { EventItemListRow } from "@/components/dashboard/event-item-list-row";
import { EventsListPagination } from "@/components/dashboard/events-list-pagination";
import type { EventsListSearchParams } from "@/lib/events-list-params";
import type { EventItemListItem } from "@/lib/types";

type EventItemsListContentProps = {
  athleteId: string;
  params: EventsListSearchParams;
  items: EventItemListItem[];
  timeZone: string;
  total: number;
  heading: string;
};

function resultSummary(params: EventsListSearchParams, total: number, count: number, noun: string) {
  if (total === 0) {
    return `No ${noun.toLowerCase()} found`;
  }

  const start = params.offset + 1;
  const end = params.offset + count;

  return `Showing ${start}–${end} of ${total} ${noun.toLowerCase()}`;
}

export function EventItemsListContent({
  athleteId,
  params,
  items,
  timeZone,
  total,
  heading,
}: EventItemsListContentProps) {
  return (
    <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-white">{heading}</h2>
        <p className="text-sm text-zinc-400">
          {resultSummary(params, total, items.length, heading)}
        </p>
      </div>

      {items.length > 0 ? (
        <div className="mt-4 space-y-2">
          {items.map((item) => (
            <EventItemListRow
              key={item.id}
              item={item}
              timeZone={timeZone}
              href={athleteEventHref(athleteId, item.event.id)}
            />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">Try adjusting your filters.</p>
      )}

      <EventsListPagination
        athleteId={athleteId}
        params={params}
        total={total}
        ariaLabel={`${heading} pagination`}
      />
    </section>
  );
}
