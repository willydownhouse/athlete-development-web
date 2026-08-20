import { formatMetricUnit } from "@/lib/event-metric-form";
import { formatEventMetricValue } from "@/lib/event-metric-display";
import { isStrengthTrainingEventType } from "@/lib/event-item-form";
import type { Event, EventItem } from "@/lib/types";

function formatSetSummary(setItem: EventItem): string {
  const parts = setItem.metrics.map((metric) => {
    const value = formatEventMetricValue(metric);
    const unit = metric.unit ?? formatMetricUnit(metric.metricDefinition.canonicalUnit);
    return `${value}${unit ? ` ${unit}` : ""}`;
  });

  return parts.length > 0 ? parts.join(" · ") : "No set details";
}

type EventItemsDisplayProps = {
  event: Event;
};

export function EventItemsDisplay({ event }: EventItemsDisplayProps) {
  if (!isStrengthTrainingEventType(event.eventType)) {
    return null;
  }

  const exercises = event.items ?? [];

  if (exercises.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 border-t border-white/5 pt-4">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Exercises</p>
      <div className="mt-3 space-y-3">
        {exercises.map((exercise) => (
          <div key={exercise.id} className="rounded-xl bg-[#171b22] px-3 py-3">
            <p className="text-sm font-medium text-white">
              {exercise.label?.trim() || exercise.eventItemType.name}
            </p>
            {exercise.children.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {exercise.children.map((setItem, index) => (
                  <li
                    key={setItem.id}
                    className="flex flex-col gap-1 rounded-lg bg-[#12161d] px-3 py-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                  >
                    <span className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
                      Set {index + 1}
                    </span>
                    <span className="text-sm text-zinc-200 sm:text-right">
                      {formatSetSummary(setItem)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-zinc-500">No sets logged.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
