"use client";

import { useTranslations } from "next-intl";

import type { Event } from "@/lib/types";

import { EventListRow } from "./event-list-row";

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
  const t = useTranslations("dashboard.todaysEvents");
  const tCommon = useTranslations("common");

  return (
    <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-white">{t("title")}</h2>
        <button
          type="button"
          onClick={onAddClick}
          className="rounded-lg px-2 py-1 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-zinc-200"
        >
          {tCommon("add")}
        </button>
      </div>

      {loadError ? (
        <p className="mt-4 text-sm text-red-300">{loadError}</p>
      ) : loading ? (
        <p className="mt-4 text-sm text-zinc-500">{t("loading")}</p>
      ) : events.length > 0 ? (
        <div className="mt-4 space-y-2">
          {events.map((event) => (
            <EventListRow key={event.id} event={event} onClick={() => onEventClick?.(event)} />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">{t("empty")}</p>
      )}
    </section>
  );
}
