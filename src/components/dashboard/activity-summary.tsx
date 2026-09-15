import { loadActivitySummary } from "@/lib/activity-summary/fetch-activity-summary";
import type { TimeRange } from "@/lib/time-zone";

import { ActivitySummaryCardGrid } from "./activity-summary-card";

type ActivitySummaryProps = {
  athleteId: string;
  range: TimeRange;
  timeZone: string;
};

export async function ActivitySummary({ athleteId, range, timeZone }: ActivitySummaryProps) {
  const result = await loadActivitySummary(athleteId, {
    startedAtFrom: range.startedAtFrom,
    startedAtTo: range.startedAtTo,
    timeZone,
  });

  if (result.error || !result.summary) {
    return <ActivitySummaryCardGrid loadError={result.error} />;
  }

  return <ActivitySummaryCardGrid summary={result.summary} />;
}
