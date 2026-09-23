import { athleteEventHref } from "@/components/dashboard/dashboard-nav";
import { EventListRow } from "@/components/dashboard/event-list-row";
import { EventsListPagination } from "@/components/dashboard/events-list-pagination";
import type { EventsListSearchParams } from "@/lib/events-list-params";
import type { AppLocale } from "@/lib/locale";
import { getMessages } from "@/lib/messages";
import type { Event } from "@/lib/types";

type EventsListContentProps = {
  athleteId: string;
  params: EventsListSearchParams;
  events: Event[];
  timeZone: string;
  total: number;
  locale: AppLocale;
};

function resultSummary(
  params: EventsListSearchParams,
  total: number,
  count: number,
  locale: AppLocale,
): string {
  const messages = getMessages(locale);

  if (total === 0) {
    return messages.events.noEventsFound;
  }

  const start = params.offset + 1;
  const end = params.offset + count;

  return messages.events.showingEvents(start, end, total);
}

export function EventsListContent({
  athleteId,
  params,
  events,
  timeZone,
  total,
  locale,
}: EventsListContentProps) {
  const messages = getMessages(locale);

  return (
    <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-white">{messages.events.showEvents}</h2>
        <p className="text-sm text-zinc-400">
          {resultSummary(params, total, events.length, locale)}
        </p>
      </div>

      {events.length > 0 ? (
        <div className="mt-4 space-y-2">
          {events.map((event) => (
            <EventListRow
              key={event.id}
              event={event}
              timeZone={timeZone}
              href={athleteEventHref(athleteId, event.id)}
              showDate
            />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">{messages.events.tryAdjustingFilters}</p>
      )}

      <EventsListPagination athleteId={athleteId} params={params} total={total} locale={locale} />
    </section>
  );
}
