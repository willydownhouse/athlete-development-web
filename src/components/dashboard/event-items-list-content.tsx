import { athleteEventHref } from "@/components/dashboard/dashboard-nav";
import { EventItemListRow } from "@/components/dashboard/event-item-list-row";
import { EventsListPagination } from "@/components/dashboard/events-list-pagination";
import type { EventsListSearchParams } from "@/lib/events-list-params";
import type { AppLocale } from "@/lib/locale";
import { getMessages } from "@/lib/messages";
import type { EventItemListItem } from "@/lib/types";

type EventItemsListContentProps = {
  athleteId: string;
  params: EventsListSearchParams;
  items: EventItemListItem[];
  timeZone: string;
  total: number;
  heading: string;
  locale: AppLocale;
};

function resultSummary(
  params: EventsListSearchParams,
  total: number,
  count: number,
  noun: string,
  locale: AppLocale,
) {
  const messages = getMessages(locale);
  const label = locale === "fi" ? noun : noun.toLowerCase();

  if (total === 0) {
    return messages.events.noNounFound(label);
  }

  const start = params.offset + 1;
  const end = params.offset + count;

  return messages.events.showingNoun(start, end, total, label);
}

export function EventItemsListContent({
  athleteId,
  params,
  items,
  timeZone,
  total,
  heading,
  locale,
}: EventItemsListContentProps) {
  const messages = getMessages(locale);

  return (
    <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-white">{heading}</h2>
        <p className="text-sm text-zinc-400">
          {resultSummary(params, total, items.length, heading, locale)}
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
        <p className="mt-4 text-sm text-zinc-500">{messages.events.tryAdjustingFilters}</p>
      )}

      <EventsListPagination
        athleteId={athleteId}
        params={params}
        total={total}
        locale={locale}
        ariaLabel={messages.events.paginationNoun(heading)}
      />
    </section>
  );
}
