"use client";

import { useMemo, useState } from "react";

import { HOCKEY_SPORT_SLUG } from "@/lib/constants";
import type { EventType } from "@/lib/types";

type QuickLogScope = "general" | typeof HOCKEY_SPORT_SLUG;

type QuickLogCardProps = {
  eventTypes: EventType[];
  loadError?: string | null;
  onEventTypeClick?: (eventTypeId: string) => void;
};

const SCOPES: { id: QuickLogScope; label: string }[] = [
  { id: HOCKEY_SPORT_SLUG, label: "Hockey" },
  { id: "general", label: "General" },
];

function isHockeyEventType(eventType: EventType): boolean {
  const slug = eventType.sport?.slug.toLowerCase();
  const name = eventType.sport?.name.toLowerCase();
  return slug === HOCKEY_SPORT_SLUG || name === HOCKEY_SPORT_SLUG;
}

function isGeneralEventType(eventType: EventType): boolean {
  return eventType.sportId === null;
}

export function QuickLogCard({ eventTypes, loadError, onEventTypeClick }: QuickLogCardProps) {
  const [scope, setScope] = useState<QuickLogScope>(HOCKEY_SPORT_SLUG);

  const visibleEventTypes = useMemo(() => {
    return eventTypes
      .filter((eventType) =>
        scope === HOCKEY_SPORT_SLUG ? isHockeyEventType(eventType) : isGeneralEventType(eventType),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [eventTypes, scope]);

  return (
    <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-white">Quick log</h2>

        {!loadError ? (
          <div className="flex flex-wrap justify-end gap-2">
            {SCOPES.map((item) => {
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
          No {scope === HOCKEY_SPORT_SLUG ? HOCKEY_SPORT_SLUG : "general"} event types available
          yet.
        </p>
      )}
    </section>
  );
}
