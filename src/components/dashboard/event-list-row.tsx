import Link from "next/link";

import { eventDetail, eventShortLabel, eventTitle } from "@/lib/event-display";
import { eventIconClassName } from "@/lib/event-tone";
import { getRequestLocale } from "@/lib/locale-server";
import type { Event } from "@/lib/types";

type EventListRowProps = {
  event: Event;
  href: string;
  timeZone: string;
  showDate?: boolean;
};

export async function EventListRow({ event, href, timeZone, showDate = false }: EventListRowProps) {
  const locale = await getRequestLocale();
  const title = eventTitle(event);
  const shortLabel = eventShortLabel(event.eventType.name);

  return (
    <Link
      href={href}
      className="flex w-full min-w-0 items-start gap-3 rounded-xl px-1 py-1 text-left transition hover:bg-white/5"
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xs font-semibold ${eventIconClassName(event)}`}
      >
        {shortLabel}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="truncate text-[15px] font-semibold text-white">{title}</p>
        <p className="mt-0.5 truncate text-sm text-zinc-400">
          {eventDetail(event, { showDate, timeZone, locale })}
        </p>
      </div>
    </Link>
  );
}
