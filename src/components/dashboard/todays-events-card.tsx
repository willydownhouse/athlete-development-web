"use client";

import type { Event } from "@/lib/types";
import { eventDetail, eventShortLabel, eventTitle } from "@/lib/event-display";
import { eventIconClassName } from "@/lib/event-tone";

function EventRow({ event, onClick }: { event: Event; onClick?: () => void }) {
  const title = eventTitle(event);
  const shortLabel = eventShortLabel(event.eventType.name);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full min-w-0 items-start gap-3 rounded-xl px-1 py-1 text-left transition hover:bg-white/5"
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xs font-semibold ${eventIconClassName(event)}`}
      >
        {shortLabel}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="truncate text-[15px] font-semibold text-white">{title}</p>
        <p className="mt-0.5 truncate text-sm text-zinc-400">{eventDetail(event)}</p>
      </div>
    </button>
  );
}

type TodaysEventsCardProps = {
  events: Event[];
  loading?: boolean;
  loadError?: string | null;
  onAddClick?: () => void;
  onEventClick?: (event: Event) => void;
};

export function TodaysEventsCard({
  events,
  loading = false,
  loadError,
  onAddClick,
  onEventClick,
}: TodaysEventsCardProps) {
  return (
    <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-white">Today&apos;s events</h2>
        <button
          type="button"
          onClick={onAddClick}
          className="rounded-lg px-2 py-1 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-zinc-200"
        >
          Add
        </button>
      </div>

      {loadError ? (
        <p className="mt-4 text-sm text-red-300">{loadError}</p>
      ) : loading ? (
        <p className="mt-4 text-sm text-zinc-500">Loading today&apos;s events…</p>
      ) : events.length > 0 ? (
        <div className="mt-4 space-y-2">
          {events.map((event) => (
            <EventRow key={event.id} event={event} onClick={() => onEventClick?.(event)} />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">No events logged for today.</p>
      )}
    </section>
  );
}
