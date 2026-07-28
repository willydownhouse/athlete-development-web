import { MOCK_TODAY_EVENTS, type MockTodayEvent } from "./mock-data";

function EventRow({ event }: { event: MockTodayEvent }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#2a303a] text-xs font-semibold text-zinc-200">
        {event.shortLabel}
      </div>
      <div className="min-w-0 pt-0.5">
        <p className="text-[15px] font-semibold text-white">{event.title}</p>
        <p className="mt-0.5 text-sm text-zinc-400">{event.detail}</p>
      </div>
    </div>
  );
}

type TodaysEventsCardProps = {
  empty?: boolean;
};

export function TodaysEventsCard({ empty = false }: TodaysEventsCardProps) {
  const events = empty ? [] : MOCK_TODAY_EVENTS;

  return (
    <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-white">Today&apos;s events</h2>
        <button
          type="button"
          className="rounded-lg px-2 py-1 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-zinc-200"
        >
          Add
        </button>
      </div>

      {events.length > 0 ? (
        <div className="mt-4 space-y-4">
          {events.map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">No events logged for today.</p>
      )}
    </section>
  );
}
