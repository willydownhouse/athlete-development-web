import Link from "next/link";

import { eventShortLabel } from "@/lib/event-display";
import { eventItemListTitle } from "@/lib/event-item-display";
import { formatDurationSeconds } from "@/lib/event-metric-display";
import { eventIconClassName } from "@/lib/event-tone";
import { formatZonedShortDate } from "@/lib/time-zone";
import type { EventItemListItem } from "@/lib/types";

type EventItemListRowProps = {
  item: EventItemListItem;
  href: string;
  timeZone: string;
};

export function EventItemListRow({ item, href, timeZone }: EventItemListRowProps) {
  const title = eventItemListTitle(item);
  const shortLabel = eventShortLabel(item.event.eventType.name);
  const date = formatZonedShortDate(timeZone, new Date(item.event.startedAt));
  const eventName = item.event.title ?? item.event.eventType.name;
  const detail = [date, eventName];

  if (item.durationSeconds) {
    detail.push(formatDurationSeconds(item.durationSeconds));
  }

  return (
    <Link
      href={href}
      className="flex w-full min-w-0 items-start gap-3 rounded-xl px-1 py-1 text-left transition hover:bg-white/5"
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xs font-semibold ${eventIconClassName(
          {
            category: item.event.eventType.category,
            sportId: item.event.eventType.sportId,
            eventType: item.event.eventType,
          },
        )}`}
      >
        {shortLabel}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="truncate text-[15px] font-semibold text-white">{title}</p>
        <p className="mt-0.5 truncate text-sm text-zinc-400">{detail.join(" · ")}</p>
      </div>
    </Link>
  );
}
