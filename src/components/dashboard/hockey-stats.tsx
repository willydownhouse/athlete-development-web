import { buildHockeyStatTiles } from "@/lib/hockey-stats/build-hockey-stat-tiles";
import { fetchHockeySportStats } from "@/lib/hockey-stats/fetch-sport-stats";
import type { TimeRange } from "@/lib/time-zone";

import { HockeyStatsCard } from "./hockey-stats-card";

type HockeyStatsProps = {
  athleteId: string;
  sportId: string;
  range: TimeRange;
};

export async function HockeyStats({ athleteId, sportId, range }: HockeyStatsProps) {
  const result = await fetchHockeySportStats(
    athleteId,
    sportId,
    range.startedAtFrom,
    range.startedAtTo,
  );

  if (result.error || !result.sportStats) {
    return <HockeyStatsCard tiles={[]} loadError={result.error} />;
  }

  const tiles = buildHockeyStatTiles(result.sportStats);

  return <HockeyStatsCard tiles={tiles} />;
}
