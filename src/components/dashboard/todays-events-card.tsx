import { athleteEventHref } from "@/components/dashboard/dashboard-nav";
import { EventListRow } from "@/components/dashboard/event-list-row";
import { getRequestLocale } from "@/lib/locale-server";
import { getMessages } from "@/lib/messages";
import type { Event } from "@/lib/types";

type TodaysEventsCardProps = {
  athleteId: string;
  events: Event[];
  timeZone: string;
  loadError?: string | null;
};

export async function TodaysEventsCard({
  athleteId,
  events,
  timeZone,
  loadError,
}: TodaysEventsCardProps) {
  const messages = getMessages(await getRequestLocale());

  return (
    <section className="rounded-2xl bg-[#171b22] px-4 py-4">
      <h2 className="text-base font-semibold text-white">{messages.dashboard.todaysEvents}</h2>

      {loadError ? (
        <p className="mt-4 text-sm text-red-300">{loadError}</p>
      ) : events.length > 0 ? (
        <div className="mt-4 space-y-2">
          {events.map((event) => (
            <EventListRow
              key={event.id}
              event={event}
              timeZone={timeZone}
              href={athleteEventHref(athleteId, event.id)}
            />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">{messages.dashboard.noEventsToday}</p>
      )}
    </section>
  );
}
