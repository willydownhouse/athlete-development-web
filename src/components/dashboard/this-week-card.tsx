import { EVENT_TONE_BG_CLASS } from "@/lib/event-tone";
import { getLocalWeekRange } from "@/lib/date-range";
import type { Event } from "@/lib/types";
import { buildWeekDays, getWeekLoadLabel } from "@/lib/week-summary";

const toneClass = EVENT_TONE_BG_CLASS;
const WEEK_CHART_HEIGHT = 88;

type ThisWeekCardProps = {
  events: Event[];
  loading?: boolean;
  loadError?: string | null;
};

export function ThisWeekCard({ events, loading = false, loadError }: ThisWeekCardProps) {
  const { days: weekDays } = getLocalWeekRange();
  const weekDayBars = buildWeekDays(events, weekDays);
  const loadLabel = getWeekLoadLabel(events);
  const isEmpty = !loading && !loadError && events.length === 0;

  return (
    <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-white">This week</h2>
        <span className="text-sm text-zinc-400">
          {loading ? "Loading…" : loadError ? "Unable to load" : loadLabel}
        </span>
      </div>

      {loadError ? (
        <p className="mt-4 text-sm text-red-300">{loadError}</p>
      ) : loading ? (
        <p className="mt-4 text-sm text-zinc-500">Loading this week&apos;s events…</p>
      ) : isEmpty ? (
        <p className="mt-4 text-sm text-zinc-500">
          Weekly load will appear once events are logged.
        </p>
      ) : (
        <div className="mt-5 flex justify-between gap-1.5">
          {weekDayBars.map((day) => (
            <div key={day.day} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="relative w-full" style={{ height: `${WEEK_CHART_HEIGHT}px` }}>
                <div
                  className={`absolute inset-x-0 bottom-0 rounded-xl ${toneClass[day.tone]}`}
                  style={{ height: `${day.height}px` }}
                />
                <span className="absolute inset-x-0 bottom-2 text-center text-[10px] font-semibold tracking-wide text-white/90">
                  {day.label}
                </span>
              </div>
              <span className="text-xs text-zinc-400">{day.day}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
