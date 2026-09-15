import { formatDurationSeconds } from "@/lib/event-metric-display";
import type { ActivitySummary, EventCategory } from "@/lib/types";
import { formatCategoryLabel } from "@/lib/types";

export type ActivitySummaryCard = {
  key: string;
  value: string;
  label: string;
  subtitle?: string;
};

export type ActivitySummaryCategoryRow = {
  key: EventCategory;
  label: string;
  eventCount: number;
  durationLabel: string;
};

function formatCategoryTitle(category: EventCategory): string {
  const label = formatCategoryLabel(category);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function durationCoverageLabel(
  eventsWithDuration: number,
  eventCount: number,
): string | undefined {
  if (eventCount <= 0 || eventsWithDuration >= eventCount) {
    return undefined;
  }

  return `Duration logged for ${eventsWithDuration} of ${eventCount} sessions`;
}

export function buildActivitySummaryCards(summary: ActivitySummary): ActivitySummaryCard[] {
  const coverage = durationCoverageLabel(summary.load.eventsWithDuration, summary.load.eventCount);
  const restSubtitle =
    summary.calendarDays > 0 ? `of ${summary.calendarDays} days in this period` : undefined;

  return [
    {
      key: "training-days",
      value: String(summary.trainingDays),
      label: "Training days",
    },
    {
      key: "rest-days",
      value: String(summary.restDays),
      label: "Rest days",
      subtitle: restSubtitle,
    },
    {
      key: "games",
      value: String(summary.games),
      label: "Games",
    },
    {
      key: "training-time",
      value: formatDurationSeconds(summary.load.durationSeconds),
      label: "Training time",
      subtitle: coverage,
    },
  ];
}

export function buildActivitySummaryCategoryRows(
  summary: ActivitySummary,
): ActivitySummaryCategoryRow[] {
  return summary.categories.map((category) => ({
    key: category.category,
    label: formatCategoryTitle(category.category),
    eventCount: category.eventCount,
    durationLabel:
      category.eventsWithDuration > 0
        ? formatDurationSeconds(category.durationSeconds)
        : "No duration",
  }));
}
