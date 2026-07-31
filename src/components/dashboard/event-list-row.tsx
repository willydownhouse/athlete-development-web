import type { Event } from "@/lib/types";
import { eventDetail, eventShortLabel, eventTitle } from "@/lib/event-display";
import { eventIconClassName } from "@/lib/event-tone";

type EventListRowProps = {
  event: Event;
  onClick?: () => void;
};

export function EventListRow({ event, onClick }: EventListRowProps) {
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
