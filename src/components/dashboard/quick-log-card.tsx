"use client";

import { useMemo, useState } from "react";

import { filterEventTypesByScope, type EventTypeScope } from "@/lib/event-type-groups";
import { useAppLocale } from "@/lib/locale-context";
import { getMessages } from "@/lib/messages";
import type { EventType } from "@/lib/types";

type QuickLogCardProps = {
  eventTypes: EventType[];
  focusSportName: string;
  loadError?: string | null;
  onEventTypeClick?: (eventTypeId: string) => void;
};

export function QuickLogCard({
  eventTypes,
  focusSportName,
  loadError,
  onEventTypeClick,
}: QuickLogCardProps) {
  const locale = useAppLocale();
  const messages = getMessages(locale);
  const scopes = useMemo(
    () =>
      [
        { id: "sport" as const, label: focusSportName },
        { id: "general" as const, label: messages.common.general },
      ] satisfies { id: EventTypeScope; label: string }[],
    [focusSportName, messages.common.general],
  );
  const [scope, setScope] = useState<EventTypeScope>("sport");

  const visibleEventTypes = useMemo(
    () => filterEventTypesByScope(eventTypes, scope, locale),
    [eventTypes, locale, scope],
  );

  const emptyScopeLabel =
    scope === "sport" ? focusSportName.toLowerCase() : messages.common.general.toLowerCase();

  return (
    <section className="rounded-2xl bg-[#171b22] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-white">{messages.dashboard.quickLog}</h2>

        {!loadError ? (
          <div className="flex flex-wrap justify-end gap-2">
            {scopes.map((item) => {
              const active = scope === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setScope(item.id)}
                  className={
                    active
                      ? "rounded-full bg-[#b7d7ec] px-3.5 py-1.5 text-sm font-semibold text-[#1a2430]"
                      : "rounded-full border border-white/5 bg-[#252b34] px-3.5 py-1.5 text-sm font-medium text-zinc-300 transition hover:bg-[#2f3641] hover:text-zinc-100"
                  }
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {loadError ? (
        <p className="mt-4 text-sm text-red-300">{loadError}</p>
      ) : visibleEventTypes.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2.5">
          {visibleEventTypes.map((eventType) => (
            <button
              key={eventType.id}
              type="button"
              onClick={() => onEventTypeClick?.(eventType.id)}
              className="rounded-full border border-white/5 bg-[#1c222c] px-4 py-2 text-sm font-medium text-zinc-100 transition hover:bg-[#2a303a]"
            >
              {eventType.name}
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">
          {messages.dashboard.noEventTypesInScope(emptyScopeLabel)}
        </p>
      )}
    </section>
  );
}
