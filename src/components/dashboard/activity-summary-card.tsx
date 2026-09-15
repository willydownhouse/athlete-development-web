import {
  buildActivitySummaryCards,
  buildActivitySummaryCategoryRows,
} from "@/lib/activity-summary/build-activity-summary-cards";
import type { ActivitySummary } from "@/lib/types";

type ActivitySummaryCardGridProps = {
  summary?: ActivitySummary | null;
  loadError?: string | null;
};

export function ActivitySummaryCardGrid({ summary, loadError }: ActivitySummaryCardGridProps) {
  if (loadError) {
    return <p className="text-sm text-red-300">{loadError}</p>;
  }

  if (!summary) {
    return <p className="text-sm text-zinc-400">No activity logged for this period.</p>;
  }

  const cards = buildActivitySummaryCards(summary);
  const categories = buildActivitySummaryCategoryRows(summary);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <div key={card.key} className="rounded-xl bg-white/5 px-3 py-3">
            <p className="text-2xl font-semibold tracking-tight text-white">{card.value}</p>
            <p className="mt-1 text-sm text-zinc-400">{card.label}</p>
            {card.subtitle ? <p className="mt-0.5 text-xs text-zinc-500">{card.subtitle}</p> : null}
          </div>
        ))}
      </div>

      {categories.length > 0 ? (
        <div>
          <h3 className="text-sm font-medium text-zinc-300">Activity mix</h3>
          <ul className="mt-2 divide-y divide-white/5">
            {categories.map((category) => (
              <li key={category.key} className="flex items-baseline justify-between gap-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm text-white">{category.label}</p>
                  <p className="text-xs text-zinc-500">
                    {category.eventCount} {category.eventCount === 1 ? "event" : "events"}
                  </p>
                </div>
                <p className="shrink-0 text-sm text-zinc-300">{category.durationLabel}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
