import { buildHockeyStatTiles } from "@/lib/hockey-stats/build-hockey-stat-tiles";
import { fetchHockeySportStats } from "@/lib/hockey-stats/fetch-sport-stats";
import { getHockeyStatsRange, type HockeyStatsPeriod } from "@/lib/hockey-stats/period";

import { HockeyStatsCard } from "./hockey-stats-card";

type HockeyStatsProps = {
  athleteId: string;
  sportId: string;
  period: HockeyStatsPeriod;
};

export async function HockeyStats({ athleteId, sportId, period }: HockeyStatsProps) {
  const { startedAtFrom, startedAtTo } = getHockeyStatsRange(period);
  const result = await fetchHockeySportStats(athleteId, sportId, startedAtFrom, startedAtTo);

  if (result.error || !result.sportStats) {
    return <HockeyStatsCard tiles={[]} loadError={result.error} />;
  }

  const tiles = buildHockeyStatTiles(result.sportStats);

  return <HockeyStatsCard tiles={tiles} />;
}
