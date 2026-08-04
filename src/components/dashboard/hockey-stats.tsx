import { aggregateHockeyStats } from "@/lib/hockey-stats/aggregate";
import { fetchHockeyEventsInRange } from "@/lib/hockey-stats/fetch-events";

import { HockeyStatsCard } from "./hockey-stats-card";

type HockeyStatsProps = {
  athleteId: string;
  sportId: string;
  startedAtFrom: string;
  startedAtTo: string;
  periodLabel?: string;
};

export async function HockeyStats({
  athleteId,
  sportId,
  startedAtFrom,
  startedAtTo,
  periodLabel,
}: HockeyStatsProps) {
  const result = await fetchHockeyEventsInRange(athleteId, sportId, startedAtFrom, startedAtTo);

  if (result.error) {
    return <HockeyStatsCard stats={[]} loadError={result.error} periodLabel={periodLabel} />;
  }

  const stats = aggregateHockeyStats(result.events);

  if (stats.length === 0) {
    return null;
  }

  return <HockeyStatsCard stats={stats} periodLabel={periodLabel} />;
}
